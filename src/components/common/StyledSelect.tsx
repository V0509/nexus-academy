"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

interface StyledSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    icon?: React.ReactNode;
    error?: boolean;
    label?: string;
}

export default function StyledSelect({
    icon,
    error,
    label,
    className = "",
    children,
    ...props
}: StyledSelectProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-400">{icon}</span>
                    </div>
                )}
                <select
                    className={`
                        w-full 
                        ${icon ? 'pl-10' : 'pl-4'} 
                        pr-10 
                        py-3 
                        text-sm sm:text-base 
                        border 
                        ${error ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'} 
                        rounded-xl 
                        focus:outline-none 
                        focus:ring-2 
                        focus:ring-blue-500 
                        focus:border-blue-500 
                        transition-all 
                        bg-white 
                        appearance-none 
                        cursor-pointer 
                        shadow-sm 
                        hover:border-slate-300
                        hover:shadow-md
                        font-medium
                        text-slate-700
                        ${className}
                    `}
                    {...props}
                >
                    {children}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown size={18} className="text-slate-400" />
                </div>
            </div>
        </div>
    );
}
