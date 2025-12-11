"use client";

import React from "react";
import { Plus, Search, Filter, MoreHorizontal, DollarSign, Calendar, CreditCard, ArrowUpRight, ArrowDownLeft, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data
const loans = [
    {
        id: "LN-2024-001",
        borrower: "Alex Johnson",
        amount: 5000,
        date: "2024-11-15",
        status: "Active",
        dueDate: "2024-12-15",
        type: "Equipment",
    },
    {
        id: "LN-2024-002",
        borrower: "Sarah Williams",
        amount: 1200,
        date: "2024-11-10",
        status: "Paid",
        dueDate: "2024-11-20",
        type: "Personal",
    },
    {
        id: "LN-2024-003",
        borrower: "Mike Brown",
        amount: 3500,
        date: "2024-10-05",
        status: "Overdue",
        dueDate: "2024-11-05",
        type: "Tuition",
    },
    {
        id: "LN-2024-004",
        borrower: "Emily Davis",
        amount: 800,
        date: "2024-11-25",
        status: "Active",
        dueDate: "2024-12-25",
        type: "Equipment",
    },
];

export default function LoansPage() {
    return (
        <div className="space-y-8">
            {/* Header Section with Glass Effect */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 p-8 text-white shadow-2xl">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Loan Manager</h1>
                        <p className="text-blue-100 mt-2 text-lg">Track and manage student loans and finances.</p>
                    </div>
                    <button className="group flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 px-6 py-3 rounded-2xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg">
                        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span>New Loan</span>
                    </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Total Active</p>
                            <p className="text-2xl font-bold">$9,300</p>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-400/20 flex items-center justify-center text-emerald-300">
                            <ArrowDownLeft size={24} />
                        </div>
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Collected (Nov)</p>
                            <p className="text-2xl font-bold">$1,200</p>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-rose-400/20 flex items-center justify-center text-rose-300">
                            <ArrowUpRight size={24} />
                        </div>
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Overdue</p>
                            <p className="text-2xl font-bold">$3,500</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Filters & Search */}
                <div className="w-full lg:w-64 space-y-6">
                    <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-xl shadow-slate-200/50 sticky top-24">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Filter size={18} /> Filters
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
                                <div className="space-y-2">
                                    {['All', 'Active', 'Paid', 'Overdue'].map(status => (
                                        <label key={status} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                                            <input type="radio" name="status" className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500" defaultChecked={status === 'All'} />
                                            <span className="text-slate-600 font-medium">{status}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Sort By</label>
                                <div className="relative">
                                    <select className="w-full p-3 pl-4 pr-10 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer shadow-sm hover:border-slate-300 hover:shadow-md transition-all">
                                        <option>Date Created</option>
                                        <option>Amount: High to Low</option>
                                        <option>Amount: Low to High</option>
                                        <option>Due Date</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <ChevronDown size={18} className="text-slate-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loan List */}
                <div className="flex-1 space-y-6">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search loans by name or ID..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-none bg-white/80 backdrop-blur-xl shadow-lg shadow-slate-200/50 focus:ring-2 focus:ring-blue-500 text-slate-700 placeholder:text-slate-400"
                        />
                    </div>

                    {/* Cards */}
                    <div className="grid grid-cols-1 gap-4">
                        {loans.map((loan) => (
                            <div
                                key={loan.id}
                                className="group relative bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-inner",
                                            loan.status === 'Active' ? "bg-blue-50 text-blue-600" :
                                                loan.status === 'Paid' ? "bg-green-50 text-green-600" :
                                                    "bg-red-50 text-red-600"
                                        )}>
                                            {loan.borrower.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800">{loan.borrower}</h3>
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <span className="font-mono">{loan.id}</span>
                                                <span>•</span>
                                                <span>{loan.type}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                        <div className="text-right">
                                            <p className="text-sm text-slate-400 font-medium">Amount</p>
                                            <p className="text-xl font-bold text-slate-900">${loan.amount.toLocaleString()}</p>
                                        </div>

                                        <div className={cn(
                                            "px-4 py-2 rounded-xl text-sm font-bold border",
                                            loan.status === 'Active' ? "bg-blue-100/50 text-blue-700 border-blue-200" :
                                                loan.status === 'Paid' ? "bg-green-100/50 text-green-700 border-green-200" :
                                                    "bg-red-100/50 text-red-700 border-red-200"
                                        )}>
                                            {loan.status}
                                        </div>

                                        <button className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Details (Optional/Hover) */}
                                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-sm text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} />
                                        <span>Due: {new Date(loan.dueDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CreditCard size={16} />
                                        <span>Via Bank Transfer</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
