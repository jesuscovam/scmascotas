<script lang="ts">
	type Sighting = {
		id: string;
		description: string | null;
		colonia: string | null;
		createdAt: Date | string;
	};

	type Props = {
		sightings?: Sighting[];
		reportHref?: string;
	};

	let { sightings = [], reportHref }: Props = $props();

	function timeAgo(date: Date | string): string {
		const d = new Date(date);
		const diff = Math.floor((Date.now() - d.getTime()) / 86_400_000);
		if (diff === 0) return 'Hoy';
		if (diff === 1) return 'Ayer';
		if (diff < 7) return `Hace ${diff} días`;
		if (diff < 30) return `Hace ${Math.floor(diff / 7)} semanas`;
		return `Hace ${Math.floor(diff / 30)} meses`;
	}
</script>

<section class="flex flex-col gap-5">
	<!-- Section header -->
	<div class="flex items-center gap-3">
		<div
			class="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-sm"
		>
			👀
		</div>
		<h2 class="font-display font-semibold text-warm-900 dark:text-warm-50 text-lg">
			Avistamientos
		</h2>
		{#if sightings.length > 0}
			<span
				class="ml-auto text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2.5 py-0.5 rounded-full"
			>
				{sightings.length}
			</span>
		{/if}
	</div>

	<!-- Sightings feed -->
	{#if sightings.length === 0}
		<div class="flex flex-col items-center gap-4 py-8 text-center">
			<p class="text-sm text-warm-400 dark:text-warm-500 italic">
				Sin avistamientos aún. Sé el primero en reportar.
			</p>
			{#if reportHref}
				<a
					href={reportHref}
					class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm"
				>
					👀 Vi a esta mascota
				</a>
			{/if}
		</div>
	{:else}
		<div class="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
			{#each sightings as sighting (sighting.id)}
				<div
					class="bg-warm-50 dark:bg-warm-800/60 border-l-2 border-l-warm-200 dark:border-l-warm-600 rounded-r-xl pl-4 pr-4 py-3"
				>
					{#if sighting.description}
						<p class="text-sm text-warm-800 dark:text-warm-200 leading-relaxed">
							{sighting.description}
						</p>
					{:else}
						<p class="text-sm text-warm-400 dark:text-warm-500 italic">Sin descripción</p>
					{/if}

					<div class="flex items-center gap-2 mt-1.5 flex-wrap">
						{#if sighting.colonia}
							<span class="text-xs text-warm-500 dark:text-warm-400 flex items-center gap-1">
								<svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
									<path
										fill-rule="evenodd"
										d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
										clip-rule="evenodd"
									/>
								</svg>
								{sighting.colonia}
							</span>
							<span class="text-warm-300 dark:text-warm-600 text-xs">·</span>
						{/if}
						<span class="text-xs text-warm-400 dark:text-warm-500">{timeAgo(sighting.createdAt)}</span>
					</div>
				</div>
			{/each}
		</div>

	{/if}
</section>
