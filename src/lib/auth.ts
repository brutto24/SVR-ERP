import { hash, compare } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SECRET_KEY = process.env.JWT_SECRET || "default-secret-key-change-it";
const key = new TextEncoder().encode(SECRET_KEY);

export async function encryptPassword(password: string): Promise<string> {
    return await hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await compare(password, hash);
}

interface SessionPayload {
    userId: string;
    role: string;
    tokenVersion: number;
    expires: Date;
}

export async function createSession(userId: string, role: string, tokenVersion: number, rememberMe: boolean = false) {
    const duration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days or 1 day
    const expires = new Date(Date.now() + duration);
    const expirationTime = rememberMe ? "30d" : "24h";

    const session = await new SignJWT({ userId, role, tokenVersion })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(expirationTime)
        .sign(key);

    const cookieStore = await cookies();
    cookieStore.set("session", session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires,
        sameSite: "lax",
        path: "/",
    });
}

export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session) return null;

    try {
        const { payload } = await jwtVerify(session, key);
        const sessionData = payload as unknown as SessionPayload;

        // Verify token version against database
        const { db } = await import("@/db");
        const { users } = await import("@/db/schema");
        const { eq } = await import("drizzle-orm");

        const user = await db.query.users.findFirst({
            where: eq(users.id, sessionData.userId),
            columns: { tokenVersion: true, isFirstLogin: true }
        });

        if (!user || user.tokenVersion !== sessionData.tokenVersion) {
            // Token version mismatch - session invalidated
            return null;
        }

        return {
            ...sessionData,
            isFirstLogin: user.isFirstLogin
        };
    } catch (error) {
        return null;
    }
}



export async function verifyRole(allowedRoles: string[]) {
    const session = await getSession();
    if (!session || !allowedRoles.includes(session.role)) {
        return false;
    }
    return true;
}
