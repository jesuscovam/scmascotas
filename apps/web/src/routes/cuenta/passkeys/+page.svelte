<script lang="ts">
	import { Button, Spinner, Input, Label, Empty } from '@scmascotas/ui';
	import { authClient } from '$lib/auth-client';
	import { onMount } from 'svelte';

	let passkeys: Array<{ id: string; name?: string | null; createdAt?: Date | null }> = $state([]);
	let loading = $state(true);
	let adding = $state(false);
	let deletingId = $state<string | null>(null);
	let error = $state('');
	let showNameForm = $state(false);
	let newPasskeyName = $state('');

	onMount(async () => {
		await loadPasskeys();
	});

	async function loadPasskeys() {
		loading = true;
		const result = await authClient.passkey.listUserPasskeys();
		loading = false;
		if (result.data) passkeys = result.data;
	}

	async function addPasskey() {
		adding = true;
		error = '';
		const fallback = `Passkey — ${new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}`;
		const result = await authClient.passkey.addPasskey({
			name: newPasskeyName.trim() || fallback
		});
		adding = false;
		if (result?.error) {
			error = result.error.message ?? 'No se pudo registrar el passkey';
		} else {
			showNameForm = false;
			newPasskeyName = '';
			await loadPasskeys();
		}
	}

	function cancelAdd() {
		showNameForm = false;
		newPasskeyName = '';
		error = '';
	}

	async function deletePasskey(id: string) {
		deletingId = id;
		const result = await authClient.passkey.deletePasskey({ id });
		deletingId = null;
		if (!result?.error) await loadPasskeys();
	}

	function formatDate(d: Date | null | undefined) {
		if (!d) return '';
		return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d));
	}
</script>

<svelte:head><title>Mis passkeys — SC Mascotas</title></svelte:head>

<div class="min-h-[calc(100vh-4rem)] bg-warm-50 dark:bg-warm-900 pb-20">

	<!-- Header -->
	<div class="relative overflow-hidden bg-white dark:bg-warm-800 border-b border-warm-200 dark:border-warm-700">
		<div class="absolute inset-0 pointer-events-none" aria-hidden="true">
			<div class="absolute top-0 right-0 w-64 h-32 bg-amber-50/80 dark:bg-amber-900/10 blur-3xl"></div>
			<!-- Subtle fingerprint rings -->
			<svg class="absolute right-6 top-1/2 -translate-y-1/2 w-24 h-24 text-warm-200 dark:text-warm-700 opacity-60" viewBox="0 0 96 96" fill="none" stroke="currentColor" stroke-width="1">
				<circle cx="48" cy="48" r="8"/>
				<circle cx="48" cy="48" r="16"/>
				<circle cx="48" cy="48" r="24"/>
				<circle cx="48" cy="48" r="32"/>
				<circle cx="48" cy="48" r="40"/>
				<circle cx="48" cy="48" r="46"/>
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
					<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
						<path d="M12 2C9.243 2 7 4.243 7 7v2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-2V7c0-2.757-2.243-5-5-5z"/>
						<circle cx="12" cy="15" r="1.5" fill="currentColor"/>
					</svg>
				</div>
				<div>
					<h1 class="font-display text-2xl font-bold text-warm-900 dark:text-warm-50 leading-tight">
						Passkeys
					</h1>
					<p class="text-sm text-warm-500 dark:text-warm-400 mt-0.5">
						Accede con tu huella, Face ID o llave de seguridad
					</p>
				</div>
			</div>
		</div>
	</div>

	<div class="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">

		<!-- Error -->
		{#if error}
			<div class="flex items-start gap-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
				<svg class="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="7"/><path d="M8 5v4M8 11v1" stroke-linecap="round"/></svg>
				{error}
			</div>
		{/if}

		<!-- Passkey list -->
		<div class="flex flex-col gap-3">
			{#if loading}
				<div class="flex items-center gap-3 py-10 justify-center text-warm-400 dark:text-warm-500">
					<Spinner class="size-4" />
					<span class="text-sm">Cargando passkeys…</span>
				</div>
			{:else if passkeys.length === 0}
				<Empty.Root class="rounded-2xl border-2 border-dashed border-warm-200 dark:border-warm-700 bg-white dark:bg-warm-800/50 py-12">
					<Empty.Header>
						<Empty.Media variant="icon" class="relative w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-400 dark:text-amber-500">
							<svg class="w-8 h-8" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5">
								<path d="M16 4a7 7 0 0 0-7 7v3H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V16a2 2 0 0 0-2-2h-2v-3a7 7 0 0 0-7-7z" stroke-linecap="round" stroke-linejoin="round"/>
								<circle cx="16" cy="20" r="1.5" fill="currentColor"/>
							</svg>
							<span class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-warm-100 dark:bg-warm-700 border-2 border-white dark:border-warm-800 flex items-center justify-center">
								<svg class="w-3 h-3 text-warm-400" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 2v8M2 6h8"/></svg>
							</span>
						</Empty.Media>
						<Empty.Title class="font-display text-base font-semibold text-warm-800 dark:text-warm-200">Aún no tienes passkeys</Empty.Title>
						<Empty.Description class="text-warm-400 dark:text-warm-500 max-w-xs mx-auto">
							Agrega una para iniciar sesión con tu huella o Face ID sin necesidad de contraseña.
						</Empty.Description>
					</Empty.Header>
				</Empty.Root>
			{:else}
				{#each passkeys as pk (pk.id)}
					<div class="group relative flex items-center gap-4 bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-xl px-5 py-4 shadow-sm hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700 transition-all passkey-card">
						<!-- Key icon -->
						<div class="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-500 shrink-0">
							<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
								<circle cx="8" cy="15" r="5"/>
								<path d="M13 15h2m0 0h2m-2 0v-2m0 2v2" stroke-linecap="round"/>
							</svg>
						</div>

						<!-- Info -->
						<div class="flex-1 min-w-0">
							<p class="text-sm font-semibold text-warm-900 dark:text-warm-50 truncate">
								{pk.name ?? 'Passkey sin nombre'}
							</p>
							{#if pk.createdAt}
								<p class="text-xs text-warm-400 dark:text-warm-500 mt-0.5">
									Agregado el {formatDate(pk.createdAt)}
								</p>
							{/if}
						</div>

						<!-- Delete -->
						<button
							onclick={() => deletePasskey(pk.id)}
							disabled={deletingId === pk.id}
							class="shrink-0 flex items-center gap-1.5 text-xs font-medium text-warm-300 dark:text-warm-600 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
							aria-label="Eliminar passkey"
						>
							{#if deletingId === pk.id}
								<Spinner class="size-3.5" />
							{:else}
								<svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-9"/>
								</svg>
								Eliminar
							{/if}
						</button>
					</div>
				{/each}
			{/if}
		</div>

		<!-- Add passkey CTA / inline name form -->
		{#if showNameForm}
			<div class="bg-white dark:bg-warm-800 border border-amber-300 dark:border-amber-700 rounded-xl px-5 py-4 flex flex-col gap-3 shadow-sm">
				<div class="flex flex-col gap-1.5">
					<Label.Label for="passkey-name">Nombre del passkey <span class="text-warm-400 dark:text-warm-500 font-normal">(opcional)</span></Label.Label>
					<Input.Input
						id="passkey-name"
						type="text"
						placeholder="Ej. MacBook, iPhone, Llave YubiKey…"
						bind:value={newPasskeyName}
						disabled={adding}
						autocomplete="off"
					/>
					<p class="text-xs text-warm-400 dark:text-warm-500">Si lo dejas vacío se usará la fecha de hoy.</p>
				</div>
				<div class="flex gap-2 justify-end">
					<Button.Root variant="ghost" class="text-sm" onclick={cancelAdd} disabled={adding}>
						Cancelar
					</Button.Root>
					<Button.Root class="text-sm gap-2 rounded-full px-5" onclick={addPasskey} disabled={adding}>
						{#if adding}
							<Spinner class="size-3.5" />
							Registrando…
						{:else}
							Continuar
						{/if}
					</Button.Root>
				</div>
			</div>
		{:else}
			<div class="flex items-center gap-4">
				<Button.Root
					onclick={() => (showNameForm = true)}
					class="gap-2.5 rounded-full px-5"
				>
					<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M12 2C9.243 2 7 4.243 7 7v2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-2V7c0-2.757-2.243-5-5-5z"/>
						<path d="M12 14v3M10.5 15.5h3" stroke-width="2"/>
					</svg>
					Agregar passkey
				</Button.Root>
				{#if passkeys.length > 0}
					<p class="text-xs text-warm-400 dark:text-warm-500">{passkeys.length} passkey{passkeys.length !== 1 ? 's' : ''} registrado{passkeys.length !== 1 ? 's' : ''}</p>
				{/if}
			</div>
		{/if}

		<!-- Info callout -->
		<div class="flex gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl px-4 py-3.5">
			<svg class="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="7"/><path d="M8 7v4M8 5v.5" stroke-linecap="round"/></svg>
			<p class="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
				Los passkeys se guardan en tu dispositivo y nunca salen de él. Son más seguros que las contraseñas y no pueden ser robados en filtraciones de datos.
			</p>
		</div>

	</div>
</div>

<style>
	.passkey-card {
		transition: box-shadow 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
	}
	.passkey-card:hover {
		transform: translateY(-1px);
	}
</style>
