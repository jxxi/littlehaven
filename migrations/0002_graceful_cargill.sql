ALTER TABLE "circle_members" ALTER COLUMN "user_id" SET DATA TYPE varchar(40);--> statement-breakpoint
ALTER TABLE "circle_members" ALTER COLUMN "nickname" SET DATA TYPE varchar(12);--> statement-breakpoint
ALTER TABLE "circle_members" ADD COLUMN "bio" varchar(32);