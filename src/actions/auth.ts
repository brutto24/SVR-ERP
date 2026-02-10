"use server";

import { db } from "@/db";
import { users, students, faculty } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, createSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
    const identifier = formData.get("identifier") as string || formData.get("email") as string; // Support both for backward compat form
    const password = formData.get("password") as string;
    const rememberMe = formData.get("rememberMe") === "on";

    if (!identifier || !password) {
        return { error: "ID/Email and password are required" };
    }

    try {
        console.log("Login attempt for identifier:", identifier);
        let user;

        // 1. Try finding by Email first (for Admin/Faculty)
        user = await db.query.users.findFirst({
            where: eq(users.email, identifier)
        });
        console.log("User found by email:", user ? user.id : "No");

        // 2. If not found, and could be a Student ID (Register Number), try finding via students table
        if (!user) {
            console.log("Looking up by Student ID:", identifier);
            // Case-insensitive lookup for better UX
            const student = await db.query.students.findFirst({
                where: (table, { sql }) => sql`lower(${table.registerNumber}) = ${identifier.toLowerCase()}`
            });
            console.log("Student record found:", student ? student.id : "No");

            if (student) {
                user = await db.query.users.findFirst({
                    where: eq(users.id, student.userId)
                });
                console.log("Linked User found:", user ? user.id : "No");
            }
        }

        // 3. If still not found, try finding via faculty table (Employee ID)
        if (!user) {
            console.log("Looking up by Faculty ID:", identifier);
            const facultyMember = await db.query.faculty.findFirst({
                where: (table, { sql }) => sql`lower(${table.employeeId}) = ${identifier.toLowerCase()}`
            });
            console.log("Faculty record found:", facultyMember ? facultyMember.id : "No");

            if (facultyMember) {
                user = await db.query.users.findFirst({
                    where: eq(users.id, facultyMember.userId)
                });
            }
        }

        if (!user) {
            console.log("User not found via any method");
            return { error: "ID is incorrect. Please check your Student ID, Employee ID, or Email Address." };
        }

        const isValid = await verifyPassword(password, user.password);
        console.log("Password validation result:", isValid);

        if (!isValid) {
            return { error: "Password is incorrect. Please contact HOD (admin) for assistance." };
        }

        // Check if account is active
        if (!user.isActive) {
            return { error: "Your account has been deactivated by the administrator. Please contact admin for assistance." };
        }

        await createSession(user.id, user.role, user.tokenVersion || 0, rememberMe);

    } catch (error) {
        if ((error as any).digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }
        console.error("Login error:", error);
        return { error: "Something went wrong" };
    }

    // Role-based redirection is now safe after successful session creation
    // We need to re-fetch to be sure of role if we want to redirect specifically, 
    // but we already have `user` from the try block if we move the redirect inside or hoist user.
    // However, `user` is local to try block. Let's redirect to a common dashboard or re-fetch.
    // Easier to just re-fetch for the redirect logic to be clean outside try/catch.

    // Actually, we can just return a redirect? No, Server Actions need to throw redirect or return.
    // Let's re-query to be safe and clean.

    // We need to find the user again to redirect.
    let userForRedirect = await db.query.users.findFirst({ where: eq(users.email, identifier) });
    if (!userForRedirect) {
        // Must be student ID lookup
        const student = await db.query.students.findFirst({ where: (table, { sql }) => sql`lower(${table.registerNumber}) = ${identifier.toLowerCase()}` });
        if (student) {
            userForRedirect = await db.query.users.findFirst({ where: eq(users.id, student.userId) });
        }
    }
    if (!userForRedirect) {
        // Must be Faculty ID lookup
        const facultyMember = await db.query.faculty.findFirst({ where: (table, { sql }) => sql`lower(${table.employeeId}) = ${identifier.toLowerCase()}` });
        if (facultyMember) {
            userForRedirect = await db.query.users.findFirst({ where: eq(users.id, facultyMember.userId) });
        }
    }

    if (userForRedirect?.role === "admin") redirect("/admin/dashboard");
    if (userForRedirect?.role === "faculty") redirect("/faculty");
    if (userForRedirect?.role === "student") redirect("/student/dashboard");

    redirect("/");
}

export async function logout() {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    cookieStore.delete("session");
    redirect("/login");
}

export async function logoutFromAllDevices() {
    try {
        const { getSession } = await import("@/lib/auth");
        const session = await getSession();

        if (!session) {
            redirect("/login");
        }

        // Increment tokenVersion to invalidate all sessions
        // First get current version
        const currentUser = await db.query.users.findFirst({
            where: eq(users.id, session.userId),
            columns: { tokenVersion: true }
        });

        if (!currentUser) {
            redirect("/login");
        }

        // Update with incremented version
        await db.update(users)
            .set({ tokenVersion: (currentUser.tokenVersion || 0) + 1 })
            .where(eq(users.id, session.userId));

        // Clear current session cookie
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieStore.delete("session");

        redirect("/login");
    } catch (error) {
        if ((error as any).digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }
        console.error("Logout from all devices error:", error);
        redirect("/login");
    }
}
