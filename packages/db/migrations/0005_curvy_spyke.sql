CREATE TYPE "public"."spotted_pet_status" AS ENUM('open', 'resolved');--> statement-breakpoint
CREATE TABLE "spotted_pets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"type" "pet_type" NOT NULL,
	"description" text,
	"colonia_id" uuid,
	"color" text,
	"size" "pet_size",
	"photo_url" text,
	"contact_whatsapp" text,
	"edit_token" text NOT NULL,
	"reporter_user_id" text,
	"reporter_ip_hash" text,
	"status" "spotted_pet_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "spotted_pets_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "spotted_pets" ADD CONSTRAINT "spotted_pets_colonia_id_colonias_id_fk" FOREIGN KEY ("colonia_id") REFERENCES "public"."colonias"("id") ON DELETE no action ON UPDATE no action;