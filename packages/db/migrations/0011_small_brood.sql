-- Enable PostGIS extension (idempotent)
CREATE EXTENSION IF NOT EXISTS postgis;--> statement-breakpoint
CREATE TYPE "public"."location_precision" AS ENUM('precise', 'colonia', 'unknown');--> statement-breakpoint
ALTER TABLE "colonias" ADD COLUMN "centroid" geography(Point, 4326);--> statement-breakpoint
ALTER TABLE "pets" ADD COLUMN "location" geography(Point, 4326);--> statement-breakpoint
ALTER TABLE "pets" ADD COLUMN "location_precision" "location_precision" DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
ALTER TABLE "spotted_pets" ADD COLUMN "location" geography(Point, 4326);--> statement-breakpoint
ALTER TABLE "spotted_pets" ADD COLUMN "location_precision" "location_precision" DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
-- GIST indexes for spatial queries (ST_DWithin, viewport bounds)
CREATE INDEX IF NOT EXISTS "pets_location_idx" ON "pets" USING GIST ("location");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "spotted_pets_location_idx" ON "spotted_pets" USING GIST ("location");
