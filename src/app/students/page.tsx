import StudentList from "@/components/students/StudentList";
import { Users } from "lucide-react";

export default function StudentsPage() {
    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 scale-in">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 flex items-center gap-2">
                        Students
                        <Users className="w-6 h-6 sm:w-7 sm:h-7 text-blue-300" />
                    </h2>
                    <p className="text-sm sm:text-base text-white/80 font-medium">Manage your academy students</p>
                </div>
            </div>
            <StudentList />
        </div>
    );
}
