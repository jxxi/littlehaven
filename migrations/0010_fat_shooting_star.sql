ALTER TABLE "circle_members" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "circle_members" ADD COLUMN "member_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;