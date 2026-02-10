"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface PasswordUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    isFirstTime?: boolean;
}

export function PasswordUpdateModal({ isOpen, onClose, userId, isFirstTime = false }: PasswordUpdateModalProps) {
    const router = useRouter();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
    const passwordsDontMatch = newPassword && confirmPassword && newPassword !== confirmPassword;

    const handleUpdate = async () => {
        if (!newPassword || !confirmPassword) {
            toast.error("Please fill in both password fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match. Please make sure both passwords are identical.");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }

        setIsUpdating(true);

        try {
            const response = await fetch("/api/update-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, newPassword })
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Password updated successfully!");
                setNewPassword("");
                setConfirmPassword("");
                onClose();
                router.refresh();
            } else {
                toast.error(data.error || "Failed to update password");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={isFirstTime ? () => { } : onClose}
            title={isFirstTime ? "Update Your Password" : "Change Password"}
            size="md"
        >
            {isFirstTime && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                        <p className="font-semibold text-amber-900 text-sm">First Time Login</p>
                        <p className="text-amber-700 text-sm mt-1">
                            For security reasons, please update your password before continuing.
                        </p>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {/* New Password */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        New Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors ${passwordsDontMatch
                                    ? "border-red-300 focus:border-red-500"
                                    : passwordsMatch
                                        ? "border-green-300 focus:border-green-500"
                                        : "border-gray-300 focus:border-indigo-500"
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* Password Match Indicator */}
                    {passwordsDontMatch && (
                        <div className="flex items-center gap-2 mt-2 text-red-600">
                            <AlertCircle size={14} />
                            <p className="text-xs font-medium">Passwords do not match</p>
                        </div>
                    )}
                    {passwordsMatch && (
                        <div className="flex items-center gap-2 mt-2 text-green-600">
                            <CheckCircle size={14} />
                            <p className="text-xs font-medium">Passwords match</p>
                        </div>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                    {!isFirstTime && (
                        <button
                            onClick={onClose}
                            disabled={isUpdating}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        onClick={handleUpdate}
                        disabled={isUpdating || !passwordsMatch}
                        className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUpdating ? "Updating..." : "Update Password"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
