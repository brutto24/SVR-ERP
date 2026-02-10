"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { encryptPassword, getSession, verifyPassword } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function changePassword(password: string) {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        // Fetch current user to check reuse
        const currentUser = await db.query.users.findFirst({
            where: eq(users.id, session.userId),
            columns: { password: true }
        });

        if (!currentUser) return { success: false, error: "User not found" };

        const isSame = await verifyPassword(password, currentUser.password);
        if (isSame) {
            return { success: false, error: "New password cannot be the same as the current password" };
        }

        const hashedPassword = await encryptPassword(password);

        await db.update(users)
            .set({
                password: hashedPassword,
                mustChangePassword: false
            })
            .where(eq(users.id, session.userId));

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Failed to change password:", error);
        return { success: false, error: "Failed to change password" };
    }
}
