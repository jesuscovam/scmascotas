<script lang="ts">
	import '../app.css';
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { onNavigate, goto, invalidateAll } from '$app/navigation';
	import { ModeWatcher } from 'mode-watcher';
	import { NavigationMenu, Button, NotificationBell } from '@scmascotas/ui';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { signOut } from '$lib/auth-client';
	import { page } from '$app/state';
	import InfoIcon from '@lucide/svelte/icons/info';
	import MilestoneIcon from '@lucide/svelte/icons/milestone';
	import ScrollTextIcon from '@lucide/svelte/icons/scroll-text';
	import UserIcon from '@lucide/svelte/icons/user';
	import LogOutIcon from '@lucide/svelte/icons/log-out';

	injectAnalytics({ mode: dev ? 'development' : 'production' });

	let { children, data } = $props();

	const user = $derived(data.user);
	const notifications = $derived(data.notifications ?? []);
	const unreadCount = $derived(data.unreadCount ?? 0);

	let mobileMenuOpen = $state(false);

	async function markNotificationRead(id: string) {
		await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
		await invalidateAll();
	}

	async function markAllNotificationsRead() {
		await fetch('/api/notifications/read-all', { method: 'POST' });
		await invalidateAll();
	}

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
		goto('/', { invalidateAll: true });
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

						<!-- Mascotas -->
						<NavigationMenu.Item>
							<NavigationMenu.Link
								href="/mascotas"
								class="text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 {page.url.pathname === '/mascotas'
									? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
									: 'text-warm-500 dark:text-warm-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20'}"
							>
								<span class="text-base leading-none">🐾</span>
								Mascotas
							</NavigationMenu.Link>
						</NavigationMenu.Item>

						<!-- Avistamientos -->
						<NavigationMenu.Item>
							<NavigationMenu.Link
								href="/avistamientos"
								class="text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 {page.url.pathname === '/avistamientos'
									? 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300'
									: 'text-warm-500 dark:text-warm-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20'}"
							>
								<span class="text-base leading-none">👀</span>
								Avistamientos
							</NavigationMenu.Link>
						</NavigationMenu.Item>

						<!-- Mapa -->
						<NavigationMenu.Item>
							<NavigationMenu.Link
								href="/mapa"
								class="text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 {page.url.pathname.startsWith('/mapa')
									? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
									: 'text-warm-500 dark:text-warm-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20'}"
							>
								<span class="text-base leading-none">🗺️</span>
								Mapa
							</NavigationMenu.Link>
						</NavigationMenu.Item>

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
								<NavigationMenu.Content class="min-w-[220px] right-0 left-auto p-1.5 bg-white dark:bg-warm-900 border border-warm-200 dark:border-warm-700">
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
									<NavigationMenu.Link href="/mis-mascotas">
										<div class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors cursor-pointer">
											<span class="text-base leading-none shrink-0">🐾</span>
											<div>
												<p class="text-sm font-medium text-warm-800 dark:text-warm-100 leading-none">Mis mascotas</p>
												<p class="text-xs text-warm-500 dark:text-warm-400 mt-1">Tus reportes de mascotas perdidas</p>
											</div>
										</div>
									</NavigationMenu.Link>
									<NavigationMenu.Link href="/mis-avistamientos">
										<div class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors cursor-pointer">
											<span class="text-base leading-none shrink-0">👀</span>
											<div>
												<p class="text-sm font-medium text-warm-800 dark:text-warm-100 leading-none">Mis avistamientos</p>
												<p class="text-xs text-warm-500 dark:text-warm-400 mt-1">Mascotas que has reportado ver</p>
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

				{#if user}
					<NotificationBell
						{notifications}
						{unreadCount}
						onMarkRead={markNotificationRead}
						onMarkAllRead={markAllNotificationsRead}
					/>
				{/if}

				<Button.Root
					href="/reportar"
					class="rounded-full text-sm font-semibold px-4 py-2"
				>
					+ Reportar mascota
				</Button.Root>
			</nav>

			<!-- Mobile right cluster: bell + theme -->
			<div class="flex md:hidden items-center gap-1">
				{#if user}
					<NotificationBell
						{notifications}
						{unreadCount}
						onMarkRead={markNotificationRead}
						onMarkAllRead={markAllNotificationsRead}
					/>
				{/if}
				<ThemeToggle />
			</div>

			<div class="hidden md:block">
				<ThemeToggle />
			</div>

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
						href="/mascotas"
						class="flex items-center gap-2 text-sm font-semibold rounded-lg px-3 py-2.5 transition-colors {page.url.pathname === '/mascotas'
							? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
							: 'text-warm-700 dark:text-warm-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-300'}"
					>
						🐾 Mascotas perdidas
					</a>
					<a
						href="/avistamientos"
						class="flex items-center gap-2 text-sm font-semibold rounded-lg px-3 py-2.5 transition-colors {page.url.pathname === '/avistamientos'
							? 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300'
							: 'text-warm-700 dark:text-warm-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-700 dark:hover:text-teal-300'}"
					>
						👀 Avistamientos
					</a>
					<a
						href="/mapa"
						class="flex items-center gap-2 text-sm font-semibold rounded-lg px-3 py-2.5 transition-colors {page.url.pathname.startsWith('/mapa')
							? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
							: 'text-warm-700 dark:text-warm-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-300'}"
					>
						🗺️ Mapa
					</a>
					<div class="my-1 h-px bg-warm-100 dark:bg-warm-800"></div>
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
							🐾 Mis mascotas
						</a>
						<a
							href="/mis-avistamientos"
							class="text-sm font-medium text-warm-700 dark:text-warm-300 hover:text-warm-900 dark:hover:text-warm-50 hover:bg-warm-100 dark:hover:bg-warm-800 rounded-lg px-3 py-2.5 transition-colors"
						>
							👀 Mis avistamientos
						</a>
						<a
							href="/cuenta/notificaciones"
							class="flex items-center justify-between text-sm font-medium text-warm-700 dark:text-warm-300 hover:text-warm-900 dark:hover:text-warm-50 hover:bg-warm-100 dark:hover:bg-warm-800 rounded-lg px-3 py-2.5 transition-colors"
						>
							<span>🔔 Notificaciones</span>
							{#if unreadCount > 0}
								<span class="min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 dark:bg-amber-400 text-[10px] font-bold text-white dark:text-warm-900 flex items-center justify-center tabular-nums">
									{unreadCount > 9 ? '9+' : unreadCount}
								</span>
							{/if}
						</a>
						<a
							href="/perfil"
							class="text-sm font-medium text-warm-700 dark:text-warm-300 hover:text-warm-900 dark:hover:text-warm-50 hover:bg-warm-100 dark:hover:bg-warm-800 rounded-lg px-3 py-2.5 transition-colors"
						>
							Mi perfil
						</a>
					{/if}
					<div class="pt-2 pb-1 flex flex-col gap-2">
						<Button.Root
							href="/reportar"
							class="w-full rounded-full text-sm font-semibold px-4 py-2.5"
						>
							+ Reportar mascota
						</Button.Root>
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

	<footer class="border-t border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-900/80 mt-16">
		<div class="h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent dark:via-amber-600/20"></div>
		<div class="max-w-5xl mx-auto px-4 py-7">
			<div class="flex flex-col items-center gap-5 sm:flex-row sm:justify-between sm:gap-3">

				<!-- Brand -->
				<div class="flex flex-col items-center gap-0.5 sm:items-start">
					<div class="flex items-center gap-1.5">
						<span class="text-base leading-none">🐾</span>
						<span class="font-display font-bold text-warm-800 dark:text-warm-100 text-sm tracking-tight">SC Mascotas</span>
					</div>
					<p class="text-xs text-warm-400 dark:text-warm-500">Registro comunitario de mascotas perdidas</p>
				</div>

				<!-- Made with love -->
				<p class="text-xs text-warm-400 dark:text-warm-500 text-center leading-relaxed">
					Hecho con <span class="text-red-400">❤️</span> desde<br class="sm:hidden" />
					<span class="text-warm-500 dark:text-warm-400 font-medium"> San Cristóbal de las Casas, Chiapas</span>
				</p>

				<!-- GitHub -->
				<a
					href="https://github.com/jesuscovam/scmascotas"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-1.5 text-xs font-medium text-warm-500 dark:text-warm-400 hover:text-warm-800 dark:hover:text-warm-100 border border-warm-200 dark:border-warm-700 hover:border-warm-400 dark:hover:border-warm-500 bg-white dark:bg-warm-800 rounded-full px-3 py-1.5 transition-all shadow-sm hover:shadow"
				>
					<svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
						<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
					</svg>
					Código abierto
				</a>

			</div>
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
