import { db, colonias } from '@scpets/db';

export const ColoniasService = {
  async list() {
    return db.select().from(colonias).orderBy(colonias.name);
  }
};
