<script lang="ts">
	import { Badge, Button } from '@scmascotas/ui';

	let { data } = $props();
	const pet = $derived(data.pet);
	const primaryPhoto = $derived(pet.photos?.[0]);

	const speciesLabel: Record<string, string> = { dog: 'Perro', cat: 'Gato', other: 'Otro' };
	const speciesEmoji: Record<string, string> = { dog: '🐶', cat: '🐱', other: '🐾' };

	let description = $state('');
	let colonia = $state('');
	let submitting = $state(false);
	let submitted = $state(false);
	let formError = $state('');

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		submitting = true;
		formError = '';

		try {
			const res = await fetch(`/api/pets/${pet.id}/sightings`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					description: description.trim() || undefined,
					colonia: colonia.trim() || undefined
				})
			});

			if (!res.ok) {
				formError = (await res.text().catch(() => '')) || 'Error al enviar. Intenta de nuevo.';
				return;
			}

			submitted = true;
		} catch {
			formError = 'Error de conexión. Intenta de nuevo.';
		} finally {
			submitting = false;
		}
	}
</script>

<div class="min-h-screen bg-warm-50 dark:bg-warm-900">
	<div class="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
		<!-- Back link -->
		<a
			href="/mascota/{pet.slug}"
			class="inline-flex items-center gap-1.5 text-sm text-warm-500 dark:text-warm-400 hover:text-warm-800 dark:hover:text-warm-200 transition-colors self-start"
		>
			<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
			</svg>
			Volver al reporte
		</a>

		<!-- Pet summary card -->
		<div class="bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-2xl overflow-hidden flex gap-4 p-4 shadow-sm">
			<!-- Thumbnail -->
			<div class="w-20 h-20 rounded-xl overflow-hidden bg-warm-100 dark:bg-warm-700 flex items-center justify-center shrink-0 text-3xl">
				{#if primaryPhoto}
					<img src={primaryPhoto.url} alt={pet.name ?? 'Mascota'} class="w-full h-full object-cover" />
				{:else}
					{speciesEmoji[pet.type] ?? '🐾'}
				{/if}
			</div>
			<!-- Info -->
			<div class="flex flex-col justify-center gap-1.5 min-w-0">
				<div class="flex items-center gap-2 flex-wrap">
					<Badge.Root variant="amber">{speciesLabel[pet.type] ?? pet.type}</Badge.Root>
					<span class="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
						Buscando
					</span>
				</div>
				<h1 class="font-display font-bold text-warm-900 dark:text-warm-50 text-lg leading-tight truncate">
					{pet.name ?? 'Sin nombre'}
				</h1>
				{#if pet.colonia}
					<p class="text-xs text-warm-500 dark:text-warm-400 flex items-center gap-1">
						<svg class="w-3 h-3 shrink-0" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clip-rule="evenodd" />
						</svg>
						{pet.colonia}
					</p>
				{/if}
			</div>
		</div>

		{#if submitted}
			<!-- Success state -->
			<div class="bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-2xl p-8 flex flex-col items-center gap-5 text-center shadow-sm">
				<div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-3xl">
					✅
				</div>
				<div>
					<h2 class="font-display font-bold text-warm-900 dark:text-warm-50 text-xl mb-1">
						¡Avistamiento reportado!
					</h2>
					<p class="text-warm-500 dark:text-warm-400 text-sm leading-relaxed">
						Gracias por ayudar. El dueño será notificado de tu reporte.
					</p>
				</div>
				<a
					href="/mascota/{pet.slug}"
					class="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm px-6 py-3 rounded-2xl transition-all active:scale-95 shadow-sm"
				>
					Ver reporte completo →
				</a>
			</div>
		{:else}
			<!-- Sighting form -->
			<div class="bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-2xl overflow-hidden shadow-sm">
				<!-- Header stripe -->
				<div class="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-5 py-4">
					<h2 class="font-display font-semibold text-warm-900 dark:text-warm-50 text-base flex items-center gap-2">
						<span class="text-lg">👀</span>
						¿Lo viste? Cuéntanos
					</h2>
					<p class="text-xs text-warm-500 dark:text-warm-400 mt-0.5">
						Tu reporte ayuda a ubicar a la mascota
					</p>
				</div>

				<form onsubmit={submit} class="p-5 flex flex-col gap-4">
					<div class="flex flex-col gap-1.5">
						<label for="sighting-desc" class="text-xs font-bold text-warm-600 dark:text-warm-400 uppercase tracking-wider">
							¿Dónde lo viste? <span class="font-normal normal-case tracking-normal text-warm-400">(opcional)</span>
						</label>
						<textarea
							id="sighting-desc"
							bind:value={description}
							maxlength="500"
							placeholder="Cuéntanos dónde lo viste, cuándo fue, cómo estaba..."
							rows="4"
							class="w-full rounded-xl border border-warm-200 dark:border-warm-600 bg-warm-50 dark:bg-warm-700/50 text-warm-900 dark:text-warm-50 placeholder-warm-400 dark:placeholder-warm-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:border-transparent transition-all resize-none leading-relaxed"
						></textarea>
					</div>

					<div class="flex flex-col gap-1.5">
						<label for="sighting-colonia" class="text-xs font-bold text-warm-600 dark:text-warm-400 uppercase tracking-wider">
							Colonia <span class="font-normal normal-case tracking-normal text-warm-400">(opcional)</span>
						</label>
						<input
							id="sighting-colonia"
							bind:value={colonia}
							type="text"
							placeholder="Ej. Centro, Insurgentes..."
							class="w-full rounded-xl border border-warm-200 dark:border-warm-600 bg-warm-50 dark:bg-warm-700/50 text-warm-900 dark:text-warm-50 placeholder-warm-400 dark:placeholder-warm-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:border-transparent transition-all"
						/>
					</div>

					{#if formError}
						<p class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
							{formError}
						</p>
					{/if}

					<button
						type="submit"
						disabled={submitting}
						class="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-2xl transition-all active:scale-[0.98] shadow-sm text-sm"
					>
						{#if submitting}
							<svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
							</svg>
							Enviando…
						{:else}
							Reportar avistamiento
						{/if}
					</button>
				</form>
			</div>
		{/if}
	</div>
</div>
