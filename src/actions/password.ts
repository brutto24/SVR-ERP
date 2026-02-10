"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { encryptPassword } from "@/lib/auth";

export async function updateUserPassword(userId: string, newPassword: string) {
    try {
        const hashedPassword = await encryptPassword(newPassword);

        await db.update(users)
            .set({
                password: hashedPassword,
                isFirstLogin: false
            })
            .where(eq(users.id, userId));

        return { success: true };
    } catch (error) {
        console.error("Failed to update password:", error);
        return { success: false, error: "Failed to update password" };
    }
}
