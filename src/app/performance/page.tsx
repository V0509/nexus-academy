"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db, PerformanceRecord } from "@/lib/db";
import PerformanceCharts from "@/components/performance/PerformanceCharts";
import PerformanceList from "@/components/performance/PerformanceList";
import PerformanceForm from "@/components/performance/PerformanceForm";
import { Plus, TrendingUp, Users, ClipboardCheck, Award, BarChart3 } from "lucide-react";

export default function PerformancePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<PerformanceRecord | undefined>(undefined);
    const [activeView, setActiveView] = useState<'analytics' | 'assessments'>('analytics');

    // Check for action and view query parameters
    useEffect(() => {
        const action = searchParams.get('action');
        const view = searchParams.get('view');

        if (action === 'add') {
            setIsFormOpen(true);
            router.replace('/performance', { scroll: false });
        }

        if (view === 'assessments') {
            setActiveView('assessments');
            router.replace('/performance', { scroll: false });
        }
    }, [searchParams, router]);

    // Fetch data for summary stats
    const students = useLiveQuery(() => db.students.toArray());
    const allRecords = useLiveQuery(() => db.performance.toArray());

    // Calculate summary statistics
    const summaryStats = useMemo(() => {
        if (!allRecords || !students) return null;

        const totalAssessments = allRecords.length;
        const studentsWithAssessments = new Set(allRecords.map(r => r.studentId)).size;
        const totalStudents = students.length;

        // Calculate overall average score
        let totalScore = 0;
        let recordCount = 0;
        allRecords.forEach(record => {
            const technical = (
                record.footwork + record.serveQuality + record.strokeQuality +
                record.strokeConsistency + record.smashPower + record.chopsDropShots +
                record.defenseSkills + record.courtCoverage
            ) / 8;
            const physical = (record.stamina + record.physicalFitness) / 2;
            const mental = record.mindset;
            totalScore += (technical + physical + mental) / 3;
            recordCount++;
        });
        const avgScore = recordCount > 0 ? (totalScore / recordCount).toFixed(1) : '0';

        // Calculate average win rate
        let totalWinRate = 0;
        let winRateCount = 0;
        allRecords.forEach(record => {
            if (record.matchesPlayed > 0) {
                totalWinRate += (record.matchesWon / record.matchesPlayed) * 100;
                winRateCount++;
            }
        });
        const avgWinRate = winRateCount > 0 ? Math.round(totalWinRate / winRateCount) : 0;

        return {
            totalAssessments,
            studentsWithAssessments,
            totalStudents,
            avgScore,
            avgWinRate
        };
    }, [allRecords, students]);

    const handleAddAssessment = async (data: Omit<PerformanceRecord, 'id'>) => {
        try {
            await db.performance.add(data as PerformanceRecord);
            setIsFormOpen(false);
        } catch {
            alert("Failed to add assessment. Please try again.");
        }
    };

    const handleUpdateAssessment = async (data: Omit<PerformanceRecord, 'id'>) => {
        if (!editingRecord?.id) return;
        try {
            await db.performance.update(editingRecord.id, data);
            setEditingRecord(undefined);
            setIsFormOpen(false);
        } catch {
            alert("Failed to update assessment. Please try again.");
        }
    };

    const openAddForm = () => {
        setEditingRecord(undefined);
        setIsFormOpen(true);
    };

    const openEditForm = (record: PerformanceRecord) => {
        setEditingRecord(record);
        setIsFormOpen(true);
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 scale-in">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 flex items-center gap-2">
                        Performance
                        <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-purple-300" />
                    </h2>
                    <p className="text-sm sm:text-base text-white/80 font-medium">Track skill development and progress</p>
                </div>
                <button
                    onClick={openAddForm}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-3 rounded-xl sm:rounded-2xl font-bold hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 w-full sm:w-auto justify-center"
                >
                    <Plus size={20} />
                    <span>New Assessment</span>
                </button>
            </div>

            {summaryStats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="glass rounded-2xl p-4 sm:p-5 hover-lift">
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                            <ClipboardCheck size={18} />
                            <span className="text-xs font-semibold">Assessments</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">{summaryStats.totalAssessments}</p>
                        <p className="text-xs text-slate-500 mt-1">Total records</p>
                    </div>

                    <div className="glass rounded-2xl p-4 sm:p-5 hover-lift">
                        <div className="flex items-center gap-2 text-green-600 mb-2">
                            <Users size={18} />
                            <span className="text-xs font-semibold">Coverage</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                            {summaryStats.studentsWithAssessments}/{summaryStats.totalStudents}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Students assessed</p>
                    </div>

                    <div className="glass rounded-2xl p-4 sm:p-5 hover-lift">
                        <div className="flex items-center gap-2 text-purple-600 mb-2">
                            <BarChart3 size={18} />
                            <span className="text-xs font-semibold">Avg Score</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">{summaryStats.avgScore}/10</p>
                        <p className="text-xs text-slate-500 mt-1">Academy average</p>
                    </div>

                    <div className="glass rounded-2xl p-4 sm:p-5 hover-lift">
                        <div className="flex items-center gap-2 text-amber-600 mb-2">
                            <Award size={18} />
                            <span className="text-xs font-semibold">Win Rate</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">{summaryStats.avgWinRate}%</p>
                        <p className="text-xs text-slate-500 mt-1">Average wins</p>
                    </div>
                </div>
            )}

            <div className="glass rounded-xl sm:rounded-2xl p-1 inline-flex gap-1">
                <button
                    onClick={() => setActiveView('analytics')}
                    className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${activeView === 'analytics'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-white/50'
                        }`}
                >
                    <BarChart3 size={18} />
                    Analytics
                </button>
                <button
                    onClick={() => setActiveView('assessments')}
                    className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${activeView === 'assessments'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-white/50'
                        }`}
                >
                    <ClipboardCheck size={18} />
                    <span className="hidden sm:inline">All</span> Assessments
                </button>
            </div>

            {/* Charts Section */}
            {activeView === 'analytics' && (
                <div className="fade-in">
                    <PerformanceCharts />
                </div>
            )}

            {/* All Assessments List */}
            {activeView === 'assessments' && (
                <div className="fade-in">
                    <PerformanceList onEdit={openEditForm} />
                </div>
            )}

            {/* Form Modal */}
            {isFormOpen && (
                <PerformanceForm
                    initialData={editingRecord}
                    onSubmit={editingRecord ? handleUpdateAssessment : handleAddAssessment}
                    onCancel={() => {
                        setIsFormOpen(false);
                        setEditingRecord(undefined);
                    }}
                />
            )}
        </div>
    );
}
