<script lang="ts">
	import { page } from '$app/stores';
	import { Button, Card, ShareButton } from '@scmascotas/ui';

	const slug = $derived($page.params.slug ?? '');
	const token = $derived($page.url.searchParams.get('token') ?? '');
	const shareUrl = $derived(`${$page.url.origin}/mascota/${slug}`);
	const siteUrl = $derived($page.url.origin ?? '');
	const signedIn = $derived(!!$page.data.user);

	let copied = $state(false);
	let copiedLink = $state(false);

	async function copyToken() {
		await navigator.clipboard.writeText(token);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	async function copyLink() {
		await navigator.clipboard.writeText(shareUrl);
		copiedLink = true;
		setTimeout(() => (copiedLink = false), 2000);
	}
</script>

<div class="max-w-lg mx-auto px-4 py-16 flex flex-col items-center text-center gap-8">
	<!-- Success icon -->
	<div class="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-4xl">
		✅
	</div>

	<div class="flex flex-col gap-2">
		<h1 class="font-display text-3xl font-bold text-warm-900 dark:text-warm-50">¡Reporte publicado!</h1>
		<p class="text-warm-500 dark:text-warm-400">
			Tu reporte ya es visible para toda la comunidad. Esperamos que encuentres a tu mascota pronto. 🐾
		</p>
	</div>

	<!-- Edit token -->
	<Card.Root class="w-full bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700">
		<Card.Content class="pt-6 pb-6 flex flex-col gap-4 text-left">
			<div class="flex items-start gap-3">
				<span class="text-2xl shrink-0">🔑</span>
				<div>
					<p class="font-semibold text-warm-900 dark:text-warm-50 text-sm">Código de edición</p>
					<p class="text-xs text-warm-500 dark:text-warm-400 mt-1">
						Guarda este código — es la única forma de editar o eliminar tu reporte más adelante.
					</p>
				</div>
			</div>

			<div class="flex items-center gap-2">
				<code class="flex-1 bg-white dark:bg-warm-800 border border-amber-200 dark:border-warm-600 rounded-xl px-4 py-2.5 text-sm font-mono text-warm-900 dark:text-warm-50 break-all">
					{token}
				</code>
				<Button.Root
					onclick={copyToken}
					class="shrink-0 rounded-xl px-3 h-auto py-2.5 text-xs"
				>
					{copied ? '✓' : 'Copiar'}
				</Button.Root>
			</div>

			<p class="text-xs text-amber-700 dark:text-amber-400 font-medium">
				⚠️ No compartas este código con nadie. Sin él, no podrás modificar el reporte.
			</p>
		</Card.Content>
	</Card.Root>

	<!-- Share -->
	<Card.Root class="w-full border-warm-200 dark:border-warm-700">
		<Card.Content class="pt-6 pb-6 flex flex-col gap-4 text-left">
			<p class="font-semibold text-warm-900 dark:text-warm-50 text-sm">Comparte el reporte</p>
			<div class="flex items-center gap-2">
				<input
					type="text"
					readonly
					value={shareUrl}
					class="flex-1 border border-warm-200 dark:border-warm-600 rounded-xl px-4 py-2.5 text-sm bg-warm-50 dark:bg-warm-900 text-warm-700 dark:text-warm-200 select-all"
				/>
				<Button.Root
					variant="secondary"
					onclick={copyLink}
					class="shrink-0 rounded-xl px-3 h-auto py-2.5 text-xs"
				>
					{copiedLink ? '✓' : 'Copiar'}
				</Button.Root>
			</div>
			<ShareButton petSlug={slug} petName={null} petType={'dog' as const} {siteUrl} />
		</Card.Content>
	</Card.Root>

	<!-- Alerts confirmation (signed-in) / nudge (anonymous) -->
	{#if signedIn}
		<div class="w-full flex items-start gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl px-5 py-4">
			<svg class="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
			<div>
				<p class="text-sm font-semibold text-green-800 dark:text-green-200">Las alertas ya están activas</p>
				<p class="text-xs text-green-700/70 dark:text-green-400/70 mt-0.5 leading-relaxed">
					Te avisaremos por correo si alguien reporta un avistamiento de tu mascota. Puedes ajustar las alertas en
					<a href="/mascota/{slug}/editar" class="underline hover:text-green-900 dark:hover:text-green-200 transition-colors">el reporte</a>.
				</p>
			</div>
		</div>
	{:else}
		<Card.Root class="w-full bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/15 dark:to-warm-800 border-amber-200 dark:border-amber-700">
			<Card.Content class="pt-6 pb-6 flex flex-col gap-3 text-left">
				<div class="flex items-start gap-3">
					<span class="text-2xl shrink-0">🔔</span>
					<div>
						<p class="font-semibold text-warm-900 dark:text-warm-50 text-sm">Recibe alertas de avistamientos</p>
						<p class="text-xs text-warm-500 dark:text-warm-400 mt-1 leading-relaxed">
							Crea tu cuenta y reclama este reporte con tu código de edición para que te avisemos por correo
							cuando alguien vea a tu mascota.
						</p>
					</div>
				</div>
				<Button.Root href="/login" class="rounded-xl text-sm font-semibold self-start px-5">
					Iniciar sesión para recibir alertas
				</Button.Root>
			</Card.Content>
		</Card.Root>
	{/if}

	<div class="flex flex-col sm:flex-row gap-3 w-full">
		<Button.Root
			href="/mascota/{slug}"
			class="flex-1 rounded-xl py-3 px-6 h-auto"
		>
			Ver mi reporte →
		</Button.Root>
		<Button.Root
			href="/"
			variant="outline"
			class="flex-1 rounded-xl py-3 px-6 h-auto"
		>
			Volver al inicio
		</Button.Root>
	</div>
</div>
