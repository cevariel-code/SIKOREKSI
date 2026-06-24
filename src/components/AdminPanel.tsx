import React, { useState, useEffect } from "react";
import { Shield, LogOut, Plus, Trash2, Copy, Check, Users, Key, Mail, LayoutDashboard, Database, Info, Calendar, RefreshCw, AlertTriangle, Eye, Lock, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { License } from "../types";

interface AdminPanelProps {
  onLogout: () => void;
  onEnterApp: () => void;
}

// Custom type for display that includes the name if stored or the associated user's profile
interface LicenseWithProfile extends License {
  name?: string;
  userProfile?: {
    full_name: string;
    school_name: string;
  } | null;
}

export default function AdminPanel({ onLogout, onEnterApp }: AdminPanelProps) {
  const [licenses, setLicenses] = useState<LicenseWithProfile[]>([]);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  // Password reset states
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetUserEmail, setResetUserEmail] = useState("");
  const [resetUserName, setResetUserName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  // Load all licenses on mount
  useEffect(() => {
    loadLicenses();
  }, []);

  const loadLicenses = async () => {
    setTableLoading(true);
    setErrorMessage(null);
    try {
      if (!supabase) return;
      
      // Fetch licenses
      const { data: licenseData, error: licenseErr } = await supabase
        .from("licenses")
        .select("*")
        .order("created_at", { ascending: false });

      if (licenseErr) throw licenseErr;

      // Fetch profiles to enrich table information
      const { data: profileData, error: profileErr } = await supabase
        .from("profiles")
        .select("email, full_name, school_name");

      if (profileErr) {
        console.error("Failed to enrich profiles", profileErr);
      }

      // Map profile details (matching on email)
      const enriched: LicenseWithProfile[] = (licenseData || []).map((lic: any) => {
        const prof = (profileData || []).find(
          (p: any) => p.email.toLowerCase() === lic.email.toLowerCase()
        );
        return {
          ...lic,
          name: lic.name || (prof ? prof.full_name : ""),
          userProfile: prof ? { full_name: prof.full_name, school_name: prof.school_name } : null
        };
      });

      setLicenses(enriched);
    } catch (e: any) {
      setErrorMessage("Gagal mengambil data lisensi: " + e.message);
    } finally {
      setTableLoading(false);
    }
  };

  const generateLicenseToken = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const generateSegment = () => {
      let segment = "";
      for (let i = 0; i < 4; i++) {
        segment += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return segment;
    };
    return `KSR-${generateSegment()}-${generateSegment()}-${generateSegment()}`;
  };

  const handleCreateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    setLoading(true);

    const name = newName.trim();
    const email = newEmail.trim().toLowerCase();

    if (!name || !email) {
      setErrorMessage("Silakan isi nama dan email dengan lengkap.");
      setLoading(false);
      return;
    }

    try {
      if (!supabase) return;

      const tokenString = generateLicenseToken();
      const expiredAt = new Date();
      expiredAt.setFullYear(expiredAt.getFullYear() + 1); // Expiration set to exactly 1 year from now

      const newLic = {
        email,
        name,
        token: tokenString,
        status: "active",
        used: false,
        expired_at: expiredAt.toISOString()
      };

      const { error } = await supabase
        .from("licenses")
        .insert(newLic);

      if (error) throw error;

      setNewName("");
      setNewEmail("");
      setSuccessMessage(`Berhasil membuat lisensi untuk ${name}! Token: ${tokenString}`);
      
      // Reload licenses list
      await loadLicenses();
    } catch (err: any) {
      setErrorMessage("Gagal menyimpan lisensi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: "active" | "inactive") => {
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      if (!supabase) return;
      const { error } = await supabase
        .from("licenses")
        .update({ status: nextStatus })
        .eq("id", id);

      if (error) throw error;
      
      // Update locally
      setLicenses(prev => prev.map(lic => lic.id === id ? { ...lic, status: nextStatus } : lic));
    } catch (err: any) {
      alert("Gagal memperbarui status lisensi: " + err.message);
    }
  };

  const handleExtendExpiration = async (id: string, currentExpiredAt: string) => {
    try {
      if (!supabase) return;
      
      const nextDate = new Date(currentExpiredAt);
      nextDate.setFullYear(nextDate.getFullYear() + 1); // Extend for another year
      const isoString = nextDate.toISOString();

      if (confirm(`Apakah Anda yakin ingin memperpanjang masa aktif lisensi ini selama 1 tahun lagi (s.d. ${nextDate.toLocaleDateString("id-ID")})?`)) {
        const { error } = await supabase
          .from("licenses")
          .update({ expired_at: isoString })
          .eq("id", id);

        if (error) throw error;
        
        setLicenses(prev => prev.map(lic => lic.id === id ? { ...lic, expired_at: isoString } : lic));
      }
    } catch (err: any) {
      alert("Gagal memperpanjang masa aktif: " + err.message);
    }
  };

  const handleDeleteLicense = async (id: string, email: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus lisensi milik ${email}? Tindakan ini bersifat permanen.`)) {
      try {
        if (!supabase) return;
        const { error } = await supabase
          .from("licenses")
          .delete()
          .eq("id", id);

        if (error) throw error;
        setLicenses(prev => prev.filter(lic => lic.id !== id));
      } catch (err: any) {
        alert("Gagal menghapus lisensi: " + err.message);
      }
    }
  };

  const handleCopyToken = (tokenValue: string) => {
    navigator.clipboard.writeText(tokenValue);
    setCopiedToken(tokenValue);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetSuccess(null);
    setResetError(null);
    setResetLoading(true);

    try {
      if (!supabase) {
        // Simulation mode
        const savedUsersRaw = localStorage.getItem("abs_simulated_users");
        const savedUsers = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
        const userIndex = savedUsers.findIndex((u: any) => u.email.toLowerCase() === resetUserEmail.toLowerCase());

        if (userIndex === -1) {
          throw new Error("Akun pengguna belum diaktifkan/dibuat di penyimpanan lokal.");
        }

        if (!newPassword || newPassword.trim().length < 6) {
          throw new Error("Kata sandi baru minimal harus 6 karakter.");
        }

        savedUsers[userIndex].password = newPassword.trim();
        localStorage.setItem("abs_simulated_users", JSON.stringify(savedUsers));

        setResetSuccess(`Sandi untuk ${resetUserEmail} berhasil diubah menjadi: "${newPassword.trim()}". Berikan sandi ini kepada guru bersangkutan.`);
        setNewPassword("");
      } else {
        // Supabase Mode
        const { error } = await supabase.auth.resetPasswordForEmail(resetUserEmail, {
          redirectTo: window.location.origin,
        });

        if (error) throw error;

        setResetSuccess(`Link reset kata sandi telah berhasil dikirim ke email: ${resetUserEmail}. Silakan minta pengguna untuk memeriksa kotak masuk (atau folder spam) mereka.`);
      }
    } catch (err: any) {
      setResetError(err.message || "Gagal melakukan reset password.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative select-none">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 py-4 px-6 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-650/20 text-indigo-400 border border-indigo-500/30 rounded-lg">
            <Shield className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest text-white uppercase leading-none">
              Portal Administrator
            </h1>
            <p className="text-[10px] text-slate-400 font-medium mt-1">
              Sistem Manajemen Akses & Pembuatan Token Lisensi Pengguna Terintegrasi Supabase
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onEnterApp}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs transition-all shadow-md shadow-blue-600/15"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Uji Coba Dashboard
          </button>
          
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-extrabold px-3 py-1.5 rounded-lg text-xs transition-colors border border-slate-700"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar
          </button>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side - Generate Token Form */}
        <section className="lg:col-span-4 bg-slate-900/50 border border-slate-800 rounded-2xl p-5 shadow-xl h-fit space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-500" />
              Buat Token Lisensi Baru
            </h2>
            <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
              Isi nama dan email untuk melisensikan akses guru mandiri secara cloud.
            </p>
          </div>

          {successMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl flex items-start gap-2 text-[11px] font-semibold leading-normal">
              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p>{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-start gap-2 text-[11px] font-semibold leading-normal">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p>{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleCreateLicense} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Nama Lengkap Penerima *
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Contoh: Drs. Hermawan, M.Pd."
                className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 text-white font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Alamat Email Pengguna *
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Contoh: hermawan@sekolah.sch.id"
                className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 text-white font-semibold"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-650 to-violet-650 hover:from-indigo-750 hover:to-violet-750 text-white font-black py-2.5 px-4 rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider disabled:opacity-50"
            >
              <Key className="w-4 h-4" />
              {loading ? "Menyimpan ke Database..." : "Hasilkan & Simpan Lisensi"}
            </button>
          </form>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850/60 flex items-start gap-2 text-[10px] text-slate-450 leading-relaxed">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p>
              Sistem akan otomatis menghasilkan token lisensi berformat <code className="text-slate-300 font-mono font-bold">KSR-XXXX-XXXX-XXXX</code> yang aktif selama 1 tahun (365 hari) terhitung sejak tanggal pembuatan.
            </p>
          </div>
        </section>

        {/* Right Side - Table View */}
        <section className="lg:col-span-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col space-y-4">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-3 gap-2">
            <div>
              <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                Daftar Lisensi Supabase ({licenses.length})
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Pemantauan real-time lisensi, status aktivasi, dan masa kedaluwarsa pengguna.
              </p>
            </div>
            
            <button
              onClick={loadLicenses}
              className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-750 transition-all"
            >
              <RefreshCw className="w-3 h-3" /> Refresh Data
            </button>
          </div>

          {/* Table Area */}
          <div className="flex-1 overflow-x-auto">
            {tableLoading ? (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <RefreshCw className="w-6 h-6 mx-auto text-indigo-500 animate-spin" />
                <p className="text-[11px] font-bold uppercase">Mengambil data awan...</p>
              </div>
            ) : licenses.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <Users className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs font-bold uppercase tracking-wider">Belum Ada Lisensi Terdaftar</p>
                <p className="text-[10px] text-slate-600">Gunakan panel kiri untuk membuat lisensi online pertama.</p>
              </div>
            ) : (
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[9px] font-black uppercase tracking-wider">
                    <th className="py-2.5 px-3">Guru / Sekolah</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Token Kunci</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-center">Masa Aktif</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/40">
                  {licenses.map((lic) => {
                    const isExpired = new Date(lic.expired_at) < new Date();
                    return (
                      <tr key={lic.id} className="hover:bg-slate-900/30 transition-colors">
                        {/* Profile Info */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-white leading-tight">
                            {lic.name || <span className="text-slate-600 italic">Belum Diaktivasi</span>}
                          </div>
                          {lic.userProfile?.school_name && (
                            <div className="text-[9px] text-slate-500 mt-0.5">
                              {lic.userProfile.school_name}
                            </div>
                          )}
                        </td>
                        
                        {/* Email */}
                        <td className="py-3 px-3 font-semibold text-slate-300">
                          {lic.email}
                        </td>
                        
                        {/* Token */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            <code className="bg-slate-950 px-2 py-0.5 rounded font-mono font-black text-emerald-400 text-[11px] border border-slate-800">
                              {lic.token}
                            </code>
                            <button
                              onClick={() => handleCopyToken(lic.token)}
                              className="p-1 hover:bg-slate-850 rounded text-slate-400 hover:text-white"
                              title="Salin Token"
                            >
                              {copiedToken === lic.token ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-1">
                            {/* Used/Unused status */}
                            <span>
                              {lic.used ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                                  Terpakai (Aktif)
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                                  Belum Dipakai
                                </span>
                              )}
                            </span>

                            {/* Active/Inactive toggled by admin */}
                            <button
                              onClick={() => handleToggleStatus(lic.id, lic.status)}
                              className={`text-[9px] font-black px-1.5 py-0.5 rounded text-left w-fit uppercase border ${
                                lic.status === "active"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                                  : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                              }`}
                            >
                              {lic.status === "active" ? "● Diizinkan" : "○ Diblokir"}
                            </button>
                          </div>
                        </td>

                        {/* Expiry Date */}
                        <td className="py-3 px-3 text-center">
                          <div className="font-mono text-[10px] font-bold">
                            {new Date(lic.expired_at).toLocaleDateString("id-ID", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          {isExpired ? (
                            <span className="text-[8px] font-black text-red-500 uppercase block mt-0.5">Kedaluwarsa</span>
                          ) : (
                            <span className="text-[8px] font-black text-slate-500 uppercase block mt-0.5">Sisa Waktu Aman</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {lic.used && (
                              <button
                                onClick={() => {
                                  setResetUserEmail(lic.email);
                                  setResetUserName(lic.name || lic.email);
                                  setNewPassword("");
                                  setResetSuccess(null);
                                  setResetError(null);
                                  setResetModalOpen(true);
                                }}
                                className="p-1 hover:bg-amber-500/15 rounded text-amber-400 hover:text-amber-300 transition-colors"
                                title="Reset Password Akun"
                              >
                                <Lock className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleExtendExpiration(lic.id, lic.expired_at)}
                              className="p-1 hover:bg-indigo-500/15 rounded text-indigo-400 hover:text-indigo-300 transition-colors"
                              title="Perpanjang 1 Tahun"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteLicense(lic.id, lic.email)}
                              className="p-1 hover:bg-red-500/15 rounded text-red-400 hover:text-red-300 transition-colors"
                              title="Hapus Lisensi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

        </section>

      </main>

      {/* Modal Reset Password */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="border-b border-slate-800 px-5 py-4 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-2 text-amber-400">
                <Lock className="w-4 h-4" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  Reset Password Akun
                </h3>
              </div>
              <button
                onClick={() => setResetModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-left">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pengguna</div>
                <div className="text-xs font-extrabold text-white">{resetUserName}</div>
                <div className="text-[10px] font-mono text-slate-400">{resetUserEmail}</div>
              </div>

              {resetSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl flex items-start gap-2 text-[11px] font-semibold leading-normal">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p>{resetSuccess}</p>
                </div>
              )}

              {resetError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-start gap-2 text-[11px] font-semibold leading-normal">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p>{resetError}</p>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                {supabase ? (
                  // Supabase Mode Info
                  <div className="space-y-3">
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Sistem terhubung dengan **Supabase Auth**. Demi alasan keamanan, Administrator tidak dapat mengisi kata sandi secara manual di browser. 
                    </p>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Klik tombol di bawah untuk mengirimkan tautan reset kata sandi resmi langsung ke alamat email pengguna. Pengguna dapat mengeklik tautan tersebut untuk mengatur ulang kata sandi mereka secara aman.
                    </p>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-750 hover:to-violet-750 text-white font-black py-2.5 px-4 rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider disabled:opacity-50"
                    >
                      <Mail className="w-4 h-4" />
                      {resetLoading ? "Mengirim Permintaan..." : "Kirim Link Reset via Email"}
                    </button>
                  </div>
                ) : (
                  // Simulation Mode Password Input
                  <div className="space-y-3">
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Aplikasi berjalan dalam **Mode Simulasi Mandiri (LocalStorage)**. Anda dapat mengatur kata sandi baru untuk akun simulasi ini secara langsung.
                    </p>
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Kata Sandi Baru *
                      </label>
                      <input
                        type="text"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full text-xs p-2.5 bg-slate-950 border border-slate-850 rounded-xl focus:border-indigo-500 text-white font-semibold"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#";
                          let randomPass = "";
                          for (let i = 0; i < 8; i++) {
                            randomPass += chars.charAt(Math.floor(Math.random() * chars.length));
                          }
                          setNewPassword(randomPass);
                        }}
                        className="flex-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 font-bold py-2 px-3 rounded-xl border border-slate-700 transition-colors text-[10px] uppercase tracking-wider"
                      >
                        Sandi Acak
                      </button>
                      <button
                        type="submit"
                        disabled={resetLoading}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-black py-2 px-3 rounded-xl shadow-lg transition-colors text-[10px] uppercase tracking-wider disabled:opacity-50"
                      >
                        {resetLoading ? "Menyimpan..." : "Simpan Sandi"}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-800 px-5 py-3 bg-slate-950/40 flex justify-end">
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-3 text-center text-[10px] text-slate-500 font-medium">
        © 2026 Portal Administrator • Semua data lisensi terhubung dan diverifikasi secara aman menggunakan server Supabase.
      </footer>
    </div>
  );
}
