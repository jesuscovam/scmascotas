<script lang="ts">
	import { Button, Spinner, Input, Label, Empty } from '@scmascotas/ui';
	import { authClient } from '$lib/auth-client';
	import { onMount } from 'svelte';

	type ApiKey = {
		id: string;
		name?: string | null;
		start?: string | null;
		prefix?: string | null;
		createdAt: Date;
		enabled?: boolean | null;
	};

	let keys: ApiKey[] = $state([]);
	let loading = $state(true);
	let creating = $state(false);
	let revokingId = $state<string | null>(null);
	let showForm = $state(false);
	let newKeyName = $state('');
	let newKeyValue = $state('');
	let copied = $state(false);
	let error = $state('');

	onMount(async () => {
		await loadKeys();
	});

	async function loadKeys() {
		loading = true;
		const result = await authClient.apiKey.list();
		loading = false;
		if (result.data?.apiKeys) keys = result.data.apiKeys as unknown as ApiKey[];
	}

	async function createKey(e: SubmitEvent) {
		e.preventDefault();
		creating = true;
		error = '';
		newKeyValue = '';
		const result = await authClient.apiKey.create({ name: newKeyName.trim() || 'Mi llave API' });
		creating = false;
		if (result.error) {
			error = result.error.message ?? 'No se pudo crear la llave';
		} else if (result.data?.key) {
			newKeyValue = result.data.key;
			newKeyName = '';
			showForm = false;
			await loadKeys();
		}
	}

	function cancelCreate() {
		showForm = false;
		newKeyName = '';
		error = '';
	}

	async function copyKey() {
		await navigator.clipboard.writeText(newKeyValue);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	async function revokeKey(id: string) {
		revokingId = id;
		await authClient.apiKey.delete({ keyId: id });
		revokingId = null;
		await loadKeys();
	}

	function formatDate(d: Date) {
		return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d));
	}
</script>

<svelte:head><title>Llaves API — SC Mascotas</title></svelte:head>

<div class="min-h-[calc(100vh-4rem)] bg-warm-50 dark:bg-warm-900 pb-20">

	<!-- Header -->
	<div class="relative overflow-hidden bg-white dark:bg-warm-800 border-b border-warm-200 dark:border-warm-700">
		<div class="absolute inset-0 pointer-events-none" aria-hidden="true">
			<div class="absolute top-0 right-0 w-64 h-32 bg-amber-50/80 dark:bg-amber-900/10 blur-3xl"></div>
			<!-- Decorative code brackets watermark -->
			<svg class="absolute right-4 top-1/2 -translate-y-1/2 w-28 h-20 text-warm-200 dark:text-warm-700 opacity-50 select-none" viewBox="0 0 112 80" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
				<path d="M28 8 L8 40 L28 72"/>
				<path d="M84 8 L104 40 L84 72"/>
				<path d="M50 16 L62 64"/>
			</svg>
		</div>
		<div class="relative max-w-2xl mx-auto px-4 py-8">
			<a
				href="/perfil"
				class="inline-flex items-center gap-1.5 text-xs font-medium text-warm-400 dark:text-warm-500 hover:text-warm-700 dark:hover:text-warm-300 transition-colors mb-5"
			>
				<svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M10 13L5 8l5-5"/>
				</svg>
				Mi perfil
			</a>
			<div class="flex items-center gap-4">
				<div class="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
					<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
						<path d="M10 20l4-16M5 8L1 12l4 4M19 8l4 4-4 4"/>
					</svg>
				</div>
				<div>
					<h1 class="font-display text-2xl font-bold text-warm-900 dark:text-warm-50 leading-tight">
						Llaves API
					</h1>
					<p class="text-sm text-warm-500 dark:text-warm-400 mt-0.5">
						Autenticación para apps externas · prefijo <code class="font-mono text-xs bg-warm-100 dark:bg-warm-700 px-1.5 py-0.5 rounded">scp_</code>
					</p>
				</div>
			</div>
		</div>
	</div>

	<div class="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">

		<!-- One-time key reveal -->
		{#if newKeyValue}
			<div class="rounded-xl border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/20 p-4 flex flex-col gap-3">
				<div class="flex items-center gap-2">
					<svg class="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="7"/><polyline points="5,8 7,10 11,6"/></svg>
					<p class="text-sm font-semibold text-teal-800 dark:text-teal-300">Llave creada — guárdala ahora</p>
				</div>
				<p class="text-xs text-teal-700 dark:text-teal-400">Esta es la única vez que verás el valor completo. No la compartás.</p>
				<div class="flex items-center gap-2">
					<code class="flex-1 text-xs font-mono bg-white dark:bg-warm-900 border border-teal-200 dark:border-teal-700 rounded-lg px-3 py-2.5 break-all text-warm-800 dark:text-warm-200 min-w-0">
						{newKeyValue}
					</code>
					<button
						onclick={copyKey}
						class="shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-all
							{copied
								? 'border-teal-300 dark:border-teal-700 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300'
								: 'border-warm-200 dark:border-warm-600 bg-white dark:bg-warm-800 text-warm-600 dark:text-warm-300 hover:border-amber-300 dark:hover:border-amber-700 hover:text-warm-900 dark:hover:text-warm-50'}"
					>
						{#if copied}
							<svg class="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,6 5,9 10,3"/></svg>
							Copiado
						{:else}
							<svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<rect x="5" y="5" width="9" height="9" rx="1.5"/>
								<path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5"/>
							</svg>
							Copiar
						{/if}
					</button>
				</div>
			</div>
		{/if}

		<!-- Error -->
		{#if error}
			<div class="flex items-start gap-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
				<svg class="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="7"/><path d="M8 5v4M8 11v1" stroke-linecap="round"/></svg>
				{error}
			</div>
		{/if}

		<!-- Key list -->
		<div class="flex flex-col gap-3">
			{#if loading}
				<div class="flex items-center gap-3 py-10 justify-center text-warm-400 dark:text-warm-500">
					<Spinner class="size-4" />
					<span class="text-sm">Cargando llaves…</span>
				</div>
			{:else if keys.length === 0 && !newKeyValue}
				<Empty.Root class="rounded-2xl border-2 border-dashed border-warm-200 dark:border-warm-700 bg-white dark:bg-warm-800/50 py-12">
					<Empty.Header>
						<Empty.Media variant="icon" class="relative w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-400 dark:text-amber-500">
							<svg class="w-8 h-8" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
								<path d="M13 26l5-20M6 10L1 16l5 6M26 10l5 6-5 6"/>
							</svg>
							<span class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-warm-100 dark:bg-warm-700 border-2 border-white dark:border-warm-800 flex items-center justify-center">
								<svg class="w-3 h-3 text-warm-400" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 2v8M2 6h8"/></svg>
							</span>
						</Empty.Media>
						<Empty.Title class="font-display text-base font-semibold text-warm-800 dark:text-warm-200">Sin llaves API aún</Empty.Title>
						<Empty.Description class="text-warm-400 dark:text-warm-500 max-w-xs mx-auto">
							Crea una para integrar SC Mascotas con tus propias aplicaciones o scripts.
						</Empty.Description>
					</Empty.Header>
				</Empty.Root>
			{:else}
				{#each keys as key (key.id)}
					<div class="group relative flex items-center gap-4 bg-white dark:bg-warm-800 border rounded-xl px-5 py-4 shadow-sm transition-all api-key-card
						{key.enabled === false
							? 'border-warm-200 dark:border-warm-700 opacity-60'
							: 'border-warm-200 dark:border-warm-700 hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700'}"
					>
						<!-- Icon -->
						<div class="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center
							{key.enabled === false
								? 'bg-warm-100 dark:bg-warm-700 text-warm-400 dark:text-warm-500'
								: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500'}"
						>
							<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
								<path d="M10 20l4-16M5 8L1 12l4 4M19 8l4 4-4 4"/>
							</svg>
						</div>

						<!-- Info -->
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2">
								<p class="text-sm font-semibold text-warm-900 dark:text-warm-50 truncate">
									{key.name ?? 'Sin nombre'}
								</p>
								{#if key.enabled === false}
									<span class="shrink-0 text-[10px] font-mono font-bold uppercase tracking-wider text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800 px-1.5 py-0.5 rounded">
										Revocada
									</span>
								{/if}
							</div>
							<p class="text-xs font-mono text-warm-400 dark:text-warm-500 mt-0.5 tracking-wide">
								{key.prefix ?? 'scp_'}{key.start ?? '…'}••••••••
							</p>
							<p class="text-xs text-warm-400 dark:text-warm-500 mt-0.5">
								Creada el {formatDate(key.createdAt)}
							</p>
						</div>

						<!-- Revoke -->
						{#if key.enabled !== false}
							<button
								onclick={() => revokeKey(key.id)}
								disabled={revokingId === key.id}
								class="shrink-0 flex items-center gap-1.5 text-xs font-medium text-warm-300 dark:text-warm-600 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
								aria-label="Revocar llave"
							>
								{#if revokingId === key.id}
									<Spinner class="size-3.5" />
								{:else}
									<svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<circle cx="8" cy="8" r="6"/>
										<path d="M5 8h6"/>
									</svg>
									Revocar
								{/if}
							</button>
						{/if}
					</div>
				{/each}
			{/if}
		</div>

		<!-- Create form / CTA -->
		{#if showForm}
			<form
				onsubmit={createKey}
				class="bg-white dark:bg-warm-800 border border-amber-300 dark:border-amber-700 rounded-xl px-5 py-4 flex flex-col gap-3 shadow-sm"
			>
				<div class="flex flex-col gap-1.5">
					<Label.Label for="key-name">Nombre de la llave <span class="text-warm-400 dark:text-warm-500 font-normal">(opcional)</span></Label.Label>
					<Input.Input
						id="key-name"
						type="text"
						placeholder="Ej. App móvil, Script de backup, Integración…"
						bind:value={newKeyName}
						disabled={creating}
						autocomplete="off"
					/>
					<p class="text-xs text-warm-400 dark:text-warm-500">Si lo dejas vacío se llamará "Mi llave API".</p>
				</div>
				<div class="flex gap-2 justify-end">
					<Button.Root variant="ghost" class="text-sm" onclick={cancelCreate} disabled={creating} type="button">
						Cancelar
					</Button.Root>
					<Button.Root type="submit" class="text-sm gap-2 rounded-full px-5" disabled={creating}>
						{#if creating}
							<Spinner class="size-3.5" />
							Creando…
						{:else}
							Crear llave
						{/if}
					</Button.Root>
				</div>
			</form>
		{:else}
			<div class="flex items-center gap-4">
				<Button.Root
					onclick={() => (showForm = true)}
					class="gap-2.5 rounded-full px-5"
				>
					<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M12 5v14M5 12h14"/>
					</svg>
					Nueva llave API
				</Button.Root>
				{#if keys.filter(k => k.enabled !== false).length > 0}
					<p class="text-xs text-warm-400 dark:text-warm-500">
						{keys.filter(k => k.enabled !== false).length} llave{keys.filter(k => k.enabled !== false).length !== 1 ? 's' : ''} activa{keys.filter(k => k.enabled !== false).length !== 1 ? 's' : ''}
					</p>
				{/if}
			</div>
		{/if}

		<!-- Info callout -->
		<div class="flex gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl px-4 py-3.5">
			<svg class="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="7"/><path d="M8 7v4M8 5v.5" stroke-linecap="round"/></svg>
			<p class="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
				El valor completo de la llave sólo se muestra una vez al crearla. Trátala como una contraseña: no la incluyas en código público ni repositorios.
			</p>
		</div>

	</div>
</div>

<style>
	.api-key-card {
		transition: box-shadow 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
	}
	.api-key-card:not(.opacity-60):hover {
		transform: translateY(-1px);
	}
</style>
