import { json, error } from '@sveltejs/kit';
import { MatchesService } from '@scmascotas/services';
import { z } from 'zod';
import type { RequestHandler } from './$types';

const verdictSchema = z.object({
  verdict: z.enum(['match', 'no_match']),
});

export const POST: RequestHandler = async ({ request, params }) => {
  const body = await request.json().catch(() => null);
  const parsed = verdictSchema.safeParse(body);
  if (!parsed.success) throw error(400, 'verdict debe ser "match" o "no_match"');

  const updated = await MatchesService.recordVerdict(params.id, parsed.data.verdict);
  if (!updated) throw error(404, 'Resultado de emparejamiento no encontrado');

  return json({ ok: true });
};
