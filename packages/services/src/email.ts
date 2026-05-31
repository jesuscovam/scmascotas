import { Resend } from 'resend';

const DEFAULT_FROM = 'SC Mascotas <no-reply@emails.jesuscova.com>';

/** Resolve the public site origin (no trailing slash) for links in emails. */
function siteUrl(): string {
	const raw = process.env.PUBLIC_SITE_URL || process.env.BETTER_AUTH_URL || 'https://scmascotas.xyz';
	return raw.replace(/\/$/, '');
}

/**
 * Thin Resend wrapper. Centralizes the API key + `from` address + the shared
 * inline-CSS email shell. Reads secrets from `process.env` (Node runtime only,
 * which is already forced by better-auth + Drizzle), the same way PhotosService
 * reads the Blob token.
 */
export const EmailService = {
	siteUrl,

	/** Send a transactional email. No-ops (logs) when RESEND_API_KEY is unset. */
	async send({ to, subject, html }: { to: string; subject: string; html: string }): Promise<void> {
		const apiKey = process.env.RESEND_API_KEY;
		if (!apiKey) {
			console.warn('[email] RESEND_API_KEY unset — skipping send to', to, '·', subject);
			return;
		}
		const from = process.env.NOTIFY_EMAIL_FROM || DEFAULT_FROM;
		const resend = new Resend(apiKey);
		await resend.emails.send({ from, to, subject, html });
	},

	/**
	 * Shared email shell matching the stone-palette / paw-header style used by
	 * the contact-form email. `inner` is the body markup; an unsubscribe link is
	 * appended to the footer when `unsubscribeUrl` is provided.
	 */
	renderLayout(inner: string, opts: { unsubscribeUrl?: string } = {}): string {
		const unsub = opts.unsubscribeUrl
			? `<p style="color:#a8a29e;font-size:12px;margin:8px 0 0">¿No quieres estas alertas? <a href="${opts.unsubscribeUrl}" style="color:#a8a29e">Darte de baja</a>.</p>`
			: '';
		return `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1c1917">
        <p style="font-size:22px;margin:0 0 4px">🐾</p>
        ${inner}
        <p style="color:#a8a29e;font-size:12px;margin:24px 0 0">Enviado desde ${siteUrl().replace(/^https?:\/\//, '')}</p>
        ${unsub}
      </div>
    `;
	},
};
