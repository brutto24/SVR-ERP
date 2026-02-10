import { pgTable, text, integer, boolean, timestamp, primaryKey, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Users Table (Authentication)
// Single table for all roles with role-based access
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Using CUID or UUID in application
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // Hashed
  name: text("name").notNull(),
  role: text("role", { enum: ["admin", "faculty", "student"] }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  mustChangePassword: boolean("must_change_password").notNull().default(false), // True for new users/resets
  tokenVersion: integer("token_version").notNull().default(0), // For logout from all devices
  isFirstLogin: boolean("is_first_login").notNull().default(true), // Prompt password change on first login
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Academic Batches
// e.g., 2023-2027
export const academicBatches = pgTable("academic_batches", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(), // "2023-2027"
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

// 3. Classes / Sections
// e.g., A, B, C (Specific to a Batch)
export const classes = pgTable("classes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(), // "A", "B", "C"
  batchId: text("batch_id").references(() => academicBatches.id).notNull(), // Linked to specific batch
}, (t) => ({
  uniqueClassPerBatch: unique().on(t.batchId, t.name),
}));

// 4. Students
// Extends user profile
export const students = pgTable("students", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull().unique(), // One-to-one with users
  batchId: text("batch_id").references(() => academicBatches.id).notNull(),
  classId: text("class_id").references(() => classes.id).notNull(),
  registerNumber: text("register_number").notNull().unique(), // e.g., 23A1AI01
  currentSemester: text("current_semester").notNull(), // "1-1", "1-2", etc.
  status: text("status", { enum: ["active", "passed", "dropped"] }).notNull().default("active"),
  attendancePercentage: integer("attendance_percentage").default(0),
  cgpa: text("cgpa").default("0.0"), // Using text for precision retention ease or float
  sgpa: text("sgpa").default("0.0"), // Using text for precision retention ease or float
  profilePicture: text("profile_picture"), // Base64 or URL
});

// 5. Faculty
// Extends user profile
export const faculty = pgTable("faculty", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull().unique(),
  employeeId: text("employee_id").notNull().unique(),
  designation: text("designation").notNull(),
  department: text("department").notNull(),
});

// 6. Subjects
// Dynamic subjects linked to batch and semester
export const subjects = pgTable("subjects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  batchId: text("batch_id").references(() => academicBatches.id).notNull(),
  semester: text("semester").notNull(), // "1-1", "1-2" etc.
  credits: integer("credits").notNull(),
  type: text("type", { enum: ["theory", "lab"] }).notNull(),
  // For electives, we might need more complex logic, but keeping it simple for now
});

// 7. Faculty-Subject Assignment
// Who teaches what to which class
export const facultySubjects = pgTable("faculty_subjects", {
  id: text("id").primaryKey(),
  facultyId: text("faculty_id").references(() => faculty.id).notNull(),
  subjectId: text("subject_id").references(() => subjects.id).notNull(),
  classId: text("class_id").references(() => classes.id).notNull(),
}, (t) => ({
  uniqueAssignment: unique().on(t.subjectId, t.classId), // Only one faculty per subject per class usually, or remove if allow multiple
}));

// 8. Timetable
export const timetable = pgTable("timetable", {
  id: text("id").primaryKey(),
  batchId: text("batch_id").references(() => academicBatches.id).notNull(),
  classId: text("class_id").references(() => classes.id).notNull(),
  semester: text("semester").notNull(),
  dayOfWeek: text("day_of_week", { enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] }).notNull(),
  period: integer("period").notNull(), // 1 to 7
  subjectId: text("subject_id").references(() => subjects.id), // Nullable for free periods
});

// 9. Attendance
// Date-wise, Period-wise, Student-wise
export const attendance = pgTable("attendance", {
  id: text("id").primaryKey(),
  studentId: text("student_id").references(() => students.id).notNull(),
  subjectId: text("subject_id").references(() => subjects.id).notNull(),
  date: timestamp("date").notNull(),
  period: integer("period").notNull(),
  isPresent: boolean("is_present").notNull(),
  isLocked: boolean("is_locked").notNull().default(false), // Faculty locks it
  markedBy: text("marked_by").references(() => users.id).notNull(), // Audit trail
}, (t) => ({
  uniqueRecord: unique().on(t.studentId, t.date, t.period),
}));

// 10. Marks
// Subject-wise 
export const marks = pgTable("marks", {
  id: text("id").primaryKey(),
  studentId: text("student_id").references(() => students.id).notNull(),
  subjectId: text("subject_id").references(() => subjects.id).notNull(),
  type: text("type", { enum: ["mid1", "mid2", "semester", "lab_internal", "lab_external"] }).notNull(),

  // Dynamic JSON structure for breakdown? Or specific columns?
  // Request asks for specific headers like "Objective", "Theory", "Assignment" for theory internals
  // Let's use specific columns for better enforcing structure, or JSON for flexibility.
  // Given strict requirements, specific columns are safer but might be sparse.
  // Let's try to map the requirement fields.

  objective: integer("objective").default(0), // For theory internal
  theory: integer("theory").default(0),       // For theory internal
  assignment: integer("assignment").default(0), // For theory internal

  total: integer("total").notNull().default(0), // Auto-calculated

  isLocked: boolean("is_locked").notNull().default(false),
  enteredBy: text("entered_by").references(() => users.id),
}, (t) => ({
  uniqueMark: unique().on(t.studentId, t.subjectId, t.type),
}));

// 11. Class Teachers
// Explicit assignment of a faculty as a "Class Teacher" for a specific Batch & Class
export const classTeachers = pgTable("class_teachers", {
  id: text("id").primaryKey(),
  facultyId: text("faculty_id").references(() => faculty.id).notNull(),
  batchId: text("batch_id").references(() => academicBatches.id).notNull(),
  classId: text("class_id").references(() => classes.id).notNull(),
}, (t) => ({
  // Ensure one class teacher per class per batch? Or maybe multiple allowed? 
  // Usually one main class teacher. Let's start with unique constraint to be safe.
  uniqueClassTeacher: unique().on(t.batchId, t.classId),
}));

export const classTeachersRelations = relations(classTeachers, ({ one }) => ({
  faculty: one(faculty, {
    fields: [classTeachers.facultyId],
    references: [faculty.id],
  }),
  batch: one(academicBatches, {
    fields: [classTeachers.batchId],
    references: [academicBatches.id],
  }),
  class: one(classes, {
    fields: [classTeachers.classId],
    references: [classes.id],
  }),
}));
export const usersRelations = relations(users, ({ one }) => ({
  student: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  faculty: one(faculty, {
    fields: [users.id],
    references: [faculty.userId],
  }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  batch: one(academicBatches, {
    fields: [students.batchId],
    references: [academicBatches.id],
  }),
  class: one(classes, {
    fields: [students.classId],
    references: [classes.id],
  }),
  attendance: many(attendance),
  marks: many(marks),
}));

export const facultyRelations = relations(faculty, ({ one, many }) => ({
  user: one(users, {
    fields: [faculty.userId],
    references: [users.id],
  }),
  assignments: many(facultySubjects),
}));

export const academicBatchesRelations = relations(academicBatches, ({ many }) => ({
  students: many(students),
  subjects: many(subjects),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  batch: one(academicBatches, {
    fields: [classes.batchId],
    references: [academicBatches.id],
  }),
  students: many(students),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  batch: one(academicBatches, {
    fields: [subjects.batchId],
    references: [academicBatches.id],
  }),
  attendance: many(attendance),
  marks: many(marks),
}));

export const facultySubjectsRelations = relations(facultySubjects, ({ one }) => ({
  faculty: one(faculty, {
    fields: [facultySubjects.facultyId],
    references: [faculty.id],
  }),
  subject: one(subjects, {
    fields: [facultySubjects.subjectId],
    references: [subjects.id],
  }),
  class: one(classes, {
    fields: [facultySubjects.classId],
    references: [classes.id],
  }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(students, {
    fields: [attendance.studentId],
    references: [students.id],
  }),
  subject: one(subjects, {
    fields: [attendance.subjectId],
    references: [subjects.id],
  }),
}));

export const marksRelations = relations(marks, ({ one }) => ({
  student: one(students, {
    fields: [marks.studentId],
    references: [students.id],
  }),
  subject: one(subjects, {
    fields: [marks.subjectId],
    references: [subjects.id],
  }),
}));
