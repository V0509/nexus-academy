"use client";

import React, { useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, PerformanceRecord } from "@/lib/db";
import {
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    AreaChart,
    Area,
} from "recharts";
import { TrendingUp, Calendar, Target, Zap, ArrowUp, ArrowDown, Activity, Users, Trophy, Flame, Star, ChevronDown, User } from "lucide-react";

// Skill Heat Map Component
const SkillHeatMap = ({ record, previousRecord }: { record: PerformanceRecord; previousRecord?: PerformanceRecord }) => {
    const skills = [
        { name: 'Footwork', key: 'footwork', category: 'technical' },
        { name: 'Serve', key: 'serveQuality', category: 'technical' },
        { name: 'Stroke Quality', key: 'strokeQuality', category: 'technical' },
        { name: 'Consistency', key: 'strokeConsistency', category: 'technical' },
        { name: 'Smash Power', key: 'smashPower', category: 'technical' },
        { name: 'Chops/Drops', key: 'chopsDropShots', category: 'technical' },
        { name: 'Defense', key: 'defenseSkills', category: 'technical' },
        { name: 'Court Coverage', key: 'courtCoverage', category: 'technical' },
        { name: 'Stamina', key: 'stamina', category: 'physical' },
        { name: 'Fitness', key: 'physicalFitness', category: 'physical' },
        { name: 'Mindset', key: 'mindset', category: 'mental' },
    ];

    const getColor = (value: number) => {
        if (value >= 9) return 'bg-emerald-500';
        if (value >= 7) return 'bg-green-400';
        if (value >= 5) return 'bg-yellow-400';
        if (value >= 3) return 'bg-orange-400';
        return 'bg-red-400';
    };

    const getChange = (key: string) => {
        if (!previousRecord) return null;
        const current = record[key as keyof PerformanceRecord] as number;
        const previous = previousRecord[key as keyof PerformanceRecord] as number;
        const diff = current - previous;
        if (Math.abs(diff) < 0.1) return { type: 'same', value: 0 };
        return { type: diff > 0 ? 'up' : 'down', value: Math.abs(diff) };
    };

    return (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-11 gap-2">
            {skills.map((skill) => {
                const value = record[skill.key as keyof PerformanceRecord] as number;
                const change = getChange(skill.key);
                return (
                    <div key={skill.key} className="group relative">
                        <div
                            className={`${getColor(value)} aspect-square rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg hover:scale-110 transition-transform cursor-pointer`}
                        >
                            {value}
                        </div>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                            <div className="font-semibold">{skill.name}</div>
                            <div className="flex items-center gap-1 mt-1">
                                <span>Score: {value}/10</span>
                                {change && change.type !== 'same' && (
                                    <span className={change.type === 'up' ? 'text-green-400' : 'text-red-400'}>
                                        ({change.type === 'up' ? '+' : '-'}{change.value})
                                    </span>
                                )}
                            </div>
                        </div>
                        {/* Change indicator */}
                        {change && change.type !== 'same' && (
                            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${change.type === 'up' ? 'bg-green-500' : 'bg-red-500'}`}>
                                {change.type === 'up' ? <ArrowUp size={10} className="text-white" /> : <ArrowDown size={10} className="text-white" />}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// Circular Progress Ring
const ProgressRing = ({ value, max = 10, size = 120, strokeWidth = 12, color, label, sublabel }: {
    value: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    color: string;
    label: string;
    sublabel?: string;
}) => {
    const percentage = (value / max) * 100;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="none"
                        className="text-slate-100"
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="url(#gradient)"
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={color} />
                            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-800">{value.toFixed(1)}</span>
                    <span className="text-xs text-slate-500">out of {max}</span>
                </div>
            </div>
            <div className="mt-3 text-center">
                <p className="font-semibold text-slate-700">{label}</p>
                {sublabel && <p className="text-xs text-slate-500">{sublabel}</p>}
            </div>
        </div>
    );
};

// Top Skills Component
const TopSkills = ({ record }: { record: PerformanceRecord }) => {
    const skills = [
        { name: 'Footwork', value: record.footwork, icon: Activity },
        { name: 'Serve Quality', value: record.serveQuality, icon: Zap },
        { name: 'Stroke Quality', value: record.strokeQuality, icon: Target },
        { name: 'Consistency', value: record.strokeConsistency, icon: Target },
        { name: 'Smash Power', value: record.smashPower, icon: Flame },
        { name: 'Chops/Drops', value: record.chopsDropShots, icon: Target },
        { name: 'Defense', value: record.defenseSkills, icon: Target },
        { name: 'Court Coverage', value: record.courtCoverage, icon: Activity },
        { name: 'Stamina', value: record.stamina, icon: Activity },
        { name: 'Fitness', value: record.physicalFitness, icon: Activity },
        { name: 'Mindset', value: record.mindset, icon: Star },
    ];

    const sorted = [...skills].sort((a, b) => b.value - a.value);
    const top3 = sorted.slice(0, 3);
    const bottom3 = sorted.slice(-3).reverse();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
                <h4 className="font-bold text-green-700 mb-4 flex items-center gap-2">
                    <Trophy size={18} />
                    Top 3 Strengths
                </h4>
                <div className="space-y-3">
                    {top3.map((skill, idx) => (
                        <div key={skill.name} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-slate-400' : 'bg-amber-600'}`}>
                                {idx + 1}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-slate-700">{skill.name}</span>
                                    <span className="font-bold text-green-600">{skill.value}/10</span>
                                </div>
                                <div className="h-2 bg-green-200 rounded-full mt-1 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000"
                                        style={{ width: `${skill.value * 10}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
                <h4 className="font-bold text-amber-700 mb-4 flex items-center gap-2">
                    <Target size={18} />
                    Focus Areas
                </h4>
                <div className="space-y-3">
                    {bottom3.map((skill, idx) => (
                        <div key={skill.name} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-sm">
                                {idx + 1}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-slate-700">{skill.name}</span>
                                    <span className="font-bold text-amber-600">{skill.value}/10</span>
                                </div>
                                <div className="h-2 bg-amber-200 rounded-full mt-1 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-1000"
                                        style={{ width: `${skill.value * 10}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default function PerformanceCharts() {
    const [selectedStudent, setSelectedStudent] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'trends'>('overview');

    const students = useLiveQuery(() => db.students.toArray());
    const allRecords = useLiveQuery(() => db.performance.toArray());

    // Filter records by student and sort by date
    const studentRecords = useMemo(() => {
        if (!allRecords || !selectedStudent) return [];

        return allRecords
            .filter(r => r.studentId === selectedStudent)
            .sort((a, b) => new Date(a.assessmentDate).getTime() - new Date(b.assessmentDate).getTime());
    }, [allRecords, selectedStudent]);

    // Latest assessment for radar chart
    const latestRecord = studentRecords[studentRecords.length - 1];
    const previousRecord = studentRecords.length > 1 ? studentRecords[studentRecords.length - 2] : undefined;

    // Prepare radar chart data
    const radarData = useMemo(() => {
        if (!latestRecord) return [];

        return [
            { skill: 'Footwork', value: latestRecord.footwork, fullMark: 10 },
            { skill: 'Serve', value: latestRecord.serveQuality, fullMark: 10 },
            { skill: 'Stroke Quality', value: latestRecord.strokeQuality, fullMark: 10 },
            { skill: 'Consistency', value: latestRecord.strokeConsistency, fullMark: 10 },
            { skill: 'Smash', value: latestRecord.smashPower, fullMark: 10 },
            { skill: 'Chops/Drops', value: latestRecord.chopsDropShots, fullMark: 10 },
            { skill: 'Defense', value: latestRecord.defenseSkills, fullMark: 10 },
            { skill: 'Coverage', value: latestRecord.courtCoverage, fullMark: 10 },
            { skill: 'Stamina', value: latestRecord.stamina, fullMark: 10 },
            { skill: 'Fitness', value: latestRecord.physicalFitness, fullMark: 10 },
            { skill: 'Mindset', value: latestRecord.mindset, fullMark: 10 },
        ];
    }, [latestRecord]);

    // Bar chart data for skill comparison
    const barChartData = useMemo(() => {
        if (!latestRecord) return [];

        const data = [
            { name: 'Footwork', current: latestRecord.footwork, previous: previousRecord?.footwork || 0 },
            { name: 'Serve', current: latestRecord.serveQuality, previous: previousRecord?.serveQuality || 0 },
            { name: 'Stroke', current: latestRecord.strokeQuality, previous: previousRecord?.strokeQuality || 0 },
            { name: 'Consistency', current: latestRecord.strokeConsistency, previous: previousRecord?.strokeConsistency || 0 },
            { name: 'Smash', current: latestRecord.smashPower, previous: previousRecord?.smashPower || 0 },
            { name: 'Drops', current: latestRecord.chopsDropShots, previous: previousRecord?.chopsDropShots || 0 },
            { name: 'Defense', current: latestRecord.defenseSkills, previous: previousRecord?.defenseSkills || 0 },
            { name: 'Coverage', current: latestRecord.courtCoverage, previous: previousRecord?.courtCoverage || 0 },
        ];

        return data;
    }, [latestRecord, previousRecord]);

    // Prepare line chart data (progression over time)
    const progressionData = useMemo(() => {
        return studentRecords.map(record => {
            const technical = (
                record.footwork + record.serveQuality + record.strokeQuality +
                record.strokeConsistency + record.smashPower + record.chopsDropShots +
                record.defenseSkills + record.courtCoverage
            ) / 8;
            const physical = (record.stamina + record.physicalFitness) / 2;
            const mental = record.mindset;

            return {
                date: new Date(record.assessmentDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
                technical: parseFloat(technical.toFixed(1)),
                physical: parseFloat(physical.toFixed(1)),
                mental: mental,
                average: parseFloat(((technical + physical + mental) / 3).toFixed(1)),
            };
        });
    }, [studentRecords]);

    // Calculate overall statistics
    const statistics = useMemo(() => {
        if (!latestRecord) return null;

        const totalMatches = latestRecord.matchesPlayed;
        const wonMatches = latestRecord.matchesWon;
        const winRate = totalMatches > 0 ? Math.round((wonMatches / totalMatches) * 100) : 0;

        const technical = (
            latestRecord.footwork + latestRecord.serveQuality + latestRecord.strokeQuality +
            latestRecord.strokeConsistency + latestRecord.smashPower + latestRecord.chopsDropShots +
            latestRecord.defenseSkills + latestRecord.courtCoverage
        ) / 8;
        const physical = (latestRecord.stamina + latestRecord.physicalFitness) / 2;
        const mental = latestRecord.mindset;
        const avgScore = ((technical + physical + mental) / 3).toFixed(1);

        // Calculate improvement if there are multiple records
        let improvement = null;
        let technicalChange = null;
        let physicalChange = null;
        let mentalChange = null;

        if (studentRecords.length > 1 && previousRecord) {
            const prevTechnical = (
                previousRecord.footwork + previousRecord.serveQuality + previousRecord.strokeQuality +
                previousRecord.strokeConsistency + previousRecord.smashPower + previousRecord.chopsDropShots +
                previousRecord.defenseSkills + previousRecord.courtCoverage
            ) / 8;
            const prevPhysical = (previousRecord.stamina + previousRecord.physicalFitness) / 2;
            const prevMental = previousRecord.mindset;
            const previousAvg = (prevTechnical + prevPhysical + prevMental) / 3;
            improvement = (parseFloat(avgScore) - previousAvg).toFixed(1);
            technicalChange = (technical - prevTechnical).toFixed(1);
            physicalChange = (physical - prevPhysical).toFixed(1);
            mentalChange = (mental - prevMental).toFixed(1);
        }

        return { avgScore, winRate, totalMatches, wonMatches, improvement, technical, physical, mental, technicalChange, physicalChange, mentalChange };
    }, [latestRecord, studentRecords, previousRecord]);

    // Auto-select first student if none selected
    React.useEffect(() => {
        if (!selectedStudent && students && students.length > 0) {
            setSelectedStudent(students[0].studentId);
        }
    }, [students, selectedStudent]);

    // Get performance grade
    const getGrade = (score: number) => {
        if (score >= 9) return { grade: 'A+', color: 'text-emerald-600', bg: 'bg-emerald-100' };
        if (score >= 8) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
        if (score >= 7) return { grade: 'B+', color: 'text-blue-600', bg: 'bg-blue-100' };
        if (score >= 6) return { grade: 'B', color: 'text-sky-600', bg: 'bg-sky-100' };
        if (score >= 5) return { grade: 'C', color: 'text-amber-600', bg: 'bg-amber-100' };
        return { grade: 'D', color: 'text-red-600', bg: 'bg-red-100' };
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Student Selector */}
            <div className="glass p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl shadow-lg scale-in">
                <label className="block text-sm sm:text-base font-semibold text-slate-800 mb-2 sm:mb-3">
                    Select Student to View Performance
                </label>
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User size={20} className="text-slate-400" />
                    </div>
                    <select
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        className="w-full pl-11 pr-11 py-3 sm:py-4 glass border-2 border-white/30 rounded-xl sm:rounded-2xl text-sm sm:text-base font-medium text-slate-700 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 appearance-none cursor-pointer shadow-sm hover:shadow-md bg-white"
                    >
                        <option value="">Choose a student...</option>
                        {students?.map(student => (
                            <option key={student.studentId} value={student.studentId}>
                                {student.fullName} ({student.studentId})
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <ChevronDown size={20} className="text-slate-400" />
                    </div>
                </div>
            </div>

            {!selectedStudent && (
                <div className="glass p-8 sm:p-12 md:p-16 rounded-2xl sm:rounded-3xl text-center fade-in">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center">
                        <TrendingUp size={40} className="text-slate-400" />
                    </div>
                    <p className="text-sm sm:text-base text-slate-600 font-medium">Select a student to view their performance metrics</p>
                </div>
            )}

            {selectedStudent && studentRecords.length === 0 && (
                <div className="glass p-8 sm:p-12 md:p-16 rounded-2xl sm:rounded-3xl text-center fade-in">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center">
                        <Calendar size={40} className="text-slate-400" />
                    </div>
                    <p className="text-sm sm:text-base text-slate-600 font-medium">No performance assessments found for this student</p>
                    <p className="text-xs sm:text-sm text-slate-500 mt-2">Add an assessment to start tracking their progress</p>
                </div>
            )}

            {selectedStudent && studentRecords.length > 0 && statistics && (
                <>
                    {/* Tab Navigation */}
                    <div className="glass p-1.5 rounded-2xl inline-flex gap-1 fade-in">
                        {[
                            { id: 'overview', label: 'Overview', icon: TrendingUp },
                            { id: 'skills', label: 'Skills Analysis', icon: Target },
                            { id: 'trends', label: 'Trends', icon: Activity },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as 'overview' | 'skills' | 'trends')}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${activeTab === tab.id
                                    ? 'bg-white text-slate-800 shadow-lg'
                                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                                    }`}
                            >
                                <tab.icon size={16} />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <>
                            {/* Hero Stats Section */}
                            <div className="glass p-6 sm:p-8 rounded-3xl shadow-xl fade-in relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-green-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                                <div className="relative grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
                                    {/* Overall Score with Grade */}
                                    <div className="lg:col-span-1 flex flex-col items-center">
                                        <div className="relative">
                                            <ProgressRing
                                                value={parseFloat(statistics.avgScore)}
                                                color="#667eea"
                                                label="Overall Score"
                                                sublabel={statistics.improvement ? `${parseFloat(statistics.improvement) >= 0 ? '+' : ''}${statistics.improvement} from last` : 'First assessment'}
                                            />
                                            <div className={`absolute -top-2 -right-2 px-3 py-1 rounded-full font-bold text-lg ${getGrade(parseFloat(statistics.avgScore)).bg} ${getGrade(parseFloat(statistics.avgScore)).color}`}>
                                                {getGrade(parseFloat(statistics.avgScore)).grade}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Category Breakdown */}
                                    <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {/* Technical */}
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-100">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-blue-600 rounded-xl">
                                                        <Target size={18} className="text-white" />
                                                    </div>
                                                    <span className="font-semibold text-blue-800">Technical</span>
                                                </div>
                                                {statistics.technicalChange && (
                                                    <div className={`flex items-center gap-1 text-sm font-bold ${parseFloat(statistics.technicalChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {parseFloat(statistics.technicalChange) >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                                                        {Math.abs(parseFloat(statistics.technicalChange))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-3xl font-bold text-blue-700">{statistics.technical.toFixed(1)}</div>
                                            <div className="h-2 bg-blue-200 rounded-full mt-3 overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000" style={{ width: `${statistics.technical * 10}%` }} />
                                            </div>
                                        </div>

                                        {/* Physical */}
                                        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-5 border border-green-100">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-green-600 rounded-xl">
                                                        <Activity size={18} className="text-white" />
                                                    </div>
                                                    <span className="font-semibold text-green-800">Physical</span>
                                                </div>
                                                {statistics.physicalChange && (
                                                    <div className={`flex items-center gap-1 text-sm font-bold ${parseFloat(statistics.physicalChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {parseFloat(statistics.physicalChange) >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                                                        {Math.abs(parseFloat(statistics.physicalChange))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-3xl font-bold text-green-700">{statistics.physical.toFixed(1)}</div>
                                            <div className="h-2 bg-green-200 rounded-full mt-3 overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-1000" style={{ width: `${statistics.physical * 10}%` }} />
                                            </div>
                                        </div>

                                        {/* Mental */}
                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-5 border border-purple-100">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-purple-600 rounded-xl">
                                                        <Star size={18} className="text-white" />
                                                    </div>
                                                    <span className="font-semibold text-purple-800">Mental</span>
                                                </div>
                                                {statistics.mentalChange && (
                                                    <div className={`flex items-center gap-1 text-sm font-bold ${parseFloat(statistics.mentalChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {parseFloat(statistics.mentalChange) >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                                                        {Math.abs(parseFloat(statistics.mentalChange))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-3xl font-bold text-purple-700">{statistics.mental.toFixed(1)}</div>
                                            <div className="h-2 bg-purple-200 rounded-full mt-3 overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-1000" style={{ width: `${statistics.mental * 10}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Match Stats & Quick Info */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 fade-in" style={{ animationDelay: '100ms' }}>
                                <div className="glass p-5 rounded-2xl hover-lift group cursor-pointer relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="relative">
                                        <div className="flex items-center gap-2 text-amber-600 mb-2">
                                            <Trophy size={18} />
                                            <span className="text-xs font-semibold">Win Rate</span>
                                        </div>
                                        <p className="text-3xl font-bold text-amber-600">{statistics.winRate}%</p>
                                        <p className="text-xs text-slate-500 mt-1">{statistics.wonMatches} of {statistics.totalMatches} matches</p>
                                    </div>
                                </div>

                                <div className="glass p-5 rounded-2xl hover-lift">
                                    <p className="text-xs font-semibold text-slate-600 mb-2">Total Assessments</p>
                                    <p className="text-3xl font-bold text-slate-800">{studentRecords.length}</p>
                                    <p className="text-xs text-slate-500 mt-1">Performance records</p>
                                </div>

                                <div className="glass p-5 rounded-2xl hover-lift">
                                    <p className="text-xs font-semibold text-slate-600 mb-2">Last Assessment</p>
                                    <p className="text-lg font-bold text-slate-800">
                                        {new Date(latestRecord.assessmentDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {new Date(latestRecord.assessmentDate).toLocaleDateString('en-IN', { year: 'numeric' })}
                                    </p>
                                </div>

                                <div className="glass p-5 rounded-2xl hover-lift">
                                    <p className="text-xs font-semibold text-slate-600 mb-2">Next Assessment</p>
                                    {latestRecord.nextAssessmentDate ? (
                                        <>
                                            <p className="text-lg font-bold text-blue-600">
                                                {new Date(latestRecord.nextAssessmentDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">Scheduled</p>
                                        </>
                                    ) : (
                                        <p className="text-lg font-medium text-slate-400">Not scheduled</p>
                                    )}
                                </div>
                            </div>

                            {/* Skill Heat Map */}
                            <div className="glass p-6 rounded-3xl shadow-lg fade-in" style={{ animationDelay: '200ms' }}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                        <Flame size={20} className="text-orange-500" />
                                        Skills Heat Map
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs">
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 rounded bg-red-400" />
                                            <span className="text-slate-500">1-2</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 rounded bg-orange-400" />
                                            <span className="text-slate-500">3-4</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 rounded bg-yellow-400" />
                                            <span className="text-slate-500">5-6</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 rounded bg-green-400" />
                                            <span className="text-slate-500">7-8</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 rounded bg-emerald-500" />
                                            <span className="text-slate-500">9-10</span>
                                        </div>
                                    </div>
                                </div>
                                <SkillHeatMap record={latestRecord} previousRecord={previousRecord} />
                            </div>

                            {/* Top Skills / Focus Areas */}
                            <div className="fade-in" style={{ animationDelay: '300ms' }}>
                                <TopSkills record={latestRecord} />
                            </div>

                            {/* Radar Chart */}
                            <div className="glass p-6 rounded-3xl shadow-lg fade-in" style={{ animationDelay: '400ms' }}>
                                <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
                                    Skill Profile Radar
                                </h3>
                                <ResponsiveContainer width="100%" height={350}>
                                    <RadarChart data={radarData}>
                                        <PolarGrid stroke="#e2e8f0" />
                                        <PolarAngleAxis
                                            dataKey="skill"
                                            tick={{ fill: '#64748b', fontSize: 11 }}
                                        />
                                        <PolarRadiusAxis
                                            angle={90}
                                            domain={[0, 10]}
                                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                                        />
                                        <Radar
                                            name="Skill Level"
                                            dataKey="value"
                                            stroke="#667eea"
                                            fill="url(#radarGradient)"
                                            fillOpacity={0.6}
                                        />
                                        <defs>
                                            <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#667eea" stopOpacity={0.8} />
                                                <stop offset="100%" stopColor="#764ba2" stopOpacity={0.4} />
                                            </linearGradient>
                                        </defs>
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Coach Feedback */}
                            {(latestRecord.strengths || latestRecord.improvementAreas || latestRecord.coachComments) && (
                                <div className="glass p-6 rounded-3xl shadow-lg fade-in" style={{ animationDelay: '500ms' }}>
                                    <h3 className="font-bold text-lg text-slate-800 mb-4">📝 Coach Feedback</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {latestRecord.strengths && (
                                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-100">
                                                <p className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                                                    <Trophy size={16} />
                                                    Strengths
                                                </p>
                                                <p className="text-slate-700">{latestRecord.strengths}</p>
                                            </div>
                                        )}
                                        {latestRecord.improvementAreas && (
                                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-100">
                                                <p className="font-semibold text-amber-700 mb-2 flex items-center gap-2">
                                                    <Target size={16} />
                                                    Improvement Areas
                                                </p>
                                                <p className="text-slate-700">{latestRecord.improvementAreas}</p>
                                            </div>
                                        )}
                                        {latestRecord.coachComments && (
                                            <div className="md:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100">
                                                <p className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                                                    <Users size={16} />
                                                    Coach Comments
                                                </p>
                                                <p className="text-slate-700">{latestRecord.coachComments}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Skills Analysis Tab */}
                    {activeTab === 'skills' && (
                        <>
                            {/* Bar Chart Comparison */}
                            <div className="glass p-6 rounded-3xl shadow-lg fade-in">
                                <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                                    <Target size={20} className="text-blue-600" />
                                    Technical Skills Comparison
                                    {previousRecord && <span className="text-xs font-normal text-slate-500 ml-2">(vs previous assessment)</span>}
                                </h3>
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={barChartData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
                                        <XAxis type="number" domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 11 }} stroke="#cbd5e1" />
                                        <YAxis dataKey="name" type="category" tick={{ fill: '#64748b', fontSize: 11 }} stroke="#cbd5e1" width={80} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                                        {previousRecord && (
                                            <Bar dataKey="previous" name="Previous" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
                                        )}
                                        <Bar dataKey="current" name="Current" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                                            {barChartData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.current >= 8 ? '#10b981' : entry.current >= 6 ? '#3b82f6' : entry.current >= 4 ? '#f59e0b' : '#ef4444'}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Detailed Skill Breakdown */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 fade-in" style={{ animationDelay: '100ms' }}>
                                {/* Technical Skills */}
                                <div className="glass p-6 rounded-3xl">
                                    <h4 className="font-bold text-blue-700 mb-4 flex items-center gap-2">
                                        <div className="p-2 bg-blue-600 rounded-xl">
                                            <Target size={16} className="text-white" />
                                        </div>
                                        Technical Skills
                                    </h4>
                                    <div className="space-y-4">
                                        {[
                                            { name: 'Footwork', value: latestRecord.footwork },
                                            { name: 'Serve Quality', value: latestRecord.serveQuality },
                                            { name: 'Stroke Quality', value: latestRecord.strokeQuality },
                                            { name: 'Consistency', value: latestRecord.strokeConsistency },
                                            { name: 'Smash Power', value: latestRecord.smashPower },
                                            { name: 'Chops/Drops', value: latestRecord.chopsDropShots },
                                            { name: 'Defense', value: latestRecord.defenseSkills },
                                            { name: 'Court Coverage', value: latestRecord.courtCoverage },
                                        ].map((skill) => (
                                            <div key={skill.name}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-slate-600">{skill.name}</span>
                                                    <span className="font-bold text-slate-800">{skill.value}/10</span>
                                                </div>
                                                <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000"
                                                        style={{ width: `${skill.value * 10}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Physical Attributes */}
                                <div className="glass p-6 rounded-3xl">
                                    <h4 className="font-bold text-green-700 mb-4 flex items-center gap-2">
                                        <div className="p-2 bg-green-600 rounded-xl">
                                            <Activity size={16} className="text-white" />
                                        </div>
                                        Physical Attributes
                                    </h4>
                                    <div className="space-y-4">
                                        {[
                                            { name: 'Stamina', value: latestRecord.stamina },
                                            { name: 'Physical Fitness', value: latestRecord.physicalFitness },
                                        ].map((skill) => (
                                            <div key={skill.name}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-slate-600">{skill.name}</span>
                                                    <span className="font-bold text-slate-800">{skill.value}/10</span>
                                                </div>
                                                <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-1000"
                                                        style={{ width: `${skill.value * 10}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Physical Average */}
                                    <div className="mt-6 pt-4 border-t border-green-100">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-green-700">Category Average</span>
                                            <span className="text-2xl font-bold text-green-600">{statistics.physical.toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Mental Game */}
                                <div className="glass p-6 rounded-3xl">
                                    <h4 className="font-bold text-purple-700 mb-4 flex items-center gap-2">
                                        <div className="p-2 bg-purple-600 rounded-xl">
                                            <Star size={16} className="text-white" />
                                        </div>
                                        Mental Game
                                    </h4>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-600">Mindset & Focus</span>
                                                <span className="font-bold text-slate-800">{latestRecord.mindset}/10</span>
                                            </div>
                                            <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-1000"
                                                    style={{ width: `${latestRecord.mindset * 10}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mental Score Display */}
                                    <div className="mt-6 pt-4 border-t border-purple-100">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-purple-700">Mental Score</span>
                                            <span className="text-2xl font-bold text-purple-600">{latestRecord.mindset}/10</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Trends Tab */}
                    {activeTab === 'trends' && (
                        <>
                            {/* Performance Trend Over Time */}
                            <div className="glass p-6 rounded-3xl shadow-lg fade-in">
                                <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                                    <TrendingUp size={20} className="text-blue-600" />
                                    Performance Trend Over Time
                                </h3>
                                {studentRecords.length < 2 ? (
                                    <div className="py-12 text-center">
                                        <Activity size={48} className="mx-auto text-slate-300 mb-4" />
                                        <p className="text-slate-500">At least 2 assessments are needed to show trends</p>
                                        <p className="text-sm text-slate-400 mt-1">Add more assessments to track progress over time</p>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={350}>
                                        <AreaChart data={progressionData}>
                                            <defs>
                                                <linearGradient id="technicalGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="physicalGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="mentalGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} stroke="#cbd5e1" />
                                            <YAxis domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 11 }} stroke="#cbd5e1" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                                            <Area type="monotone" dataKey="technical" name="Technical" stroke="#3b82f6" strokeWidth={2} fill="url(#technicalGradient)" />
                                            <Area type="monotone" dataKey="physical" name="Physical" stroke="#10b981" strokeWidth={2} fill="url(#physicalGradient)" />
                                            <Area type="monotone" dataKey="mental" name="Mental" stroke="#a855f7" strokeWidth={2} fill="url(#mentalGradient)" />
                                            <Line type="monotone" dataKey="average" name="Overall" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 4 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            {/* Progress Summary */}
                            {studentRecords.length >= 2 && statistics.improvement && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 fade-in" style={{ animationDelay: '100ms' }}>
                                    <div className={`glass p-6 rounded-3xl ${parseFloat(statistics.technicalChange || '0') >= 0 ? 'bg-gradient-to-br from-green-50/50 to-white' : 'bg-gradient-to-br from-red-50/50 to-white'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-slate-700">Technical Progress</span>
                                            <div className={`flex items-center gap-1 font-bold ${parseFloat(statistics.technicalChange || '0') >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {parseFloat(statistics.technicalChange || '0') >= 0 ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                                                {Math.abs(parseFloat(statistics.technicalChange || '0'))}
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-500">From previous assessment</p>
                                    </div>

                                    <div className={`glass p-6 rounded-3xl ${parseFloat(statistics.physicalChange || '0') >= 0 ? 'bg-gradient-to-br from-green-50/50 to-white' : 'bg-gradient-to-br from-red-50/50 to-white'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-slate-700">Physical Progress</span>
                                            <div className={`flex items-center gap-1 font-bold ${parseFloat(statistics.physicalChange || '0') >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {parseFloat(statistics.physicalChange || '0') >= 0 ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                                                {Math.abs(parseFloat(statistics.physicalChange || '0'))}
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-500">From previous assessment</p>
                                    </div>

                                    <div className={`glass p-6 rounded-3xl ${parseFloat(statistics.mentalChange || '0') >= 0 ? 'bg-gradient-to-br from-green-50/50 to-white' : 'bg-gradient-to-br from-red-50/50 to-white'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-slate-700">Mental Progress</span>
                                            <div className={`flex items-center gap-1 font-bold ${parseFloat(statistics.mentalChange || '0') >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {parseFloat(statistics.mentalChange || '0') >= 0 ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                                                {Math.abs(parseFloat(statistics.mentalChange || '0'))}
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-500">From previous assessment</p>
                                    </div>
                                </div>
                            )}

                            {/* Assessment History Timeline */}
                            <div className="glass p-6 rounded-3xl shadow-lg fade-in" style={{ animationDelay: '200ms' }}>
                                <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                                    <Calendar size={20} className="text-blue-600" />
                                    Assessment Timeline
                                </h3>
                                <div className="relative">
                                    {/* Timeline line */}
                                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500" />

                                    <div className="space-y-6">
                                        {studentRecords.slice().reverse().map((record, index) => {
                                            const avg = (
                                                (record.footwork + record.serveQuality + record.strokeQuality +
                                                    record.strokeConsistency + record.smashPower + record.chopsDropShots +
                                                    record.defenseSkills + record.courtCoverage) / 8 +
                                                (record.stamina + record.physicalFitness) / 2 +
                                                record.mindset
                                            ) / 3;
                                            const grade = getGrade(avg);

                                            return (
                                                <div key={record.id} className="relative pl-16">
                                                    {/* Timeline dot */}
                                                    <div className={`absolute left-4 w-5 h-5 rounded-full border-4 border-white shadow-lg ${index === 0 ? 'bg-blue-600' : 'bg-slate-400'}`} />

                                                    <div className={`p-4 rounded-2xl border ${index === 0 ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-slate-100'}`}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-semibold text-slate-800">
                                                                    {new Date(record.assessmentDate).toLocaleDateString('en-IN', {
                                                                        year: 'numeric',
                                                                        month: 'long',
                                                                        day: 'numeric'
                                                                    })}
                                                                </span>
                                                                {index === 0 && (
                                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Latest</span>
                                                                )}
                                                            </div>
                                                            <div className={`px-3 py-1 rounded-full font-bold ${grade.bg} ${grade.color}`}>
                                                                {grade.grade} ({avg.toFixed(1)})
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-slate-600">
                                                            <span>🎯 Technical: {((record.footwork + record.serveQuality + record.strokeQuality + record.strokeConsistency + record.smashPower + record.chopsDropShots + record.defenseSkills + record.courtCoverage) / 8).toFixed(1)}</span>
                                                            <span>💪 Physical: {((record.stamina + record.physicalFitness) / 2).toFixed(1)}</span>
                                                            <span>🧠 Mental: {record.mindset}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
