"use client";

import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Student } from "@/lib/db";
import { Check, X, Clock, AlertCircle, Calendar, Users, ChevronDown } from "lucide-react";

export default function AttendanceMarker() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedBatch, setSelectedBatch] = useState("All");

    const students = useLiveQuery(() => db.students.toArray());
    const attendanceRecords = useLiveQuery(
        () => db.attendance.where("date").equals(new Date(selectedDate)).toArray(),
        [selectedDate]
    );

    const batches = Array.from(new Set(students?.map(s => s.batch) || [])).sort();

    const filteredStudents = students?.filter(s =>
        selectedBatch === "All" || s.batch === selectedBatch
    );

    const getStatus = (studentId: string) => {
        const record = attendanceRecords?.find(r => r.studentId === studentId);
        return record?.status;
    };

    const markAttendance = async (student: Student, status: 'Present' | 'Absent' | 'Late' | 'On Leave') => {
        const date = new Date(selectedDate);
        const existingRecord = attendanceRecords?.find(r => r.studentId === student.studentId);

        try {
            if (existingRecord && existingRecord.id) {
                await db.attendance.update(existingRecord.id, { status });
            } else {
                await db.attendance.add({
                    date,
                    studentId: student.studentId,
                    status,
                    session: "Regular",
                    batchId: student.batch,
                    coachId: student.coachId,
                });
            }
        } catch {
            alert("Failed to mark attendance. Please try again.");
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="glass p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Calendar className="text-slate-500 hidden sm:block" size={20} />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="flex-1 sm:flex-none p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-sm sm:text-base"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Users size={16} className="text-slate-400" />
                        </div>
                        <select
                            value={selectedBatch}
                            onChange={(e) => setSelectedBatch(e.target.value)}
                            className="w-full sm:w-auto pl-9 pr-9 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 sm:min-w-[180px] appearance-none cursor-pointer bg-white font-medium text-slate-700 text-sm sm:text-base"
                        >
                            <option value="All">All Batches</option>
                            {batches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <ChevronDown size={16} className="text-slate-400" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="hidden sm:block glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/80 border-b border-slate-100">
                            <tr>
                                <th className="p-4 font-semibold text-slate-600 text-sm">Student</th>
                                <th className="p-4 font-semibold text-slate-600 text-sm">Batch</th>
                                <th className="p-4 font-semibold text-slate-600 text-center text-sm">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredStudents?.map((student) => {
                                const currentStatus = getStatus(student.studentId);

                                return (
                                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium text-slate-900">{student.fullName}</div>
                                            <div className="text-xs text-slate-500">{student.studentId}</div>
                                        </td>
                                        <td className="p-4 text-slate-600 text-sm">{student.batch}</td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => markAttendance(student, 'Present')}
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${currentStatus === 'Present'
                                                        ? "bg-green-500 text-white shadow-lg shadow-green-500/30 scale-110"
                                                        : "bg-slate-100 text-slate-400 hover:bg-green-100 hover:text-green-600"
                                                        }`}
                                                    title="Present"
                                                >
                                                    <Check size={20} strokeWidth={3} />
                                                </button>

                                                <button
                                                    onClick={() => markAttendance(student, 'Absent')}
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${currentStatus === 'Absent'
                                                        ? "bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110"
                                                        : "bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-600"
                                                        }`}
                                                    title="Absent"
                                                >
                                                    <X size={20} strokeWidth={3} />
                                                </button>

                                                <button
                                                    onClick={() => markAttendance(student, 'Late')}
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${currentStatus === 'Late'
                                                        ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/30 scale-110"
                                                        : "bg-slate-100 text-slate-400 hover:bg-yellow-100 hover:text-yellow-600"
                                                        }`}
                                                    title="Late"
                                                >
                                                    <Clock size={20} strokeWidth={3} />
                                                </button>

                                                <button
                                                    onClick={() => markAttendance(student, 'On Leave')}
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${currentStatus === 'On Leave'
                                                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-110"
                                                        : "bg-slate-100 text-slate-400 hover:bg-blue-100 hover:text-blue-600"
                                                        }`}
                                                    title="On Leave"
                                                >
                                                    <AlertCircle size={20} strokeWidth={3} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredStudents?.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-slate-400">
                                        No students found in this batch.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="sm:hidden space-y-3">
                {filteredStudents?.map((student) => {
                    const currentStatus = getStatus(student.studentId);

                    return (
                        <div key={student.id} className="glass rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <div className="font-semibold text-slate-900">{student.fullName}</div>
                                    <div className="text-xs text-slate-500">{student.batch}</div>
                                </div>
                                {currentStatus && (
                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${currentStatus === 'Present' ? 'bg-green-100 text-green-700' :
                                        currentStatus === 'Absent' ? 'bg-red-100 text-red-700' :
                                            currentStatus === 'Late' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-blue-100 text-blue-700'
                                        }`}>
                                        {currentStatus}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => markAttendance(student, 'Present')}
                                    className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm font-medium transition-all ${currentStatus === 'Present'
                                        ? "bg-green-500 text-white shadow-lg"
                                        : "bg-slate-100 text-slate-600 hover:bg-green-100"
                                        }`}
                                >
                                    <Check size={16} strokeWidth={3} />
                                </button>
                                <button
                                    onClick={() => markAttendance(student, 'Absent')}
                                    className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm font-medium transition-all ${currentStatus === 'Absent'
                                        ? "bg-red-500 text-white shadow-lg"
                                        : "bg-slate-100 text-slate-600 hover:bg-red-100"
                                        }`}
                                >
                                    <X size={16} strokeWidth={3} />
                                </button>
                                <button
                                    onClick={() => markAttendance(student, 'Late')}
                                    className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm font-medium transition-all ${currentStatus === 'Late'
                                        ? "bg-yellow-500 text-white shadow-lg"
                                        : "bg-slate-100 text-slate-600 hover:bg-yellow-100"
                                        }`}
                                >
                                    <Clock size={16} strokeWidth={3} />
                                </button>
                                <button
                                    onClick={() => markAttendance(student, 'On Leave')}
                                    className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm font-medium transition-all ${currentStatus === 'On Leave'
                                        ? "bg-blue-500 text-white shadow-lg"
                                        : "bg-slate-100 text-slate-600 hover:bg-blue-100"
                                        }`}
                                >
                                    <AlertCircle size={16} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    );
                })}
                {filteredStudents?.length === 0 && (
                    <div className="glass rounded-2xl p-8 text-center text-slate-400">
                        No students found in this batch.
                    </div>
                )}
            </div>
        </div>
    );
}
