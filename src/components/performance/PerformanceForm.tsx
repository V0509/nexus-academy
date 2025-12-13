"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, PerformanceRecord } from "@/lib/db";
import { X, Save, Target, Zap, Activity, Heart, Brain, Shield, TrendingUp, Droplet, ChevronDown, ChevronUp, User, ArrowLeft, Sparkles, RotateCcw } from "lucide-react";
import { useToast } from "@/components/common/Toast";
import { getLocalDateString } from "@/lib/utils";

interface PerformanceFormProps {
    initialData?: PerformanceRecord;
    onSubmit: (data: Omit<PerformanceRecord, 'id'>) => void;
    onCancel: () => void;
}

interface SkillSliderProps {
    label: string;
    value: number;
    field: string;
    onChange: (field: string, value: number) => void;
    icon: React.ReactNode;
    color: string;
}

// Preset templates for quick assessment
const SKILL_PRESETS = {
    beginner: {
        label: 'Beginner',
        description: 'New player just starting out',
        values: { footwork: 3, serveQuality: 3, strokeQuality: 3, strokeConsistency: 2, smashPower: 2, chopsDropShots: 2, defenseSkills: 2, courtCoverage: 3, stamina: 4, physicalFitness: 4, mindset: 5 }
    },
    intermediate: {
        label: 'Intermediate',
        description: 'Developing player with solid basics',
        values: { footwork: 5, serveQuality: 5, strokeQuality: 5, strokeConsistency: 5, smashPower: 5, chopsDropShots: 5, defenseSkills: 5, courtCoverage: 5, stamina: 6, physicalFitness: 6, mindset: 6 }
    },
    advanced: {
        label: 'Advanced',
        description: 'Skilled player with refined technique',
        values: { footwork: 7, serveQuality: 7, strokeQuality: 7, strokeConsistency: 7, smashPower: 7, chopsDropShots: 7, defenseSkills: 7, courtCoverage: 7, stamina: 8, physicalFitness: 7, mindset: 7 }
    },
    elite: {
        label: 'Elite',
        description: 'Competition-ready athlete',
        values: { footwork: 9, serveQuality: 9, strokeQuality: 9, strokeConsistency: 8, smashPower: 8, chopsDropShots: 8, defenseSkills: 8, courtCoverage: 9, stamina: 9, physicalFitness: 9, mindset: 9 }
    }
};

const SkillSlider = ({ label, value, field, onChange, icon, color }: SkillSliderProps) => (
    <div className="group">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
                <div className={`p-1.5 sm:p-2 rounded-lg ${color === 'blue' ? 'bg-blue-100 text-blue-600' : color === 'green' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                    {icon}
                </div>
                <label className="text-xs sm:text-sm font-medium text-slate-700">
                    {label}
                </label>
            </div>
            <span className={`text-base sm:text-lg font-bold ${color === 'blue' ? 'text-blue-600' : color === 'green' ? 'text-green-600' : 'text-purple-600'}`}>
                {value}/10
            </span>
        </div>
        <input
            type="range"
            min="0"
            max="10"
            value={value}
            onChange={(e) => onChange(field, parseInt(e.target.value))}
            className={`w-full h-4 sm:h-3 rounded-lg appearance-none cursor-pointer transition-all touch-pan-y ${color === 'blue' ? 'bg-blue-100 accent-blue-600 hover:bg-blue-200' :
                color === 'green' ? 'bg-green-100 accent-green-600 hover:bg-green-200' :
                    'bg-purple-100 accent-purple-600 hover:bg-purple-200'
                }`}
            style={{
                background: `linear-gradient(to right, ${color === 'blue' ? '#3b82f6' : color === 'green' ? '#10b981' : '#a855f7'
                    } 0%, ${color === 'blue' ? '#3b82f6' : color === 'green' ? '#10b981' : '#a855f7'
                    } ${value * 10}%, ${color === 'blue' ? '#dbeafe' : color === 'green' ? '#d1fae5' : '#f3e8ff'
                    } ${value * 10}%, ${color === 'blue' ? '#dbeafe' : color === 'green' ? '#d1fae5' : '#f3e8ff'
                    } 100%)`
            }}
        />
        {/* Quick value buttons */}
        <div className="flex justify-between mt-2 gap-1">
            {[1, 3, 5, 7, 10].map((v) => (
                <button
                    key={v}
                    type="button"
                    onClick={() => onChange(field, v)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors min-h-[32px] ${value === v
                        ? color === 'blue' ? 'bg-blue-600 text-white' : color === 'green' ? 'bg-green-600 text-white' : 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                >
                    {v}
                </button>
            ))}
        </div>
    </div>
);

import { NoStudentsEmpty } from "../common/EmptyState";

export default function PerformanceForm({ initialData, onSubmit, onCancel }: PerformanceFormProps) {
    const students = useLiveQuery(() => db.students.toArray());
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        studentId: initialData?.studentId || '',
        assessmentDate: initialData?.assessmentDate
            ? new Date(initialData.assessmentDate).toISOString().split('T')[0]
            : getLocalDateString(),
        // Technical Skills
        footwork: initialData?.footwork || 5,
        serveQuality: initialData?.serveQuality || 5,
        strokeQuality: initialData?.strokeQuality || 5,
        strokeConsistency: initialData?.strokeConsistency || 5,
        smashPower: initialData?.smashPower || 5,
        chopsDropShots: initialData?.chopsDropShots || 5,
        defenseSkills: initialData?.defenseSkills || 5,
        courtCoverage: initialData?.courtCoverage || 5,
        // Physical Attributes
        stamina: initialData?.stamina || 5,
        physicalFitness: initialData?.physicalFitness || 5,
        // Mental Game
        mindset: initialData?.mindset || 5,
        // Match Statistics
        matchesPlayed: initialData?.matchesPlayed || 0,
        matchesWon: initialData?.matchesWon || 0,
        // Qualitative Feedback
        improvementAreas: initialData?.improvementAreas || '',
        strengths: initialData?.strengths || '',
        coachComments: initialData?.coachComments || '',
        nextAssessmentDate: initialData?.nextAssessmentDate
            ? new Date(initialData.nextAssessmentDate).toISOString().split('T')[0]
            : '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [expandedSections, setExpandedSections] = useState({
        technical: true,
        physical: true,
        mental: true,
        feedback: false
    });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Apply preset values
    const applyPreset = (presetKey: keyof typeof SKILL_PRESETS) => {
        const preset = SKILL_PRESETS[presetKey];
        setFormData(prev => ({
            ...prev,
            ...preset.values
        }));
        showToast({
            type: 'info',
            title: `${preset.label} preset applied`,
            message: 'You can still adjust individual skills',
            duration: 2000
        });
    };

    // Reset to defaults
    const resetToDefaults = () => {
        setFormData(prev => ({
            ...prev,
            footwork: 5,
            serveQuality: 5,
            strokeQuality: 5,
            strokeConsistency: 5,
            smashPower: 5,
            chopsDropShots: 5,
            defenseSkills: 5,
            courtCoverage: 5,
            stamina: 5,
            physicalFitness: 5,
            mindset: 5
        }));
    };

    // Calculate category averages
    const categoryAverages = useMemo(() => {
        const technical = (
            formData.footwork + formData.serveQuality + formData.strokeQuality +
            formData.strokeConsistency + formData.smashPower + formData.chopsDropShots +
            formData.defenseSkills + formData.courtCoverage
        ) / 8;

        const physical = (formData.stamina + formData.physicalFitness) / 2;
        const mental = formData.mindset;

        return {
            technical: technical.toFixed(1),
            physical: physical.toFixed(1),
            mental: mental.toFixed(1)
        };
    }, [formData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const newErrors: Record<string, string> = {};

        if (!formData.studentId) {
            newErrors.studentId = 'Please select a student';
        }

        if (formData.matchesWon > formData.matchesPlayed) {
            newErrors.matchesWon = 'Matches won cannot exceed matches played';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Submit
        onSubmit({
            studentId: formData.studentId,
            assessmentDate: new Date(formData.assessmentDate),
            footwork: formData.footwork,
            serveQuality: formData.serveQuality,
            strokeQuality: formData.strokeQuality,
            strokeConsistency: formData.strokeConsistency,
            smashPower: formData.smashPower,
            chopsDropShots: formData.chopsDropShots,
            defenseSkills: formData.defenseSkills,
            courtCoverage: formData.courtCoverage,
            stamina: formData.stamina,
            physicalFitness: formData.physicalFitness,
            mindset: formData.mindset,
            matchesPlayed: formData.matchesPlayed,
            matchesWon: formData.matchesWon,
            improvementAreas: formData.improvementAreas,
            strengths: formData.strengths,
            coachComments: formData.coachComments,
            nextAssessmentDate: formData.nextAssessmentDate ? new Date(formData.nextAssessmentDate) : undefined,
        });
    };

    const updateField = (field: string, value: number | string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const modalContent = (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
            <div className="bg-white w-full h-[95vh] sm:h-auto sm:max-h-[90vh] sm:rounded-2xl rounded-t-3xl shadow-2xl sm:max-w-5xl sm:my-8 relative flex flex-col overflow-hidden">
                {/* Header */}
                <div className="relative overflow-hidden flex-shrink-0">
                    {/* Mobile drag indicator */}
                    <div className="sm:hidden flex justify-center pt-3 pb-1">
                        <div className="w-10 h-1 bg-slate-300 rounded-full"></div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 opacity-10"></div>
                    <div className="relative flex items-center justify-between p-4 sm:p-6 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="p-2.5 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                                aria-label="Go back"
                            >
                                <ArrowLeft size={20} className="text-slate-600" />
                            </button>
                            <div className="min-w-0">
                                <h2 className="text-lg sm:text-2xl font-bold text-slate-800 truncate">
                                    {initialData ? 'Edit Assessment' : 'New Performance Assessment'}
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 truncate">
                                    Comprehensive badminton performance evaluation
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="p-2.5 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-colors ml-2 flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                            aria-label="Close"
                        >
                            <X size={22} className="text-slate-600" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                {students && students.length === 0 ? (
                    <div className="p-8">
                        <NoStudentsEmpty onAddStudent={() => { window.location.href = '/students?action=add' }} />
                    </div>
                ) : (
                    <>
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 sm:space-y-6">
                            {/* Student & Date Selection */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                                        Student <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User size={18} className="text-slate-400" />
                                        </div>
                                        <select
                                            value={formData.studentId}
                                            onChange={(e) => updateField('studentId', e.target.value)}
                                            className={`w-full pl-10 pr-10 py-3 text-base border ${errors.studentId ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white appearance-none cursor-pointer shadow-sm hover:border-slate-300`}
                                            required
                                        >
                                            <option value="">Select a student</option>
                                            {students?.map(student => (
                                                <option key={student.studentId} value={student.studentId}>
                                                    {student.fullName} ({student.studentId})
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <ChevronDown size={18} className="text-slate-400" />
                                        </div>
                                    </div>
                                    {errors.studentId && (
                                        <p className="text-red-500 text-xs mt-1">{errors.studentId}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                                        Assessment Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.assessmentDate}
                                        onChange={(e) => updateField('assessmentDate', e.target.value)}
                                        className="w-full p-3 sm:p-3 text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm hover:border-slate-300 min-h-[48px]"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Quick Preset Selector */}
                            {!initialData && (
                                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 sm:p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Sparkles size={18} className="text-amber-500" />
                                            <h3 className="font-semibold text-slate-700 text-sm sm:text-base">Quick Start with Preset</h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={resetToDefaults}
                                            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors min-h-[32px] px-2"
                                        >
                                            <RotateCcw size={14} />
                                            Reset
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-3">Choose a starting point based on skill level, then fine-tune individual skills</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {(Object.keys(SKILL_PRESETS) as Array<keyof typeof SKILL_PRESETS>).map((key) => {
                                            const preset = SKILL_PRESETS[key];
                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => applyPreset(key)}
                                                    className="p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-all text-left group min-h-[72px]"
                                                >
                                                    <div className="font-semibold text-slate-700 text-sm group-hover:text-blue-700">{preset.label}</div>
                                                    <div className="text-xs text-slate-500 mt-0.5">{preset.description}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* 🎯 Technical Skills - Blue Theme */}
                            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-white backdrop-blur-sm">
                                <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-blue-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => toggleSection('technical')}
                                        className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-blue-50/30 active:bg-blue-50/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="p-2 sm:p-3 bg-blue-600 rounded-lg sm:rounded-xl shadow-lg shadow-blue-600/20">
                                                <Target className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="font-bold text-sm sm:text-lg text-slate-800">🎯 Technical Skills</h3>
                                                <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">Core badminton techniques</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-4">
                                            <div className="text-right">
                                                <div className="text-xl sm:text-2xl font-bold text-blue-600">{categoryAverages.technical}</div>
                                                <div className="text-[10px] sm:text-xs text-slate-500">Average</div>
                                            </div>
                                            {expandedSections.technical ? <ChevronUp className="text-slate-400 w-5 h-5" /> : <ChevronDown className="text-slate-400 w-5 h-5" />}
                                        </div>
                                    </button>

                                    {expandedSections.technical && (
                                        <div className="px-4 pb-4 sm:px-6 sm:pb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                                            <SkillSlider label="Footwork" value={formData.footwork} field="footwork" onChange={updateField} icon={<Activity size={14} className="sm:w-4 sm:h-4" />} color="blue" />
                                            <SkillSlider label="Serve Quality" value={formData.serveQuality} field="serveQuality" onChange={updateField} icon={<Zap size={14} className="sm:w-4 sm:h-4" />} color="blue" />
                                            <SkillSlider label="Stroke Quality" value={formData.strokeQuality} field="strokeQuality" onChange={updateField} icon={<TrendingUp size={14} className="sm:w-4 sm:h-4" />} color="blue" />
                                            <SkillSlider label="Stroke Consistency" value={formData.strokeConsistency} field="strokeConsistency" onChange={updateField} icon={<Target size={14} className="sm:w-4 sm:h-4" />} color="blue" />
                                            <SkillSlider label="Smash Power" value={formData.smashPower} field="smashPower" onChange={updateField} icon={<Zap size={14} className="sm:w-4 sm:h-4" />} color="blue" />
                                            <SkillSlider label="Chops/Drop Shots" value={formData.chopsDropShots} field="chopsDropShots" onChange={updateField} icon={<Droplet size={14} className="sm:w-4 sm:h-4" />} color="blue" />
                                            <SkillSlider label="Defense Skills" value={formData.defenseSkills} field="defenseSkills" onChange={updateField} icon={<Shield size={14} className="sm:w-4 sm:h-4" />} color="blue" />
                                            <SkillSlider label="Court Coverage" value={formData.courtCoverage} field="courtCoverage" onChange={updateField} icon={<Activity size={14} className="sm:w-4 sm:h-4" />} color="blue" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 💪 Physical Attributes - Green Theme */}
                            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-green-100 bg-gradient-to-br from-green-50/50 to-white backdrop-blur-sm">
                                <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-green-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => toggleSection('physical')}
                                        className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-green-50/30 active:bg-green-50/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="p-2 sm:p-3 bg-green-600 rounded-lg sm:rounded-xl shadow-lg shadow-green-600/20">
                                                <Heart className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="font-bold text-sm sm:text-lg text-slate-800">💪 Physical Attributes</h3>
                                                <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">Fitness and conditioning</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-4">
                                            <div className="text-right">
                                                <div className="text-xl sm:text-2xl font-bold text-green-600">{categoryAverages.physical}</div>
                                                <div className="text-[10px] sm:text-xs text-slate-500">Average</div>
                                            </div>
                                            {expandedSections.physical ? <ChevronUp className="text-slate-400 w-5 h-5" /> : <ChevronDown className="text-slate-400 w-5 h-5" />}
                                        </div>
                                    </button>

                                    {expandedSections.physical && (
                                        <div className="px-4 pb-4 sm:px-6 sm:pb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                                            <SkillSlider label="Stamina" value={formData.stamina} field="stamina" onChange={updateField} icon={<Activity size={14} className="sm:w-4 sm:h-4" />} color="green" />
                                            <SkillSlider label="Physical Fitness" value={formData.physicalFitness} field="physicalFitness" onChange={updateField} icon={<Heart size={14} className="sm:w-4 sm:h-4" />} color="green" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 🧠 Mental Game - Purple Theme */}
                            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/50 to-white backdrop-blur-sm">
                                <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-purple-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => toggleSection('mental')}
                                        className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-purple-50/30 active:bg-purple-50/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="p-2 sm:p-3 bg-purple-600 rounded-lg sm:rounded-xl shadow-lg shadow-purple-600/20">
                                                <Brain className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="font-bold text-sm sm:text-lg text-slate-800">🧠 Mental Game</h3>
                                                <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">Focus and mindset</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-4">
                                            <div className="text-right">
                                                <div className="text-xl sm:text-2xl font-bold text-purple-600">{categoryAverages.mental}</div>
                                                <div className="text-[10px] sm:text-xs text-slate-500">Score</div>
                                            </div>
                                            {expandedSections.mental ? <ChevronUp className="text-slate-400 w-5 h-5" /> : <ChevronDown className="text-slate-400 w-5 h-5" />}
                                        </div>
                                    </button>

                                    {expandedSections.mental && (
                                        <div className="px-4 pb-4 sm:px-6 sm:pb-6">
                                            <SkillSlider label="Mindset & Focus" value={formData.mindset} field="mindset" onChange={updateField} icon={<Brain size={14} className="sm:w-4 sm:h-4" />} color="purple" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Match Statistics */}
                            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/50 to-white p-4 sm:p-6">
                                <div className="absolute top-0 right-0 w-24 sm:w-48 h-24 sm:h-48 bg-amber-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <div className="relative">
                                    <h3 className="font-bold text-sm sm:text-lg text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                                        <TrendingUp className="text-amber-600 w-4 h-4 sm:w-5 sm:h-5" />
                                        Match Statistics
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                                                Matches Played
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.matchesPlayed}
                                                onChange={(e) => updateField('matchesPlayed', parseInt(e.target.value) || 0)}
                                                className="w-full p-3 text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                                                Matches Won
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.matchesWon}
                                                onChange={(e) => updateField('matchesWon', parseInt(e.target.value) || 0)}
                                                className={`w-full p-3 text-base border ${errors.matchesWon ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all bg-white`}
                                            />
                                            {errors.matchesWon && (
                                                <p className="text-red-500 text-xs mt-1">{errors.matchesWon}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Qualitative Feedback */}
                            <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white">
                                <button
                                    type="button"
                                    onClick={() => toggleSection('feedback')}
                                    className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-slate-50 active:bg-slate-100 transition-colors rounded-t-xl sm:rounded-t-2xl"
                                >
                                    <h3 className="font-bold text-sm sm:text-lg text-slate-800">📝 Qualitative Feedback</h3>
                                    {expandedSections.feedback ? <ChevronUp className="text-slate-400 w-5 h-5" /> : <ChevronDown className="text-slate-400 w-5 h-5" />}
                                </button>

                                {expandedSections.feedback && (
                                    <div className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-3 sm:space-y-4 border-t border-slate-100">
                                        <div className="pt-3 sm:pt-4">
                                            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                                                Strengths
                                            </label>
                                            <textarea
                                                value={formData.strengths}
                                                onChange={(e) => updateField('strengths', e.target.value)}
                                                rows={2}
                                                className="w-full p-3 text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                                                placeholder="What are the student's strong points?"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                                                Improvement Areas
                                            </label>
                                            <textarea
                                                value={formData.improvementAreas}
                                                onChange={(e) => updateField('improvementAreas', e.target.value)}
                                                rows={2}
                                                className="w-full p-3 text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                                                placeholder="What areas need improvement?"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                                                Coach Comments
                                            </label>
                                            <textarea
                                                value={formData.coachComments}
                                                onChange={(e) => updateField('coachComments', e.target.value)}
                                                rows={2}
                                                className="w-full p-3 text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                                                placeholder="Additional comments and observations"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                                                Next Assessment Date (Optional)
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.nextAssessmentDate}
                                                onChange={(e) => updateField('nextAssessmentDate', e.target.value)}
                                                className="w-full p-3 text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Bottom spacer for mobile to account for fixed footer */}
                            <div className="h-4 sm:h-0"></div>
                        </form>
                        {/* Sticky Footer Actions */}
                        <div className="flex-shrink-0 bg-white border-t border-slate-100 p-4 sm:p-6 rounded-b-2xl safe-area-bottom">
                            <div className="flex gap-2 sm:gap-3">
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="flex-1 py-3 sm:py-3 px-4 sm:px-6 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 active:bg-slate-100 transition-all text-sm sm:text-base"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    onClick={handleSubmit}
                                    className="flex-1 py-3 sm:py-3 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white font-bold hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                                >
                                    <Save size={18} className="sm:w-5 sm:h-5" />
                                    {initialData ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div >
    );

    if (!mounted) return null;

    return createPortal(modalContent, document.body);
}
