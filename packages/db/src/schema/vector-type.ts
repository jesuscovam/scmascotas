import { customType } from 'drizzle-orm/pg-core';

/**
 * Drizzle custom type for pgvector vector(dims).
 * Serialises number[] ↔ postgres "[a,b,c,...]" wire format.
 */
export function vectorColumn(name: string, dims: number) {
  return customType<{ data: number[]; driverData: string }>({
    dataType() {
      return `vector(${dims})`;
    },
    fromDriver(value: string): number[] {
      return value.replace(/^\[|\]$/g, '').split(',').map(Number);
    },
    toDriver(value: number[]): string {
      return `[${value.join(',')}]`;
    },
  })(name);
}
