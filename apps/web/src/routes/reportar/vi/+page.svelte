<script lang="ts">
	import type { PageData } from './$types';
	import { Select } from '@scmascotas/ui';

	let { data }: { data: PageData } = $props();

	type PetType = 'dog' | 'cat' | 'other';
	type MatchPet = {
		id: string; slug: string; name: string | null; type: string;
		color: string | null; lastSeenAt: string; colonia: string | null; photoUrl: string | null;
	};

	let step = $state<'form' | 'success'>('form');

	// form fields
	let selectedType = $state<PetType | ''>('');
	let selectedColoniaId = $state('');
	let description = $state('');
	let color = $state('');
	let contactWhatsapp = $state('');
	let photoFile = $state<File | null>(null);
	let photoPreviewUrl = $state('');

	// submission
	let submitting = $state(false);
	let submitError = $state('');
	let attempted = $state(false);

	// post-submit
	let matchingPets = $state<MatchPet[]>([]);
	let loadingMatches = $state(false);

	const selectedColoniaName = $derived(
		data.colonias.find(c => c.id === selectedColoniaId)?.name ?? ''
	);

	const canSubmit = $derived(selectedType !== '' && selectedColoniaId !== '');

	function handlePhotoChange(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0] ?? null;
		photoFile = file;
		photoPreviewUrl = file ? URL.createObjectURL(file) : '';
	}

	function removePhoto() {
		photoFile = null;
		photoPreviewUrl = '';
	}

	function resetForm() {
		step = 'form';
		selectedType = '';
		selectedColoniaId = '';
		description = '';
		color = '';
		contactWhatsapp = '';
		photoFile = null;
		photoPreviewUrl = '';
		submitError = '';
		attempted = false;
		matchingPets = [];
	}

	async function submit() {
		attempted = true;
		if (!canSubmit || submitting) return;
		submitting = true;
		submitError = '';
		try {
			const res = await fetch('/api/spotted-pets', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					type: selectedType,
					coloniaId: selectedColoniaId,
					description: description.trim() || undefined,
					color: color.trim() || undefined,
					contactWhatsapp: contactWhatsapp.trim() || undefined,
				})
			});
			if (!res.ok) { submitError = (await res.text()) || 'Error al publicar.'; return; }
			const { id } = await res.json();

			if (photoFile) {
				const form = new FormData();
				form.append('file', photoFile);
				await fetch(`/api/spotted-pets/${id}/photo`, { method: 'POST', body: form });
			}

			loadingMatches = true;
			step = 'success';
			const params = new URLSearchParams({ coloniaId: selectedColoniaId });
			if (selectedType) params.set('type', selectedType);
			const matchRes = await fetch(`/api/pets/active?${params}`);
			if (matchRes.ok) matchingPets = await matchRes.json();
		} catch {
			submitError = 'Error de conexión. Intenta de nuevo.';
		} finally {
			submitting = false;
			loadingMatches = false;
		}
	}

	function timeAgo(date: string): string {
		const diff = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
		if (diff === 0) return 'Hoy';
		if (diff === 1) return 'Ayer';
		if (diff < 7) return `Hace ${diff} días`;
		return `Hace ${Math.floor(diff / 7)} semanas`;
	}

	function typeEmoji(type: string) {
		if (type === 'dog') return '🐶';
		if (type === 'cat') return '🐱';
		return '🐾';
	}
</script>

<svelte:head>
	<title>Vi una mascota perdida — SC Mascotas</title>
	<meta name="description" content="Reporta una mascota que viste perdida en San Cristóbal de las Casas." />
</svelte:head>

<div
	class="min-h-screen bg-[#faf9f7] dark:bg-warm-900"
	style="background-image: radial-gradient(circle, rgba(180,140,60,0.07) 1px, transparent 1px); background-size: 22px 22px;"
>
	<div class="max-w-xl mx-auto px-4 py-8">

		<!-- Back link -->
		<a
			href="/reportar"
			class="inline-flex items-center gap-1.5 text-sm text-warm-500 dark:text-warm-400 hover:text-warm-900 dark:hover:text-warm-100 transition-colors mb-8"
		>
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
			</svg>
			Volver
		</a>

		{#if step === 'form'}
			<!-- ── Page header ── -->
			<div class="mb-8">
				<div class="flex items-center gap-3 mb-2">
					<span class="text-3xl">👀</span>
					<h1 class="font-display text-3xl font-bold text-warm-900 dark:text-warm-50">
						Vi una mascota perdida
					</h1>
				</div>
				<p class="text-warm-500 dark:text-warm-400 ml-12">
					Publica lo que viste y la comunidad te ayudará.
				</p>
			</div>

			<div class="flex flex-col gap-4">

				<!-- Card 1: Especie -->
				<div class="bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-2xl shadow-sm p-5">
					<div class="flex items-center justify-between mb-3">
						<p class="text-sm font-semibold text-warm-900 dark:text-warm-50">
							¿Qué tipo de mascota? <span class="text-red-400">*</span>
						</p>
						{#if attempted && !selectedType}
							<span class="text-xs text-red-500">Requerido</span>
						{/if}
					</div>
					<div class="flex items-center gap-1 bg-warm-100 dark:bg-warm-700/60 rounded-xl p-1">
						{#each (['dog', 'cat', 'other'] as const) as t}
							{@const emoji = t === 'dog' ? '🐶' : t === 'cat' ? '🐱' : '🐾'}
							{@const label = t === 'dog' ? 'Perro' : t === 'cat' ? 'Gato' : 'Otro'}
							<button
								type="button"
								onclick={() => { selectedType = selectedType === t ? '' : t; }}
								class="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-150 {selectedType === t
									? 'bg-amber-500 text-white shadow-sm'
									: 'text-warm-600 dark:text-warm-300 hover:text-warm-900 dark:hover:text-warm-50'}"
							>
								<span class="text-base">{emoji}</span>
								{label}
							</button>
						{/each}
					</div>
				</div>

				<!-- Card 2: Colonia -->
				<div class="bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-2xl shadow-sm p-5">
					<div class="flex items-center justify-between mb-3">
						<p class="text-sm font-semibold text-warm-900 dark:text-warm-50">
							¿Dónde la viste? <span class="text-red-400">*</span>
						</p>
						{#if attempted && !selectedColoniaId}
							<span class="text-xs text-red-500">Requerido</span>
						{/if}
					</div>
					<Select.Root
						type="single"
						value={selectedColoniaId}
						onValueChange={(v) => { selectedColoniaId = v; }}
					>
						<Select.Trigger class="w-full">
							{data.colonias.find(c => c.id === selectedColoniaId)?.name ?? 'Selecciona una colonia'}
						</Select.Trigger>
						<Select.Content class="max-h-60">
							{#each data.colonias as colonia (colonia.id)}
								<Select.Item value={colonia.id} label={colonia.name}>{colonia.name}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<!-- Card 3: Descripción -->
				<div class="bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-2xl shadow-sm p-5">
					<p class="text-sm font-semibold text-warm-900 dark:text-warm-50 mb-0.5">Descripción <span class="font-normal text-warm-400">(opcional)</span></p>
					<p class="text-xs text-warm-400 dark:text-warm-500 mb-3">Color, tamaño, collar, comportamiento…</p>
					<div class="flex flex-col gap-3">
						<input
							type="text"
							bind:value={color}
							maxlength={80}
							placeholder="Color principal (ej. café, negro con manchas)"
							class="w-full bg-warm-50 dark:bg-warm-700 border border-warm-200 dark:border-warm-600 rounded-xl px-4 py-2.5 text-sm text-warm-900 dark:text-warm-100 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
						/>
						<textarea
							bind:value={description}
							maxlength={300}
							rows={4}
							placeholder="Describe cómo era la mascota, dónde exactamente, si tenía collar…"
							class="w-full bg-warm-50 dark:bg-warm-700 border border-warm-200 dark:border-warm-600 rounded-xl px-4 py-2.5 text-sm text-warm-900 dark:text-warm-100 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
						></textarea>
						{#if description.length > 240}
							<p class="text-xs text-warm-400 text-right">{description.length}/300</p>
						{/if}
					</div>
				</div>

				<!-- Card 4: Foto -->
				<div class="bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-2xl shadow-sm p-5">
					<p class="text-sm font-semibold text-warm-900 dark:text-warm-50 mb-3">Foto <span class="font-normal text-warm-400">(opcional)</span></p>
					{#if photoPreviewUrl}
						<div class="flex items-center gap-4">
							<img src={photoPreviewUrl} alt="Vista previa" class="w-24 h-24 object-cover rounded-xl border border-warm-200 dark:border-warm-600" />
							<div class="flex flex-col gap-1.5">
								<p class="text-sm text-warm-600 dark:text-warm-300">Foto seleccionada</p>
								<label class="text-sm font-medium text-amber-600 dark:text-amber-400 cursor-pointer hover:underline">
									Cambiar foto
									<input type="file" accept="image/*" class="hidden" onchange={handlePhotoChange} />
								</label>
								<button type="button" onclick={removePhoto} class="text-sm text-red-400 hover:text-red-600 text-left">
									Quitar foto
								</button>
							</div>
						</div>
					{:else}
						<label class="flex flex-col items-center gap-2 border-2 border-dashed border-warm-200 dark:border-warm-600 rounded-xl p-6 cursor-pointer hover:border-amber-300 dark:hover:border-amber-600 hover:bg-amber-50/40 dark:hover:bg-amber-900/10 transition-all text-center">
							<span class="text-3xl">📷</span>
							<span class="text-sm font-medium text-warm-700 dark:text-warm-200">Agregar foto</span>
							<span class="text-xs text-warm-400">JPG o PNG · Máx 5 MB</span>
							<input type="file" accept="image/*" class="hidden" onchange={handlePhotoChange} />
						</label>
					{/if}
				</div>

				<!-- Card 5: Contacto -->
				<div class="bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-2xl shadow-sm p-5">
					<p class="text-sm font-semibold text-warm-900 dark:text-warm-50 mb-0.5">
						Tu WhatsApp <span class="font-normal text-warm-400">(opcional)</span>
					</p>
					<p class="text-xs text-warm-400 dark:text-warm-500 mb-3">Para que el dueño pueda escribirte directamente</p>
					<input
						type="tel"
						bind:value={contactWhatsapp}
						maxlength={20}
						placeholder="+52 967 000 0000"
						class="w-full bg-warm-50 dark:bg-warm-700 border border-warm-200 dark:border-warm-600 rounded-xl px-4 py-2.5 text-sm text-warm-900 dark:text-warm-100 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
					/>
				</div>

				<!-- Submit -->
				<div class="flex flex-col gap-2 pt-1">
					{#if submitError}
						<p class="text-sm text-red-600 dark:text-red-400 text-center">{submitError}</p>
					{/if}
					<button
						type="button"
						onclick={submit}
						disabled={submitting}
						class="w-full flex items-center justify-center gap-2 min-h-[52px] bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-base rounded-2xl transition-colors shadow-sm"
					>
						{#if submitting}
							<svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Publicando…
						{:else}
							Publicar avistamiento
						{/if}
					</button>
					{#if attempted && !canSubmit}
						<p class="text-xs text-warm-500 dark:text-warm-400 text-center">
							{!selectedType ? 'Selecciona el tipo de mascota.' : 'Selecciona la colonia.'}
						</p>
					{/if}
				</div>

			</div>

		{:else}
			<!-- ── Success state ── -->
			<div class="flex flex-col gap-6">

				<!-- Banner -->
				<div class="bg-white dark:bg-warm-800 border border-green-200 dark:border-green-700/50 rounded-3xl shadow-sm p-8 flex flex-col items-center text-center gap-3">
					<div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-3xl">
						✅
					</div>
					<h1 class="font-display text-2xl font-bold text-warm-900 dark:text-warm-50">
						¡Avistamiento publicado!
					</h1>
					<p class="text-warm-500 dark:text-warm-400 text-sm max-w-xs">
						Tu reporte ya es visible para la comunidad. ¡Gracias por ayudar! 🐾
					</p>
				</div>

				<!-- Matching pets -->
				<div>
					{#if loadingMatches}
						<div class="flex flex-col gap-2 mb-4">
							<div class="h-4 w-48 bg-warm-200 dark:bg-warm-700 rounded animate-pulse"></div>
							<div class="h-3 w-64 bg-warm-100 dark:bg-warm-800 rounded animate-pulse"></div>
						</div>
						<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
							{#each [1,2,3] as _}
								<div class="bg-warm-100 dark:bg-warm-800 rounded-2xl overflow-hidden animate-pulse">
									<div class="aspect-[4/3] bg-warm-200 dark:bg-warm-700"></div>
									<div class="p-3 flex flex-col gap-2">
										<div class="h-3.5 bg-warm-200 dark:bg-warm-700 rounded w-3/4"></div>
										<div class="h-3 bg-warm-100 dark:bg-warm-600 rounded w-1/2"></div>
									</div>
								</div>
							{/each}
						</div>

					{:else if matchingPets.length > 0}
						<div class="mb-4">
							<p class="text-sm font-semibold text-warm-900 dark:text-warm-50 mb-1">
								¿Reconoces a alguna de estas mascotas perdidas{selectedColoniaName ? ` en ${selectedColoniaName}` : ''}?
							</p>
							<p class="text-xs text-warm-500 dark:text-warm-400">
								Si la reconoces, entra al reporte para avisar al dueño — no es obligatorio.
							</p>
						</div>
						<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
							{#each matchingPets as pet (pet.id)}
								<a
									href="/mascota/{pet.slug}"
									class="group bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-2xl overflow-hidden hover:shadow-md hover:border-warm-300 dark:hover:border-warm-600 transition-all"
								>
									<div class="aspect-[4/3] bg-warm-100 dark:bg-warm-700 flex items-center justify-center overflow-hidden">
										{#if pet.photoUrl}
											<img src={pet.photoUrl} alt={pet.name ?? 'Mascota'} class="w-full h-full object-cover" loading="lazy" />
										{:else}
											<span class="text-4xl select-none">{typeEmoji(pet.type)}</span>
										{/if}
									</div>
									<div class="p-3 flex flex-col gap-1.5">
										<p class="font-semibold text-warm-900 dark:text-warm-50 text-sm truncate">
											{pet.name ?? 'Sin nombre'}
										</p>
										<div class="flex flex-wrap gap-1">
											{#if pet.color}
												<span class="text-xs bg-warm-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300 rounded-full px-2 py-0.5">{pet.color}</span>
											{/if}
											{#if pet.lastSeenAt}
												<span class="text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full px-2 py-0.5">{timeAgo(pet.lastSeenAt)}</span>
											{/if}
										</div>
										<span class="text-xs font-medium text-amber-600 dark:text-amber-400 group-hover:underline mt-0.5">
											Ver reporte →
										</span>
									</div>
								</a>
							{/each}
						</div>

					{:else}
						<div class="bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-2xl p-6 text-center flex flex-col gap-2">
							<span class="text-3xl">🔍</span>
							<p class="text-sm text-warm-600 dark:text-warm-300">
								No hay mascotas perdidas reportadas en esa zona por ahora.
							</p>
							<a href="/" class="text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline">
								Ver todos los reportes activos →
							</a>
						</div>
					{/if}
				</div>

				<!-- Footer actions -->
				<div class="flex flex-col sm:flex-row gap-3 pt-2">
					<a
						href="/"
						class="flex-1 flex items-center justify-center min-h-[48px] bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-2xl transition-colors"
					>
						Volver al inicio
					</a>
					<button
						type="button"
						onclick={resetForm}
						class="flex-1 flex items-center justify-center min-h-[48px] bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 hover:border-warm-300 dark:hover:border-warm-600 text-warm-700 dark:text-warm-200 font-semibold text-sm rounded-2xl transition-colors"
					>
						Reportar otro avistamiento
					</button>
				</div>

			</div>
		{/if}

	</div>
</div>
