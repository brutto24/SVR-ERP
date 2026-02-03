# Active Context: AI Department Student Management System

## Current State

**Project Status**: ✅ Under Development

A comprehensive digital student management system for SVR Engineering College - AI Department. Features role-based login (Student, Faculty, HOD) with attendance tracking, marks management, and academic data visualization.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Login page with role selection (Student/Faculty/HOD)
- [x] Student dashboard with profile, class info, and year selection
- [x] Student attendance and marks overview pages
- [x] Detailed MID-1, MID-2, SEM marks pages
- [x] Faculty attendance management module
- [x] Faculty marks entry module
- [x] HOD admin dashboard with monitoring and reports
- [x] Database setup with Drizzle ORM + SQLite
- [x] Database schema for users, students, faculty, subjects, attendance, marks

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/login/` | Login page with role selection | ✅ Complete |
| `src/app/student/` | Student dashboard and year pages | ✅ Complete |
| `src/app/student/[year]/` | Academic year selection | ✅ Complete |
| `src/app/student/[year]/marks/` | Marks detail pages | ✅ Complete |
| `src/app/faculty/` | Faculty dashboard | ✅ Complete |
| `src/app/faculty/hod/` | HOD admin dashboard | ✅ Complete |
| `src/db/schema.ts` | Database schema | ✅ Complete |
| `src/db/index.ts` | Database client | ✅ Complete |
| `src/lib/data.ts` | Mock data and types | ✅ Complete |

## Database Schema

| Table | Purpose |
|-------|---------|
| `users` | Authentication (students, faculty, HOD) |
| `students` | Extended student information |
| `faculty` | Faculty details and subjects |
| `subjects` | Course catalog with credits |
| `attendance` | Daily attendance records |
| `marks` | Exam marks (MID-1, MID-2, SEM) |
| `academic_years` | Academic year tracking |

## User Roles

1. **Student**: View attendance %, marks, pass/fail status
2. **Faculty**: Mark attendance, enter marks, edit student data
3. **HOD**: Full department access, monitoring, reports

## Quick Start Guide

### Login Credentials (Demo)
- Student: `23A1AI01` / any password
- Faculty: `FAC001` / any password
- HOD: `FAC001` / any password

### To view student dashboard:
1. Login as Student
2. Select Academic Year (1st/2nd/3rd/4th)
3. Select Semester (Odd/Even)
4. View Attendance or Marks tabs

### To enter marks:
1. Login as Faculty/HOD
2. Navigate to Marks Entry
3. Select Exam Type, Year, Section, Subject
4. Enter marks and save

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2024-02-03 | Added login system with role selection |
| 2024-02-03 | Created student dashboard with profile |
| 2024-02-03 | Added attendance and marks pages |
| 2024-02-03 | Created faculty and HOD dashboards |
| 2024-02-03 | Added Drizzle ORM database with full schema |
