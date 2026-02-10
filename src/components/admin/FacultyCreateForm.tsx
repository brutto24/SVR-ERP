"use client";

import { useState } from "react";
import { createFaculty } from "@/actions/admin";
import { Loader2, UserPlus, CheckCircle, AlertCircle } from "lucide-react";

type Batch = {
    id: string;
    name: string;
};

type Class = {
    id: string;
    name: string;
};

export default function FacultyCreateForm({ batches, classes }: { batches: Batch[], classes: Class[] }) {
    const [isPending, setIsPending] = useState(false);
    const [roleType, setRoleType] = useState<"subject_teacher" | "class_teacher">("subject_teacher");
    const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsPending(true);
        setMessage(null);

        const name = formData.get("name") as string;
        const employeeId = formData.get("employeeId") as string;
        const designation = formData.get("designation") as string;
        const department = "General"; // Placeholder
        const batchId = formData.get("batchId") as string;
        const classId = formData.get("classId") as string;

        // Validation for Class Teacher
        if (roleType === "class_teacher" && (!batchId || !classId)) {
            setMessage({ type: "error", text: "Please select both Batch and Class for Class Teacher." });
            setIsPending(false);
            return;
        }

        const res = await createFaculty({
            name,
            employeeId,
            designation,
            department,
            roleType,
            batchId,
            classId
        });

        if (res.success) {
            setMessage({ type: "success", text: "Faculty added successfully!" });
            // Optional: Reset form? We can use a ref to form or just let it stay. 
            // Usually nice to reset. But standard form action might not reset easily without ref.
            // Let's just show success.
            // Actually, we can reset if we use specific controlled inputs, but I'm using FormData for simplicity.
            // I'll add a key to key-reset the form or just leave it.
            // Let's refresh the page?
            // window.location.reload(); // Hard refresh? createFaculty does revalidatePath.
        } else {
            setMessage({ type: "error", text: res.error || "Failed to add faculty." });
        }

        setIsPending(false);
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
                <UserPlus size={20} className="text-indigo-600" />
                Add New Faculty
            </h2>

            {message && (
                <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}>
                    {message.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                </div>
            )}

            <form action={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Basic Info */}
                <div className="space-y-1.5 order-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
                    <input name="name" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>

                <div className="space-y-1.5 order-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee ID</label>
                    <input name="employeeId" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>

                <div className="space-y-1.5 order-3">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Designation</label>
                    <div className="relative">
                        <select name="designation" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none bg-white transition-all">
                            <option value="Assistant Professor">Assistant Professor</option>
                            <option value="Associate Professor">Associate Professor</option>
                            <option value="Professor">Professor</option>
                            <option value="HOD">HOD</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                        </div>
                    </div>
                </div>

                {/* Role Selection */}
                <div className="col-span-1 md:col-span-2 lg:col-span-3 order-4 pt-2 border-t border-gray-100 mt-2">
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Role Assignment</span>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="roleType"
                                value="subject_teacher"
                                checked={roleType === "subject_teacher"}
                                onChange={() => setRoleType("subject_teacher")}
                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            />
                            <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">Subject Teacher</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="roleType"
                                value="class_teacher"
                                checked={roleType === "class_teacher"}
                                onChange={() => setRoleType("class_teacher")}
                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            />
                            <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">Class Teacher</span>
                        </label>
                    </div>
                </div>

                {/* Conditional Batch/Class - Only if Class Teacher */}
                {roleType === "class_teacher" && (
                    <div className="contents animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-1.5 order-5 md:col-span-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assign Batch</label>
                            <div className="relative">
                                <select name="batchId" required={roleType === "class_teacher"} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none bg-white transition-all">
                                    <option value="">Select Batch...</option>
                                    {batches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5 order-6 md:col-span-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assign Class</label>
                            <div className="relative">
                                <select name="classId" required={roleType === "class_teacher"} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none bg-white transition-all">
                                    <option value="">Select Class...</option>
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-end items-end order-10 mt-2">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4" />
                                Add Faculty
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
