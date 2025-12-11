"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Student } from "@/lib/db";
import { Search, Edit, Trash2, User, Plus } from "lucide-react";
import StudentForm from "./StudentForm";

export default function StudentList() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined);

    // Check for action query parameter to auto-open form
    useEffect(() => {
        if (searchParams.get('action') === 'add') {
            setIsFormOpen(true);
            // Remove the query parameter from URL
            router.replace('/students', { scroll: false });
        }
    }, [searchParams, router]);

    const students = useLiveQuery(
        () => {
            if (searchQuery) {
                return db.students
                    .filter((student) =>
                        student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .toArray();
            }
            return db.students.toArray();
        },
        [searchQuery]
    );

    const handleAddStudent = async (data: Omit<Student, "id">) => {
        try {
            await db.students.add(data as Student);
            setIsFormOpen(false);
        } catch {
            alert("Failed to add student. Please try again.");
        }
    };

    const handleUpdateStudent = async (data: Omit<Student, "id">) => {
        if (!editingStudent?.id) return;
        try {
            await db.students.update(editingStudent.id, data);
            setEditingStudent(undefined);
            setIsFormOpen(false);
        } catch {
            alert("Failed to update student. Please try again.");
        }
    };

    const handleDeleteStudent = async (id: number) => {
        if (confirm("Are you sure you want to delete this student?")) {
            try {
                await db.students.delete(id);
            } catch {
                alert("Failed to delete student. Please try again.");
            }
        }
    };

    const openAddForm = () => {
        setEditingStudent(undefined);
        setIsFormOpen(true);
    };

    const openEditForm = (student: Student) => {
        setEditingStudent(student);
        setIsFormOpen(true);
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm sm:text-base"
                    />
                </div>
                <button
                    onClick={openAddForm}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-3 rounded-xl sm:rounded-2xl font-bold hover:shadow-xl hover:shadow-blue-600/30 transition-all w-full sm:w-auto justify-center"
                >
                    <Plus size={20} />
                    Add Student
                </button>
            </div>

            {isFormOpen && (
                <StudentForm
                    initialData={editingStudent}
                    onSubmit={editingStudent ? handleUpdateStudent : handleAddStudent}
                    onCancel={() => setIsFormOpen(false)}
                />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {students?.map((student) => (
                    <div
                        key={student.id}
                        className="glass p-4 sm:p-5 rounded-2xl hover-lift transition-all"
                    >
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white">
                                    {student.photo ? (
                                        <Image src={student.photo} alt={student.fullName} fill className="rounded-xl object-cover" />
                                    ) : (
                                        <User size={20} className="sm:w-6 sm:h-6" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">{student.fullName}</h3>
                                    <p className="text-xs text-slate-500 font-medium">{student.studentId}</p>
                                </div>
                            </div>
                            <div className={`px-2 py-1 rounded-lg text-xs font-bold ${student.membershipStatus === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {student.membershipStatus}
                            </div>
                        </div>

                        <div className="space-y-1.5 sm:space-y-2 text-sm text-slate-600 mb-4">
                            <div className="flex justify-between">
                                <span className="text-slate-400 text-xs sm:text-sm">Batch</span>
                                <span className="font-medium text-xs sm:text-sm">{student.batch || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400 text-xs sm:text-sm">Level</span>
                                <span className="font-medium text-xs sm:text-sm">{student.skillLevel}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400 text-xs sm:text-sm">Coach</span>
                                <span className="font-medium text-xs sm:text-sm">{student.coachId || '-'}</span>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-3 sm:pt-4 border-t border-slate-100">
                            <button
                                onClick={() => openEditForm(student)}
                                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 flex items-center justify-center gap-2 transition-all text-sm"
                            >
                                <Edit size={16} />
                                Edit
                            </button>
                            <button
                                onClick={() => student.id && handleDeleteStudent(student.id)}
                                className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {students?.length === 0 && (
                    <div className="col-span-full py-12 text-center glass rounded-2xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                            <User size={32} className="text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">No students found</p>
                        <p className="text-slate-400 text-sm mt-1">Add your first student to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
}
