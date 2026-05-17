<script lang="ts">
	import '../app.css';
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { onNavigate } from '$app/navigation';
	import { NavigationMenu } from '@scmascotas/ui';

	injectAnalytics({ mode: dev ? 'development' : 'production' });

	let { children, data } = $props();

	let mobileMenuOpen = $state(false);

	onNavigate((navigation) => {
		mobileMenuOpen = false;
		if (!document.startViewTransition) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<div class="min-h-screen flex flex-col bg-warm-50">
	<header class="border-b border-warm-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
		<div class="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
			<!-- Logo -->
			<a href="/" class="flex items-center gap-2 group shrink-0">
				<span class="text-2xl">🐾</span>
				<span
					class="font-display font-bold text-brand-900 text-xl tracking-tight group-hover:text-brand-700 transition-colors whitespace-nowrap"
				>
					SC Mascotas
				</span>
				<span
					class="beta-stamp self-start mt-[5px] inline-block px-[5px] py-[2px] border border-amber-600/55 text-amber-700/75 text-[7.5px] font-mono font-bold uppercase tracking-[0.2em] select-none pointer-events-none"
					style="transform: rotate(-9deg); box-shadow: inset 0 0 0 1px rgba(180,100,20,0.12);"
				>
					beta
				</span>
			</a>

			<!-- Desktop nav -->
			<nav class="hidden md:flex items-center gap-4">
				<NavigationMenu.Root viewport={false}>
					<NavigationMenu.List class="flex items-center gap-1">
						<NavigationMenu.Item>
							<NavigationMenu.Link
								href="/acerca"
								class="text-sm text-warm-500 hover:text-warm-700 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-warm-100"
							>
								Acerca
							</NavigationMenu.Link>
						</NavigationMenu.Item>
						<NavigationMenu.Item>
							<NavigationMenu.Link
								href="/cambios"
								class="text-sm text-warm-500 hover:text-warm-700 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-warm-100"
							>
								Cambios
							</NavigationMenu.Link>
						</NavigationMenu.Item>
						<NavigationMenu.Item>
							<NavigationMenu.Link
								href="/plan"
								class="text-sm text-warm-500 hover:text-warm-700 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-warm-100"
							>
								Plan
							</NavigationMenu.Link>
						</NavigationMenu.Item>
					</NavigationMenu.List>
				</NavigationMenu.Root>

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

			<!-- Mobile hamburger -->
			<button
				class="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-warm-600 hover:text-warm-900 hover:bg-warm-100 transition-colors"
				aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
				aria-expanded={mobileMenuOpen}
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
			>
				{#if mobileMenuOpen}
					<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
						<line x1="2" y1="2" x2="16" y2="16" />
						<line x1="16" y1="2" x2="2" y2="16" />
					</svg>
				{:else}
					<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
						<line x1="2" y1="5" x2="16" y2="5" />
						<line x1="2" y1="9" x2="16" y2="9" />
						<line x1="2" y1="13" x2="16" y2="13" />
					</svg>
				{/if}
			</button>
		</div>

		<!-- Mobile menu panel -->
		{#if mobileMenuOpen}
			<div class="md:hidden border-t border-warm-200 bg-white/95 backdrop-blur-sm mobile-menu">
				<nav class="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-1">
					<a
						href="/acerca"
						class="text-sm font-medium text-warm-700 hover:text-warm-900 hover:bg-warm-100 rounded-lg px-3 py-2.5 transition-colors"
					>
						Acerca
					</a>
					<a
						href="/cambios"
						class="text-sm font-medium text-warm-700 hover:text-warm-900 hover:bg-warm-100 rounded-lg px-3 py-2.5 transition-colors"
					>
						Cambios
					</a>
					<a
						href="/plan"
						class="text-sm font-medium text-warm-700 hover:text-warm-900 hover:bg-warm-100 rounded-lg px-3 py-2.5 transition-colors"
					>
						Plan
					</a>
					<div class="pt-2 pb-1">
						{#if !data.isProduction}
							<a
								href="/reportar"
								class="block w-full text-center bg-brand-800 hover:bg-brand-900 text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-colors"
							>
								+ Reportar mascota
							</a>
						{:else}
							<span
								class="block w-full text-center text-xs font-semibold text-warm-400 border border-dashed border-warm-300 px-3 py-2.5 rounded-full cursor-default"
							>
								Próximamente
							</span>
						{/if}
					</div>
				</nav>
			</div>
		{/if}
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

	@keyframes menu-slide-down {
		from { opacity: 0; transform: translateY(-6px); }
		to   { opacity: 1; transform: translateY(0); }
	}
	.mobile-menu {
		animation: menu-slide-down 0.15s ease-out;
	}
</style>
