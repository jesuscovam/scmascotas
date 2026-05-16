<script lang="ts">
	import { page } from '$app/stores';

	const slug = $derived($page.params.slug);
	const token = $derived($page.url.searchParams.get('token') ?? '');
	const shareUrl = $derived(`${$page.url.origin}/mascota/${slug}`);

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
	<div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl">
		✅
	</div>

	<div class="flex flex-col gap-2">
		<h1 class="font-display text-3xl font-bold text-warm-900">¡Reporte publicado!</h1>
		<p class="text-warm-500">
			Tu reporte ya es visible para toda la comunidad. Esperamos que encuentres a tu mascota pronto. 🐾
		</p>
	</div>

	<!-- Edit token -->
	<div class="w-full bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col gap-4 text-left">
		<div class="flex items-start gap-3">
			<span class="text-2xl shrink-0">🔑</span>
			<div>
				<p class="font-semibold text-warm-900 text-sm">Código de edición</p>
				<p class="text-xs text-warm-500 mt-1">
					Guarda este código — es la única forma de editar o eliminar tu reporte más adelante.
				</p>
			</div>
		</div>

		<div class="flex items-center gap-2">
			<code class="flex-1 bg-white border border-amber-200 rounded-xl px-4 py-2.5 text-sm font-mono text-warm-900 break-all">
				{token}
			</code>
			<button
				onclick={copyToken}
				class="shrink-0 bg-brand-800 hover:bg-brand-900 text-white text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors"
			>
				{copied ? '✓' : 'Copiar'}
			</button>
		</div>

		<p class="text-xs text-amber-700 font-medium">
			⚠️ No compartas este código con nadie. Sin él, no podrás modificar el reporte.
		</p>
	</div>

	<!-- Share -->
	<div class="w-full bg-white border border-warm-200 rounded-2xl p-6 flex flex-col gap-4 text-left">
		<p class="font-semibold text-warm-900 text-sm">Comparte el reporte</p>
		<div class="flex items-center gap-2">
			<input
				type="text"
				readonly
				value={shareUrl}
				class="flex-1 border border-warm-200 rounded-xl px-4 py-2.5 text-sm bg-warm-50 text-warm-700 select-all"
			/>
			<button
				onclick={copyLink}
				class="shrink-0 bg-warm-100 hover:bg-warm-200 text-warm-700 text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors"
			>
				{copiedLink ? '✓' : 'Copiar'}
			</button>
		</div>
	</div>

	<div class="flex flex-col sm:flex-row gap-3 w-full">
		<a
			href="/mascota/{slug}"
			class="flex-1 bg-brand-800 hover:bg-brand-900 text-white font-semibold py-3 px-6 rounded-xl text-center transition-colors"
		>
			Ver mi reporte →
		</a>
		<a
			href="/"
			class="flex-1 bg-white hover:bg-warm-50 text-warm-700 border border-warm-200 font-semibold py-3 px-6 rounded-xl text-center transition-colors"
		>
			Volver al inicio
		</a>
	</div>
</div>
