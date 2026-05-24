CREATE TABLE "match_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"spotted_pet_id" uuid NOT NULL,
	"pet_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"human_verdict" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_spotted_pet_id_spotted_pets_id_fk" FOREIGN KEY ("spotted_pet_id") REFERENCES "public"."spotted_pets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "match_results_spotted_pet_unique" ON "match_results" USING btree ("spotted_pet_id","pet_id");--> statement-breakpoint
CREATE INDEX "match_results_spotted_pet_idx" ON "match_results" USING btree ("spotted_pet_id");