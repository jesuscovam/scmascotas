<script lang="ts">
	type Sighting = {
		id: string;
		description: string | null;
		colonia: string | null;
		createdAt: Date | string;
	};

	type Props = {
		petId: string;
		sightings?: Sighting[];
		onSightingAdded?: () => void;
	};

	let { petId, sightings = [], onSightingAdded }: Props = $props();

	let localSightings = $state<Sighting[]>([...sightings]);
	let description = $state('');
	let colonia = $state('');
	let submitting = $state(false);
	let submitError = $state('');
	let justSubmitted = $state(false);

	function timeAgo(date: Date | string): string {
		const d = new Date(date);
		const diff = Math.floor((Date.now() - d.getTime()) / 86_400_000);
		if (diff === 0) return 'Hoy';
		if (diff === 1) return 'Ayer';
		if (diff < 7) return `Hace ${diff} días`;
		if (diff < 30) return `Hace ${Math.floor(diff / 7)} semanas`;
		return `Hace ${Math.floor(diff / 30)} meses`;
	}

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		submitting = true;
		submitError = '';

		try {
			const res = await fetch(`/api/pets/${petId}/sightings`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					description: description.trim() || undefined,
					colonia: colonia.trim() || undefined
				})
			});

			if (!res.ok) {
				const text = await res.text().catch(() => '');
				submitError = text || 'Error al enviar el avistamiento. Intenta de nuevo.';
				return;
			}

			const newSighting: Sighting = await res.json();
			localSightings = [newSighting, ...localSightings];
			description = '';
			colonia = '';
			justSubmitted = true;
			setTimeout(() => (justSubmitted = false), 3000);
			onSightingAdded?.();
		} catch {
			submitError = 'Error de conexión. Intenta de nuevo.';
		} finally {
			submitting = false;
		}
	}
</script>

<section class="flex flex-col gap-5">
	<!-- Section header -->
	<div class="flex items-center gap-3">
		<div
			class="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-sm"
		>
			👀
		</div>
		<h2 class="font-display font-semibold text-warm-900 dark:text-warm-50 text-lg">
			Avistamientos
		</h2>
		{#if localSightings.length > 0}
			<span
				class="ml-auto text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2.5 py-0.5 rounded-full"
			>
				{localSightings.length}
			</span>
		{/if}
	</div>

	<!-- Report form -->
	<div
		class="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 border-l-[3px] border-l-amber-400 rounded-2xl overflow-hidden"
	>
		{#if justSubmitted}
			<div
				class="flex items-center gap-3 px-5 py-4 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800"
			>
				<svg
					class="w-5 h-5 text-green-600 dark:text-green-400 shrink-0"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polyline points="20 6 9 17 4 12" />
				</svg>
				<p class="text-sm font-medium text-green-700 dark:text-green-300">
					¡Avistamiento reportado! Gracias por ayudar.
				</p>
			</div>
		{/if}

		<form onsubmit={submit} class="p-5 flex flex-col gap-3">
			<p class="text-sm font-semibold text-warm-800 dark:text-warm-200">¿Lo viste? Repórtalo</p>

			<textarea
				bind:value={description}
				maxlength="500"
				placeholder="Cuéntanos dónde lo viste…"
				rows="3"
				class="w-full rounded-xl border border-warm-200 dark:border-warm-600 bg-white dark:bg-warm-800/80 text-warm-900 dark:text-warm-50 placeholder-warm-400 dark:placeholder-warm-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/70 dark:focus:ring-amber-500/70 focus:border-transparent transition-all resize-none leading-relaxed"
			></textarea>

			<input
				bind:value={colonia}
				type="text"
				placeholder="Colonia donde lo viste"
				class="w-full rounded-xl border border-warm-200 dark:border-warm-600 bg-white dark:bg-warm-800/80 text-warm-900 dark:text-warm-50 placeholder-warm-400 dark:placeholder-warm-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/70 dark:focus:ring-amber-500/70 focus:border-transparent transition-all"
			/>

			{#if submitError}
				<p
					class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3"
				>
					{submitError}
				</p>
			{/if}

			<div class="flex justify-end">
				<button
					type="submit"
					disabled={submitting}
					class="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm"
				>
					{#if submitting}
						<svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
							></path>
						</svg>
						Enviando…
					{:else}
						Reportar avistamiento
					{/if}
				</button>
			</div>
		</form>
	</div>

	<!-- Sightings feed -->
	{#if localSightings.length === 0}
		<p class="text-center text-sm text-warm-400 dark:text-warm-500 py-3 italic">
			Sin avistamientos aún. Sé el primero en reportar.
		</p>
	{:else}
		<div class="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
			{#each localSightings as sighting (sighting.id)}
				<div
					class="bg-warm-50 dark:bg-warm-800/60 border-l-2 border-l-warm-200 dark:border-l-warm-600 rounded-r-xl pl-4 pr-4 py-3"
				>
					{#if sighting.description}
						<p class="text-sm text-warm-800 dark:text-warm-200 leading-relaxed">
							{sighting.description}
						</p>
					{:else}
						<p class="text-sm text-warm-400 dark:text-warm-500 italic">Sin descripción</p>
					{/if}

					<div class="flex items-center gap-2 mt-1.5 flex-wrap">
						{#if sighting.colonia}
							<span
								class="text-xs text-warm-500 dark:text-warm-400 flex items-center gap-1"
							>
								<svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
									<path
										fill-rule="evenodd"
										d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
										clip-rule="evenodd"
									/>
								</svg>
								{sighting.colonia}
							</span>
							<span class="text-warm-300 dark:text-warm-600 text-xs">·</span>
						{/if}
						<span class="text-xs text-warm-400 dark:text-warm-500"
							>{timeAgo(sighting.createdAt)}</span
						>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>
