CREATE TABLE IF NOT EXISTS "user_channels" (
	"user_id" varchar(40) NOT NULL,
	"channel_id" uuid,
	"last_read_timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "circle_tags" DROP CONSTRAINT "circle_tags_circle_id_tag_name_pk";--> statement-breakpoint
ALTER TABLE "reactions" DROP CONSTRAINT "reactions_message_id_user_id_emoji_pk";--> statement-breakpoint
ALTER TABLE "circle_members" ALTER COLUMN "circle_id" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_channels" ADD CONSTRAINT "user_channels_channel_id_channels_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("channel_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "circle_members" DROP COLUMN IF EXISTS "member_id";