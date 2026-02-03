import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Users table for authentication (students and faculty)
export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // Student ID or Faculty ID
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["student", "faculty", "hod"] }).notNull().default("student"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Students table - extended student information
export const students = sqliteTable("students", {
  id: text("id").primaryKey(), // Same as users.id
  userId: text("user_id").references(() => users.id).notNull(),
  studentId: text("student_id").notNull().unique(), // Display ID like 23A1AI01
  name: text("name").notNull(),
  photo: text("photo"), // URL to photo
  class: text("class").notNull(), // e.g., "II B.Tech - AI - Section A"
  batch: text("batch").notNull(), // e.g., "2023-2027"
  academicYear: text("academic_year", { enum: ["1st Year", "2nd Year", "3rd Year", "4th Year"] }).notNull(),
  section: text("section").notNull(), // A, B, etc.
  yearOfAdmission: integer("year_of_admission").notNull(),
});

// Faculty table
export const faculty = sqliteTable("faculty", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  employeeId: text("employee_id").notNull().unique(),
  name: text("name").notNull(),
  role: text("role", { enum: ["faculty", "hod"] }).notNull().default("faculty"),
  subjects: text("subjects").notNull(), // JSON array of subjects
  designation: text("designation"),
});

// Subjects table
export const subjects = sqliteTable("subjects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  isLab: integer("is_lab", { mode: "boolean" }).notNull().default(false),
  credits: integer("credits").notNull().default(3),
  academicYear: text("academic_year", { enum: ["1st Year", "2nd Year", "3rd Year", "4th Year"] }).notNull(),
  semester: integer("semester").notNull(), // 1 or 2
});

// Attendance records
export const attendance = sqliteTable("attendance", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: text("student_id").references(() => students.id).notNull(),
  subjectId: integer("subject_id").references(() => subjects.id).notNull(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  period: integer("period").notNull(), // 1-6
  status: text("status", { enum: ["Present", "Absent", "OD"] }).notNull(),
  markedBy: text("marked_by").references(() => faculty.id).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Marks records
export const marks = sqliteTable("marks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: text("student_id").references(() => students.id).notNull(),
  subjectId: integer("subject_id").references(() => subjects.id).notNull(),
  examType: text("exam_type", { enum: ["MID-1", "MID-2", "SEM"] }).notNull(),
  
  // Internal marks
  written: integer("written").notNull().default(0),
  bitPaper: integer("bit_paper").notNull().default(0),
  assignment: integer("assignment").notNull().default(0),
  internalTotal: integer("internal_total").notNull().default(0),
  
  // External marks
  external: integer("external").notNull().default(0),
  
  // Calculated fields
  finalTotal: integer("final_total").notNull().default(0),
  credits: integer("credits").notNull().default(3),
  passFail: text("pass_fail", { enum: ["Pass", "Fail"] }),
  
  enteredBy: text("entered_by").references(() => faculty.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Academic years tracking
export const academicYears = sqliteTable("academic_years", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  year: text("year").notNull().unique(), // e.g., "2023-2027"
  currentYear: integer("current_year", { mode: "boolean" }).notNull().default(false),
  startDate: integer("start_date", { mode: "timestamp" }).notNull(),
  endDate: integer("end_date", { mode: "timestamp" }).notNull(),
});
