CREATE TABLE IF NOT EXISTS "circle_tags" (
	"circle_id" uuid,
	"tag_name" "tag_name" NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "circle_tags_circle_id_tag_name_pk" PRIMARY KEY("circle_id","tag_name")
);
--> statement-breakpoint
DROP TABLE "tags";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "circle_tags" ADD CONSTRAINT "circle_tags_circle_id_circles_circle_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."circles"("circle_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
