import React, { useState, useEffect } from "react";
import { Printer, AlertCircle, Award, Sliders, Check, UserCheck, Trash2, Upload, RotateCcw } from "lucide-react";
import { AppClass, Student } from "../types";

interface PrintableReportProps {
  activeClass: AppClass;
  getStudentScore: (student: Student) => number;
}

export default function PrintableReport({ activeClass, getStudentScore }: PrintableReportProps) {
  const [stampCity, setStampCity] = useState(() => localStorage.getItem("print_stamp_city") || "Jakarta");
  const [headmasterName, setHeadmasterName] = useState(() => localStorage.getItem("print_headmaster_name") || "Dra. H. Herawati, M.Pd.");
  const [headmasterNip, setHeadmasterNip] = useState(() => localStorage.getItem("print_headmaster_nip") || "19741002 200112 2 003");
  const [teacherName, setTeacherName] = useState(() => localStorage.getItem("print_teacher_name") || activeClass.teacherName || "Drs. Siswanto, M.Pd.");
  const [teacherNip, setTeacherNip] = useState(() => localStorage.getItem("print_teacher_nip") || "19800514 200904 1 002");
  const [showConfig, setShowConfig] = useState(true);

  // Kop Surat states
  const [kopType, setKopType] = useState<"text" | "image">(() => (localStorage.getItem("print_kop_type") as "text" | "image") || "text");
  const [kopLine1, setKopLine1] = useState(() => localStorage.getItem("print_kop_line1") || "PEMERINTAH PROVINSI / KOTA");
  const [kopLine2, setKopLine2] = useState(() => localStorage.getItem("print_kop_line2") || activeClass.schoolName || "DINAS PENDIDIKAN NASIONAL");
  const [kopLine3, setKopLine3] = useState(() => localStorage.getItem("print_kop_line3") || "Alamat Instansi Pendidikan Terakreditasi Nasional, Indonesia");
  
  const [schoolLogo, setSchoolLogo] = useState<string | null>(() => localStorage.getItem("print_school_logo"));
  const [secondaryLogo, setSecondaryLogo] = useState<string | null>(() => localStorage.getItem("print_secondary_logo"));
  const [fullKopImage, setFullKopImage] = useState<string | null>(() => localStorage.getItem("print_full_kop_image"));
  const [kopImageHeight, setKopImageHeight] = useState<number>(() => {
    const val = localStorage.getItem("print_kop_image_height");
    return val ? parseInt(val) : 90;
  });

  // Automatically sync to localStorage on change
  useEffect(() => {
    localStorage.setItem("print_stamp_city", stampCity);
    localStorage.setItem("print_headmaster_name", headmasterName);
    localStorage.setItem("print_headmaster_nip", headmasterNip);
    localStorage.setItem("print_teacher_name", teacherName);
    localStorage.setItem("print_teacher_nip", teacherNip);
    localStorage.setItem("print_kop_type", kopType);
    localStorage.setItem("print_kop_line1", kopLine1);
    localStorage.setItem("print_kop_line2", kopLine2);
    localStorage.setItem("print_kop_line3", kopLine3);
    localStorage.setItem("print_kop_image_height", kopImageHeight.toString());
    
    if (schoolLogo) {
      localStorage.setItem("print_school_logo", schoolLogo);
    } else {
      localStorage.removeItem("print_school_logo");
    }

    if (secondaryLogo) {
      localStorage.setItem("print_secondary_logo", secondaryLogo);
    } else {
      localStorage.removeItem("print_secondary_logo");
    }

    if (fullKopImage) {
      localStorage.setItem("print_full_kop_image", fullKopImage);
    } else {
      localStorage.removeItem("print_full_kop_image");
    }
  }, [stampCity, headmasterName, headmasterNip, teacherName, teacherNip, kopType, kopLine1, kopLine2, kopLine3, schoolLogo, secondaryLogo, fullKopImage, kopImageHeight]);

  const activeStudents = activeClass.students.filter(s => s.name.trim() !== "");
  const remedialStudents = activeStudents.filter(s => getStudentScore(s) < activeClass.passingGrade);
  const passStudents = activeStudents.filter(s => getStudentScore(s) >= activeClass.passingGrade);

  const handlePrint = () => {
    window.print();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: "left" | "right" | "full") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      alert("Ukuran gambar terlalu besar. Silakan gunakan gambar di bawah 1.5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const base64 = loadEvent.target?.result as string;
      if (target === "left") setSchoolLogo(base64);
      if (target === "right") setSecondaryLogo(base64);
      if (target === "full") setFullKopImage(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-4 flex flex-col space-y-6">
      {/* Settings for Print Block */}
      <div className="no-print bg-slate-50 border border-slate-200 rounded-sm p-4 text-xs space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs">Pengaturan Dokumen & Kop Surat</h3>
          </div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="text-blue-600 hover:underline font-bold text-xs"
          >
            {showConfig ? "Sembunyikan Panel" : "Tampilkan Panel"}
          </button>
        </div>

        {showConfig && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* KOLOM KIRI: Penandatangan Laporan */}
              <div className="lg:col-span-4 bg-white p-3 border border-slate-200 rounded space-y-2.5">
                <h4 className="font-bold text-slate-700 border-b border-slate-100 pb-1 text-[11px] uppercase tracking-wider">
                  Penandatangan Laporan
                </h4>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Kota / Tempat Cetak</label>
                  <input
                    type="text"
                    value={stampCity}
                    onChange={(e) => setStampCity(e.target.value)}
                    className="w-full p-1.5 border border-slate-300 rounded text-[11px] bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Nama Kepala Sekolah</label>
                  <input
                    type="text"
                    value={headmasterName}
                    onChange={(e) => setHeadmasterName(e.target.value)}
                    className="w-full p-1.5 border border-slate-300 rounded text-[11px] bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">NIP Kepala Sekolah</label>
                  <input
                    type="text"
                    value={headmasterNip}
                    onChange={(e) => setHeadmasterNip(e.target.value)}
                    className="w-full p-1.5 border border-slate-300 rounded text-[11px] bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Nama Guru Pengampu</label>
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    className="w-full p-1.5 border border-slate-300 rounded text-[11px] bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">NIP Guru Pengampu</label>
                  <input
                    type="text"
                    value={teacherNip}
                    onChange={(e) => setTeacherNip(e.target.value)}
                    className="w-full p-1.5 border border-slate-300 rounded text-[11px] bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* KOLOM KANAN: Kop Surat Editor */}
              <div className="lg:col-span-8 bg-white p-3 border border-slate-200 rounded space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                  <h4 className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                    Kustomisasi Jabatan / Kop Surat
                  </h4>
                  <div className="flex bg-slate-150 p-0.5 rounded border border-slate-250">
                    <button
                      type="button"
                      onClick={() => setKopType("text")}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-sm transition-all ${
                        kopType === "text"
                          ? "bg-white text-blue-700 shadow-2xs"
                          : "text-slate-500 hover:text-slate-850"
                      }`}
                    >
                      Template Teks + Logo
                    </button>
                    <button
                      type="button"
                      onClick={() => setKopType("image")}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-sm transition-all ${
                        kopType === "image"
                          ? "bg-white text-blue-700 shadow-2xs"
                          : "text-slate-500 hover:text-slate-855"
                      }`}
                    >
                      Gambar Full Kop Surat
                    </button>
                  </div>
                </div>

                {kopType === "text" ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Instansi Pendidikan (Line 1)</label>
                        <input
                          type="text"
                          value={kopLine1}
                          onChange={(e) => setKopLine1(e.target.value)}
                          placeholder="PEMERINTAH PROVINSI / KOTA"
                          className="w-full p-1.5 border border-slate-300 rounded text-[11px] bg-slate-50 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-blue-750 uppercase mb-0.5">Nama Sekolah (Line 2)</label>
                        <input
                          type="text"
                          value={kopLine2}
                          onChange={(e) => setKopLine2(e.target.value)}
                          placeholder="Nama Sekolah"
                          className="w-full p-1.5 border border-slate-300 rounded text-[11px] bg-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Detail & Alamat (Line 3)</label>
                        <input
                          type="text"
                          value={kopLine3}
                          onChange={(e) => setKopLine3(e.target.value)}
                          placeholder="Alamat Lengkap Sekolah"
                          className="w-full p-1.5 border border-slate-300 rounded text-[11px] bg-slate-50 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {/* Logo Kiri */}
                      <div className="p-2.5 border border-dashed border-slate-250 rounded bg-slate-50/50 flex flex-col justify-between">
                        <div>
                          <span className="block text-[10px] font-bold text-slate-650 uppercase mb-0.5">
                            Logo Kiri (Logo Sekolah / Tut Wuri)
                          </span>
                          <span className="text-[9px] text-slate-400 block mb-2 leading-tight">
                            Diposisikan di area kiri kop surat sekolah.
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          {schoolLogo ? (
                            <div className="relative group w-12 h-12 bg-white border border-slate-200 rounded p-1 shrink-0">
                              <img
                                src={schoolLogo}
                                alt="Logo Kiri"
                                className="w-full h-full object-contain"
                                referrerPolicy="no-referrer"
                              />
                              <button
                                type="button"
                                onClick={() => setSchoolLogo(null)}
                                className="absolute -top-1.5 -right-1.5 bg-red-650 text-white p-0.5 rounded-full hover:bg-red-750 shadow-xs"
                                title="Hapus"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-slate-100 border border-slate-200 border-dashed rounded flex flex-col items-center justify-center text-slate-400 text-[9px] shrink-0 font-bold">
                              <Award className="w-4 h-4 text-slate-300 mb-0.5" />
                              Bawaan
                            </div>
                          )}
                          <label className="flex-1 cursor-pointer">
                            <span className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2 py-1.5 rounded text-[10px] font-bold inline-flex items-center gap-1 w-full justify-center shadow-3xs">
                              <Upload className="w-3 h-3 text-blue-600" />
                              Upload Logo...
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, "left")}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Logo Kanan */}
                      <div className="p-2.5 border border-dashed border-slate-250 rounded bg-slate-50/50 flex flex-col justify-between">
                        <div>
                          <span className="block text-[10px] font-bold text-slate-650 uppercase mb-0.5">
                            Logo Kanan (Daerah / Tambahan) - Opsional
                          </span>
                          <span className="text-[9px] text-slate-400 block mb-2 leading-tight">
                            Tambahan logo daerah di area kanan kop surat.
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          {secondaryLogo ? (
                            <div className="relative group w-12 h-12 bg-white border border-slate-200 rounded p-1 shrink-0">
                              <img
                                src={secondaryLogo}
                                alt="Logo Kanan"
                                className="w-full h-full object-contain"
                                referrerPolicy="no-referrer"
                              />
                              <button
                                type="button"
                                onClick={() => setSecondaryLogo(null)}
                                className="absolute -top-1.5 -right-1.5 bg-red-650 text-white p-0.5 rounded-full hover:bg-red-750 shadow-xs"
                                title="Hapus"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-slate-100 border border-slate-200 border-dashed rounded flex flex-col items-center justify-center text-slate-300 text-[9px] shrink-0 italic">
                              Kosong
                            </div>
                          )}
                          <label className="flex-1 cursor-pointer">
                            <span className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2 py-1.5 rounded text-[10px] font-bold inline-flex items-center gap-1 w-full justify-center shadow-3xs">
                              <Upload className="w-3 h-3 text-blue-600" />
                              Upload Logo...
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, "right")}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 border border-dashed border-slate-300 rounded bg-slate-50 text-center space-y-2">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                          File Gambar Kop Surat Jadi / Full Banner
                        </span>
                        <span className="text-[9px] text-slate-450 block max-w-lg mx-auto leading-normal">
                          Gunakan opsi ini jika sekolah Anda sudah memiliki banner gambar Kop Surat instansi resmi yang utuh (berukuran besar memanjang horizontal).
                        </span>
                      </div>

                      <div className="flex flex-col items-center justify-center gap-2 pt-1">
                        {fullKopImage ? (
                          <div className="w-full max-w-md bg-white border border-slate-200 rounded p-1.5 relative shadow-3xs">
                            <img
                              src={fullKopImage}
                              alt="Gambar Kop Surat"
                              className="w-full object-contain max-h-[80px]"
                              referrerPolicy="no-referrer"
                            />
                            <button
                              type="button"
                              onClick={() => setFullKopImage(null)}
                              className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-750 shadow"
                              title="Hapus"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-full max-w-sm h-12 bg-white border border-dashed border-slate-300 rounded flex items-center justify-center text-slate-400 text-[10px] font-bold">
                            Belum Ada File Gambar Kop Surat
                          </div>
                        )}

                        <label className="cursor-pointer">
                          <span className="bg-blue-600 hover:bg-blue-750 text-white font-bold px-3 py-1.5 rounded text-[10px] inline-flex items-center gap-1 shadow-xs">
                            <Upload className="w-3.5 h-3.5" />
                            Pilih File Gambar Kop (.png, .jpg)...
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "full")}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {fullKopImage && (
                      <div className="bg-slate-50 p-2 rounded border border-slate-200">
                        <div className="flex justify-between items-center mb-1 text-[10px]">
                          <span className="font-bold text-slate-500 uppercase">Tinggi Tampilan Gambar Kop Surat</span>
                          <span className="font-mono font-bold text-blue-700">{kopImageHeight} px</span>
                        </div>
                        <input
                          type="range"
                          min="45"
                          max="220"
                          value={kopImageHeight}
                          onChange={(e) => setKopImageHeight(parseInt(e.target.value))}
                          className="w-full accent-blue-600 cursor-pointer"
                        />
                        <div className="flex justify-between text-[8px] text-slate-400 font-mono">
                          <span>Sempit (45px)</span>
                          <span>Lebar (220px)</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  if (confirm("Apakah Anda yakin ingin menyetel ulang kembali semua setelan Kop Surat & Penandatangan ke bawaan?")) {
                    localStorage.removeItem("print_stamp_city");
                    localStorage.removeItem("print_headmaster_name");
                    localStorage.removeItem("print_headmaster_nip");
                    localStorage.removeItem("print_teacher_name");
                    localStorage.removeItem("print_teacher_nip");
                    localStorage.removeItem("print_kop_type");
                    localStorage.removeItem("print_kop_line1");
                    localStorage.removeItem("print_kop_line2");
                    localStorage.removeItem("print_kop_line3");
                    localStorage.removeItem("print_school_logo");
                    localStorage.removeItem("print_secondary_logo");
                    localStorage.removeItem("print_full_kop_image");
                    localStorage.removeItem("print_kop_image_height");

                    setStampCity("Jakarta");
                    setHeadmasterName("Dra. H. Herawati, M.Pd.");
                    setHeadmasterNip("19741002 200112 2 003");
                    setTeacherName(activeClass.teacherName || "Drs. Siswanto, M.Pd.");
                    setTeacherNip("19800514 200904 1 002");
                    setKopType("text");
                    setKopLine1("PEMERINTAH PROVINSI / KOTA");
                    setKopLine2(activeClass.schoolName || "DINAS PENDIDIKAN NASIONAL");
                    setKopLine3("Alamat Instansi Pendidikan Terakreditasi Nasional, Indonesia");
                    setSchoolLogo(null);
                    setSecondaryLogo(null);
                    setFullKopImage(null);
                    setKopImageHeight(90);
                  }
                }}
                className="flex items-center gap-1 text-red-600 hover:text-red-800 font-bold text-[10px] uppercase tracking-wider"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Setelan Kop Surat & Form ke Bawaan
              </button>
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
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-sm shadow-sm transition-all uppercase tracking-wide text-xs"
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
        {/* Kop Surat Dinas Pendidikan Formal / Kustom */}
        {kopType === "image" && fullKopImage ? (
          <div className="text-center border-b-2 border-slate-300 pb-2 mb-5">
            <img 
              src={fullKopImage} 
              alt="Kop Surat" 
              style={{ height: `${kopImageHeight}px` }}
              className="mx-auto object-contain w-full"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <div className="flex items-center justify-between border-b-4 border-double border-black pb-3 mb-5 gap-4 text-left">
            {schoolLogo ? (
              <img 
                src={schoolLogo} 
                alt="Logo Kiri" 
                className="w-16 h-16 object-contain shrink-0" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 bg-slate-50 border border-slate-200 flex items-center justify-center rounded-sm shrink-0">
                <Award className="w-8 h-8 text-slate-400" />
              </div>
            )}
            <div className="text-center flex-1">
              <h2 className="text-[11px] font-bold tracking-wider text-slate-800 uppercase leading-snug">{kopLine1}</h2>
              <h1 className="text-base font-black text-black tracking-wide my-1.5 uppercase leading-none">{kopLine2}</h1>
              <p className="text-[9px] text-slate-600 italic mt-0.5 leading-snug">{kopLine3}</p>
            </div>
            {secondaryLogo ? (
              <img 
                src={secondaryLogo} 
                alt="Logo Kanan" 
                className="w-16 h-16 object-contain shrink-0" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 shrink-0 opacity-0" />
            )}
          </div>
        )}

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
