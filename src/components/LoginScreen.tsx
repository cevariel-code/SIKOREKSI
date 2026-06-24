import React, { useState } from "react";
import { Shield, Key, Mail, Lock, User, BookOpen, AlertCircle, CheckCircle2, ArrowRight, HelpCircle, Sparkles } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { AuthSession } from "../types";

interface LoginScreenProps {
  onLoginSuccess: (session: AuthSession) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState<"login" | "activate">("login");
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Activation fields
  const [actEmail, setActEmail] = useState("");
  const [actToken, setActToken] = useState("");
  const [actPassword, setActPassword] = useState("");
  const [actFullName, setActFullName] = useState("");
  const [actSchoolName, setActSchoolName] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Simulated DB handles for offline fallback
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const email = loginEmail.trim();
    const password = loginPassword;

    // SIMULATION FALLBACK
    if (!isSupabaseConfigured || !supabase) {
      try {
        if (email.toLowerCase() === "cevariel@gmail.com" || email.toLowerCase() === "admin@gmail.com" || email.toLowerCase() === "admin@sekolah.sch.id") {
          onLoginSuccess({
            type: "admin",
            id: "sim-admin",
            email: email,
            name: "Administrator Utama (Demo)"
          });
          return;
        }

        const savedUsersRaw = localStorage.getItem("abs_simulated_users");
        const savedUsers = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
        const userFound = savedUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

        if (userFound) {
          if (userFound.password !== password) {
            throw new Error("Kata sandi simulasi yang Anda masukkan salah.");
          }
          onLoginSuccess({
            type: "user",
            id: userFound.id,
            email: userFound.email,
            name: userFound.name,
            school_name: userFound.school_name,
            token: userFound.token
          });
          return;
        }

        // Auto-create teacher demo on other emails for seamless UX
        const dummyTeacher = {
          id: "sim-guru-auto",
          email: email,
          name: "Guru Pengampu (Simulasi)",
          school_name: "SMA Negeri 1 Jakarta",
          token: "KSR-SIMULATED-DEMO"
        };
        onLoginSuccess({
          type: "user",
          ...dummyTeacher
        });
      } catch (err: any) {
        setErrorMsg(err.message || "Gagal masuk.");
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      // 1. Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message === "Invalid login credentials" 
          ? "Email atau password yang Anda masukkan salah." 
          : error.message
        );
      }

      if (!data.user) {
        throw new Error("Gagal mengambil data user.");
      }

      const user = data.user;
      const role = user.user_metadata?.role || "user";
      const userEmail = user.email || email;

      // Handle Admin role
      if (role === "admin" || userEmail.toLowerCase() === "cevariel@gmail.com") {
        // If they are an admin but role isn't saved in metadata yet, update it
        if (role !== "admin") {
          await supabase.auth.updateUser({
            data: { role: "admin" }
          });
        }

        onLoginSuccess({
          type: "admin",
          id: user.id,
          email: userEmail,
          name: user.user_metadata?.full_name || "Administrator"
        });
        return;
      }

      // Handle User role: Verify license first!
      const { data: license, error: licenseErr } = await supabase
        .from("licenses")
        .select("*")
        .eq("email", userEmail)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (licenseErr) {
        throw new Error("Gagal memverifikasi status lisensi: " + licenseErr.message);
      }

      if (!license) {
        throw new Error("Lisensi untuk email ini tidak ditemukan. Silakan hubungi Administrator.");
      }

      if (license.status !== "active") {
        throw new Error("Lisensi Anda telah dinonaktifkan oleh Administrator.");
      }

      const expiryDate = new Date(license.expired_at);
      if (expiryDate < new Date()) {
        throw new Error(`Lisensi Anda telah kedaluwarsa pada ${expiryDate.toLocaleDateString("id-ID")}. Silakan hubungi Administrator.`);
      }

      // Fetch Profile
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileErr) {
        console.error("Error fetching profile", profileErr);
      }

      onLoginSuccess({
        type: "user",
        id: user.id,
        email: userEmail,
        name: profile?.full_name || user.user_metadata?.full_name || "Guru Pengampu",
        school_name: profile?.school_name || user.user_metadata?.school_name || "Satuan Sekolah"
      });

    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat masuk.");
    } finally {
      setLoading(false);
    }
  };

  const handleActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const email = actEmail.trim();
    const token = actToken.trim().toUpperCase();
    const password = actPassword;
    const fullName = actFullName.trim();
    const schoolName = actSchoolName.trim();

    if (password.length < 6) {
      setErrorMsg("Password minimal harus terdiri dari 6 karakter.");
      setLoading(false);
      return;
    }

    // SIMULATION FALLBACK
    if (!isSupabaseConfigured || !supabase) {
      try {
        const savedUsersRaw = localStorage.getItem("abs_simulated_users");
        const savedUsers = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];

        if (savedUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
          throw new Error("Email ini sudah pernah diaktifkan secara simulasi.");
        }

        const newUser = {
          id: "sim-" + Math.random().toString(36).substr(2, 9),
          email,
          password,
          name: fullName,
          school_name: schoolName,
          token: token || "KSR-SIMULATED-DEMO"
        };

        savedUsers.push(newUser);
        localStorage.setItem("abs_simulated_users", JSON.stringify(savedUsers));

        setSuccessMsg("Aktivasi Akun Simulasi Berhasil! Silakan masuk di tab 'Masuk Akun' menggunakan email dan password Anda.");
        setActEmail("");
        setActToken("");
        setActPassword("");
        setActFullName("");
        setActSchoolName("");
        setLoginEmail(email);
        setActiveTab("login");
      } catch (err: any) {
        setErrorMsg(err.message || "Gagal melakukan aktivasi simulasi.");
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      // 1. Verifikasi lisensi di database Supabase terlebih dahulu
      const { data: license, error: licenseErr } = await supabase
        .from("licenses")
        .select("*")
        .eq("email", email)
        .eq("token", token)
        .maybeSingle();

      if (licenseErr) {
        throw new Error("Koneksi gagal saat memverifikasi lisensi: " + licenseErr.message);
      }

      if (!license) {
        throw new Error("Token lisensi tidak cocok dengan email ini, silakan periksa kembali.");
      }

      if (license.used) {
        throw new Error("Lisensi ini sudah pernah digunakan untuk mengaktifkan akun.");
      }

      if (license.status !== "active") {
        throw new Error("Lisensi ini telah dinonaktifkan oleh Administrator.");
      }

      const expiryDate = new Date(license.expired_at);
      if (expiryDate < new Date()) {
        throw new Error(`Lisensi ini sudah kedaluwarsa sejak tanggal ${expiryDate.toLocaleDateString("id-ID")}.`);
      }

      // 2. Jika valid, buat akun Supabase Auth baru
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            school_name: schoolName,
            role: "user"
          }
        }
      });

      if (signUpErr) {
        if (signUpErr.message.toLowerCase().includes("rate limit") || signUpErr.message.toLowerCase().includes("limit exceeded")) {
          throw new Error("Pendaftaran akun gagal karena batas limit pengiriman email Supabase terlampaui (Email Rate Limit Exceeded).\n\nIni adalah pembatasan default dari sistem keamanan email Supabase.");
        }
        throw new Error("Pendaftaran akun gagal: " + signUpErr.message);
      }

      const newUser = signUpData.user;
      if (!newUser) {
        throw new Error("Gagal memperoleh ID pengguna baru dari sistem keamanan.");
      }

      // 3. Masukkan profil pengguna baru ke dalam tabel profiles
      const { error: profileErr } = await supabase
        .from("profiles")
        .insert({
          id: newUser.id,
          email: email,
          full_name: fullName,
          school_name: schoolName,
          classes: [] // default empty classes array
        });

      if (profileErr) {
        console.error("Gagal membuat profil database (non-blocking):", profileErr.message);
      }

      // 4. Update status lisensi menjadi terpakai (used = true) setelah berhasil dibuat
      const { error: updateLicenseErr } = await supabase
        .from("licenses")
        .update({ used: true })
        .eq("id", license.id);

      if (updateLicenseErr) {
        console.error("Gagal memperbarui status lisensi di database:", updateLicenseErr.message);
      }

      // Sukses!
      setSuccessMsg("Aktivasi Akun Berhasil! Akun Anda aktif. Silakan masuk di tab 'Masuk Akun' menggunakan email dan password Anda.");
      
      // Reset form fields
      setActEmail("");
      setActToken("");
      setActPassword("");
      setActFullName("");
      setActSchoolName("");
      
      // Auto switch to login tab with prefilled email
      setLoginEmail(email);
      setActiveTab("login");

    } catch (err: any) {
      setErrorMsg(err.message || "Gagal melakukan aktivasi akun.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* Ambient background lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        
        {/* Logo / Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-2xl shadow-xl border border-blue-500/30 text-white font-black text-xl tracking-wide mb-2 animate-pulse">
            PG
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase">
            Analisis & Koreksi Soal PG
          </h1>
          <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
            Sistem analisis butir soal pilihan ganda, tingkat kesulitan, daya beda, & mutu pengecoh berbasis komputasi online.
          </p>
        </div>

        {/* Simulation Mode Banner & One-click logins */}
        {(!isSupabaseConfigured || !supabase) && (
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl shrink-0">
                <AlertCircle className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  Mode Simulasi Offline Aktif
                </h2>
                <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                  Basis data Supabase belum terkonfigurasi. Anda dapat menggunakan aplikasi ini secara penuh langsung menggunakan **Mode Simulasi Mandiri (LocalStorage)**.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  onLoginSuccess({
                    type: "user",
                    id: "sim-guru-demo",
                    email: "guru@sekolah.sch.id",
                    name: "Drs. Siswanto, M.Pd.",
                    school_name: "SMA Negeri 1 Jakarta",
                    token: "KSR-SIMULASI-DEMO"
                  });
                }}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-750 text-white font-black text-[10px] rounded-xl shadow uppercase tracking-wider transition-all cursor-pointer text-center"
              >
                Masuk Guru (Demo)
              </button>
              <button
                type="button"
                onClick={() => {
                  onLoginSuccess({
                    type: "admin",
                    id: "sim-admin-demo",
                    email: "cevariel@gmail.com",
                    name: "Administrator Utama"
                  });
                }}
                className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-750 text-amber-400 border border-amber-500/30 font-black text-[10px] rounded-xl shadow uppercase tracking-wider transition-all cursor-pointer text-center"
              >
                Masuk Admin (Demo)
              </button>
            </div>

            <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl text-[11px] space-y-2">
              <p className="font-bold text-slate-400 uppercase tracking-wide text-[9px]">Panduan Integrasi Supabase Riil:</p>
              <ol className="list-decimal pl-4 space-y-1 text-slate-400 text-[10px] leading-normal font-medium">
                <li>Masukkan kredensial Supabase Anda di panel <strong>Secrets (AI Studio)</strong>.</li>
                <li>Gunakan kunci: <code className="text-emerald-450 font-mono">VITE_SUPABASE_URL</code> & <code className="text-emerald-450 font-mono">VITE_SUPABASE_ANON_KEY</code>.</li>
                <li>Setelah disimpan, status cloud otomatis berubah menjadi aktif dan sah.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Auth Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
          
          {/* Navigation Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
            <button
              onClick={() => {
                setActiveTab("login");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "login"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Masuk Akun
            </button>
            <button
              onClick={() => {
                setActiveTab("activate");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "activate"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Aktivasi Lisensi Baru
            </button>
          </div>

          {/* Error and Success notifications */}
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-2 text-left w-full">
                <p className="font-semibold leading-normal whitespace-pre-line">{errorMsg}</p>
                {(errorMsg.includes("limit pengiriman email") || errorMsg.toLowerCase().includes("rate limit")) && (
                  <div className="bg-slate-950 p-3 rounded-lg border border-red-550/20 space-y-2 text-[10.5px] text-slate-300 leading-relaxed font-medium">
                    <p className="text-amber-400 font-extrabold uppercase tracking-wider text-[9px]">Langkah Cepat Menyelesaikan (Solusi):</p>
                    <ol className="list-decimal pl-4 space-y-1.5 text-slate-300">
                      <li>Buka Dashboard <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-bold">Supabase.com</a> Anda.</li>
                      <li>Masuk ke proyek Anda, lalu buka menu <strong className="text-white">Authentication</strong> di bilah sisi kiri.</li>
                      <li>Pilih menu tab <strong className="text-white">Providers</strong>, lalu klik tab <strong className="text-white">Email</strong> untuk membuka detail konfigurasinya.</li>
                      <li>Cari opsi <strong className="text-white">"Confirm email"</strong> (Konfirmasi email) dan <strong className="text-amber-400">NONAKTIFKAN / MATIKAN (Disable)</strong> opsi tersebut.</li>
                      <li>Klik tombol <strong className="text-emerald-450">Save</strong> di bagian paling bawah.</li>
                    </ol>
                    <p className="text-slate-400 text-[10px] italic">Setelah Anda mematikan "Confirm email", silakan coba aktivasi kembali di sini. Pengguna akan terdaftar secara langsung secara instan tanpa limitasi email!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl flex items-start gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="font-semibold leading-normal">{successMsg}</p>
            </div>
          )}

          {/* Render Tab 1: Login */}
          {activeTab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Alamat Email Anda
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nama@sekolah.sch.id"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs font-semibold text-white transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Kata Sandi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs font-semibold text-white transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-750 text-white font-black py-3 px-4 rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Menghubungkan ke Server..." : "Masuk ke Aplikasi"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Render Tab 2: Activation */
            <form onSubmit={handleActivation} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Nama Lengkap Guru Pengampu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={actFullName}
                    onChange={(e) => setActFullName(e.target.value)}
                    placeholder="Contoh: Drs. Budiman, M.Pd."
                    className="block w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-blue-500 text-xs font-semibold text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Nama Satuan Sekolah / Instansi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BookOpen className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={actSchoolName}
                    onChange={(e) => setActSchoolName(e.target.value)}
                    placeholder="Contoh: SMA Negeri 1 Jakarta"
                    className="block w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-blue-500 text-xs font-semibold text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Alamat Email (Untuk Lisensi)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="email"
                    required
                    value={actEmail}
                    onChange={(e) => setActEmail(e.target.value)}
                    placeholder="nama@sekolah.sch.id"
                    className="block w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-blue-500 text-xs font-semibold text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Token Lisensi (KSR-XXXX-XXXX-XXXX)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={actToken}
                    onChange={(e) => setActToken(e.target.value)}
                    placeholder="KSR-XXXX-XXXX-XXXX"
                    className="block w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-blue-500 text-xs font-bold text-white tracking-widest placeholder:tracking-normal placeholder:font-normal uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Buat Kata Sandi Akun baru (min. 6 Karakter)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    required
                    value={actPassword}
                    onChange={(e) => setActPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-blue-500 text-xs font-semibold text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-650 hover:from-emerald-700 hover:to-teal-750 text-white font-black py-2.5 px-4 rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider disabled:opacity-50"
              >
                {loading ? "Memproses Aktivasi..." : "Aktifkan Akun Sekarang"}
                <Sparkles className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

        {/* Footer info text */}
        <div className="text-center">
          <p className="text-[10px] text-slate-600 font-medium tracking-wide uppercase">
            © 2026 Aplikasi Analisis Butir Soal • Cloud Database Ready
          </p>
        </div>

      </div>
    </div>
  );
}
