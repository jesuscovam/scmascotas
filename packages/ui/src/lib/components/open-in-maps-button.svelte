<script lang="ts">
  import { onMount } from 'svelte';
  import { Navigation } from '@lucide/svelte';

  type Props = {
    googleMapsHref: string;
    appleMapsHref: string;
    label?: string;
  };

  let { googleMapsHref, appleMapsHref, label = 'Cómo llegar' }: Props = $props();

  // Server-renders to Google Maps — works without JS, works on Android.
  // After mount, swap to Apple Maps for iOS so the system handler opens the
  // native app (Mac with touch covers iPadOS reporting itself as desktop).
  let isIOS = $state(false);

  onMount(() => {
    if (typeof navigator === 'undefined') return;
    const ua = navigator.userAgent || '';
    const platform = (navigator as { platform?: string }).platform || '';
    isIOS =
      /iPhone|iPad|iPod/i.test(ua) ||
      (/Mac/i.test(platform) && 'ontouchend' in document);
  });

  const href = $derived(isIOS ? appleMapsHref : googleMapsHref);
</script>

<a
  {href}
  target="_blank"
  rel="noopener noreferrer"
  class="group relative inline-flex items-center justify-center gap-2 w-full min-h-11 px-5 py-3 rounded-2xl bg-gradient-to-b from-amber-500 to-amber-700 text-white font-semibold tracking-wide shadow-md shadow-amber-700/25 hover:shadow-lg hover:shadow-amber-700/35 hover:from-amber-500 hover:to-amber-600 active:scale-[0.985] transition-all duration-200 overflow-hidden"
>
  <span class="absolute inset-0 bg-gradient-to-t from-transparent via-white/0 to-white/15 pointer-events-none"></span>
  <Navigation class="relative w-4 h-4 -mt-0.5" strokeWidth={2.5} />
  <span class="relative text-sm sm:text-base">{label}</span>
  <span class="relative text-[11px] font-normal opacity-80 hidden sm:inline">(Google Maps)</span>
</a>
