import { customType } from 'drizzle-orm/pg-core';

export type LatLng = { lat: number; lng: number };

const WKT_POINT_RE = /^POINT\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)$/i;

/**
 * `geography(Point, 4326)` column.
 *
 * Inputs: serialised as EWKT (`SRID=4326;POINT(lng lat)`) — PostGIS casts this
 * implicitly to `geography(Point, 4326)`.
 *
 * Reads: PostGIS returns this column as EWKB hex by default, which is not
 * useful client-side. Service queries that need coordinates must project via
 * raw SQL: `ST_X(location::geometry) AS lng, ST_Y(location::geometry) AS lat`.
 * Do NOT include the raw geography column in plain Drizzle `select()` calls.
 */
export function geographyPointColumn(name: string) {
  return customType<{ data: LatLng; driverData: string }>({
    dataType() {
      return 'geography(Point, 4326)';
    },
    fromDriver(value: string): LatLng {
      const m = WKT_POINT_RE.exec(value);
      if (!m) {
        throw new Error(
          `geographyPointColumn cannot parse "${value}". ` +
          `Read this column via raw SQL projection: ST_X(col::geometry), ST_Y(col::geometry).`,
        );
      }
      return { lng: Number(m[1]), lat: Number(m[2]) };
    },
    toDriver(value: LatLng): string {
      return `SRID=4326;POINT(${value.lng} ${value.lat})`;
    },
  })(name);
}
