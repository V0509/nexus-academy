import Dexie, { Table } from 'dexie';

export interface Student {
  id?: number;
  studentId: string;
  fullName: string;
  dateOfBirth: Date;
  gender: 'Male' | 'Female' | 'Other';
  photo?: string;
  contactNumber: string;
  email?: string;
  emergencyContact: string;
  enrollmentDate: Date;
  batch: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  coachId: string;
  membershipStatus: 'Active' | 'Inactive';
  address?: string;
  medicalNotes?: string;
  parentName?: string;
  parentContact?: string;
}

export interface AttendanceRecord {
  id?: number;
  date: Date;
  studentId: string;
  status: 'Present' | 'Absent' | 'Late' | 'On Leave';
  session: string;
  batchId: string;
  coachId: string;
  notes?: string;
}

export interface PerformanceRecord {
  id?: number;
  studentId: string;
  assessmentDate: Date;
  footwork: number;
  serveQuality: number;
  strokeQuality: number;
  strokeConsistency: number;
  smashPower: number;
  chopsDropShots: number;
  defenseSkills: number;
  courtCoverage: number;
  stamina: number;
  physicalFitness: number;
  mindset: number;
  matchesPlayed: number;
  matchesWon: number;
  improvementAreas: string;
  strengths: string;
  coachComments: string;
  nextAssessmentDate?: Date;
}

export class BadmintonDatabase extends Dexie {
  students!: Table<Student>;
  attendance!: Table<AttendanceRecord>;
  performance!: Table<PerformanceRecord>;

  constructor() {
    super('BadmintonAcademyDB');
    this.version(2).stores({
      students: '++id, studentId, fullName, batch, coachId, membershipStatus',
      attendance: '++id, date, studentId, batchId, coachId, status',
      performance: '++id, studentId, assessmentDate'
    });
  }
}

export const db = new BadmintonDatabase();
