import { db, matchResults, spottedPets, pets, petPhotos, colonias } from '@scmascotas/db';
import { eq, desc, and, sql } from 'drizzle-orm';
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

    // Return cache unless all rows pre-date visual scoring (visual_score IS NULL means
    // the row was computed before Sprint 5 embeddings were tracked — recompute once).
    if (existing.length > 0 && existing.some(r => r.visualScore !== null)) return existing;

    // First visit (or stale pre-embedding cache) — run scoring and persist
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

  if (topMatches.length === 0) return;

  await db
    .insert(matchResults)
    .values(topMatches.map(({ pet, score, visualScore }) => ({
      spottedPetId: spotted.id,
      petId:        pet.id,
      score,
      visualScore,
    })))
    .onConflictDoUpdate({
      target: [matchResults.spottedPetId, matchResults.petId],
      set: {
        score:       sql`excluded.score`,
        visualScore: sql`excluded.visual_score`,
        updatedAt:   sql`now()`,
      },
    });
}
