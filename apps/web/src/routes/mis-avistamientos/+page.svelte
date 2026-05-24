<script lang="ts">
	import { Button, Spinner, Input, Item, Empty } from '@scmascotas/ui';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	let showClaimForm = $state(false);
	let claimToken = $state('');
	let claimError = $state('');
	let claimSuccess = $state(false);
	let claimLoading = $state(false);

	const typeEmoji: Record<string, string> = { dog: '🐶', cat: '🐱', other: '🐾' };
	const typeLabel: Record<string, string> = { dog: 'Perro', cat: 'Gato', other: 'Otro' };
	const sizeLabel: Record<string, string> = { small: 'Pequeño', medium: 'Mediano', large: 'Grande' };

	const openCount = $derived(data.sightings.filter((s: { status: string }) => s.status === 'open').length);
	const resolvedCount = $derived(data.sightings.filter((s: { status: string }) => s.status === 'resolved').length);

	function formatDate(d: Date | string) {
		return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d));
	}

	async function handleClaim(e: SubmitEvent) {
		e.preventDefault();
		claimError = '';
		claimSuccess = false;
		claimLoading = true;

		const res = await fetch('/api/spotted-pets/claim', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ editToken: claimToken })
		});

		claimLoading = false;

		if (res.ok) {
			claimSuccess = true;
			claimToken = '';
			showClaimForm = false;
			await invalidateAll();
		} else {
			const body = await res.json().catch(() => ({}));
			claimError = body.message ?? 'Token inválido o avistamiento no encontrado';
		}
	}

	function cancelClaim() {
		showClaimForm = false;
		claimToken = '';
		claimError = '';
	}
</script>

<svelte:head><title>Mis avistamientos — SC Mascotas</title></svelte:head>

<div class="min-h-[calc(100vh-4rem)] bg-warm-50 dark:bg-warm-900 pb-20">

	<!-- Header strip -->
	<div class="relative overflow-hidden bg-white dark:bg-warm-800 border-b border-warm-200 dark:border-warm-700">
		<div class="absolute inset-0 pointer-events-none" aria-hidden="true">
			<div class="absolute -top-10 -right-10 w-64 h-48 rounded-full bg-teal-100/50 dark:bg-teal-900/15 blur-3xl"></div>
			<div class="absolute top-2 left-1/2 w-40 h-20 rounded-full bg-warm-100/60 dark:bg-warm-700/20 blur-2xl"></div>
		</div>
		<div class="relative max-w-5xl mx-auto px-4 py-8">
			<div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
				<div>
					<p class="text-xs font-medium text-warm-400 dark:text-warm-500 mb-1 tracking-wide uppercase">
						{data.user.name ?? data.user.email}
					</p>
					<h1 class="font-display text-3xl font-bold text-warm-900 dark:text-warm-50 leading-tight">
						Mis avistamientos
					</h1>

					{#if data.sightings.length > 0}
						<div class="flex items-center gap-3 mt-3 flex-wrap">
							<span class="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-warm-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300 border border-warm-200 dark:border-warm-600">
								{data.sightings.length} reporte{data.sightings.length !== 1 ? 's' : ''}
							</span>
							{#if openCount > 0}
								<span class="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-700">
									<span class="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400"></span>
									{openCount} abierto{openCount !== 1 ? 's' : ''}
								</span>
							{/if}
							{#if resolvedCount > 0}
								<span class="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
									<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
									{resolvedCount} resuelto{resolvedCount !== 1 ? 's' : ''}
								</span>
							{/if}
						</div>
					{/if}
				</div>

				<Button.Root href="/reportar/vi" class="rounded-full px-5 gap-2 shrink-0 self-start sm:self-auto">
					<svg class="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M8 2v12M2 8h12"/></svg>
					Reportar avistamiento
				</Button.Root>
			</div>
		</div>
	</div>

	<div class="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">

		<!-- Claim success banner -->
		{#if claimSuccess}
			<div class="flex items-center gap-3 text-sm text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-xl px-4 py-3">
				<svg class="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="7"/><polyline points="5,8 7,10 11,6"/></svg>
				¡Avistamiento reclamado correctamente! Ya aparece en tu lista.
			</div>
		{/if}

		<!-- Sighting grid -->
		{#if data.sightings.length === 0}
			<Empty.Root class="rounded-2xl border-2 border-dashed border-warm-200 dark:border-warm-700 bg-white dark:bg-warm-800/40 py-16">
				<Empty.Header>
					<Empty.Media variant="icon" class="relative w-20 h-20 rounded-full bg-teal-50 dark:bg-teal-900/20 text-4xl">
						<span class="select-none">👀</span>
						<span class="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-warm-100 dark:bg-warm-700 border-2 border-white dark:border-warm-800 flex items-center justify-center text-base select-none">🐾</span>
					</Empty.Media>
					<Empty.Title class="font-display text-xl font-semibold text-warm-800 dark:text-warm-200">Sin avistamientos aún</Empty.Title>
					<Empty.Description class="text-warm-400 dark:text-warm-500 max-w-xs mx-auto leading-relaxed">
						Cuando reportes una mascota avistada, aparecerá aquí para que puedas seguir su estado.
					</Empty.Description>
				</Empty.Header>
				<Empty.Content>
					<Button.Root href="/reportar/vi" class="rounded-full px-6 gap-2">
						<svg class="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M8 2v12M2 8h12"/></svg>
						Reportar mi primer avistamiento
					</Button.Root>
				</Empty.Content>
			</Empty.Root>
		{:else}
			<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each data.sightings as s (s.id)}
					<a
						href="/avistamientos/{s.slug}"
						class="group relative flex flex-col bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-xl shadow-sm hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700 transition-all sighting-card overflow-hidden"
					>
						<!-- Status accent bar -->
						<div class="h-0.5 w-full
							{s.status === 'resolved' ? 'bg-emerald-400 dark:bg-emerald-500' : 'bg-teal-400 dark:bg-teal-500'}">
						</div>

						<div class="p-5 flex flex-col gap-3 flex-1">
							<div class="flex items-start justify-between gap-2">
								<!-- Type icon + description -->
								<div class="flex items-center gap-2.5 min-w-0">
									<div class="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-lg shrink-0 select-none">
										{typeEmoji[s.type] ?? '🐾'}
									</div>
									<div class="min-w-0">
										<p class="font-display font-semibold text-warm-900 dark:text-warm-50 group-hover:text-teal-800 dark:group-hover:text-teal-400 transition-colors leading-tight">
											{typeLabel[s.type] ?? s.type}
										</p>
										<p class="text-xs text-warm-400 dark:text-warm-500 mt-0.5 truncate">
											{s.colonia ?? 'Sin colonia'}{s.color ? ` · ${s.color}` : ''}{s.size ? ` · ${sizeLabel[s.size]}` : ''}
										</p>
									</div>
								</div>

								<!-- Status badge -->
								<span class="shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full border
									{s.status === 'resolved'
										? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700'
										: 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-700'}">
									{s.status === 'resolved' ? 'Resuelto' : 'Abierto'}
								</span>
							</div>

							{#if s.description}
								<p class="text-xs text-warm-500 dark:text-warm-400 leading-relaxed line-clamp-2">
									{s.description}
								</p>
							{/if}

							<!-- Matched pet link -->
							{#if s.matchedPetName && s.matchedPetSlug}
								<div class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs">
									<span class="text-base leading-none">🐾</span>
									<span class="font-medium text-amber-800 dark:text-amber-300 truncate">
										Vinculado a {s.matchedPetName}
									</span>
									<svg class="w-3 h-3 text-amber-500 shrink-0 ml-auto" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h8M6 2l4 4-4 4"/></svg>
								</div>
							{/if}

							<div class="flex items-center justify-between mt-auto pt-1 border-t border-warm-100 dark:border-warm-700">
								<p class="text-xs text-warm-400 dark:text-warm-500">
									{formatDate(s.createdAt)}
								</p>
								<span class="text-xs text-warm-300 dark:text-warm-600 group-hover:text-teal-600 dark:group-hover:text-teal-500 transition-colors flex items-center gap-0.5">
									Ver
									<svg class="w-3 h-3 -translate-x-0.5 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h8M6 2l4 4-4 4"/></svg>
								</span>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{/if}

		<!-- Claim section -->
		<div class="border-t border-warm-200 dark:border-warm-700 pt-8">
			{#if showClaimForm}
				<form
					onsubmit={handleClaim}
					class="bg-white dark:bg-warm-800 border border-teal-300 dark:border-teal-700 rounded-xl px-5 py-4 flex flex-col gap-3 shadow-sm max-w-lg"
				>
					<div>
						<p class="font-display text-base font-semibold text-warm-900 dark:text-warm-50">Reclamar avistamiento anónimo</p>
						<p class="text-xs text-warm-500 dark:text-warm-400 mt-0.5">Pega el token de edición que recibiste al reportar el avistamiento.</p>
					</div>

					{#if claimError}
						<div class="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
							<svg class="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="7"/><path d="M8 5v4M8 11v1" stroke-linecap="round"/></svg>
							{claimError}
						</div>
					{/if}

					<div class="flex flex-col gap-1.5">
						<Input.Input
							type="text"
							placeholder="Token de edición (ej. a1b2c3d4…)"
							bind:value={claimToken}
							required
							disabled={claimLoading}
							autocomplete="off"
						/>
					</div>

					<div class="flex gap-2 justify-end">
						<Button.Root variant="ghost" class="text-sm" onclick={cancelClaim} disabled={claimLoading} type="button">
							Cancelar
						</Button.Root>
						<Button.Root type="submit" class="text-sm gap-2 rounded-full px-5" disabled={claimLoading || !claimToken.trim()}>
							{#if claimLoading}
								<Spinner class="size-3.5" />
								Reclamando…
							{:else}
								Reclamar avistamiento
							{/if}
						</Button.Root>
					</div>
				</form>
			{:else}
				<button
					onclick={() => (showClaimForm = true)}
					class="group w-full max-w-lg text-left bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 hover:border-teal-300 dark:hover:border-teal-700 rounded-xl shadow-sm hover:shadow-md transition-all claim-card"
				>
					<Item.Root>
						<Item.Media class="w-10 h-10 rounded-lg bg-warm-100 dark:bg-warm-700 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/40 flex items-center justify-center text-warm-400 dark:text-warm-500 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
							<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
								<circle cx="11" cy="11" r="7"/>
								<path d="M11 8v3l2 2M21 21l-4-4"/>
							</svg>
						</Item.Media>
						<Item.Content>
							<Item.Title class="text-sm font-semibold text-warm-700 dark:text-warm-300 group-hover:text-warm-900 dark:group-hover:text-warm-50 transition-colors">
								¿Reportaste antes de crear tu cuenta?
							</Item.Title>
							<Item.Description class="text-xs text-warm-400 dark:text-warm-500">
								Usa tu token de edición para reclamar el avistamiento
							</Item.Description>
						</Item.Content>
						<Item.Actions>
							<svg class="w-4 h-4 text-warm-300 dark:text-warm-600 group-hover:text-teal-500 dark:group-hover:text-teal-400 -translate-x-0.5 group-hover:translate-x-0.5 transition-all" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M3 8h10M8 3l5 5-5 5"/>
							</svg>
						</Item.Actions>
					</Item.Root>
				</button>
			{/if}
		</div>

	</div>
</div>

<style>
	.sighting-card {
		transition: box-shadow 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
	}
	.claim-card {
		transition: box-shadow 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
	}
	.claim-card:hover {
		transform: translateY(-1px);
	}
	.sighting-card:hover {
		transform: translateY(-2px);
	}
</style>
