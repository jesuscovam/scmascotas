<script lang="ts">
  export type NotificationItem = {
    id: string;
    type: 'match' | 'colonia_activity' | 'system';
    title: string;
    body: string;
    url: string | null;
    readAt: string | Date | null;
    createdAt: string | Date;
  };

  type Props = {
    notifications: NotificationItem[];
    /** Called with the id when a row is opened — wire to mark-as-read. */
    onMarkRead?: (id: string) => void;
    /** Tighter paddings for the bell popover. */
    compact?: boolean;
  };

  let { notifications, onMarkRead, compact = false }: Props = $props();

  const typeIcon: Record<string, string> = {
    match: '🔍',
    colonia_activity: '📍',
    system: '🐾',
  };

  function timeAgo(date: string | Date): string {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60_000);
    if (mins < 1) return 'Ahora';
    if (mins < 60) return `Hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hace ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    if (days < 30) return `Hace ${Math.floor(days / 7)} sem.`;
    return `Hace ${Math.floor(days / 30)} meses`;
  }
</script>

{#if notifications.length === 0}
  <div class="flex flex-col items-center justify-center text-center px-6 {compact ? 'py-10' : 'py-16'}">
    <div class="w-12 h-12 rounded-2xl bg-warm-100 dark:bg-warm-700 flex items-center justify-center text-2xl mb-3">
      🔔
    </div>
    <p class="font-display font-semibold text-warm-800 dark:text-warm-100 text-sm">
      Sin notificaciones
    </p>
    <p class="text-xs text-warm-500 dark:text-warm-400 mt-1 max-w-[15rem] leading-relaxed">
      Te avisaremos aquí cuando haya un posible avistamiento de tu mascota.
    </p>
  </div>
{:else}
  <ul class="flex flex-col divide-y divide-warm-100 dark:divide-warm-700/60">
    {#each notifications as n, i (n.id)}
      {@const unread = !n.readAt}
      <li class="reveal" style="animation-delay: {Math.min(i, 8) * 50}ms">
        <a
          href={n.url ?? '#'}
          onclick={() => unread && onMarkRead?.(n.id)}
          class="group flex items-start gap-3 {compact ? 'px-3.5 py-3' : 'px-4 py-4'} transition-colors {unread
            ? 'bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-50 dark:hover:bg-amber-900/15'
            : 'hover:bg-warm-50 dark:hover:bg-warm-700/30'}"
        >
          <div
            class="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base border {unread
              ? 'bg-amber-400/15 border-amber-200 dark:border-amber-700/60'
              : 'bg-warm-100 dark:bg-warm-700 border-warm-100 dark:border-warm-600'}"
          >
            {typeIcon[n.type] ?? '🐾'}
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-baseline gap-2">
              <p class="flex-1 text-sm leading-snug truncate {unread
                ? 'font-semibold text-warm-900 dark:text-warm-50'
                : 'font-medium text-warm-700 dark:text-warm-200'}">
                {n.title}
              </p>
              <span class="shrink-0 text-[10px] text-warm-400 dark:text-warm-500 tabular-nums">
                {timeAgo(n.createdAt)}
              </span>
            </div>
            <p class="text-xs text-warm-500 dark:text-warm-400 mt-0.5 leading-relaxed line-clamp-2">
              {n.body}
            </p>
          </div>

          {#if unread}
            <span class="shrink-0 mt-1 w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400" aria-label="No leída"></span>
          {/if}
        </a>
      </li>
    {/each}
  </ul>
{/if}

<style>
  @keyframes reveal {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .reveal {
    animation: reveal 0.32s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  @media (prefers-reduced-motion: reduce) {
    .reveal { animation: none; }
  }
</style>
