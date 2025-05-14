ALTER TABLE "channels" ADD COLUMN "last_message_timestamp" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "circle_members" ADD COLUMN "last_read_timestamp" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "circles" ADD COLUMN "last_message_timestamp" timestamp DEFAULT now();