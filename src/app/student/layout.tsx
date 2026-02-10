import Link from "next/link";
import { logout } from "@/actions/auth";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import ForcePasswordChangeAPI from "@/components/ForcePasswordChangeAPI";

export default async function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();
    let mustChangePassword = false;

    if (session?.userId) {
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.userId),
            columns: { mustChangePassword: true }
        });
        mustChangePassword = user?.mustChangePassword || false;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <ForcePasswordChangeAPI mustChangePassword={mustChangePassword} />

            {/* Top Navbar for Student */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                            S
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 leading-tight">Student Portal</h2>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">SVR Engineering College</p>
                        </div>
                    </div>

                    <form action={async () => {
                        "use server"
                        await logout();
                    }}>
                        <button className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors">
                            Sign Out
                        </button>
                    </form>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-4 md:p-8">
                {children}
            </main>
        </div>
    );
}
