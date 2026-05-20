<script lang="ts">
	type Props = {
		petSlug: string;
		petName: string | null;
		petType: 'dog' | 'cat' | 'other';
		siteUrl: string;
		fbGroupId?: string;
	};

	let { petSlug, petName, petType, siteUrl, fbGroupId = '' }: Props = $props();

	let showFallback = $state(false);
	let copied = $state(false);

	const typeLabel = $derived(
		petType === 'dog' ? 'perro' : petType === 'cat' ? 'gato' : 'mascota'
	);
	const url = $derived(`${siteUrl}/mascota/${petSlug}`);
	const shareTitle = $derived(`Mascota perdida: ${petName ?? typeLabel}`);
	const shareText = $derived(
		`¡Ayuda a encontrar a ${petName ?? typeLabel}! Ver reporte: ${url}`
	);

	async function share() {
		if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
			try {
				await navigator.share({ title: shareTitle, text: shareText, url });
				return;
			} catch (e) {
				if (e instanceof Error && e.name === 'AbortError') return;
			}
		}
		showFallback = true;
	}

	async function copyLink() {
		await navigator.clipboard.writeText(url);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function close(e?: MouseEvent) {
		if (!e || e.target === e.currentTarget) {
			showFallback = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') showFallback = false;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<button
	onclick={share}
	class="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold text-sm px-5 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95"
>
	<svg
		class="w-4 h-4"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<circle cx="18" cy="5" r="3" />
		<circle cx="6" cy="12" r="3" />
		<circle cx="18" cy="19" r="3" />
		<line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
		<line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
	</svg>
	Compartir reporte
</button>

{#if showFallback}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
		style="background:rgba(0,0,0,0.55);backdrop-filter:blur(6px)"
		role="dialog"
		aria-modal="true"
		aria-label="Compartir reporte"
		onclick={close}
	>
		<!-- Modal card — stop propagation so clicking inside doesn't close -->
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div
			class="w-full max-w-md bg-white dark:bg-warm-800 rounded-3xl shadow-2xl flex flex-col gap-5 overflow-hidden"
			onclick={(e) => e.stopPropagation()}
		>
			<!-- Header -->
			<div
				class="flex items-start justify-between px-6 pt-6 pb-0"
			>
				<div>
					<h3 class="font-display font-semibold text-warm-900 dark:text-warm-50 text-lg">
						Compartir reporte
					</h3>
					<p class="text-xs text-warm-500 dark:text-warm-400 mt-0.5">
						Ayuda a correr la voz
					</p>
				</div>
				<button
					onclick={() => (showFallback = false)}
					class="w-8 h-8 flex items-center justify-center text-warm-400 hover:text-warm-700 dark:hover:text-warm-200 rounded-full hover:bg-warm-100 dark:hover:bg-warm-700 transition-colors"
					aria-label="Cerrar"
				>
					<svg
						class="w-5 h-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>

			<div class="flex flex-col gap-4 px-6 pb-6">
				<!-- URL + copy -->
				<div class="flex flex-col gap-1.5">
					<span class="text-xs font-semibold text-warm-500 dark:text-warm-400 uppercase tracking-wider"
						>Enlace del reporte</span
					>
					<div class="flex gap-2">
						<input
							type="text"
							readonly
							value={url}
							onclick={(e) => (e.target as HTMLInputElement).select()}
							class="flex-1 min-w-0 border border-warm-200 dark:border-warm-600 rounded-xl px-4 py-2.5 text-sm bg-warm-50 dark:bg-warm-900 text-warm-700 dark:text-warm-200 select-all cursor-text"
						/>
						<button
							onclick={copyLink}
							class="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all
								{copied
								? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
								: 'bg-warm-100 dark:bg-warm-700 hover:bg-warm-200 dark:hover:bg-warm-600 text-warm-800 dark:text-warm-200'}"
						>
							{#if copied}
								<svg
									class="w-4 h-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<polyline points="20 6 9 17 4 12" />
								</svg>
								Copiado
							{:else}
								<svg
									class="w-4 h-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
									<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
								</svg>
								Copiar
							{/if}
						</button>
					</div>
				</div>

				<!-- Share text -->
				<div class="flex flex-col gap-1.5">
					<span class="text-xs font-semibold text-warm-500 dark:text-warm-400 uppercase tracking-wider"
						>Texto para compartir</span
					>
					<textarea
						readonly
						rows="3"
						value={shareText}
						onclick={(e) => (e.target as HTMLTextAreaElement).select()}
						class="w-full border border-warm-200 dark:border-warm-600 rounded-xl px-4 py-3 text-sm bg-warm-50 dark:bg-warm-900 text-warm-700 dark:text-warm-200 resize-none leading-relaxed cursor-text"
					></textarea>
				</div>

				<!-- Facebook link -->
				{#if fbGroupId}
					<a
						href="https://www.facebook.com/groups/{fbGroupId}"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#0d66e0] text-white font-semibold text-sm px-5 py-3 rounded-2xl transition-all"
					>
						<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
							<path
								d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
							/>
						</svg>
						Abrir grupo en Facebook
					</a>
				{/if}
			</div>
		</div>
	</div>
{/if}
