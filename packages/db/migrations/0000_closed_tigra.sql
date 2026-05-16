CREATE TYPE "public"."pet_sex" AS ENUM('male', 'female', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."pet_size" AS ENUM('small', 'medium', 'large');--> statement-breakpoint
CREATE TYPE "public"."pet_status" AS ENUM('missing', 'reunited', 'archived');--> statement-breakpoint
CREATE TYPE "public"."pet_type" AS ENUM('dog', 'cat', 'other');--> statement-breakpoint
CREATE TABLE "colonias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "colonias_name_unique" UNIQUE("name"),
	CONSTRAINT "colonias_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "pets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"type" "pet_type" NOT NULL,
	"name" text,
	"description" text,
	"colonia_id" uuid,
	"last_seen_at" timestamp with time zone NOT NULL,
	"status" "pet_status" DEFAULT 'missing' NOT NULL,
	"color" text,
	"sex" "pet_sex" DEFAULT 'unknown' NOT NULL,
	"size" "pet_size",
	"breed" text,
	"contact_whatsapp" text,
	"contact_name" text,
	"anonymous" text DEFAULT 'false' NOT NULL,
	"edit_token" text NOT NULL,
	"reporter_user_id" uuid,
	"reporter_ip_hash" text,
	"reunited_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pets_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "pet_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pet_id" uuid NOT NULL,
	"url" text NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_hash" text NOT NULL,
	"action" text NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"window_start" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pets" ADD CONSTRAINT "pets_colonia_id_colonias_id_fk" FOREIGN KEY ("colonia_id") REFERENCES "public"."colonias"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pet_photos" ADD CONSTRAINT "pet_photos_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;