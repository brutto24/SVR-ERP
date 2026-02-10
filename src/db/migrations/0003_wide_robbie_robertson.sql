ALTER TABLE "class_teachers" ADD COLUMN "can_edit_student_data" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "mobile_number" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "parent_name" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "parent_mobile" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "aadhar_number" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "apaar_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "token_version" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_first_login" boolean DEFAULT true NOT NULL;