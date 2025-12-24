CREATE TABLE "emails" (
	"id" uuid PRIMARY KEY NOT NULL,
	"recipient" text NOT NULL,
	"sender" text NOT NULL,
	"subject" text NOT NULL,
	"text" text NOT NULL,
	"html" text,
	"date" timestamp with time zone NOT NULL,
	"raw" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_emails_recipient_date" ON "emails" USING btree ("recipient","date");