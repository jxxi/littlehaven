ALTER TABLE "channels" DROP CONSTRAINT "channels_parent_id_channels_channel_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_referenced_message_id_messages_message_id_fk";
--> statement-breakpoint
ALTER TABLE "channels" DROP COLUMN IF EXISTS "parent_id";--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN IF EXISTS "referenced_message_id";