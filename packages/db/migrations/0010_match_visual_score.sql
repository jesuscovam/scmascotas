ALTER TYPE "public"."spotted_pet_status" ADD VALUE 'archived';--> statement-breakpoint
ALTER TABLE "match_results" ADD COLUMN "visual_score" integer;