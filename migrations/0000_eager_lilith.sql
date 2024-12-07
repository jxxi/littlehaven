CREATE TABLE IF NOT EXISTS "attachments" (
	"attachment_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"filename" varchar(255) NOT NULL,
	"size" integer NOT NULL,
	"url" text NOT NULL,
	"proxy_url" text,
	"content_type" varchar(100)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channel_permissions" (
	"channel_id" uuid,
	"role_id" bigint,
	"allow_permissions" bigint DEFAULT 0 NOT NULL,
	"deny_permissions" bigint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channels" (
	"channel_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"circle_id" uuid,
	"name" varchar(100) NOT NULL,
	"type" varchar(20) NOT NULL,
	"position" integer,
	"topic" text,
	"is_nsfw" boolean DEFAULT false,
	"rate_limit_per_user" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "circle_members" (
	"circle_id" uuid,
	"user_id" bigint,
	"nickname" varchar(32),
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"is_deafened" boolean DEFAULT false,
	"is_muted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "circles" (
	"circle_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"icon_url" text,
	"owner_id" bigint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"region" varchar(50),
	"max_members" integer DEFAULT 500000,
	"description" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invites" (
	"invite_code" varchar(10) PRIMARY KEY NOT NULL,
	"circle_id" uuid NOT NULL,
	"channel_id" uuid NOT NULL,
	"inviter_id" bigint NOT NULL,
	"max_uses" integer,
	"max_age" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"uses" integer DEFAULT 0,
	"is_temporary" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "member_roles" (
	"circle_id" uuid,
	"user_id" bigint,
	"role_id" bigint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" (
	"message_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel_id" uuid NOT NULL,
	"author_id" bigint NOT NULL,
	"content" text,
	"is_pinned" boolean DEFAULT false,
	"is_tts" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"edited_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reactions" (
	"message_id" uuid,
	"user_id" bigint,
	"emoji" varchar(32),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reactions_message_id_user_id_emoji_pk" PRIMARY KEY("message_id","user_id","emoji")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roles" (
	"role_id" bigint PRIMARY KEY NOT NULL,
	"circle_id" uuid,
	"name" varchar(100) NOT NULL,
	"color" integer,
	"position" integer NOT NULL,
	"permissions" bigint NOT NULL,
	"is_mentionable" boolean DEFAULT true,
	"is_hoisted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"user_id" varchar(100) PRIMARY KEY NOT NULL,
	"username" varchar(32) NOT NULL,
	"bio" varchar(100),
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attachments" ADD CONSTRAINT "attachments_message_id_messages_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("message_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "channel_permissions" ADD CONSTRAINT "channel_permissions_channel_id_channels_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("channel_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "channel_permissions" ADD CONSTRAINT "channel_permissions_role_id_roles_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("role_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "channels" ADD CONSTRAINT "channels_circle_id_circles_circle_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."circles"("circle_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "circle_members" ADD CONSTRAINT "circle_members_circle_id_circles_circle_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."circles"("circle_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invites" ADD CONSTRAINT "invites_circle_id_circles_circle_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."circles"("circle_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invites" ADD CONSTRAINT "invites_channel_id_channels_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("channel_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "member_roles" ADD CONSTRAINT "member_roles_role_id_roles_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("role_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_channel_id_channels_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("channel_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reactions" ADD CONSTRAINT "reactions_message_id_messages_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("message_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "roles" ADD CONSTRAINT "roles_circle_id_circles_circle_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."circles"("circle_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
