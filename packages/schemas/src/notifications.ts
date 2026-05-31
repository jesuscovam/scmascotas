import { z } from 'zod';

// Per-pet "how aggressive" dial. Mirrors pet_notify_level enum in @scmascotas/db.
export const petNotifyLevelSchema = z.enum(['off', 'matches', 'colonia']);
export type PetNotifyLevel = z.infer<typeof petNotifyLevelSchema>;

export const setPetNotifyLevelSchema = z.object({
	level: petNotifyLevelSchema,
});
export type SetPetNotifyLevelInput = z.infer<typeof setPetNotifyLevelSchema>;

// Cross-cutting channel toggles the user controls. In-app is always on (the
// feed doubles as the dedup ledger); WhatsApp is omitted while the channel seam
// is off (cost-gated Business API — see PLAN.md §15). Email is the one toggle.
export const notificationPreferencesSchema = z.object({
	channelEmail: z.boolean(),
});
export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;
