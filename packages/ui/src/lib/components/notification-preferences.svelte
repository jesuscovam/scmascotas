<script lang="ts">
  import { Switch } from './ui/switch/index.js';
  import MailIcon from '@lucide/svelte/icons/mail';
  import MessageCircleIcon from '@lucide/svelte/icons/message-circle';

  type Props = {
    channelEmail: boolean;
    /** When false, email alerts can't be delivered until the address is verified. */
    emailVerified?: boolean;
    saving?: boolean;
    onChange?: (next: { channelEmail: boolean }) => void;
  };

  let { channelEmail, emailVerified = true, saving = false, onChange }: Props = $props();

  function toggleEmail(value: boolean) {
    onChange?.({ channelEmail: value });
  }
</script>

<div class="bg-white dark:bg-warm-800 rounded-3xl border border-warm-200 dark:border-warm-700 shadow-sm overflow-hidden">
  <div class="px-5 pt-5 pb-3">
    <h2 class="font-display font-bold text-warm-900 dark:text-warm-50 text-base">Cómo te avisamos</h2>
    <p class="text-xs text-warm-500 dark:text-warm-400 mt-1 leading-relaxed">
      Las notificaciones dentro de la app siempre están activas. Elige qué otros canales quieres usar.
    </p>
  </div>

  <div class="divide-y divide-warm-100 dark:divide-warm-700/60 border-t border-warm-100 dark:border-warm-700">
    <!-- Email -->
    <div class="flex items-center gap-3.5 px-5 py-4">
      <div class="shrink-0 w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-200 dark:border-amber-700/60 flex items-center justify-center text-amber-700 dark:text-amber-400">
        <MailIcon class="w-5 h-5" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-sm text-warm-900 dark:text-warm-50">Correo electrónico</p>
        <p class="text-xs text-warm-500 dark:text-warm-400 mt-0.5 leading-relaxed">
          {#if !emailVerified && channelEmail}
            Verifica tu correo para empezar a recibir alertas.
          {:else}
            Recibe un correo cuando haya un posible avistamiento.
          {/if}
        </p>
      </div>
      <Switch
        checked={channelEmail}
        disabled={saving}
        onCheckedChange={toggleEmail}
        aria-label="Alertas por correo"
      />
    </div>

    <!-- WhatsApp — coming soon -->
    <div class="flex items-center gap-3.5 px-5 py-4 opacity-60">
      <div class="shrink-0 w-10 h-10 rounded-2xl bg-warm-100 dark:bg-warm-700 border border-warm-100 dark:border-warm-600 flex items-center justify-center text-warm-500 dark:text-warm-400">
        <MessageCircleIcon class="w-5 h-5" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <p class="font-semibold text-sm text-warm-700 dark:text-warm-200">WhatsApp</p>
          <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-warm-100 dark:bg-warm-700 text-warm-500 dark:text-warm-400">
            Próximamente
          </span>
        </div>
        <p class="text-xs text-warm-500 dark:text-warm-400 mt-0.5 leading-relaxed">
          Alertas directas por WhatsApp. Aún en preparación.
        </p>
      </div>
      <Switch checked={false} disabled aria-label="Alertas por WhatsApp (próximamente)" />
    </div>
  </div>
</div>
