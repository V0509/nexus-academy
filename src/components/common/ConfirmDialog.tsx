"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X, Trash2, CheckCircle } from "lucide-react";

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "warning" | "info";
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "danger",
    onConfirm,
    onCancel,
    isLoading = false,
}: ConfirmDialogProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    const variantStyles = {
        danger: {
            icon: Trash2,
            iconBg: "bg-red-100",
            iconColor: "text-red-600",
            buttonBg: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
            buttonShadow: "shadow-red-600/30",
        },
        warning: {
            icon: AlertTriangle,
            iconBg: "bg-amber-100",
            iconColor: "text-amber-600",
            buttonBg: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
            buttonShadow: "shadow-amber-600/30",
        },
        info: {
            icon: CheckCircle,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
            buttonBg: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
            buttonShadow: "shadow-blue-600/30",
        },
    };

    const styles = variantStyles[variant];
    const Icon = styles.icon;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isLoading) {
            onCancel();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape" && !isLoading) {
            onCancel();
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
        >
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-start gap-4 p-6 pb-4">
                    <div className={`p-3 rounded-full ${styles.iconBg}`}>
                        <Icon size={24} className={styles.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3
                            id="confirm-dialog-title"
                            className="text-lg font-bold text-slate-900"
                        >
                            {title}
                        </h3>
                        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                            {message}
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors -mt-1 -mr-1 min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-50"
                        aria-label="Close dialog"
                    >
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 pt-4 border-t border-slate-100">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 active:bg-slate-100 transition-all min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 py-3 px-4 rounded-xl text-white font-bold transition-all min-h-[48px] shadow-lg ${styles.buttonBg} ${styles.buttonShadow} disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            confirmLabel
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
