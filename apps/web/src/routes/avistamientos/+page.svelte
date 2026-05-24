<script lang="ts">
	import { goto } from '$app/navigation';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { Select } from '@scmascotas/ui';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let filterType = $state(data.filterType);
	let filterColonia = $state(data.filterColonia);

	const hasFilters = $derived(filterType !== '' || filterColonia !== '');

	const selectedTypeName = $derived(
		filterType === 'dog' ? '🐶 Perros' :
		filterType === 'cat' ? '🐱 Gatos' :
		filterType === 'other' ? '🐾 Otros' : 'Todas'
	);
	const selectedColoniaName = $derived(
		filterColonia
			? (data.colonias.find((c) => c.id === filterColonia)?.name ?? 'Todas las colonias')
			: 'Todas las colonias'
	);

	const typeEmoji: Record<string, string> = { dog: '🐶', cat: '🐱', other: '🐾' };
	const typeLabel: Record<string, string> = { dog: 'Perro', cat: 'Gato', other: 'Otro' };
	const sizeLabel: Record<string, string> = { small: 'Pequeño', medium: 'Mediano', large: 'Grande' };

	function applyFilters() {
		const params = new SvelteURLSearchParams();
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
	class="min-h-screen bg-[#f4faf9] dark:bg-warm-900 bg-dots-teal"
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
				<Select.Root
					type="single"
					value={filterType || undefined}
					onValueChange={(v) => { filterType = v ?? ''; applyFilters(); }}
				>
					<Select.Trigger class="text-sm">{selectedTypeName}</Select.Trigger>
					<Select.Content>
						<Select.Item value="dog" label="🐶 Perros">🐶 Perros</Select.Item>
						<Select.Item value="cat" label="🐱 Gatos">🐱 Gatos</Select.Item>
						<Select.Item value="other" label="🐾 Otros">🐾 Otros</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			<div class="flex flex-col gap-1 min-w-[200px] flex-1">
				<label class="text-xs font-bold text-warm-500 dark:text-warm-400 uppercase tracking-wider">Colonia</label>
				<Select.Root
					type="single"
					value={filterColonia || undefined}
					onValueChange={(v) => { filterColonia = v ?? ''; applyFilters(); }}
				>
					<Select.Trigger class="text-sm">{selectedColoniaName}</Select.Trigger>
					<Select.Content>
						{#each data.colonias as col (col.id)}
							<Select.Item value={col.id} label={col.name}>{col.name}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
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
					<a
						href="/avistamientos/{s.slug}"
						class="card-appear bg-white dark:bg-warm-800 rounded-2xl border border-warm-200 dark:border-warm-700 border-l-4 border-l-teal-400 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all overflow-hidden flex flex-col"
						style="animation-delay: {i * 30}ms"
					>
						<!-- Photo zone — always shown, placeholder when no photo -->
						{#if s.photoUrl}
							<div class="aspect-[4/3] overflow-hidden shrink-0 relative">
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
							<div class="aspect-[4/3] shrink-0 relative overflow-hidden bg-gradient-to-br from-teal-50 via-teal-100/40 to-warm-50 dark:from-teal-900/30 dark:via-teal-900/20 dark:to-warm-800 flex items-center justify-center">
								<div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle, #0d9488 1px, transparent 1px); background-size: 14px 14px;"></div>
								<span class="text-4xl drop-shadow-sm relative z-10">{typeEmoji[s.type] ?? '🐾'}</span>
								<span class="absolute top-2 left-2 text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-100/80 dark:bg-teal-900/60 border border-teal-200 dark:border-teal-700 px-1.5 py-px rounded-full">
									{typeLabel[s.type] ?? s.type}
								</span>
							</div>
						{/if}

						<!-- Content -->
						<div class="p-3 flex flex-col gap-2 flex-1">
							<!-- Type label (photo cards) -->
							{#if s.photoUrl}
								<span class="text-xs font-semibold text-teal-700 dark:text-teal-400">{typeLabel[s.type] ?? s.type}</span>
							{/if}

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
							<div class="mt-auto pt-2 border-t border-warm-100 dark:border-warm-700 flex items-center justify-between gap-1 text-[11px] text-warm-400 dark:text-warm-500">
								<span class="flex items-center gap-1 min-w-0">
									<span class="shrink-0 w-1.5 h-1.5 rounded-full bg-teal-300 dark:bg-teal-700"></span>
									<span class="truncate">{s.colonia ?? 'Desconocida'}</span>
								</span>
								<span class="shrink-0">{timeAgo(s.createdAt)}</span>
							</div>
						</div>
					</a>
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
