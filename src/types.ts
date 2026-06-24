export interface Student {
  id: number;
  name: string;
  answers: string[]; // Length 40, values: "A", "B", "C", "D", "E", or ""
}

export interface AppClass {
  id: string; // Unique UUID/Timestamp
  className: string; // Subject / Class Name, e.g. "Bahasa Indonesia / XI-A"
  schoolName: string; // e.g., "SMA Negeri 1 Jakarta"
  passingGrade: number; // e.g. 75
  teacherName: string; // e.g., "Drs. Budi Pradipta"
  examName: string; // e.g., "Penilaian Harian Bersama (PHB)"
  examDate: string; // e.g., "2026-06-22"
  answerKey: string[]; // Length 40
  students: Student[];
}

export interface FormulaReference {
  cell: string;
  title: string;
  desc: string;
  formulaIDN: string;
  formulaUS: string;
}

export interface License {
  id: string;
  email: string;
  token: string;
  status: "active" | "inactive";
  used: boolean;
  expired_at: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  school_name: string;
  created_at: string;
}

export type AuthSession =
  | { type: "none" }
  | { type: "admin"; id: string; email: string; name: string }
  | { type: "user"; id: string; email: string; name: string; school_name: string; token?: string };

