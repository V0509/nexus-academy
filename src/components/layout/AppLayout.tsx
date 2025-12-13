"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    ClipboardCheck,
    Activity,
    Menu,
    X,
    LogOut,
    Cloud,
    RefreshCw
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSync } from "@/hooks/useSync";
import { useToast } from "@/components/common/Toast";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
}

const navItems: NavItem[] = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Students", href: "/students", icon: Users },
    { label: "Attendance", href: "/attendance", icon: ClipboardCheck },
    { label: "Performance", href: "/performance", icon: Activity },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { logout } = useAuth();
    const { isSyncing, syncData } = useSync();
    const { showToast } = useToast();

    const handleSync = async () => {
        const result = await syncData();
        if (result?.success) {
            showToast({ title: "Success", message: "Data synced to cloud successfully!", type: 'success' });
        } else {
            showToast({ title: "Error", message: "Sync failed. Please try again.", type: 'error' });
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row relative">
            <header className="lg:hidden glass fixed top-0 left-0 right-0 z-20 p-3 sm:p-4 flex items-center justify-between fade-in">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg pulse-glow">
                        🏸
                    </div>
                    <div>
                        <h1 className="font-bold text-base sm:text-lg text-slate-800 leading-tight">Nexus Academy</h1>
                        <p className="text-[10px] sm:text-xs text-slate-600 font-medium">Badminton Excellence</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="p-2 hover:bg-blue-100 rounded-xl transition-all duration-200 active:scale-95 group"
                        aria-label="Sync Data"
                        title="Sync to Cloud"
                    >
                        <RefreshCw size={20} className={`text-slate-600 group-hover:text-blue-600 transition-colors ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
                    </button>
                    <button
                        onClick={logout}
                        className="p-2 hover:bg-red-100 rounded-xl transition-all duration-200 active:scale-95 group"
                        aria-label="Logout"
                        title="Logout"
                    >
                        <LogOut size={20} className="text-slate-600 group-hover:text-red-600 transition-colors" />
                    </button>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-white/50 rounded-xl transition-all duration-200 active:scale-95"
                        aria-label="Toggle menu"
                    >
                        {isSidebarOpen ? <X size={24} className="text-slate-700" /> : <Menu size={24} className="text-slate-700" />}
                    </button>
                </div>
            </header>

            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-30 w-64 sm:w-72 glass-dark text-white transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:h-screen",
                    isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
                )}
            >
                <div className="p-5 sm:p-6 flex items-center gap-3 border-b border-white/10">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-primary rounded-2xl flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-xl shadow-blue-500/30 pulse-glow">
                        🏸
                    </div>
                    <div>
                        <h1 className="font-bold text-lg sm:text-xl tracking-tight">Nexus Academy</h1>
                        <p className="text-xs text-white/60 font-medium">Built by Effort</p>
                    </div>
                </div>

                <nav className="p-3 sm:p-4 space-y-1.5 sm:space-y-2 mt-4 overflow-y-auto max-h-[calc(100vh-200px)]">
                    {navItems.map((item, index) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl transition-all duration-300 group relative overflow-hidden",
                                    isActive
                                        ? "bg-gradient-primary text-white shadow-lg shadow-blue-500/30 scale-105"
                                        : "text-white/70 hover:bg-white/10 hover:text-white hover:scale-105"
                                )}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                                )}
                                <item.icon
                                    size={20}
                                    className={cn(
                                        "transition-all duration-300 relative z-10",
                                        isActive ? "text-white scale-110" : "text-white/70 group-hover:text-white group-hover:scale-110"
                                    )}
                                />
                                <span className="font-semibold text-sm sm:text-base relative z-10">{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 border-t border-white/10 bg-black/20">
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 w-full text-white/70 hover:text-white hover:bg-white/10 rounded-xl sm:rounded-2xl transition-all duration-300 group mb-2"
                    >
                        <RefreshCw size={20} className={`group-hover:scale-110 transition-transform duration-300 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
                        <span className="font-semibold text-sm sm:text-base">Sync Data</span>
                    </button>
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 w-full text-white/70 hover:text-red-400 hover:bg-red-500/10 rounded-xl sm:rounded-2xl transition-all duration-300 group"
                    >
                        <LogOut size={20} className="group-hover:scale-110 transition-transform duration-300" />
                        <span className="font-semibold text-sm sm:text-base">Logout</span>
                    </button>
                </div>
            </aside>

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-md fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <main className="flex-1 overflow-y-auto lg:h-screen pt-[72px] sm:pt-[80px] lg:pt-8 p-3 sm:p-4 md:p-6 lg:p-8 pb-20 sm:pb-24 lg:pb-8 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="fade-in">
                        {children}
                    </div>
                </div>
            </main>

            <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass z-20 pb-safe border-t border-white/20">
                <div className="flex justify-around items-center h-14 sm:h-16 px-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center flex-1 h-full gap-0.5 sm:gap-1 transition-all duration-300 rounded-xl relative",
                                    isActive ? "text-blue-600 scale-110" : "text-slate-600 hover:text-slate-800 active:scale-95"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-primary rounded-full" />
                                )}
                                <item.icon
                                    size={isActive ? 22 : 20}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className="transition-all duration-300"
                                />
                                <span className={cn(
                                    "text-[9px] sm:text-[10px] font-semibold transition-all duration-300",
                                    isActive && "gradient-text"
                                )}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
