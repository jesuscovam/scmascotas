<script lang="ts">
	import '../app.css';
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { onNavigate, invalidateAll, goto } from '$app/navigation';
	import { ModeWatcher } from 'mode-watcher';
	import { NavigationMenu, Button } from '@scmascotas/ui';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { signOut } from '$lib/auth-client';
	import InfoIcon from '@lucide/svelte/icons/info';
	import MilestoneIcon from '@lucide/svelte/icons/milestone';
	import ScrollTextIcon from '@lucide/svelte/icons/scroll-text';
	import UserIcon from '@lucide/svelte/icons/user';
	import LogOutIcon from '@lucide/svelte/icons/log-out';

	injectAnalytics({ mode: dev ? 'development' : 'production' });

	let { children, data } = $props();

	const user = $derived(data.user);

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

	async function handleSignOut() {
		await signOut();
		await invalidateAll();
		goto('/');
	}
</script>

<ModeWatcher />

<div class="min-h-screen flex flex-col">
	<header class="border-b border-warm-200 dark:border-warm-700 bg-white/80 dark:bg-warm-900/80 backdrop-blur-sm sticky top-0 z-50">
		<div class="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
			<!-- Logo -->
			<a href="/" class="flex items-center gap-2 group shrink-0">
				<span class="text-2xl">🐾</span>
				<span
					class="font-display font-bold text-brand-900 dark:text-brand-700 text-xl tracking-tight group-hover:text-brand-700 dark:group-hover:text-brand-500 transition-colors whitespace-nowrap"
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
			<nav class="hidden md:flex items-center gap-2">
				<NavigationMenu.Root viewport={false}>
					<NavigationMenu.List class="flex items-center gap-1">

						<!-- Mis mascotas: direct link, user only -->
						{#if user}
							<NavigationMenu.Item>
								<NavigationMenu.Link
									href="/mis-mascotas"
									class="text-sm text-warm-500 dark:text-warm-400 hover:text-warm-700 dark:hover:text-warm-100 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-warm-100 dark:hover:bg-warm-800"
								>
									Mis mascotas
								</NavigationMenu.Link>
							</NavigationMenu.Item>
						{/if}

						<!-- Plataforma group: Acerca, Plan, Cambios -->
						<NavigationMenu.Item>
							<NavigationMenu.Trigger
								class="text-sm text-warm-500 dark:text-warm-400 hover:text-warm-700 dark:hover:text-warm-100 hover:bg-warm-100 dark:hover:bg-warm-800 data-open:bg-warm-100 dark:data-open:bg-warm-800 data-open:text-warm-700 dark:data-open:text-warm-100 transition-colors font-medium"
							>
								Plataforma
							</NavigationMenu.Trigger>
							<NavigationMenu.Content class="min-w-[260px] p-1.5 bg-white dark:bg-warm-900 border border-warm-200 dark:border-warm-700">
								<NavigationMenu.Link href="/acerca">
									<div class="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-warm-50 dark:hover:bg-warm-800 transition-colors cursor-pointer">
										<InfoIcon class="size-4 mt-0.5 shrink-0 text-warm-500 dark:text-warm-400" />
										<div>
											<p class="text-sm font-medium text-warm-800 dark:text-warm-100 leading-none">Acerca</p>
											<p class="text-xs text-warm-500 dark:text-warm-400 mt-1">Conoce el proyecto y cómo funciona</p>
										</div>
									</div>
								</NavigationMenu.Link>
								<NavigationMenu.Link href="/plan">
									<div class="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-warm-50 dark:hover:bg-warm-800 transition-colors cursor-pointer">
										<MilestoneIcon class="size-4 mt-0.5 shrink-0 text-warm-500 dark:text-warm-400" />
										<div>
											<p class="text-sm font-medium text-warm-800 dark:text-warm-100 leading-none">Camino hacia v1</p>
											<p class="text-xs text-warm-500 dark:text-warm-400 mt-1">Ver las opciones disponibles</p>
										</div>
									</div>
								</NavigationMenu.Link>
								<NavigationMenu.Link href="/cambios">
									<div class="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-warm-50 dark:hover:bg-warm-800 transition-colors cursor-pointer">
										<ScrollTextIcon class="size-4 mt-0.5 shrink-0 text-warm-500 dark:text-warm-400" />
										<div>
											<p class="text-sm font-medium text-warm-800 dark:text-warm-100 leading-none">Cambios</p>
											<p class="text-xs text-warm-500 dark:text-warm-400 mt-1">Novedades y actualizaciones recientes</p>
										</div>
									</div>
								</NavigationMenu.Link>
							</NavigationMenu.Content>
						</NavigationMenu.Item>

					</NavigationMenu.List>
				</NavigationMenu.Root>

				<!-- Account: Mi cuenta dropdown (logged in) or Iniciar sesión -->
				{#if user}
					<NavigationMenu.Root viewport={false}>
						<NavigationMenu.List>
							<NavigationMenu.Item>
								<NavigationMenu.Trigger
									class="text-sm text-warm-500 dark:text-warm-400 hover:text-warm-700 dark:hover:text-warm-100 hover:bg-warm-100 dark:hover:bg-warm-800 data-open:bg-warm-100 dark:data-open:bg-warm-800 data-open:text-warm-700 dark:data-open:text-warm-100 transition-colors font-medium"
								>
									Mi cuenta
								</NavigationMenu.Trigger>
								<NavigationMenu.Content class="min-w-[200px] right-0 left-auto p-1.5 bg-white dark:bg-warm-900 border border-warm-200 dark:border-warm-700">
									<NavigationMenu.Link href="/perfil">
										<div class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-warm-50 dark:hover:bg-warm-800 transition-colors cursor-pointer">
											<UserIcon class="size-4 shrink-0 text-warm-500 dark:text-warm-400" />
											<div>
												<p class="text-sm font-medium text-warm-800 dark:text-warm-100 leading-none">Mi perfil</p>
												<p class="text-xs text-warm-500 dark:text-warm-400 mt-1">Editar tu información</p>
											</div>
										</div>
									</NavigationMenu.Link>
									<div class="my-1 h-px bg-warm-100 dark:bg-warm-800 mx-2"></div>
									<button
										onclick={handleSignOut}
										class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
									>
										<LogOutIcon class="size-4 shrink-0 text-warm-500 dark:text-warm-400" />
										<p class="text-sm font-medium text-warm-600 dark:text-warm-300 hover:text-red-600 dark:hover:text-red-400 transition-colors leading-none">Salir</p>
									</button>
								</NavigationMenu.Content>
							</NavigationMenu.Item>
						</NavigationMenu.List>
					</NavigationMenu.Root>
				{:else}
					<a
						href="/login"
						class="text-sm text-warm-500 dark:text-warm-400 hover:text-warm-700 dark:hover:text-warm-100 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-warm-100 dark:hover:bg-warm-800"
					>
						Iniciar sesión
					</a>
				{/if}

				{#if !data.isProduction}
					<Button.Root
						href="/reportar"
						class="rounded-full text-sm font-semibold px-4 py-2"
					>
						+ Reportar mascota
					</Button.Root>
				{:else}
					<span
						class="text-xs font-semibold text-warm-400 border border-dashed border-warm-300 dark:border-warm-600 px-3 py-1.5 rounded-full cursor-default"
						title="Reportes disponibles pronto"
					>
						Próximamente
					</span>
				{/if}
			</nav>

			<ThemeToggle />

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
			<div class="md:hidden border-t border-warm-200 dark:border-warm-700 bg-white/95 dark:bg-warm-900/95 backdrop-blur-sm mobile-menu">
				<nav class="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-1">
					<a
						href="/acerca"
						class="text-sm font-medium text-warm-700 dark:text-warm-300 hover:text-warm-900 dark:hover:text-warm-50 hover:bg-warm-100 dark:hover:bg-warm-800 rounded-lg px-3 py-2.5 transition-colors"
					>
						Acerca
					</a>
					<a
						href="/cambios"
						class="text-sm font-medium text-warm-700 dark:text-warm-300 hover:text-warm-900 dark:hover:text-warm-50 hover:bg-warm-100 dark:hover:bg-warm-800 rounded-lg px-3 py-2.5 transition-colors"
					>
						Cambios
					</a>
					<a
						href="/plan"
						class="text-sm font-medium text-warm-700 dark:text-warm-300 hover:text-warm-900 dark:hover:text-warm-50 hover:bg-warm-100 dark:hover:bg-warm-800 rounded-lg px-3 py-2.5 transition-colors"
					>
						Plan
					</a>
					{#if user}
						<a
							href="/mis-mascotas"
							class="text-sm font-medium text-warm-700 dark:text-warm-300 hover:text-warm-900 dark:hover:text-warm-50 hover:bg-warm-100 dark:hover:bg-warm-800 rounded-lg px-3 py-2.5 transition-colors"
						>
							Mis mascotas
						</a>
						<a
							href="/perfil"
							class="text-sm font-medium text-warm-700 dark:text-warm-300 hover:text-warm-900 dark:hover:text-warm-50 hover:bg-warm-100 dark:hover:bg-warm-800 rounded-lg px-3 py-2.5 transition-colors"
						>
							Mi perfil
						</a>
					{/if}
					<div class="pt-2 pb-1 flex flex-col gap-2">
						{#if !data.isProduction}
							<Button.Root
								href="/reportar"
								class="w-full rounded-full text-sm font-semibold px-4 py-2.5"
							>
								+ Reportar mascota
							</Button.Root>
						{:else}
							<span
								class="block w-full text-center text-xs font-semibold text-warm-400 border border-dashed border-warm-300 dark:border-warm-600 px-3 py-2.5 rounded-full cursor-default"
							>
								Próximamente
							</span>
						{/if}
						{#if user}
							<button
								onclick={handleSignOut}
								class="w-full text-center text-sm font-medium text-warm-500 dark:text-warm-400 hover:text-warm-900 dark:hover:text-warm-50 hover:bg-warm-100 dark:hover:bg-warm-800 rounded-lg px-3 py-2.5 transition-colors"
							>
								Salir
							</button>
						{:else}
							<a
								href="/login"
								class="block text-center text-sm font-medium text-warm-700 dark:text-warm-300 hover:text-warm-900 dark:hover:text-warm-50 hover:bg-warm-100 dark:hover:bg-warm-800 rounded-lg px-3 py-2.5 transition-colors"
							>
								Iniciar sesión
							</a>
						{/if}
					</div>
				</nav>
			</div>
		{/if}
	</header>

	<main class="flex-1">
		{@render children()}
	</main>

	<footer class="border-t border-warm-200 dark:border-warm-700 bg-white dark:bg-warm-900 mt-16">
		<div
			class="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-warm-500 dark:text-warm-400"
		>
			<p>
				🐾 <span class="font-semibold text-warm-700 dark:text-warm-200">SC Mascotas</span> — Registro comunitario de mascotas
				perdidas
			</p>
			<p>
				San Cristóbal de las Casas, Chiapas ·
				<a
					href="https://github.com/jesuscovam/scmascotas"
					class="underline hover:text-warm-700 dark:hover:text-warm-200 transition-colors"
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
