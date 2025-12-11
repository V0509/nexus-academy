import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card";
import { Users, ClipboardCheck, Activity, TrendingUp, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
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
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">0</h3>
            <p className="text-[10px] sm:text-xs text-green-600 font-medium mt-1 sm:mt-2">+0% this month</p>
          </div>
        </Link>

        <Link href="/attendance" className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 hover-lift group cursor-pointer scale-in relative overflow-hidden block" style={{ animationDelay: '100ms' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white mb-3 sm:mb-4 shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform duration-300">
              <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold mb-1">Present Today</p>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">0</h3>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1 sm:mt-2">0% attendance</p>
          </div>
        </Link>

        <Link href="/performance" className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 hover-lift group cursor-pointer scale-in relative overflow-hidden block" style={{ animationDelay: '200ms' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white mb-3 sm:mb-4 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold mb-1">Assessments</p>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">0</h3>
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
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">-</h3>
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
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
              </div>
              <p className="text-sm sm:text-base text-slate-500 font-medium">No attendance records yet</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 sm:mt-2">Start marking attendance to see data here</p>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full fade-in" style={{ animationDelay: '500ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-secondary animate-pulse" />
              Upcoming Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
              </div>
              <p className="text-sm sm:text-base text-slate-500 font-medium">No upcoming assessments</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 sm:mt-2">Schedule assessments to track progress</p>
            </div>
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
