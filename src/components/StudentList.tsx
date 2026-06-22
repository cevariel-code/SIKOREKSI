import React, { useState, useRef, useEffect } from "react";
import { 
  Users, UserPlus, Trash2, Edit3, Check, X, Clipboard, ArrowRight, Sparkles, AlertCircle, HelpCircle, ChevronLeft, ChevronRight 
} from "lucide-react";
import { AppClass, Student } from "../types";

interface StudentListProps {
  activeClass: AppClass;
  onAddStudent: (name: string) => void;
  onRemoveStudent: (id: number) => void;
  onUpdateStudentAnswers: (id: number, answers: string[]) => void;
  onUpdateStudentName: (id: number, name: string) => void;
  onBulkImport: (namesText: string) => void;
  getStudentScore: (student: Student) => number;
  getStudentCorrectCount: (student: Student) => number;
}

export default function StudentList({
  activeClass,
  onAddStudent,
  onRemoveStudent,
  onUpdateStudentAnswers,
  onUpdateStudentName,
  onBulkImport,
  getStudentScore,
  getStudentCorrectCount
}: StudentListProps) {
  const [newStudentName, setNewStudentName] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [activeEditorStudent, setActiveEditorStudent] = useState<Student | null>(null);
  const [editAnswers, setEditAnswers] = useState<string[]>([]);
  const [activeQIndex, setActiveQIndex] = useState(0);
  const [bulkAnswersString, setBulkAnswersString] = useState("");
  const [feedback, setFeedback] = useState("");

  const activeStudents = activeClass.students.filter(s => s.name.trim() !== "");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudentName.trim() !== "") {
      onAddStudent(newStudentName.trim());
      setNewStudentName("");
    }
  };

  const handleOpenBulk = () => {
    setBulkText("");
    setShowBulkModal(true);
  };

  const handleExecuteBulk = () => {
    if (bulkText.trim() !== "") {
      onBulkImport(bulkText);
      setShowBulkModal(false);
      setBulkText("");
    }
  };

  // Student answer modal editor setups
  const handleOpenEditor = (student: Student) => {
    setActiveEditorStudent(student);
    setEditAnswers([...student.answers]);
    setActiveQIndex(0);
    setBulkAnswersString(student.answers.join(""));
    setFeedback("");
  };

  const handleSaveAnswers = () => {
    if (activeEditorStudent) {
      onUpdateStudentAnswers(activeEditorStudent.id, editAnswers);
      setActiveEditorStudent(null);
    }
  };

  const handleSingleAnswer = (qIdx: number, letter: string) => {
    const nextAnswers = [...editAnswers];
    nextAnswers[qIdx] = letter;
    setEditAnswers(nextAnswers);
    setBulkAnswersString(nextAnswers.join(""));
    
    // Auto advance if there is a next question
    if (qIdx < 39) {
      setActiveQIndex(qIdx + 1);
    }
  };

  const handleApplyAnswersString = () => {
    const clean = bulkAnswersString.toUpperCase().replace(/[^ABCDE]/g, "");
    const finalAnswers = Array(40).fill("");
    for (let i = 0; i < 40; i++) {
      if (i < clean.length) {
        finalAnswers[i] = clean[i];
      }
    }
    setEditAnswers(finalAnswers);
    setFeedback(`Berhasil mengimpor ${clean.length} jawaban ke kotak.`);
  };

  // Keyboard listening for key entry
  useEffect(() => {
    if (!activeEditorStudent) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (e.target instanceof HTMLInputElement && e.target.type === "text" && !e.target.dataset.capture) {
        return; // ignore in inputs (except answer copy strings)
      }

      if (["A", "B", "C", "D", "E"].includes(key)) {
        e.preventDefault();
        handleSingleAnswer(activeQIndex, key);
      } else if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        const nextAnswers = [...editAnswers];
        nextAnswers[activeQIndex] = "";
        setEditAnswers(nextAnswers);
        setBulkAnswersString(nextAnswers.join(""));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActiveQIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setActiveQIndex(prev => Math.min(39, prev + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeEditorStudent, activeQIndex, editAnswers]);

  return (
    <div className="space-y-4 font-sans">
      
      {/* Dynamic Controllers row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        {/* Simple Add Form */}
        <form onSubmit={handleAdd} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            required
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            placeholder="Ketik Nama Lengkap Murid..."
            className="px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-medium flex-1 md:w-72"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded shadow-2xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tambah</span>
          </button>
        </form>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={handleOpenBulk}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#f8fafc] text-slate-700 rounded border border-slate-300 hover:bg-slate-150 transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
            Impor Massal Nama
          </button>
        </div>
      </div>

      {/* Grid Students List table */}
      <div className="bg-white border border-slate-300 rounded overflow-hidden">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-[#f8fafc] border-b border-slate-300 text-slate-600">
            <tr>
              <th className="w-12 py-2.5 px-3 font-black text-center border-r border-slate-200">No</th>
              <th className="py-2.5 px-4 font-black border-r border-slate-200">Nama Siswa</th>
              <th className="w-24 py-2.5 px-2 font-black border-r border-slate-200 text-center">Jml Benar</th>
              <th className="w-24 py-2.5 px-2 font-black border-r border-slate-200 text-center">Nilai Ujian</th>
              <th className="w-28 py-2.5 px-2 font-black border-r border-slate-200 text-center">Status</th>
              <th className="w-32 py-2.5 px-3 font-black text-center">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {activeStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 italic font-sans">
                  Belum ada siswa di kelas. Masukkan satu nama di formulir di atas atau gunakan tombol "Impor Massal Nama".
                </td>
              </tr>
            ) : (
              activeStudents.map((st, idx) => {
                const correct = getStudentCorrectCount(st);
                const score = getStudentScore(st);
                const isTuntas = score >= activeClass.passingGrade;
                
                return (
                  <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 border-r border-slate-150 text-center font-mono text-slate-500 font-bold">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-4 border-r border-slate-150 font-sans font-bold text-slate-800">
                      <input
                        type="text"
                        value={st.name}
                        onChange={(e) => onUpdateStudentName(st.id, e.target.value)}
                        className="w-full bg-transparent hover:bg-slate-100 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1.5 py-0.5 border-none font-bold text-slate-800"
                      />
                    </td>
                    <td className="py-2.5 px-2 border-r border-slate-150 text-center font-mono font-bold text-slate-700">
                      {correct} / 40
                    </td>
                    <td className={`py-2.5 px-2 border-r border-slate-150 text-center font-mono font-black text-[13px] ${
                      isTuntas ? "text-emerald-700" : "text-rose-700"
                    }`}>
                      {score.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-2 border-r border-slate-150 text-center font-sans font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wide border ${
                        isTuntas 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-250" 
                          : "bg-rose-50 text-rose-700 border-rose-250"
                      }`}>
                        {isTuntas ? "TUNTAS" : "REMEDIAL"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenEditor(st)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Isi Jawaban
                      </button>
                      <button
                        onClick={() => {
                          if(confirm(`Hapus data ${st.name}?`)) {
                            onRemoveStudent(st.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-red-700 transition-colors hover:bg-red-50 rounded"
                        title="Hapus Siswa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* BULK NAMES MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded border border-slate-300 max-w-lg w-full p-4 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-xs text-slate-900 uppercase">Impor Massal Nama Murid</h3>
              <button onClick={() => setShowBulkModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-xs text-slate-500 leading-normal font-sans">
              Tempel atau ketikkan daftar nama siswa Anda di bawah. Pisahkan satu nama per baris (tekan Enter). Kolom kosong akan otomatis dibersihkan.
            </p>

            <textarea
              rows={8}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Ahmad Fauzi&#10;Citra Kirana&#10;Dedi Kusnadi&#10;Evi Lestari..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
            />

            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-3 py-1.5 font-bold border border-slate-300 text-slate-700 rounded hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteBulk}
                className="px-3 py-1.5 font-bold bg-blue-700 hover:bg-blue-800 text-white rounded transition-colors"
              >
                Impor Nama Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INDIVIDUAL RESPONSE EDITOR MODAL */}
      {activeEditorStudent && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded border border-slate-350 max-w-2xl w-full p-4 md:p-6 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-black font-mono tracking-wider text-blue-700 uppercase">KOREKTOR JAWABAN</span>
                <h3 className="text-sm font-black text-slate-900 uppercase">Nama: {activeEditorStudent.name}</h3>
              </div>
              <button 
                onClick={() => setActiveEditorStudent(null)} 
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Continuous Input bar */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs space-y-2">
              <label className="block font-black text-slate-700 text-[11px] uppercase tracking-wide">
                🚀 Masukkan Sekaligus (Paling Praktis)
              </label>
              <p className="text-[10.5px] text-slate-500 leading-normal">
                Ketik atau tempel beruntun 40 karakter jawaban (contoh: <strong>ABCDEABCDE...</strong>). Karakter lain dibersihkan otomatis.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={100}
                  value={bulkAnswersString}
                  onChange={(e) => setBulkAnswersString(e.target.value)}
                  className="px-3 py-1.5 text-xs font-mono font-bold tracking-widest uppercase border border-slate-350 rounded focus:ring-1 focus:ring-blue-500 bg-white flex-1"
                  placeholder="TEMPEL BARIS JAWABAN SISWA DISINI..."
                />
                <button
                  onClick={handleApplyAnswersString}
                  className="px-3 bg-indigo-700 hover:bg-indigo-805 text-white font-bold rounded text-xs transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Terapkan
                </button>
              </div>
              
              {feedback && (
                <div className="text-[10.5px] text-emerald-700 font-bold flex items-center gap-1 font-sans">
                  <Check className="w-3.5 h-3.5" /> {feedback}
                </div>
              )}
            </div>

            {/* Smart Keyboard entry manual helper */}
            <div className="bg-amber-50 border border-amber-200 p-2 text-[10.5px] leading-relaxed rounded-sm text-amber-800 flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Mode Super Cepat:</strong> Klik lingkaran soal mana saja, lalu langsung tekan tombol huruf <strong>A, B, C, D, E</strong> di keyboard laptop Anda. Posisinya akan otomatis maju ke nomor berikutnya. Tekan <strong>Backspace</strong> untuk menghapus jawaban.
              </span>
            </div>

            {/* The 40 Question Circles Grid */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-500 tracking-wider uppercase block">GELOMBANG BUTIR SOAL (1-40)</span>
              
              {/* Question Circles Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 font-mono">
                {Array(40).fill(null).map((_, qIdx) => {
                  const num = qIdx + 1;
                  const value = editAnswers[qIdx] || "";
                  const key = activeClass.answerKey[qIdx];
                  const isActive = activeQIndex === qIdx;
                  
                  let bgCol = "bg-white border-slate-300 text-slate-700 hover:bg-slate-50";
                  if (isActive) {
                    bgCol = "bg-blue-600 text-white border-blue-650 shadow-sm";
                  } else if (value !== "") {
                    const isCorrect = key !== "" && value === key;
                    bgCol = isCorrect
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : "bg-rose-50 text-rose-800 border-rose-300";
                  }

                  return (
                    <button
                      key={qIdx}
                      onClick={() => {
                        setActiveQIndex(qIdx);
                        setFeedback("");
                      }}
                      className={`flex flex-col items-center justify-center p-1 border rounded transition-all cursor-pointer h-11 ${bgCol}`}
                    >
                      <span className="text-[8.5px] uppercase font-bold text-slate-400 leading-none">Soal {num}</span>
                      <span className="text-[12px] font-black leading-tight">{value || "-"}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Answer select keys under active question */}
            <div className="bg-slate-50 border border-slate-200 rounded p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-xs">
                <span className="text-slate-500 font-bold block">SOAL AKTIF</span>
                <span className="font-extrabold text-[13px] text-slate-900">
                  Nomor {activeQIndex + 1}
                </span>
                <span className="text-slate-400 font-sans block text-[10px]">
                  Kunci: {activeClass.answerKey[activeQIndex] || "Belum Ditegaskan"}
                </span>
              </div>

              {/* Dynamic Answer Key selector pads */}
              <div className="flex gap-2.5">
                {["A", "B", "C", "D", "E"].map((letter) => {
                  const isSelected = editAnswers[activeQIndex] === letter;
                  return (
                    <button
                      key={letter}
                      onClick={() => handleSingleAnswer(activeQIndex, letter)}
                      className={`w-10 h-10 rounded font-black text-sm border flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-blue-700 text-white border-blue-800 shadow scale-105"
                          : "bg-white text-slate-800 border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })}
                <button
                  onClick={() => handleSingleAnswer(activeQIndex, "")}
                  className="px-2.5 h-10 font-bold lowercase text-xs bg-[#fff5f5] text-red-600 border border-red-200 rounded hover:bg-red-100 transition-colors"
                  title="Hapus pilihan"
                >
                  Clear
                </button>
              </div>

              {/* Step Navigation buttons */}
              <div className="flex items-center gap-1 text-xs">
                <button
                  disabled={activeQIndex === 0}
                  onClick={() => setActiveQIndex(p => Math.max(0, p - 1))}
                  className="p-1.5 border border-slate-300 bg-white rounded text-slate-600 disabled:opacity-40 hover:bg-slate-100 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={activeQIndex === 39}
                  onClick={() => setActiveQIndex(p => Math.min(39, p + 1))}
                  className="p-1.5 border border-slate-300 bg-white rounded text-slate-600 disabled:opacity-40 hover:bg-slate-100 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex justify-between items-center border-t border-slate-200 pt-3 text-xs">
              <div className="text-[11px] font-bold text-slate-500 font-sans">
                Terisi: <strong className="text-slate-800">{editAnswers.filter(e => e !== "").length}</strong> / 40 Jawaban
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveEditorStudent(null)}
                  className="px-4 py-1.5 font-bold border border-slate-300 text-slate-700 rounded hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveAnswers}
                  className="px-4 py-1.5 font-bold bg-blue-700 hover:bg-blue-800 text-white rounded transition-colors uppercase tracking-wide"
                >
                  Simpan Jawaban Siswa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
