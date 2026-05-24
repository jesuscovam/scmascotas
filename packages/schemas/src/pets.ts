import { z } from 'zod';

export const createMissingPetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  species: z.enum(['dog', 'cat', 'other']),
  breed: z.string().max(100).optional(),
  color: z.string().min(1).max(100),
  sex: z.enum(['male', 'female', 'unknown']),
  size: z.enum(['small', 'medium', 'large']),
  colonia_id: z.string().uuid(),
  last_seen_at: z.coerce.date(),
  description: z.string().max(1000).optional(),
  contact_whatsapp: z.string().max(20).optional(),
  contact_name: z.string().max(100).optional(),
  anonymous: z.boolean().default(false)
});

export type CreateMissingPet = z.infer<typeof createMissingPetSchema>;

export const updatePetSchema = createMissingPetSchema.partial().extend({
  editToken: z.string().optional()
});

export type UpdatePet = z.infer<typeof updatePetSchema>;
