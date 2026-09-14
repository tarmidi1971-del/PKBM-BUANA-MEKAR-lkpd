import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Award,
  Layers,
  GraduationCap,
  FileSpreadsheet,
  Clock,
  Printer,
  Sparkles,
  ChevronRight,
  FileDown,
  Home,
  ArrowLeft
} from 'lucide-react';
import { GradeLevel, SubjectModule } from '../types';
import { GRADE_CONFIG, ALL_SUBJECTS } from '../data/subjectMeta';
import { getSubjectIcon } from './SubjectGrid';

interface CurriculumSummaryViewProps {
  currentGrade: GradeLevel;
  onSelectGrade: (grade: GradeLevel) => void;
  modules: SubjectModule[];
  onSelectSubject: (module: SubjectModule) => void;
  onOpenBatchDownload: () => void;
  onBackToDashboard?: () => void;
}

export const CurriculumSummaryView: React.FC<CurriculumSummaryViewProps> = ({
  currentGrade,
  onSelectGrade,
  modules,
  onSelectSubject,
  onOpenBatchDownload,
  onBackToDashboard
}) => {
  const isPaketB = currentGrade <= 9;
  const gradeConfig = GRADE_CONFIG.find(g => g.grade === currentGrade) || GRADE_CONFIG[0];
  const gradeModules = modules.filter(m => m.grade === currentGrade);

  const wajib = gradeModules.filter(m => m.category === 'wajib');
  const peminatan = gradeModules.filter(m => m.category === 'peminatan');
  const pemberdayaan = gradeModules.filter(m => m.category === 'pemberdayaan');
  const vokasi = gradeModules.filter(m => m.category === 'keterampilan-vokasi');
  const mulok = gradeModules.filter(m => m.category === 'muatan-lokal');

  return (
    <div className="max-w-6xl w-full mx-auto space-y-4 text-slate-800">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-xl p-4 text-white border border-blue-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
            <GraduationCap className="w-6 h-6 text-blue-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                {isPaketB ? 'Paket B (Setara SMP)' : 'Paket C (Setara SMA)'}
              </span>
              <span className="text-xs text-blue-200 font-semibold">{gradeConfig.phase}</span>
            </div>
            <h2 className="text-lg font-bold mt-0.5">
              Struktur Kurikulum Merdeka & Menu {gradeModules.length} Mapel • Kelas {currentGrade}
            </h2>
            <p className="text-xs text-blue-200">
              PKBM Buana Mekar — Model Homeschooling Terpadu (Tatap Muka, Mandiri, Proyek, Vokasi)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Home className="w-4 h-4 text-blue-200" />
              <span>Kembali ke Dashboard Awal</span>
            </button>
          )}

          <button
            onClick={onOpenBatchDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-white" />
            <span>Simpan PDF & Cetak</span>
          </button>
        </div>
      </div>

      {/* Grade Selector Tabs */}
      <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs flex items-center gap-1.5 overflow-x-auto">
        <span className="text-xs font-bold text-slate-500 px-2 shrink-0">Pilih Jenjang:</span>
        {[7, 8, 9, 10, 11, 12].map(g => {
          const isActive = currentGrade === g;
          const label = g <= 9 ? `SMP Kelas ${g}` : `SMA Kelas ${g}`;
          return (
            <button
              key={g}
              onClick={() => onSelectGrade(g as GradeLevel)}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Major Groups Summary */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${peminatan.length > 0 ? '4' : '3'} gap-3`}>
        {/* Kelompok Wajib */}
        <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 text-blue-800 rounded">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">Kelompok Wajib ({wajib.length} Mapel)</h3>
            </div>
            <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
              {wajib.length * 8} LKPD
            </span>
          </div>
          <div className="space-y-1 text-xs">
            {wajib.map(m => (
              <div
                key={m.id}
                onClick={() => onSelectSubject(m)}
                className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer text-slate-700 hover:text-blue-900 transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-5 h-5 rounded bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    {getSubjectIcon(m.icon, "w-3 h-3")}
                  </div>
                  <span className="truncate text-[11px] font-medium">{m.name}</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Kelompok Peminatan / Pilihan jika ada */}
        {peminatan.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 text-indigo-800 rounded">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Pilihan / Peminatan ({peminatan.length} Mapel)</h3>
              </div>
              <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded">
                {peminatan.length * 8} LKPD
              </span>
            </div>
            <div className="space-y-1 text-xs">
              {peminatan.map(m => (
                <div
                  key={m.id}
                  onClick={() => onSelectSubject(m)}
                  className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer text-slate-700 hover:text-indigo-900 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-5 h-5 rounded bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                      {getSubjectIcon(m.icon, "w-3 h-3")}
                    </div>
                    <span className="truncate text-[11px] font-medium">{m.name}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kelompok Keterampilan Vokasi */}
        <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 text-purple-800 rounded">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">Keterampilan Vokasi ({vokasi.length} Mapel)</h3>
            </div>
            <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded">
              {vokasi.length * 8} LKPD
            </span>
          </div>
          <div className="space-y-1 text-xs">
            {vokasi.map(m => (
              <div
                key={m.id}
                onClick={() => onSelectSubject(m)}
                className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer text-slate-700 hover:text-purple-900 transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-5 h-5 rounded bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                    {getSubjectIcon(m.icon, "w-3 h-3")}
                  </div>
                  <span className="truncate text-[11px] font-medium">{m.name}</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Kelompok Pemberdayaan & Prinsip Pembelajaran */}
        <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Pemberdayaan ({pemberdayaan.length} Mapel)</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                {pemberdayaan.length * 8} LKPD
              </span>
            </div>
            <div className="space-y-1 text-xs mb-3">
              {pemberdayaan.map(m => (
                <div
                  key={m.id}
                  onClick={() => onSelectSubject(m)}
                  className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer text-slate-700 hover:text-emerald-900 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-5 h-5 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      {getSubjectIcon(m.icon, "w-3 h-3")}
                    </div>
                    <span className="truncate text-[11px] font-medium">{m.name}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[10px] text-slate-600 space-y-1">
            <div className="font-bold text-slate-800">Prinsip Homeschooling Terpadu:</div>
            <div>• 40% Pembelajaran Tatap Muka & Bimbingan Mandiri</div>
            <div>• 30% Praktik Proyek Nyata & Portofolio</div>
            <div>• 30% Keterampilan Vokasi Berdaya Jual</div>
          </div>
        </div>
      </div>
    </div>
  );
};
