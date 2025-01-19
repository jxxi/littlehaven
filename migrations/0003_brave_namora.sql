ALTER TABLE "circles" ALTER COLUMN "owner_id" SET DATA TYPE varchar(40);--> statement-breakpoint
ALTER TABLE "invites" ALTER COLUMN "inviter_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "member_roles" ALTER COLUMN "user_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "member_roles" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reactions" ALTER COLUMN "user_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "reactions" ALTER COLUMN "user_id" SET NOT NULL;