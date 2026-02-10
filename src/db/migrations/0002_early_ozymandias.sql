CREATE TABLE "class_teachers" (
	"id" text PRIMARY KEY NOT NULL,
	"faculty_id" text NOT NULL,
	"batch_id" text NOT NULL,
	"class_id" text NOT NULL,
	CONSTRAINT "class_teachers_batch_id_class_id_unique" UNIQUE("batch_id","class_id")
);
--> statement-breakpoint
ALTER TABLE "class_teachers" ADD CONSTRAINT "class_teachers_faculty_id_faculty_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculty"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_teachers" ADD CONSTRAINT "class_teachers_batch_id_academic_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."academic_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_teachers" ADD CONSTRAINT "class_teachers_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;