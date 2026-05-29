<script lang="ts">
	import { SvelteDate } from 'svelte/reactivity';
	import { MapView, Select } from '@scmascotas/ui';
	import { tileUrl, tileAttribution, SC_CENTER, SC_DEFAULT_ZOOM } from '$lib/client/tiles';

	type PetType = 'dog' | 'cat' | 'other' | 'all';
	type TimeRange = 'all' | 'today' | '7d' | '14d';
	type Marker = {
		slug: string;
		lat: number;
		lng: number;
		type: 'dog' | 'cat' | 'other';
		name: string | null;
		photoUrl: string | null;
		layer: 'missing' | 'spotted';
	};

	let markers = $state<Marker[]>([]);
	let filterType = $state<PetType>('all');
	let filterTime = $state<TimeRange>('all');
	let inFlight = $state(false);
	let lastBounds: { north: number; south: number; east: number; west: number } | null = null;

	function sinceDate(range: TimeRange): string | null {
		if (range === 'all') return null;
		const DAY_MS = 86_400_000;
		if (range === 'today') {
			const d = new SvelteDate();
			d.setHours(0, 0, 0, 0);
			return d.toISOString();
		}
		const days = range === '7d' ? 7 : 14;
		return new SvelteDate(Date.now() - days * DAY_MS).toISOString();
	}

	async function loadBounds(b: { north: number; south: number; east: number; west: number }) {
		lastBounds = b;
		inFlight = true;
		try {
			const since = sinceDate(filterTime);
			const base: Record<string, string> = {
				north: String(b.north),
				south: String(b.south),
				east: String(b.east),
				west: String(b.west),
			};
			if (filterType !== 'all') base.type = filterType;
			if (since) base.since = since;
			const params = new URLSearchParams(base);

			const [petsRes, spottedRes] = await Promise.all([
				fetch(`/api/pets/map?${params}`),
				fetch(`/api/spotted-pets/map?${params}`)
			]);

			const petsData = petsRes.ok ? await petsRes.json() : { points: [] };
			const spottedData = spottedRes.ok ? await spottedRes.json() : { points: [] };

			markers = [
				...(petsData.points ?? []).map((p: Omit<Marker, 'layer'>) => ({ ...p, layer: 'missing' as const })),
				...(spottedData.points ?? []).map((p: Omit<Marker, 'layer'>) => ({ ...p, layer: 'spotted' as const }))
			];
		} finally {
			inFlight = false;
		}
	}

	$effect(() => {
		// Track both filters so either change triggers a refetch.
		void filterType;
		void filterTime;
		if (lastBounds) loadBounds(lastBounds);
	});

	const missingCount = $derived(markers.filter(m => m.layer === 'missing').length);
	const spottedCount = $derived(markers.filter(m => m.layer === 'spotted').length);

	const filterLabel = $derived(
		filterType === 'dog' ? 'Perritos' :
		filterType === 'cat' ? 'Gatitos' :
		filterType === 'other' ? 'Otros' :
		'Todas'
	);

	const TIME_SEGMENTS: { value: TimeRange; label: string; short: string }[] = [
		{ value: 'all',  label: 'Todo',           short: 'Todo' },
		{ value: 'today', label: 'Hoy',            short: 'Hoy' },
		{ value: '7d',   label: 'Esta semana',     short: '7d' },
		{ value: '14d',  label: '2 semanas',       short: '2s' },
	];


</script>

<svelte:head>
	<title>Mapa — SC Mascotas</title>
	<meta name="description" content="Mapa interactivo de mascotas perdidas y avistamientos en San Cristóbal de las Casas." />
</svelte:head>

<style>
	.seg-active {
		background: #d97706;
		color: #ffffff;
		box-shadow: 0 1px 4px rgba(180, 83, 9, 0.35);
	}
	.seg-inactive {
		background: transparent;
		color: #57534e;
	}
	:global(.dark) .seg-inactive {
		color: #d6d3d1;
	}
	.seg-inactive:hover {
		background: rgba(217, 119, 6, 0.08);
		color: #92400e;
	}
	:global(.dark) .seg-inactive:hover {
		background: rgba(217, 119, 6, 0.15);
		color: #fbbf24;
	}
</style>

<div class="relative w-full h-[calc(100vh-4rem)] bg-warm-50 dark:bg-warm-900">

	<!-- Floating controls — left-16 clears Leaflet's zoom buttons -->
	<div class="absolute top-3 left-16 right-3 z-[600] flex flex-wrap items-center gap-2 pointer-events-none">

		<!-- Info badge: Mapa + counts -->
		<div class="pointer-events-auto inline-flex items-center gap-2 bg-white/95 dark:bg-warm-800/95 backdrop-blur border border-warm-200 dark:border-warm-700 rounded-full pl-3 pr-2 py-1.5 shadow-md shadow-warm-900/5">
			<span class="text-lg" aria-hidden="true">🗺️</span>
			<h1 class="font-display text-sm font-bold text-warm-900 dark:text-warm-50">Mapa</h1>
			<div class="flex items-center gap-1.5 ml-1">
				<span class="inline-flex items-center gap-1 text-[11px] font-semibold tabular-nums bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded-full px-2 py-0.5">
					🐾 {missingCount}
				</span>
				<span class="inline-flex items-center gap-1 text-[11px] font-semibold tabular-nums bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 rounded-full px-2 py-0.5">
					👀 {spottedCount}
				</span>
			</div>
		</div>

		<!-- Species filter (Select dropdown) -->
		<div class="pointer-events-auto bg-white/95 dark:bg-warm-800/95 backdrop-blur border border-warm-200 dark:border-warm-700 rounded-full px-2 py-1 shadow-md shadow-warm-900/5">
			<Select.Root type="single" value={filterType} onValueChange={(v) => (filterType = v as PetType)}>
				<Select.Trigger class="border-0 bg-transparent shadow-none h-7 text-xs gap-1 px-2 font-semibold text-warm-700 dark:text-warm-200">
					{filterLabel}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="all"   label="Todas">Todas</Select.Item>
					<Select.Item value="dog"   label="Perritos">🐶 Perritos</Select.Item>
					<Select.Item value="cat"   label="Gatitos">🐱 Gatitos</Select.Item>
					<Select.Item value="other" label="Otros">🐾 Otros</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>

		<!-- Time-range segmented pill -->
		<div
			class="pointer-events-auto inline-flex items-center gap-0.5 bg-white/95 dark:bg-warm-800/95 backdrop-blur border border-warm-200 dark:border-warm-700 rounded-full px-1 shadow-md shadow-warm-900/5 min-h-[2.75rem]"
			role="group"
			aria-label="Filtrar por tiempo"
		>
			{#each TIME_SEGMENTS as seg (seg.value)}
				<button
					type="button"
					onclick={() => (filterTime = seg.value)}
					aria-pressed={filterTime === seg.value}
					class="rounded-full px-2.5 py-1 text-xs font-semibold transition-all duration-150 leading-none min-h-[2rem] {filterTime === seg.value ? 'seg-active' : 'seg-inactive'}"
				>
					<!-- Full label on ≥sm, abbreviated below -->
					<span class="hidden sm:inline">{seg.label}</span>
					<span class="sm:hidden">{seg.short}</span>
				</button>
			{/each}
		</div>

		<!-- Loading indicator -->
		{#if inFlight}
			<div class="pointer-events-auto inline-flex items-center gap-1.5 text-[11px] font-medium text-warm-500 dark:text-warm-400 bg-white/85 dark:bg-warm-800/85 backdrop-blur rounded-full px-2.5 py-1 border border-warm-200 dark:border-warm-700">
				<span class="w-2.5 h-2.5 rounded-full border border-amber-300 dark:border-amber-700 border-t-amber-600 dark:border-t-amber-400 animate-spin"></span>
				Actualizando…
			</div>
		{/if}
	</div>

	<MapView
		{markers}
		{tileUrl}
		{tileAttribution}
		initialCenter={SC_CENTER}
		initialZoom={SC_DEFAULT_ZOOM}
		onBoundsChange={loadBounds}
	/>
</div>
