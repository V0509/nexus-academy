"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card";
import { Users, ClipboardCheck, Activity, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { getLocalDateString } from "@/lib/utils";

export default function Dashboard() {
  // Create a date object that matches how dates are stored in the DB (UTC midnight of the date string)
  const todayStr = getLocalDateString();
  const today = new Date(todayStr);

  // Fetch real data
  const students = useLiveQuery(() => db.students.toArray());
  const attendanceToday = useLiveQuery(() =>
    db.attendance.where('date').equals(today).toArray()
  );
  const recentPerformance = useLiveQuery(() =>
    db.performance.orderBy('assessmentDate').reverse().limit(5).toArray()
  );

  // Calculate stats
  const totalStudents = students?.length || 0;
  const activeStudents = students?.filter(s => s.membershipStatus === 'Active').length || 0;

  const presentCount = attendanceToday?.filter(a =>
    a.status === 'Present' && students?.some(s => s.studentId === a.studentId)
  ).length || 0;
  const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  const assessmentsThisWeek = recentPerformance?.filter(p => {
    const date = new Date(p.assessmentDate);
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length || 0;

  // Calculate average rating from recent performance
  const avgRating = recentPerformance && recentPerformance.length > 0
    ? (recentPerformance.reduce((acc, curr) => {
      // Average of key metrics
      const metrics = [
        curr.footwork, curr.serveQuality, curr.strokeQuality,
        curr.strokeConsistency, curr.smashPower, curr.defenseSkills
      ];
      const recordAvg = metrics.reduce((a, b) => a + b, 0) / metrics.length;
      return acc + recordAvg;
    }, 0) / recentPerformance.length).toFixed(1)
    : '-';

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 scale-in">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2 flex items-center gap-2">
            Dashboard
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-300 animate-pulse" />
          </h2>
          <p className="text-sm sm:text-base text-white/80 font-medium">Welcome back, Coach! 🏸</p>
        </div>
        <div className="glass px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl">
          <p className="text-xs sm:text-sm text-slate-700 font-semibold">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        <Link href="/students" className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 hover-lift group cursor-pointer scale-in relative overflow-hidden block">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white mb-3 sm:mb-4 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold mb-1">Total Students</p>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">{totalStudents}</h3>
            <p className="text-[10px] sm:text-xs text-green-600 font-medium mt-1 sm:mt-2">{activeStudents} Active</p>
          </div>
        </Link>

        <Link href="/attendance" className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 hover-lift group cursor-pointer scale-in relative overflow-hidden block" style={{ animationDelay: '100ms' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white mb-3 sm:mb-4 shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform duration-300">
              <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold mb-1">Present Today</p>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">{presentCount}</h3>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1 sm:mt-2">{attendanceRate}% attendance</p>
          </div>
        </Link>

        <Link href="/performance" className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 hover-lift group cursor-pointer scale-in relative overflow-hidden block" style={{ animationDelay: '200ms' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white mb-3 sm:mb-4 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold mb-1">Assessments</p>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">{assessmentsThisWeek}</h3>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1 sm:mt-2">This week</p>
          </div>
        </Link>

        <Link href="/performance" className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 hover-lift group cursor-pointer scale-in relative overflow-hidden block" style={{ animationDelay: '300ms' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white mb-3 sm:mb-4 shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold mb-1">Avg. Rating</p>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">{avgRating}</h3>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1 sm:mt-2">Out of 10</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        <Card className="h-full fade-in" style={{ animationDelay: '400ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-primary animate-pulse" />
              Recent Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceToday && attendanceToday.length > 0 ? (
              <div className="space-y-3">
                {attendanceToday.slice(0, 5).map((record, i) => {
                  const student = students?.find(s => s.studentId === record.studentId);
                  return (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white ${record.status === 'Present' ? 'bg-green-500' :
                          record.status === 'Absent' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}>
                          {student?.fullName.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">{student?.fullName || record.studentId}</p>
                          <p className="text-xs text-slate-500">{record.session}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${record.status === 'Present' ? 'bg-green-100 text-green-700' :
                        record.status === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        {record.status}
                      </span>
                    </div>
                  );
                })}
                {attendanceToday.length > 5 && (
                  <Link href="/attendance" className="block text-center text-xs text-blue-600 font-medium hover:underline pt-2">
                    View all {attendanceToday.length} records
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                  <ClipboardCheck className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                </div>
                <p className="text-sm sm:text-base text-slate-500 font-medium">No attendance records today</p>
                <Link href="/attendance" className="inline-flex items-center gap-2 text-xs sm:text-sm text-blue-600 font-bold mt-2 hover:underline">
                  Mark Attendance <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-full fade-in" style={{ animationDelay: '500ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-secondary animate-pulse" />
              Recent Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentPerformance && recentPerformance.length > 0 ? (
              <div className="space-y-3">
                {recentPerformance.map((record, i) => {
                  const student = students?.find(s => s.studentId === record.studentId);
                  return (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                          <Activity size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">{student?.fullName || record.studentId}</p>
                          <p className="text-xs text-slate-500">{new Date(record.assessmentDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Link href={`/performance?student=${record.studentId}`} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                        <ArrowRight size={16} className="text-slate-400" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                  <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                </div>
                <p className="text-sm sm:text-base text-slate-500 font-medium">No recent assessments</p>
                <Link href="/performance" className="inline-flex items-center gap-2 text-xs sm:text-sm text-blue-600 font-bold mt-2 hover:underline">
                  Start Assessment <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="fade-in" style={{ animationDelay: '600ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            <Link href="/students?action=add" className="btn-primary text-center text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center">
              Add Student
            </Link>
            <Link href="/attendance" className="glass text-center text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-semibold text-slate-700 hover:scale-105 active:scale-95 transition-all duration-200 hover:bg-white/80 flex items-center justify-center">
              Mark Attendance
            </Link>
            <Link href="/performance?action=add" className="glass text-center text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-semibold text-slate-700 hover:scale-105 active:scale-95 transition-all duration-200 hover:bg-white/80 flex items-center justify-center">
              New Assessment
            </Link>
            <Link href="/performance?view=assessments" className="glass text-center text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-semibold text-slate-700 hover:scale-105 active:scale-95 transition-all duration-200 hover:bg-white/80 flex items-center justify-center">
              View Reports
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
