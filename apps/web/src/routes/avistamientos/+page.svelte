<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let filterType = $state(data.filterType);
	let filterColonia = $state(data.filterColonia);

	const hasFilters = $derived(filterType !== '' || filterColonia !== '');

	const typeEmoji: Record<string, string> = { dog: '🐶', cat: '🐱', other: '🐾' };
	const typeLabel: Record<string, string> = { dog: 'Perro', cat: 'Gato', other: 'Otro' };
	const sizeLabel: Record<string, string> = { small: 'Pequeño', medium: 'Mediano', large: 'Grande' };

	function applyFilters() {
		const params = new URLSearchParams();
		if (filterType) params.set('tipo', filterType);
		if (filterColonia) params.set('colonia', filterColonia);
		goto(`/avistamientos${params.size ? '?' + params : ''}`, { replaceState: true, noScroll: true });
	}

	function clearFilters() {
		filterType = '';
		filterColonia = '';
		goto('/avistamientos', { replaceState: true, noScroll: true });
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

<svelte:head>
	<title>Avistamientos recientes — SC Mascotas</title>
	<meta name="description" content="Mascotas perdidas avistadas por la comunidad en San Cristóbal de las Casas." />
</svelte:head>

<style>
	@keyframes fade-up {
		from { opacity: 0; transform: translateY(12px); }
		to   { opacity: 1; transform: translateY(0); }
	}
	.card-appear {
		animation: fade-up 0.36s ease both;
	}
</style>

<div
	class="min-h-screen bg-[#f4faf9] dark:bg-warm-900"
	style="background-image: radial-gradient(circle, rgba(20,184,166,0.07) 1px, transparent 1px); background-size: 20px 20px;"
>
	<div class="max-w-7xl mx-auto px-4 py-10 pb-20">

		<!-- Back nav -->
		<a href="/" class="inline-flex items-center gap-1.5 text-sm text-warm-500 dark:text-warm-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors font-medium group mb-8">
			<svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd" />
			</svg>
			Inicio
		</a>

		<!-- Page header -->
		<div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
			<div>
				<div class="flex items-center gap-3 mb-1">
					<span class="text-3xl">👀</span>
					<h1 class="font-display text-3xl sm:text-4xl font-bold text-warm-900 dark:text-warm-50 leading-tight">
						Avistamientos
					</h1>
					<span class="shrink-0 text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/40 border border-teal-300 dark:border-teal-700 px-2.5 py-1 rounded-full">
						{data.sightings.length} reportes
					</span>
				</div>
				<p class="text-warm-500 dark:text-warm-400 text-sm">
					Mascotas perdidas vistas por la comunidad en San Cristóbal
				</p>
			</div>
			<a
				href="/reportar/vi"
				class="shrink-0 inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-5 py-2.5 rounded-2xl transition-all active:scale-95 shadow-sm"
			>
				+ Reportar avistamiento
			</a>
		</div>

		<!-- Filters -->
		<div class="flex flex-wrap items-end gap-3 mb-8 bg-white dark:bg-warm-800/70 rounded-2xl px-4 py-3 border border-warm-200 dark:border-warm-700 shadow-sm">
			<div class="flex flex-col gap-1 min-w-[140px]">
				<label class="text-xs font-bold text-warm-500 dark:text-warm-400 uppercase tracking-wider">Especie</label>
				<select
					bind:value={filterType}
					onchange={applyFilters}
					class="rounded-xl border border-warm-200 dark:border-warm-600 bg-warm-50 dark:bg-warm-700 text-warm-800 dark:text-warm-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/70 transition-all"
				>
					<option value="">Todas</option>
					<option value="dog">🐶 Perros</option>
					<option value="cat">🐱 Gatos</option>
					<option value="other">🐾 Otros</option>
				</select>
			</div>

			<div class="flex flex-col gap-1 min-w-[200px] flex-1">
				<label class="text-xs font-bold text-warm-500 dark:text-warm-400 uppercase tracking-wider">Colonia</label>
				<select
					bind:value={filterColonia}
					onchange={applyFilters}
					class="w-full rounded-xl border border-warm-200 dark:border-warm-600 bg-warm-50 dark:bg-warm-700 text-warm-800 dark:text-warm-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/70 transition-all"
				>
					<option value="">Todas las colonias</option>
					{#each data.colonias as col (col.id)}
						<option value={col.id}>{col.name}</option>
					{/each}
				</select>
			</div>

			{#if hasFilters}
				<button
					onclick={clearFilters}
					class="self-end text-xs text-warm-500 dark:text-warm-400 hover:text-warm-800 dark:hover:text-warm-200 transition-colors underline underline-offset-2 pb-2"
				>
					Limpiar filtros
				</button>
			{/if}
		</div>

		{#if data.sightings.length === 0}
			<!-- Empty state -->
			<div class="flex flex-col items-center gap-5 py-24 text-center">
				<span class="text-7xl">👀</span>
				<div>
					<p class="font-display text-xl font-semibold text-warm-700 dark:text-warm-200 mb-1">
						{hasFilters ? 'Sin resultados para estos filtros' : 'Aún no hay avistamientos'}
					</p>
					<p class="text-warm-500 dark:text-warm-400 text-sm">
						{hasFilters ? 'Prueba con otros criterios.' : '¿Viste una mascota perdida? Sé el primero en reportarla.'}
					</p>
				</div>
				{#if hasFilters}
					<button onclick={clearFilters} class="text-sm font-semibold text-teal-700 dark:text-teal-400 hover:underline">
						Ver todos los avistamientos
					</button>
				{:else}
					<a href="/reportar/vi" class="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-5 py-2.5 rounded-2xl transition-all">
						Reportar avistamiento
					</a>
				{/if}
			</div>
		{:else}
			<!-- Card grid -->
			<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
				{#each data.sightings as s, i (s.id)}
					<div
						class="card-appear bg-white dark:bg-warm-800 rounded-2xl border border-warm-200 dark:border-warm-700 border-l-4 border-l-teal-400 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all overflow-hidden flex flex-col"
						style="animation-delay: {i * 30}ms"
					>
						<!-- Photo / placeholder -->
						{#if s.photoUrl}
							<div class="h-36 overflow-hidden shrink-0 relative">
								<img
									src={s.photoUrl}
									alt="Avistamiento"
									class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
								/>
								<span class="absolute top-2 left-2 text-[11px] font-bold text-teal-800 dark:text-teal-200 bg-teal-100/90 dark:bg-teal-900/80 backdrop-blur-sm border border-teal-200 dark:border-teal-700 px-1.5 py-px rounded-full">
									{typeEmoji[s.type]} {typeLabel[s.type] ?? s.type}
								</span>
							</div>
						{:else}
							<div class="h-24 bg-gradient-to-b from-teal-50 to-teal-100/50 dark:from-teal-900/30 dark:to-warm-800 flex items-center justify-center shrink-0 relative">
								<div class="w-12 h-12 rounded-full bg-white/80 dark:bg-warm-600/60 shadow-sm flex items-center justify-center text-2xl">
									{typeEmoji[s.type] ?? '🐾'}
								</div>
								<span class="absolute top-2 left-2 text-[11px] font-bold text-teal-800 dark:text-teal-200 bg-teal-100/90 dark:bg-teal-900/50 border border-teal-200 dark:border-teal-700 px-1.5 py-px rounded-full">
									{typeLabel[s.type] ?? s.type}
								</span>
							</div>
						{/if}

						<!-- Content -->
						<div class="p-3 flex flex-col gap-2 flex-1">
							{#if s.description}
								<p class="text-[11px] text-warm-600 dark:text-warm-300 leading-relaxed line-clamp-3">
									{s.description}
								</p>
							{:else}
								<p class="text-[11px] text-warm-400 dark:text-warm-500 italic">Sin descripción.</p>
							{/if}

							{#if s.color || s.size}
								<div class="flex flex-wrap gap-1 text-[11px] text-warm-500 dark:text-warm-400">
									{#if s.color}
										<span class="bg-warm-100 dark:bg-warm-700 px-1.5 py-px rounded-full">{s.color}</span>
									{/if}
									{#if s.size}
										<span class="bg-warm-100 dark:bg-warm-700 px-1.5 py-px rounded-full">{sizeLabel[s.size]}</span>
									{/if}
								</div>
							{/if}

							<!-- Footer -->
							<div class="mt-auto pt-2 border-t border-warm-100 dark:border-warm-700 flex items-center justify-between text-[11px] text-warm-400 dark:text-warm-500">
								<span class="flex items-center gap-0.5 truncate">
									<svg class="w-2.5 h-2.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
										<path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clip-rule="evenodd" />
									</svg>
									<span class="truncate">{s.colonia ?? 'Desconocida'}</span>
								</span>
								<span class="shrink-0 ml-1">{timeAgo(s.createdAt)}</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Cross-link -->
		<div class="mt-16 border-t border-warm-200 dark:border-warm-700 pt-8 text-center">
			<p class="text-sm text-warm-500 dark:text-warm-400 mb-3">
				¿Perdiste una mascota? Publica un reporte para que la comunidad te ayude.
			</p>
			<a
				href="/mascotas"
				class="inline-flex items-center gap-2 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 font-semibold text-sm px-5 py-2.5 rounded-2xl transition-colors"
			>
				🐾 Ver mascotas perdidas →
			</a>
		</div>

	</div>
</div>
