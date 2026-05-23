<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type PetType = 'dog' | 'cat' | 'other';

	let selectedType = $state<PetType | ''>('');
	let selectedColoniaId = $state('');
	let selectedPetId = $state<string | null>(null);
	let sightingDesc = $state('');
	let submitting = $state(false);
	let submittedPetId = $state<string | null>(null);
	let submitError = $state('');

	const filtered = $derived(
		data.allPets.filter((p) => {
			if (selectedType && p.type !== selectedType) return false;
			if (selectedColoniaId && p.coloniaId !== selectedColoniaId) return false;
			return true;
		})
	);

	const selectedColoniaName = $derived(
		data.colonias.find((c) => c.id === selectedColoniaId)?.name ?? ''
	);

	function timeAgo(date: Date | string): string {
		const diff = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
		if (diff === 0) return 'Hoy';
		if (diff === 1) return 'Ayer';
		if (diff < 7) return `Hace ${diff} días`;
		return `Hace ${Math.floor(diff / 7)} semanas`;
	}

	function typeEmoji(type: PetType | string): string {
		if (type === 'dog') return '🐶';
		if (type === 'cat') return '🐱';
		return '🐾';
	}

	function toggleType(t: PetType) {
		selectedType = selectedType === t ? '' : t;
		selectedPetId = null;
	}

	function selectPet(petId: string) {
		if (selectedPetId === petId) {
			selectedPetId = null;
		} else {
			selectedPetId = petId;
			sightingDesc = '';
			submitError = '';
		}
	}

	async function submitSighting(petId: string, coloniaName: string) {
		submitting = true;
		submitError = '';
		try {
			const res = await fetch(`/api/pets/${petId}/sightings`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					description: sightingDesc.trim() || undefined,
					colonia: coloniaName || undefined
				})
			});
			if (!res.ok) {
				submitError = (await res.text()) || 'Error al enviar.';
				return;
			}
			submittedPetId = petId;
			selectedPetId = null;
			sightingDesc = '';
		} catch {
			submitError = 'Error de conexión. Intenta de nuevo.';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Vi una mascota perdida — SC Mascotas</title>
	<meta name="description" content="¿Viste una mascota perdida en San Cristóbal? Cuéntanos dónde y te mostramos los reportes activos en esa zona." />
</svelte:head>

<div
	class="min-h-screen bg-[#faf9f7] dark:bg-warm-900"
	style="background-image: radial-gradient(circle, rgba(180,140,60,0.07) 1px, transparent 1px); background-size: 22px 22px;"
>
	<div class="max-w-4xl mx-auto px-4 py-8">

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

		<!-- Page header -->
		<div class="mb-8">
			<div class="flex items-center gap-3 mb-2">
				<span class="text-3xl">👀</span>
				<h1 class="font-display text-3xl font-bold text-warm-900 dark:text-warm-50">
					Vi una mascota perdida
				</h1>
			</div>
			<p class="text-warm-500 dark:text-warm-400 ml-12">
				Cuéntanos dónde y te mostramos a quién podría pertenecer.
			</p>
		</div>

		<!-- Filter bar -->
		<div class="bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">

			<!-- Species pills -->
			<div class="flex items-center gap-2 flex-wrap">
				<span class="text-xs font-medium text-warm-500 dark:text-warm-400 uppercase tracking-wide whitespace-nowrap">Especie:</span>
				{#each (['dog', 'cat', 'other'] as const) as t}
					{@const label = t === 'dog' ? '🐶 Perro' : t === 'cat' ? '🐱 Gato' : '🐾 Otro'}
					<button
						onclick={() => toggleType(t)}
						class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border transition-all {selectedType === t
							? 'bg-amber-500 border-amber-500 text-white shadow-sm'
							: 'bg-warm-50 dark:bg-warm-700 border-warm-200 dark:border-warm-600 text-warm-700 dark:text-warm-200 hover:border-amber-300 dark:hover:border-amber-600'}"
					>
						{label}
					</button>
				{/each}
			</div>

			<!-- Colonia select -->
			<div class="flex items-center gap-2 sm:ml-auto w-full sm:w-auto">
				<span class="text-xs font-medium text-warm-500 dark:text-warm-400 uppercase tracking-wide whitespace-nowrap">Colonia:</span>
				<select
					bind:value={selectedColoniaId}
					onchange={() => (selectedPetId = null)}
					class="flex-1 sm:w-52 bg-warm-50 dark:bg-warm-700 border border-warm-200 dark:border-warm-600 rounded-xl px-3 py-1.5 text-sm text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
				>
					<option value="">Todas las colonias</option>
					{#each data.colonias as colonia (colonia.id)}
						<option value={colonia.id}>{colonia.name}</option>
					{/each}
				</select>
			</div>
		</div>

		<!-- Results section -->
		{#if !selectedColoniaId}
			<!-- Prompt: select a colonia -->
			<div class="flex flex-col items-center justify-center py-16 text-center gap-3">
				<span class="text-5xl">📍</span>
				<p class="text-warm-600 dark:text-warm-300 font-medium max-w-xs">
					Selecciona la colonia donde viste a la mascota para ver los reportes de esa zona.
				</p>
			</div>

		{:else if filtered.length === 0}
			<!-- Empty state -->
			<div class="flex flex-col items-center justify-center py-16 text-center gap-4">
				<span class="text-5xl">🐾</span>
				<div>
					<p class="text-warm-700 dark:text-warm-200 font-semibold mb-1">
						No encontramos reportes activos en esa zona
					</p>
					<p class="text-sm text-warm-500 dark:text-warm-400">
						Puede que la mascota aún no haya sido reportada.
					</p>
				</div>
				<a
					href="/"
					class="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 dark:text-amber-400 hover:underline"
				>
					Ver todos los reportes activos →
				</a>
			</div>

		{:else}
			<!-- Results count -->
			<div class="flex items-center justify-between mb-4">
				<p class="text-sm text-warm-600 dark:text-warm-300">
					<span class="font-semibold text-warm-900 dark:text-warm-50">{filtered.length}</span>
					{filtered.length === 1 ? 'mascota perdida' : 'mascotas perdidas'}
					{#if selectedColoniaName}en <span class="font-medium">{selectedColoniaName}</span>{/if}
				</p>
				{#if submitError && !selectedPetId}
					<p class="text-sm text-red-600 dark:text-red-400">{submitError}</p>
				{/if}
			</div>

			<!-- Pet card grid -->
			<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
				{#each filtered as pet (pet.id)}
					{@const isSelected = selectedPetId === pet.id}
					{@const isSucceeded = submittedPetId === pet.id}
					{@const isDimmed = selectedPetId !== null && !isSelected && !isSucceeded}

					<div class="flex flex-col transition-opacity duration-200 {isDimmed ? 'opacity-40' : 'opacity-100'}">

						<!-- Pet card -->
						<div
							class="bg-white dark:bg-warm-800 border rounded-2xl overflow-hidden transition-all duration-200 {isSelected
								? 'border-amber-400 dark:border-amber-500 shadow-lg shadow-amber-100 dark:shadow-amber-900/20 ring-2 ring-amber-300 dark:ring-amber-600'
								: 'border-warm-200 dark:border-warm-700 hover:border-warm-300 dark:hover:border-warm-600 hover:shadow-md'}"
						>
							{#if isSucceeded}
								<!-- Success state -->
								<div class="p-4 flex flex-col items-center justify-center gap-2 min-h-[160px] bg-green-50 dark:bg-green-900/20 text-center">
									<span class="text-2xl">✅</span>
									<p class="text-sm font-semibold text-green-700 dark:text-green-400">¡Avistamiento reportado!</p>
									<a
										href="/mascota/{pet.slug}"
										class="text-xs text-green-600 dark:text-green-400 hover:underline font-medium"
									>
										Ver reporte completo →
									</a>
								</div>
							{:else}
								<!-- Photo or emoji fallback -->
								<div class="aspect-[4/3] bg-warm-100 dark:bg-warm-700 flex items-center justify-center overflow-hidden">
									{#if pet.photoUrl}
										<img
											src={pet.photoUrl}
											alt={pet.name ?? 'Mascota'}
											class="w-full h-full object-cover"
											loading="lazy"
										/>
									{:else}
										<span class="text-5xl select-none">{typeEmoji(pet.type)}</span>
									{/if}
								</div>

								<!-- Card body -->
								<div class="p-3 flex flex-col gap-2">
									<p class="font-semibold text-warm-900 dark:text-warm-50 text-sm truncate">
										{pet.name ?? 'Sin nombre'}
									</p>

									<div class="flex flex-wrap gap-1">
										{#if pet.color}
											<span class="inline-flex items-center text-xs bg-warm-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300 rounded-full px-2 py-0.5">
												{pet.color}
											</span>
										{/if}
										{#if pet.lastSeenAt}
											<span class="inline-flex items-center text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full px-2 py-0.5">
												{timeAgo(pet.lastSeenAt)}
											</span>
										{/if}
									</div>

									<button
										onclick={() => selectPet(pet.id)}
										class="w-full mt-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-xl transition-all {isSelected
											? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
											: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40'}"
									>
										{isSelected ? 'Cancelar' : 'Esta es →'}
									</button>
								</div>
							{/if}
						</div>

						<!-- Inline sighting form (expands below the card) -->
						{#if isSelected}
							<div class="mt-2 bg-white dark:bg-warm-800 border border-amber-200 dark:border-amber-700 rounded-2xl p-4 flex flex-col gap-3">
								<p class="text-sm font-medium text-warm-900 dark:text-warm-50">
									¿Dónde exactamente la viste?
								</p>
								<textarea
									bind:value={sightingDesc}
									placeholder="Ej: Cerca del mercado, en la calle Insurgentes…  (opcional)"
									maxlength={300}
									rows={3}
									class="w-full bg-warm-50 dark:bg-warm-700 border border-warm-200 dark:border-warm-600 rounded-xl px-3 py-2 text-sm text-warm-900 dark:text-warm-100 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
								></textarea>

								{#if submitError}
									<p class="text-xs text-red-600 dark:text-red-400">{submitError}</p>
								{/if}

								<button
									onclick={() => submitSighting(pet.id, selectedColoniaName)}
									disabled={submitting}
									class="w-full py-2 px-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-colors"
								>
									{submitting ? 'Enviando…' : 'Confirmar avistamiento'}
								</button>

								<button
									onclick={() => (selectedPetId = null)}
									class="text-xs text-warm-400 dark:text-warm-500 hover:text-warm-600 dark:hover:text-warm-300 transition-colors text-center"
								>
									Cancelar
								</button>
							</div>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Footer link -->
			{#if selectedColoniaId && selectedColoniaName}
				<div class="mt-8 text-center">
					<a
						href="/?colonia={selectedColoniaId}"
						class="inline-flex items-center gap-1.5 text-sm font-medium text-warm-500 dark:text-warm-400 hover:text-warm-800 dark:hover:text-warm-200 transition-colors"
					>
						Ver todos los reportes en {selectedColoniaName} →
					</a>
				</div>
			{/if}
		{/if}

	</div>
</div>
