import { customType } from 'drizzle-orm/pg-core';

export type LatLng = { lat: number; lng: number };

const WKT_POINT_RE = /^POINT\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)$/i;
const HEX_RE = /^[0-9a-fA-F]+$/;

// PostGIS WKB type code for Point is 1. With the SRID extension flag
// (0x20000000) this becomes 0x20000001 — what we expect to see for our
// `geography(Point, 4326)` columns.
const WKB_POINT_TYPE = 0x20000001;

/**
 * `geography(Point, 4326)` column.
 *
 * Writes: serialise as EWKT (`SRID=4326;POINT(lng lat)`). PostGIS casts
 * implicitly to `geography(Point, 4326)`.
 *
 * Reads: PostGIS returns this column as **EWKB hex** by default
 * (e.g. `0101000020E61000000000007E232957C0...`). We decode that here so
 * plain `select()` and `.returning()` queries don't blow up. WKT input
 * (from `ST_AsText` / explicit projection) also works.
 *
 * Tip: when many rows are returned, prefer projecting `ST_X(col::geometry)`
 * / `ST_Y(col::geometry)` in the SELECT — it's slightly cheaper than
 * parsing EWKB on the client and avoids transferring the binary blob.
 */
export function geographyPointColumn(name: string) {
  return customType<{ data: LatLng; driverData: string }>({
    dataType() {
      return 'geography(Point, 4326)';
    },
    fromDriver(value: string): LatLng {
      const wkt = WKT_POINT_RE.exec(value);
      if (wkt) return { lng: Number(wkt[1]), lat: Number(wkt[2]) };

      if (HEX_RE.test(value) && value.length >= 42) {
        return parseEwkbHexPoint(value);
      }

      throw new Error(`geographyPointColumn cannot parse "${value}"`);
    },
    toDriver(value: LatLng): string {
      return `SRID=4326;POINT(${value.lng} ${value.lat})`;
    },
  })(name);
}

function parseEwkbHexPoint(hex: string): LatLng {
  const buf = new Uint8Array(hex.length / 2);
  for (let i = 0; i < buf.length; i++) {
    buf[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  const view = new DataView(buf.buffer);

  const littleEndian = view.getUint8(0) === 1;
  const type = view.getUint32(1, littleEndian);
  if (type !== WKB_POINT_TYPE) {
    throw new Error(
      `geographyPointColumn expected Point with SRID (type 0x${WKB_POINT_TYPE.toString(16)}), got 0x${type.toString(16)}`,
    );
  }

  // Bytes 5–8: SRID (uint32). Bytes 9–16: X (double, lng). Bytes 17–24: Y (double, lat).
  const lng = view.getFloat64(9, littleEndian);
  const lat = view.getFloat64(17, littleEndian);
  return { lat, lng };
}
