"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    showToast: (toast: Omit<Toast, "id">) => void;
    hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

interface ToastProviderProps {
    children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const hideToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((toast: Omit<Toast, "id">) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newToast = { ...toast, id };
        setToasts((prev) => [...prev, newToast]);

        // Auto-dismiss
        const duration = toast.duration ?? 4000;
        if (duration > 0) {
            setTimeout(() => {
                hideToast(id);
            }, duration);
        }
    }, [hideToast]);

    const toastIcons = {
        success: CheckCircle,
        error: XCircle,
        warning: AlertTriangle,
        info: Info,
    };

    const toastStyles = {
        success: {
            bg: "bg-green-50",
            border: "border-green-200",
            icon: "text-green-600",
            title: "text-green-800",
            message: "text-green-700",
        },
        error: {
            bg: "bg-red-50",
            border: "border-red-200",
            icon: "text-red-600",
            title: "text-red-800",
            message: "text-red-700",
        },
        warning: {
            bg: "bg-amber-50",
            border: "border-amber-200",
            icon: "text-amber-600",
            title: "text-amber-800",
            message: "text-amber-700",
        },
        info: {
            bg: "bg-blue-50",
            border: "border-blue-200",
            icon: "text-blue-600",
            title: "text-blue-800",
            message: "text-blue-700",
        },
    };

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}
            {mounted &&
                createPortal(
                    <div
                        className="fixed top-4 right-4 z-[10000] flex flex-col gap-3 max-w-sm w-full pointer-events-none"
                        role="region"
                        aria-label="Notifications"
                    >
                        {toasts.map((toast) => {
                            const Icon = toastIcons[toast.type];
                            const styles = toastStyles[toast.type];

                            return (
                                <div
                                    key={toast.id}
                                    className={`${styles.bg} ${styles.border} border rounded-xl p-4 shadow-lg animate-in slide-in-from-right duration-300 pointer-events-auto`}
                                    role="alert"
                                    aria-live="polite"
                                >
                                    <div className="flex items-start gap-3">
                                        <Icon size={20} className={`${styles.icon} flex-shrink-0 mt-0.5`} />
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-semibold text-sm ${styles.title}`}>
                                                {toast.title}
                                            </p>
                                            {toast.message && (
                                                <p className={`text-sm mt-1 ${styles.message}`}>
                                                    {toast.message}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => hideToast(toast.id)}
                                            className="p-1 hover:bg-black/5 rounded-lg transition-colors flex-shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center"
                                            aria-label="Dismiss notification"
                                        >
                                            <X size={16} className="text-slate-400" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>,
                    document.body
                )}
        </ToastContext.Provider>
    );
}
