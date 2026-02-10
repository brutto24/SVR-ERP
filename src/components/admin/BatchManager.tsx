"use client";

import { useState } from "react";
import { updateBatch, deleteBatch, createBatch } from "@/actions/admin"; // We'll move create here too or keep separate used by page?
// Actually simpler to have manager handle the list. But if page creates, manager handles list items.
// Let's make manager handle the *list items* mainly, or the whole view. 
// Following FacultyManager pattern, it likely handles the interactive list.
// But wait, the original page had a "Create Form" separate. 
// We can integrate all into BatchManager or just use it for the list.
// Let's use it for the list to keep it focused.

import { Trash2, Edit2, X, Check, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "@/components/ui/DeleteConfirmationModal";

type Batch = {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
};

export default function BatchManager({ batches }: { batches: Batch[] }) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{ name: string; isActive: boolean }>({ name: "", isActive: true });

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; batchId: string; name: string }>({ isOpen: false, batchId: "", name: "" });
    const [isDeleting, setIsDeleting] = useState(false);

    // For local confirmation before valid server action
    const router = useRouter();

    const handleEditClick = (batch: Batch) => {
        setEditingId(batch.id);
        setEditForm({ name: batch.name, isActive: batch.isActive });
    };

    const handleUpdate = async () => {
        if (!editingId) return;
        await updateBatch(editingId, editForm);
        setEditingId(null);
    };

    const handleDeleteClick = (batch: Batch) => {
        setDeleteModal({ isOpen: true, batchId: batch.id, name: batch.name });
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        const res = await deleteBatch(deleteModal.batchId);
        setIsDeleting(false);
        setDeleteModal({ ...deleteModal, isOpen: false });

        if (res.success) {
            toast.success("Batch deleted successfully");
        } else {
            toast.error(res.error || "Failed to delete batch");
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches.map((batch) => (
                <div key={batch.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group">
                    {editingId === batch.id ? (
                        <div className="space-y-3">
                            <input
                                className="w-full border rounded px-2 py-1 font-bold text-gray-800"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-600">Active?</label>
                                <input
                                    type="checkbox"
                                    checked={editForm.isActive}
                                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button onClick={handleUpdate} className="p-1 px-3 bg-green-100 text-green-700 rounded text-xs">Save</button>
                                <button onClick={() => setEditingId(null)} className="p-1 px-3 bg-gray-100 text-gray-600 rounded text-xs">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-lg text-gray-800">{batch.name}</h3>
                            </div>
                            <div className="flex flex-col gap-3 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Calendar size={16} />
                                    <span>
                                        {new Date(batch.startDate).getFullYear()} - {new Date(batch.endDate).getFullYear()}
                                    </span>
                                </div>
                                <div className="self-start">
                                    <span className={`px-2 py-1 text-xs rounded-full ${batch.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                                        {batch.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>
                            {/* Action Buttons */}
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button onClick={() => handleEditClick(batch)} className="text-indigo-600 hover:bg-indigo-50 p-1 rounded">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDeleteClick(batch)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                                <button
                                    onClick={() => router.push(`/admin/batches/${batch.id}`)}
                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                >
                                    View Classes
                                    <span aria-hidden="true">&rarr;</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ))
            }
            {
                batches.length === 0 && (
                    <div className="col-span-full text-center py-10 text-gray-400 italic">No batches found. Create one above.</div>
                )
            }

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={confirmDelete}
                title="Delete Batch?"
                message="Are you sure you want to delete"
                itemName={deleteModal.name}
                isDeleting={isDeleting}
            />
        </div >
    );
}
