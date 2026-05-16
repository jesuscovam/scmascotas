<script lang="ts">
	import { page } from '$app/state';
	let { data } = $props();
	const isProduction = $derived(page.data.isProduction as boolean);

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

	const PREVIEW_LIMIT = 5;
	const preview = $derived(data.pets.slice(0, PREVIEW_LIMIT));
	const hasMore = $derived(data.pets.length > PREVIEW_LIMIT);
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
		{#if !isProduction}
			<a
				href="/reportar"
				class="bg-brand-800 hover:bg-brand-900 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all hover:scale-105 shadow-md hover:shadow-lg"
			>
				Reportar mascota perdida →
			</a>
		{:else}
			<div class="flex flex-col items-center gap-2">
				<span class="text-warm-400 font-semibold text-lg border-2 border-dashed border-warm-200 px-8 py-4 rounded-2xl cursor-default">
					Reportes disponibles pronto
				</span>
				<p class="text-xs text-warm-400">Estamos preparando la app — mientras tanto, explora los reportes</p>
			</div>
		{/if}
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
			{#each preview as pet (pet.id)}
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

			{#if hasMore}
				<a
					href="/mascotas"
					class="group bg-warm-50 hover:bg-brand-50 rounded-2xl border-2 border-dashed border-warm-200 hover:border-brand-300 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col items-center justify-center gap-3 min-h-[280px]"
				>
					<span class="text-4xl">🐾</span>
					<div class="text-center px-4">
						<p class="font-display font-semibold text-warm-700 group-hover:text-brand-800 transition-colors">
							Ver todos los reportes
						</p>
						<p class="text-xs text-warm-400 mt-1">
							{data.pets.length - PREVIEW_LIMIT} más sin mostrar
						</p>
					</div>
					<span class="text-xs font-bold text-brand-700 group-hover:underline">
						Ver galería completa →
					</span>
				</a>
			{/if}
		</div>
	{/if}
</section>

<!-- Tablero comunitario -->
<section
	class="relative overflow-hidden border-y border-amber-800/20 py-12"
	style="background-color:#b5763a; background-image:radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px), radial-gradient(circle at 10px 10px, rgba(255,255,255,0.04) 1px, transparent 1px); background-size:18px 18px, 18px 18px;"
>
	<!-- Vignette overlay -->
	<div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20"></div>

	<div class="relative max-w-5xl mx-auto px-4">
		<p class="text-center text-[11px] font-bold text-amber-200/70 uppercase tracking-[0.2em] mb-10">
			Tablero del proyecto
		</p>

		<div class="flex flex-col sm:flex-row justify-center gap-12 items-start">

			<!-- Cambios -->
			<a
				href="/cambios"
				class="group relative w-full max-w-[250px] mx-auto pt-8 pb-6 px-6
					bg-[#fffef0] shadow-[4px_8px_28px_rgba(0,0,0,0.35)]
					[transform:rotate(-2.5deg)] hover:[transform:rotate(0deg)_translateY(-6px)]
					transition-all duration-300 ease-out"
			>
				<!-- Pin -->
				<div class="absolute -top-[18px] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
					<div class="w-7 h-7 rounded-full bg-brand-800 border-[3px] border-brand-900 shadow-[0_3px_8px_rgba(0,0,0,0.4)] flex items-center justify-center">
						<div class="w-2 h-2 rounded-full bg-amber-200 opacity-80"></div>
					</div>
					<div class="w-px h-3 bg-brand-900/40"></div>
				</div>

				<!-- Ruled lines decoration -->
				<div class="absolute inset-x-0 top-14 bottom-0 overflow-hidden opacity-[0.06] pointer-events-none">
					{#each Array(8) as _, i (i)}
						<div class="w-full border-b border-blue-900" style="margin-top: {i === 0 ? 24 : 0}px; height: 24px;"></div>
					{/each}
				</div>

				<div class="relative">
					<div class="text-2xl mb-3">📋</div>
					<h3 class="font-display font-bold text-warm-900 text-[17px] leading-tight mb-2">
						Historial de cambios
					</h3>
					<p class="text-xs text-warm-500 leading-relaxed">
						Ve qué hay de nuevo en cada versión
					</p>
					<div class="mt-5 text-[11px] font-bold text-brand-800 tracking-wide group-hover:underline">
						Ver historial →
					</div>
				</div>
			</a>

			<!-- Plan de ruta -->
			<a
				href="/plan"
				class="group relative w-full max-w-[250px] mx-auto pt-8 pb-6 px-6
					bg-[#f4fef6] shadow-[4px_8px_28px_rgba(0,0,0,0.35)]
					[transform:rotate(2deg)] hover:[transform:rotate(0deg)_translateY(-6px)]
					transition-all duration-300 ease-out"
			>
				<!-- Pin -->
				<div class="absolute -top-[18px] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
					<div class="w-7 h-7 rounded-full bg-teal-700 border-[3px] border-teal-800 shadow-[0_3px_8px_rgba(0,0,0,0.4)] flex items-center justify-center">
						<div class="w-2 h-2 rounded-full bg-teal-200 opacity-80"></div>
					</div>
					<div class="w-px h-3 bg-teal-900/40"></div>
				</div>

				<!-- Ruled lines decoration -->
				<div class="absolute inset-x-0 top-14 bottom-0 overflow-hidden opacity-[0.06] pointer-events-none">
					{#each Array(8) as _, i (i)}
						<div class="w-full border-b border-blue-900" style="margin-top: {i === 0 ? 24 : 0}px; height: 24px;"></div>
					{/each}
				</div>

				<div class="relative">
					<div class="text-2xl mb-3">🗺️</div>
					<h3 class="font-display font-bold text-warm-900 text-[17px] leading-tight mb-2">
						Plan de ruta
					</h3>
					<p class="text-xs text-warm-500 leading-relaxed">
						Conoce lo que viene en los próximos cambios
					</p>
					<div class="mt-5 text-[11px] font-bold text-teal-700 tracking-wide group-hover:underline">
						Ver plan →
					</div>
				</div>
			</a>

		</div>
	</div>
</section>
