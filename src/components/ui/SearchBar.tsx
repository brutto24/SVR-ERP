"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
    placeholder?: string;
    onSearch: (term: string) => void;
    className?: string;
}

export function SearchBar({ placeholder = "Search...", onSearch, className = "" }: SearchBarProps) {
    const [value, setValue] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
        onSearch(newValue);
    };

    const handleClear = () => {
        setValue("");
        onSearch("");
    };

    return (
        <div className={`relative ${className}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
                type="text"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
            />
            {value && (
                <button
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                    <X size={18} />
                </button>
            )}
        </div>
    );
}
