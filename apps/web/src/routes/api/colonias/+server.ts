import { json } from '@sveltejs/kit';
import { ColoniasService } from '@scpets/services';

export async function GET() {
  const list = await ColoniasService.list();
  return json(list);
}
