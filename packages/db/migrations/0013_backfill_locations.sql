-- Backfill pre-existing pets and spotted_pets rows whose `location` is NULL
-- to their colonia's centroid. Marks them `location_precision = 'colonia'` so
-- the UI can show "ubicación aproximada (colonia)".

UPDATE "pets"
SET
  "location" = c."centroid",
  "location_precision" = 'colonia'
FROM "colonias" c
WHERE "pets"."colonia_id" = c."id"
  AND "pets"."location" IS NULL
  AND c."centroid" IS NOT NULL;--> statement-breakpoint

UPDATE "spotted_pets"
SET
  "location" = c."centroid",
  "location_precision" = 'colonia'
FROM "colonias" c
WHERE "spotted_pets"."colonia_id" = c."id"
  AND "spotted_pets"."location" IS NULL
  AND c."centroid" IS NOT NULL;
