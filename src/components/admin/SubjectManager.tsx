"use client";

import { useState } from "react";
import { createSubject, updateSubject, deleteSubject } from "@/actions/admin";
import { Plus, Edit2, Trash2, X, Check } from "lucide-react";
import { useRouter } from "next/navigation";

type Subject = {
    id: string;
    name: string;
    code: string;
    type: "theory" | "lab"; // Fixed: Was 'string', changed to union type to match schema
    credits: number;
    semester: string;
    batchId: string;
};

type Batch = {
    id: string;
    name: string;
};

export default function SubjectManager({ initialSubjects, batches }: { initialSubjects: any[], batches: Batch[] }) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Form States
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        type: "theory" as "theory" | "lab",
        credits: 3,
        semester: "1-1",
        batchId: batches[0]?.id || ""
    });

    // Delete Confirmation State
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        subjectId: string | null;
        subjectName: string;
        error?: string;
        requiresForce: boolean;
    }>({
        isOpen: false,
        subjectId: null,
        subjectName: "",
        requiresForce: false
    });
    const [forceDeleteAcknowledged, setForceDeleteAcknowledged] = useState(false);

    const resetForm = () => {
        setFormData({
            name: "",
            code: "",
            type: "theory",
            credits: 3,
            semester: "1-1",
            batchId: batches[0]?.id || ""
        });
        setIsCreating(false);
        setEditingId(null);
    };

    const handleCreate = async () => {
        setLoading(true);
        const res = await createSubject(formData);
        if (res.success) {
            router.refresh();
            resetForm();
        } else {
            alert(res.error);
        }
        setLoading(false);
    };

    const handleUpdate = async (id: string) => {
        setLoading(true);
        const res = await updateSubject(id, formData);
        if (res.success) {
            router.refresh();
            resetForm();
        } else {
            alert(res.error);
        }
        setLoading(false);
    };

    const handleDeleteClick = async (subject: Subject) => {
        setDeleteConfirmation({
            isOpen: true,
            subjectId: subject.id,
            subjectName: subject.name,
            requiresForce: false
        });
        setForceDeleteAcknowledged(false);
    };

    const proceedWithDelete = async () => {
        if (!deleteConfirmation.subjectId) return;

        setLoading(true);
        // If we already know it requires force (from a previous attempt in this flow), verify acknowledgment
        if (deleteConfirmation.requiresForce && !forceDeleteAcknowledged) {
            setLoading(false);
            return;
        }

        const force = deleteConfirmation.requiresForce;
        const res = await deleteSubject(deleteConfirmation.subjectId, force);

        if (res.success) {
            router.refresh();
            setDeleteConfirmation({ isOpen: false, subjectId: null, subjectName: "", requiresForce: false });
        } else if (res.requiresConfirmation && !force) {
            // Switch to Force Delete mode in the modal
            setDeleteConfirmation(prev => ({
                ...prev,
                requiresForce: true,
                error: res.error
            }));
        } else {
            alert(res.error);
            setDeleteConfirmation({ isOpen: false, subjectId: null, subjectName: "", requiresForce: false });
        }
        setLoading(false);
    };

    const startEdit = (subject: Subject) => {
        console.log("Editing subject:", subject);
        setEditingId(subject.id);
        setFormData({
            name: subject.name,
            code: subject.code,
            type: subject.type,
            credits: subject.credits,
            semester: subject.semester,
            batchId: subject.batchId
        });
        setIsCreating(false);

        // Scroll to top to show the edit form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex justify-end">
                <button
                    onClick={() => { setIsCreating(true); setEditingId(null); }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
                >
                    <Plus size={18} /> Add Subject
                </button>
            </div>

            {/* Create/Edit Form */}
            {(isCreating || editingId) && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100 mb-6 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold text-lg mb-4">{editingId ? "Edit Subject" : "New Subject"}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                            <input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-2 border rounded-lg"
                                placeholder="e.g. Artificial Intelligence"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
                            <input
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                                className="w-full p-2 border rounded-lg"
                                placeholder="e.g. AI-101"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value as "theory" | "lab" })}
                                className="w-full p-2 border rounded-lg"
                            >
                                <option value="theory">Theory</option>
                                <option value="lab">Lab</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                            <input
                                type="number"
                                value={formData.credits}
                                onChange={e => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })}
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                            <select
                                value={formData.semester}
                                onChange={e => setFormData({ ...formData, semester: e.target.value })}
                                className="w-full p-2 border rounded-lg"
                            >
                                {["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"].map(sem => (
                                    <option key={sem} value={sem}>{sem}</option>
                                ))}
                            </select>
                        </div>
                        {!editingId && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                                <select
                                    value={formData.batchId}
                                    onChange={e => setFormData({ ...formData, batchId: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                >
                                    {batches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={resetForm}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => editingId ? handleUpdate(editingId) : handleCreate()}
                            disabled={loading || !formData.name}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? "Saving..." : (editingId ? "Update Subject" : "Create Subject")}
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700">Code</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Subject Name</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Type</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Credits</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {initialSubjects.map((subject: any) => (
                            <tr key={subject.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-gray-600 font-medium">{subject.code}</td>
                                <td className="px-6 py-4 text-gray-900 font-medium">{subject.name}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs rounded-full ${subject.type === 'lab'
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-blue-100 text-blue-700"
                                        }`}>
                                        {subject.type.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{subject.credits}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => startEdit(subject)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(subject)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {initialSubjects.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No subjects found. Create one to get started.
                    </div>
                )}
            </div>
            {/* Delete Confirmation Modal */}
            {deleteConfirmation.isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 mx-4 relative">
                        <button
                            onClick={() => setDeleteConfirmation({ isOpen: false, subjectId: null, subjectName: "", requiresForce: false })}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center mb-6">
                            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${deleteConfirmation.requiresForce ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}>
                                <Trash2 size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {deleteConfirmation.requiresForce ? "Force Delete Subject?" : "Delete Subject?"}
                            </h3>
                            <p className="text-sm text-gray-500">
                                Are you sure you want to delete <span className="font-semibold text-gray-700">"{deleteConfirmation.subjectName}"</span>?
                            </p>
                        </div>

                        {deleteConfirmation.requiresForce && (
                            <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6 text-left">
                                <p className="text-sm text-red-800 font-medium mb-2">
                                    Warning: Data Dependencies Detected
                                </p>
                                <p className="text-xs text-red-600 mb-4">
                                    {deleteConfirmation.error || "This subject has associated student data (Attendance/Marks). Deleting it will permanently remove all historical records."}
                                </p>

                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <div className="relative flex items-center pt-0.5">
                                        <input
                                            type="checkbox"
                                            className="peer sr-only"
                                            checked={forceDeleteAcknowledged}
                                            onChange={(e) => setForceDeleteAcknowledged(e.target.checked)}
                                        />
                                        <div className="w-4 h-4 border-2 border-red-300 rounded peer-checked:bg-red-600 peer-checked:border-red-600 transition-colors"></div>
                                        <Check size={12} className="absolute text-white opacity-0 peer-checked:opacity-100 top-0.5 left-0.5" strokeWidth={3} />
                                    </div>
                                    <span className="text-xs text-red-700 font-medium group-hover:text-red-800 select-none">
                                        I understand that this action is irreversible and will delete all student data for this subject.
                                    </span>
                                </label>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirmation({ isOpen: false, subjectId: null, subjectName: "", requiresForce: false })}
                                className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={proceedWithDelete}
                                disabled={loading || (deleteConfirmation.requiresForce && !forceDeleteAcknowledged)}
                                className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all ${deleteConfirmation.requiresForce
                                    ? "bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    : "bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                                    }`}
                            >
                                {loading ? "Deleting..." : (deleteConfirmation.requiresForce ? "Force Delete" : "Delete")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
