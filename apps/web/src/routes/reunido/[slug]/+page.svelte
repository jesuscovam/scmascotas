<script lang="ts">
	let { data } = $props();
	const pet = $derived(data.pet);
	const primaryPhoto = $derived(pet.photos?.[0]);

	const typeLabel = $derived(
		pet.type === 'dog' ? 'perro' : pet.type === 'cat' ? 'gata' : 'mascota'
	);

	const typeEmoji = $derived(
		pet.type === 'dog' ? '🐶' : pet.type === 'cat' ? '🐱' : '🐾'
	);

	const headline = $derived(
		pet.name ? `¡${pet.name} fue encontrada!` : `¡Una ${typeLabel} fue encontrada!`
	);

	function formatDate(d: string | Date): string {
		return new Intl.DateTimeFormat('es-MX', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(new Date(d));
	}

	let shareUrl = $derived(
		typeof window !== 'undefined' ? `${window.location.origin}/reunido/${pet.slug}` : `/reunido/${pet.slug}`
	);

	let copied = $state(false);

	async function share() {
		if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
			try {
				await navigator.share({
					title: headline,
					text: `${headline} Gracias a todos los que ayudaron en San Cristóbal.`,
					url: shareUrl
				});
				return;
			} catch (e) {
				if (e instanceof Error && e.name === 'AbortError') return;
			}
		}
		await navigator.clipboard.writeText(shareUrl).catch(() => {});
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="min-h-screen relative overflow-hidden">
	<!-- Warm celebration background -->
	<div class="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-green-50 dark:from-warm-900 dark:via-amber-950 dark:to-green-950"></div>
	<!-- Subtle radial glow -->
	<div class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-amber-200/30 dark:bg-amber-500/10 blur-3xl pointer-events-none"></div>
	<div class="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-green-200/20 dark:bg-green-500/10 blur-3xl pointer-events-none"></div>

	<div class="relative max-w-lg mx-auto px-4 py-12 flex flex-col items-center gap-8 text-center">
		<!-- Celebration badge -->
		<div class="inline-flex items-center gap-2 bg-white dark:bg-warm-800 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm animate-bounce-gentle">
			<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
				<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
			</svg>
			¡Reunidos!
		</div>

		<!-- Big emoji + photo -->
		<div class="relative">
			{#if primaryPhoto}
				<div class="w-40 h-40 rounded-full overflow-hidden border-4 border-white dark:border-warm-700 shadow-xl">
					<img src={primaryPhoto.url} alt={pet.name ?? 'Mascota'} class="w-full h-full object-cover" />
				</div>
				<div class="absolute -bottom-2 -right-2 text-4xl filter drop-shadow-md">🎉</div>
			{:else}
				<div class="w-32 h-32 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-6xl border-4 border-white dark:border-warm-700 shadow-xl">
					{typeEmoji}
				</div>
				<div class="absolute -bottom-2 -right-2 text-4xl filter drop-shadow-md">🎉</div>
			{/if}
		</div>

		<!-- Headline -->
		<div class="flex flex-col gap-2">
			<h1 class="font-display text-3xl sm:text-4xl font-bold text-warm-900 dark:text-warm-50 leading-tight">
				{headline}
			</h1>
			{#if pet.reunitedAt}
				<p class="text-warm-500 dark:text-warm-400 text-sm">
					Reunido el <span class="font-semibold text-warm-700 dark:text-warm-300">{formatDate(pet.reunitedAt)}</span>
				</p>
			{/if}
		</div>

		<!-- Thank you message -->
		<div class="bg-white/70 dark:bg-warm-800/60 backdrop-blur-sm border border-warm-200/60 dark:border-warm-700 rounded-2xl px-6 py-5 shadow-sm">
			<p class="text-warm-700 dark:text-warm-300 text-sm leading-relaxed">
				Gracias a todos los vecinos de San Cristóbal que compartieron el reporte y mantuvieron los ojos abiertos.
				<span class="font-semibold">La comunidad hace la diferencia.</span> 🐾❤️
			</p>
		</div>

		<!-- Actions -->
		<div class="flex flex-col sm:flex-row gap-3 w-full">
			<a
				href="/"
				class="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-warm-800 hover:bg-warm-50 dark:hover:bg-warm-700 border border-warm-200 dark:border-warm-600 text-warm-800 dark:text-warm-200 font-semibold text-sm px-5 py-3 rounded-2xl transition-all shadow-sm"
			>
				Ver reportes activos
			</a>
			<button
				onclick={share}
				class="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold text-sm px-5 py-3 rounded-2xl transition-all shadow-sm active:scale-95"
			>
				{#if copied}
					<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="20 6 9 17 4 12" />
					</svg>
					¡Copiado!
				{:else}
					<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
						<line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
					</svg>
					Compartir
				{/if}
			</button>
		</div>

		<!-- CTA -->
		<div class="pt-4 border-t border-warm-200/60 dark:border-warm-700 w-full">
			<p class="text-warm-400 dark:text-warm-500 text-sm">
				¿Tienes una mascota perdida?
				<a href="/reportar" class="text-amber-700 dark:text-amber-400 font-semibold hover:underline underline-offset-2 transition-colors">
					Publícalo aquí →
				</a>
			</p>
		</div>
	</div>
</div>

<style>
	@keyframes bounce-gentle {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-4px); }
	}
	.animate-bounce-gentle {
		animation: bounce-gentle 2.5s ease-in-out infinite;
	}
</style>
