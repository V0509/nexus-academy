"use client";

import React from "react";
import { LucideIcon, Plus, FileText, Users, TrendingUp, ClipboardCheck } from "lucide-react";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
    variant?: "default" | "subtle" | "glass";
}

export default function EmptyState({
    icon: Icon = FileText,
    title,
    description,
    actionLabel,
    onAction,
    secondaryActionLabel,
    onSecondaryAction,
    variant = "default",
}: EmptyStateProps) {
    const styles = {
        default: {
            container: "bg-white rounded-2xl border border-slate-100 border-dashed",
            iconBg: "bg-gradient-to-br from-slate-100 to-slate-200",
            iconColor: "text-slate-400",
            title: "text-slate-700",
            description: "text-slate-500",
            secondaryButton: "border border-slate-200 text-slate-700 hover:bg-slate-50"
        },
        subtle: {
            container: "bg-transparent",
            iconBg: "bg-gradient-to-br from-slate-100 to-slate-200",
            iconColor: "text-slate-400",
            title: "text-slate-700",
            description: "text-slate-500",
            secondaryButton: "border border-slate-200 text-slate-700 hover:bg-slate-50"
        },
        glass: {
            container: "bg-white/10 backdrop-blur-md rounded-2xl border border-white/20",
            iconBg: "bg-white/20 backdrop-blur-md",
            iconColor: "text-white",
            title: "text-white",
            description: "text-white/80",
            secondaryButton: "border border-white/20 text-white hover:bg-white/10"
        }
    }[variant];

    return (
        <div className={`${styles.container} py-12 px-6 text-center`}>
            <div className={`w-16 h-16 mx-auto mb-4 ${styles.iconBg} rounded-2xl flex items-center justify-center`}>
                <Icon size={32} className={styles.iconColor} />
            </div>

            <h3 className={`text-lg font-semibold ${styles.title} mb-2`}>
                {title}
            </h3>

            <p className={`text-sm ${styles.description} max-w-sm mx-auto mb-6`}>
                {description}
            </p>

            {(actionLabel || secondaryActionLabel) && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    {actionLabel && onAction && (
                        <button
                            onClick={onAction}
                            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-600/30 transition-all min-h-[48px]"
                        >
                            <Plus size={18} />
                            {actionLabel}
                        </button>
                    )}

                    {secondaryActionLabel && onSecondaryAction && (
                        <button
                            onClick={onSecondaryAction}
                            className={`inline-flex items-center gap-2 px-5 py-3 font-semibold rounded-xl transition-all min-h-[48px] ${styles.secondaryButton}`}
                        >
                            {secondaryActionLabel}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export function NoStudentsEmpty({ onAddStudent }: { onAddStudent: () => void }) {
    return (
        <EmptyState
            icon={Users}
            title="No students yet"
            description="Start building your academy by adding your first student. You'll be able to track their attendance and performance."
            actionLabel="Add Your First Student"
            onAction={onAddStudent}
        />
    );
}

export function NoAssessmentsEmpty({ onAddAssessment }: { onAddAssessment: () => void }) {
    return (
        <EmptyState
            icon={TrendingUp}
            title="No assessments yet"
            description="Create your first performance assessment to start tracking student progress and identifying areas for improvement."
            actionLabel="Create First Assessment"
            onAction={onAddAssessment}
        />
    );
}

export function NoAttendanceEmpty() {
    return (
        <EmptyState
            icon={ClipboardCheck}
            title="No attendance records"
            description="Select a date and start marking attendance for your students. Track daily attendance to monitor engagement."
        />
    );
}

export function NoSearchResultsEmpty({ query, onClear }: { query: string; onClear: () => void }) {
    return (
        <EmptyState
            icon={FileText}
            title="No results found"
            description={`We couldn't find anything matching "${query}". Try adjusting your search or filters.`}
            actionLabel="Clear Search"
            onAction={onClear}
            variant="glass"
        />
    );
}

export function NoStudentDataEmpty({ studentName }: { studentName: string }) {
    return (
        <EmptyState
            icon={TrendingUp}
            title="No data for this student"
            description={`${studentName} doesn't have any performance assessments yet. Add an assessment to start tracking their progress.`}
            variant="glass"
        />
    );
}
