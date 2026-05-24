<script lang="ts">
	import { goto } from '$app/navigation';
	import { Badge, Select } from '@scmascotas/ui';
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

	const speciesLabel: Record<string, string> = { dog: 'Perro', cat: 'Gato', other: 'Otro' };
	const sizeLabel: Record<string, string> = { small: 'Pequeño', medium: 'Mediano', large: 'Grande' };
	const typeTopBorder: Record<string, string> = {
		dog: 'border-t-amber-400',
		cat: 'border-t-teal-400',
		other: 'border-t-stone-400'
	};
	const typeEmoji: Record<string, string> = { dog: '🐶', cat: '🐱', other: '🐾' };

	function applyFilters() {
		const params = new URLSearchParams();
		if (filterType) params.set('tipo', filterType);
		if (filterColonia) params.set('colonia', filterColonia);
		goto(`/mascotas${params.size ? '?' + params : ''}`, { replaceState: true, noScroll: true });
	}

	function clearFilters() {
		filterType = '';
		filterColonia = '';
		goto('/mascotas', { replaceState: true, noScroll: true });
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
	<title>Mascotas perdidas — SC Mascotas</title>
	<meta name="description" content="Todos los reportes activos de mascotas perdidas en San Cristóbal de las Casas." />
</svelte:head>

<style>
	@keyframes fade-up {
		from { opacity: 0; transform: translateY(14px); }
		to   { opacity: 1; transform: translateY(0); }
	}
	.card-appear {
		animation: fade-up 0.38s ease both;
	}
</style>

<div
	class="min-h-screen bg-[#faf8f5] dark:bg-warm-900"
	style="background-image: radial-gradient(circle, rgba(180,120,30,0.07) 1px, transparent 1px); background-size: 22px 22px;"
>
	<div class="max-w-7xl mx-auto px-4 py-10 pb-20">

		<!-- Back nav -->
		<a href="/" class="inline-flex items-center gap-1.5 text-sm text-warm-500 dark:text-warm-400 hover:text-warm-800 dark:hover:text-warm-200 transition-colors font-medium group mb-8">
			<svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd" />
			</svg>
			Inicio
		</a>

		<!-- Page header -->
		<div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
			<div>
				<div class="flex items-center gap-3 mb-1">
					<span class="text-3xl">🐾</span>
					<h1 class="font-display text-3xl sm:text-4xl font-bold text-warm-900 dark:text-warm-50 leading-tight">
						Mascotas perdidas
					</h1>
					<span class="shrink-0 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 px-2.5 py-1 rounded-full">
						{data.pets.length} activos
					</span>
				</div>
				<p class="text-warm-500 dark:text-warm-400 text-sm">
					San Cristóbal de las Casas — reportes de la comunidad
				</p>
			</div>
			<a
				href="/reportar"
				class="shrink-0 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-5 py-2.5 rounded-2xl transition-all active:scale-95 shadow-sm"
			>
				+ Publicar reporte
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

		{#if data.pets.length === 0}
			<!-- Empty state -->
			<div class="flex flex-col items-center gap-5 py-24 text-center">
				<span class="text-7xl">🐾</span>
				<div>
					<p class="font-display text-xl font-semibold text-warm-700 dark:text-warm-200 mb-1">
						{hasFilters ? 'Sin resultados para estos filtros' : 'No hay reportes activos'}
					</p>
					<p class="text-warm-500 dark:text-warm-400 text-sm">
						{hasFilters ? 'Prueba con otros criterios de búsqueda.' : '¡La comunidad está tranquila por ahora!'}
					</p>
				</div>
				{#if hasFilters}
					<button onclick={clearFilters} class="text-sm font-semibold text-amber-700 dark:text-amber-400 hover:underline">
						Ver todos los reportes
					</button>
				{:else}
					<a href="/reportar" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-5 py-2.5 rounded-2xl transition-all">
						Publicar un reporte
					</a>
				{/if}
			</div>
		{:else}
			<!-- Card grid -->
			<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
				{#each data.pets as pet, i (pet.id)}
					<a
						href="/mascota/{pet.slug}"
						class="card-appear group bg-white dark:bg-warm-800 rounded-2xl border border-warm-200 dark:border-warm-700 border-t-4 {typeTopBorder[pet.type] ?? 'border-t-stone-400'} shadow-sm hover:shadow-md hover:scale-[1.02] transition-all overflow-hidden flex flex-col"
						style="animation-delay: {i * 30}ms"
					>
						<!-- Photo zone — always shown, placeholder when no photo -->
						{#if pet.photoUrl}
							<div class="aspect-[4/3] overflow-hidden shrink-0">
								<img
									src={pet.photoUrl}
									alt={pet.name ?? 'Mascota'}
									class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
								/>
							</div>
						{:else}
							<div class="aspect-[4/3] shrink-0 relative overflow-hidden bg-gradient-to-br from-amber-50 via-amber-100/50 to-warm-50 dark:from-warm-700 dark:via-warm-700/60 dark:to-warm-800 flex items-center justify-center">
								<div class="absolute inset-0 opacity-25" style="background-image: radial-gradient(circle, #d97706 1px, transparent 1px); background-size: 14px 14px;"></div>
								<span class="text-4xl drop-shadow-sm relative z-10">{typeEmoji[pet.type] ?? '🐾'}</span>
							</div>
						{/if}

						<!-- Content -->
						<div class="p-3 flex flex-col gap-2 flex-1">
							<!-- Name + badge -->
							<div class="flex items-start justify-between gap-1.5">
								<h2 class="font-display font-semibold text-warm-900 dark:text-warm-50 text-sm leading-snug group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors line-clamp-2">
									{pet.name ?? 'Sin nombre'}
								</h2>
								<Badge.Root variant="amber" class="shrink-0 !text-[10px] !px-1.5 !py-0 ml-1">
									{speciesLabel[pet.type] ?? pet.type}
								</Badge.Root>
							</div>

							{#if pet.color || pet.size}
								<div class="flex flex-wrap gap-1 text-[11px] text-warm-500 dark:text-warm-400">
									{#if pet.color}
										<span class="bg-warm-100 dark:bg-warm-700 px-1.5 py-px rounded-full">{pet.color}</span>
									{/if}
									{#if pet.size}
										<span class="bg-warm-100 dark:bg-warm-700 px-1.5 py-px rounded-full">{sizeLabel[pet.size]}</span>
									{/if}
								</div>
							{/if}

							{#if pet.description}
								<p class="text-[11px] text-warm-400 dark:text-warm-500 line-clamp-2 leading-relaxed">{pet.description}</p>
							{/if}

							<!-- Footer -->
							<div class="mt-auto pt-2 border-t border-warm-100 dark:border-warm-700 flex items-center justify-between gap-1 text-[11px] text-warm-400 dark:text-warm-500">
								<span class="flex items-center gap-1 min-w-0">
									<span class="shrink-0 w-1.5 h-1.5 rounded-full bg-warm-300 dark:bg-warm-600"></span>
									<span class="truncate">{pet.colonia ?? 'Desconocida'}</span>
								</span>
								<span class="shrink-0">{timeAgo(pet.lastSeenAt)}</span>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{/if}

		<!-- Cross-link -->
		<div class="mt-16 border-t border-warm-200 dark:border-warm-700 pt-8 text-center">
			<p class="text-sm text-warm-500 dark:text-warm-400 mb-3">
				¿Viste una mascota perdida pero no sabes de quién es?
			</p>
			<a
				href="/avistamientos"
				class="inline-flex items-center gap-2 border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 font-semibold text-sm px-5 py-2.5 rounded-2xl transition-colors"
			>
				👀 Ver avistamientos recientes →
			</a>
		</div>

	</div>
</div>
