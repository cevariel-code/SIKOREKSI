import React, { useState } from "react";
import { Printer, AlertCircle, Award, Sliders, Check, UserCheck } from "lucide-react";
import { AppClass, Student } from "../types";

interface PrintableReportProps {
  activeClass: AppClass;
  getStudentScore: (student: Student) => number;
}

export default function PrintableReport({ activeClass, getStudentScore }: PrintableReportProps) {
  const [stampCity, setStampCity] = useState("Jakarta");
  const [headmasterName, setHeadmasterName] = useState("Dra. H. Herawati, M.Pd.");
  const [headmasterNip, setHeadmasterNip] = useState("19741002 200112 2 003");
  const [teacherName, setTeacherName] = useState(activeClass.teacherName || "Drs. Siswanto, M.Pd.");
  const [teacherNip, setTeacherNip] = useState("19800514 200904 1 002");
  const [showConfig, setShowConfig] = useState(true);

  const activeStudents = activeClass.students.filter(s => s.name.trim() !== "");
  const remedialStudents = activeStudents.filter(s => getStudentScore(s) < activeClass.passingGrade);
  const passStudents = activeStudents.filter(s => getStudentScore(s) >= activeClass.passingGrade);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 flex flex-col space-y-6">
      {/* Settings for Print Block */}
      <div className="no-print bg-slate-50 border border-slate-200 rounded-sm p-4 text-xs space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs">Pengaturan Dokumen Cetak</h3>
          </div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="text-blue-600 hover:underline font-bold"
          >
            {showConfig ? "Sembunyikan" : "Tampilkan"}
          </button>
        </div>

        {showConfig && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Kota / Tempat Cetak</label>
              <input
                type="text"
                value={stampCity}
                onChange={(e) => setStampCity(e.target.value)}
                className="w-full p-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Nama Kepala Sekolah</label>
              <input
                type="text"
                value={headmasterName}
                onChange={(e) => setHeadmasterName(e.target.value)}
                className="w-full p-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">NIP Kepala Sekolah</label>
              <input
                type="text"
                value={headmasterNip}
                onChange={(e) => setHeadmasterNip(e.target.value)}
                className="w-full p-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Nama Guru / NIP</label>
              <div className="space-y-1">
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full p-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 bg-white"
                  placeholder="Nama Guru"
                />
                <input
                  type="text"
                  value={teacherNip}
                  onChange={(e) => setTeacherNip(e.target.value)}
                  className="w-full p-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 bg-white"
                  placeholder="NIP Guru"
                />
              </div>
            </div>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-2 text-[11px] leading-relaxed rounded-sm flex gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Petunjuk Cetak:</strong> Gunakan pengaturan <strong>Portrait</strong> dengan ukuran kertas <strong>A4</strong> atau <strong>Letter</strong>. Pada dialog cetak browser, aktifkan opsi <strong>"Background graphics"</strong> untuk hasil pewarnaan tabel yang optimal.
          </span>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-850 text-white font-bold px-4 py-2 rounded-sm shadow-sm transition-all uppercase tracking-wide text-xs"
          >
            <Printer className="w-4 h-4" />
            Cetak Laporan Sekarang (PDF)
          </button>
        </div>
      </div>

      {/* Printable Sheet Wrapper */}
      <div 
        id="printable-report-body" 
        className="bg-white border border-slate-300 rounded p-6 font-sans shadow-2xs max-w-[900px] mx-auto text-black print:border-none print:shadow-none print:p-0 print:m-0"
      >
        {/* Kop Surat Dinas Pendidikan Formal */}
        <div className="text-center border-b-4 border-double border-black pb-4 mb-5">
          <h2 className="text-sm font-black tracking-widest text-[#1e293b] uppercase">PEMERINTAH PROVINSI / KOTA</h2>
          <h1 className="text-lg font-black text-black tracking-wide my-0.5 uppercase">{activeClass.schoolName}</h1>
          <p className="text-[10px] text-slate-500 italic mt-0.5">Alamat Instansi Pendidikan Terakreditasi Nasional, Indonesia</p>
          <div className="w-full h-px bg-slate-300 mt-2" />
        </div>

        <div className="text-center mb-5">
          <h3 className="text-xs font-black tracking-widest text-slate-500 uppercase">LAPORAN PEMETAAN EVALUASI & BUTIR UJIAN</h3>
          <h2 className="text-base font-black text-black tracking-wider uppercase underline mt-1">
            DAFTAR KELOMPOK REMEDIAL & PENGAYAAN
          </h2>
          <div className="flex justify-center gap-6 mt-3 text-xs font-bold text-slate-600">
            <span>MATA PELAJARAN: {activeClass.className}</span>
            <span>•</span>
            <span>KKTP / KKMD: {activeClass.passingGrade}</span>
            <span>•</span>
            <span>TANGGAL: {activeClass.examDate || new Date().toLocaleDateString("id-ID")}</span>
          </div>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed mb-4 text-justify">
          Berdasarkan hasil analisis uji kompetensi butir ujian menggunakan penilaian otomatis berbasis 40 soal pilihan ganda, berikut adalah pemetaan pemelajaran remedial mandiri dan pengayaan klasikal siswa untuk topik yang diujikan:
        </p>

        {/* Dynamic Groups side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
          {/* Kelompok Remedial */}
          <div className="space-y-3">
            <div className="bg-red-50 border border-red-350 p-2.5 flex justify-between items-center rounded-sm">
              <span className="text-[10px] font-black text-red-800 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                Kelompok Siswa Remedial
              </span>
              <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-mono font-extrabold border border-red-200">
                {remedialStudents.length} Siswa
              </span>
            </div>

            <div className="border border-slate-300 bg-white">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-[#f8fafc] border-b border-slate-300">
                  <tr>
                    <th className="w-10 py-1.5 px-2 font-black border-r border-slate-300 text-center text-[10px]">No</th>
                    <th className="py-1.5 px-2 font-black border-r border-slate-300 text-[10px]">Nama Lengkap</th>
                    <th className="w-20 py-1.5 px-2 font-black text-center text-[10px]">Nilai Ujian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {remedialStudents.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-slate-400 italic text-[11px]">
                        Semua siswa tuntas! Tidak ada siswa remedial.
                      </td>
                    </tr>
                  ) : (
                    remedialStudents.map((st, idx) => (
                      <tr key={st.id} className="hover:bg-slate-50">
                        <td className="py-1 px-2 border-r border-slate-200 text-center font-mono text-slate-500 text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-1 px-2 border-r border-slate-200 text-[11px] font-bold text-slate-900">
                          {st.name}
                        </td>
                        <td className="py-1 px-2 font-mono font-black text-center text-red-700 bg-red-50/10 text-[11px]">
                          {getStudentScore(st).toFixed(1)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal italic">
              *Rencana Tindak Lanjut: Pemberian bimbingan khusus pada sub-topik materi tersulit dan pengerjaan re-test mandiri.
            </p>
          </div>

          {/* Kelompok Pengayaan */}
          <div className="space-y-3">
            <div className="bg-emerald-50 border border-emerald-350 p-2.5 flex justify-between items-center rounded-sm">
              <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Kelompok Siswa Pengayaan
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-extrabold border border-emerald-200">
                {passStudents.length} Siswa
              </span>
            </div>

            <div className="border border-slate-300 bg-white">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-[#f8fafc] border-b border-slate-300">
                  <tr>
                    <th className="w-10 py-1.5 px-2 font-black border-r border-slate-300 text-center text-[10px]">No</th>
                    <th className="py-1.5 px-2 font-black border-r border-slate-300 text-[10px]">Nama Lengkap</th>
                    <th className="w-20 py-1.5 px-2 font-black text-center text-[10px]">Nilai Ujian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {passStudents.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-slate-400 italic text-[11px]">
                        Belum ada siswa yang melampaui KKTP / Passing Grade.
                      </td>
                    </tr>
                  ) : (
                    passStudents.map((st, idx) => (
                      <tr key={st.id} className="hover:bg-slate-50">
                        <td className="py-1 px-2 border-r border-slate-200 text-center font-mono text-slate-500 hover:text-slate-800 text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-1 px-2 border-r border-slate-200 text-[11px] font-bold text-slate-900">
                          {st.name}
                        </td>
                        <td className="py-1 px-2 font-mono font-black text-center text-emerald-800 bg-emerald-50/10 text-[11px]">
                          {getStudentScore(st).toFixed(1)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal italic">
              *Rencana Tindak Lanjut: Penugasan proyek tutor sebaya untuk siswa kelompok remedial, atau penugasan literasi artikel pengayaan.
            </p>
          </div>
        </div>

        {/* Signature Area */}
        <div className="mt-8 pt-8 border-t border-slate-200 grid grid-cols-2 text-xs font-sans">
          <div className="space-y-16">
            <div>
              <p className="text-slate-500">Mengetahui,</p>
              <p className="font-extrabold text-black uppercase">Kepala Sekolah {activeClass.schoolName}</p>
            </div>
            <div>
              <p className="font-black text-black underline text-xs">{headmasterName}</p>
              <p className="text-[10px] font-mono text-slate-500">NIP. {headmasterNip}</p>
            </div>
          </div>

          <div className="text-right space-y-16">
            <div>
              <p className="text-slate-500">{stampCity}, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
              <p className="font-extrabold text-black uppercase">Guru Mata Pelajaran / Kelas</p>
            </div>
            <div>
              <p className="font-black text-black underline text-xs">{teacherName}</p>
              <p className="text-[10px] font-mono text-slate-500">NIP. {teacherNip}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
