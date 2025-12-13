"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { Student } from "@/lib/db";
import { X, ChevronDown } from "lucide-react";
import { getLocalDateString } from "@/lib/utils";

const generateId = () => `STU-${Math.floor(Math.random() * 10000)}`;

interface StudentFormProps {
    initialData?: Partial<Student>;
    onSubmit: (data: Omit<Student, "id">) => void;
    onCancel: () => void;
}

export default function StudentForm({ initialData, onSubmit, onCancel }: StudentFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<Student>({
        defaultValues: {
            membershipStatus: "Active",
            skillLevel: "Beginner",
            gender: "Male",

            ...initialData,
            dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] as unknown as Date : undefined,
            enrollmentDate: initialData?.enrollmentDate ? new Date(initialData.enrollmentDate).toISOString().split('T')[0] as unknown as Date : getLocalDateString() as unknown as Date,
        },
    });

    const onFormSubmit = (data: Student) => {
        const formattedData = {
            ...data,
            dateOfBirth: new Date(data.dateOfBirth),
            enrollmentDate: new Date(data.enrollmentDate),
            studentId: data.studentId || generateId(),
        };
        onSubmit(formattedData);
    };

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-slate-800">
                        {initialData ? "Edit Student" : "Add New Student"}
                    </h2>
                    <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-slate-900 border-b pb-2">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Full Name *</label>
                                <input
                                    {...register("fullName", { required: "Full name is required" })}
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="John Doe"
                                />
                                {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Date of Birth *</label>
                                <input
                                    type="date"
                                    {...register("dateOfBirth", { required: "Date of birth is required" })}
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                                {errors.dateOfBirth && <p className="text-red-500 text-xs">{errors.dateOfBirth.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Gender *</label>
                                <div className="relative">
                                    <select
                                        {...register("gender")}
                                        className="w-full p-3 pl-4 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer shadow-sm hover:border-slate-300 hover:shadow-md bg-white font-medium text-slate-700"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <ChevronDown size={18} className="text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Contact Number *</label>
                                <input
                                    {...register("contactNumber", { required: "Contact number is required" })}
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="+91 98765 43210"
                                />
                                {errors.contactNumber && <p className="text-red-500 text-xs">{errors.contactNumber.message}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-slate-900 border-b pb-2">Academy Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Batch</label>
                                <input
                                    {...register("batch")}
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="Morning Batch A"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Skill Level</label>
                                <div className="relative">
                                    <select
                                        {...register("skillLevel")}
                                        className="w-full p-3 pl-4 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer shadow-sm hover:border-slate-300 hover:shadow-md bg-white font-medium text-slate-700"
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <ChevronDown size={18} className="text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Status</label>
                                <div className="relative">
                                    <select
                                        {...register("membershipStatus")}
                                        className="w-full p-3 pl-4 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer shadow-sm hover:border-slate-300 hover:shadow-md bg-white font-medium text-slate-700"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <ChevronDown size={18} className="text-slate-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-slate-900 border-b pb-2">Emergency Contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Emergency Contact Name</label>
                                <input
                                    {...register("parentName")}
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="Parent/Guardian Name"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Emergency Phone *</label>
                                <input
                                    {...register("emergencyContact", { required: "Emergency contact is required" })}
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="Emergency Phone"
                                />
                                {errors.emergencyContact && <p className="text-red-500 text-xs">{errors.emergencyContact.message}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
                        >
                            {initialData ? "Update Student" : "Add Student"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
