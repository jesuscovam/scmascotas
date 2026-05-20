import { z } from 'zod';

export const createSightingSchema = z.object({
  description: z.string().trim().max(500).optional(),
  colonia: z.string().optional()
});

export type CreateSighting = z.infer<typeof createSightingSchema>;
