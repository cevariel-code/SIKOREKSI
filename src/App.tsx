import React, { useState, useEffect } from "react";
import { 
  BarChart2, Award, Clipboard, Printer, BookOpen, Settings, Sliders, 
  Plus, Trash2, Heart, FolderHeart, Save, Download, Upload, Info,
  BookMarked, HelpCircle, FileSpreadsheet, Layers, Sparkles, Check, ChevronRight, X
} from "lucide-react";

import { AppClass, Student } from "./types";
import { formulaReferences, stepByStepGuides, sampleKeys, initialStudentsDraft } from "./helpData";

// Extracted Subcomponents
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import AnswerKeyEditor from "./components/AnswerKeyEditor";
import StudentList from "./components/StudentList";
import MatrixGrid from "./components/MatrixGrid";
import PrintableReport from "./components/PrintableReport";

const LOCAL_STORAGE_KEY = "abs_analisis_otomatis_multiclass_db";

export default function App() {
  const [classes, setClasses] = useState<AppClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "student_list" | "kunci_jawaban" | "matrix" | "print_report" | "excel_blueprint">("dashboard");
  const [showNewClassModal, setShowNewClassModal] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // New class form fields
  const [newClassName, setNewClassName] = useState("");
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newPassingGrade, setNewPassingGrade] = useState(75);
  const [newTeacherName, setNewTeacherName] = useState("");
  const [newExamName, setNewExamName] = useState("");

  // INITIAL STATE SEEDING
  useEffect(() => {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as AppClass[];
        if (parsed && parsed.length > 0) {
          setClasses(parsed);
          setSelectedClassId(parsed[0].id);
          return;
        }
      }
    } catch (e) {
      console.error("Local storage retrieval failed", e);
    }

    // Default Seed Class representing a real Indonesian School Examination
    const seedClass: AppClass = {
      id: "seed-class-pas-xi-a",
      className: "Bahasa Indonesia / XI-A",
      schoolName: "SMA Negeri 1 Jakarta",
      passingGrade: 75,
      teacherName: "Drs. Siswanto, M.Pd.",
      examName: "Penilaian Akhir Semester (PAS) Ganjil",
      examDate: new Date().toISOString().split("T")[0],
      answerKey: [...sampleKeys],
      students: initialStudentsDraft.filter(s => s.name.trim() !== "").map(s => ({
        id: s.id,
        name: s.name,
        answers: [...s.answers]
      }))
    };

    const initialClassesList = [seedClass];
    setClasses(initialClassesList);
    setSelectedClassId(seedClass.id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialClassesList));
  }, []);

  // Save changes to localStorage on state changes
  const saveClassesToLocalStorage = (nextClasses: AppClass[]) => {
    setClasses(nextClasses);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextClasses));
  };

  // Find active classroom
  const activeClass = classes.find(c => c.id === selectedClassId) || classes[0];

  if (!activeClass) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 font-sans text-xs">
        <div className="text-center space-y-2">
          <p className="font-extrabold text-slate-700 uppercase tracking-widest text-[11px]">Memuat Basis Data...</p>
          <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-blue-600 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // CORE COMPUTATIONS (Matched accurately with native excel parameters)
  const getStudentCorrectCount = (student: Student): number => {
    let count = 0;
    for (let i = 0; i < 40; i++) {
      const ans = student.answers[i] || "";
      const correctKey = activeClass.answerKey[i] || "";
      if (ans === correctKey && correctKey !== "") {
        count++;
      }
    }
    return count;
  };

  const getStudentScore = (student: Student): number => {
    const correct = getStudentCorrectCount(student);
    return (correct / 40) * 100;
  };

  // HANDLERS FOR METADATA EDITS
  const updateMetadataField = (field: keyof Omit<AppClass, "id" | "answerKey" | "students">, value: any) => {
    const nextClasses = classes.map(c => {
      if (c.id === selectedClassId) {
        return { ...c, [field]: value };
      }
      return c;
    });
    saveClassesToLocalStorage(nextClasses);
  };

  // STATE MANIPULATORS FOR ANSWER KEYS
  const handleUpdateAnswerKey = (nextKey: string[]) => {
    const nextClasses = classes.map(c => {
      if (c.id === selectedClassId) {
        return { ...c, answerKey: nextKey };
      }
      return c;
    });
    saveClassesToLocalStorage(nextClasses);
  };

  // STATE MANIPULATORS FOR STUDENTS
  const handleAddStudent = (name: string) => {
    const newStudentId = Date.now() + Math.floor(Math.random() * 1000);
    const newStudent: Student = {
      id: newStudentId,
      name,
      answers: Array(40).fill("")
    };

    const nextClasses = classes.map(c => {
      if (c.id === selectedClassId) {
        return { ...c, students: [...c.students, newStudent] };
      }
      return c;
    });
    saveClassesToLocalStorage(nextClasses);
  };

  const handleRemoveStudent = (id: number) => {
    const nextClasses = classes.map(c => {
      if (c.id === selectedClassId) {
        return { ...c, students: c.students.filter(s => s.id !== id) };
      }
      return c;
    });
    saveClassesToLocalStorage(nextClasses);
  };

  const handleUpdateStudentAnswers = (id: number, answers: string[]) => {
    const nextClasses = classes.map(c => {
      if (c.id === selectedClassId) {
        const nextStudents = c.students.map(s => s.id === id ? { ...s, answers } : s);
        return { ...c, students: nextStudents };
      }
      return c;
    });
    saveClassesToLocalStorage(nextClasses);
  };

  const handleUpdateStudentName = (id: number, name: string) => {
    const nextClasses = classes.map(c => {
      if (c.id === selectedClassId) {
        const nextStudents = c.students.map(s => s.id === id ? { ...s, name } : s);
        return { ...c, students: nextStudents };
      }
      return c;
    });
    saveClassesToLocalStorage(nextClasses);
  };

  const handleBulkImport = (namesText: string) => {
    const parsedNames = namesText
      .split("\n")
      .map(line => line.trim())
      .filter(line => line !== "");

    const newStudents: Student[] = parsedNames.map((name, idx) => ({
      id: Date.now() + idx + Math.floor(Math.random() * 100),
      name,
      answers: Array(40).fill("")
    }));

    const nextClasses = classes.map(c => {
      if (c.id === selectedClassId) {
        return { ...c, students: [...c.students, ...newStudents] };
      }
      return c;
    });
    saveClassesToLocalStorage(nextClasses);
  };

  // CLASS DATABASE LOGICS
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClassName.trim() === "") return;

    const newClass: AppClass = {
      id: "class-id-" + Date.now(),
      className: newClassName,
      schoolName: newSchoolName || "SMA Negeri",
      passingGrade: newPassingGrade,
      teacherName: newTeacherName || "Guru Pengampu",
      examName: newExamName || "Penilaian Harian Mandiri",
      examDate: new Date().toISOString().split("T")[0],
      answerKey: Array(40).fill(""),
      students: []
    };

    const nextClasses = [...classes, newClass];
    saveClassesToLocalStorage(nextClasses);
    setSelectedClassId(newClass.id);
    setShowNewClassModal(false);

    // Initial resets
    setNewClassName("");
    setNewSchoolName("");
    setNewTeacherName("");
    setNewExamName("");
    setActiveTab("student_list");
  };

  const handleDeleteClass = (classIdToDelete: string) => {
    if (classes.length <= 1) {
      alert("Operasi ditolak. Anda harus menyisakan minimal 1 daftar kelas di aplikasi.");
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus kelas ini secara permanen dari basis data lokal? Tindakan ini tidak dapat dibatalkan.`)) {
      const remainingClasses = classes.filter(c => c.id !== classIdToDelete);
      setClasses(remainingClasses);
      setSelectedClassId(remainingClasses[0].id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remainingClasses));
    }
  };

  // BACKUP EXPORT & IMPORT UTILITY
  const handleExportBackup = () => {
    try {
      const serialized = JSON.stringify(classes, null, 2);
      const blob = new Blob([serialized], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `koreksi_otomatis_40_soal_backup_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Gagal melakukan ekspor berkas cadangan.");
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string) as AppClass[];
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
          saveClassesToLocalStorage(parsed);
          setSelectedClassId(parsed[0].id);
          alert(`Berhasil mengimpor cadangan! ${parsed.length} kelas berhasil dimuat.`);
        } else {
          alert("Format berkas cadangan tidak valid.");
        }
      } catch (err) {
        alert("Gagal memproses berkas JSON cadangan.");
      }
    };
    reader.readAsText(file);
  };

  // Excel Blueprint copy clipboard helper
  const handleCopyFormula = (formula: string, cell: string) => {
    navigator.clipboard.writeText(formula);
    setCopyStatus(cell);
    setTimeout(() => setCopyStatus(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col font-sans relative">
      
      {/* 1. Header Toolbar */}
      <header className="no-print bg-slate-900 border-b border-black text-white py-3 px-4 md:px-6 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-md z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center font-black text-sm text-white shadow-inner">
            PG
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest text-white leading-tight uppercase flex items-center gap-1.5">
              Koreksi Otomatis & Analisis Butir Soal 
              <span className="text-[10px] bg-blue-600/60 font-mono font-bold tracking-normal px-1.5 rounded text-blue-200 lowercase">v2.0-siap-pakai</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-sans leading-none pt-0.5">Penilaian Multi-Kelas & Diagnostik Pembelajaran Guru Mandiri</p>
          </div>
        </div>

        {/* Action Backup row */}
        <div className="flex items-center gap-2 text-xs">
          <label className="flex items-center gap-1 bg-slate-800 border border-slate-700 font-bold px-2.5 py-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-[11px]">
            <Upload className="w-3.5 h-3.5" />
            <span>Unggah Backup (.json)</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1 bg-blue-700 border border-blue-650 font-bold px-2.5 py-1.5 rounded hover:bg-blue-800 text-white transition-all text-[11px]"
          >
            <Download className="w-3.5 h-3.5" />
            cadangkan Data (.json)
          </button>
        </div>
      </header>

      {/* 2. Main app dashboard frame side-by-side */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        
        {/* LEFT SIDEBAR CONTROLS */}
        <aside className="no-print w-full lg:w-76 xl:w-80 bg-slate-850 border-r border-slate-900 text-slate-300 p-4 shrink-0 flex flex-col justify-between">
          
          <div className="space-y-6">
            
            {/* Class selection dropdown */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">PILIH KELAS / UJIAN</label>
                <button
                  onClick={() => setShowNewClassModal(true)}
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold text-[11px]"
                  title="Klik untuk membuat kelas / ujian penugasan baru"
                >
                  <Plus className="w-3.5 h-3.5" /> Buat Baru
                </button>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full p-2 border border-slate-700 bg-slate-900 rounded focus:border-blue-500 font-extrabold text-xs text-white"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.className}
                    </option>
                  ))}
                </select>
                <button
                  disabled={classes.length <= 1}
                  onClick={() => handleDeleteClass(selectedClassId)}
                  className="p-1.5 bg-rose-950/40 border border-rose-900/40 text-rose-300 hover:text-rose-200 rounded disabled:opacity-30 transition-colors"
                  title="Hapus Kelas Ini"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="h-px bg-slate-800" />

            {/* Config metadata fields card */}
            <div className="space-y-3.5 bg-slate-900/40 border border-slate-800/40 rounded p-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">IDENTITAS ASESMEN</span>
              
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-slate-450 uppercase">Nama Satuan Sekolah</label>
                <input
                  type="text"
                  value={activeClass.schoolName}
                  onChange={(e) => updateMetadataField("schoolName", e.target.value)}
                  className="w-full p-1.5 border border-slate-700 bg-slate-900 rounded focus:border-blue-500 text-xs font-semibold text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-slate-450 uppercase">Mata Pelajaran / Kelas</label>
                <input
                  type="text"
                  value={activeClass.className}
                  onChange={(e) => updateMetadataField("className", e.target.value)}
                  className="w-full p-1.5 border border-slate-700 bg-slate-900 rounded focus:border-blue-500 text-xs font-semibold text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-450 uppercase">KKTP / Kelulusan</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={activeClass.passingGrade}
                    onChange={(e) => updateMetadataField("passingGrade", Number(e.target.value))}
                    className="w-full p-1.5 border border-slate-700 bg-slate-900 rounded focus:border-blue-500 text-xs font-bold font-mono text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-450 uppercase">Tanggal Ujian</label>
                  <input
                    type="date"
                    value={activeClass.examDate || ""}
                    onChange={(e) => updateMetadataField("examDate", e.target.value)}
                    className="w-full p-1.5 border border-slate-700 bg-slate-900 rounded focus:border-blue-500 text-xs font-bold text-white font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-slate-450 uppercase">Guru Penilai (Mata Pelajaran)</label>
                <input
                  type="text"
                  value={activeClass.teacherName || ""}
                  onChange={(e) => updateMetadataField("teacherName", e.target.value)}
                  className="w-full p-1.5 border border-slate-700 bg-slate-900 rounded focus:border-blue-500 text-xs font-semibold text-white"
                  placeholder="Drs. Siswanto, M.Pd."
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-slate-450 uppercase">Nama Ujian / Ulangan</label>
                <input
                  type="text"
                  value={activeClass.examName || ""}
                  onChange={(e) => updateMetadataField("examName", e.target.value)}
                  className="w-full p-1.5 border border-slate-700 bg-slate-900 rounded focus:border-blue-500 text-xs font-semibold text-white"
                  placeholder="Ulangan Ganjil"
                />
              </div>

            </div>

            {/* App Navigations menu links vertical */}
            <div className="space-y-1">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">MENU NAVIGASI</span>
              
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded transition-colors ${
                  activeTab === "dashboard"
                    ? "bg-blue-650 text-white font-extrabold"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <BarChart2 className="w-3.5 h-3.5" /> Dasbor Analisis Butir
                </span>
                <ChevronRight className="w-3 h-3 opacity-55" />
              </button>

              <button
                onClick={() => setActiveTab("student_list")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded transition-colors ${
                  activeTab === "student_list"
                    ? "bg-blue-650 text-white font-extrabold"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5" /> Isi Jawaban Siswa
                </span>
                <span className="text-[10px] bg-slate-800 px-1.5 rounded font-mono font-bold">
                  {activeClass.students.filter(s => s.name.trim() !== "").length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("kunci_jawaban")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded transition-colors ${
                  activeTab === "kunci_jawaban"
                    ? "bg-blue-650 text-white font-extrabold"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Clipboard className="w-3.5 h-3.5" /> Kunci Jawaban
                </span>
                <span className="text-[10px] bg-slate-800 px-1.5 rounded font-mono font-bold">
                  {activeClass.answerKey.filter(k => k !== "").length}/40
                </span>
              </button>

              <button
                onClick={() => setActiveTab("matrix")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded transition-colors ${
                  activeTab === "matrix"
                    ? "bg-blue-650 text-white font-extrabold"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5" /> Grid Matriks Lengkap
                </span>
                <ChevronRight className="w-3 h-3 opacity-55" />
              </button>

              <button
                onClick={() => setActiveTab("print_report")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded transition-colors ${
                  activeTab === "print_report"
                    ? "bg-blue-650 text-white font-extrabold"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Printer className="w-3.5 h-3.5" /> Laporan Kelompok (Cetak)
                </span>
                <ChevronRight className="w-3 h-3 opacity-55" />
              </button>

              <button
                onClick={() => setActiveTab("excel_blueprint")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded transition-colors ${
                  activeTab === "excel_blueprint"
                    ? "bg-blue-650 text-white font-extrabold"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Cetak Biru Excel / Rumus
                </span>
                <ChevronRight className="w-3 h-3 opacity-55" />
              </button>

            </div>

          </div>

          <div className="pt-8 text-[10px] text-slate-500 font-medium">
            Dikembangkan untuk membantu evaluasi belajar siswa Indonesia secara mandiri dan cepat. 100% aman beroperasi langsung di browser Anda.
          </div>
        </aside>

        {/* 3. CENTER DYNAMIC WRAPPER CONTENT SCREEN */}
        <main className="flex-1 bg-white p-4 md:p-6 overflow-y-auto max-w-full">
          
          <div className="space-y-6">
            
            {/* Class overview metrics ribbon */}
            <div className="no-print bg-slate-50 border border-slate-200 p-4 rounded-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <span className="text-[10px] font-black font-mono text-blue-700 uppercase tracking-widest block">KELAS YANG SEDANG DIAKTIFKAN</span>
                <h2 className="text-base font-black text-slate-900 uppercase">
                  Mata Pelajaran: {activeClass.className}
                </h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Satuan Instansi: <strong>{activeClass.schoolName}</strong> | Guru: <strong>{activeClass.teacherName || "-"}</strong>
                </p>
              </div>

              <div className="flex flex-wrap gap-4 text-xs font-mono">
                <div className="px-3 py-2 bg-slate-100 border border-slate-200 text-slate-705 text-center rounded">
                  <div className="text-[9px] font-black text-slate-400 uppercase font-sans">Siswa Terdaftar</div>
                  <div className="text-sm font-black text-slate-800">{activeClass.students.filter(s => s.name.trim() !== "").length} Siswa</div>
                </div>
                <div className="px-3 py-2 bg-slate-100 border border-slate-200 text-slate-705 text-center rounded">
                  <div className="text-[9px] font-black text-slate-400 uppercase font-sans">Kunci Tersetting</div>
                  <div className="text-sm font-black text-slate-800">{activeClass.answerKey.filter(k => k !== "").length} / 40</div>
                </div>
              </div>
            </div>

            {/* TAB RENDERING SWITCHER */}
            <div>
              {activeTab === "dashboard" && (
                <AnalyticsDashboard
                  activeClass={activeClass}
                  getStudentScore={getStudentScore}
                  getStudentCorrectCount={getStudentCorrectCount}
                />
              )}

              {activeTab === "student_list" && (
                <StudentList
                  activeClass={activeClass}
                  onAddStudent={handleAddStudent}
                  onRemoveStudent={handleRemoveStudent}
                  onUpdateStudentAnswers={handleUpdateStudentAnswers}
                  onUpdateStudentName={handleUpdateStudentName}
                  onBulkImport={handleBulkImport}
                  getStudentScore={getStudentScore}
                  getStudentCorrectCount={getStudentCorrectCount}
                />
              )}

              {activeTab === "kunci_jawaban" && (
                <AnswerKeyEditor
                  activeClass={activeClass}
                  onUpdateAnswerKey={handleUpdateAnswerKey}
                />
              )}

              {activeTab === "matrix" && (
                <MatrixGrid
                  activeClass={activeClass}
                  getStudentScore={getStudentScore}
                />
              )}

              {activeTab === "print_report" && (
                <PrintableReport
                  activeClass={activeClass}
                  getStudentScore={getStudentScore}
                />
              )}

              {activeTab === "excel_blueprint" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-black tracking-wide uppercase text-slate-850 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 animate-pulse" />
                      Pedoman Rumus excel & Google Sheets
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Salin rumus-rumus bawaan berkinerja tinggi berikut langsung ke aplikasi spreadsheet Anda (Excel / Google Sheets) jika Anda ingin mendesain buku kerja cetak mandiri.
                    </p>
                  </div>

                  {/* Formula Copier list */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formulaReferences.map((ref, idx) => (
                      <div key={idx} className="border border-slate-250 bg-white p-3 rounded flex flex-col justify-between text-xs space-y-2">
                        <div>
                          <div className="flex justify-between items-center bg-slate-50 p-1.5 border border-slate-200 rounded">
                            <span className="font-extrabold text-blue-800">Target Sel: {ref.cell}</span>
                            <span className="text-[10px] uppercase font-bold text-slate-500">{ref.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{ref.desc}</p>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-slate-100">
                          <div>
                            <span className="text-[9px] font-black text-slate-400 block tracking-wider uppercase">RUMUS BAHASA INDONESIA:</span>
                            <div className="flex gap-2">
                              <code className="text-[10.5px] font-mono text-emerald-700 bg-emerald-50/20 px-2 py-1 rounded border border-emerald-200/50 flex-1 break-all select-all block">
                                {ref.formulaIDN}
                              </code>
                              <button
                                onClick={() => handleCopyFormula(ref.formulaIDN, ref.cell + "_idn")}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors text-[10px] font-bold"
                              >
                                {copyStatus === ref.cell + "_idn" ? "Tersalin!" : "Salin"}
                              </button>
                            </div>
                          </div>
                          <div>
                            <span className="text-[9px] font-black text-slate-400 block tracking-wider uppercase">RUMUS BAHASA INGGRIS (US):</span>
                            <div className="flex gap-2">
                              <code className="text-[10.5px] font-mono text-blue-750 bg-blue-50/20 px-2 py-1 rounded border border-blue-200/50 flex-1 break-all select-all block">
                                {ref.formulaUS}
                              </code>
                              <button
                                onClick={() => handleCopyFormula(ref.formulaUS, ref.cell + "_us")}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors text-[10px] font-bold"
                              >
                                {copyStatus === ref.cell + "_us" ? "Tersalin!" : "Salin"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Formatting Guides */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-[#f0f9ff] border border-blue-250 p-4 rounded text-xs space-y-2">
                      <h4 className="font-black text-blue-800 uppercase text-[10.5px] tracking-wide flex items-center gap-1.5 border-b border-blue-150 pb-1.5">
                        <Info className="w-4 h-4 text-blue-600" />
                        Panduan Pewarnaan Kondisional (Conditional Formatting)
                      </h4>
                      <div className="space-y-2.5 max-h-76 overflow-y-auto pr-1">
                        {stepByStepGuides.conditionalFormatting.map((step, sIdx) => (
                          <div key={sIdx} className="space-y-0.5">
                            <span className="font-bold text-blue-900 block">{step.title}</span>
                            <span className="text-[11px] text-slate-600 font-sans block leading-normal">{step.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#fffbeb] border border-amber-250 p-4 rounded text-xs space-y-2">
                      <h4 className="font-black text-amber-800 uppercase text-[10.5px] tracking-wide flex items-center gap-1.5 border-b border-amber-150 pb-1.5">
                        <Info className="w-4 h-4 text-amber-600" />
                        Panduan Penguncian Lembar Kerja (Protection)
                      </h4>
                      <div className="space-y-2.5 max-h-76 overflow-y-auto pr-1">
                        {stepByStepGuides.sheetProtection.map((step, sIdx) => (
                          <div key={sIdx} className="space-y-0.5">
                            <span className="font-bold text-amber-900 block">{step.title}</span>
                            <span className="text-[11px] text-slate-650 font-sans block leading-normal">{step.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>

        </main>

      </div>

      {/* CREATE NEW CLASS POPUP MODAL */}
      {showNewClassModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreateClass} className="bg-white rounded border border-slate-300 max-w-sm w-full p-4 md:p-5 space-y-4 shadow-xl text-xs font-sans">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-xs text-slate-900 uppercase">Buat Kelas / Ujian Baru</h3>
              <button 
                type="button" 
                onClick={() => setShowNewClassModal(false)} 
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-medium">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Mata Pelajaran & Kelas *</label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Contoh: Matematika / XI-B"
                  className="w-full text-xs p-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Nama Sekolah</label>
                <input
                  type="text"
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  placeholder="Contoh: SMA Negeri 1 Jakarta"
                  className="w-full text-xs p-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">KKTP / Passing Grade</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newPassingGrade}
                    onChange={(e) => setNewPassingGrade(Number(e.target.value))}
                    className="w-full text-xs p-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Penilai (Nama Guru)</label>
                  <input
                    type="text"
                    value={newTeacherName}
                    onChange={(e) => setNewTeacherName(e.target.value)}
                    placeholder="Drs. Siswanto, M.Pd."
                    className="w-full text-xs p-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Nama Asesmen / Ujian</label>
                <input
                  type="text"
                  value={newExamName}
                  onChange={(e) => setNewExamName(e.target.value)}
                  placeholder="Contoh: Ulangan Ganjil"
                  className="w-full text-xs p-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 text-xs font-bold">
              <button
                type="button"
                onClick={() => setShowNewClassModal(false)}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded transition-colors"
              >
                Tambahkan Kelas
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
