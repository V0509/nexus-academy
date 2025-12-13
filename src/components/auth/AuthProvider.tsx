"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/db";
import { User } from "@supabase/supabase-js";
import SupabaseLogin from "./SupabaseLogin";
import { Loader2 } from "lucide-react";

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and sets the user
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };

        checkSession();

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const logout = async () => {
        await supabase.auth.signOut();
        await db.students.clear();
        await db.attendance.clear();
        await db.performance.clear();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 size={40} className="text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <SupabaseLogin />;
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
