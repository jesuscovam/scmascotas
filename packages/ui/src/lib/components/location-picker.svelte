<script lang="ts">
  import { onMount } from 'svelte';
  import { MapPin, X, Check } from '@lucide/svelte';

  type LatLng = { lat: number; lng: number };

  type Props = {
    initialCenter?: LatLng;
    initialZoom?: number;
    /** Zoom level used when the map re-centers on an `initialCenter` change
     * (e.g. colonia switch). Defaults to 16 — close enough to read street
     * names while keeping a few surrounding blocks visible for context. */
    recenterZoom?: number;
    onLocationChange: (latLng: LatLng | null) => void;
    tileUrl: string;
    tileAttribution: string;
    label?: string;
  };

  let {
    initialCenter = { lat: 16.737, lng: -92.6376 },
    initialZoom = 14,
    recenterZoom = 16,
    onLocationChange,
    tileUrl,
    tileAttribution,
    label = 'Arrastra el pin al lugar exacto donde se perdió tu mascota',
  }: Props = $props();

  let container: HTMLDivElement | undefined = $state();
  let selected: LatLng | null = $state(null);
  let flashUpdated = $state(false);
  let isReady = $state(false);

  // Leaflet runtime + handles — never proxied through $state because Leaflet
  // mutates these objects internally and Svelte's proxy throws on map ops.
  let L: any = null;
  let mapInstance: any = null;
  let markerInstance: any = null;
  let flashTimer: ReturnType<typeof setTimeout> | null = null;
  let recenterArmed = false;

  function flash() {
    if (flashTimer) clearTimeout(flashTimer);
    flashUpdated = true;
    flashTimer = setTimeout(() => (flashUpdated = false), 1100);
  }

  function pickerPinHtml() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="44" height="56" viewBox="0 0 44 56" style="display:block;overflow:visible;">
        <defs>
          <filter id="lp-shadow" x="-30%" y="-15%" width="160%" height="135%">
            <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-opacity="0.32"/>
          </filter>
          <linearGradient id="lp-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#d97706"/>
            <stop offset="1" stop-color="#92400e"/>
          </linearGradient>
        </defs>
        <path
          d="M22 0C9.85 0 0 9.74 0 21.75 0 37.27 20.07 53.83 20.92 54.45c.63.46 1.53.46 2.16 0C23.93 53.83 44 37.27 44 21.75 44 9.74 34.15 0 22 0z"
          fill="url(#lp-grad)"
          stroke="#fef3c7"
          stroke-width="2.5"
          filter="url(#lp-shadow)"
        />
        <circle cx="22" cy="21" r="10.5" fill="#fffbeb"/>
        <g transform="translate(13.5, 13)" fill="#92400e">
          <circle cx="3" cy="2.2" r="1.5"/>
          <circle cx="14" cy="2.2" r="1.5"/>
          <circle cx="0.6" cy="6.8" r="1.3"/>
          <circle cx="16.4" cy="6.8" r="1.3"/>
          <path d="M8.5 5.4C5.5 5.4 3.4 7.9 3.4 10.4c0 2 2.1 3.6 5.1 3.6s5.1-1.6 5.1-3.6C13.6 7.9 11.5 5.4 8.5 5.4z"/>
        </g>
      </svg>
    `;
  }

  function makeIcon() {
    return L.divIcon({
      className: 'sc-picker-pin',
      iconSize: [44, 56],
      iconAnchor: [22, 54],
      html: pickerPinHtml(),
    });
  }

  function placeOrMove(coords: LatLng) {
    if (!L || !mapInstance) return;
    if (!markerInstance) {
      markerInstance = L.marker([coords.lat, coords.lng], {
        draggable: true,
        icon: makeIcon(),
        autoPan: true,
      }).addTo(mapInstance);
      markerInstance.on('dragend', () => {
        const ll = markerInstance.getLatLng();
        selected = { lat: ll.lat, lng: ll.lng };
        onLocationChange(selected);
        flash();
      });
    } else {
      markerInstance.setLatLng([coords.lat, coords.lng]);
    }
    selected = coords;
    onLocationChange(coords);
    flash();
  }

  function clearMarker() {
    if (markerInstance && mapInstance) {
      mapInstance.removeLayer(markerInstance);
      markerInstance = null;
    }
    selected = null;
    onLocationChange(null);
  }

  onMount(() => {
    if (!container) return;
    let disposed = false;

    (async () => {
      const mod = await import('leaflet');
      // Leaflet's stylesheet is imported by the consuming app's global CSS
      // (apps/web/src/app.css) — this component assumes it's already loaded.
      if (disposed || !container) return;
      L = (mod as any).default ?? mod;

      mapInstance = L.map(container, {
        center: [initialCenter.lat, initialCenter.lng],
        zoom: initialZoom,
        zoomControl: true,
        attributionControl: true,
        tap: true,
      });

      L.tileLayer(tileUrl, { attribution: tileAttribution, maxZoom: 19 }).addTo(mapInstance);

      mapInstance.on('click', (e: any) => placeOrMove({ lat: e.latlng.lat, lng: e.latlng.lng }));
      isReady = true;
    })();

    return () => {
      disposed = true;
      if (flashTimer) clearTimeout(flashTimer);
      mapInstance?.remove();
      mapInstance = null;
      markerInstance = null;
      L = null;
    };
  });

  function fmt(n: number) {
    return n.toFixed(4);
  }

  // Re-center the map when the parent changes `initialCenter` (e.g. the
  // wizard's colonia select updated). First arm-and-skip after the map
  // becomes ready so we don't re-fly on the initial mount — Leaflet already
  // centered correctly via `L.map({ center })`.
  $effect(() => {
    const lat = initialCenter.lat;
    const lng = initialCenter.lng;
    if (!isReady || !mapInstance || !L) return;
    if (!recenterArmed) {
      recenterArmed = true;
      return;
    }
    mapInstance.flyTo([lat, lng], recenterZoom, { animate: true, duration: 0.9 });
  });
</script>

<style>
  /* Strip Leaflet's default white-on-grey marker chrome so our SVG shows through. */
  :global(.sc-picker-pin) {
    background: transparent !important;
    border: none !important;
  }
  :global(.sc-picker-map .leaflet-container),
  :global(.sc-picker-map.leaflet-container) {
    font-family: var(--font-body);
    background: #f5f5f4;
    border-radius: inherit;
  }
  :global(.dark .sc-picker-map .leaflet-container),
  :global(.dark .sc-picker-map.leaflet-container) {
    background: #292524;
  }
  :global(.sc-picker-map .leaflet-control-attribution) {
    font-size: 10px !important;
    background: rgba(255, 255, 255, 0.88) !important;
    border-radius: 8px 0 0 0;
    padding: 2px 8px !important;
  }
  :global(.dark .sc-picker-map .leaflet-control-attribution) {
    background: rgba(28, 25, 23, 0.88) !important;
    color: #d6d3d1 !important;
  }
  :global(.sc-picker-map .leaflet-control-attribution a) {
    color: #b45309 !important;
  }
  :global(.dark .sc-picker-map .leaflet-control-attribution a) {
    color: #fcd34d !important;
  }
  :global(.sc-picker-map .leaflet-control-zoom a) {
    background: #ffffff !important;
    color: #44403c !important;
    border-color: #e7e5e4 !important;
    font-family: var(--font-body) !important;
  }
  :global(.dark .sc-picker-map .leaflet-control-zoom a) {
    background: #292524 !important;
    color: #fafaf9 !important;
    border-color: #44403c !important;
  }

  @keyframes lp-flash-in {
    0%   { transform: translateY(-6px) scale(0.92); opacity: 0; }
    35%  { transform: translateY(0)    scale(1.04); opacity: 1; }
    100% { transform: translateY(0)    scale(1);    opacity: 1; }
  }
  @keyframes lp-flash-out {
    0%   { opacity: 1; }
    100% { opacity: 0; }
  }
  .lp-toast {
    animation:
      lp-flash-in  0.32s cubic-bezier(0.22, 1, 0.36, 1) both,
      lp-flash-out 0.5s   ease-in 0.6s both;
  }

  @keyframes lp-pulse {
    0%, 100% { transform: scale(1);    opacity: 0.55; }
    50%      { transform: scale(1.18); opacity: 0; }
  }
  .lp-pulse-ring {
    animation: lp-pulse 2.4s ease-out infinite;
  }
</style>

<div class="w-full">
  <!-- Instruction header -->
  <div class="flex items-start gap-3 mb-3">
    <div class="relative w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
      {#if !selected}
        <span class="lp-pulse-ring absolute inset-0 rounded-2xl bg-amber-400/40 dark:bg-amber-500/30 pointer-events-none"></span>
      {/if}
      <MapPin class="relative w-5 h-5 text-amber-700 dark:text-amber-400" strokeWidth={2.25} />
    </div>
    <div class="flex-1 min-w-0">
      <p class="font-display text-base leading-snug text-warm-900 dark:text-warm-50">{label}</p>
      <p class="text-xs text-warm-500 dark:text-warm-400 mt-1">
        Toca el mapa para colocar el pin. Después puedes arrastrarlo.
      </p>
    </div>
  </div>

  <!-- Map shell — `isolate` seals Leaflet's internal pane z-indices (200–700)
       so they don't paint over portal'd overlays like Select dropdowns. -->
  <div class="relative isolate rounded-3xl overflow-hidden border-2 border-warm-200 dark:border-warm-700 shadow-sm bg-warm-100 dark:bg-warm-800">
    <div bind:this={container} class="sc-picker-map h-80 w-full"></div>

    {#if !isReady}
      <div class="absolute inset-0 flex items-center justify-center bg-warm-100/70 dark:bg-warm-800/70 backdrop-blur-sm">
        <div class="w-7 h-7 rounded-full border-2 border-amber-300 dark:border-amber-700 border-t-amber-600 dark:border-t-amber-400 animate-spin"></div>
      </div>
    {/if}

    {#if flashUpdated && selected}
      <div class="lp-toast pointer-events-none absolute top-3 right-3 z-[1000]">
        <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-600 text-white text-[11px] font-semibold tracking-wide shadow-lg shadow-amber-600/30">
          <Check class="w-3.5 h-3.5" strokeWidth={3} />
          Ubicación actualizada
        </div>
      </div>
    {/if}
  </div>

  <!-- Coordinate readout + clear -->
  <div class="mt-3 flex flex-wrap items-center justify-between gap-2 min-h-7">
    {#if selected}
      <div class="text-xs text-warm-500 dark:text-warm-400">
        Ubicación exacta:
        <span class="ml-1 inline-flex items-center gap-1 tabular-nums font-mono text-warm-800 dark:text-warm-100 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 rounded-md px-1.5 py-0.5 text-[11px]">
          {fmt(selected.lat)}, {fmt(selected.lng)}
        </span>
      </div>
      <button
        type="button"
        onclick={clearMarker}
        class="inline-flex items-center gap-1 text-xs text-warm-500 dark:text-warm-400 hover:text-warm-800 dark:hover:text-warm-100 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors px-2 py-1 rounded-md"
      >
        <X class="w-3 h-3" />
        Omitir ubicación
      </button>
    {:else}
      <div class="text-xs text-warm-400 dark:text-warm-500 italic">
        Sin ubicación exacta — usaremos el centro de la colonia.
      </div>
    {/if}
  </div>
</div>
