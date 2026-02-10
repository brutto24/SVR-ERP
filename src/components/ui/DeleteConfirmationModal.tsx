import { Modal } from "./Modal";
import { Trash2, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    itemName?: string;
    isDeleting?: boolean;
    warningContent?: React.ReactNode;
    checkboxLabel?: string;
}

export function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    itemName,
    isDeleting = false,
    warningContent,
    checkboxLabel
}: DeleteConfirmationModalProps) {
    const [isConfirmed, setIsConfirmed] = useState(false);

    // Reset confirmation state when modal opens/closes
    useEffect(() => {
        if (isOpen) setIsConfirmed(false);
    }, [isOpen]);

    const canDelete = !checkboxLabel || isConfirmed;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
            <div className="flex flex-col items-center text-center -mt-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${warningContent ? "bg-red-100 text-red-600" : "bg-red-50 text-red-500"}`}>
                    {warningContent ? <AlertTriangle size={24} /> : <Trash2 size={24} />}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>

                <p className="text-gray-500 mb-6">
                    {message} {itemName && <span className="font-bold text-gray-800">"{itemName}"</span>}?
                </p>

                {warningContent && (
                    <div className="w-full bg-red-50 border border-red-100 rounded-lg p-4 mb-6 text-sm text-red-700 text-left">
                        {warningContent}
                    </div>
                )}

                {checkboxLabel && (
                    <div className="w-full mb-6 flex items-start gap-3 text-left">
                        <input
                            type="checkbox"
                            id="confirm-delete"
                            checked={isConfirmed}
                            onChange={(e) => setIsConfirmed(e.target.checked)}
                            className="mt-1 w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                        />
                        <label htmlFor="confirm-delete" className="text-sm text-gray-600 select-none cursor-pointer">
                            {checkboxLabel}
                        </label>
                    </div>
                )}

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
                        disabled={isDeleting || !canDelete}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${canDelete
                                ? "bg-red-600 text-white hover:bg-red-700"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        {isDeleting ? "Deleting..." : warningContent ? "Confirm Delete" : "Delete"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
