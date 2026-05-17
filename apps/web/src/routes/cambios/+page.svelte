<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const initialGroup = data.groups[0]?.minorVersion;
	let openGroups = $state<Set<string>>(initialGroup ? new Set([initialGroup]) : new Set());
	let openEntry = $state<string | null>(null);

	function toggleGroup(minor: string) {
		if (openGroups.has(minor)) {
			openGroups = new Set([...openGroups].filter((v) => v !== minor));
		} else {
			openGroups = new Set([...openGroups, minor]);
		}
	}

	function toggleEntry(version: string) {
		openEntry = openEntry === version ? null : version;
	}
</script>

<svelte:head>
	<title>Historial de cambios — SC Mascotas</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-16">
	<a href="/" class="text-sm text-warm-500 dark:text-warm-400 hover:text-warm-700 dark:hover:text-warm-200 transition-colors">← Volver</a>

	<h1 class="font-display text-3xl font-bold text-brand-900 dark:text-brand-300 mt-6 mb-2">Historial de cambios</h1>
	<p class="text-warm-500 dark:text-warm-400 mb-12">Novedades y mejoras de cada versión de SC Mascotas.</p>

	{#if data.groups.length === 0}
		<p class="text-warm-400 italic">Aún no hay entradas.</p>
	{:else}
		<ol class="relative border-l border-warm-200 dark:border-warm-700 flex flex-col gap-10">
			{#each data.groups as group (group.minorVersion)}
				<li class="ml-6">
					<span class="absolute -left-3 mt-1 h-6 w-6 rounded-full border-2 border-white dark:border-warm-900 bg-brand-700 dark:bg-brand-500"></span>

					<button
						type="button"
						onclick={() => toggleGroup(group.minorVersion)}
						class="group w-full text-left"
					>
						<div class="flex flex-wrap items-center gap-2.5">
							<span class="inline-block bg-brand-700 dark:bg-brand-600 text-white text-xs font-mono font-bold px-2.5 py-1 rounded-md leading-none">
								{group.minorVersion}.x
							</span>
							<span class="text-xs text-warm-400 dark:text-warm-500 font-medium">
								{group.patches.length} {group.patches.length === 1 ? 'versión' : 'versiones'}
							</span>
							<svg
								class="w-4 h-4 text-warm-400 dark:text-warm-500 group-hover:text-warm-600 dark:group-hover:text-warm-300 transition-all duration-250 ml-auto {openGroups.has(group.minorVersion) ? 'rotate-90' : ''}"
								viewBox="0 0 20 20"
								fill="currentColor"
								aria-hidden="true"
							>
								<path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
							</svg>
						</div>

						{#if !openGroups.has(group.minorVersion)}
							<p class="mt-1.5 text-sm text-warm-500 dark:text-warm-400 group-hover:text-warm-700 dark:group-hover:text-warm-200 transition-colors truncate">
								{group.patches[0].titulo}
							</p>
						{/if}
					</button>

					{#if openGroups.has(group.minorVersion)}
						<div
							transition:slide={{ duration: 220 }}
							class="mt-5 border-l-2 border-brand-100 dark:border-brand-800 pl-5 space-y-7"
						>
							{#each group.patches as entry (entry.version)}
								<div class="relative">
									<span class="absolute -left-[1.4375rem] top-1.5 h-3 w-3 rounded-full border-2 border-brand-200 dark:border-brand-700 bg-white dark:bg-warm-900"></span>

									<div class="flex flex-wrap items-center gap-2 mb-1">
										<span class="inline-block bg-brand-100 dark:bg-brand-900/40 text-brand-800 dark:text-brand-300 text-xs font-mono font-semibold px-2 py-0.5 rounded">
											{entry.version}
										</span>
										<time class="text-xs text-warm-400 dark:text-warm-500">{entry.fecha}</time>
									</div>

									<h2 class="font-display text-lg font-bold text-brand-900 dark:text-brand-300 mb-3">{entry.titulo}</h2>

									<div class="text-sm text-warm-600 dark:text-warm-300 leading-relaxed mb-2 [&_p]:mb-0 [&_strong]:font-semibold [&_strong]:text-warm-800 dark:[&_strong]:text-warm-200">
										<!-- eslint-disable-next-line svelte/no-at-html-tags -->
										{@html entry.summary}
									</div>

									{#if entry.details}
										<button
											type="button"
											onclick={() => toggleEntry(entry.version)}
											class="flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-brand-400 hover:text-brand-900 dark:hover:text-brand-200 transition-colors py-1"
										>
											<svg
												class="w-3.5 h-3.5 transition-transform duration-200 {openEntry === entry.version ? 'rotate-90' : ''}"
												viewBox="0 0 20 20"
												fill="currentColor"
												aria-hidden="true"
											>
												<path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
											</svg>
											{openEntry === entry.version ? 'Ocultar detalles' : 'Ver detalles'}
										</button>

										{#if openEntry === entry.version}
											<div
												transition:fade={{ duration: 180 }}
												class="pt-3 text-sm text-warm-600 dark:text-warm-300 leading-relaxed
													[&_h2]:font-display [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-brand-800 dark:[&_h2]:text-brand-300 [&_h2]:mt-5 [&_h2]:mb-2
													[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
													[&_li]:text-warm-600 dark:[&_li]:text-warm-300
													[&_strong]:text-warm-800 dark:[&_strong]:text-warm-200 [&_strong]:font-semibold
													[&_code]:bg-warm-100 dark:[&_code]:bg-warm-800 [&_code]:text-brand-800 dark:[&_code]:text-brand-300 [&_code]:text-xs [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded
													[&_p]:mb-3"
											>
												<!-- eslint-disable-next-line svelte/no-at-html-tags -->
												{@html entry.details}
											</div>
										{/if}
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</li>
			{/each}
		</ol>
	{/if}
</div>
