CREATE TABLE "materials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filename" text NOT NULL,
	"caption" text DEFAULT '' NOT NULL,
	"file_size" integer NOT NULL,
	"file_data_base64" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "materials_created_at_idx" ON "materials" USING btree ("created_at");