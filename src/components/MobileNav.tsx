"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

export default function MobileNav({
    title,
    children
}: {
    title: string;
    children: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isOpen]);

    return (
        <div className="md:hidden">
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-40">
                <span className="font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600">
                    {title}
                </span>
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer */}
            <div className={`
                fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                <div className="p-4 flex items-center justify-between border-b border-gray-100">
                    <span className="font-bold text-lg text-gray-800">{title}</span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-4 overflow-y-auto h-[calc(100vh-64px)]">
                    {children}
                </div>
            </div>
        </div>
    );
}
