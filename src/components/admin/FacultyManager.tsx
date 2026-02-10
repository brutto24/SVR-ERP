"use client";

import { useState } from "react";
import { updateFaculty, deleteFaculty, toggleFacultyStatus } from "@/actions/admin";
import { Trash2, Edit2, X, Check, AlertTriangle, Lock, Power } from "lucide-react";
import { useRouter } from "next/navigation";

type Faculty = {
    id: string;
    name: string;
    email: string;
    designation: string;
    department: string;
    employeeId: string;
    isActive: boolean;
    assignedBatchId: string | null;
    assignedClassId: string | null;
};

type Batch = { id: string; name: string };
type Class = { id: string; name: string };

export default function FacultyManager({
    facultyList,
    batches,
    classes
}: {
    facultyList: Faculty[];
    batches: Batch[];
    classes: Class[];
}) {
    const router = useRouter();
    const [resettingId, setResettingId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Extend editForm to include role and assignment inputs
    const [editForm, setEditForm] = useState<(Faculty & { roleType: "subject_teacher" | "class_teacher" }) | null>(null);

    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [toggleStatusData, setToggleStatusData] = useState<{ id: string; name: string; currentStatus: boolean } | null>(null);

    const handleEditClick = (fac: Faculty) => {
        setEditingId(fac.id);
        // Determine initial role based on data
        const role = fac.assignedBatchId ? "class_teacher" : "subject_teacher";
        setEditForm({
            ...fac,
            roleType: role,
            // Ensure nulls are handled for controlled inputs if necessary, though React handles null in value ok usually (but prefer empty string for selects)
        });
    };

    // Safe Delete State
    const [deletionWarning, setDeletionWarning] = useState<string | null>(null);
    const [forceCheckbox, setForceCheckbox] = useState(false);

    const handleDeleteClick = (id: string, name: string) => {
        setDeletingId(id);
        setDeletionWarning(null);
        setForceCheckbox(false);
    };

    const confirmDelete = async () => {
        if (!deletingId) return;

        // If we are already in "forced" mode (warning shown), and user checked box:
        if (deletionWarning) {
            if (!forceCheckbox) return; // Should be disabled anyway
            const res = await deleteFaculty(deletingId, true); // Force delete
            if (res.success) {
                setDeletingId(null);
                setDeletionWarning(null);
                router.refresh();
            } else {
                alert(res.error || "Failed to delete faculty");
            }
            return;
        }

        // Initial attempt
        const res = await deleteFaculty(deletingId, false);
        if (res.success) {
            setDeletingId(null);
            router.refresh();
        } else if (res.requiresConfirmation) {
            // Show warning and checkbox
            setDeletionWarning(res.error || "This faculty has associated data.");
        } else {
            alert(res.error || "Failed to delete faculty");
        }
    };

    const confirmReset = async () => {
        if (resettingId) {
            await import("@/actions/admin").then(mod => mod.adminResetFacultyPassword(resettingId));
            setResettingId(null);
        }
    };

    const handleToggleStatusClick = (facultyId: string, facultyName: string, currentStatus: boolean, e: React.MouseEvent) => {
        e.stopPropagation();
        setToggleStatusData({ id: facultyId, name: facultyName, currentStatus });
    };

    const confirmToggleStatus = async () => {
        if (!toggleStatusData) return;
        const res = await toggleFacultyStatus(toggleStatusData.id, toggleStatusData.currentStatus);
        if (!res.success) {
            alert(res.error || "Failed to toggle status");
        }
        setToggleStatusData(null);
        router.refresh();
    };

    const handleRowClick = (facultyId: string) => {
        router.push(`/admin/faculty/${facultyId}`);
    };
    const handleUpdate = async () => {
        if (editForm && editingId) {
            // Prepare payload
            const payload = {
                name: editForm.name,
                employeeId: editForm.employeeId,
                designation: editForm.designation,
                department: editForm.department,
                roleType: editForm.roleType,
                batchId: editForm.assignedBatchId || undefined,
                classId: editForm.assignedClassId || undefined,
            };

            await updateFaculty(editingId, payload);
            setEditingId(null);
            setEditForm(null);
        }
    };

    return (
        <>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden border-b-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Name & ID</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Designation</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Role & Assignments</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {facultyList.map((fac) => (
                                <tr
                                    key={fac.id}
                                    onClick={() => editingId !== fac.id && handleRowClick(fac.id)}
                                    className={`hover:bg-gray-50/50 transition-colors ${editingId !== fac.id ? 'cursor-pointer' : ''}`}
                                >
                                    {editingId === fac.id && editForm ? (
                                        // EDIT MODE
                                        <>
                                            <td className="px-6 py-4 align-top">
                                                <div className="space-y-2">
                                                    <input
                                                        className="w-full text-sm border rounded px-2 py-1.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                                        value={editForm.name}
                                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                        placeholder="Name"
                                                    />
                                                    <input
                                                        className="w-full text-sm border rounded px-2 py-1.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                                        value={editForm.employeeId}
                                                        onChange={(e) => setEditForm({ ...editForm, employeeId: e.target.value })}
                                                        placeholder="Employee ID"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <select
                                                    className="w-full text-sm border rounded px-2 py-1.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white"
                                                    value={editForm.designation}
                                                    onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                                                >
                                                    <option value="Assistant Professor">Assistant Professor</option>
                                                    <option value="Associate Professor">Associate Professor</option>
                                                    <option value="Professor">Professor</option>
                                                    <option value="HOD">HOD</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <div className="space-y-3">
                                                    {/* Role Toggle */}
                                                    <div className="flex gap-4">
                                                        <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name={`role-${fac.id}`}
                                                                checked={editForm.roleType === "subject_teacher"}
                                                                onChange={() => setEditForm({ ...editForm, roleType: "subject_teacher" })}
                                                                className="text-indigo-600 focus:ring-indigo-500"
                                                            />
                                                            Subject Teacher
                                                        </label>
                                                        <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name={`role-${fac.id}`}
                                                                checked={editForm.roleType === "class_teacher"}
                                                                onChange={() => setEditForm({ ...editForm, roleType: "class_teacher" })}
                                                                className="text-indigo-600 focus:ring-indigo-500"
                                                            />
                                                            Class Teacher
                                                        </label>
                                                    </div>

                                                    {/* Assignments Dropdowns */}
                                                    {editForm.roleType === "class_teacher" && (
                                                        <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1">
                                                            <select
                                                                className="text-xs border rounded px-2 py-1.5 w-full bg-white"
                                                                value={editForm.assignedBatchId || ""}
                                                                onChange={(e) => setEditForm({ ...editForm, assignedBatchId: e.target.value })}
                                                            >
                                                                <option value="">Select Batch</option>
                                                                {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                                            </select>
                                                            <select
                                                                className="text-xs border rounded px-2 py-1.5 w-full bg-white"
                                                                value={editForm.assignedClassId || ""}
                                                                onChange={(e) => setEditForm({ ...editForm, assignedClassId: e.target.value })}
                                                            >
                                                                <option value="">Select Class</option>
                                                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                            </select>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <div className="flex gap-2">
                                                    <button onClick={handleUpdate} className="p-1.5 text-green-600 bg-green-50 rounded hover:bg-green-100 transition-colors" title="Save">
                                                        <Check size={18} />
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-500 bg-gray-50 rounded hover:bg-gray-100 transition-colors" title="Cancel">
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        // VIEW MODE
                                        <>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{fac.name}</div>
                                                <div className="text-sm text-gray-500">{fac.employeeId}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                                    {fac.designation}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    {fac.assignedBatchId ? (
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-1.5 text-indigo-700 font-medium">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                                                Class Teacher
                                                            </div>
                                                            <div className="text-xs text-gray-500 pl-3">
                                                                {batches.find(b => b.id === fac.assignedBatchId)?.name} • {classes.find(c => c.id === fac.assignedClassId)?.name}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 text-gray-500">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                                            Subject Teacher
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={(e) => handleToggleStatusClick(fac.id, fac.name, fac.isActive, e)}
                                                        className={`${fac.isActive ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
                                                        title={fac.isActive ? "Deactivate" : "Activate"}
                                                    >
                                                        <Power size={18} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setResettingId(fac.id);
                                                        }}
                                                        className="text-amber-500 hover:text-amber-700 transition-colors"
                                                        title="Reset Password"
                                                    >
                                                        <Lock size={18} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditClick(fac);
                                                        }}
                                                        className="text-indigo-600 hover:text-indigo-800 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteClick(fac.id, fac.name);
                                                        }}
                                                        className="text-red-600 hover:text-red-800 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                            {facultyList.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic">
                                        No faculty found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Modal */}
            {deletingId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Faculty?</h3>

                            {deletionWarning ? (
                                <div className="space-y-4 mb-6">
                                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                                        {deletionWarning}
                                    </p>

                                    <div className="flex items-start gap-3 text-left bg-gray-50 p-3 rounded-lg">
                                        <input
                                            type="checkbox"
                                            id="confirm-force"
                                            checked={forceCheckbox}
                                            onChange={(e) => setForceCheckbox(e.target.checked)}
                                            className="mt-1 w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                                        />
                                        <label htmlFor="confirm-force" className="text-sm text-gray-700 cursor-pointer select-none">
                                            I understand the consequences and want to delete this faculty member anyway.
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 mb-6">
                                    Are you sure you want to delete this faculty member?
                                    <br /><br />
                                    <span className="font-semibold text-gray-700">Suggestion:</span> Consider deactivating them instead to preserve their historical data.
                                    <br /><br />
                                    Deleting is permanent and cannot be undone.
                                </p>
                            )}

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => {
                                        setDeletingId(null);
                                        setDeletionWarning(null);
                                        setForceCheckbox(false);
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={!!deletionWarning && !forceCheckbox}
                                    className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors shadow-lg ${deletionWarning && !forceCheckbox
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                                        : "bg-red-600 text-white hover:bg-red-700 shadow-red-500/30"
                                        }`}
                                >
                                    {deletionWarning ? "Confirm Delete" : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Status Modal */}
            {toggleStatusData && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className={`w-12 h-12 ${toggleStatusData.currentStatus ? 'bg-amber-100' : 'bg-green-100'} rounded-full flex items-center justify-center mb-4`}>
                                <Power className={`w-6 h-6 ${toggleStatusData.currentStatus ? 'text-amber-600' : 'text-green-600'}`} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {toggleStatusData.currentStatus ? 'Deactivate' : 'Activate'} Faculty?
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                {toggleStatusData.currentStatus
                                    ? `Are you sure you want to deactivate ${toggleStatusData.name}? They will not be able to log in until reactivated.`
                                    : `Are you sure you want to activate ${toggleStatusData.name}? They will be able to log in again.`
                                }
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setToggleStatusData(null)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmToggleStatus}
                                    className={`flex-1 px-4 py-2 ${toggleStatusData.currentStatus ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30' : 'bg-green-600 hover:bg-green-700 shadow-green-500/30'} text-white rounded-xl font-medium transition-colors shadow-lg`}
                                >
                                    {toggleStatusData.currentStatus ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {resettingId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                                <Lock className="w-6 h-6 text-amber-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Reset Password?</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                This will reset the faculty's password to their Employee ID. They will be forced to change it on next login.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setResettingId(null)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmReset}
                                    className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/30"
                                >
                                    Reset Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
