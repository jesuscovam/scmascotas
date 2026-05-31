<script lang="ts">
  import { RadioGroup, RadioGroupItem } from './ui/radio-group/index.js';

  type Level = 'off' | 'matches' | 'colonia';

  type Props = {
    value: Level;
    saving?: boolean;
    onChange?: (level: Level) => void;
  };

  let { value, saving = false, onChange }: Props = $props();

  const options: { value: Level; emoji: string; title: string; desc: string; recommended?: boolean }[] = [
    {
      value: 'matches',
      emoji: '🔍',
      title: 'Solo coincidencias',
      desc: 'Te avisamos cuando un avistamiento podría ser tu mascota.',
      recommended: true,
    },
    {
      value: 'colonia',
      emoji: '📍',
      title: 'Toda mi colonia',
      desc: 'Te avisamos de cada avistamiento de la misma especie reportado en tu colonia.',
    },
    {
      value: 'off',
      emoji: '🔕',
      title: 'Desactivar',
      desc: 'No recibir notificaciones de esta mascota.',
    },
  ];

  function handle(v: string) {
    onChange?.(v as Level);
  }
</script>

<RadioGroup {value} onValueChange={handle} disabled={saving} class="grid gap-2 {saving ? 'opacity-60 pointer-events-none' : ''}">
  {#each options as opt (opt.value)}
    {@const selected = value === opt.value}
    <label
      for="notify-{opt.value}"
      class="flex items-start gap-3 rounded-2xl border px-4 py-3 cursor-pointer transition-colors {selected
        ? 'border-amber-300 dark:border-amber-600 bg-amber-50/60 dark:bg-amber-900/15'
        : 'border-warm-200 dark:border-warm-700 hover:bg-warm-50 dark:hover:bg-warm-700/30'}"
    >
      <RadioGroupItem id="notify-{opt.value}" value={opt.value} class="mt-0.5 shrink-0" />
      <span class="shrink-0 text-base leading-none mt-0.5">{opt.emoji}</span>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="font-semibold text-sm {selected ? 'text-amber-900 dark:text-amber-200' : 'text-warm-900 dark:text-warm-50'}">
            {opt.title}
          </span>
          {#if opt.recommended}
            <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
              Recomendado
            </span>
          {/if}
        </div>
        <p class="text-xs text-warm-500 dark:text-warm-400 mt-0.5 leading-relaxed">{opt.desc}</p>
      </div>
    </label>
  {/each}
</RadioGroup>
