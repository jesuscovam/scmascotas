export const config = { runtime: 'edge' };
import { json, error } from '@sveltejs/kit';
import { db, contactMessages } from '@scmascotas/db';
import { Resend } from 'resend';
import { RESEND_API_KEY, CONTACT_EMAIL } from '$env/static/private';
import { checkLimit } from '$lib/server/rate-limit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();

  const name = (body.name ?? '').trim();
  const email = (body.email ?? '').trim();
  const message = (body.message ?? '').trim();

  if (!name || !message) {
    throw error(400, 'Nombre y mensaje son requeridos.');
  }
  if (message.length > 2000) {
    throw error(400, 'El mensaje no puede superar los 2000 caracteres.');
  }

  const forwarded = request.headers.get('x-forwarded-for') ?? '';
  const ip = forwarded.split(',')[0].trim();
  const ipHash = ip ? Buffer.from(ip).toString('base64') : undefined;

  if (!await checkLimit('contact', ipHash)) {
    throw error(429, 'Demasiados mensajes. Intenta de nuevo mañana.');
  }

  await db.insert(contactMessages).values({ name, email: email || null, message, ipHash });

  const resend = new Resend(RESEND_API_KEY);
  await resend.emails.send({
    from: 'SC Mascotas <no-reply@emails.jesuscova.com>',
    to: CONTACT_EMAIL,
    subject: `Nuevo mensaje de ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1c1917">
        <p style="font-size:22px;margin:0 0 4px">🐾</p>
        <h2 style="font-size:18px;margin:0 0 20px;color:#1c1917">Nuevo mensaje desde SC Mascotas</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <tr><td style="padding:6px 0;color:#78716c;font-size:13px;width:72px">Nombre</td><td style="padding:6px 0;font-size:14px">${name}</td></tr>
          <tr><td style="padding:6px 0;color:#78716c;font-size:13px">Correo</td><td style="padding:6px 0;font-size:14px">${email || '—'}</td></tr>
        </table>
        <div style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:12px;padding:16px 20px;font-size:14px;line-height:1.7;white-space:pre-wrap">${message}</div>
        <p style="color:#a8a29e;font-size:12px;margin:24px 0 0">Enviado desde scmascotas.xyz</p>
      </div>
    `
  });

  return json({ ok: true }, { status: 201 });
};
