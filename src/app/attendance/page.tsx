"use client";

import { useState } from "react";
import AttendanceMarker from "@/components/attendance/AttendanceMarker";
import AttendanceHistory from "@/components/attendance/AttendanceHistory";
import { ClipboardCheck, History } from "lucide-react";

export default function AttendancePage() {
    const [activeTab, setActiveTab] = useState<'mark' | 'history'>('mark');

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 scale-in">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 flex items-center gap-2">
                        Attendance
                        <ClipboardCheck className="w-6 h-6 sm:w-7 sm:h-7 text-green-300" />
                    </h2>
                    <p className="text-sm sm:text-base text-white/80 font-medium">
                        {activeTab === 'mark'
                            ? 'Mark daily attendance for students'
                            : 'View attendance history and statistics'}
                    </p>
                </div>
            </div>

            <div className="glass rounded-xl sm:rounded-2xl p-1 inline-flex gap-1">
                <button
                    onClick={() => setActiveTab('mark')}
                    className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${activeTab === 'mark'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-white/50'
                        }`}
                >
                    <ClipboardCheck size={18} />
                    <span className="hidden sm:inline">Mark</span> Attendance
                </button>

                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${activeTab === 'history'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-white/50'
                        }`}
                >
                    <History size={18} />
                    History
                </button>
            </div>

            {activeTab === 'mark' ? <AttendanceMarker /> : <AttendanceHistory />}
        </div>
    );
}
