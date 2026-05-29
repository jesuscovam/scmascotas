<script lang="ts">
  import { onMount } from 'svelte';
  import { Info } from '@lucide/svelte';
  import OpenInMapsButton from './open-in-maps-button.svelte';

  type Props = {
    lat: number;
    lng: number;
    tileUrl: string;
    tileAttribution: string;
    precision?: 'precise' | 'colonia' | 'unknown';
    googleMapsHref: string;
    appleMapsHref: string;
  };

  let {
    lat,
    lng,
    tileUrl,
    tileAttribution,
    precision = 'precise',
    googleMapsHref,
    appleMapsHref,
  }: Props = $props();

  let container: HTMLDivElement | undefined = $state();
  let isReady = $state(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let L: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mapInstance: any = null;

  function pinHtml() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44" style="display:block;overflow:visible;">
        <defs>
          <filter id="mp-shadow" x="-25%" y="-12%" width="150%" height="135%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
          </filter>
          <linearGradient id="mp-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#d97706"/>
            <stop offset="1" stop-color="#78350f"/>
          </linearGradient>
        </defs>
        <path
          d="M18 0C8.06 0 0 7.96 0 17.78c0 12.7 16.43 25 17.13 25.51.51.38 1.23.38 1.74 0C19.57 42.78 36 30.48 36 17.78 36 7.96 27.94 0 18 0z"
          fill="url(#mp-grad)"
          stroke="#fef3c7"
          stroke-width="2"
          filter="url(#mp-shadow)"
        />
        <circle cx="18" cy="17" r="6.5" fill="#fffbeb"/>
        <circle cx="18" cy="17" r="3.2" fill="#b45309"/>
      </svg>
    `;
  }

  onMount(() => {
    if (!container) return;
    let disposed = false;

    (async () => {
      const mod = await import('leaflet');
      // Stylesheet loaded by the consuming app's global CSS — see apps/web/src/app.css.
      if (disposed || !container) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      L = (mod as any).default ?? mod;

      mapInstance = L.map(container, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        boxZoom: false,
        keyboard: false,
        attributionControl: true,
      });

      L.tileLayer(tileUrl, { attribution: tileAttribution, maxZoom: 19 }).addTo(mapInstance);

      const icon = L.divIcon({
        className: 'sc-pin',
        iconSize: [36, 44],
        iconAnchor: [18, 43],
        html: pinHtml(),
      });
      L.marker([lat, lng], { icon, interactive: false, keyboard: false }).addTo(mapInstance);

      isReady = true;
    })();

    return () => {
      disposed = true;
      mapInstance?.remove();
      mapInstance = null;
      L = null;
    };
  });

  const isApprox = $derived(precision !== 'precise');
</script>

<style>
  :global(.sc-mp-container .leaflet-container) {
    background: #f5f5f4;
    cursor: default;
  }
  :global(.dark .sc-mp-container .leaflet-container) {
    background: #292524;
  }
  :global(.sc-mp-container .leaflet-control-attribution) {
    font-size: 9px !important;
    background: rgba(255, 255, 255, 0.85) !important;
    padding: 1px 6px !important;
  }
  :global(.dark .sc-mp-container .leaflet-control-attribution) {
    background: rgba(28, 25, 23, 0.85) !important;
    color: #a8a29e !important;
  }
  :global(.sc-mp-container .leaflet-control-attribution a) { color: #b45309 !important; }
  :global(.dark .sc-mp-container .leaflet-control-attribution a) { color: #fcd34d !important; }
  :global(.sc-mp-container .sc-pin) {
    background: transparent !important;
    border: none !important;
  }
</style>

<div class="w-full">
  <!-- Map. `isolate` seals Leaflet's pane z-indices so they don't paint over
       the nav header or portal'd overlays elsewhere on the page. -->
  <div class="sc-mp-container relative isolate rounded-3xl overflow-hidden border border-warm-200 dark:border-warm-700 shadow-sm">
    <div bind:this={container} class="h-60 w-full"></div>

    {#if !isReady}
      <div class="absolute inset-0 flex items-center justify-center bg-warm-100/70 dark:bg-warm-800/70 backdrop-blur-sm">
        <div class="w-6 h-6 rounded-full border-2 border-amber-300 dark:border-amber-700 border-t-amber-600 dark:border-t-amber-400 animate-spin"></div>
      </div>
    {/if}

    <span class="sr-only">
      Ubicación: latitud {lat.toFixed(4)}, longitud {lng.toFixed(4)}.
      {isApprox ? 'Ubicación aproximada de la colonia.' : 'Ubicación exacta reportada.'}
    </span>
  </div>

  <!-- Precision badge -->
  {#if isApprox}
    <div class="mt-2 inline-flex items-center gap-1.5 text-[11px] text-warm-500 dark:text-warm-400 bg-warm-100/70 dark:bg-warm-800/70 rounded-full px-2.5 py-1">
      <Info class="w-3 h-3" />
      Ubicación aproximada (centro de la colonia)
    </div>
  {/if}

  <!-- Maps deep-link CTA -->
  <div class="mt-3">
    <OpenInMapsButton {googleMapsHref} {appleMapsHref} />
  </div>
</div>
