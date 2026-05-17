<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { Button, Card, Input, Label, Separator, Spinner, Badge } from '@scmascotas/ui';

	let { data } = $props();

	const user = $derived(data.user);

	// Name edit state
	let editingName = $state(false);
	let nameValue = $state(data.user.name ?? '');
	let nameLoading = $state(false);
	let nameError = $state('');
	let nameSuccess = $state(false);

	// Password change state
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let pwLoading = $state(false);
	let pwError = $state('');
	let pwSuccess = $state(false);

	async function saveName() {
		if (!nameValue.trim()) return;
		nameLoading = true;
		nameError = '';
		nameSuccess = false;
		const result = await authClient.updateUser({ name: nameValue.trim() });
		nameLoading = false;
		if (result.error) {
			nameError = result.error.message ?? 'No se pudo actualizar el nombre';
		} else {
			nameSuccess = true;
			editingName = false;
			await invalidateAll();
			setTimeout(() => (nameSuccess = false), 3000);
		}
	}

	function cancelName() {
		nameValue = data.user.name ?? '';
		nameError = '';
		editingName = false;
	}

	async function changePassword(e: SubmitEvent) {
		e.preventDefault();
		pwError = '';
		pwSuccess = false;
		if (newPassword !== confirmPassword) {
			pwError = 'Las contraseñas no coinciden';
			return;
		}
		if (newPassword.length < 8) {
			pwError = 'La contraseña debe tener al menos 8 caracteres';
			return;
		}
		pwLoading = true;
		const result = await authClient.changePassword({ currentPassword, newPassword });
		pwLoading = false;
		if (result.error) {
			pwError = result.error.message ?? 'No se pudo cambiar la contraseña';
		} else {
			pwSuccess = true;
			currentPassword = '';
			newPassword = '';
			confirmPassword = '';
			setTimeout(() => (pwSuccess = false), 4000);
		}
	}

	function initials(name: string | null | undefined) {
		if (!name) return '?';
		return name
			.split(' ')
			.map((w) => w[0])
			.slice(0, 2)
			.join('')
			.toUpperCase();
	}

	function formatDate(date: Date | string | null | undefined) {
		if (!date) return '—';
		return new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }).format(
			new Date(date)
		);
	}
</script>

<svelte:head><title>Mi perfil — SC Mascotas</title></svelte:head>

<div class="min-h-[calc(100vh-4rem)] bg-warm-50 dark:bg-warm-900 pb-20">

	<!-- Header strip -->
	<div class="relative overflow-hidden bg-white dark:bg-warm-800 border-b border-warm-200 dark:border-warm-700">
		<div class="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
			<div class="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-amber-100/60 dark:bg-amber-900/20 blur-3xl"></div>
			<div class="absolute top-4 left-1/3 w-32 h-32 rounded-full bg-warm-100/80 dark:bg-warm-700/30 blur-2xl"></div>
		</div>
		<div class="relative max-w-2xl mx-auto px-4 py-10 flex items-center gap-6">
			<!-- Avatar -->
			<div class="relative shrink-0">
				{#if user.image}
					<img
						src={user.image}
						alt={user.name ?? 'Avatar'}
						class="w-20 h-20 rounded-2xl object-cover ring-4 ring-white dark:ring-warm-700 shadow-md"
					/>
				{:else}
					<div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700 flex items-center justify-center shadow-md ring-4 ring-white dark:ring-warm-700">
						<span class="font-display text-2xl font-bold text-white">{initials(user.name)}</span>
					</div>
				{/if}
				{#if user.emailVerified}
					<div class="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-green-500 border-2 border-white dark:border-warm-800 flex items-center justify-center" title="Correo verificado">
						<svg class="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="2,6 5,9 10,3" />
						</svg>
					</div>
				{/if}
			</div>

			<div class="min-w-0">
				<div class="flex items-center gap-2 flex-wrap">
					<h1 class="font-display text-2xl font-bold text-warm-900 dark:text-warm-50 truncate">
						{user.name ?? 'Sin nombre'}
					</h1>
					{#if user.role === 'admin'}
						<Badge.Root variant="secondary" class="text-[10px] px-2 py-0.5 font-mono uppercase tracking-wider bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-700">
							admin
						</Badge.Root>
					{/if}
				</div>
				<p class="text-sm text-warm-500 dark:text-warm-400 mt-0.5 truncate">{user.email}</p>
				<p class="text-xs text-warm-400 dark:text-warm-500 mt-1">
					Miembro desde {formatDate(user.createdAt)}
				</p>
			</div>
		</div>
	</div>

	<!-- Content -->
	<div class="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">

		<!-- Nombre -->
		<Card.Root class="border-warm-200 dark:border-warm-700 bg-white dark:bg-warm-800 shadow-sm">
			<Card.Content class="p-6">
				<div class="flex items-start justify-between gap-4 mb-4">
					<div>
						<h2 class="font-display text-lg font-semibold text-warm-900 dark:text-warm-50">Nombre</h2>
						<p class="text-xs text-warm-500 dark:text-warm-400 mt-0.5">Así te verán otros usuarios</p>
					</div>
					{#if !editingName}
						<Button.Root
							variant="ghost"
							class="text-sm text-warm-500 hover:text-warm-900 dark:text-warm-400 dark:hover:text-warm-50 shrink-0"
							onclick={() => { editingName = true; nameValue = data.user.name ?? ''; }}
						>
							Editar
						</Button.Root>
					{/if}
				</div>

				{#if editingName}
					<div class="flex flex-col gap-3">
						<div class="flex flex-col gap-1.5">
							<Label.Label for="name">Nombre completo</Label.Label>
							<Input.Input
								id="name"
								type="text"
								bind:value={nameValue}
								placeholder="Tu nombre"
								autocomplete="name"
							/>
						</div>
						{#if nameError}
							<p class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">{nameError}</p>
						{/if}
						<div class="flex gap-2 justify-end">
							<Button.Root variant="ghost" class="text-sm" onclick={cancelName} disabled={nameLoading}>
								Cancelar
							</Button.Root>
							<Button.Root class="text-sm gap-2" onclick={saveName} disabled={nameLoading || !nameValue.trim()}>
								{#if nameLoading}<Spinner class="size-3.5" />{/if}
								{nameLoading ? 'Guardando…' : 'Guardar'}
							</Button.Root>
						</div>
					</div>
				{:else}
					<div class="flex items-center gap-3">
						{#if user.name}
							<p class="text-warm-800 dark:text-warm-200 font-medium">{user.name}</p>
						{:else}
							<p class="text-warm-400 dark:text-warm-500 italic text-sm">Sin nombre</p>
						{/if}
						{#if nameSuccess}
							<span class="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
								<svg class="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,6 5,9 10,3" /></svg>
								Guardado
							</span>
						{/if}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Correo -->
		<Card.Root class="border-warm-200 dark:border-warm-700 bg-white dark:bg-warm-800 shadow-sm">
			<Card.Content class="p-6">
				<div class="flex items-start justify-between gap-4 mb-4">
					<div>
						<h2 class="font-display text-lg font-semibold text-warm-900 dark:text-warm-50">Correo electrónico</h2>
						<p class="text-xs text-warm-500 dark:text-warm-400 mt-0.5">Usado para iniciar sesión</p>
					</div>
					{#if user.emailVerified}
						<span class="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 shrink-0">
							<svg class="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,6 5,9 10,3" /></svg>
							Verificado
						</span>
					{:else}
						<span class="text-xs text-amber-600 dark:text-amber-400 shrink-0">No verificado</span>
					{/if}
				</div>
				<p class="text-warm-800 dark:text-warm-200 font-medium font-mono text-sm">{user.email}</p>
				<p class="text-xs text-warm-400 dark:text-warm-500 mt-2">Para cambiar tu correo contacta al soporte</p>
			</Card.Content>
		</Card.Root>

		<!-- Contraseña -->
		<Card.Root class="border-warm-200 dark:border-warm-700 bg-white dark:bg-warm-800 shadow-sm">
			<Card.Content class="p-6">
				<div class="mb-4">
					<h2 class="font-display text-lg font-semibold text-warm-900 dark:text-warm-50">Contraseña</h2>
					<p class="text-xs text-warm-500 dark:text-warm-400 mt-0.5">Cambia tu contraseña de acceso</p>
				</div>

				<form onsubmit={changePassword} class="flex flex-col gap-3">
					<div class="flex flex-col gap-1.5">
						<Label.Label for="current-password">Contraseña actual</Label.Label>
						<Input.Input
							id="current-password"
							type="password"
							bind:value={currentPassword}
							placeholder="••••••••"
							autocomplete="current-password"
							required
						/>
					</div>
					<div class="flex flex-col gap-1.5">
						<Label.Label for="new-password">Nueva contraseña</Label.Label>
						<Input.Input
							id="new-password"
							type="password"
							bind:value={newPassword}
							placeholder="Mínimo 8 caracteres"
							autocomplete="new-password"
							required
							minlength={8}
						/>
					</div>
					<div class="flex flex-col gap-1.5">
						<Label.Label for="confirm-password">Confirmar contraseña</Label.Label>
						<Input.Input
							id="confirm-password"
							type="password"
							bind:value={confirmPassword}
							placeholder="Repite la contraseña"
							autocomplete="new-password"
							required
							minlength={8}
						/>
					</div>

					{#if pwError}
						<p class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">{pwError}</p>
					{/if}
					{#if pwSuccess}
						<p class="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
							Contraseña actualizada correctamente
						</p>
					{/if}

					<div class="flex justify-end pt-1">
						<Button.Root type="submit" class="text-sm gap-2" disabled={pwLoading}>
							{#if pwLoading}<Spinner class="size-3.5" />{/if}
							{pwLoading ? 'Actualizando…' : 'Cambiar contraseña'}
						</Button.Root>
					</div>
				</form>
			</Card.Content>
		</Card.Root>

		<!-- Quick links -->
		<div class="grid grid-cols-2 gap-3">
			<a
				href="/cuenta/passkeys"
				class="group flex flex-col gap-1.5 p-4 rounded-xl bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 hover:border-amber-400 dark:hover:border-amber-600 shadow-sm hover:shadow-md transition-all"
			>
				<div class="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-700 dark:text-amber-400 group-hover:scale-110 transition-transform">
					<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="7" r="4"/>
						<path d="M18 21v-2a6 6 0 0 0-12 0v2"/>
					</svg>
				</div>
				<p class="text-sm font-semibold text-warm-800 dark:text-warm-200 group-hover:text-warm-900 dark:group-hover:text-warm-50">Passkeys</p>
				<p class="text-xs text-warm-400 dark:text-warm-500">Acceso sin contraseña</p>
			</a>

			<a
				href="/cuenta/api-keys"
				class="group flex flex-col gap-1.5 p-4 rounded-xl bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 hover:border-amber-400 dark:hover:border-amber-600 shadow-sm hover:shadow-md transition-all"
			>
				<div class="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-700 dark:text-amber-400 group-hover:scale-110 transition-transform">
					<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
						<path d="M7 11V7a5 5 0 0 1 10 0v4"/>
					</svg>
				</div>
				<p class="text-sm font-semibold text-warm-800 dark:text-warm-200 group-hover:text-warm-900 dark:group-hover:text-warm-50">API Keys</p>
				<p class="text-xs text-warm-400 dark:text-warm-500">Acceso por API</p>
			</a>
		</div>

		<!-- Back link -->
		<div class="flex justify-center">
			<a
				href="/mis-mascotas"
				class="text-sm text-warm-400 dark:text-warm-500 hover:text-warm-700 dark:hover:text-warm-300 transition-colors flex items-center gap-1.5"
			>
				<svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M10 13L5 8l5-5" />
				</svg>
				Mis mascotas
			</a>
		</div>

	</div>
</div>
