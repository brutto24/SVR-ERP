"use client";

export function LoadingSpinner({ size = "md", text }: { size?: "sm" | "md" | "lg"; text?: string }) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12"
    };

    return (
        <div className="flex flex-col items-center justify-center py-8">
            <div className={`animate-spin rounded-full border-b-2 border-indigo-600 ${sizeClasses[size]}`} />
            {text && <p className="mt-3 text-sm text-gray-600">{text}</p>}
        </div>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="animate-pulse space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4">
                    <div className="h-12 bg-gray-200 rounded flex-1"></div>
                    <div className="h-12 bg-gray-200 rounded w-32"></div>
                    <div className="h-12 bg-gray-200 rounded w-24"></div>
                </div>
            ))}
        </div>
    );
}
