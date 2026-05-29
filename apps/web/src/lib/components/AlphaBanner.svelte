<script lang="ts">
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	let dismissed = $state(false);
</script>

{#if !dismissed}
	<div transition:slide={{ duration: 350, easing: quintOut }}>
		<!-- Caution stripe left edge -->
		<div class="relative overflow-hidden rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/50">
			<div class="absolute left-0 top-0 bottom-0 w-1.5 flex flex-col overflow-hidden" aria-hidden="true">
				{#each Array(20) as _, i (i)}
					<div class="shrink-0 h-3" style="background:{i % 2 === 0 ? '#d97706' : '#fef3c7'};"></div>
				{/each}
			</div>

			<div class="pl-5 pr-3 py-3 flex items-center gap-2.5">
				<svg class="shrink-0 text-amber-500 dark:text-amber-400" width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
					<path d="M8 1a.5.5 0 0 1 .437.257l6.5 11A.5.5 0 0 1 14.5 13H1.5a.5.5 0 0 1-.437-.743l6.5-11A.5.5 0 0 1 8 1zm0 1.882L2.19 12h11.62L8 2.882zM7.5 6.5a.5.5 0 0 1 1 0v2.5a.5.5 0 0 1-1 0V6.5zm.5 5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5z"/>
				</svg>

				<span class="shrink-0 font-mono font-bold uppercase tracking-wider text-[10px] bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded-sm">BETA</span>

				<p class="flex-1 text-sm text-amber-900 dark:text-amber-200">
					<span class="font-medium">Estás en versión beta.</span>
					Los datos actuales son de prueba — las mascotas que ves no son reales. Siéntete libre de explorar.
				</p>

				<button
					onclick={() => (dismissed = true)}
					aria-label="Cerrar aviso"
					class="shrink-0 p-1 rounded text-amber-400 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
				>
					<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
						<line x1="2" y1="2" x2="12" y2="12"/>
						<line x1="12" y1="2" x2="2" y2="12"/>
					</svg>
				</button>
			</div>
		</div>
	</div>
{/if}
