"use client";

import { ReactNode } from "react";
import { Users, GraduationCap, AlertCircle } from "lucide-react";

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="text-gray-300 mb-4">
                {icon || <AlertCircle size={48} />}
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
            <p className="text-gray-500 text-center mb-6 max-w-md">{description}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
