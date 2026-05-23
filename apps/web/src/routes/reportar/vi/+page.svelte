<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { untrack } from 'svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { Select } from '@scmascotas/ui';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type PetType = 'dog' | 'cat' | 'other';
	type SizeType = 'small' | 'medium' | 'large';
	type MatchPet = {
		id: string; slug: string; name: string | null; type: string;
		color: string | null; lastSeenAt: string; colonia: string | null; photoUrl: string | null;
	};

	// ── Wizard navigation ──
	const STEPS = ['Especie', '¿Dónde?', '¿Cómo era?', '¿La conoces?'];
	let currentStep = $state(0);
	let animDir = $state(1);

	$effect(() => {
		const stepParam = page.url.searchParams.get('step');
		if (stepParam === null) {
			goto('?step=0', { replaceState: true, noScroll: true });
			return;
		}
		const next = Number(stepParam);
		const prev = untrack(() => currentStep);
		if (next !== prev) {
			animDir = next > prev ? 1 : -1;
			currentStep = next;
		}
	});

	// ── Form fields ──
	let selectedType = $state<PetType | ''>('');
	let selectedColoniaId = $state('');
	let locationHint = $state('');   // "¿Dónde exactamente?" — prepended to description
	let color = $state('');
	let size = $state<SizeType | ''>('');
	let description = $state('');
	let contactWhatsapp = $state('');
	let photoFile = $state<File | null>(null);
	let photoPreviewUrl = $state('');

	// ── Match step state ──
	let matchedPetId = $state<string | null>(null);
	let matchingPets = $state<MatchPet[]>([]);
	let loadingMatches = $state(false);
	let matchFetched = $state(false);  // avoid re-fetching on re-render

	// ── Submission ──
	let submitting = $state(false);
	let submitError = $state('');
	let rateLimited = $state(false);
	let done = $state(false);

	const selectedColoniaName = $derived(
		data.colonias.find(c => c.id === selectedColoniaId)?.name ?? ''
	);

	const canContinue = $derived(
		currentStep === 1 ? selectedColoniaId !== '' :
		true
	);

	// ── Fetch matches when entering step 3 ──
	$effect(() => {
		if (currentStep === 3 && !matchFetched && selectedColoniaId && selectedType) {
			matchFetched = true;
			loadingMatches = true;
			const params = new URLSearchParams({ coloniaId: selectedColoniaId });
			if (selectedType) params.set('type', selectedType);
			fetch(`/api/pets/active?${params}`)
				.then(r => r.ok ? r.json() : [])
				.then(pets => { matchingPets = pets; })
				.catch(() => {})
				.finally(() => { loadingMatches = false; });
		}
	});

	function goNext() {
		goto(`?step=${currentStep + 1}`, { replaceState: false, noScroll: true });
	}

	function goBack() {
		history.back();
	}

	function selectType(t: PetType) {
		selectedType = t;
		setTimeout(() => goto('?step=1', { replaceState: false, noScroll: true }), 350);
	}

	function handlePhotoChange(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0] ?? null;
		photoFile = file;
		photoPreviewUrl = file ? URL.createObjectURL(file) : '';
	}

	function removePhoto() {
		photoFile = null;
		photoPreviewUrl = '';
	}

	function toggleMatch(petId: string) {
		matchedPetId = matchedPetId === petId ? null : petId;
	}

	async function handleSubmit() {
		if (submitting) return;
		submitting = true;
		submitError = '';
		try {
			// Build description: prepend location hint if provided
			const fullDescription = [
				locationHint.trim() ? `📍 ${locationHint.trim()}` : '',
				description.trim()
			].filter(Boolean).join('\n\n') || undefined;

			const res = await fetch('/api/spotted-pets', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					type: selectedType,
					coloniaId: selectedColoniaId,
					description: fullDescription,
					color: color.trim() || undefined,
					size: size || undefined,
					contactWhatsapp: contactWhatsapp.trim() || undefined,
					matchedPetId: matchedPetId ?? undefined,
				})
			});

			if (!res.ok) {
				if (res.status === 429) { rateLimited = true; return; }
				submitError = (await res.text()) || 'Error al publicar.';
				return;
			}

			const { id } = await res.json();

			if (photoFile) {
				const form = new FormData();
				form.append('file', photoFile);
				await fetch(`/api/spotted-pets/${id}/photo`, { method: 'POST', body: form });
			}

			done = true;
		} catch {
			submitError = 'Error de conexión. Intenta de nuevo.';
		} finally {
			submitting = false;
		}
	}

	function typeEmoji(type: string) {
		if (type === 'dog') return '🐶';
		if (type === 'cat') return '🐱';
		return '🐾';
	}

	function typeLabel(type: string) {
		if (type === 'dog') return 'Perro';
		if (type === 'cat') return 'Gato';
		return 'Otro';
	}

	function timeAgo(date: string): string {
		const diff = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
		if (diff === 0) return 'Hoy';
		if (diff === 1) return 'Ayer';
		if (diff < 7) return `Hace ${diff} días`;
		return `Hace ${Math.floor(diff / 7)} semanas`;
	}

	const inputClass = 'w-full border border-warm-200 dark:border-warm-700 rounded-xl px-4 py-3 text-sm bg-white dark:bg-warm-800 text-warm-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all placeholder:text-warm-400 dark:placeholder:text-warm-500';
	const labelClass = 'block text-sm font-semibold text-warm-700 dark:text-warm-200 mb-1.5';
</script>

<svelte:head>
	<title>Vi una mascota perdida — SC Mascotas</title>
	<meta name="description" content="Reporta una mascota que viste perdida en San Cristóbal de las Casas." />
</svelte:head>

<div
	class="min-h-screen bg-[#faf9f7] dark:bg-warm-900"
	style="background-image: radial-gradient(circle, rgba(180,140,60,0.07) 1px, transparent 1px); background-size: 22px 22px;"
>
	<div class="max-w-2xl mx-auto px-4 py-10 pb-24">

		<!-- Back link -->
		<a href="/reportar" class="inline-flex items-center gap-1.5 text-sm text-warm-500 dark:text-warm-400 hover:text-warm-800 dark:hover:text-warm-200 transition-colors font-medium">
			<svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd" />
			</svg>
			Volver
		</a>

		{#if rateLimited}
			<div class="mt-12 flex flex-col items-center text-center gap-6">
				<div class="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-4xl">⏱️</div>
				<div class="flex flex-col gap-2 max-w-sm">
					<h2 class="font-display text-2xl font-bold text-warm-900 dark:text-warm-50">Límite alcanzado</h2>
					<p class="text-warm-500 dark:text-warm-400 text-sm">Puedes publicar hasta 5 avistamientos por día. Tu límite se renueva mañana.</p>
				</div>
				<a href="/" class="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-2xl transition-colors">Volver al inicio</a>
			</div>

		{:else if done}
			<!-- ── Success ── -->
			<div class="mt-12 flex flex-col items-center text-center gap-6">
				<div class="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-4xl">✅</div>
				<div class="flex flex-col gap-2 max-w-sm">
					<h1 class="font-display text-3xl font-bold text-warm-900 dark:text-warm-50">¡Avistamiento publicado!</h1>
					<p class="text-warm-500 dark:text-warm-400 text-sm">Tu reporte ya es visible para la comunidad. ¡Gracias por ayudar! 🐾</p>
				</div>
				{#if matchedPetId}
					{@const linked = matchingPets.find(p => p.id === matchedPetId)}
					{#if linked}
						<div class="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700/50 rounded-2xl px-5 py-4 text-sm text-teal-800 dark:text-teal-300 max-w-sm">
							Vinculaste tu avistamiento a <strong>{linked.name ?? 'Sin nombre'}</strong>. El dueño podrá ver la conexión en su reporte.
						</div>
					{/if}
				{/if}
				<div class="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
					<a href="/" class="flex-1 py-3 rounded-2xl font-bold text-sm text-center bg-amber-500 hover:bg-amber-600 text-white transition-colors">Ver reportes activos</a>
					<a href="/reportar/vi?step=0" class="flex-1 py-3 rounded-2xl font-semibold text-sm text-center border border-warm-200 dark:border-warm-700 text-warm-600 dark:text-warm-300 hover:border-warm-300 dark:hover:border-warm-600 transition-colors">Reportar otro</a>
				</div>
			</div>

		{:else}
			<!-- ── Page header ── -->
			<div class="mt-7 mb-8">
				<h1 class="font-display text-3xl sm:text-4xl font-bold text-warm-900 dark:text-warm-50 leading-tight">
					Vi una mascota<br>perdida
				</h1>
				<p class="text-warm-500 dark:text-warm-400 mt-2 text-sm">
					Cuéntanos lo que viste — la comunidad te ayudará a conectar con el dueño.
				</p>
			</div>

			<!-- ── Step indicator ── -->
			<div class="flex items-center mb-10 px-1">
				{#each STEPS as step, i (i)}
					<div class="flex flex-col items-center gap-1.5 flex-shrink-0">
						<div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 {
							i < currentStep
								? 'bg-amber-500 text-white shadow-md'
								: i === currentStep
								? 'bg-amber-500 text-white shadow-lg ring-4 ring-amber-100 dark:ring-amber-900'
								: 'bg-white dark:bg-warm-800 text-warm-400 dark:text-warm-500 border-2 border-warm-200 dark:border-warm-700'
						}">
							{#if i < currentStep}
								<svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
								</svg>
							{:else}
								{i + 1}
							{/if}
						</div>
						<span class="text-xs font-semibold tracking-wide transition-colors duration-300 {i <= currentStep ? 'text-amber-700 dark:text-amber-400' : 'text-warm-400 dark:text-warm-600'}">{step}</span>
					</div>
					{#if i < STEPS.length - 1}
						<div class="flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all duration-500 {i < currentStep ? 'bg-amber-500' : 'bg-warm-200 dark:bg-warm-700'}"></div>
					{/if}
				{/each}
			</div>

			<!-- ── Step content ── -->
			{#key currentStep}
				<div in:fly={{ x: animDir * 40, duration: 260, easing: cubicOut }} out:fly={{ x: -animDir * 40, duration: 180, easing: cubicOut }}>

				<!-- STEP 0: Especie -->
				{#if currentStep === 0}
					<div class="flex flex-col gap-4">
						<div class="bg-white dark:bg-warm-800 rounded-3xl border border-warm-200 dark:border-warm-700 shadow-sm p-6">
							<div class="flex items-center gap-3 pb-4 border-b border-warm-100 dark:border-warm-700 mb-5">
								<div class="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style="background: linear-gradient(135deg,#FEF3C7,#FDE68A);">👀</div>
								<div>
									<h2 class="font-display font-semibold text-warm-900 dark:text-warm-50 text-lg">¿Qué tipo de mascota viste?</h2>
									<p class="text-xs text-warm-400 dark:text-warm-500">Selecciona para continuar</p>
								</div>
							</div>
							<div class="grid grid-cols-3 gap-3">
								{#each ([['dog','🐶','Perro'], ['cat','🐱','Gato'], ['other','🐾','Otro']] as const) as [t, emoji, label]}
									<button
										type="button"
										onclick={() => selectType(t)}
										class="relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 {selectedType === t
											? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 shadow-md'
											: 'border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-900/30 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50/50 dark:hover:bg-amber-900/10'}"
									>
										{#if selectedType === t}
											<div class="absolute top-2.5 right-2.5 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
												<svg class="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
													<path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
												</svg>
											</div>
										{/if}
										<span class="text-4xl leading-none">{emoji}</span>
										<span class="text-sm font-bold text-warm-800 dark:text-warm-100">{label}</span>
									</button>
								{/each}
							</div>
						</div>
					</div>

				<!-- STEP 1: ¿Dónde? -->
				{:else if currentStep === 1}
					<div class="flex flex-col gap-4">
						<div class="bg-white dark:bg-warm-800 rounded-3xl border border-warm-200 dark:border-warm-700 shadow-sm p-6 flex flex-col gap-5">
							<div class="flex items-center gap-3 pb-4 border-b border-warm-100 dark:border-warm-700">
								<div class="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style="background: linear-gradient(135deg,#FEF3C7,#FDE68A);">📍</div>
								<div>
									<h2 class="font-display font-semibold text-warm-900 dark:text-warm-50 text-lg">¿Dónde la viste?</h2>
									<p class="text-xs text-warm-400 dark:text-warm-500">Colonia o barrio en San Cristóbal</p>
								</div>
							</div>

							<div>
								<p class={labelClass}>Colonia <span class="text-red-400">*</span></p>
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

							<div>
								<p class={labelClass}>¿En qué parte exactamente? <span class="text-warm-400 font-normal">(opcional)</span></p>
								<input
									type="text"
									bind:value={locationHint}
									maxlength={120}
									placeholder="Ej: Cerca del mercado, frente a la iglesia…"
									class={inputClass}
								/>
							</div>
						</div>

						<div class="flex gap-3">
							<button type="button" onclick={goBack} class="flex-1 py-3 rounded-2xl font-semibold text-sm border border-warm-200 dark:border-warm-700 text-warm-600 dark:text-warm-300 hover:border-warm-300 transition-colors">← Atrás</button>
							<button type="button" onclick={goNext} disabled={!canContinue} class="flex-1 py-3 rounded-2xl font-bold text-sm bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors">Siguiente →</button>
						</div>
					</div>

				<!-- STEP 2: ¿Cómo era? -->
				{:else if currentStep === 2}
					<div class="flex flex-col gap-4">
						<div class="bg-white dark:bg-warm-800 rounded-3xl border border-warm-200 dark:border-warm-700 shadow-sm p-6 flex flex-col gap-5">
							<div class="flex items-center gap-3 pb-4 border-b border-warm-100 dark:border-warm-700">
								<div class="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style="background: linear-gradient(135deg,#FEF3C7,#FDE68A);">{typeEmoji(selectedType)}</div>
								<div>
									<h2 class="font-display font-semibold text-warm-900 dark:text-warm-50 text-lg">¿Cómo era? <span class="text-warm-400 font-normal text-base">(opcional)</span></h2>
									<p class="text-xs text-warm-400 dark:text-warm-500">Más detalles ayudan a identificarla</p>
								</div>
							</div>

							<div>
								<p class={labelClass}>Color principal</p>
								<input type="text" bind:value={color} maxlength={80} placeholder="Ej. café con manchas blancas, negro…" class={inputClass} />
							</div>

							<div>
								<p class={labelClass}>Tamaño</p>
								<div class="flex items-center gap-1 bg-warm-100 dark:bg-warm-700/60 rounded-xl p-1">
									{#each ([['small','Pequeño'],['medium','Mediano'],['large','Grande']] as const) as [s, label]}
										<button
											type="button"
											onclick={() => { size = size === s ? '' : s; }}
											class="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-150 {size === s ? 'bg-amber-500 text-white shadow-sm' : 'text-warm-600 dark:text-warm-300 hover:text-warm-900 dark:hover:text-warm-50'}"
										>{label}</button>
									{/each}
								</div>
							</div>

							<div>
								<p class={labelClass}>Descripción</p>
								<textarea
									bind:value={description}
									maxlength={300}
									rows={4}
									placeholder="Collar, comportamiento, señas particulares…"
									class="{inputClass} resize-none"
								></textarea>
								{#if description.length > 240}
									<p class="text-xs text-warm-400 text-right mt-1">{description.length}/300</p>
								{/if}
							</div>

							<!-- Photo -->
							<div>
								<p class={labelClass}>Foto <span class="text-warm-400 font-normal">(opcional)</span></p>
								{#if photoPreviewUrl}
									<div class="flex items-center gap-4">
										<img src={photoPreviewUrl} alt="Vista previa" class="w-24 h-24 object-cover rounded-xl border border-warm-200 dark:border-warm-600" />
										<div class="flex flex-col gap-1.5">
											<label class="text-sm font-medium text-amber-600 dark:text-amber-400 cursor-pointer hover:underline">
												Cambiar foto
												<input type="file" accept="image/*" class="hidden" onchange={handlePhotoChange} />
											</label>
											<button type="button" onclick={removePhoto} class="text-sm text-red-400 hover:text-red-600 text-left">Quitar foto</button>
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
						</div>

						<div class="flex gap-3">
							<button type="button" onclick={goBack} class="flex-1 py-3 rounded-2xl font-semibold text-sm border border-warm-200 dark:border-warm-700 text-warm-600 dark:text-warm-300 hover:border-warm-300 transition-colors">← Atrás</button>
							<button type="button" onclick={goNext} class="flex-1 py-3 rounded-2xl font-bold text-sm bg-amber-500 hover:bg-amber-600 text-white transition-colors">Siguiente →</button>
						</div>
					</div>

				<!-- STEP 3: ¿La conoces? + Submit -->
				{:else if currentStep === 3}
					<div class="flex flex-col gap-4">

						<!-- Matching pets -->
						<div class="bg-white dark:bg-warm-800 rounded-3xl border border-warm-200 dark:border-warm-700 shadow-sm p-6 flex flex-col gap-4">
							<div class="flex items-center gap-3 pb-4 border-b border-warm-100 dark:border-warm-700">
								<div class="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style="background: linear-gradient(135deg,#CCFBF1,#99F6E4);">🔍</div>
								<div>
									<h2 class="font-display font-semibold text-warm-900 dark:text-warm-50 text-lg">¿Reconoces a alguna?</h2>
									<p class="text-xs text-warm-400 dark:text-warm-500">Opcional — puedes publicar sin seleccionar ninguna</p>
								</div>
							</div>

							{#if loadingMatches}
								<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
									{#each [1,2,3] as _}
										<div class="bg-warm-100 dark:bg-warm-700 rounded-2xl overflow-hidden animate-pulse">
											<div class="aspect-[4/3]"></div>
											<div class="p-3 flex flex-col gap-2">
												<div class="h-3.5 bg-warm-200 dark:bg-warm-600 rounded w-3/4"></div>
												<div class="h-3 bg-warm-100 dark:bg-warm-500 rounded w-1/2"></div>
											</div>
										</div>
									{/each}
								</div>

							{:else if matchingPets.length === 0}
								<div class="flex flex-col items-center gap-2 py-6 text-center">
									<span class="text-3xl">🔍</span>
									<p class="text-sm text-warm-500 dark:text-warm-400">
										No hay {typeLabel(selectedType)} perdid{selectedType === 'cat' ? 'a' : 'o'} reportad{selectedType === 'cat' ? 'a' : 'o'} en {selectedColoniaName || 'esa colonia'} por ahora.
									</p>
									<a href={`/?colonia=${selectedColoniaId}`} class="text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline">Ver todos los reportes en esa colonia →</a>
								</div>

							{:else}
								<div>
									<p class="text-xs text-warm-500 dark:text-warm-400 mb-3">
										{typeLabel(selectedType)}s perdid{selectedType === 'cat' ? 'a' : 'o'}s en <strong class="text-warm-700 dark:text-warm-200">{selectedColoniaName}</strong> — toca si reconoces a alguna
									</p>
									<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
										{#each matchingPets as pet (pet.id)}
											{@const isSelected = matchedPetId === pet.id}
											{@const isDimmed = matchedPetId !== null && !isSelected}
											<button
												type="button"
												onclick={() => toggleMatch(pet.id)}
												class="relative text-left rounded-2xl overflow-hidden border-2 transition-all duration-200 {isSelected
													? 'border-teal-400 dark:border-teal-500 shadow-lg shadow-teal-100 dark:shadow-teal-900/20 ring-2 ring-teal-300 dark:ring-teal-600'
													: isDimmed
													? 'border-warm-200 dark:border-warm-700 opacity-40'
													: 'border-warm-200 dark:border-warm-700 hover:border-warm-300 dark:hover:border-warm-600 hover:shadow-md'}"
											>
												{#if isSelected}
													<div class="absolute top-2 right-2 z-10 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center shadow">
														<svg class="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
															<path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
														</svg>
													</div>
												{/if}
												<div class="aspect-[4/3] bg-warm-100 dark:bg-warm-700 flex items-center justify-center overflow-hidden">
													{#if pet.photoUrl}
														<img src={pet.photoUrl} alt={pet.name ?? 'Mascota'} class="w-full h-full object-cover" loading="lazy" />
													{:else}
														<span class="text-4xl select-none">{typeEmoji(pet.type)}</span>
													{/if}
												</div>
												<div class="p-3 bg-white dark:bg-warm-800">
													<p class="font-semibold text-warm-900 dark:text-warm-50 text-sm truncate mb-1">{pet.name ?? 'Sin nombre'}</p>
													<div class="flex flex-wrap gap-1">
														{#if pet.color}
															<span class="text-xs bg-warm-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300 rounded-full px-2 py-0.5">{pet.color}</span>
														{/if}
														{#if pet.lastSeenAt}
															<span class="text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full px-2 py-0.5">{timeAgo(pet.lastSeenAt)}</span>
														{/if}
													</div>
												</div>
											</button>
										{/each}
									</div>

									{#if matchedPetId}
										<button type="button" onclick={() => matchedPetId = null} class="mt-3 text-xs text-warm-400 hover:text-warm-600 dark:hover:text-warm-300 transition-colors">
											Deseleccionar
										</button>
									{/if}

									<a href={`/?colonia=${selectedColoniaId}`} class="block mt-3 text-xs text-warm-400 dark:text-warm-500 hover:text-warm-600 dark:hover:text-warm-300 transition-colors">
										Ver todos los reportes en {selectedColoniaName} (incluyendo otros tipos) →
									</a>
								</div>
							{/if}
						</div>

						<!-- WhatsApp -->
						<div class="bg-white dark:bg-warm-800 rounded-3xl border border-warm-200 dark:border-warm-700 shadow-sm p-6 flex flex-col gap-3">
							<div class="flex items-center gap-3 pb-3 border-b border-warm-100 dark:border-warm-700">
								<div class="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style="background: linear-gradient(135deg,#FEF3C7,#FDE68A);">💬</div>
								<div>
									<h2 class="font-display font-semibold text-warm-900 dark:text-warm-50 text-base">Tu contacto <span class="text-warm-400 font-normal">(opcional)</span></h2>
									<p class="text-xs text-warm-400 dark:text-warm-500">Para que el dueño te escriba directamente</p>
								</div>
							</div>
							<input
								type="tel"
								bind:value={contactWhatsapp}
								maxlength={20}
								placeholder="+52 967 000 0000"
								class={inputClass}
							/>
						</div>

						{#if submitError}
							<p class="text-sm text-red-600 dark:text-red-400 text-center">{submitError}</p>
						{/if}

						<div class="flex gap-3">
							<button type="button" onclick={goBack} class="flex-1 py-3 rounded-2xl font-semibold text-sm border border-warm-200 dark:border-warm-700 text-warm-600 dark:text-warm-300 hover:border-warm-300 transition-colors">← Atrás</button>
							<button
								type="button"
								onclick={handleSubmit}
								disabled={submitting}
								class="flex-2 flex-1 py-3 rounded-2xl font-bold text-sm bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors flex items-center justify-center gap-2"
							>
								{#if submitting}
									<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Publicando…
								{:else}
									Publicar avistamiento ✓
								{/if}
							</button>
						</div>

					</div>
				{/if}

				</div>
			{/key}
		{/if}

	</div>
</div>
