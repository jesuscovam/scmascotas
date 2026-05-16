<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let openEntry = $state<string | null>(null);

	function toggle(fecha: string) {
		openEntry = openEntry === fecha ? null : fecha;
	}
</script>

<svelte:head>
	<title>Historial de cambios — SC Mascotas</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-16">
	<a href="/" class="text-sm text-warm-500 hover:text-warm-700 transition-colors">← Volver</a>

	<h1 class="font-display text-3xl font-bold text-brand-900 mt-6 mb-2">Historial de cambios</h1>
	<p class="text-warm-500 mb-12">Novedades y mejoras de cada versión de SC Mascotas.</p>

	{#if data.entries.length === 0}
		<p class="text-warm-400 italic">Aún no hay entradas.</p>
	{:else}
		<ol class="relative border-l border-warm-200 flex flex-col gap-12">
			{#each data.entries as entry (entry.version)}
				<li class="ml-6">
					<span class="absolute -left-2.5 mt-1.5 h-5 w-5 rounded-full border-2 border-white bg-brand-700"></span>

					<div class="flex flex-wrap items-center gap-3 mb-1">
						<span class="inline-block bg-brand-100 text-brand-800 text-xs font-mono font-semibold px-2 py-0.5 rounded">
							{entry.version}
						</span>
						<time class="text-sm text-warm-400">{entry.fecha}</time>
					</div>

					<h2 class="font-display text-xl font-bold text-brand-900 mb-4">{entry.titulo}</h2>

					<div class="text-sm text-warm-600 leading-relaxed mb-3 [&_p]:mb-0 [&_strong]:font-semibold [&_strong]:text-warm-800">
						{@html entry.summary}
					</div>

					{#if entry.details}
						<button
							type="button"
							onclick={() => toggle(entry.fecha)}
							class="group flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900 transition-colors py-1"
						>
							<svg
								class="w-3.5 h-3.5 transition-transform duration-200 {openEntry === entry.fecha ? 'rotate-90' : ''}"
								viewBox="0 0 20 20" fill="currentColor"
							>
								<path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
							</svg>
							{openEntry === entry.fecha ? 'Ocultar detalles' : 'Ver detalles'}
						</button>

						{#if openEntry === entry.fecha}
							<div
								transition:fade={{ duration: 180 }}
								class="pt-3 text-sm text-warm-600 leading-relaxed
									[&_h2]:font-display [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-brand-800 [&_h2]:mt-5 [&_h2]:mb-2
									[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
									[&_li]:text-warm-600
									[&_strong]:text-warm-800 [&_strong]:font-semibold
									[&_code]:bg-warm-100 [&_code]:text-brand-800 [&_code]:text-xs [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded
									[&_p]:mb-3"
							>
								{@html entry.details}
							</div>
						{/if}
					{/if}
				</li>
			{/each}
		</ol>
	{/if}
</div>
