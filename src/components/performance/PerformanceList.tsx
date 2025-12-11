"use client";

import React, { useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, PerformanceRecord } from "@/lib/db";
import { Edit, Trash2, Award, Calendar, ChevronDown, ChevronUp, Target, Heart, Brain, Trophy, ArrowUp, ArrowDown, Search, Filter, X, Info } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useToast } from "@/components/common/Toast";
import { LoadingCard } from "@/components/common/LoadingSpinner";
import { NoAssessmentsEmpty, NoSearchResultsEmpty } from "@/components/common/EmptyState";

interface PerformanceListProps {
    onEdit: (record: PerformanceRecord) => void;
    onAddNew?: () => void;
}

interface CategoryAverages {
    technical: number;
    physical: number;
    mental: number;
}

export default function PerformanceList({ onEdit, onAddNew }: PerformanceListProps) {
    const [selectedStudent, setSelectedStudent] = useState('All');
    const [expandedRecords, setExpandedRecords] = useState<Set<number>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [scoreFilter, setScoreFilter] = useState<'all' | 'high' | 'average' | 'low'>('all');
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; recordId: number | null; studentName: string }>({
        isOpen: false,
        recordId: null,
        studentName: ''
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const { showToast } = useToast();

    const students = useLiveQuery(() => db.students.toArray());
    const allRecords = useLiveQuery(() => db.performance.toArray());

    // Loading state
    const isLoading = students === undefined || allRecords === undefined;

    // Calculate academy-wide averages for benchmarks
    const academyAverages = useMemo(() => {
        if (!allRecords || allRecords.length === 0) return { score: 0, winRate: 0 };

        let totalScore = 0;
        let totalWinRate = 0;
        let winRateCount = 0;

        allRecords.forEach(record => {
            const technical = (
                record.footwork + record.serveQuality + record.strokeQuality +
                record.strokeConsistency + record.smashPower + record.chopsDropShots +
                record.defenseSkills + record.courtCoverage
            ) / 8;
            const physical = (record.stamina + record.physicalFitness) / 2;
            const mental = record.mindset;
            totalScore += (technical + physical + mental) / 3;

            if (record.matchesPlayed > 0) {
                totalWinRate += (record.matchesWon / record.matchesPlayed) * 100;
                winRateCount++;
            }
        });

        return {
            score: Math.round((totalScore / allRecords.length) * 10) / 10,
            winRate: winRateCount > 0 ? Math.round(totalWinRate / winRateCount) : 0
        };
    }, [allRecords]);

    // Calculate category averages for a record
    const calculateCategoryAverages = (record: PerformanceRecord): CategoryAverages => {
        const technical = (
            record.footwork + record.serveQuality + record.strokeQuality +
            record.strokeConsistency + record.smashPower + record.chopsDropShots +
            record.defenseSkills + record.courtCoverage
        ) / 8;

        const physical = (record.stamina + record.physicalFitness) / 2;
        const mental = record.mindset;

        return {
            technical: Math.round(technical * 10) / 10,
            physical: Math.round(physical * 10) / 10,
            mental: Math.round(mental * 10) / 10
        };
    };

    // Filter and sort records
    const filteredRecords = useMemo(() => {
        if (!allRecords) return [];

        let filtered = [...allRecords];

        // Filter by student
        if (selectedStudent !== 'All') {
            filtered = filtered.filter(r => r.studentId === selectedStudent);
        }

        // Filter by search query (student name or date)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(r => {
                const student = students?.find(s => s.studentId === r.studentId);
                const studentName = student?.fullName.toLowerCase() || '';
                const dateStr = new Date(r.assessmentDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }).toLowerCase();
                return studentName.includes(query) || dateStr.includes(query) || r.studentId.toLowerCase().includes(query);
            });
        }

        // Filter by score range
        if (scoreFilter !== 'all') {
            filtered = filtered.filter(r => {
                const avg = calculateCategoryAverages(r);
                const overall = (avg.technical + avg.physical + avg.mental) / 3;
                if (scoreFilter === 'high') return overall >= 7;
                if (scoreFilter === 'average') return overall >= 5 && overall < 7;
                if (scoreFilter === 'low') return overall < 5;
                return true;
            });
        }

        // Sort by assessment date (newest first)
        filtered.sort((a, b) =>
            new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime()
        );

        return filtered;
    }, [allRecords, selectedStudent, searchQuery, scoreFilter, students]);

    // Get previous record for comparison
    const getPreviousRecord = (currentRecord: PerformanceRecord): PerformanceRecord | null => {
        if (!allRecords) return null;

        const studentRecords = allRecords
            .filter(r => r.studentId === currentRecord.studentId)
            .sort((a, b) => new Date(a.assessmentDate).getTime() - new Date(b.assessmentDate).getTime());

        const currentIndex = studentRecords.findIndex(r => r.id === currentRecord.id);
        return currentIndex > 0 ? studentRecords[currentIndex - 1] : null;
    };

    // Calculate comparison for category
    const getComparison = (current: number, previous: number | null) => {
        if (previous === null) return null;
        const diff = current - previous;
        if (Math.abs(diff) < 0.1) return { type: 'neutral', value: 0 };
        return {
            type: diff > 0 ? 'improved' : 'declined',
            value: Math.abs(Math.round(diff * 10) / 10)
        };
    };

    const getStudentName = (studentId: string) => {
        const student = students?.find(s => s.studentId === studentId);
        return student?.fullName || studentId;
    };

    const toggleExpanded = (id: number | undefined) => {
        if (!id) return;
        setExpandedRecords(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const openDeleteConfirm = (record: PerformanceRecord) => {
        setDeleteConfirm({
            isOpen: true,
            recordId: record.id ?? null,
            studentName: getStudentName(record.studentId)
        });
    };

    const handleDelete = async () => {
        if (!deleteConfirm.recordId) return;

        setIsDeleting(true);
        try {
            await db.performance.delete(deleteConfirm.recordId);
            showToast({
                type: 'success',
                title: 'Assessment deleted',
                message: `Successfully deleted assessment for ${deleteConfirm.studentName}`
            });
            setDeleteConfirm({ isOpen: false, recordId: null, studentName: '' });
        } catch {
            showToast({
                type: 'error',
                title: 'Delete failed',
                message: 'Failed to delete assessment. Please try again.'
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedStudent('All');
        setScoreFilter('all');
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getSkillLevelTag = (score: number) => {
        if (score >= 8.5) return { label: 'Excellent', color: 'bg-green-100 text-green-700 border-green-200' };
        if (score >= 7) return { label: 'Good', color: 'bg-blue-100 text-blue-700 border-blue-200' };
        if (score >= 5) return { label: 'Average', color: 'bg-amber-100 text-amber-700 border-amber-200' };
        return { label: 'Needs Work', color: 'bg-red-100 text-red-700 border-red-200' };
    };

    const getWinRate = (record: PerformanceRecord) => {
        if (record.matchesPlayed === 0) return 0;
        return Math.round((record.matchesWon / record.matchesPlayed) * 100);
    };

    // Compare with academy average
    const getComparisonWithAverage = (value: number, academyAvg: number) => {
        const diff = value - academyAvg;
        if (Math.abs(diff) < 1) return { status: 'average', label: 'At academy average' };
        if (diff > 0) return { status: 'above', label: `${Math.abs(Math.round(diff))}% above average` };
        return { status: 'below', label: `${Math.abs(Math.round(diff))}% below average` };
    };

    const hasActiveFilters = searchQuery || selectedStudent !== 'All' || scoreFilter !== 'all';

    // Radial progress component
    const RadialProgress = ({ value, max = 10, size = 80, strokeWidth = 8, color }: {
        value: number;
        max?: number;
        size?: number;
        strokeWidth?: number;
        color: string;
    }) => {
        const percentage = (value / max) * 100;
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;

        return (
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="none"
                        className="text-slate-200"
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className={color}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-base sm:text-lg font-bold text-slate-700">{value}</span>
                </div>
            </div>
        );
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="glass rounded-2xl p-4 animate-pulse">
                    <div className="h-10 bg-white/20 rounded-xl w-full" />
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                    <LoadingCard count={4} />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-3 sm:space-y-4">
                {/* Search Input */}
                <div className="relative">
                    <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by student name or date..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 sm:pl-12 pr-12 sm:pr-14 py-2.5 sm:py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-900 placeholder-slate-500 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            aria-label="Clear search"
                        >
                            <X size={18} className="text-slate-600" />
                        </button>
                    )}
                </div>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 flex-1">
                        <Filter size={18} className="text-slate-500 flex-shrink-0 hidden sm:block" />
                        <div className="relative flex-1">
                            <select
                                value={selectedStudent}
                                onChange={(e) => setSelectedStudent(e.target.value)}
                                className="w-full pl-3 sm:pl-4 pr-8 sm:pr-10 py-2.5 sm:py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm appearance-none cursor-pointer text-slate-900"
                            >
                                <option value="All">All Students</option>
                                {students?.map(student => (
                                    <option key={student.studentId} value={student.studentId}>
                                        {student.fullName}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center pointer-events-none">
                                <ChevronDown size={16} className="text-slate-600" />
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <select
                            value={scoreFilter}
                            onChange={(e) => setScoreFilter(e.target.value as 'all' | 'high' | 'average' | 'low')}
                            className="w-full sm:w-auto pl-3 sm:pl-4 pr-8 sm:pr-10 py-2.5 sm:py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm appearance-none cursor-pointer text-slate-900"
                        >
                            <option value="all">All Scores</option>
                            <option value="high">High (7+)</option>
                            <option value="average">Average (5-7)</option>
                            <option value="low">Needs Work (&lt;5)</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center pointer-events-none">
                            <ChevronDown size={16} className="text-slate-600" />
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-white rounded-xl transition-colors flex items-center gap-1.5 sm:gap-2 border border-slate-300"
                        >
                            <X size={16} />
                            Clear
                        </button>
                    )}
                </div>

                {/* Results count */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 text-xs sm:text-sm text-slate-700 font-medium">
                    <span>
                        {filteredRecords.length} {filteredRecords.length === 1 ? 'assessment' : 'assessments'} found
                    </span>
                    {academyAverages.score > 0 && (
                        <span className="flex items-center gap-1.5 text-slate-600">
                            <Info size={14} />
                            Avg: {academyAverages.score}/10, {academyAverages.winRate}% win
                        </span>
                    )}
                </div>
            </div>

            {/* Records Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {filteredRecords.map((record) => {
                    const categoryAvg = calculateCategoryAverages(record);
                    const previousRecord = getPreviousRecord(record);
                    const previousAvg = previousRecord ? calculateCategoryAverages(previousRecord) : null;
                    const isExpanded = expandedRecords.has(record.id!);

                    const technicalComparison = getComparison(categoryAvg.technical, previousAvg?.technical ?? null);
                    const physicalComparison = getComparison(categoryAvg.physical, previousAvg?.physical ?? null);
                    const mentalComparison = getComparison(categoryAvg.mental, previousAvg?.mental ?? null);

                    const overallAvg = ((categoryAvg.technical + categoryAvg.physical + categoryAvg.mental) / 3).toFixed(1);
                    const skillTag = getSkillLevelTag(parseFloat(overallAvg));
                    const winRate = getWinRate(record);
                    const winRateComparison = getComparisonWithAverage(winRate, academyAverages.winRate);
                    const scoreComparison = getComparisonWithAverage(parseFloat(overallAvg) * 10, academyAverages.score * 10);

                    return (
                        <div
                            key={record.id}
                            className="glass rounded-xl sm:rounded-2xl overflow-hidden hover-lift"
                        >
                            {/* Header */}
                            <div className="relative overflow-hidden p-4 sm:p-6 border-b border-white/10">
                                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
                                <div className="relative flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-800 text-base sm:text-xl mb-1.5 sm:mb-2">
                                            {getStudentName(record.studentId)}
                                        </h3>
                                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                            <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-slate-600">
                                                <Calendar size={14} className="sm:w-4 sm:h-4" />
                                                <span>{formatDate(record.assessmentDate)}</span>
                                            </div>
                                            <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold border ${skillTag.color}`}>
                                                {skillTag.label}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5 sm:gap-2">
                                        <button
                                            onClick={() => onEdit(record)}
                                            className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-blue-500/20 text-blue-600 hover:bg-blue-500/30 active:bg-blue-500/40 transition-colors"
                                            title="Edit assessment"
                                            aria-label="Edit assessment"
                                        >
                                            <Edit size={18} className="sm:w-5 sm:h-5" />
                                        </button>
                                        <button
                                            onClick={() => openDeleteConfirm(record)}
                                            className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-red-500/20 text-red-600 hover:bg-red-500/30 active:bg-red-500/40 transition-colors"
                                            title="Delete assessment"
                                            aria-label="Delete assessment"
                                        >
                                            <Trash2 size={18} className="sm:w-5 sm:h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Category Averages with Radial Progress */}
                            <div className="p-4 sm:p-6">
                                <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
                                    {/* Technical Skills */}
                                    <div className="flex flex-col items-center">
                                        <div className="relative mb-2 sm:mb-3">
                                            <RadialProgress
                                                value={categoryAvg.technical}
                                                color="text-blue-600"
                                                size={70}
                                                strokeWidth={8}
                                            />
                                            <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 bg-blue-600 p-1 sm:p-1.5 rounded-full shadow-lg">
                                                <Target size={12} className="sm:w-4 sm:h-4 text-white" />
                                            </div>
                                        </div>
                                        <h4 className="text-[10px] sm:text-sm font-bold text-slate-700 mb-0.5 sm:mb-1">Technical</h4>
                                        {technicalComparison && technicalComparison.type !== 'neutral' && (
                                            <div className={`flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-semibold ${technicalComparison.type === 'improved' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {technicalComparison.type === 'improved' ?
                                                    <ArrowUp size={10} className="sm:w-3 sm:h-3" /> : <ArrowDown size={10} className="sm:w-3 sm:h-3" />
                                                }
                                                {technicalComparison.value}
                                            </div>
                                        )}
                                    </div>

                                    {/* Physical Attributes */}
                                    <div className="flex flex-col items-center">
                                        <div className="relative mb-2 sm:mb-3">
                                            <RadialProgress
                                                value={categoryAvg.physical}
                                                color="text-green-600"
                                                size={70}
                                                strokeWidth={8}
                                            />
                                            <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 bg-green-600 p-1 sm:p-1.5 rounded-full shadow-lg">
                                                <Heart size={12} className="sm:w-4 sm:h-4 text-white" />
                                            </div>
                                        </div>
                                        <h4 className="text-[10px] sm:text-sm font-bold text-slate-700 mb-0.5 sm:mb-1">Physical</h4>
                                        {physicalComparison && physicalComparison.type !== 'neutral' && (
                                            <div className={`flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-semibold ${physicalComparison.type === 'improved' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {physicalComparison.type === 'improved' ?
                                                    <ArrowUp size={10} className="sm:w-3 sm:h-3" /> : <ArrowDown size={10} className="sm:w-3 sm:h-3" />
                                                }
                                                {physicalComparison.value}
                                            </div>
                                        )}
                                    </div>

                                    {/* Mental Game */}
                                    <div className="flex flex-col items-center">
                                        <div className="relative mb-2 sm:mb-3">
                                            <RadialProgress
                                                value={categoryAvg.mental}
                                                color="text-purple-600"
                                                size={70}
                                                strokeWidth={8}
                                            />
                                            <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 bg-purple-600 p-1 sm:p-1.5 rounded-full shadow-lg">
                                                <Brain size={12} className="sm:w-4 sm:h-4 text-white" />
                                            </div>
                                        </div>
                                        <h4 className="text-[10px] sm:text-sm font-bold text-slate-700 mb-0.5 sm:mb-1">Mental</h4>
                                        {mentalComparison && mentalComparison.type !== 'neutral' && (
                                            <div className={`flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-semibold ${mentalComparison.type === 'improved' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {mentalComparison.type === 'improved' ?
                                                    <ArrowUp size={10} className="sm:w-3 sm:h-3" /> : <ArrowDown size={10} className="sm:w-3 sm:h-3" />
                                                }
                                                {mentalComparison.value}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                                    <div className="bg-amber-500/20 p-3 sm:p-4 rounded-xl border border-amber-500/30">
                                        <div className="flex items-center gap-1.5 sm:gap-2 text-amber-600 text-[10px] sm:text-sm mb-1 sm:mb-1.5">
                                            <Trophy size={14} className="sm:w-[18px] sm:h-[18px]" />
                                            <span className="font-semibold">Overall</span>
                                        </div>
                                        <p className="text-xl sm:text-2xl font-bold text-amber-600">
                                            {overallAvg}/10
                                        </p>
                                        {academyAverages.score > 0 && (
                                            <p className={`text-[9px] sm:text-xs mt-0.5 sm:mt-1 ${scoreComparison.status === 'above' ? 'text-green-600' : scoreComparison.status === 'below' ? 'text-red-600' : 'text-slate-500'}`}>
                                                {scoreComparison.label}
                                            </p>
                                        )}
                                    </div>

                                    <div className="bg-emerald-500/20 p-3 sm:p-4 rounded-xl border border-emerald-500/30">
                                        <div className="flex items-center gap-1.5 sm:gap-2 text-emerald-600 text-[10px] sm:text-sm mb-1 sm:mb-1.5">
                                            <Award size={14} className="sm:w-[18px] sm:h-[18px]" />
                                            <span className="font-semibold">Win Rate</span>
                                        </div>
                                        <p className="text-xl sm:text-2xl font-bold text-emerald-600">
                                            {winRate}%
                                        </p>
                                        <div className="flex items-center justify-between mt-0.5 sm:mt-1">
                                            <p className="text-[9px] sm:text-xs text-slate-500">
                                                {record.matchesWon}/{record.matchesPlayed}
                                            </p>
                                            {academyAverages.winRate > 0 && record.matchesPlayed > 0 && (
                                                <p className={`text-[9px] sm:text-xs ${winRateComparison.status === 'above' ? 'text-green-600' : winRateComparison.status === 'below' ? 'text-red-600' : 'text-slate-500'}`}>
                                                    {winRateComparison.status === 'above' ? '↑' : winRateComparison.status === 'below' ? '↓' : '≈'} avg
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Expand/Collapse Button */}
                                <button
                                    onClick={() => toggleExpanded(record.id)}
                                    className="w-full flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-medium transition-colors text-xs sm:text-base"
                                >
                                    {isExpanded ? (
                                        <>
                                            <ChevronUp size={16} className="sm:w-5 sm:h-5" />
                                            Hide Details
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown size={16} className="sm:w-5 sm:h-5" />
                                            Show All Metrics
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="px-3 sm:px-6 pb-3 sm:pb-6 space-y-3 sm:space-y-4 border-t border-white/10 animate-in slide-in-from-top">
                                    {/* Technical Skills Breakdown */}
                                    <div className="bg-blue-50 p-3 sm:p-4 rounded-xl border border-blue-100">
                                        <h4 className="font-bold text-blue-800 mb-2 sm:mb-3 flex items-center gap-2 text-xs sm:text-sm">
                                            <Target size={14} className="sm:w-4 sm:h-4" />
                                            Technical Skills
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-[11px] sm:text-sm">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600 font-medium">Footwork</span>
                                                <span className="font-bold text-blue-700 bg-white px-2 py-1 rounded shadow-sm border border-blue-100">{record.footwork}/10</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600 font-medium">Serve</span>
                                                <span className="font-bold text-blue-700 bg-white px-2 py-1 rounded shadow-sm border border-blue-100">{record.serveQuality}/10</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600 font-medium">Stroke</span>
                                                <span className="font-bold text-blue-700 bg-white px-2 py-1 rounded shadow-sm border border-blue-100">{record.strokeQuality}/10</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600 font-medium">Consistency</span>
                                                <span className="font-bold text-blue-700 bg-white px-2 py-1 rounded shadow-sm border border-blue-100">{record.strokeConsistency}/10</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600 font-medium">Smash</span>
                                                <span className="font-bold text-blue-700 bg-white px-2 py-1 rounded shadow-sm border border-blue-100">{record.smashPower}/10</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600 font-medium">Chops</span>
                                                <span className="font-bold text-blue-700 bg-white px-2 py-1 rounded shadow-sm border border-blue-100">{record.chopsDropShots}/10</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600 font-medium">Defense</span>
                                                <span className="font-bold text-blue-700 bg-white px-2 py-1 rounded shadow-sm border border-blue-100">{record.defenseSkills}/10</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600 font-medium">Coverage</span>
                                                <span className="font-bold text-blue-700 bg-white px-2 py-1 rounded shadow-sm border border-blue-100">{record.courtCoverage}/10</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Physical & Mental Breakdown */}
                                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                        <div className="bg-green-50 p-3 sm:p-4 rounded-xl border border-green-100">
                                            <h4 className="font-bold text-green-800 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                                                <Heart size={14} className="sm:w-4 sm:h-4" />
                                                Physical
                                            </h4>
                                            <div className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-sm">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-600 font-medium">Stamina</span>
                                                    <span className="font-bold text-green-700 bg-white px-2 py-1 rounded shadow-sm border border-green-100">{record.stamina}/10</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-600 font-medium">Fitness</span>
                                                    <span className="font-bold text-green-700 bg-white px-2 py-1 rounded shadow-sm border border-green-100">{record.physicalFitness}/10</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-purple-50 p-3 sm:p-4 rounded-xl border border-purple-100">
                                            <h4 className="font-bold text-purple-800 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                                                <Brain size={14} className="sm:w-4 sm:h-4" />
                                                Mental
                                            </h4>
                                            <div className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-sm">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-600 font-medium">Mindset</span>
                                                    <span className="font-bold text-purple-700 bg-white px-2 py-1 rounded shadow-sm border border-purple-100">{record.mindset}/10</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Qualitative Feedback */}
                                    {(record.strengths || record.improvementAreas || record.coachComments) && (
                                        <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200">
                                            <h4 className="font-bold text-slate-800 mb-2 sm:mb-3 text-xs sm:text-sm">Coach Feedback</h4>
                                            <div className="space-y-2 sm:space-y-3 text-[11px] sm:text-sm">
                                                {record.strengths && (
                                                    <div>
                                                        <p className="font-semibold text-green-700 mb-0.5 sm:mb-1">Strengths</p>
                                                        <p className="text-slate-600">{record.strengths}</p>
                                                    </div>
                                                )}
                                                {record.improvementAreas && (
                                                    <div>
                                                        <p className="font-semibold text-orange-700 mb-0.5 sm:mb-1">Improvement Areas</p>
                                                        <p className="text-slate-600">{record.improvementAreas}</p>
                                                    </div>
                                                )}
                                                {record.coachComments && (
                                                    <div>
                                                        <p className="font-semibold text-blue-700 mb-0.5 sm:mb-1">Comments</p>
                                                        <p className="text-slate-600">{record.coachComments}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Empty States */}
            {filteredRecords.length === 0 && !hasActiveFilters && allRecords && allRecords.length === 0 && (
                <NoAssessmentsEmpty onAddAssessment={onAddNew || (() => { })} />
            )}

            {filteredRecords.length === 0 && hasActiveFilters && (
                <NoSearchResultsEmpty query={searchQuery || `${selectedStudent} with ${scoreFilter} scores`} onClear={clearFilters} />
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title="Delete Assessment"
                message={`Are you sure you want to delete this assessment for ${deleteConfirm.studentName}? This action cannot be undone and all associated data will be permanently removed.`}
                confirmLabel="Delete Assessment"
                cancelLabel="Keep It"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirm({ isOpen: false, recordId: null, studentName: '' })}
                isLoading={isDeleting}
            />
        </div>
    );
}
