<script lang="ts">
	type Species = 'dog' | 'cat' | 'other';

	type Props = {
		value?: Species | '';
		onSelect: (species: Species) => void;
	};

	let { value = '', onSelect }: Props = $props();

	const OPTIONS = [
		['dog',   '🐶', 'Perro'],
		['cat',   '🐱', 'Gato'],
		['other', '🐾', 'Otro'],
	] as const;
</script>

<div class="bg-white dark:bg-warm-800 rounded-3xl border border-warm-200 dark:border-warm-700 shadow-sm p-6">
	<div class="flex items-center gap-3 pb-4 border-b border-warm-100 dark:border-warm-700 mb-5">
		<div class="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style="background: linear-gradient(135deg,#FEF3C7,#FDE68A);">🐾</div>
		<div>
			<h2 class="font-display font-semibold text-warm-900 dark:text-warm-50 text-lg">¿Qué tipo de mascota es?</h2>
			<p class="text-xs text-warm-400 dark:text-warm-500">Selecciona para continuar</p>
		</div>
	</div>
	<div class="grid grid-cols-3 gap-3">
		{#each OPTIONS as [species, emoji, label]}
			<button
				type="button"
				onclick={() => onSelect(species)}
				class="relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 {value === species
					? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 shadow-md'
					: 'border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-900/30 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50/50 dark:hover:bg-amber-900/10'}"
			>
				{#if value === species}
					<div class="absolute top-2.5 right-2.5 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
						<svg class="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
						</svg>
					</div>
				{/if}
				<span class="text-4xl leading-none">{emoji}</span>
				<span class="text-sm font-bold text-warm-800 dark:text-warm-100">{label}</span>
			</button>
		{/each}
	</div>
</div>
