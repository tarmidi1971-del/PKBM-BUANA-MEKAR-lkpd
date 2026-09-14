import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Search,
  CheckCircle2,
  BookOpen,
  Layers,
  Sparkles,
  FileText,
  FileDown,
  Info,
  HelpCircle,
  MessageCircle
} from 'lucide-react';
import { GradeLevel, SubjectModule } from '../types';
import { getSubjectIcon } from './SubjectGrid';

interface BatchDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  modules: SubjectModule[];
  onPrintSubject: (module: SubjectModule) => void;
  onShareWhatsAppSubject?: (module: SubjectModule) => void;
}

export const BatchDownloadModal: React.FC<BatchDownloadModalProps> = ({
  isOpen,
  onClose,
  modules,
  onPrintSubject,
  onShareWhatsAppSubject,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'all'>('all');
  const [search, setSearch] = useState<string>('');
  const [showGuide, setShowGuide] = useState<boolean>(true);

  if (!isOpen) return null;

  const filtered = modules.filter(m => {
    if (selectedGrade !== 'all' && m.grade !== selectedGrade) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl border border-slate-300 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b-2 border-blue-800 flex items-center justify-between bg-blue-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-red-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <span>Menu Simpan PDF & Cetak Dokumen LKPD</span>
                <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded font-mono font-bold">
                  PDF A4 Ready
                </span>
              </h3>
              <p className="text-[11px] text-blue-200">
                Pilih mata pelajaran untuk diunduh sebagai file PDF atau langsung dicetak ke kertas A4
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-blue-300 hover:text-white hover:bg-blue-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* How to save as PDF Guide Banner */}
        {showGuide && (
          <div className="bg-amber-50 border-b border-amber-200 p-3 text-xs text-amber-950 flex items-start justify-between gap-3 shrink-0">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-[11px]">
                <span className="font-bold text-amber-900">
                  Cara Menyimpan Dokumen Menjadi File PDF Siap Cetak:
                </span>
                <p className="text-amber-800">
                  1. Klik tombol <strong>"Simpan PDF (1 Tahun / 8 Unit)"</strong> pada mapel yang dipilih. <br />
                  2. Pada jendela cetak browser, ubah <em>Tujuan / Destination</em> menjadi <strong>"Save as PDF" / "Simpan sebagai PDF"</strong>. <br />
                  3. Format kertas otomatis teratur rapi berstandar A4 (Kop surat, identitas, tabel, & tanda tangan).
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="text-amber-600 hover:text-amber-900 text-[10px] underline shrink-0"
            >
              Tutup Petunjuk
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          {/* Grade selection */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedGrade('all')}
              className={`px-2.5 py-1 rounded font-bold transition-all text-xs ${
                selectedGrade === 'all'
                  ? 'bg-blue-900 text-white shadow-2xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Semua (90 Modul)
            </button>
            {[7, 8, 9].map(g => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g as GradeLevel)}
                className={`px-2.5 py-1 rounded font-bold transition-all text-xs ${
                  selectedGrade === g
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                SMP Kelas {g}
              </button>
            ))}
            {[10, 11, 12].map(g => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g as GradeLevel)}
                className={`px-2.5 py-1 rounded font-bold transition-all text-xs ${
                  selectedGrade === g
                    ? 'bg-indigo-700 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                SMA Kelas {g}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari mata pelajaran..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Module List */}
        <div className="p-3 sm:p-4 overflow-y-auto divide-y divide-slate-100 space-y-1.5 flex-1">
          {filtered.map(mod => {
            const isSMP = mod.grade <= 9;
            const isVocational = mod.category === 'keterampilan-vokasi';

            return (
              <div
                key={mod.id}
                className="pt-2 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 rounded-lg hover:bg-slate-50 border border-slate-200/80 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                      isVocational
                        ? 'bg-purple-100 text-purple-700'
                        : isSMP
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {getSubjectIcon(mod.icon, "w-4 h-4")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-slate-900">{mod.name}</h4>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          isSMP
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}
                      >
                        Kelas {mod.grade} ({isSMP ? 'Paket B' : 'Paket C'})
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Berisi 8 LKPD Lengkap (Semester 1 & 2) • Siap Cetak / Simpan File PDF
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 flex-wrap">
                  {onShareWhatsAppSubject && (
                    <button
                      onClick={() => {
                        onClose();
                        onShareWhatsAppSubject(mod);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs shadow-2xs transition-all"
                      title="Kirim link pengerjaan tugas mapel ini via WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white/20" />
                      <span>Kirim WA</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onPrintSubject(mod);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-xs shadow-2xs transition-all"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Simpan PDF</span>
                  </button>
                  <button
                    onClick={() => {
                      onPrintSubject(mod);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded font-semibold text-xs transition-all"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-300" />
                    <span className="hidden sm:inline">Cetak</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <span className="text-[11px] font-medium">
            Menampilkan <strong>{filtered.length}</strong> modul PDF siap cetak
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1 bg-white border border-slate-300 rounded text-slate-700 font-semibold hover:bg-slate-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
