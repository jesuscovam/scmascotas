<script lang="ts">
	import { Button, Spinner, Input, Item, Empty } from '@scmascotas/ui';
	import AlphaBanner from '$lib/components/AlphaBanner.svelte';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	let activeTab = $state<'active' | 'archived'>('active');
	let archivingId = $state<string | null>(null);

	let showClaimForm = $state(false);
	let claimToken = $state('');
	let claimError = $state('');
	let claimSuccess = $state(false);
	let claimLoading = $state(false);

	const typeEmoji: Record<string, string> = { dog: '🐶', cat: '🐱', other: '🐾' };
	const typeLabel: Record<string, string> = { dog: 'Perro', cat: 'Gato', other: 'Otro' };

	const statusLabel: Record<string, string> = {
		missing: 'Desaparecida',
		reunited: 'Reunida',
		archived: 'Archivada'
	};

	const statusClasses: Record<string, string> = {
		missing: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700',
		reunited: 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-700',
		archived: 'bg-warm-100 dark:bg-warm-700 text-warm-500 dark:text-warm-400 border-warm-200 dark:border-warm-600'
	};

	const activePets = $derived(
		data.pets.filter((p: { status: string }) => p.status !== 'archived')
	);
	const archivedPets = $derived(
		data.pets.filter((p: { status: string }) => p.status === 'archived')
	);
	const shownPets = $derived(activeTab === 'active' ? activePets : archivedPets);

	const missingCount = $derived(activePets.filter((p: { status: string }) => p.status === 'missing').length);
	const reunitedCount = $derived(activePets.filter((p: { status: string }) => p.status === 'reunited').length);

	function formatDate(d: Date | string) {
		return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d));
	}

	async function handleArchive(id: string, archive: boolean) {
		if (archivingId) return;
		archivingId = id;
		try {
			const res = await fetch(`/api/pets/${id}/archive`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ archived: archive })
			});
			if (res.ok) await invalidateAll();
		} finally {
			archivingId = null;
		}
	}

	async function handleClaim(e: SubmitEvent) {
		e.preventDefault();
		claimError = '';
		claimSuccess = false;
		claimLoading = true;

		const res = await fetch('/api/pets/claim', {
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
			claimError = body.message ?? 'Token inválido o reporte no encontrado';
		}
	}

	function cancelClaim() {
		showClaimForm = false;
		claimToken = '';
		claimError = '';
	}
</script>

<svelte:head><title>Mis mascotas — SC Mascotas</title></svelte:head>

<div class="min-h-[calc(100vh-4rem)] bg-warm-50 dark:bg-warm-900 pb-20">

	<!-- Header strip -->
	<div class="relative overflow-hidden bg-white dark:bg-warm-800 border-b border-warm-200 dark:border-warm-700">
		<div class="absolute inset-0 pointer-events-none" aria-hidden="true">
			<div class="absolute -top-10 -right-10 w-64 h-48 rounded-full bg-amber-100/50 dark:bg-amber-900/15 blur-3xl"></div>
			<div class="absolute top-2 left-1/2 w-40 h-20 rounded-full bg-warm-100/60 dark:bg-warm-700/20 blur-2xl"></div>
		</div>
		<div class="relative max-w-5xl mx-auto px-4 py-8">
			<div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
				<div>
					<p class="text-xs font-medium text-warm-400 dark:text-warm-500 mb-1 tracking-wide uppercase">
						{data.user.name ?? data.user.email}
					</p>
					<h1 class="font-display text-3xl font-bold text-warm-900 dark:text-warm-50 leading-tight">
						Mis mascotas
					</h1>

					{#if activePets.length > 0}
						<div class="flex items-center gap-3 mt-3 flex-wrap">
							<span class="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-warm-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300 border border-warm-200 dark:border-warm-600">
								{activePets.length} reporte{activePets.length !== 1 ? 's' : ''}
							</span>
							{#if missingCount > 0}
								<span class="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
									<span class="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400"></span>
									{missingCount} buscando hogar
								</span>
							{/if}
							{#if reunitedCount > 0}
								<span class="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-700">
									<span class="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400"></span>
									{reunitedCount} reunida{reunitedCount !== 1 ? 's' : ''}
								</span>
							{/if}
						</div>
					{/if}
				</div>

				<Button.Root href="/reportar" class="rounded-full px-5 gap-2 shrink-0 self-start sm:self-auto">
					<svg class="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M8 2v12M2 8h12"/></svg>
					Reportar mascota
				</Button.Root>
			</div>
		</div>
	</div>

	<div class="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">

		<AlphaBanner />

		<!-- Claim success banner -->
		{#if claimSuccess}
			<div class="flex items-center gap-3 text-sm text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-xl px-4 py-3">
				<svg class="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="7"/><polyline points="5,8 7,10 11,6"/></svg>
				¡Reporte reclamado correctamente! Ya aparece en tu lista.
			</div>
		{/if}

		<!-- Tab switcher -->
		{#if data.pets.length > 0 || archivedPets.length > 0}
			<div class="flex items-center gap-1 bg-warm-100 dark:bg-warm-800 p-1 rounded-full w-fit shadow-inner">
				<button
					onclick={() => (activeTab = 'active')}
					class="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
						{activeTab === 'active'
							? 'bg-white dark:bg-warm-700 text-warm-900 dark:text-warm-50 shadow-sm'
							: 'text-warm-500 dark:text-warm-400 hover:text-warm-700 dark:hover:text-warm-300'}"
				>
					Activos
					{#if activePets.length > 0}
						<span class="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full
							{activeTab === 'active'
								? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
								: 'bg-warm-200 dark:bg-warm-700 text-warm-500 dark:text-warm-400'}">
							{activePets.length}
						</span>
					{/if}
				</button>
				<button
					onclick={() => (activeTab = 'archived')}
					class="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
						{activeTab === 'archived'
							? 'bg-white dark:bg-warm-700 text-warm-900 dark:text-warm-50 shadow-sm'
							: 'text-warm-500 dark:text-warm-400 hover:text-warm-700 dark:hover:text-warm-300'}"
				>
					Archivados
					{#if archivedPets.length > 0}
						<span class="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full
							{activeTab === 'archived'
								? 'bg-warm-200 dark:bg-warm-700 text-warm-700 dark:text-warm-200'
								: 'bg-warm-200 dark:bg-warm-700 text-warm-500 dark:text-warm-400'}">
							{archivedPets.length}
						</span>
					{/if}
				</button>
			</div>
		{/if}

		<!-- Pet grid -->
		{#if shownPets.length === 0}
			{#if activeTab === 'archived'}
				<!-- Empty archived state -->
				<div class="flex flex-col items-center justify-center py-16 text-center rounded-2xl border-2 border-dashed border-warm-200 dark:border-warm-700 bg-white dark:bg-warm-800/40">
					<div class="w-16 h-16 rounded-full bg-warm-100 dark:bg-warm-800 flex items-center justify-center mb-4 border border-warm-200 dark:border-warm-700">
						<svg class="w-7 h-7 text-warm-300 dark:text-warm-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
							<path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/>
						</svg>
					</div>
					<p class="font-display font-semibold text-warm-700 dark:text-warm-300 mb-1">Sin archivados</p>
					<p class="text-sm text-warm-400 dark:text-warm-500 max-w-xs leading-relaxed">
						Los reportes que archives aparecerán aquí. Puedes restaurarlos en cualquier momento.
					</p>
				</div>
			{:else}
				<Empty.Root class="rounded-2xl border-2 border-dashed border-warm-200 dark:border-warm-700 bg-white dark:bg-warm-800/40 py-16">
					<Empty.Header>
						<Empty.Media variant="icon" class="relative w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-900/20 text-4xl">
							<span class="select-none">🔍</span>
							<span class="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-warm-100 dark:bg-warm-700 border-2 border-white dark:border-warm-800 flex items-center justify-center text-base select-none">🐾</span>
						</Empty.Media>
						<Empty.Title class="font-display text-xl font-semibold text-warm-800 dark:text-warm-200">Sin reportes aún</Empty.Title>
						<Empty.Description class="text-warm-400 dark:text-warm-500 max-w-xs mx-auto leading-relaxed">
							Cuando reportes una mascota perdida o encontrada, aparecerá aquí para que puedas seguir su estado.
						</Empty.Description>
					</Empty.Header>
					<Empty.Content>
						<Button.Root href="/reportar" class="rounded-full px-6 gap-2">
							<svg class="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M8 2v12M2 8h12"/></svg>
							Reportar mi primera mascota
						</Button.Root>
					</Empty.Content>
				</Empty.Root>
			{/if}
		{:else}
			<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each shownPets as pet (pet.id)}
					<div
						class="group relative flex flex-col bg-white dark:bg-warm-800 border rounded-xl shadow-sm overflow-hidden pet-card
							{activeTab === 'archived'
								? 'border-warm-200 dark:border-warm-700 opacity-75 hover:opacity-100'
								: 'border-warm-200 dark:border-warm-700 hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700'}
							{archivingId === pet.id ? 'opacity-40 pointer-events-none' : ''}"
					>
						<!-- Full-card link -->
						<a
							href="/mascota/{pet.slug}"
							class="absolute inset-0 z-0 rounded-xl focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500 focus-visible:outline-none"
							aria-label="Ver {pet.name ?? 'mascota'}"
						></a>

						<!-- Card content (pointer-events-none so clicks fall through to the <a>) -->
						<div class="relative z-10 flex flex-col flex-1 pointer-events-none">
							<!-- Status accent bar -->
							<div class="h-0.5 w-full
								{pet.status === 'missing' ? 'bg-amber-400 dark:bg-amber-500' :
								 pet.status === 'reunited' ? 'bg-teal-400 dark:bg-teal-500' :
								 'bg-warm-200 dark:bg-warm-700'}">
							</div>

							<div class="p-5 flex flex-col gap-3 flex-1">
								<div class="flex items-start justify-between gap-2">
									<div class="flex items-center gap-2.5 min-w-0">
										<div class="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 select-none
											{activeTab === 'archived' ? 'bg-warm-100 dark:bg-warm-700' : 'bg-amber-50 dark:bg-amber-900/30'}">
											{typeEmoji[pet.type] ?? '🐾'}
										</div>
										<div class="min-w-0">
											<p class="font-display font-semibold leading-tight truncate
												{activeTab === 'archived' ? 'text-warm-500 dark:text-warm-400' : 'text-warm-900 dark:text-warm-50 group-hover:text-amber-800 dark:group-hover:text-amber-400'} transition-colors">
												{pet.name ?? 'Sin nombre'}
											</p>
											<p class="text-xs text-warm-400 dark:text-warm-500 mt-0.5">
												{typeLabel[pet.type] ?? pet.type}{pet.colonia ? ` · ${pet.colonia}` : ''}
											</p>
										</div>
									</div>

									<!-- Status badge -->
									<span class="shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full border {statusClasses[pet.status] ?? statusClasses.archived}">
										{statusLabel[pet.status] ?? pet.status}
									</span>
								</div>

								<div class="flex items-center justify-between mt-auto pt-1 border-t border-warm-100 dark:border-warm-700">
									<p class="text-xs text-warm-400 dark:text-warm-500">
										{formatDate(pet.createdAt)}
									</p>
									<span class="text-xs text-warm-300 dark:text-warm-600 flex items-center gap-0.5
										{activeTab === 'archived' ? '' : 'group-hover:text-amber-600 dark:group-hover:text-amber-500'} transition-colors">
										Ver
										<svg class="w-3 h-3 -translate-x-0.5 {activeTab === 'archived' ? '' : 'group-hover:translate-x-0.5'} transition-transform" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h8M6 2l4 4-4 4"/></svg>
									</span>
								</div>
							</div>
						</div>

						<!-- Archive / Restore action -->
						{#if activeTab === 'active'}
							<button
								class="absolute top-3 right-3 z-10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-150
									bg-warm-100 dark:bg-warm-700 hover:bg-warm-200 dark:hover:bg-warm-600
									text-warm-400 dark:text-warm-500 hover:text-warm-700 dark:hover:text-warm-200"
								onclick={() => handleArchive(pet.id, true)}
								title="Archivar reporte"
								disabled={archivingId === pet.id}
								aria-label="Archivar este reporte"
							>
								{#if archivingId === pet.id}
									<svg class="w-3.5 h-3.5 animate-spin" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="6" stroke-opacity=".25"/><path d="M14 8a6 6 0 00-6-6"/></svg>
								{:else}
									<svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
										<rect x="1" y="1" width="14" height="5" rx="1"/>
										<path d="M2 6v8a1 1 0 001 1h10a1 1 0 001-1V6"/>
										<path d="M6 10h4"/>
									</svg>
								{/if}
							</button>
						{:else}
							<button
								class="absolute top-3 right-3 z-10 p-1.5 rounded-lg transition-all duration-150
									bg-warm-100 dark:bg-warm-700 hover:bg-amber-100 dark:hover:bg-amber-900/40
									text-warm-400 dark:text-warm-500 hover:text-amber-600 dark:hover:text-amber-400"
								onclick={() => handleArchive(pet.id, false)}
								title="Restaurar reporte"
								disabled={archivingId === pet.id}
								aria-label="Restaurar este reporte"
							>
								{#if archivingId === pet.id}
									<svg class="w-3.5 h-3.5 animate-spin" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="6" stroke-opacity=".25"/><path d="M14 8a6 6 0 00-6-6"/></svg>
								{:else}
									<svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
										<rect x="1" y="1" width="14" height="5" rx="1"/>
										<path d="M2 6v8a1 1 0 001 1h10a1 1 0 001-1V6"/>
										<path d="M8 11V8M6 9.5l2-2 2 2"/>
									</svg>
								{/if}
							</button>
						{/if}
					</div>
				{/each}
			</div>
		{/if}

		<!-- Claim section (only on active tab) -->
		{#if activeTab === 'active'}
			<div class="border-t border-warm-200 dark:border-warm-700 pt-6">
				{#if showClaimForm}
					<form
						onsubmit={handleClaim}
						class="bg-white dark:bg-warm-800 border border-amber-300 dark:border-amber-700 rounded-xl px-5 py-4 flex flex-col gap-3 shadow-sm max-w-lg"
					>
						<div>
							<p class="font-display text-base font-semibold text-warm-900 dark:text-warm-50">Reclamar reporte anónimo</p>
							<p class="text-xs text-warm-500 dark:text-warm-400 mt-0.5">Pega el token de edición que recibiste al reportar la mascota.</p>
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
									Reclamar reporte
								{/if}
							</Button.Root>
						</div>
					</form>
				{:else}
					<button
						onclick={() => (showClaimForm = true)}
						class="group w-full max-w-lg text-left bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 hover:border-amber-300 dark:hover:border-amber-700 rounded-xl shadow-sm hover:shadow-md transition-all claim-card"
					>
						<Item.Root>
							<Item.Media class="w-10 h-10 rounded-lg bg-warm-100 dark:bg-warm-700 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 flex items-center justify-center text-warm-400 dark:text-warm-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
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
									Usa tu token de edición para reclamar el reporte
								</Item.Description>
							</Item.Content>
							<Item.Actions>
								<svg class="w-4 h-4 text-warm-300 dark:text-warm-600 group-hover:text-amber-500 dark:group-hover:text-amber-400 -translate-x-0.5 group-hover:translate-x-0.5 transition-all" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M3 8h10M8 3l5 5-5 5"/>
								</svg>
							</Item.Actions>
						</Item.Root>
					</button>
				{/if}
			</div>
		{/if}

	</div>
</div>

<style>
	.pet-card {
		transition: box-shadow 0.15s ease, border-color 0.15s ease, transform 0.1s ease, opacity 0.15s ease;
	}
	.pet-card:hover {
		transform: translateY(-2px);
	}
	.claim-card {
		transition: box-shadow 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
	}
	.claim-card:hover {
		transform: translateY(-1px);
	}
</style>
