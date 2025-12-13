"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Mail, Lock, AlertCircle } from "lucide-react";

export default function SupabaseLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const savedEmail = localStorage.getItem('nexus_saved_email');
        if (savedEmail) {
            setEmail(savedEmail);
        }
    }, []);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage("Check your email for the confirmation link!");
            } else {
                // Handle email persistence
                if (rememberMe) {
                    localStorage.setItem('nexus_saved_email', email);
                } else {
                    localStorage.removeItem('nexus_saved_email');
                }

                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-slate-800 mb-2">Nexus Academy</h1>
                    <p className="text-slate-500">
                        {mode === 'login' ? 'Welcome back, Coach!' : 'Create your account'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-sm">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {message && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-start gap-3 text-green-600 text-sm">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <span>{message}</span>
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="coach@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="••••••••"
                                minLength={6}
                            />
                        </div>
                    </div>

                    {mode === 'login' && (
                        <div className="flex items-center justify-between pt-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 shadow-sm transition-all checked:border-blue-500 checked:bg-blue-500 hover:border-blue-400"
                                    />
                                    <svg
                                        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                                        width="10"
                                        height="8"
                                        viewBox="0 0 10 8"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M1 4L3.5 6.5L9 1"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                                <span className="text-sm text-slate-600 font-medium group-hover:text-slate-800 transition-colors">Remember me</span>
                            </label>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            mode === 'login' ? 'Sign In' : 'Sign Up'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setMode(mode === 'login' ? 'signup' : 'login');
                            setError(null);
                            setMessage(null);
                        }}
                        className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors"
                    >
                        {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
}
