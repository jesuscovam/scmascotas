<script lang="ts">
	import { page } from '$app/stores';
	import { Button, Card, ShareButton } from '@scmascotas/ui';

	const slug = $derived($page.params.slug ?? '');
	const token = $derived($page.url.searchParams.get('token') ?? '');
	const shareUrl = $derived(`${$page.url.origin}/mascota/${slug}`);
	const siteUrl = $derived($page.url.origin ?? '');

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
