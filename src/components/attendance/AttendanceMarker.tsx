"use client";

import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Student } from "@/lib/db";
import { Check, X, Clock, AlertCircle, Calendar, Users, Search, Filter } from "lucide-react";
import { getLocalDateString } from "@/lib/utils";
import { NoStudentsEmpty, NoSearchResultsEmpty } from "../common/EmptyState";

export default function AttendanceMarker() {
    const [selectedDate, setSelectedDate] = useState(getLocalDateString());
    const [selectedBatch, setSelectedBatch] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const students = useLiveQuery(() => db.students.toArray());
    const attendanceRecords = useLiveQuery(
        () => db.attendance.where("date").equals(new Date(selectedDate)).toArray(),
        [selectedDate]
    );

    const batches = Array.from(new Set(students?.map(s => s.batch) || [])).sort();

    const filteredStudents = students?.filter(s =>
        (selectedBatch === "All" || s.batch === selectedBatch) &&
        (searchQuery === "" || s.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
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

    // Quick stats
    const markedCount = filteredStudents?.filter(s => getStatus(s.studentId)).length || 0;
    const totalCount = filteredStudents?.length || 0;
    const presentCount = filteredStudents?.filter(s => getStatus(s.studentId) === 'Present').length || 0;

    return (
        <div className="space-y-6">
            {/* Spacious Header */}
            <div className="glass p-6 rounded-3xl flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between shadow-lg">
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    {/* Date Picker */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Calendar size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full sm:w-auto pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 font-medium transition-all hover:bg-white"
                        />
                    </div>

                    {/* Batch Select */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Filter size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <select
                            value={selectedBatch}
                            onChange={(e) => setSelectedBatch(e.target.value)}
                            className="w-full sm:w-auto pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 font-medium appearance-none cursor-pointer transition-all hover:bg-white"
                        >
                            <option value="All">All Batches</option>
                            {batches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <Users size={16} className="text-slate-400" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center">
                    {/* Search */}
                    <div className="relative group w-full sm:w-64">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 placeholder:text-slate-400 transition-all hover:bg-white"
                        />
                    </div>

                    {/* Stats Pill */}
                    <div className="flex items-center gap-4 px-5 py-3 bg-white/50 rounded-2xl border border-white/20 shadow-sm w-full sm:w-auto justify-between sm:justify-start">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Progress</span>
                            <span className="text-slate-700 font-bold">{markedCount}/{totalCount}</span>
                        </div>
                        <div className="w-px h-4 bg-slate-200 mx-2 hidden sm:block"></div>
                        <div className="flex items-center gap-2 text-green-600">
                            <Check size={16} strokeWidth={3} />
                            <span className="font-bold">{presentCount}</span>
                            <span className="text-xs font-medium opacity-80">Present</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table View */}
            <div className="glass rounded-3xl overflow-hidden shadow-lg border-2 border-slate-200/80">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b-2 border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                                <th className="p-4">Student</th>
                                <th className="p-4 hidden md:table-cell">Batch</th>
                                <th className="p-4 hidden sm:table-cell">Status</th>
                                <th className="p-4 text-center">Attendance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredStudents?.map((student) => {
                                const currentStatus = getStatus(student.studentId);
                                return (
                                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm transition-all ${currentStatus === 'Present' ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-green-500/30' :
                                                    currentStatus === 'Absent' ? 'bg-gradient-to-br from-red-400 to-red-600 text-white shadow-red-500/30' :
                                                        currentStatus === 'Late' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-yellow-500/30' :
                                                            currentStatus === 'On Leave' ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-blue-500/30' :
                                                                'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-700">{student.fullName}</div>
                                                    <div className="flex items-center gap-2 md:hidden mt-0.5">
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium border border-slate-200">
                                                            {student.batch}
                                                        </span>
                                                        {currentStatus && (
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${currentStatus === 'Present' ? 'bg-green-100 text-green-700' :
                                                                currentStatus === 'Absent' ? 'bg-red-100 text-red-700' :
                                                                    currentStatus === 'Late' ? 'bg-yellow-100 text-yellow-700' :
                                                                        'bg-blue-100 text-blue-700'
                                                                }`}>
                                                                {currentStatus}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden md:table-cell">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                {student.batch}
                                            </span>
                                        </td>
                                        <td className="p-4 hidden sm:table-cell">
                                            {currentStatus ? (
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${currentStatus === 'Present' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    currentStatus === 'Absent' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        currentStatus === 'Late' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                            'bg-blue-50 text-blue-700 border-blue-200'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${currentStatus === 'Present' ? 'bg-green-500' :
                                                        currentStatus === 'Absent' ? 'bg-red-500' :
                                                            currentStatus === 'Late' ? 'bg-yellow-500' :
                                                                'bg-blue-500'
                                                        }`}></span>
                                                    {currentStatus}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-sm italic">Not marked</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end sm:justify-center gap-1">
                                                <button onClick={() => markAttendance(student, 'Present')} className={`p-2 rounded-lg transition-all ${currentStatus === 'Present' ? 'bg-green-500 text-white shadow-lg shadow-green-500/30 scale-110' : 'hover:bg-green-50 text-slate-300 hover:text-green-600'}`} title="Present">
                                                    <Check size={20} strokeWidth={currentStatus === 'Present' ? 3 : 2} />
                                                </button>
                                                <button onClick={() => markAttendance(student, 'Absent')} className={`p-2 rounded-lg transition-all ${currentStatus === 'Absent' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110' : 'hover:bg-red-50 text-slate-300 hover:text-red-600'}`} title="Absent">
                                                    <X size={20} strokeWidth={currentStatus === 'Absent' ? 3 : 2} />
                                                </button>
                                                <button onClick={() => markAttendance(student, 'Late')} className={`p-2 rounded-lg transition-all ${currentStatus === 'Late' ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30 scale-110' : 'hover:bg-yellow-50 text-slate-300 hover:text-yellow-600'}`} title="Late">
                                                    <Clock size={20} strokeWidth={currentStatus === 'Late' ? 3 : 2} />
                                                </button>
                                                <button onClick={() => markAttendance(student, 'On Leave')} className={`p-2 rounded-lg transition-all ${currentStatus === 'On Leave' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-110' : 'hover:bg-blue-50 text-slate-300 hover:text-blue-600'}`} title="Leave">
                                                    <AlertCircle size={20} strokeWidth={currentStatus === 'On Leave' ? 3 : 2} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredStudents?.length === 0 && (
                <div className="mt-6">
                    {students && students.length === 0 ? (
                        <NoStudentsEmpty onAddStudent={() => { window.location.href = '/students?action=add' }} />
                    ) : (
                        <NoSearchResultsEmpty
                            query={searchQuery || selectedBatch}
                            onClear={() => {
                                setSearchQuery('');
                                setSelectedBatch('All');
                            }}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
