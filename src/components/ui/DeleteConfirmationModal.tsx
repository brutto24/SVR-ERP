"use client";

import { Modal } from "./Modal";
import { Trash2 } from "lucide-react";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    itemName?: string;
    isDeleting?: boolean;
}

export function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    itemName,
    isDeleting = false
}: DeleteConfirmationModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
            <div className="flex flex-col items-center text-center -mt-6">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500">
                    <Trash2 size={24} />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>

                <p className="text-gray-500 mb-8">
                    {message} {itemName && <span className="font-bold text-gray-800">"{itemName}"</span>}?
                </p>

                <div className="flex gap-3 w-full">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
