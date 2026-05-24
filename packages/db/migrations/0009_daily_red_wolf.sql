-- Enable pgvector extension (idempotent)
CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
ALTER TABLE "pet_photos" ADD COLUMN "embedding" vector(768);--> statement-breakpoint
ALTER TABLE "spotted_pets" ADD COLUMN "embedding" vector(768);