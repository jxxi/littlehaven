ALTER TABLE "circles" RENAME COLUMN "public" TO "is_public";--> statement-breakpoint
ALTER TABLE "messages" RENAME COLUMN "message_id" TO "id";--> statement-breakpoint
ALTER TABLE "messages" RENAME COLUMN "author_id" TO "user_id";--> statement-breakpoint
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_message_id_messages_message_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_channel_id_channels_channel_id_fk";
--> statement-breakpoint
ALTER TABLE "reactions" DROP CONSTRAINT "reactions_message_id_messages_message_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "channel_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "user_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "content" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "circle_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "media_url" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "media_type" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "thumbnail_url" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attachments" ADD CONSTRAINT "attachments_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reactions" ADD CONSTRAINT "reactions_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
