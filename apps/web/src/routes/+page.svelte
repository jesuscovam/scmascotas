<script lang="ts">
	let { data } = $props();

	const speciesLabel: Record<string, string> = {
		dog: '🐶 Perro',
		cat: '🐱 Gato',
		other: '🐾 Otro'
	};

	const sizeLabel: Record<string, string> = {
		small: 'Pequeño',
		medium: 'Mediano',
		large: 'Grande'
	};

	function timeAgo(date: string | Date): string {
		const d = new Date(date);
		const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
		if (diff === 0) return 'Hoy';
		if (diff === 1) return 'Ayer';
		if (diff < 7) return `Hace ${diff} días`;
		if (diff < 30) return `Hace ${Math.floor(diff / 7)} semanas`;
		return `Hace ${Math.floor(diff / 30)} meses`;
	}

	const typeColor: Record<string, string> = {
		dog: 'border-amber-400',
		cat: 'border-teal-400',
		other: 'border-stone-400'
	};
</script>

<!-- Hero -->
<section class="bg-white border-b border-warm-200">
	<div class="max-w-5xl mx-auto px-4 py-16 flex flex-col items-center text-center gap-6">
		<div class="inline-flex items-center gap-2 bg-brand-50 text-brand-800 text-sm font-semibold px-3 py-1 rounded-full border border-brand-200">
			<span>San Cristóbal de las Casas, Chiapas</span>
		</div>
		<h1 class="font-display text-4xl sm:text-5xl font-bold text-warm-900 leading-tight max-w-2xl">
			¿Perdiste a tu<br />
			<span class="text-brand-800">mascota?</span>
		</h1>
		<p class="text-warm-500 text-lg max-w-md">
			Publica un reporte en segundos, sin necesidad de crear una cuenta. La comunidad de San Cristóbal puede ayudarte.
		</p>
		<a
			href="/reportar"
			class="bg-brand-800 hover:bg-brand-900 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all hover:scale-105 shadow-md hover:shadow-lg"
		>
			Reportar mascota perdida →
		</a>
	</div>
</section>

<!-- Listings -->
<section class="max-w-5xl mx-auto px-4 py-12">
	{#if data.pets.length === 0}
		<div class="text-center py-20 flex flex-col items-center gap-4">
			<span class="text-6xl">🐾</span>
			<p class="text-warm-500 text-lg font-medium">No hay reportes activos por ahora.</p>
			<a href="/reportar" class="text-brand-800 hover:underline font-semibold">
				¿Tienes una mascota perdida? Publícalo →
			</a>
		</div>
	{:else}
		<div class="flex items-baseline justify-between mb-6">
			<h2 class="font-display text-2xl font-semibold text-warm-900">
				Mascotas perdidas
			</h2>
			<span class="text-warm-500 text-sm">{data.pets.length} reportes activos</span>
		</div>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
			{#each data.pets as pet (pet.id)}
				<a
					href="/mascota/{pet.slug}"
					class="group bg-white rounded-2xl border border-warm-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col border-t-4 {typeColor[pet.type] ?? 'border-stone-300'}"
				>
					<div class="bg-warm-100 h-44 flex items-center justify-center text-5xl">
						{pet.type === 'dog' ? '🐶' : pet.type === 'cat' ? '🐱' : '🐾'}
					</div>

					<div class="p-4 flex flex-col gap-3 flex-1">
						<div class="flex items-start justify-between gap-2">
							<h3 class="font-display font-semibold text-warm-900 text-lg leading-tight group-hover:text-brand-800 transition-colors">
								{pet.name ?? 'Sin nombre'}
							</h3>
							<span class="shrink-0 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
								{speciesLabel[pet.type] ?? pet.type}
							</span>
						</div>

						<div class="flex flex-wrap gap-2 text-xs text-warm-500">
							{#if pet.color}
								<span class="bg-warm-100 px-2 py-0.5 rounded-full">{pet.color}</span>
							{/if}
							{#if pet.size}
								<span class="bg-warm-100 px-2 py-0.5 rounded-full">{sizeLabel[pet.size]}</span>
							{/if}
						</div>

						<div class="mt-auto pt-2 border-t border-warm-100 flex items-center justify-between text-xs text-warm-500">
							<span class="flex items-center gap-1">
								<svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clip-rule="evenodd" />
								</svg>
								{pet.colonia ?? 'Ubicación desconocida'}
							</span>
							<span>{timeAgo(pet.lastSeenAt)}</span>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</section>
