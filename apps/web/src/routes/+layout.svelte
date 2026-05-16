<script lang="ts">
	import '../app.css';
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { onNavigate } from '$app/navigation';

	injectAnalytics({ mode: dev ? 'development' : 'production' });

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	let { children, data } = $props();
</script>

<div class="min-h-screen flex flex-col bg-warm-50">
	<header class="border-b border-warm-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
		<div class="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
			<a href="/" class="flex items-center gap-2 group">
				<span class="text-2xl">🐾</span>
				<span
					class="font-display font-bold text-brand-900 text-xl tracking-tight group-hover:text-brand-700 transition-colors"
				>
					SC Mascotas
				</span>
				<span class="beta-stamp self-start mt-[5px] inline-block px-[5px] py-[2px] border border-amber-600/55 text-amber-700/75 text-[7.5px] font-mono font-bold uppercase tracking-[0.2em] select-none pointer-events-none"
					style="transform: rotate(-9deg); box-shadow: inset 0 0 0 1px rgba(180,100,20,0.12);">
					beta
				</span>
			</a>
			<nav class="flex items-center gap-4">
				<a
					href="/acerca"
					class="text-sm text-warm-500 hover:text-warm-700 transition-colors font-medium"
				>
					Acerca
				</a>
				<a
					href="/cambios"
					class="text-sm text-warm-500 hover:text-warm-700 transition-colors font-medium"
				>
					Cambios
				</a>
				<a
					href="/plan"
					class="text-sm text-warm-500 hover:text-warm-700 transition-colors font-medium"
				>
					Plan
				</a>
				{#if !data.isProduction}
					<a
						href="/reportar"
						class="bg-brand-800 hover:bg-brand-900 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
					>
						+ Reportar mascota
					</a>
				{:else}
					<span
						class="text-xs font-semibold text-warm-400 border border-dashed border-warm-300 px-3 py-1.5 rounded-full cursor-default"
						title="Reportes disponibles pronto"
					>
						Próximamente
					</span>
				{/if}
			</nav>
		</div>
	</header>

	<main class="flex-1">
		{@render children()}
	</main>

	<footer class="border-t border-warm-200 bg-white mt-16">
		<div
			class="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-warm-500"
		>
			<p>
				🐾 <span class="font-semibold text-warm-700">SC Mascotas</span> — Registro comunitario de mascotas
				perdidas
			</p>
			<p>
				San Cristóbal de las Casas, Chiapas ·
				<a
					href="https://github.com/jesuscovam/scmascotas"
					class="underline hover:text-warm-700 transition-colors"
					target="_blank"
					rel="noopener noreferrer">Código abierto</a
				>
			</p>
		</div>
	</footer>
</div>

<style>
	@keyframes stamp-breathe {
		0%, 100% { opacity: 0.55; }
		50%       { opacity: 1;    }
	}
	.beta-stamp {
		animation: stamp-breathe 4s ease-in-out infinite;
	}
</style>
