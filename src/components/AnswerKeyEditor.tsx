import React, { useState } from "react";
import { Sparkles, Check, Info, RefreshCw, Trash2 } from "lucide-react";
import { AppClass } from "../types";

interface AnswerKeyEditorProps {
  activeClass: AppClass;
  onUpdateAnswerKey: (nextKey: string[]) => void;
}

export default function AnswerKeyEditor({ activeClass, onUpdateAnswerKey }: AnswerKeyEditorProps) {
  const [keyInputStr, setKeyInputStr] = useState(activeClass.answerKey.join(""));
  const [notice, setNotice] = useState("");

  const handleApplyString = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = keyInputStr.toUpperCase().replace(/[^ABCDE]/g, "");
    
    const nextKey = Array(40).fill("");
    for (let i = 0; i < 40; i++) {
      if (i < clean.length) {
        nextKey[i] = clean[i];
      }
    }
    onUpdateAnswerKey(nextKey);
    setNotice(`Kunci Jawaban telah diperbarui (${clean.length} soal terisi).`);
    setTimeout(() => setNotice(""), 3000);
  };

  const handleSelectOption = (qIdx: number, val: string) => {
    const nextKey = [...activeClass.answerKey];
    nextKey[qIdx] = nextKey[qIdx] === val ? "" : val;
    onUpdateAnswerKey(nextKey);
    setKeyInputStr(nextKey.join(""));
    setNotice("");
  };

  const handleClearKeys = () => {
    if (confirm("Kosongkan semua kunci jawaban?")) {
      onUpdateAnswerKey(Array(40).fill(""));
      setKeyInputStr("");
      setNotice("Semua kunci jawaban telah dikosongkan.");
      setTimeout(() => setNotice(""), 3000);
    }
  };

  const handleLoadSampleKeys = () => {
    const samples = ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"];
    onUpdateAnswerKey(samples);
    setKeyInputStr(samples.join(""));
    setNotice("Kunci jawaban contoh (A-B-C-D-E berulang) berhasil dimuat.");
    setTimeout(() => setNotice(""), 3000);
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      
      {/* Premium Fast Mass Key Input */}
      <div className="bg-slate-900 text-white rounded p-4 border border-black space-y-3 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <h3 className="font-extrabold text-[11px] text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            Pengisian Kunci Jawaban Sekaligus (String input)
          </h3>
          <div className="flex gap-2 text-[10px]">
            <button
              onClick={handleLoadSampleKeys}
              className="px-2 py-1 bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-700 font-bold flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Muat Contoh Keys
            </button>
            <button
              onClick={handleClearKeys}
              className="px-2 py-1 bg-rose-950/40 text-rose-300 hover:text-rose-200 rounded border border-rose-900/40 font-bold flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Kosongkan Keys
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-350 leading-relaxed font-sans">
          Membantu mengisi kunci jawaban 40 soal dalam 1 detik. Cukup ketik / tempel deretan huruf kunci bersebelahan tanpa spasi (contoh: <strong>ABCDEABCDEABCDEABCDEABCDEABCDEABCDEABCDE</strong>).
        </p>

        <form onSubmit={handleApplyString} className="flex gap-2">
          <input
            type="text"
            required
            maxLength={100}
            value={keyInputStr}
            onChange={(e) => setKeyInputStr(e.target.value)}
            className="px-3 py-2 text-xs font-mono font-bold tracking-widest uppercase border border-slate-700 bg-slate-950 text-emerald-400 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 flex-1"
            placeholder="KETIK / TEMPEL DERETAN HURUF KUNCI JAWABAN..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-sm uppercase tracking-wider transition-colors"
          >
            Terapkan Kunci
          </button>
        </form>

        {notice && (
          <div className="text-[11px] text-emerald-400 font-bold font-sans flex items-center gap-1.5 bg-emerald-950/20 px-2.5 py-1.5 rounded-sm border border-emerald-900/30">
            <Check className="w-4 h-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}
      </div>

      {/* Manual interactive 40-question setup grids */}
      <div className="bg-white border border-slate-300 rounded p-4 space-y-4 shadow-2xs">
        <div>
          <h3 className="font-extrabold text-xs text-slate-800 uppercase flex items-center gap-1.5 pb-2 border-b border-slate-150">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            Editor Kunci Jawaban Interaktif (40 PG)
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 font-sans">
            Klik salah satu tombol A, B, C, D, E di bawah nomor soal untuk menentukan kunci jawaban yang benar.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array(40).fill(null).map((_, idx) => {
            const num = idx + 1;
            const currentSelected = activeClass.answerKey[idx] || "";
            
            return (
              <div key={idx} className="border border-slate-200 rounded p-2.5 flex flex-col justify-between space-y-2 bg-slate-50/25">
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="font-black text-slate-700 font-mono">SOAL {num}</span>
                  <span className="font-extrabold text-blue-700 bg-blue-50/50 border border-blue-100 px-1.5 rounded">
                    Key: {currentSelected || "-"}
                  </span>
                </div>

                {/* Option Toggles Layout */}
                <div className="flex justify-between gap-1">
                  {["A", "B", "C", "D", "E"].map((letter) => {
                    const isSelected = currentSelected === letter;
                    return (
                      <button
                        key={letter}
                        onClick={() => handleSelectOption(idx, letter)}
                        className={`flex-1 h-7 rounded text-[11px] font-bold border transition-all ${
                          isSelected
                            ? "bg-indigo-700 text-white border-indigo-800 font-black shadow-sm"
                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-[10.5px] text-slate-400 font-sans flex items-center gap-1.5 bg-slate-50 p-2.5 rounded border border-slate-200">
        <Info className="w-4 h-4 text-slate-500 shrink-0" />
        <span>Kombinasi kunci ini akan langsung diintegrasikan secara real-time ke dalam penilaian dan modul analisis butir kesulitan soal.</span>
      </div>

    </div>
  );
}
