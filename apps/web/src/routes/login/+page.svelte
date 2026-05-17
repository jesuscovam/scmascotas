<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { Button, Card, Input, Label, Separator, Spinner } from '@scmascotas/ui';
	import { signIn, authClient } from '$lib/auth-client';

	let { data } = $props();

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);
	let passkeyLoading = $state(false);

	async function handleEmailLogin(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		loading = true;
		const result = await signIn.email({ email, password });
		loading = false;
		if (result.error) {
			if (result.error.code === 'EMAIL_NOT_VERIFIED') {
				error = 'Debes verificar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.';
			} else {
				error = result.error.message ?? 'Credenciales incorrectas';
			}
		} else {
			await invalidateAll();
			goto('/mis-mascotas');
		}
	}

	async function handleGoogle() {
		await signIn.social({ provider: 'google', callbackURL: '/mis-mascotas' });
	}

	async function handlePasskey() {
		passkeyLoading = true;
		error = '';
		const result = await authClient.signIn.passkey();
		passkeyLoading = false;
		if (result?.error) {
			error = result.error.message ?? 'No se pudo autenticar con passkey';
		} else {
			await invalidateAll();
			goto('/mis-mascotas');
		}
	}
</script>

<svelte:head><title>Iniciar sesión — SC Mascotas</title></svelte:head>

<div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 bg-warm-100 dark:bg-warm-900">
	<div class="w-full max-w-sm">
		<div class="text-center mb-8">
			<span class="text-4xl leading-none block">🐾</span>
			<h1 class="font-display text-2xl font-bold text-warm-900 dark:text-warm-50 mt-3 mb-1">
				Bienvenido de nuevo
			</h1>
			<p class="text-warm-500 dark:text-warm-400 text-sm">
				Inicia sesión para ver tus reportes
			</p>
		</div>

		<Card.Root class="shadow-sm border-warm-200 dark:border-warm-700 bg-white dark:bg-warm-800">
			<Card.Content class="pt-6 pb-6 px-6 flex flex-col gap-4">
				{#if error}
					<p class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
						{error}
					</p>
				{/if}

				<form onsubmit={handleEmailLogin} class="flex flex-col gap-4">
					<div class="flex flex-col gap-1.5">
						<Label.Label for="email">Correo electrónico</Label.Label>
						<Input.Input
							id="email"
							type="email"
							placeholder="tu@correo.com"
							bind:value={email}
							required
							autocomplete="email"
						/>
					</div>
					<div class="flex flex-col gap-1.5">
						<Label.Label for="password">Contraseña</Label.Label>
						<Input.Input
							id="password"
							type="password"
							placeholder="••••••••"
							bind:value={password}
							required
							autocomplete="current-password"
						/>
					</div>
					<Button.Root type="submit" class="w-full gap-2" disabled={loading}>
						{#if loading}<Spinner class="size-4" />{/if}
						{loading ? 'Entrando…' : 'Iniciar sesión'}
					</Button.Root>
				</form>

				<div class="flex items-center gap-3">
					<Separator.Root class="flex-1" />
					<span class="text-xs text-warm-400 dark:text-warm-500">o</span>
					<Separator.Root class="flex-1" />
				</div>

				<Button.Root
					variant="outline"
					class="w-full gap-2"
					onclick={handlePasskey}
					disabled={passkeyLoading}
				>
					<svg viewBox="0 0 24 24" class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="7" r="4"/>
						<path d="M18 21v-2a6 6 0 0 0-12 0v2"/>
					</svg>
					{passkeyLoading ? 'Verificando…' : 'Usar passkey'}
				</Button.Root>

				{#if data.hasGoogle}
					<Button.Root
						variant="outline"
						class="w-full gap-2"
						onclick={handleGoogle}
					>
						<svg viewBox="0 0 24 24" class="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg">
							<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
							<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
							<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
							<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
						</svg>
						Continuar con Google
					</Button.Root>
				{/if}
			</Card.Content>
		</Card.Root>

		<p class="text-center text-sm text-warm-500 dark:text-warm-400 mt-6">
			¿No tienes cuenta?
			<a href="/registro" class="text-brand-800 dark:text-brand-400 hover:underline font-medium">
				Regístrate
			</a>
		</p>
	</div>
</div>
