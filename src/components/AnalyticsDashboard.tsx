import React from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Cell, TooltipProps 
} from "recharts";
import { 
  TrendingUp, Users, Award, Percent, ChevronRight, AlertCircle, Info, BookOpen 
} from "lucide-react";
import { AppClass, Student } from "../types";

interface AnalyticsDashboardProps {
  activeClass: AppClass;
  getStudentScore: (student: Student) => number;
  getStudentCorrectCount: (student: Student) => number;
}

export default function AnalyticsDashboard({ 
  activeClass, 
  getStudentScore, 
  getStudentCorrectCount 
}: AnalyticsDashboardProps) {
  
  const activeStudents = activeClass.students.filter(s => s.name.trim() !== "");
  const totalStudents = activeStudents.length;

  // Calculators
  const scores = activeStudents.map(s => getStudentScore(s));
  const avgScore = totalStudents > 0 ? (scores.reduce((a, b) => a + b, 0) / totalStudents) : 0;
  const maxScore = totalStudents > 0 ? Math.max(...scores) : 0;
  const minScore = totalStudents > 0 ? Math.min(...scores) : 0;

  // Standard Deviation
  const stdDev = totalStudents > 1 
    ? Math.sqrt(scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / totalStudents) 
    : 0;

  // Passing grade
  const passingGrade = activeClass.passingGrade;
  const passedStudentsCount = activeStudents.filter(s => getStudentScore(s) >= passingGrade).length;
  const passingRate = totalStudents > 0 ? (passedStudentsCount / totalStudents) * 100 : 0;

  // Grade Distribution Intervals 
  // [0-20, 21-40, 41-60, 61-80, 81-100]
  const intervals = [
    { name: "0-20", count: 0, fill: "#ef4444" },
    { name: "21-40", count: 0, fill: "#f97316" },
    { name: "41-60", count: 0, fill: "#eab308" },
    { name: "61-80", count: 0, fill: "#3b82f6" },
    { name: "81-100", count: 0, fill: "#10b981" }
  ];

  scores.forEach(s => {
    if (s <= 20) intervals[0].count++;
    else if (s <= 40) intervals[1].count++;
    else if (s <= 60) intervals[2].count++;
    else if (s <= 80) intervals[3].count++;
    else intervals[4].count++;
  });

  // Calculate correct-rate per question (0 to 39)
  const questionDifficulty = Array(40).fill(null).map((_, qIdx) => {
    const key = activeClass.answerKey[qIdx];
    let correct = 0;
    const choiceCounts = { A: 0, B: 0, C: 0, D: 0, E: 0, Kosong: 0 };
    
    activeStudents.forEach(st => {
      const ans = st.answers[qIdx] || "";
      if (ans === key && key !== "") {
        correct++;
      }
      if (["A", "B", "C", "D", "E"].includes(ans)) {
        choiceCounts[ans as "A"|"B"|"C"|"D"|"E"]++;
      } else {
        choiceCounts.Kosong++;
      }
    });

    const correctRate = totalStudents > 0 ? (correct / totalStudents) * 100 : 0;
    
    let label = "SEDANG";
    let color = "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (correctRate > 70) {
      label = "MUDAH";
      color = "text-emerald-700 bg-emerald-50 border-emerald-200";
    } else if (correctRate < 35) {
      label = "SUKAR";
      color = "text-rose-700 bg-rose-50 border-rose-200";
    }

    return {
      qNum: qIdx + 1,
      correctRate,
      correctCount: correct,
      key,
      label,
      color,
      distractors: choiceCounts
    };
  });

  // Hardest questions
  const hardestQuestions = [...questionDifficulty]
    .sort((a, b) => a.correctRate - b.correctRate)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 rounded p-4 relative overflow-hidden shadow-xs hover:border-slate-350 transition-colors">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Rata-Rata Kelas</span>
              <span className="text-2xl font-black text-slate-900 font-mono">{avgScore.toFixed(1)}</span>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 font-sans">
            Standar Deviasi: <span className="font-mono font-bold text-slate-800">{stdDev.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4 relative overflow-hidden shadow-xs hover:border-slate-350 transition-colors">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Nilai Tertinggi</span>
              <span className="text-2xl font-black text-emerald-700 font-mono">{maxScore.toFixed(0)}</span>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 leading-none">
            Skor maksimal potensi ujian (100)
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4 relative overflow-hidden shadow-xs hover:border-slate-350 transition-colors">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Nilai Terendah</span>
              <span className="text-2xl font-black text-rose-700 font-mono">{minScore.toFixed(0)}</span>
            </div>
            <div className="p-2 bg-rose-50 text-rose-600 rounded">
              <Award className="w-4 h-4 rotate-180" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 leading-none">
            Skor minimum perolehan siswa
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4 relative overflow-hidden shadow-xs hover:border-slate-350 transition-colors">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Kelulusan (KKTP)</span>
              <span className="text-2xl font-black text-blue-800 font-mono">{passingGrade}</span>
            </div>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 leading-none">
            Target standar kriteria ketuntasan
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4 relative overflow-hidden shadow-xs hover:border-slate-350 transition-colors">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Tingkat Ketuntasan</span>
              <span className="text-2xl font-black text-slate-950 font-mono">{passingRate.toFixed(1)}%</span>
            </div>
            <div className="p-2 bg-teal-50 text-teal-600 rounded">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 font-medium">
            Tuntas: <strong className="text-emerald-700">{passedStudentsCount}</strong> / Remedial: <strong className="text-rose-700">{totalStudents - passedStudentsCount}</strong>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      {totalStudents === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-sm p-8 text-center text-slate-500 italic text-sm">
          Belum ada data siswa aktif. Silakan isi daftar kelas terlebih dahulu di tab "Daftar Siswa".
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Grade Distribution */}
          <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs space-y-4">
            <div>
              <h3 className="text-xs font-black tracking-wide uppercase text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Distribusi Nilai Berdasarkan Interval Skor
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Grafik ini mengelompokkan siswa berdasarkan klafisikasi rentang nilai akhir (0-100)</p>
            </div>
            <div className="h-64 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={intervals} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: "bold", fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fontWeight: "bold", fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} />
                  <Tooltip 
                    cursor={{ fill: "#f8fafc", opacity: 0.5 }}
                    contentStyle={{ fontSize: 12, borderRadius: 4, border: "1px solid #cbd5e1", fontFamily: "sans-serif" }} 
                  />
                  <Bar dataKey="count" name="Jumlah Siswa" minPointSize={5}>
                    {intervals.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Answer Keys Correct Ratio */}
          <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs space-y-4">
            <div>
              <h3 className="text-xs font-black tracking-wide uppercase text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Tingkat Kebenaran (%) Per Butir Soal (Q1 - Q40)
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Deteksi performa soal ujian: jika grafik menukik tajam, kaji materi soal tersebut kembali.</p>
            </div>
            <div className="h-64 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={questionDifficulty} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="qNum" tick={{ fontSize: 9, fontWeight: "bold", fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} />
                  <YAxis tick={{ fontSize: 9, fontWeight: "bold", fill: "#64748b" }} domain={[0, 100]} axisLine={{ stroke: "#e2e8f0" }} />
                  <Tooltip 
                    contentStyle={{ fontSize: 11, borderRadius: 4, border: "1px solid #cbd5e1" }}
                    formatter={(value: any) => [`${Number(value).toFixed(1)}%`, "Benar"]}
                  />
                  <Line type="monotone" dataKey="correctRate" stroke="#4f46e5" strokeWidth={2.5} activeDot={{ r: 5 }} dot={{ r: 2, fill: "#4f46e5" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Diagnostics / Hardest Questions & Distractors */}
      {totalStudents > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Top 5 Hardest Questions Panel */}
          <div className="xl:col-span-1 bg-white border border-slate-200 rounded p-4 shadow-2xs space-y-4">
            <div>
              <h3 className="text-xs font-black tracking-wide uppercase text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Daftar 5 Soal Paling Sulit (Butuh Remedial)
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Ini adalah materi soal dengan rasio jawaban benar terendah di kelas ini.</p>
            </div>

            <div className="space-y-3">
              {hardestQuestions.map((q, idx) => {
                // Determine most chosen wrong answer
                const options = ["A", "B", "C", "D", "E"] as const;
                const wrongOptions = options.filter(o => o !== q.key);
                let highestOption = "KOSONG";
                let highestVal = q.distractors.Kosong;

                wrongOptions.forEach(o => {
                  if (q.distractors[o] > highestVal) {
                    highestVal = q.distractors[o];
                    highestOption = `Pilihan ${o}`;
                  }
                });

                return (
                  <div key={idx} className="border border-slate-150 p-2.5 rounded-sm bg-slate-50/50 flex flex-col justify-between text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-800">Soal Nomor {q.qNum}</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold border border-rose-200 text-rose-800 bg-rose-50">
                        Akurasi: {q.correctRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-[11px] leading-relaxed text-slate-650 font-sans">
                      Kunci Jawaban: <strong className="text-indigo-700 font-mono text-[12px]">{q.key}</strong> | Dijawab Benar: <strong>{q.correctCount} Siswa</strong>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Pengecoh Terkecoh: <strong className="text-rose-600">{highestOption}</strong> ({highestVal} orang terkecoh)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full Distractor Options Table */}
          <div className="xl:col-span-2 bg-white border border-slate-200 rounded p-4 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-black tracking-wide uppercase text-slate-800 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Uji Distraktor / Analisis Pilihan Jawaban Soal (Q1 - Q40)
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">Pemetaan lengkap jumlah murid memilih opsi A, B, C, D, E. Membantu evaluasi mutu kualitas opsi pengecoh ujian.</p>
              </div>
            </div>

            <div className="border border-slate-200 rounded overflow-auto max-h-[300px]">
              <table className="w-full text-xs text-left border-collapse font-sans">
                <thead className="bg-[#f8fafc] text-slate-650 sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-2.5 border-r border-slate-200 text-center font-bold text-[10px]">No</th>
                    <th className="py-2 px-2 border-r border-slate-200 text-center font-bold text-[10px]">Kunci</th>
                    <th className="py-2 px-2 border-r border-slate-200 text-center font-bold text-slate-500 font-mono">A</th>
                    <th className="py-2 px-2 border-r border-slate-200 text-center font-bold text-slate-500 font-mono">B</th>
                    <th className="py-2 px-2 border-r border-slate-200 text-center font-bold text-slate-500 font-mono">C</th>
                    <th className="py-2 px-2 border-r border-slate-200 text-center font-bold text-slate-500 font-mono">D</th>
                    <th className="py-2 px-2 border-r border-slate-200 text-center font-bold text-slate-500 font-mono">E</th>
                    <th className="py-2 px-2 border-r border-slate-200 text-center font-bold text-slate-400">Kosong</th>
                    <th className="py-2 px-2 border-r border-slate-200 text-center font-bold text-slate-800">Skor %</th>
                    <th className="py-2 px-2 text-center font-bold text-slate-800">Klasifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {questionDifficulty.map((q, idx) => {
                    return (
                      <tr key={idx} className="hover:bg-slate-50 font-mono">
                        <td className="py-1 px-2.5 border-r border-slate-200 text-center font-bold text-slate-600 text-[11px]">{q.qNum}</td>
                        <td className="py-1 px-2 border-r border-slate-200 text-center font-black text-indigo-700 font-sans text-[12px] bg-indigo-50/20">{q.key || "-"}</td>
                        {["A", "B", "C", "D", "E"].map((o) => {
                          const isKey = q.key === o;
                          const count = q.distractors[o as "A"|"B"|"C"|"D"|"E"];
                          return (
                            <td 
                              key={o} 
                              className={`py-1 px-2 border-r border-slate-200 text-center text-[11px] ${
                                isKey 
                                  ? "font-bold text-emerald-700 bg-emerald-50/30" 
                                  : count > 3 
                                    ? "text-slate-800 bg-amber-50/10" 
                                    : "text-slate-400"
                              }`}
                            >
                              {count}
                            </td>
                          );
                        })}
                        <td className="py-1 px-2 border-r border-slate-200 text-center text-slate-400 text-[11px]">{q.distractors.Kosong}</td>
                        <td className="py-1 px-2 border-r border-slate-200 text-center font-bold text-slate-800 text-[11px]">{q.correctRate.toFixed(0)}%</td>
                        <td className="py-1 px-2 text-center font-sans">
                          <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${q.color}`}>
                            {q.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              <span>*Keterangan: Opsi dengan warna <strong>Kuning/Gelap</strong> mengindikasikan opsi pengecoh yang ideal karena dipilih lebih dari 3 siswa.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
