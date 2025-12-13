"use client";

import React, { useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Calendar, TrendingUp, Users, ChevronDown, Check, X, Clock, AlertCircle, Search } from "lucide-react";

type DatePreset = 'last7' | 'last30' | 'thisMonth' | 'custom';

export default function AttendanceHistory() {
    const [datePreset, setDatePreset] = useState<DatePreset>('last30');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('All');
    const [selectedBatch, setSelectedBatch] = useState('All');

    const students = useLiveQuery(() => db.students.toArray());
    const allRecords = useLiveQuery(() => db.attendance.toArray());

    const dateRange = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let startDate = new Date();
        let endDate = new Date(today);

        switch (datePreset) {
            case 'last7':
                startDate = new Date(today);
                startDate.setDate(today.getDate() - 6);
                break;
            case 'last30':
                startDate = new Date(today);
                startDate.setDate(today.getDate() - 29);
                break;
            case 'thisMonth':
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                break;
            case 'custom':
                if (customStartDate && customEndDate) {
                    startDate = new Date(customStartDate);
                    endDate = new Date(customEndDate);
                }
                break;
        }
        return { startDate, endDate };
    }, [datePreset, customStartDate, customEndDate]);

    const filteredRecords = useMemo(() => {
        if (!allRecords) return [];
        return allRecords.filter(record => {
            const recordDate = new Date(record.date);
            recordDate.setHours(0, 0, 0, 0);
            if (recordDate < dateRange.startDate || recordDate > dateRange.endDate) return false;
            if (selectedStudent !== 'All' && record.studentId !== selectedStudent) return false;
            if (selectedBatch !== 'All' && record.batchId !== selectedBatch) return false;
            return true;
        });
    }, [allRecords, dateRange, selectedStudent, selectedBatch]);

    const statistics = useMemo(() => {
        const total = filteredRecords.length;
        const present = filteredRecords.filter(r => r.status === 'Present').length;
        const absent = filteredRecords.filter(r => r.status === 'Absent').length;
        const late = filteredRecords.filter(r => r.status === 'Late').length;
        const onLeave = filteredRecords.filter(r => r.status === 'On Leave').length;
        return {
            total, present, absent, late, onLeave,
            presentPercent: total > 0 ? Math.round((present / total) * 100) : 0,
        };
    }, [filteredRecords]);

    const batches = useMemo(() =>
        Array.from(new Set(students?.map(s => s.batch) || [])).sort(),
        [students]
    );

    const sortedRecords = useMemo(() =>
        [...filteredRecords].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
        [filteredRecords]
    );

    const getStudentName = (studentId: string) => {
        const student = students?.find(s => s.studentId === studentId);
        return student?.fullName || studentId;
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Present': return <Check size={10} />;
            case 'Absent': return <X size={10} />;
            case 'Late': return <Clock size={10} />;
            case 'On Leave': return <AlertCircle size={10} />;
            default: return null;
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Present': return 'bg-green-100 text-green-700 border-green-200';
            case 'Absent': return 'bg-red-100 text-red-700 border-red-200';
            case 'Late': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'On Leave': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-slate-100 text-slate-500 border-slate-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters Row */}
            <div className="glass rounded-2xl p-4 flex flex-col sm:flex-row flex-wrap gap-4 items-center justify-between shadow-sm border border-slate-200/60">
                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                    <div className="relative group">
                        <select
                            value={datePreset}
                            onChange={(e) => setDatePreset(e.target.value as DatePreset)}
                            className="w-full sm:w-auto bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer appearance-none transition-all hover:border-blue-300"
                        >
                            <option value="last7">Last 7 Days</option>
                            <option value="last30">Last 30 Days</option>
                            <option value="thisMonth">This Month</option>
                            <option value="custom">Custom Range</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
                    </div>

                    {datePreset === 'custom' && (
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1">
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="bg-transparent border-none rounded-lg px-2 py-1.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                            <span className="text-slate-400 text-xs font-medium">TO</span>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="bg-transparent border-none rounded-lg px-2 py-1.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                    <div className="relative group flex-1 sm:flex-none">
                        <select
                            value={selectedBatch}
                            onChange={(e) => setSelectedBatch(e.target.value)}
                            className="w-full sm:w-40 bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer appearance-none transition-all hover:border-blue-300"
                        >
                            <option value="All">All Batches</option>
                            {batches.map(batch => (
                                <option key={batch} value={batch}>{batch}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
                    </div>

                    <div className="relative group flex-1 sm:flex-none">
                        <select
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            className="w-full sm:w-48 bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer appearance-none transition-all hover:border-blue-300"
                        >
                            <option value="All">All Students</option>
                            {students?.map(student => (
                                <option key={student.studentId} value={student.studentId}>
                                    {student.fullName}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="glass p-4 rounded-2xl border border-slate-200/60 flex flex-col items-center justify-center gap-1 shadow-sm hover:shadow-md transition-all">
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total</div>
                    <div className="text-2xl font-black text-slate-700">{statistics.total}</div>
                    <Users size={16} className="text-slate-400 mt-1" />
                </div>

                <div className="glass p-4 rounded-2xl border border-green-100 bg-green-50/30 flex flex-col items-center justify-center gap-1 shadow-sm hover:shadow-md transition-all">
                    <div className="text-green-600/70 text-xs font-bold uppercase tracking-wider">Present</div>
                    <div className="text-2xl font-black text-green-600">{statistics.present}</div>
                    <Check size={16} className="text-green-500 mt-1" strokeWidth={3} />
                </div>

                <div className="glass p-4 rounded-2xl border border-red-100 bg-red-50/30 flex flex-col items-center justify-center gap-1 shadow-sm hover:shadow-md transition-all">
                    <div className="text-red-600/70 text-xs font-bold uppercase tracking-wider">Absent</div>
                    <div className="text-2xl font-black text-red-600">{statistics.absent}</div>
                    <X size={16} className="text-red-500 mt-1" strokeWidth={3} />
                </div>

                <div className="glass p-4 rounded-2xl border border-yellow-100 bg-yellow-50/30 flex flex-col items-center justify-center gap-1 shadow-sm hover:shadow-md transition-all">
                    <div className="text-yellow-600/70 text-xs font-bold uppercase tracking-wider">Late</div>
                    <div className="text-2xl font-black text-yellow-600">{statistics.late}</div>
                    <Clock size={16} className="text-yellow-500 mt-1" strokeWidth={3} />
                </div>

                <div className="glass p-4 rounded-2xl border border-blue-100 bg-blue-50/30 flex flex-col items-center justify-center gap-1 shadow-sm hover:shadow-md transition-all">
                    <div className="text-blue-600/70 text-xs font-bold uppercase tracking-wider">Leave</div>
                    <div className="text-2xl font-black text-blue-600">{statistics.onLeave}</div>
                    <AlertCircle size={16} className="text-blue-500 mt-1" strokeWidth={3} />
                </div>

                <div className="glass p-4 rounded-2xl border border-slate-200/60 flex flex-col items-center justify-center gap-1 shadow-sm hover:shadow-md transition-all">
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Rate</div>
                    <div className="text-2xl font-black text-slate-700">{statistics.presentPercent}%</div>
                    <TrendingUp size={16} className="text-green-500 mt-1" />
                </div>
            </div>

            {/* Records List */}
            <div className="glass rounded-3xl overflow-hidden shadow-lg border border-slate-200">
                <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                            <Calendar size={20} className="text-blue-500" />
                        </div>
                        <div>
                            <h3 className="text-slate-800 font-bold text-lg">Attendance Records</h3>
                            <p className="text-slate-500 text-xs font-medium">Showing {sortedRecords.length} entries</p>
                        </div>
                    </div>
                </div>

                <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                    <div className="divide-y divide-slate-100">
                        {sortedRecords.map((record) => (
                            <div key={record.id} className="p-4 flex items-center gap-4 hover:bg-slate-50/80 transition-all group">
                                <div className="flex flex-col items-center justify-center w-14 h-14 bg-white rounded-2xl border border-slate-100 shadow-sm shrink-0">
                                    <span className="text-xs font-bold text-slate-400 uppercase">{new Date(record.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                    <span className="text-xl font-black text-slate-700">{new Date(record.date).getDate()}</span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="text-slate-800 font-bold text-base truncate">{getStudentName(record.studentId)}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wide">
                                            {record.batchId}
                                        </span>
                                        <span className="text-xs text-slate-400 hidden sm:inline-block">
                                            • {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                                        </span>
                                    </div>
                                </div>

                                <div className="shrink-0">
                                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-sm ${getStatusStyle(record.status)}`}>
                                        {getStatusIcon(record.status)}
                                        <span className="hidden sm:inline">{record.status}</span>
                                    </span>
                                </div>
                            </div>
                        ))}
                        {sortedRecords.length === 0 && (
                            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                    <Search size={24} />
                                </div>
                                <p className="text-slate-500 font-medium">No records found for the selected criteria</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
