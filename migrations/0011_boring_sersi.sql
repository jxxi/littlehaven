CREATE TABLE IF NOT EXISTS "tags" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(40) NOT NULL,
	"description" varchar(40)
);
