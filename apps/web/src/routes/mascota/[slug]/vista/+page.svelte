<script lang="ts">
	import { Badge, Select } from '@scmascotas/ui';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const pet = $derived(data.pet);
	const colonias = $derived(data.colonias ?? []);
	const primaryPhoto = $derived(pet.photos?.[0]);

	const speciesLabel: Record<string, string> = { dog: 'Perro', cat: 'Gato', other: 'Otro' };
	const speciesEmoji: Record<string, string> = { dog: '🐶', cat: '🐱', other: '🐾' };

	// ── Form state ──
	let coloniaId = $state(pet.coloniaId ?? '');
	let description = $state('');
	let photoFile = $state<File | null>(null);
	let photoPreviewUrl = $state('');
	let submitting = $state(false);
	let submitError = $state('');
	let rateLimited = $state(false);
	let done = $state(false);
	let doneSlug = $state('');

	const selectedColoniaName = $derived(
		colonias.find((c: { id: string; name: string }) => c.id === coloniaId)?.name ?? ''
	);

	const coloniaChanged = $derived(
		coloniaId !== '' && pet.coloniaId !== '' && coloniaId !== pet.coloniaId
	);

	function handlePhotoChange(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0] ?? null;
		photoFile = file;
		photoPreviewUrl = file ? URL.createObjectURL(file) : '';
	}

	function removePhoto() {
		photoFile = null;
		photoPreviewUrl = '';
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (submitting || !coloniaId) return;
		submitting = true;
		submitError = '';

		try {
			const res = await fetch('/api/spotted-pets', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					type: pet.type,
					coloniaId,
					description: description.trim() || undefined,
					matchedPetId: pet.id,
				})
			});

			if (!res.ok) {
				if (res.status === 429) { rateLimited = true; return; }
				submitError = (await res.text()) || 'Error al enviar. Intenta de nuevo.';
				return;
			}

			const { id, slug } = await res.json();
			doneSlug = slug;

			if (photoFile) {
				const form = new FormData();
				form.append('file', photoFile);
				await fetch(`/api/spotted-pets/${id}/photo`, { method: 'POST', body: form }).catch(() => {});
			}

			done = true;
		} catch {
			submitError = 'Error de conexión. Intenta de nuevo.';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Vi a {pet.name ?? 'esta mascota'} — SC Mascotas</title>
	<meta name="description" content="Reporta dónde viste a esta mascota para ayudar a su dueño a encontrarla." />
</svelte:head>

<div
	class="min-h-screen bg-[#f5faf9] dark:bg-warm-900"
	style="background-image: radial-gradient(circle, rgba(20,184,166,0.06) 1px, transparent 1px); background-size: 20px 20px;"
>
	<div class="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6 pb-20">

		<!-- Back link -->
		<a
			href="/mascota/{pet.slug}"
			class="inline-flex items-center gap-1.5 text-sm text-warm-500 dark:text-warm-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors self-start font-medium group"
		>
			<svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd" />
			</svg>
			Volver al reporte
		</a>

		<!-- Pet mini-card -->
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
						Reportado en {pet.colonia}
					</p>
				{/if}
			</div>
		</div>

		{#if rateLimited}
			<!-- Rate limit -->
			<div class="bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-2xl p-8 flex flex-col items-center gap-5 text-center shadow-sm">
				<div class="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-3xl">⏱️</div>
				<div>
					<h2 class="font-display font-bold text-warm-900 dark:text-warm-50 text-xl mb-1">Límite alcanzado</h2>
					<p class="text-warm-500 dark:text-warm-400 text-sm">Puedes reportar hasta 5 avistamientos por día. Tu límite se renueva mañana.</p>
				</div>
				<a href="/" class="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-6 py-3 rounded-2xl transition-all">
					Volver al inicio
				</a>
			</div>

		{:else if done}
			<!-- Success state -->
			<div class="bg-white dark:bg-warm-800 border border-teal-200 dark:border-teal-700/60 rounded-2xl p-8 flex flex-col items-center gap-5 text-center shadow-sm">
				<div class="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-3xl">✅</div>
				<div>
					<h2 class="font-display font-bold text-warm-900 dark:text-warm-50 text-xl mb-1">
						¡Avistamiento confirmado!
					</h2>
					<p class="text-warm-500 dark:text-warm-400 text-sm leading-relaxed">
						Gracias por ayudar a encontrar a <strong class="text-warm-700 dark:text-warm-200">{pet.name ?? 'esta mascota'}</strong>. El dueño verá tu reporte. 🐾
					</p>
				</div>
				<div class="flex flex-col sm:flex-row gap-3 w-full">
					<a
						href="/mascota/{pet.slug}"
						class="flex-1 inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-5 py-3 rounded-2xl transition-all active:scale-95"
					>
						Ver reporte completo →
					</a>
					<a
						href="/"
						class="flex-1 inline-flex items-center justify-center gap-2 border border-warm-200 dark:border-warm-700 text-warm-600 dark:text-warm-300 font-semibold text-sm px-5 py-3 rounded-2xl hover:border-warm-300 dark:hover:border-warm-600 transition-all"
					>
						Volver al inicio
					</a>
				</div>
			</div>

		{:else}
			<!-- Sighting form card -->
			<div class="bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-2xl overflow-hidden shadow-sm">
				<!-- Teal header stripe -->
				<div class="bg-teal-50 dark:bg-teal-900/20 border-b border-teal-200 dark:border-teal-800/60 px-5 py-4">
					<div class="flex items-start gap-3">
						<div class="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-xl shrink-0">👀</div>
						<div>
							<h2 class="font-display font-semibold text-warm-900 dark:text-warm-50 text-base leading-snug">
								¿Dónde viste a {pet.name ?? 'esta mascota'}?
							</h2>
							<p class="text-xs text-warm-500 dark:text-warm-400 mt-0.5">
								Tu avistamiento queda vinculado a este reporte. El dueño será notificado.
							</p>
						</div>
					</div>
				</div>

				<form onsubmit={handleSubmit} class="p-5 flex flex-col gap-5">

					<!-- Colonia select -->
					<div class="flex flex-col gap-1.5">
						<label class="text-xs font-bold text-warm-600 dark:text-warm-400 uppercase tracking-wider">
							Colonia donde lo viste
						</label>
						<Select.Root
							type="single"
							value={coloniaId}
							onValueChange={(v) => (coloniaId = v)}
						>
							<Select.Trigger class="w-full rounded-xl border border-warm-200 dark:border-warm-600 bg-warm-50 dark:bg-warm-700/50 text-warm-900 dark:text-warm-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/60 transition-all text-left">
								{selectedColoniaName || 'Selecciona colonia…'}
							</Select.Trigger>
							<Select.Content class="z-50 max-h-64 overflow-y-auto rounded-xl border border-warm-200 dark:border-warm-700 bg-white dark:bg-warm-800 shadow-lg">
								{#each colonias as c (c.id)}
									<Select.Item value={c.id} class="px-4 py-2.5 text-sm text-warm-800 dark:text-warm-200 hover:bg-teal-50 dark:hover:bg-teal-900/20 cursor-pointer transition-colors">
										{c.name}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>

						{#if coloniaChanged}
							<p class="text-xs text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800/50 rounded-lg px-3 py-2 flex items-start gap-2">
								<span class="shrink-0">💡</span>
								<span>La mascota fue reportada en <strong>{pet.colonia}</strong> — estás indicando que la viste en {selectedColoniaName}.</span>
							</p>
						{/if}
					</div>

					<!-- Description textarea -->
					<div class="flex flex-col gap-1.5">
						<label for="vista-desc" class="text-xs font-bold text-warm-600 dark:text-warm-400 uppercase tracking-wider">
							¿Dónde exactamente? ¿Cuándo? <span class="font-normal normal-case tracking-normal text-warm-400">(opcional)</span>
						</label>
						<textarea
							id="vista-desc"
							bind:value={description}
							maxlength="300"
							placeholder="Ej. La vi cerca del mercado José Castillo Tielemans, esta tarde alrededor de las 4pm…"
							rows="4"
							class="w-full rounded-xl border border-warm-200 dark:border-warm-600 bg-warm-50 dark:bg-warm-700/50 text-warm-900 dark:text-warm-50 placeholder-warm-400 dark:placeholder-warm-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/60 focus:border-transparent transition-all resize-none leading-relaxed"
						></textarea>
						<p class="text-xs text-warm-400 dark:text-warm-500 text-right">{description.length}/300</p>
					</div>

					<!-- Photo upload -->
					<div class="flex flex-col gap-1.5">
						<p class="text-xs font-bold text-warm-600 dark:text-warm-400 uppercase tracking-wider">
							Foto <span class="font-normal normal-case tracking-normal text-warm-400">(opcional)</span>
						</p>

						{#if photoPreviewUrl}
							<div class="relative rounded-xl overflow-hidden border border-warm-200 dark:border-warm-600 aspect-video bg-warm-100 dark:bg-warm-700">
								<img src={photoPreviewUrl} alt="Vista previa" class="w-full h-full object-cover" />
								<button
									type="button"
									onclick={removePhoto}
									class="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
									aria-label="Eliminar foto"
								>
									<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
										<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
									</svg>
								</button>
							</div>
						{:else}
							<label class="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-warm-200 dark:border-warm-600 hover:border-teal-300 dark:hover:border-teal-600 rounded-xl py-8 px-4 cursor-pointer transition-colors group bg-warm-50/50 dark:bg-warm-700/20 hover:bg-teal-50/30 dark:hover:bg-teal-900/10">
								<div class="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
									<svg class="w-5 h-5 text-teal-600 dark:text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
									</svg>
								</div>
								<span class="text-sm font-semibold text-warm-600 dark:text-warm-300 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">Agregar foto</span>
								<span class="text-xs text-warm-400 dark:text-warm-500">Haz clic o arrastra una imagen</span>
								<input
									type="file"
									accept="image/*"
									onchange={handlePhotoChange}
									class="sr-only"
								/>
							</label>
						{/if}
					</div>

					{#if submitError}
						<p class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
							{submitError}
						</p>
					{/if}

					<button
						type="submit"
						disabled={submitting || !coloniaId}
						class="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-2xl transition-all active:scale-[0.98] shadow-sm text-sm"
					>
						{#if submitting}
							<svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
							</svg>
							Enviando…
						{:else}
							Confirmar avistamiento
						{/if}
					</button>
				</form>
			</div>
		{/if}

	</div>
</div>
