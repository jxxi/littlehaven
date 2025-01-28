ALTER TABLE "messages" ADD COLUMN "circle_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "channel_id" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_circle_id_circles_circle_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."circles"("circle_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_channel_id_channels_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("channel_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
