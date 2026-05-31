<script lang="ts">
	import { Button } from '@scmascotas/ui';
	let { data } = $props();
</script>

<svelte:head>
	<title>Baja de notificaciones · SC Mascotas</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="min-h-[calc(100vh-4rem)] bg-warm-50 dark:bg-warm-900 flex items-center justify-center px-4 py-16">
	<div class="max-w-md w-full bg-white dark:bg-warm-800 rounded-3xl border border-warm-200 dark:border-warm-700 shadow-sm p-8 text-center">
		<div class="w-14 h-14 rounded-2xl bg-warm-100 dark:bg-warm-700 flex items-center justify-center text-3xl mx-auto mb-5">
			{data.ok ? '🔕' : '🐾'}
		</div>
		{#if data.ok}
			<h1 class="font-display text-xl font-bold text-warm-900 dark:text-warm-50">Listo, te diste de baja</h1>
			<p class="text-sm text-warm-500 dark:text-warm-400 mt-2 leading-relaxed">
				Ya no recibirás alertas por correo. Las notificaciones dentro de la app siguen disponibles, y puedes
				reactivar el correo cuando quieras desde tus preferencias.
			</p>
			<div class="mt-6 flex flex-col gap-2">
				<Button.Root href="/cuenta/notificaciones" class="rounded-full text-sm font-semibold">
					Ir a mis preferencias
				</Button.Root>
				<Button.Root href="/" variant="ghost" class="rounded-full text-sm">Volver al inicio</Button.Root>
			</div>
		{:else}
			<h1 class="font-display text-xl font-bold text-warm-900 dark:text-warm-50">Enlace inválido</h1>
			<p class="text-sm text-warm-500 dark:text-warm-400 mt-2 leading-relaxed">
				No pudimos procesar la baja. El enlace puede haber expirado. Puedes ajustar tus alertas iniciando
				sesión.
			</p>
			<div class="mt-6">
				<Button.Root href="/cuenta/notificaciones" class="rounded-full text-sm font-semibold">
					Ir a mis preferencias
				</Button.Root>
			</div>
		{/if}
	</div>
</div>
