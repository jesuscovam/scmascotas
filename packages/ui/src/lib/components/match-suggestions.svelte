<script lang="ts">
  type MatchResult = {
    id: string;
    score: number;
    petSlug: string;
    petName: string | null;
    petType: 'dog' | 'cat' | 'other';
    petColor: string | null;
    petSize: string | null;
    petColoniaId: string | null;
    petColonia: string | null;
    petContactWhatsapp: string | null;
    petLastSeenAt: string | Date;
    petPhotoUrl: string | null;
    humanVerdict: string | null;
  };

  type Props = {
    matches: MatchResult[];
    /** The spotted pet's attributes — used to compute which signal pills light up */
    coloniaId?: string | null;
    color?: string | null;
    size?: string | null;
  };

  let { matches, coloniaId, color, size }: Props = $props();

  const typeEmoji: Record<string, string> = { dog: '🐶', cat: '🐱', other: '🐾' };
  const sizeLabel: Record<string, string> = { small: 'Pequeño', medium: 'Mediano', large: 'Grande' };

  // Mirror of color-normalize.ts — kept in sync manually.
  // @scmascotas/ui cannot import @scmascotas/services, so we duplicate the group map.
  const COLOR_GROUPS: string[][] = [
    ['negro', 'negra', 'oscuro', 'oscura', 'prieto'],
    ['blanco', 'blanca', 'claro', 'clara'],
    ['cafe', 'marron', 'castano', 'castana', 'chocolate', 'canela', 'miel', 'tierra', 'pardo', 'parda'],
    ['gris', 'grisaceo', 'plata', 'plateado', 'cenizo'],
    ['naranja', 'anaranjado'],
    ['amarillo', 'amarilla', 'dorado', 'dorada', 'rubio', 'rubia', 'crema', 'beige'],
    ['rojo', 'roja', 'rojizo', 'bermejo'],
    ['manchas', 'manchado', 'manchada', 'moteado'],
    ['rayas', 'rayado', 'rayada', 'tigre', 'atigrado', 'tabby'],
    ['tricolor', 'bicolor'],
  ];
  const WORD_TO_GROUP = new Map<string, number>(
    COLOR_GROUPS.flatMap((g, i) => g.map(w => [w, i] as [string, number]))
  );
  function stripAccents(text: string): string {
    return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }
  function colorGroupsFor(text: string | null | undefined): Set<number> {
    if (!text) return new Set();
    const groups = new Set<number>();
    for (const word of stripAccents(text).split(/[\s,/]+/)) {
      const g = WORD_TO_GROUP.get(word);
      if (g !== undefined) groups.add(g);
    }
    return groups;
  }
  function colorsMatch(a: string | null | undefined, b: string | null | undefined): boolean {
    const ga = colorGroupsFor(a);
    if (ga.size === 0) return false;
    const gb = colorGroupsFor(b);
    for (const g of ga) if (gb.has(g)) return true;
    return false;
  }

  function waLink(whatsapp: string, petName: string | null): string {
    const num = whatsapp.replace(/\D/g, '');
    const msg = `Hola, creo que vi a ${petName ?? 'tu mascota'} — te escribo desde SC Mascotas.`;
    return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  }

  function timeAgo(date: string | Date): string {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    if (diff < 7) return `Hace ${diff} días`;
    if (diff < 30) return `Hace ${Math.floor(diff / 7)} sem.`;
    return `Hace ${Math.floor(diff / 30)} meses`;
  }
</script>

{#if matches.length > 0}
  <div class="bg-white dark:bg-warm-800 rounded-3xl border border-warm-200 dark:border-warm-700 shadow-sm overflow-hidden">

    <!-- Amber gradient header -->
    <div class="relative px-5 pt-5 pb-4 border-b border-amber-100 dark:border-warm-700 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-amber-50 via-amber-50/40 to-transparent dark:from-amber-900/10 dark:via-transparent dark:to-transparent pointer-events-none"></div>
      <div class="relative flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-amber-400/20 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-700 flex items-center justify-center text-xl shrink-0">
          🔍
        </div>
        <div>
          <h2 class="font-display font-bold text-warm-900 dark:text-warm-50 text-base leading-snug">
            ¿Podría ser una de estas?
          </h2>
          <p class="text-xs text-amber-700/70 dark:text-amber-400/70 mt-px">
            {matches.length} mascota{matches.length !== 1 ? 's' : ''} perdida{matches.length !== 1 ? 's' : ''} con perfil similar
          </p>
        </div>
      </div>
    </div>

    <!-- Match cards -->
    <div class="flex flex-col divide-y divide-warm-100 dark:divide-warm-700/60">
      {#each matches as match, i (match.id)}
        {@const sameColonia = !!coloniaId && coloniaId === match.petColoniaId}
        {@const sameColor = colorsMatch(color, match.petColor)}
        {@const sameSize = !!size && size === match.petSize}

        <div
          class="reveal group flex items-center gap-3.5 px-4 py-3.5 hover:bg-amber-50/40 dark:hover:bg-amber-900/5 transition-colors"
          style="animation-delay: {i * 80}ms"
        >
          <!-- Thumbnail -->
          <a
            href="/mascota/{match.petSlug}"
            class="shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-amber-50 dark:bg-warm-700 flex items-center justify-center text-2xl hover:opacity-90 transition-opacity border border-warm-100 dark:border-warm-600"
          >
            {#if match.petPhotoUrl}
              <img
                src={match.petPhotoUrl}
                alt={match.petName ?? 'Mascota'}
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            {:else}
              <span>{typeEmoji[match.petType] ?? '🐾'}</span>
            {/if}
          </a>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <!-- Name row -->
            <div class="flex items-baseline gap-1.5 mb-1.5">
              <a
                href="/mascota/{match.petSlug}"
                class="font-semibold text-warm-900 dark:text-warm-50 text-sm truncate hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
              >
                {match.petName ?? `${typeEmoji[match.petType]} Sin nombre`}
              </a>
              <span class="shrink-0 text-[10px] text-warm-400 dark:text-warm-500">{timeAgo(match.petLastSeenAt)}</span>
            </div>

            <!-- Signal pills -->
            <div class="flex flex-wrap gap-1 mb-2">
              <span class="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full {sameColonia ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium' : 'bg-warm-100 dark:bg-warm-700 text-warm-400 dark:text-warm-500'}">
                📍 {sameColonia ? 'Misma colonia' : (match.petColonia ?? 'Otra colonia')}
              </span>
              {#if match.petColor}
                <span class="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full {sameColor ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium' : 'bg-warm-100 dark:bg-warm-700 text-warm-400 dark:text-warm-500'}">
                  🎨 {match.petColor}
                </span>
              {/if}
              {#if match.petSize}
                <span class="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full {sameSize ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium' : 'bg-warm-100 dark:bg-warm-700 text-warm-400 dark:text-warm-500'}">
                  {sizeLabel[match.petSize] ?? match.petSize}
                </span>
              {/if}
            </div>

            <!-- CTA -->
            {#if match.petContactWhatsapp}
              <a
                href={waLink(match.petContactWhatsapp, match.petName)}
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
              >
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Contactar dueño
              </a>
            {:else}
              <a href="/mascota/{match.petSlug}" class="text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 transition-colors">
                Ver reporte →
              </a>
            {/if}
          </div>

          <!-- SVG score ring (right side)
               r=15.9 → circumference ≈ 100, so stroke-dasharray maps score 0–100 directly -->
          <div class="shrink-0 relative w-11 h-11">
            <svg viewBox="0 0 36 36" class="w-11 h-11 -rotate-90" aria-hidden="true">
              <!-- Track -->
              <circle
                cx="18" cy="18" r="15.9"
                fill="none"
                class="text-warm-100 dark:text-warm-700"
                stroke="currentColor"
                stroke-width="3.2"
              />
              <!-- Score arc -->
              <circle
                cx="18" cy="18" r="15.9"
                fill="none"
                class="{match.score >= 60 ? 'text-amber-400' : 'text-warm-300 dark:text-warm-500'} transition-all duration-700"
                stroke="currentColor"
                stroke-width="3.2"
                stroke-linecap="round"
                stroke-dasharray="{match.score} {100 - match.score}"
              />
            </svg>
            <!-- Score number centred inside ring -->
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-[10px] font-bold {match.score >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-warm-400 dark:text-warm-500'} leading-none tabular-nums">
                {match.score}
              </span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}
