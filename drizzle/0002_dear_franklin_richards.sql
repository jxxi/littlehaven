CREATE TABLE IF NOT EXISTS "waitlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"location" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "encrypted_content" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "encryption_key_id" varchar(255);--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "is_encrypted" boolean DEFAULT false;