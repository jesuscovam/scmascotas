import { EmailService } from '../email.js';

export type NotificationPayload = {
	type: 'match' | 'colonia_activity' | 'system';
	title: string;
	body: string;
	url?: string | null;
	petId?: string | null;
	spottedPetId?: string | null;
};

export type NotificationRecipient = {
	userId: string;
	email: string;
	emailVerified: boolean;
	name: string | null;
};

export type ChannelPrefs = {
	channelEmail: boolean;
	channelWhatsapp: boolean;
	unsubscribeToken: string;
};

/**
 * Pluggable delivery channel. In-app delivery is NOT a channel here — it's the
 * always-on ledger written by NotificationsService.dispatch (which also serves
 * as the dedup gate). These are the *external* push channels. Web Push will be
 * added here in the PWA sprint once a service worker exists.
 */
export interface NotificationChannel {
	key: 'email' | 'whatsapp';
	isEnabled(prefs: ChannelPrefs, recipient: NotificationRecipient): boolean;
	send(
		recipient: NotificationRecipient,
		prefs: ChannelPrefs,
		payload: NotificationPayload,
	): Promise<void>;
}

export const EmailChannel: NotificationChannel = {
	key: 'email',
	isEnabled(prefs, recipient) {
		// Auth-gated: only verified emails (deliverability + the user actually
		// owns the inbox). User can switch email off in preferences.
		return prefs.channelEmail && recipient.emailVerified && !!recipient.email;
	},
	async send(recipient, prefs, payload) {
		const base = EmailService.siteUrl();
		const url = payload.url ? `${base}${payload.url}` : base;
		const unsubscribeUrl = `${base}/notificaciones/baja?token=${prefs.unsubscribeToken}`;
		const inner = `
      <h2 style="font-size:18px;margin:0 0 12px;color:#1c1917">${payload.title}</h2>
      <p style="font-size:14px;line-height:1.7;margin:0 0 20px;color:#44403c">${payload.body}</p>
      <a href="${url}" style="display:inline-block;background:#1c1917;color:#fafaf9;text-decoration:none;font-size:14px;padding:10px 18px;border-radius:10px">Ver en SC Mascotas</a>
    `;
		await EmailService.send({
			to: recipient.email,
			subject: payload.title,
			html: EmailService.renderLayout(inner, { unsubscribeUrl }),
		});
	},
};

export const WhatsappChannel: NotificationChannel = {
	key: 'whatsapp',
	// Cost-gated seam. WhatsApp Business API bills per conversation and needs
	// template approval, so it stays OFF until both the server flag and the
	// user's opt-in are true. See PLAN.md §15.
	isEnabled(prefs) {
		return process.env.NOTIFY_WHATSAPP_ENABLED === 'true' && prefs.channelWhatsapp;
	},
	async send(recipient, _prefs, payload) {
		// Intentionally not implemented — Business API integration is deferred.
		// isEnabled() guards this, so it never runs while the flag is off.
		console.warn('[notify] whatsapp channel not implemented; skipping', recipient.userId, payload.type);
	},
};

export const EXTERNAL_CHANNELS: NotificationChannel[] = [EmailChannel, WhatsappChannel];
