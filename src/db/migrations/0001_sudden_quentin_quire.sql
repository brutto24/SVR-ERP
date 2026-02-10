CREATE TABLE "academic_batches" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "academic_batches_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"date" timestamp NOT NULL,
	"period" integer NOT NULL,
	"is_present" boolean NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"marked_by" text NOT NULL,
	CONSTRAINT "attendance_student_id_date_period_unique" UNIQUE("student_id","date","period")
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "classes_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "faculty" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"designation" text NOT NULL,
	"department" text NOT NULL,
	CONSTRAINT "faculty_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "faculty_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
CREATE TABLE "faculty_subjects" (
	"id" text PRIMARY KEY NOT NULL,
	"faculty_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"class_id" text NOT NULL,
	CONSTRAINT "faculty_subjects_subject_id_class_id_unique" UNIQUE("subject_id","class_id")
);
--> statement-breakpoint
CREATE TABLE "marks" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"type" text NOT NULL,
	"objective" integer DEFAULT 0,
	"theory" integer DEFAULT 0,
	"assignment" integer DEFAULT 0,
	"total" integer DEFAULT 0 NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"entered_by" text,
	CONSTRAINT "marks_student_id_subject_id_type_unique" UNIQUE("student_id","subject_id","type")
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"batch_id" text NOT NULL,
	"class_id" text NOT NULL,
	"register_number" text NOT NULL,
	"current_semester" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"attendance_percentage" integer DEFAULT 0,
	"cgpa" text DEFAULT '0.0',
	"sgpa" text DEFAULT '0.0',
	"profile_picture" text,
	CONSTRAINT "students_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "students_register_number_unique" UNIQUE("register_number")
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"batch_id" text NOT NULL,
	"semester" text NOT NULL,
	"credits" integer NOT NULL,
	"type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timetable" (
	"id" text PRIMARY KEY NOT NULL,
	"batch_id" text NOT NULL,
	"class_id" text NOT NULL,
	"semester" text NOT NULL,
	"day_of_week" text NOT NULL,
	"period" integer NOT NULL,
	"subject_id" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"must_change_password" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_marked_by_users_id_fk" FOREIGN KEY ("marked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty" ADD CONSTRAINT "faculty_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_subjects" ADD CONSTRAINT "faculty_subjects_faculty_id_faculty_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculty"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_subjects" ADD CONSTRAINT "faculty_subjects_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_subjects" ADD CONSTRAINT "faculty_subjects_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marks" ADD CONSTRAINT "marks_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marks" ADD CONSTRAINT "marks_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marks" ADD CONSTRAINT "marks_entered_by_users_id_fk" FOREIGN KEY ("entered_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_batch_id_academic_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."academic_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_batch_id_academic_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."academic_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable" ADD CONSTRAINT "timetable_batch_id_academic_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."academic_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable" ADD CONSTRAINT "timetable_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable" ADD CONSTRAINT "timetable_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;