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
