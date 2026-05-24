import { json, error } from '@sveltejs/kit';
import { MatchesService } from '@scmascotas/services';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, params }) => {
  const body = await request.json().catch(() => null);
  if (!body || !['match', 'no_match'].includes(body.verdict)) {
    throw error(400, 'verdict debe ser "match" o "no_match"');
  }
  const verdict = body.verdict as 'match' | 'no_match';

  const updated = await MatchesService.recordVerdict(params.id, verdict);
  if (!updated) throw error(404, 'Resultado de emparejamiento no encontrado');

  return json({ ok: true });
};
