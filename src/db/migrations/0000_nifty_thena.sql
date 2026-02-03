CREATE TABLE `academic_years` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`year` text NOT NULL,
	`current_year` integer DEFAULT false NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `academic_years_year_unique` ON `academic_years` (`year`);--> statement-breakpoint
CREATE TABLE `attendance` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_id` text NOT NULL,
	`subject_id` integer NOT NULL,
	`date` integer NOT NULL,
	`period` integer NOT NULL,
	`status` text NOT NULL,
	`marked_by` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`marked_by`) REFERENCES `faculty`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `faculty` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`employee_id` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'faculty' NOT NULL,
	`subjects` text NOT NULL,
	`designation` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `faculty_employee_id_unique` ON `faculty` (`employee_id`);--> statement-breakpoint
CREATE TABLE `marks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_id` text NOT NULL,
	`subject_id` integer NOT NULL,
	`exam_type` text NOT NULL,
	`written` integer DEFAULT 0 NOT NULL,
	`bit_paper` integer DEFAULT 0 NOT NULL,
	`assignment` integer DEFAULT 0 NOT NULL,
	`internal_total` integer DEFAULT 0 NOT NULL,
	`external` integer DEFAULT 0 NOT NULL,
	`final_total` integer DEFAULT 0 NOT NULL,
	`credits` integer DEFAULT 3 NOT NULL,
	`pass_fail` text,
	`entered_by` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`entered_by`) REFERENCES `faculty`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`student_id` text NOT NULL,
	`name` text NOT NULL,
	`photo` text,
	`class` text NOT NULL,
	`batch` text NOT NULL,
	`academic_year` text NOT NULL,
	`section` text NOT NULL,
	`year_of_admission` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `students_student_id_unique` ON `students` (`student_id`);--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`is_lab` integer DEFAULT false NOT NULL,
	`credits` integer DEFAULT 3 NOT NULL,
	`academic_year` text NOT NULL,
	`semester` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subjects_code_unique` ON `subjects` (`code`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'student' NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);