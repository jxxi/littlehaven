ALTER TABLE "messages" RENAME COLUMN "id" TO "message_id";--> statement-breakpoint
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_message_id_messages_id_fk";
--> statement-breakpoint
ALTER TABLE "reactions" DROP CONSTRAINT "reactions_message_id_messages_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "circle_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "circle_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "channel_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "channel_id" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attachments" ADD CONSTRAINT "attachments_message_id_messages_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("message_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reactions" ADD CONSTRAINT "reactions_message_id_messages_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("message_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
