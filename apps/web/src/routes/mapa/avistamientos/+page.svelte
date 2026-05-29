<script lang="ts">
	import { goto } from '$app/navigation';
	import { MapView, Select } from '@scmascotas/ui';
	import { tileUrl, tileAttribution, SC_CENTER, SC_DEFAULT_ZOOM } from '$lib/client/tiles';

	type PetType = 'dog' | 'cat' | 'other' | 'all';
	type Marker = {
		slug: string;
		lat: number;
		lng: number;
		type: 'dog' | 'cat' | 'other';
		name: string | null;
		photoUrl: string | null;
		createdAt?: string;
	};

	let markers = $state<Marker[]>([]);
	let filterType = $state<PetType>('all');
	let inFlight = $state(false);
	let lastBounds: { north: number; south: number; east: number; west: number } | null = null;

	async function loadBounds(b: { north: number; south: number; east: number; west: number }) {
		lastBounds = b;
		inFlight = true;
		try {
			const u = new URL('/api/spotted-pets/map', window.location.origin);
			u.searchParams.set('north', String(b.north));
			u.searchParams.set('south', String(b.south));
			u.searchParams.set('east', String(b.east));
			u.searchParams.set('west', String(b.west));
			if (filterType !== 'all') u.searchParams.set('type', filterType);
			const res = await fetch(u);
			if (res.ok) {
				const data = await res.json();
				markers = data.points ?? [];
			}
		} finally {
			inFlight = false;
		}
	}

	function onMarker(slug: string) {
		goto(`/avistamientos/${slug}`);
	}

	$effect(() => {
		filterType;
		if (lastBounds) loadBounds(lastBounds);
	});

	const filterLabel = $derived(
		filterType === 'dog' ? 'Perritos' :
		filterType === 'cat' ? 'Gatitos' :
		filterType === 'other' ? 'Otros' :
		'Todas'
	);
</script>

<svelte:head>
	<title>Mapa de avistamientos — SC Mascotas</title>
	<meta name="description" content="Mapa interactivo de avistamientos de mascotas reportados en San Cristóbal." />
</svelte:head>

<div class="relative w-full h-[calc(100vh-4rem)] bg-warm-50 dark:bg-warm-900">
	<div class="absolute top-3 left-3 right-3 z-[600] flex flex-wrap items-center gap-2 pointer-events-none">
		<div class="pointer-events-auto inline-flex items-center gap-2 bg-white/95 dark:bg-warm-800/95 backdrop-blur border border-warm-200 dark:border-warm-700 rounded-full pl-3 pr-2 py-1.5 shadow-md shadow-warm-900/5">
			<span class="text-lg" aria-hidden="true">🔍</span>
			<h1 class="font-display text-sm font-bold text-warm-900 dark:text-warm-50">
				Avistamientos
			</h1>
			<span class="text-xs text-warm-500 dark:text-warm-400 tabular-nums ml-1">
				{markers.length}
			</span>
		</div>

		<div class="pointer-events-auto bg-white/95 dark:bg-warm-800/95 backdrop-blur border border-warm-200 dark:border-warm-700 rounded-full px-2 py-1 shadow-md shadow-warm-900/5">
			<Select.Root type="single" value={filterType} onValueChange={(v) => (filterType = v as PetType)}>
				<Select.Trigger class="border-0 bg-transparent shadow-none h-7 text-xs gap-1 px-2 font-semibold text-warm-700 dark:text-warm-200">
					{filterLabel}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="all" label="Todas">Todas</Select.Item>
					<Select.Item value="dog" label="Perritos">🐶 Perritos</Select.Item>
					<Select.Item value="cat" label="Gatitos">🐱 Gatitos</Select.Item>
					<Select.Item value="other" label="Otros">🐾 Otros</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>

		{#if inFlight}
			<div class="pointer-events-auto inline-flex items-center gap-1.5 text-[11px] font-medium text-warm-500 dark:text-warm-400 bg-white/85 dark:bg-warm-800/85 backdrop-blur rounded-full px-2.5 py-1 border border-warm-200 dark:border-warm-700">
				<span class="w-2.5 h-2.5 rounded-full border border-amber-300 dark:border-amber-700 border-t-amber-600 dark:border-t-amber-400 animate-spin"></span>
				Actualizando…
			</div>
		{/if}
	</div>

	<a
		href="/mapa"
		class="absolute bottom-4 right-4 z-[600] inline-flex items-center gap-1.5 text-xs font-semibold bg-white/95 dark:bg-warm-800/95 backdrop-blur border border-warm-200 dark:border-warm-700 rounded-full px-3 py-2 shadow-md shadow-warm-900/10 text-warm-700 dark:text-warm-200 hover:text-amber-700 dark:hover:text-amber-400 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
	>
		🐾 Ver mascotas perdidas
	</a>

	<MapView
		{markers}
		{tileUrl}
		{tileAttribution}
		initialCenter={SC_CENTER}
		initialZoom={SC_DEFAULT_ZOOM}
		variant="spotted"
		onBoundsChange={loadBounds}
		onMarkerClick={onMarker}
	/>
</div>
