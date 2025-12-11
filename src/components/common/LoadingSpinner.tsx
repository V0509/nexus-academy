"use client";

import React from "react";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
    label?: string;
}

export default function LoadingSpinner({ size = "md", className = "", label }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "w-5 h-5 border-2",
        md: "w-8 h-8 border-3",
        lg: "w-12 h-12 border-4",
    };

    return (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`} role="status" aria-live="polite">
            <div
                className={`${sizeClasses[size]} border-blue-200 border-t-blue-600 rounded-full animate-spin`}
                aria-hidden="true"
            />
            {label && <p className="text-sm text-slate-500 font-medium">{label}</p>}
            <span className="sr-only">{label || "Loading..."}</span>
        </div>
    );
}

interface LoadingSkeletonProps {
    className?: string;
    variant?: "text" | "card" | "circle" | "rect";
}

export function LoadingSkeleton({ className = "", variant = "text" }: LoadingSkeletonProps) {
    const baseClasses = "animate-pulse bg-slate-200 rounded";

    const variantClasses = {
        text: "h-4 w-full",
        card: "h-48 w-full rounded-2xl",
        circle: "w-12 h-12 rounded-full",
        rect: "h-24 w-full rounded-xl",
    };

    return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />;
}

interface LoadingCardProps {
    count?: number;
}

export function LoadingCard({ count = 1 }: LoadingCardProps) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-200 rounded-full" />
                            <div>
                                <div className="h-5 w-32 bg-slate-200 rounded mb-2" />
                                <div className="h-3 w-20 bg-slate-200 rounded" />
                            </div>
                        </div>
                        <div className="h-6 w-16 bg-slate-200 rounded-full" />
                    </div>
                    <div className="space-y-3">
                        <div className="h-4 w-full bg-slate-200 rounded" />
                        <div className="h-4 w-3/4 bg-slate-200 rounded" />
                        <div className="h-4 w-1/2 bg-slate-200 rounded" />
                    </div>
                </div>
            ))}
        </>
    );
}

interface LoadingOverlayProps {
    isLoading: boolean;
    label?: string;
}

export function LoadingOverlay({ isLoading, label }: LoadingOverlayProps) {
    if (!isLoading) return null;

    return (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
            <LoadingSpinner size="lg" label={label} />
        </div>
    );
}
