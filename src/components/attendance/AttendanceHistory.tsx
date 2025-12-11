"use client";

import React, { useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Calendar, Filter, TrendingUp, Users, ChevronDown, User } from "lucide-react";

type DatePreset = 'last7' | 'last30' | 'thisMonth' | 'custom';

export default function AttendanceHistory() {
    const [datePreset, setDatePreset] = useState<DatePreset>('last30');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('All');
    const [selectedBatch, setSelectedBatch] = useState('All');

    // Fetch all students for filtering
    const students = useLiveQuery(() => db.students.toArray());

    // Fetch all attendance records
    const allRecords = useLiveQuery(() => db.attendance.toArray());

    // Calculate date range based on preset
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

    // Filter records based on criteria
    const filteredRecords = useMemo(() => {
        if (!allRecords) return [];

        return allRecords.filter(record => {
            const recordDate = new Date(record.date);
            recordDate.setHours(0, 0, 0, 0);

            // Date range filter
            if (recordDate < dateRange.startDate || recordDate > dateRange.endDate) {
                return false;
            }

            // Student filter
            if (selectedStudent !== 'All' && record.studentId !== selectedStudent) {
                return false;
            }

            // Batch filter
            if (selectedBatch !== 'All' && record.batchId !== selectedBatch) {
                return false;
            }

            return true;
        });
    }, [allRecords, dateRange, selectedStudent, selectedBatch]);

    // Calculate statistics
    const statistics = useMemo(() => {
        const total = filteredRecords.length;
        const present = filteredRecords.filter(r => r.status === 'Present').length;
        const absent = filteredRecords.filter(r => r.status === 'Absent').length;
        const late = filteredRecords.filter(r => r.status === 'Late').length;
        const onLeave = filteredRecords.filter(r => r.status === 'On Leave').length;

        return {
            total,
            present,
            absent,
            late,
            onLeave,
            presentPercent: total > 0 ? Math.round((present / total) * 100) : 0,
        };
    }, [filteredRecords]);

    // Get unique batches
    const batches = useMemo(() =>
        Array.from(new Set(students?.map(s => s.batch) || [])).sort(),
        [students]
    );

    // Sort records by date (newest first)
    const sortedRecords = useMemo(() =>
        [...filteredRecords].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
        [filteredRecords]
    );

    // Get student name by ID
    const getStudentName = (studentId: string) => {
        const student = students?.find(s => s.studentId === studentId);
        return student?.fullName || studentId;
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Present': return 'bg-green-100 text-green-700';
            case 'Absent': return 'bg-red-100 text-red-700';
            case 'Late': return 'bg-yellow-100 text-yellow-700';
            case 'On Leave': return 'bg-blue-100 text-blue-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Filters */}
            <div className="glass rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center gap-2 text-white font-semibold mb-2">
                    <Filter size={18} className="text-blue-400" />
                    <span className="text-sm sm:text-base">Filters</span>
                </div>

                {/* Date Range Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-blue-100 mb-1.5 sm:mb-2">Date Range</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar size={14} className="text-blue-300/60" />
                            </div>
                            <select
                                value={datePreset}
                                onChange={(e) => setDatePreset(e.target.value as DatePreset)}
                                className="w-full pl-8 sm:pl-9 pr-8 sm:pr-9 py-2 sm:py-2.5 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm appearance-none cursor-pointer text-white"
                            >
                                <option value="last7" className="bg-slate-800">Last 7 Days</option>
                                <option value="last30" className="bg-slate-800">Last 30 Days</option>
                                <option value="thisMonth" className="bg-slate-800">This Month</option>
                                <option value="custom" className="bg-slate-800">Custom Range</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <ChevronDown size={14} className="text-blue-300/60" />
                            </div>
                        </div>
                    </div>

                    {datePreset === 'custom' && (
                        <>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-blue-100 mb-1.5 sm:mb-2">Start Date</label>
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="w-full p-2 sm:p-2.5 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-blue-100 mb-1.5 sm:mb-2">End Date</label>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="w-full p-2 sm:p-2.5 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm text-white"
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-blue-100 mb-1.5 sm:mb-2">Student</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User size={14} className="text-blue-300/60" />
                            </div>
                            <select
                                value={selectedStudent}
                                onChange={(e) => setSelectedStudent(e.target.value)}
                                className="w-full pl-8 sm:pl-9 pr-8 sm:pr-9 py-2 sm:py-2.5 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm appearance-none cursor-pointer text-white"
                            >
                                <option value="All" className="bg-slate-800">All Students</option>
                                {students?.map(student => (
                                    <option key={student.studentId} value={student.studentId} className="bg-slate-800">
                                        {student.fullName}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <ChevronDown size={14} className="text-blue-300/60" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-blue-100 mb-1.5 sm:mb-2">Batch</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Users size={14} className="text-blue-300/60" />
                            </div>
                            <select
                                value={selectedBatch}
                                onChange={(e) => setSelectedBatch(e.target.value)}
                                className="w-full pl-8 sm:pl-9 pr-8 sm:pr-9 py-2 sm:py-2.5 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm appearance-none cursor-pointer text-white"
                            >
                                <option value="All" className="bg-slate-800">All Batches</option>
                                {batches.map(batch => (
                                    <option key={batch} value={batch} className="bg-slate-800">{batch}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <ChevronDown size={14} className="text-blue-300/60" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-blue-200 text-xs sm:text-sm mb-1.5 sm:mb-2">
                        <Users size={14} className="sm:w-4 sm:h-4" />
                        <span className="font-medium">Total</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-white">{statistics.total}</p>
                </div>

                <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-green-400 text-xs sm:text-sm mb-1.5 sm:mb-2">
                        <TrendingUp size={14} className="sm:w-4 sm:h-4" />
                        <span className="font-medium">Present</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-green-400">{statistics.present}</p>
                    <p className="text-[10px] sm:text-xs text-blue-200/60 mt-0.5 sm:mt-1">{statistics.presentPercent}% Rate</p>
                </div>

                <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4">
                    <p className="text-xs sm:text-sm font-medium text-red-400 mb-1.5 sm:mb-2">Absent</p>
                    <p className="text-xl sm:text-2xl font-bold text-red-400">{statistics.absent}</p>
                </div>

                <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4">
                    <p className="text-xs sm:text-sm font-medium text-yellow-400 mb-1.5 sm:mb-2">Late</p>
                    <p className="text-xl sm:text-2xl font-bold text-yellow-400">{statistics.late}</p>
                </div>

                <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 col-span-2 sm:col-span-1">
                    <p className="text-xs sm:text-sm font-medium text-blue-400 mb-1.5 sm:mb-2">On Leave</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-400">{statistics.onLeave}</p>
                </div>
            </div>

            {/* Attendance Records - Mobile Cards */}
            <div className="sm:hidden space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-blue-400" />
                        <h3 className="font-semibold text-white text-sm">Records</h3>
                    </div>
                    <span className="text-xs text-blue-200/60">{sortedRecords.length} records</span>
                </div>
                {sortedRecords.map((record) => (
                    <div key={record.id} className="glass rounded-xl p-3">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <p className="font-medium text-white text-sm">{getStudentName(record.studentId)}</p>
                                <p className="text-[10px] text-blue-200/60">{record.studentId}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusColor(record.status)}`}>
                                {record.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-blue-200/80">
                            <span>{formatDate(record.date)}</span>
                            <span>•</span>
                            <span>{record.batchId}</span>
                            <span>•</span>
                            <span>{record.session}</span>
                        </div>
                    </div>
                ))}
                {sortedRecords.length === 0 && (
                    <div className="glass rounded-xl p-6 text-center text-blue-200/60 text-sm">
                        No records found
                    </div>
                )}
            </div>

            {/* Attendance Records Table - Desktop */}
            <div className="hidden sm:block glass rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center gap-2">
                    <Calendar size={18} className="text-blue-400" />
                    <h3 className="font-semibold text-white text-sm sm:text-base">Attendance Records</h3>
                    <span className="ml-auto text-xs sm:text-sm text-blue-200/60">
                        Showing {sortedRecords.length} records
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="p-3 sm:p-4 font-semibold text-blue-200 text-xs sm:text-sm">Date</th>
                                <th className="p-3 sm:p-4 font-semibold text-blue-200 text-xs sm:text-sm">Student</th>
                                <th className="p-3 sm:p-4 font-semibold text-blue-200 text-xs sm:text-sm">Batch</th>
                                <th className="p-3 sm:p-4 font-semibold text-blue-200 text-xs sm:text-sm">Session</th>
                                <th className="p-3 sm:p-4 font-semibold text-blue-200 text-xs sm:text-sm">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {sortedRecords.map((record) => (
                                <tr key={record.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-3 sm:p-4 text-xs sm:text-sm text-white">
                                        {formatDate(record.date)}
                                    </td>
                                    <td className="p-3 sm:p-4">
                                        <div className="font-medium text-white text-xs sm:text-sm">
                                            {getStudentName(record.studentId)}
                                        </div>
                                        <div className="text-[10px] sm:text-xs text-blue-200/60">{record.studentId}</div>
                                    </td>
                                    <td className="p-3 sm:p-4 text-xs sm:text-sm text-blue-100">{record.batchId}</td>
                                    <td className="p-3 sm:p-4 text-xs sm:text-sm text-blue-100">{record.session}</td>
                                    <td className="p-3 sm:p-4">
                                        <span className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${getStatusColor(record.status)}`}>
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {sortedRecords.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-6 sm:p-8 text-center text-blue-200/60 text-sm">
                                        No attendance records found for the selected criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
