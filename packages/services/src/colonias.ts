import { db, colonias } from '@scmascotas/db';

export const ColoniasService = {
  async list() {
    return db.select().from(colonias).orderBy(colonias.name);
  }
};
