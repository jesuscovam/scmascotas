<script lang="ts">
  import BellIcon from '@lucide/svelte/icons/bell';
  import CheckCheckIcon from '@lucide/svelte/icons/check-check';
  import NotificationList, { type NotificationItem } from './notification-list.svelte';

  type Props = {
    /** Most recent notifications to preview in the dropdown. */
    notifications: NotificationItem[];
    unreadCount: number;
    onMarkRead?: (id: string) => void;
    onMarkAllRead?: () => void;
    /** Where "Ver todas" links. */
    viewAllHref?: string;
  };

  let {
    notifications,
    unreadCount,
    onMarkRead,
    onMarkAllRead,
    viewAllHref = '/cuenta/notificaciones',
  }: Props = $props();

  let open = $state(false);
  const badge = $derived(unreadCount > 9 ? '9+' : String(unreadCount));
</script>

<div class="relative">
  <button
    type="button"
    onclick={() => (open = !open)}
    aria-label="Notificaciones{unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}"
    aria-expanded={open}
    class="relative flex items-center justify-center w-9 h-9 rounded-xl text-warm-600 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-700 hover:text-warm-900 dark:hover:text-warm-50 transition-colors"
  >
    <BellIcon class="w-5 h-5" />
    {#if unreadCount > 0}
      <span
        class="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 dark:bg-amber-400 text-[10px] font-bold text-white dark:text-warm-900 flex items-center justify-center tabular-nums ring-2 ring-white dark:ring-warm-800"
      >
        {badge}
      </span>
    {/if}
  </button>

  {#if open}
    <!-- backdrop closes on outside click -->
    <button
      type="button"
      class="fixed inset-0 z-40 cursor-default"
      aria-label="Cerrar notificaciones"
      onclick={() => (open = false)}
    ></button>

    <div
      class="dropdown absolute right-0 mt-2 z-50 w-[20rem] max-w-[calc(100vw-1.5rem)] rounded-3xl border border-warm-200 dark:border-warm-700 bg-white dark:bg-warm-800 shadow-xl shadow-warm-900/10 overflow-hidden"
      role="dialog"
      aria-label="Notificaciones"
    >
      <header class="flex items-center justify-between gap-2 px-4 py-3 border-b border-warm-100 dark:border-warm-700">
        <h2 class="font-display font-bold text-warm-900 dark:text-warm-50 text-sm">Notificaciones</h2>
        {#if unreadCount > 0}
          <button
            type="button"
            onclick={() => onMarkAllRead?.()}
            class="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
          >
            <CheckCheckIcon class="w-3.5 h-3.5" />
            Marcar leídas
          </button>
        {/if}
      </header>

      <div class="max-h-[22rem] overflow-y-auto">
        <NotificationList {notifications} {onMarkRead} compact />
      </div>

      <a
        href={viewAllHref}
        onclick={() => (open = false)}
        class="block text-center px-4 py-3 border-t border-warm-100 dark:border-warm-700 text-xs font-semibold text-warm-600 dark:text-warm-300 hover:bg-warm-50 dark:hover:bg-warm-700/40 transition-colors"
      >
        Ver todas
      </a>
    </div>
  {/if}
</div>

<style>
  @keyframes dropdown-in {
    from { opacity: 0; transform: translateY(-6px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .dropdown {
    transform-origin: top right;
    animation: dropdown-in 0.18s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  @media (prefers-reduced-motion: reduce) {
    .dropdown { animation: none; }
  }
</style>
