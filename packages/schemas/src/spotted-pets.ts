import { z } from 'zod';

export const createSpottedPetSchema = z.object({
	type:            z.enum(['dog', 'cat', 'other']),
	coloniaId:       z.string().uuid(),
	description:     z.string().max(500).optional(),
	color:           z.string().max(80).optional(),
	size:            z.enum(['small', 'medium', 'large']).optional(),
	contactWhatsapp: z.string().max(20).optional(),
});

export type CreateSpottedPet = z.infer<typeof createSpottedPetSchema>;
