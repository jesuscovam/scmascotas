<script lang="ts">
  import { onMount } from 'svelte';
  import { PawPrint, Search } from '@lucide/svelte';

  type LatLng = { lat: number; lng: number };
  type MapMarker = {
    slug: string;
    lat: number;
    lng: number;
    type: 'dog' | 'cat' | 'other';
    photoUrl?: string | null;
    name?: string | null;
  };
  type Bounds = { north: number; south: number; east: number; west: number };

  type Props = {
    markers: MapMarker[];
    onMarkerClick?: (slug: string) => void;
    onBoundsChange?: (bounds: Bounds) => void;
    tileUrl: string;
    tileAttribution: string;
    initialCenter?: LatLng;
    initialZoom?: number;
    variant?: 'missing' | 'spotted';
  };

  let {
    markers,
    onMarkerClick,
    onBoundsChange,
    tileUrl,
    tileAttribution,
    initialCenter = { lat: 16.737, lng: -92.6376 },
    initialZoom = 14,
    variant = 'missing',
  }: Props = $props();

  let container: HTMLDivElement | undefined = $state();
  let isReady = $state(false);

  let L: any = null;
  let mapInstance: any = null;
  let markerLayers: any[] = [];
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const EMOJI: Record<MapMarker['type'], string> = { dog: '🐶', cat: '🐱', other: '🐾' };
  const TYPE_LABEL: Record<MapMarker['type'], string> = {
    dog: 'Perrito',
    cat: 'Gatito',
    other: 'Mascota',
  };

  function pinHtml(type: MapMarker['type']) {
    const bg = variant === 'spotted' ? '#fbbf24' : '#b45309';
    const ring = variant === 'spotted' ? '#78350f' : '#fef3c7';
    const inner = variant === 'spotted' ? '#fef3c7' : '#ffffff';
    const gradTop = variant === 'spotted' ? '#fcd34d' : '#d97706';
    const gradBot = variant === 'spotted' ? '#d97706' : '#78350f';
    const filterId = `pin-shadow-${variant}`;
    const gradId = `pin-grad-${variant}`;
    const badge = variant === 'spotted'
      ? `<g>
           <circle cx="30" cy="9" r="7" fill="#78350f" stroke="#fef3c7" stroke-width="1.6"/>
           <g transform="translate(26.4, 5.4)" stroke="#fef3c7" stroke-width="1.5" stroke-linecap="round" fill="none">
             <circle cx="3.4" cy="3.4" r="2.2"/>
             <path d="M5.2 5.2L7.2 7.2"/>
           </g>
         </g>`
      : '';
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44" style="display:block;overflow:visible;">
        <defs>
          <filter id="${filterId}" x="-25%" y="-12%" width="150%" height="135%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
          </filter>
          <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="${gradTop}"/>
            <stop offset="1" stop-color="${gradBot}"/>
          </linearGradient>
        </defs>
        <path
          d="M18 0C8.06 0 0 7.96 0 17.78c0 12.7 16.43 25 17.13 25.51.51.38 1.23.38 1.74 0C19.57 42.78 36 30.48 36 17.78 36 7.96 27.94 0 18 0z"
          fill="url(#${gradId})"
          stroke="${ring}"
          stroke-width="2"
          filter="url(#${filterId})"
        />
        <circle cx="18" cy="17" r="9" fill="${inner}"/>
        ${badge}
      </svg>
      <span aria-hidden="true" style="
        position:absolute;
        top:7px; left:0; right:0;
        text-align:center;
        font-size:15px; line-height:1;
        pointer-events:none;
        font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
      ">${EMOJI[type]}</span>
    `;
  }

  function popoverHtml(m: MapMarker) {
    const photo = m.photoUrl
      ? `<img src="${m.photoUrl}" alt="${m.name ?? TYPE_LABEL[m.type]}" class="sc-pop-thumb" loading="lazy"/>`
      : `<div class="sc-pop-thumb sc-pop-thumb-empty">${EMOJI[m.type]}</div>`;
    const accent = variant === 'spotted' ? 'sc-pop-accent-spotted' : 'sc-pop-accent-missing';
    return `
      <a href="/mascota/${m.slug}" class="sc-pop-link">
        <div class="sc-pop-row">
          ${photo}
          <div class="sc-pop-text">
            <div class="sc-pop-name">${escapeHtml(m.name ?? TYPE_LABEL[m.type])}</div>
            <div class="sc-pop-cta ${accent}">${variant === 'spotted' ? 'Ver avistamiento' : 'Ver mascota'} →</div>
          </div>
        </div>
      </a>
    `;
  }

  function escapeHtml(s: string) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function emitBounds() {
    if (!mapInstance) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const b = mapInstance.getBounds();
      onBoundsChange?.({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      });
    }, 300);
  }

  function syncMarkers() {
    if (!mapInstance || !L) return;
    for (const m of markerLayers) mapInstance.removeLayer(m);
    markerLayers = [];

    for (const m of markers) {
      const icon = L.divIcon({
        className: 'sc-pin',
        iconSize: [36, 44],
        iconAnchor: [18, 43],
        popupAnchor: [0, -38],
        html: pinHtml(m.type),
      });

      const marker = L.marker([m.lat, m.lng], { icon, riseOnHover: true })
        .bindPopup(popoverHtml(m), {
          closeButton: false,
          offset: [0, -6],
          className: 'sc-popup',
          maxWidth: 260,
          minWidth: 200,
        })
        .on('click', () => {
          marker.openPopup();
          onMarkerClick?.(m.slug);
        });

      marker.addTo(mapInstance);
      markerLayers.push(marker);
    }
  }

  onMount(() => {
    if (!container) return;
    let disposed = false;

    (async () => {
      const mod = await import('leaflet');
      // Stylesheet loaded by the consuming app's global CSS — see apps/web/src/app.css.
      if (disposed || !container) return;
      L = (mod as any).default ?? mod;

      mapInstance = L.map(container, {
        center: [initialCenter.lat, initialCenter.lng],
        zoom: initialZoom,
        zoomControl: true,
      });

      L.tileLayer(tileUrl, { attribution: tileAttribution, maxZoom: 19 }).addTo(mapInstance);

      mapInstance.on('moveend zoomend', emitBounds);
      isReady = true;
      syncMarkers();
      emitBounds();
    })();

    return () => {
      disposed = true;
      if (debounceTimer) clearTimeout(debounceTimer);
      mapInstance?.remove();
      mapInstance = null;
      markerLayers = [];
      L = null;
    };
  });

  // Re-sync markers when the parent passes a new array (e.g. on bounds refetch).
  $effect(() => {
    if (isReady) syncMarkers();
  });
</script>

<style>
  :global(.sc-pin) {
    background: transparent !important;
    border: none !important;
  }
  :global(.leaflet-container) {
    font-family: var(--font-body);
    background: #f5f5f4;
  }
  :global(.dark .leaflet-container) {
    background: #292524;
  }

  /* Popup chrome — strip Leaflet defaults, paint in SC Mascotas palette. */
  :global(.sc-popup .leaflet-popup-content-wrapper) {
    background: #ffffff !important;
    border: 1px solid #e7e5e4 !important;
    border-radius: 16px !important;
    padding: 0 !important;
    box-shadow: 0 12px 32px -8px rgba(28, 25, 23, 0.22) !important;
    overflow: hidden;
  }
  :global(.dark .sc-popup .leaflet-popup-content-wrapper) {
    background: #292524 !important;
    border-color: #44403c !important;
  }
  :global(.sc-popup .leaflet-popup-content) {
    margin: 0 !important;
    font-family: var(--font-body);
    width: auto !important;
  }
  :global(.sc-popup .leaflet-popup-tip) {
    background: #ffffff !important;
    box-shadow: none !important;
  }
  :global(.dark .sc-popup .leaflet-popup-tip) {
    background: #292524 !important;
  }
  :global(.sc-pop-link) {
    display: block;
    padding: 10px 12px;
    text-decoration: none;
    color: inherit;
  }
  :global(.sc-pop-link:hover) {
    background: #fffbeb;
  }
  :global(.dark .sc-pop-link:hover) {
    background: rgba(180, 83, 9, 0.12);
  }
  :global(.sc-pop-row) {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  :global(.sc-pop-thumb) {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    object-fit: cover;
    border: 1px solid #e7e5e4;
    flex-shrink: 0;
  }
  :global(.dark .sc-pop-thumb) {
    border-color: #44403c;
  }
  :global(.sc-pop-thumb-empty) {
    background: #fffbeb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }
  :global(.dark .sc-pop-thumb-empty) {
    background: rgba(146, 64, 14, 0.18);
  }
  :global(.sc-pop-text) {
    min-width: 0;
    flex: 1;
  }
  :global(.sc-pop-name) {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 14px;
    color: #1c1917;
    line-height: 1.2;
    margin-bottom: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  :global(.dark .sc-pop-name) {
    color: #fafaf9;
  }
  :global(.sc-pop-cta) {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.01em;
  }
  :global(.sc-pop-accent-missing) { color: #b45309; }
  :global(.dark .sc-pop-accent-missing) { color: #fbbf24; }
  :global(.sc-pop-accent-spotted) { color: #b45309; }
  :global(.dark .sc-pop-accent-spotted) { color: #fcd34d; }

  /* Zoom controls + attribution — recolored. */
  :global(.leaflet-control-zoom a) {
    background: #ffffff !important;
    color: #44403c !important;
    border-color: #e7e5e4 !important;
    font-family: var(--font-body) !important;
    font-weight: 700 !important;
  }
  :global(.dark .leaflet-control-zoom a) {
    background: #292524 !important;
    color: #fafaf9 !important;
    border-color: #44403c !important;
  }
  :global(.leaflet-control-attribution) {
    font-size: 10px !important;
    background: rgba(255, 255, 255, 0.88) !important;
    padding: 2px 8px !important;
  }
  :global(.dark .leaflet-control-attribution) {
    background: rgba(28, 25, 23, 0.88) !important;
    color: #d6d3d1 !important;
  }
  :global(.leaflet-control-attribution a) { color: #b45309 !important; }
  :global(.dark .leaflet-control-attribution a) { color: #fcd34d !important; }
</style>

<!-- `isolate` seals Leaflet's pane z-indices (200–700) into a local stacking
     context so they don't paint over the page's nav header or portal'd
     overlays. Without it the tile pane bleeds above sticky/fixed chrome. -->
<div class="relative isolate w-full h-full">
  <div bind:this={container} class="absolute inset-0"></div>

  {#if !isReady}
    <div class="absolute inset-0 flex items-center justify-center bg-warm-50/70 dark:bg-warm-800/70 backdrop-blur-sm pointer-events-none z-[400]">
      <div class="flex flex-col items-center gap-2">
        <div class="w-8 h-8 rounded-full border-2 border-amber-300 dark:border-amber-700 border-t-amber-600 dark:border-t-amber-400 animate-spin"></div>
        <p class="text-xs text-warm-500 dark:text-warm-400 font-medium">Cargando mapa…</p>
      </div>
    </div>
  {/if}

  {#if isReady && markers.length === 0}
    <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center px-4 pointer-events-none z-[500]">
      <div class="pointer-events-auto bg-white/95 dark:bg-warm-800/95 backdrop-blur border border-warm-200 dark:border-warm-700 rounded-3xl shadow-xl shadow-warm-900/10 px-6 py-5 max-w-sm text-center">
        <div class="w-11 h-11 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/60 flex items-center justify-center mb-3">
          {#if variant === 'spotted'}
            <Search class="w-5 h-5 text-amber-600 dark:text-amber-400" />
          {:else}
            <PawPrint class="w-5 h-5 text-amber-700 dark:text-amber-400" />
          {/if}
        </div>
        <p class="font-display text-base font-bold text-warm-900 dark:text-warm-50 leading-snug">
          {variant === 'spotted'
            ? 'No hay avistamientos en esta zona'
            : 'No hay mascotas perdidas en esta zona'}
        </p>
        <p class="text-xs text-warm-500 dark:text-warm-400 mt-1.5 leading-relaxed">
          Aleja el mapa o muévelo a otra parte de la ciudad.
        </p>
      </div>
    </div>
  {/if}
</div>
