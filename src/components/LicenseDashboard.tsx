import React, { useEffect, useState } from "react";
import { Key, ShieldCheck, Calendar, Award, Building, User, Info, Check, RefreshCw, Sparkles, Cloud } from "lucide-react";
import { supabase } from "../lib/supabase";
import { AuthSession } from "../types";

interface LicenseDashboardProps {
  authSession: AuthSession;
}

interface LicenseDetails {
  token: string;
  expired_at: string;
  status: string;
  created_at: string;
}

export default function LicenseDashboard({ authSession }: LicenseDashboardProps) {
  const [license, setLicense] = useState<LicenseDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authSession.type === "user") {
      fetchLicenseDetails();
    }
  }, [authSession]);

  const fetchLicenseDetails = async () => {
    setLoading(true);
    try {
      if (!supabase || authSession.type !== "user") return;
      const { data, error } = await supabase
        .from("licenses")
        .select("token, expired_at, status, created_at")
        .eq("email", authSession.email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setLicense(data);
    } catch (e) {
      console.error("Gagal memuat detail lisensi", e);
    } finally {
      setLoading(false);
    }
  };

  // Safe formatting helpers
  const maskToken = (tok: string): string => {
    if (!tok) return "KSR-XXXX-XXXX-XXXX";
    const parts = tok.split("-");
    if (parts.length < 4) return tok;
    return `KSR-${parts[1]}-••••-••••`;
  };

  const getDaysRemaining = (expiryDateStr: string): number => {
    if (!expiryDateStr) return 0;
    const expiry = new Date(expiryDateStr);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  if (authSession.type !== "user") {
    return (
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3">
        <ShieldCheck className="w-8 h-8 text-indigo-400 mx-auto animate-pulse" />
        <p className="text-xs font-bold text-white uppercase tracking-wider">Halaman Sesi Administrator</p>
        <p className="text-[11px] text-slate-400">Gunakan Portal Administrator untuk mengelola seluruh lisensi.</p>
      </div>
    );
  }

  const daysRemaining = license ? getDaysRemaining(license.expired_at) : 365;
  const isAboutToExpire = daysRemaining <= 30;

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-6 font-sans">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        {/* Background ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 z-10">
          <div className="p-3 bg-indigo-600/10 text-indigo-400 border border-indigo-500/30 rounded-xl">
            <Award className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <span className="text-[9px] font-black tracking-widest text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-900/40 uppercase">
              Premium Plan
            </span>
            <h1 className="text-lg md:text-xl font-black text-white uppercase mt-1 tracking-tight">
              Sertifikasi & Lisensi Guru
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              Akses premium penuh, sinkronisasi cloud database terenkripsi, & analisis instan terverifikasi.
            </p>
          </div>
        </div>

        <button
          onClick={fetchLicenseDetails}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-750 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> 
          Perbarui Status
        </button>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Side: Status Cards */}
        <div className="md:col-span-7 space-y-6">
          
          {/* Card 1: License Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
            <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <Key className="w-4 h-4 text-emerald-400" />
              Rincian Kunci Lisensi
            </h2>

            {loading ? (
              <div className="py-6 text-center text-slate-500 font-medium text-xs animate-pulse">
                Menghubungkan ke server basis data...
              </div>
            ) : (
              <div className="space-y-3.5">
                {/* Email License */}
                <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-850">
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-slate-500" />
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-black">Email Pemegang</span>
                      <span className="text-slate-200 text-xs font-bold">{authSession.email}</span>
                    </div>
                  </div>
                </div>

                {/* Token License */}
                <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-850">
                  <div className="flex items-center gap-2.5">
                    <Key className="w-4 h-4 text-slate-500" />
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-black">Kode Lisensi Anda</span>
                      <code className="text-emerald-400 font-mono text-xs font-black tracking-wide">
                        {license ? maskToken(license.token) : "KSR-XXXX-••••-••••"}
                      </code>
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-[8px] text-slate-500 block uppercase font-black">Status Keamanan</span>
                      <span className="text-emerald-400 text-[11px] font-black uppercase">Aktif & Sah</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <span className="text-[8px] text-slate-500 block uppercase font-black">Database Cloud</span>
                      <span className="text-indigo-400 text-[11px] font-black uppercase">Aktif (Sinkron)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Expiration Information */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <Calendar className="w-4 h-4 text-amber-500" />
              Masa Kedaluwarsa Lisensi
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-center space-y-1">
                <span className="text-[8px] text-slate-500 block uppercase font-black">Berakhir Pada Tanggal</span>
                <span className="text-white text-sm font-black font-mono block">
                  {license 
                    ? new Date(license.expired_at).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Menghitung..."}
                </span>
              </div>

              <div className={`p-4 rounded-xl border text-center space-y-1 ${
                isAboutToExpire 
                  ? "bg-red-500/10 border-red-500/20 text-red-400" 
                  : "bg-slate-950 border-slate-850 text-emerald-400"
              }`}>
                <span className="text-[8px] text-slate-500 block uppercase font-black">Sisa Waktu Masa Aktif</span>
                <span className="text-xl font-black font-mono block">
                  {daysRemaining} Hari
                </span>
              </div>
            </div>

            {isAboutToExpire && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3.5 rounded-xl flex items-start gap-2.5 text-[11px] leading-relaxed">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p>
                  Masa aktif lisensi Anda akan berakhir kurang dari 30 hari lagi. Silakan hubungi Administrator sistem untuk memperpanjang lisensi Anda agar terhindar dari pemblokiran akses.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Features Included */}
        <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg h-fit space-y-4">
          <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            Fitur Paket Premium Anda
          </h2>

          <div className="space-y-3.5 text-xs text-slate-300">
            <div className="flex items-start gap-2.5">
              <div className="p-0.5 bg-emerald-500/10 border border-emerald-500/25 rounded text-emerald-400 shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <p className="leading-relaxed">
                <strong className="text-white">Penyimpanan Otomatis Awan (Cloud Sync):</strong> Semua kelas, siswa, & kriteria kelulusan disimpan secara cloud di Supabase, aman & tidak pernah hilang sekalipun cache browser dibersihkan.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-0.5 bg-emerald-500/10 border border-emerald-500/25 rounded text-emerald-400 shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <p className="leading-relaxed">
                <strong className="text-white">Evaluasi Butir Soal Tanpa Batas:</strong> Lakukan pengolahan daya beda, tingkat kesukaran, dan efektivitas pengecoh secara instan untuk seluruh kelas Anda tanpa kuota harian.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-0.5 bg-emerald-500/10 border border-emerald-500/25 rounded text-emerald-400 shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <p className="leading-relaxed">
                <strong className="text-white">Formulasi Sesuai Standar Pendidikan:</strong> Komputasi korelasi Product Moment Pearson (validitas) & Kuder-Richardson KR-20 (reliabilitas) yang akurat.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-0.5 bg-emerald-500/10 border border-emerald-500/25 rounded text-emerald-400 shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <p className="leading-relaxed">
                <strong className="text-white">Cetak Laporan Siap Pakai:</strong> Hasilkan format cetak analisis kelas & ekspor cetak biru formula Microsoft Excel secara native dengan satu klik.
              </p>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-start gap-2.5 text-[10px] text-slate-500 leading-normal">
            <Building className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-[8px] font-black uppercase text-slate-600 block">Afiliasi Instansi</span>
              <span className="text-slate-300 font-bold">{authSession.school_name}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
