import React, { useState } from 'react';
import {
  BookOpen,
  ShieldCheck,
  Feather,
  Calculator,
  Atom,
  Globe,
  Languages,
  Cpu,
  Activity,
  Palette,
  Users,
  Laptop,
  Scissors,
  Sparkles,
  UtensilsCrossed,
  Layers,
  ChevronRight,
  Printer,
  CheckCircle2,
  FileText,
  FileDown,
  MessageCircle
} from 'lucide-react';
import { GradeLevel, SubjectModule } from '../types';

interface SubjectGridProps {
  modules: SubjectModule[];
  currentGrade: GradeLevel;
  selectedModule: SubjectModule | null;
  onSelectModule: (module: SubjectModule) => void;
  onQuickPrintSubject: (module: SubjectModule) => void;
  onShareWhatsAppSubject?: (module: SubjectModule) => void;
}

// Icon mapper
export const getSubjectIcon = (iconName: string, className = "w-5 h-5") => {
  switch (iconName) {
    case 'BookOpen': return <BookOpen className={className} />;
    case 'ShieldCheck': return <ShieldCheck className={className} />;
    case 'Feather': return <Feather className={className} />;
    case 'Calculator': return <Calculator className={className} />;
    case 'Atom': return <Atom className={className} />;
    case 'Globe': return <Globe className={className} />;
    case 'Languages': return <Languages className={className} />;
    case 'Cpu': return <Cpu className={className} />;
    case 'Activity': return <Activity className={className} />;
    case 'Palette': return <Palette className={className} />;
    case 'Users': return <Users className={className} />;
    case 'Laptop': return <Laptop className={className} />;
    case 'Scissors': return <Scissors className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'UtensilsCrossed': return <UtensilsCrossed className={className} />;
    default: return <FileText className={className} />;
  }
};

export const SubjectGrid: React.FC<SubjectGridProps> = ({
  modules,
  currentGrade,
  selectedModule,
  onSelectModule,
  onQuickPrintSubject,
  onShareWhatsAppSubject,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'wajib' | 'peminatan' | 'pemberdayaan' | 'keterampilan-vokasi' | 'muatan-lokal'>('all');

  const gradeModules = modules.filter(m => m.grade === currentGrade);

  const filteredModules = gradeModules.filter(m => {
    if (activeCategory === 'all') return true;
    return m.category === activeCategory;
  });

  const isPaketB = currentGrade <= 9;
  const countWajib = gradeModules.filter(m => m.category === 'wajib').length;
  const countPeminatan = gradeModules.filter(m => m.category === 'peminatan').length;
  const countVokasi = gradeModules.filter(m => m.category === 'keterampilan-vokasi').length;
  const countPemberdayaan = gradeModules.filter(m => m.category === 'pemberdayaan').length;
  const countMulok = gradeModules.filter(m => m.category === 'muatan-lokal').length;

  return (
    <div className="space-y-6">
      {/* Category Tabs & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              {isPaketB ? `Paket B (Setara SMP) - Kelas ${currentGrade}` : `Paket C (Setara SMA) - Kelas ${currentGrade}`}
            </h2>
            <p className="text-[11px] text-slate-500">
              Total {gradeModules.length} Mata Pelajaran • Kurikulum Merdeka Kesetaraan PKBM
            </p>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-blue-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Mapel ({gradeModules.length})
          </button>
          <button
            onClick={() => setActiveCategory('wajib')}
            className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === 'wajib'
                ? 'bg-blue-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Wajib ({countWajib})
          </button>
          {countPeminatan > 0 && (
            <button
              onClick={() => setActiveCategory('peminatan')}
              className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === 'peminatan'
                  ? 'bg-indigo-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Pilihan / Peminatan ({countPeminatan})
            </button>
          )}
          <button
            onClick={() => setActiveCategory('keterampilan-vokasi')}
            className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === 'keterampilan-vokasi'
                ? 'bg-purple-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Vokasi ({countVokasi})
          </button>
          <button
            onClick={() => setActiveCategory('pemberdayaan')}
            className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === 'pemberdayaan'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pemberdayaan ({countPemberdayaan})
          </button>
          {countMulok > 0 && (
            <button
              onClick={() => setActiveCategory('muatan-lokal')}
              className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === 'muatan-lokal'
                  ? 'bg-amber-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Muatan Lokal ({countMulok})
            </button>
          )}
        </div>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredModules.map(mod => {
          const isSelected = selectedModule?.id === mod.id;
          const isVocational = mod.category === 'keterampilan-vokasi';

          return (
            <div
              key={mod.id}
              onClick={() => onSelectModule(mod)}
              className={`group relative text-left bg-white rounded-lg border p-3.5 transition-all duration-150 cursor-pointer flex flex-col justify-between hover:shadow-sm ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                        isVocational
                          ? 'bg-purple-100 text-purple-700'
                          : mod.category === 'pemberdayaan'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {getSubjectIcon(mod.icon, "w-4 h-4")}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-slate-800 line-clamp-1 group-hover:text-blue-900 transition-colors">
                        {mod.name}
                      </h3>
                      <span className="text-[10px] font-medium text-slate-500">
                        Kelas {mod.grade} • {mod.category === 'keterampilan-vokasi' ? 'Vokasi Terapan' : mod.category === 'pemberdayaan' ? 'Pemberdayaan' : 'Kelompok Umum'}
                      </span>
                    </div>
                  </div>

                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700">
                    8 LKPD
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 line-clamp-2 mb-2.5 leading-relaxed">
                  {mod.description}
                </p>

                {/* Topics Preview (Semester 1 & 2) */}
                <div className="space-y-1 pt-2 border-t border-slate-100 text-[10px]">
                  <div className="flex items-center justify-between text-slate-700 font-medium">
                    <span className="text-blue-800 font-semibold">Semester 1</span>
                    <span className="text-slate-400">4 Modul</span>
                  </div>
                  <p className="text-slate-500 text-[10px] truncate">
                    • {mod.units[0]?.topic}
                  </p>
                  <div className="flex items-center justify-between text-slate-700 font-medium pt-0.5">
                    <span className="text-indigo-800 font-semibold">Semester 2</span>
                    <span className="text-slate-400">4 Modul</span>
                  </div>
                  <p className="text-slate-500 text-[10px] truncate">
                    • {mod.units[4]?.topic}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickPrintSubject(mod);
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 hover:text-red-900 px-2 py-1 rounded bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                    title="Simpan lembar kerja 1 tahun mapel ini ke format PDF"
                  >
                    <FileDown className="w-3 h-3 text-red-600" />
                    <span>PDF</span>
                  </button>

                  {onShareWhatsAppSubject && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onShareWhatsAppSubject(mod);
                      }}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-900 px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                      title="Kirim link pengerjaan mapel ini via WhatsApp"
                    >
                      <MessageCircle className="w-3 h-3 text-emerald-600 fill-emerald-600/20" />
                      <span>WhatsApp</span>
                    </button>
                  )}
                </div>

                <div className="inline-flex items-center gap-1 text-xs font-semibold text-blue-800 group-hover:translate-x-0.5 transition-transform">
                  <span>Buka LKPD</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
