<script lang="ts">
	import { NotificationList, NotificationPreferences } from '@scmascotas/ui';
	import { invalidateAll } from '$app/navigation';
	import CheckCheckIcon from '@lucide/svelte/icons/check-check';

	let { data } = $props();

	const notifications = $derived(data.notifications ?? []);
	const hasUnread = $derived(notifications.some((n) => !n.readAt));

	let savingPrefs = $state(false);

	async function markRead(id: string) {
		await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
		await invalidateAll();
	}

	async function markAllRead() {
		await fetch('/api/notifications/read-all', { method: 'POST' });
		await invalidateAll();
	}

	async function savePreferences(next: { channelEmail: boolean }) {
		savingPrefs = true;
		await fetch('/api/notifications/preferences', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(next)
		});
		await invalidateAll();
		savingPrefs = false;
	}
</script>

<svelte:head>
	<title>Notificaciones · SC Mascotas</title>
</svelte:head>

<div class="min-h-[calc(100vh-4rem)] bg-warm-50 dark:bg-warm-900 pb-20">
	<!-- Header -->
	<div class="relative overflow-hidden border-b border-warm-200 dark:border-warm-700 bg-white dark:bg-warm-800">
		<div class="absolute inset-0 bg-gradient-to-br from-amber-50 via-amber-50/30 to-transparent dark:from-amber-900/10 dark:via-transparent pointer-events-none"></div>
		<div class="relative max-w-2xl mx-auto px-4 py-8">
			<div class="flex items-center gap-3">
				<div class="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-200 dark:border-amber-700 flex items-center justify-center text-2xl shrink-0">
					🔔
				</div>
				<div>
					<h1 class="font-display text-2xl font-bold text-warm-900 dark:text-warm-50 leading-tight">
						Notificaciones
					</h1>
					<p class="text-sm text-warm-500 dark:text-warm-400 mt-0.5">
						Avisos sobre tus mascotas y actividad cercana
					</p>
				</div>
			</div>
		</div>
	</div>

	<div class="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
		<!-- Preferences -->
		<NotificationPreferences
			channelEmail={data.channelEmail}
			emailVerified={data.emailVerified}
			saving={savingPrefs}
			onChange={savePreferences}
		/>

		<!-- Feed -->
		<div class="bg-white dark:bg-warm-800 rounded-3xl border border-warm-200 dark:border-warm-700 shadow-sm overflow-hidden">
			<header class="flex items-center justify-between gap-2 px-5 py-4 border-b border-warm-100 dark:border-warm-700">
				<h2 class="font-display font-bold text-warm-900 dark:text-warm-50 text-base">Recientes</h2>
				{#if hasUnread}
					<button
						type="button"
						onclick={markAllRead}
						class="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
					>
						<CheckCheckIcon class="w-4 h-4" />
						Marcar todas como leídas
					</button>
				{/if}
			</header>
			<NotificationList {notifications} onMarkRead={markRead} />
		</div>
	</div>
</div>
