import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { passkey } from '@better-auth/passkey';
import { apiKey } from '@better-auth/api-key';
import { admin } from 'better-auth/plugins';
import { db } from '@scmascotas/db';
import { Resend } from 'resend';
import { RESEND_API_KEY } from '$env/static/private';

const googleProvider =
	process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
		? {
				socialProviders: {
					google: {
						clientId: process.env.GOOGLE_CLIENT_ID,
						clientSecret: process.env.GOOGLE_CLIENT_SECRET
					}
				}
			}
		: {};

export const auth = betterAuth({
	database: drizzleAdapter(db, { provider: 'pg' }),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
	},
	accountLinking: {
		enabled: true,
		trustedProviders: ['google']
	},
	emailVerification: {
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }: { user: { name: string; email: string }; url: string }) => {
			const resend = new Resend(RESEND_API_KEY);
			await resend.emails.send({
				from: 'SC Mascotas <no-reply@emails.jesuscova.com>',
				to: user.email,
				subject: 'Confirma tu correo electrónico',
				html: `
					<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
						<p style="font-size:24px;margin:0 0 8px">🐾</p>
						<h1 style="font-size:20px;margin:0 0 16px;color:#1c1917">Confirma tu correo</h1>
						<p style="color:#57534e;margin:0 0 24px">Hola ${user.name}, haz clic en el botón para activar tu cuenta en SC Mascotas.</p>
						<a href="${url}" style="display:inline-block;background:#92400e;color:#fff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-weight:600;font-size:14px">
							Confirmar correo
						</a>
						<p style="color:#a8a29e;font-size:12px;margin:24px 0 0">El enlace expira en 24 horas. Si no creaste esta cuenta, ignora este mensaje.</p>
					</div>
				`
			});
		}
	},
	...googleProvider,
	plugins: [passkey(), apiKey({ defaultPrefix: 'scp_' }), admin()],
	// Fallback lets the app build/dev without the env var;
	// production deployments must set BETTER_AUTH_SECRET.
	secret: process.env.BETTER_AUTH_SECRET ?? 'dev-only-change-in-production'
});
