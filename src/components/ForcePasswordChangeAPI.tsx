"use client";

import { useState } from "react";
import { changePassword } from "@/actions/user";
import { useRouter } from "next/navigation";
import { Lock, AlertTriangle } from "lucide-react";

export default function ForcePasswordChangeAPI({ mustChangePassword }: { mustChangePassword: boolean }) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    if (!mustChangePassword) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!password || password.length < 6) return setError("Password must be at least 6 characters");
        if (password !== confirmPassword) return setError("Passwords do not match");

        setLoading(true);
        const res = await changePassword(password);
        if (res.success) {
            router.refresh();
            // Don't setLoading(false) here as component will unmount/refresh
        } else {
            setError(res.error || "Failed to update password");
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-amber-500 p-6 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <Lock className="text-white w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Security Update Required</h2>
                    <p className="text-amber-100 mt-2 text-sm font-medium">For your security, you must update your default password to continue.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                            <AlertTriangle className="text-red-500 w-5 h-5 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600 font-medium">{error}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Strong Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder-gray-400"
                            placeholder="Enter new password"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder-gray-400"
                            placeholder="Re-enter new password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-500/25 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {loading ? "Updating..." : "Update Password & Login"}
                    </button>

                    <p className="text-xs text-center text-gray-400 mt-4">
                        You cannot skip this step. This is a one-time process.
                    </p>
                </form>
            </div>
        </div>
    );
}
