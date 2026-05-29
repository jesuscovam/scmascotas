import { db, colonias } from '@scmascotas/db';
import { sql } from 'drizzle-orm';

export const ColoniasService = {
  async list() {
    // Project centroid as { lat, lng } via ST_X / ST_Y. The raw `centroid`
    // geography column would come back as hex EWKB — unparseable client-side.
    return db
      .select({
        id: colonias.id,
        name: colonias.name,
        slug: colonias.slug,
        lat: sql<number | null>`ST_Y(${colonias.centroid}::geometry)`.as('lat'),
        lng: sql<number | null>`ST_X(${colonias.centroid}::geometry)`.as('lng')
      })
      .from(colonias)
      .orderBy(colonias.name);
  }
};
