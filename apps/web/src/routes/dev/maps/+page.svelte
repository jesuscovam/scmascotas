<script lang="ts">
  import {
    LocationPicker,
    MapView,
    MapPreview,
    OpenInMapsButton,
  } from '@scmascotas/ui';
  import { tileUrl, tileAttribution, SC_CENTER, SC_DEFAULT_ZOOM } from '$lib/client/tiles';

  type LatLng = { lat: number; lng: number };

  let pickedLocation = $state<LatLng | null>(null);
  let lastBounds = $state<{ north: number; south: number; east: number; west: number } | null>(null);
  let clickedSlug = $state<string | null>(null);

  // Mock pets clustered around San Cristóbal centro
  const missingPets = [
    { slug: 'firulais-abc1', lat: 16.7372, lng: -92.6378, type: 'dog' as const, name: 'Firulais', photoUrl: null },
    { slug: 'pelusa-def2',   lat: 16.7401, lng: -92.6342, type: 'cat' as const, name: 'Pelusa',   photoUrl: null },
    { slug: 'rocky-ghi3',    lat: 16.7331, lng: -92.6422, type: 'dog' as const, name: 'Rocky',    photoUrl: null },
    { slug: 'chiquis-jkl4',  lat: 16.7295, lng: -92.6310, type: 'other' as const, name: 'Chiquis', photoUrl: null },
  ];

  const spottedPets = [
    { slug: 'av-mno5', lat: 16.7388, lng: -92.6395, type: 'dog' as const, name: null, photoUrl: null },
    { slug: 'av-pqr6', lat: 16.7350, lng: -92.6300, type: 'cat' as const, name: null, photoUrl: null },
  ];

  function googleHref(lat: number, lng: number) {
    return `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
  }
  function appleHref(lat: number, lng: number) {
    return `https://maps.apple.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
  }
</script>

<svelte:head>
  <title>Preview de mapas · Sprint 6 · SC Mascotas</title>
</svelte:head>

<div class="max-w-3xl mx-auto px-4 py-10">
  <header class="mb-10">
    <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-semibold uppercase tracking-wider mb-3">
      Dev preview
    </div>
    <h1 class="font-display text-3xl font-bold text-warm-900 dark:text-warm-50 leading-tight">
      Sprint 6 — componentes de mapa
    </h1>
    <p class="text-sm text-warm-500 dark:text-warm-400 mt-2 leading-relaxed">
      Verifica visualmente cada componente antes de cablearlos en
      <code class="px-1 py-0.5 rounded bg-warm-100 dark:bg-warm-800 text-[12px]">/reportar</code>,
      <code class="px-1 py-0.5 rounded bg-warm-100 dark:bg-warm-800 text-[12px]">/mapa</code> y
      <code class="px-1 py-0.5 rounded bg-warm-100 dark:bg-warm-800 text-[12px]">/mascota/[slug]</code>
      en PR 4.
    </p>
  </header>

  <!-- LocationPicker -->
  <section class="mb-12">
    <h2 class="font-display text-lg font-bold text-warm-800 dark:text-warm-100 mb-1">
      1 · LocationPicker
    </h2>
    <p class="text-xs text-warm-500 dark:text-warm-400 mb-4">
      Para el wizard de <code>/reportar</code>. Toca el mapa o arrastra el pin.
    </p>

    <LocationPicker
      initialCenter={SC_CENTER}
      initialZoom={SC_DEFAULT_ZOOM}
      {tileUrl}
      {tileAttribution}
      onLocationChange={(loc) => (pickedLocation = loc)}
    />

    <div class="mt-3 text-xs text-warm-600 dark:text-warm-300 font-mono bg-warm-50 dark:bg-warm-800 rounded-lg px-3 py-2">
      onLocationChange →
      <span class="text-amber-700 dark:text-amber-400">
        {pickedLocation
          ? `{ lat: ${pickedLocation.lat.toFixed(4)}, lng: ${pickedLocation.lng.toFixed(4)} }`
          : 'null'}
      </span>
    </div>
  </section>

  <!-- MapView: missing -->
  <section class="mb-12">
    <h2 class="font-display text-lg font-bold text-warm-800 dark:text-warm-100 mb-1">
      2 · MapView — variant: missing
    </h2>
    <p class="text-xs text-warm-500 dark:text-warm-400 mb-4">
      Para <code>/mapa</code>. Pines amber-700 con emoji de especie.
    </p>

    <div class="h-[60vh] rounded-3xl overflow-hidden border border-warm-200 dark:border-warm-700">
      <MapView
        markers={missingPets}
        {tileUrl}
        {tileAttribution}
        initialCenter={SC_CENTER}
        initialZoom={SC_DEFAULT_ZOOM}
        variant="missing"
        onMarkerClick={(slug) => (clickedSlug = slug)}
        onBoundsChange={(bounds) => (lastBounds = bounds)}
      />
    </div>

    <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
      <div class="bg-warm-50 dark:bg-warm-800 rounded-lg px-3 py-2">
        onMarkerClick →
        <span class="text-amber-700 dark:text-amber-400">{clickedSlug ?? 'none yet'}</span>
      </div>
      <div class="bg-warm-50 dark:bg-warm-800 rounded-lg px-3 py-2">
        onBoundsChange →
        <span class="text-amber-700 dark:text-amber-400 text-[11px]">
          {lastBounds
            ? `N${lastBounds.north.toFixed(3)} S${lastBounds.south.toFixed(3)}`
            : 'pending'}
        </span>
      </div>
    </div>
  </section>

  <!-- MapView: spotted -->
  <section class="mb-12">
    <h2 class="font-display text-lg font-bold text-warm-800 dark:text-warm-100 mb-1">
      3 · MapView — variant: spotted
    </h2>
    <p class="text-xs text-warm-500 dark:text-warm-400 mb-4">
      Para <code>/mapa/avistamientos</code>. Pines amber-400 con badge de lupa.
    </p>

    <div class="h-[60vh] rounded-3xl overflow-hidden border border-warm-200 dark:border-warm-700">
      <MapView
        markers={spottedPets}
        {tileUrl}
        {tileAttribution}
        initialCenter={SC_CENTER}
        initialZoom={SC_DEFAULT_ZOOM}
        variant="spotted"
      />
    </div>
  </section>

  <!-- MapView: empty state -->
  <section class="mb-12">
    <h2 class="font-display text-lg font-bold text-warm-800 dark:text-warm-100 mb-1">
      4 · MapView — estado vacío
    </h2>
    <p class="text-xs text-warm-500 dark:text-warm-400 mb-4">
      Cuando <code>markers.length === 0</code>.
    </p>

    <div class="h-80 rounded-3xl overflow-hidden border border-warm-200 dark:border-warm-700">
      <MapView markers={[]} {tileUrl} {tileAttribution} initialCenter={SC_CENTER} initialZoom={SC_DEFAULT_ZOOM} />
    </div>
  </section>

  <!-- MapPreview: precise -->
  <section class="mb-12">
    <h2 class="font-display text-lg font-bold text-warm-800 dark:text-warm-100 mb-1">
      5 · MapPreview — precision: precise
    </h2>
    <p class="text-xs text-warm-500 dark:text-warm-400 mb-4">
      Embebido en <code>/mascota/[slug]</code>. Read-only.
    </p>

    <MapPreview
      lat={SC_CENTER.lat}
      lng={SC_CENTER.lng}
      {tileUrl}
      {tileAttribution}
      precision="precise"
      googleMapsHref={googleHref(SC_CENTER.lat, SC_CENTER.lng)}
      appleMapsHref={appleHref(SC_CENTER.lat, SC_CENTER.lng)}
    />
  </section>

  <!-- MapPreview: colonia -->
  <section class="mb-12">
    <h2 class="font-display text-lg font-bold text-warm-800 dark:text-warm-100 mb-1">
      6 · MapPreview — precision: colonia
    </h2>
    <p class="text-xs text-warm-500 dark:text-warm-400 mb-4">
      Mismo componente con el badge "Ubicación aproximada".
    </p>

    <MapPreview
      lat={16.7401}
      lng={-92.6342}
      {tileUrl}
      {tileAttribution}
      precision="colonia"
      googleMapsHref={googleHref(16.7401, -92.6342)}
      appleMapsHref={appleHref(16.7401, -92.6342)}
    />
  </section>

  <!-- OpenInMapsButton standalone -->
  <section class="mb-12">
    <h2 class="font-display text-lg font-bold text-warm-800 dark:text-warm-100 mb-1">
      7 · OpenInMapsButton
    </h2>
    <p class="text-xs text-warm-500 dark:text-warm-400 mb-4">
      En iOS se actualiza a Apple Maps después de montar. SSR → Google Maps.
    </p>

    <div class="max-w-sm">
      <OpenInMapsButton
        googleMapsHref={googleHref(SC_CENTER.lat, SC_CENTER.lng)}
        appleMapsHref={appleHref(SC_CENTER.lat, SC_CENTER.lng)}
      />
    </div>
  </section>
</div>
