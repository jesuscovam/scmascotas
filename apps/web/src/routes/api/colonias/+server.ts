export const config = { runtime: 'edge' };
import { json } from '@sveltejs/kit';
import { ColoniasService } from '@scmascotas/services';

export async function GET() {
  const list = await ColoniasService.list();
  return json(list);
}
