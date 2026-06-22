import React, { useState } from "react";
import { Info, HelpCircle, AlertCircle, ArrowRightLeft, Users, Filter } from "lucide-react";
import { AppClass, Student } from "../types";

interface MatrixGridProps {
  activeClass: AppClass;
  getStudentScore: (student: Student) => number;
}

export default function MatrixGrid({ activeClass, getStudentScore }: MatrixGridProps) {
  const [filterMode, setFilterMode] = useState<"all" | "tuntas" | "remedial">("all");
  const activeStudents = activeClass.students.filter(s => s.name.trim() !== "");

  // Apply filter
  const filteredStudents = activeStudents.filter(st => {
    const score = getStudentScore(st);
    const isTuntas = score >= activeClass.passingGrade;
    if (filterMode === "tuntas") return isTuntas;
    if (filterMode === "remedial") return !isTuntas;
    return true;
  });

  return (
    <div className="space-y-4 font-sans text-xs">
      
      {/* Informative Row plus Filter buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-150">
        <div>
          <h3 className="font-extrabold text-xs text-slate-800 uppercase flex items-center gap-1.5">
            <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
            Matriks Penilaian Jawaban Kelas (at a Glance)
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            Matriks memetakan perbandingan jawaban semua murid (baris) sejajar dengan kunci jawaban (KUNCI) di atasnya.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded border border-slate-200">
          <span className="text-[10px] font-black text-slate-500 px-2 uppercase tracking-wide flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" /> Saring:
          </span>
          <button
            onClick={() => setFilterMode("all")}
            className={`px-2 py-0.5 rounded text-[10.5px] font-bold transition-all ${
              filterMode === "all"
                ? "bg-white text-blue-700 shadow-2xs border border-slate-250"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Semua ({activeStudents.length})
          </button>
          <button
            onClick={() => setFilterMode("tuntas")}
            className={`px-2 py-0.5 rounded text-[10.5px] font-bold transition-all ${
              filterMode === "tuntas"
                ? "bg-white text-emerald-700 shadow-2xs border border-slate-250"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tuntas ({activeStudents.filter(s => getStudentScore(s) >= activeClass.passingGrade).length})
          </button>
          <button
            onClick={() => setFilterMode("remedial")}
            className={`px-2 py-0.5 rounded text-[10.5px] font-bold transition-all ${
              filterMode === "remedial"
                ? "bg-white text-rose-700 shadow-2xs border border-slate-250"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Remedial ({activeStudents.filter(s => getStudentScore(s) < activeClass.passingGrade).length})
          </button>
        </div>
      </div>

      {/* High Density Table scroll block */}
      <div className="border border-slate-300 rounded overflow-auto max-h-[460px] bg-slate-100/50">
        <table className="w-full text-xs text-left border-collapse table-fixed">
          <thead className="bg-[#f8fafc] text-slate-500 sticky top-0 z-20 border-b-2 border-slate-350">
            <tr>
              <th className="w-10 bg-slate-200 border-r border-slate-300 text-center font-bold text-[9px] text-slate-600 sticky left-0 z-30">No</th>
              <th className="w-40 border-r border-slate-300 text-left font-black text-slate-700 text-[10px] sticky left-10 bg-[#f8fafc] z-25 pl-3">Nama Siswa</th>
              {Array(40).fill(null).map((_, idx) => (
                <th key={idx} className="w-8 border-r border-slate-200 text-center font-black font-mono text-[9px] bg-slate-50 text-slate-550">
                  Q{idx + 1}
                </th>
              ))}
              <th className="w-16 border-r border-slate-300 text-center font-bold bg-indigo-50 text-indigo-800 text-[9px]">Skor</th>
              <th className="w-20 text-center font-bold bg-indigo-50 text-indigo-800 text-[9px]">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            
            {/* Answer Keys Reference row */}
            <tr className="bg-indigo-50/70 text-slate-900 border-b border-slate-350 font-bold">
              <td className="bg-slate-250 sticky left-0 text-center font-black border-r border-slate-350 z-10 text-slate-700 font-mono">KEY</td>
              <td className="border-r border-slate-350 sticky left-10 bg-indigo-50 font-black pl-3 text-indigo-800 text-[10px] z-10">Kunci Jawaban</td>
              {Array(40).fill(null).map((_, idx) => {
                const letter = activeClass.answerKey[idx] || "";
                return (
                  <td key={idx} className="border-r border-slate-200 text-center font-black font-mono text-[11px] text-indigo-700 bg-indigo-50/25">
                    {letter || "-"}
                  </td>
                );
              })}
              <td colSpan={2} className="bg-slate-100 border-l border-slate-350"></td>
            </tr>

            {/* Students Answers row looping */}
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={44} className="py-12 text-center text-slate-400 italic font-sans bg-white">
                  Tidak ada data siswa untuk disaring.
                </td>
              </tr>
            ) : (
              filteredStudents.map((st, sIdx) => {
                const score = getStudentScore(st);
                const isTuntas = score >= activeClass.passingGrade;
                
                return (
                  <tr key={st.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-150">
                    <td className="bg-slate-100 sticky left-0 text-center border-r border-slate-300 font-mono text-[10px] font-bold text-slate-500">{sIdx + 1}</td>
                    <td className="border-r border-slate-300 sticky left-10 bg-white font-bold pl-3 text-slate-800 text-[11px] truncate z-10">{st.name}</td>
                    
                    {/* 40 questions answers */}
                    {Array(40).fill(null).map((_, qIdx) => {
                      const value = st.answers[qIdx] || "";
                      const key = activeClass.answerKey[qIdx];
                      
                      let cellCol = "text-slate-400 font-normal";
                      let cellBg = "";
                      
                      if (value !== "") {
                        if (key !== "" && value === key) {
                          cellCol = "text-emerald-700 font-extrabold";
                          cellBg = "bg-emerald-50/45";
                        } else {
                          cellCol = "text-rose-700 font-bold";
                          cellBg = "bg-rose-50/40";
                        }
                      }

                      return (
                        <td 
                          key={qIdx} 
                          title={`Siswa: ${st.name}\nSoal #${qIdx + 1}\nJawaban: ${value || "Kosong"} (Kunci: ${key || "-"})`}
                          className={`border-r border-slate-200 text-center font-mono text-[11px] ${cellCol} ${cellBg}`}
                        >
                          {value || "-"}
                        </td>
                      );
                    })}

                    <td className={`border-r border-slate-300 text-center font-mono font-black text-[11px] ${
                      isTuntas ? "text-emerald-700 bg-emerald-50/10" : "text-rose-700 bg-rose-50/10"
                    }`}>
                      {score.toFixed(0)}
                    </td>
                    <td className="text-center font-sans">
                      <span className={`text-[8.5px] uppercase font-black tracking-wide ${
                        isTuntas ? "text-emerald-700" : "text-rose-700"
                      }`}>
                        {isTuntas ? "TUNTAS" : "REMED"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}

          </tbody>
        </table>
      </div>

      {/* Color legend guides */}
      <div className="flex flex-wrap gap-4 text-[10.5px] font-medium text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-sm bg-emerald-50 border border-emerald-300 flex items-center justify-center font-bold text-emerald-800 font-mono text-[9px]">A</span>
          <span>Jawaban Benar</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-sm bg-rose-50 border border-rose-300 flex items-center justify-center font-bold text-rose-800 font-mono text-[9px]">B</span>
          <span>Jawaban Salah (Terkecoh)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-sm bg-white border border-slate-300 flex items-center justify-center font-normal text-slate-400 font-mono text-[9px]">-</span>
          <span>Tidak ada jawaban / Kosong</span>
        </div>
      </div>

    </div>
  );
}
