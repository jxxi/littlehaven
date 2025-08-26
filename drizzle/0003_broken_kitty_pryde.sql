CREATE TABLE IF NOT EXISTS "encryption_keys" (
	"key_id" varchar(255) PRIMARY KEY NOT NULL,
	"circle_id" uuid NOT NULL,
	"channel_id" uuid NOT NULL,
	"key_data" text NOT NULL,
	"algorithm" varchar(20) DEFAULT 'AES-GCM' NOT NULL,
	"key_length" integer DEFAULT 256 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "encryption_iv" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "encryption_keys" ADD CONSTRAINT "encryption_keys_circle_id_circles_circle_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."circles"("circle_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "encryption_keys" ADD CONSTRAINT "encryption_keys_channel_id_channels_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("channel_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
