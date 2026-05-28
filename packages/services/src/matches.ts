import { db, matchResults, spottedPets, pets, petPhotos, colonias } from '@scmascotas/db';
import { eq, desc, and } from 'drizzle-orm';
import { PetsService } from './pets.js';
import { scoreMatch } from './matching/score.js';

const MATCH_THRESHOLD = 30;
const MAX_RESULTS = 5;

export const MatchesService = {
  /** Lazy-compute: returns cached results or runs matching first. */
  async getMatchesFor(spottedPetId: string) {
    const existing = await db
      .select({
        id:                 matchResults.id,
        score:              matchResults.score,
        visualScore:        matchResults.visualScore,
        humanVerdict:       matchResults.humanVerdict,
        petId:              pets.id,
        petSlug:            pets.slug,
        petName:            pets.name,
        petType:            pets.type,
        petColor:           pets.color,
        petSize:            pets.size,
        petColoniaId:       pets.coloniaId,
        petColonia:         colonias.name,
        petContactWhatsapp: pets.contactWhatsapp,
        petLastSeenAt:      pets.lastSeenAt,
        petPhotoUrl:        petPhotos.url,
      })
      .from(matchResults)
      .innerJoin(pets, eq(matchResults.petId, pets.id))
      .leftJoin(colonias, eq(pets.coloniaId, colonias.id))
      .leftJoin(petPhotos, and(eq(petPhotos.petId, pets.id), eq(petPhotos.isPrimary, true)))
      .where(eq(matchResults.spottedPetId, spottedPetId))
      .orderBy(desc(matchResults.score));

    // Return cache when it's on the current (v0.10) scoring scale. Recompute when:
    //   - any row has score > 100        → pre-v0.10 (old 0–120 scale)
    //   - any row has visualScore in     → pre-v0.10 (old tiers used {5,15,20};
    //     {5, 15, 20}                       new tiers use {0,10,25,45,60})
    //   - all rows have visualScore=NULL → pre-v0.9 (Sprint 5 didn't track visual)
    // Any of those → recompute once and overwrite.
    const STALE_VISUAL = new Set([5, 15, 20]);
    const cacheIsFresh =
      existing.length > 0 &&
      existing.every(r => r.score <= 100) &&
      existing.every(r => r.visualScore === null || !STALE_VISUAL.has(r.visualScore)) &&
      existing.some(r => r.visualScore !== null);
    if (cacheIsFresh) return existing;

    // First visit, or stale cache from a previous scoring version — recompute and persist
    await _computeAndSave(spottedPetId);

    return db
      .select({
        id:                 matchResults.id,
        score:              matchResults.score,
        visualScore:        matchResults.visualScore,
        humanVerdict:       matchResults.humanVerdict,
        petId:              pets.id,
        petSlug:            pets.slug,
        petName:            pets.name,
        petType:            pets.type,
        petColor:           pets.color,
        petSize:            pets.size,
        petColoniaId:       pets.coloniaId,
        petColonia:         colonias.name,
        petContactWhatsapp: pets.contactWhatsapp,
        petLastSeenAt:      pets.lastSeenAt,
        petPhotoUrl:        petPhotos.url,
      })
      .from(matchResults)
      .innerJoin(pets, eq(matchResults.petId, pets.id))
      .leftJoin(colonias, eq(pets.coloniaId, colonias.id))
      .leftJoin(petPhotos, and(eq(petPhotos.petId, pets.id), eq(petPhotos.isPrimary, true)))
      .where(eq(matchResults.spottedPetId, spottedPetId))
      .orderBy(desc(matchResults.score));
  },

  async recordVerdict(matchId: string, verdict: 'match' | 'no_match') {
    const [updated] = await db
      .update(matchResults)
      .set({ humanVerdict: verdict, updatedAt: new Date() })
      .where(eq(matchResults.id, matchId))
      .returning({ id: matchResults.id });
    return updated ?? null;
  },
};

async function _computeAndSave(spottedPetId: string) {
  const [spotted] = await db
    .select({
      id:        spottedPets.id,
      type:      spottedPets.type,
      coloniaId: spottedPets.coloniaId,
      color:     spottedPets.color,
      size:      spottedPets.size,
      createdAt: spottedPets.createdAt,
      embedding: spottedPets.embedding,  // Sprint 5+
    })
    .from(spottedPets)
    .where(eq(spottedPets.id, spottedPetId))
    .limit(1);

  if (!spotted) return;

  // Fetch candidates — same type, with primary photo and embedding (PetsService already does the join)
  const candidates = await PetsService.listActiveForMatching({ type: spotted.type });

  const topMatches = candidates
    .map(pet => {
      const breakdown = scoreMatch(
        { ...spotted, embedding: spotted.embedding },
        { ...pet,     embedding: pet.embedding },
      );
      return { pet, score: breakdown.total, visualScore: breakdown.visual };
    })
    .filter(({ score }) => score >= MATCH_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS);

  // Clear stale rows for this sighting so candidates that no longer cross threshold
  // (or that scored higher on the old 0–120 scale) get removed, not just overwritten.
  // human_verdict on the deleted rows is lost — acceptable for a one-time rescore.
  await db.delete(matchResults).where(eq(matchResults.spottedPetId, spotted.id));

  if (topMatches.length === 0) return;

  await db.insert(matchResults).values(topMatches.map(({ pet, score, visualScore }) => ({
    spottedPetId: spotted.id,
    petId:        pet.id,
    score,
    visualScore,
  })));
}
