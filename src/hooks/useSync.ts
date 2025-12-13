import { useState } from 'react';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';

export function useSync() {
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSynced, setLastSynced] = useState<Date | null>(null);
    const { user } = useAuth();

    const syncData = async () => {
        if (!user) return;
        setIsSyncing(true);

        try {
            // 1. Sync Students
            const localStudents = await db.students.toArray();
            if (localStudents.length > 0) {
                const { error: studentError } = await supabase
                    .from('students')
                    .upsert(
                        localStudents.map(s => ({
                            coach_id: user.id,
                            student_id: s.studentId,
                            full_name: s.fullName,
                            data: s,
                            updated_at: new Date().toISOString()
                        })),
                        { onConflict: 'student_id' }
                    );
                if (studentError) throw studentError;
            }

            // 2. Sync Attendance
            const localAttendance = await db.attendance.toArray();
            if (localAttendance.length > 0) {
                const { error: attendanceError } = await supabase
                    .from('attendance')
                    .upsert(
                        localAttendance.map(a => ({
                            coach_id: user.id,
                            date: a.date,
                            student_id: a.studentId,
                            status: a.status,
                            data: a,
                            updated_at: new Date().toISOString()
                        })),
                        { onConflict: 'student_id, date' } // Note: This requires a unique constraint on the server if we want true upsert by date
                    );
                if (attendanceError) throw attendanceError;
            }

            // 3. Sync Performance
            const localPerformance = await db.performance.toArray();
            if (localPerformance.length > 0) {
                const { error: performanceError } = await supabase
                    .from('performance')
                    .upsert(
                        localPerformance.map(p => ({
                            coach_id: user.id,
                            student_id: p.studentId,
                            assessment_date: p.assessmentDate,
                            data: p,
                            updated_at: new Date().toISOString()
                        })),
                        { onConflict: 'student_id, assessment_date' }
                    );
                if (performanceError) throw performanceError;
            }

            // 4. Pull from Cloud (Restore/Sync Down)
            // Students
            const { data: cloudStudents, error: pullError1 } = await supabase.from('students').select('data');
            if (pullError1) throw pullError1;
            if (cloudStudents) {
                await db.students.bulkPut(cloudStudents.map(r => r.data));
            }

            // Attendance
            const { data: cloudAttendance, error: pullError2 } = await supabase.from('attendance').select('data');
            if (pullError2) throw pullError2;
            if (cloudAttendance) {
                // Fix dates (JSON strings -> Date objects)
                const formattedAttendance = cloudAttendance.map(r => ({
                    ...r.data,
                    date: new Date(r.data.date)
                }));
                await db.attendance.bulkPut(formattedAttendance);
            }

            // Performance
            const { data: cloudPerformance, error: pullError3 } = await supabase.from('performance').select('data');
            if (pullError3) throw pullError3;
            if (cloudPerformance) {
                // Fix dates
                const formattedPerformance = cloudPerformance.map(r => ({
                    ...r.data,
                    assessmentDate: new Date(r.data.assessmentDate),
                    nextAssessmentDate: r.data.nextAssessmentDate ? new Date(r.data.nextAssessmentDate) : undefined
                }));
                await db.performance.bulkPut(formattedPerformance);
            }

            setLastSynced(new Date());
            return { success: true };
        } catch (error) {
            console.error("Sync failed:", error);
            return { success: false, error };
        } finally {
            setIsSyncing(false);
        }
    };

    return {
        isSyncing,
        lastSynced,
        syncData
    };
}
