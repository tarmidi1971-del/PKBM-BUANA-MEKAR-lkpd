import React, { useState, useMemo, useEffect } from 'react';
import { GradeLevel, LKPDUnit, SubjectModule, InstitutionSettings, AppSecuritySettings, StudentWorksheetSubmission, SubjectTeacher } from './types';
import { generateCurriculumModules } from './data/curriculumData';
import { GRADE_CONFIG } from './data/subjectMeta';
import {
  loadInstitutionSettings,
  saveInstitutionSettings,
  loadSecuritySettings,
  saveSecuritySettings,
} from './data/settingsStorage';
import { Navbar } from './components/Navbar';
import { SubjectGrid, getSubjectIcon } from './components/SubjectGrid';
import { LKPDViewer } from './components/LKPDViewer';
import { PrintableDocument } from './components/PrintableDocument';
import { AIGeneratorModal } from './components/AIGeneratorModal';
import { DigitalTextbookModal } from './components/DigitalTextbookModal';
import { BatchDownloadModal } from './components/BatchDownloadModal';
import { CurriculumSummaryView } from './components/CurriculumSummaryView';
import { WhatsAppShareModal } from './components/WhatsAppShareModal';
import { InstitutionSettingsModal } from './components/InstitutionSettingsModal';
import { TeacherManagementModal } from './components/TeacherManagementModal';
import { StudentManagementModal } from './components/StudentManagementModal';
import { SecuritySettingsModal } from './components/SecuritySettingsModal';
import { SecurityAuthModal } from './components/SecurityAuthModal';
import {
  Printer,
  ChevronRight,
  Layers,
  Sparkles,
  Search,
  CheckCircle2,
  FileText,
  LayoutGrid,
  FileSpreadsheet,
  GraduationCap,
  BookOpen,
  Compass,
  Award,
  BarChart2,
  ListFilter,
  FileDown,
  MessageCircle,
  Building2,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  Home,
  Users
} from 'lucide-react';

export default function App() {
  const allGeneratedModules = useMemo(() => generateCurriculumModules(), []);
  const [modules, setModules] = useState<SubjectModule[]>(allGeneratedModules);

  // Institution profile & Application Protection States
  const [institutionSettings, setInstitutionSettings] = useState<InstitutionSettings>(() => loadInstitutionSettings());
  const [securitySettings, setSecuritySettings] = useState<AppSecuritySettings>(() => loadSecuritySettings());
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // Modal open states
  const [isInstitutionSettingsOpen, setIsInstitutionSettingsOpen] = useState<boolean>(false);
  const [isTeacherManagementOpen, setIsTeacherManagementOpen] = useState<boolean>(false);
  const [isStudentManagementOpen, setIsStudentManagementOpen] = useState<boolean>(false);
  const [isSecuritySettingsOpen, setIsSecuritySettingsOpen] = useState<boolean>(false);
  const [isSecurityAuthOpen, setIsSecurityAuthOpen] = useState<boolean>(false);
  const [authTargetName, setAuthTargetName] = useState<string>('Fitur Terproteksi Admin');
  const [pendingAdminAction, setPendingAdminAction] = useState<(() => void) | null>(null);

  // Parse deep-link query parameters if student opens from WhatsApp link on HP/desktop
  const initialParams = useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      const searchStr = window.location.search || (window.location.hash.includes('?') ? '?' + window.location.hash.split('?')[1] : '');
      const params = new URLSearchParams(searchStr);
      const grade = parseInt(params.get('grade') || '', 10);
      const subject = params.get('subject') || params.get('module') || params.get('mapel') || params.get('id');
      const unit = parseInt(params.get('unit') || '', 10);
      const isStudentMode = params.get('mode') === 'siswa' || params.get('view') === 'siswa' || (params.has('grade') && params.has('unit'));
      const studentName = params.get('nama') || params.get('student') || '';
      return {
        grade: (grade >= 7 && grade <= 12) ? (grade as GradeLevel) : null,
        subject: subject ? decodeURIComponent(subject).trim() : null,
        unit: (unit >= 1 && unit <= 8) ? unit : null,
        isStudentMode,
        studentName: decodeURIComponent(studentName).trim()
      };
    } catch {
      return null;
    }
  }, []);

  const [isStudentMode, setIsStudentMode] = useState<boolean>(() => Boolean(initialParams?.isStudentMode));

  const [currentGrade, setCurrentGrade] = useState<GradeLevel>(() => {
    return initialParams?.grade || 7;
  });

  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(() => {
    const initialGrade = initialParams?.grade || 7;
    const gradeMods = allGeneratedModules.filter(m => m.grade === initialGrade);
    if (initialParams?.subject) {
      const target = initialParams.subject.toLowerCase();
      const match = gradeMods.find(m => 
        m.id.toLowerCase() === target ||
        m.id.toLowerCase().endsWith('-' + target) ||
        m.id.toLowerCase().includes(target) ||
        m.name.toLowerCase().includes(target.replace(/-/g, ' '))
      );
      if (match) return match.id;
    }
    return gradeMods[0] ? gradeMods[0].id : null;
  });

  const [selectedUnitNumber, setSelectedUnitNumber] = useState<number>(() => {
    return initialParams?.unit || 1;
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isTutorMode, setIsTutorMode] = useState<boolean>(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState<boolean>(false);
  const [isDigitalTextbookOpen, setIsDigitalTextbookOpen] = useState<boolean>(false);
  const [aiGeneratorTarget, setAiGeneratorTarget] = useState<{ grade: GradeLevel; subjectId: string; unitNumber: number } | null>(null);
  const [isBatchDownloadOpen, setIsBatchDownloadOpen] = useState<boolean>(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);
  const [shareTargetModule, setShareTargetModule] = useState<SubjectModule | null>(null);
  const [shareTargetUnit, setShareTargetUnit] = useState<LKPDUnit | null>(null);
  const [shareTargetSubmission, setShareTargetSubmission] = useState<StudentWorksheetSubmission | null>(null);
  const [shareDispatchTab, setShareDispatchTab] = useState<'kirim_tugas' | 'kirim_jawaban'>('kirim_tugas');

  const [activeCategory, setActiveCategory] = useState<'all' | 'wajib' | 'pemberdayaan' | 'keterampilan-vokasi'>('all');
  const [activeView, setActiveView] = useState<'mapel' | 'document' | 'curriculum'>(() => {
    // If student arrived from WhatsApp deep link, go directly to document view!
    return (initialParams?.grade && (initialParams?.subject || initialParams?.unit)) ? 'document' : 'mapel';
  });

  // Print engine state
  const [printPayload, setPrintPayload] = useState<{
    module: SubjectModule;
    units: LKPDUnit[];
    includeAnswerKey: boolean;
  } | null>(null);

  // Active grade configuration
  const currentGradeConfig = useMemo(() => {
    return GRADE_CONFIG.find(g => g.grade === currentGrade) || GRADE_CONFIG[0];
  }, [currentGrade]);

  // Filter modules for current grade
  const gradeModules = useMemo(() => {
    return modules.filter(m => m.grade === currentGrade);
  }, [modules, currentGrade]);

  // Group modules by standard categories
  const groupedModules = useMemo(() => {
    const wajib = gradeModules.filter(m => m.category === 'wajib');
    const pemberdayaan = gradeModules.filter(m => m.category === 'pemberdayaan');
    const vokasi = gradeModules.filter(m => m.category === 'keterampilan-vokasi');

    return { wajib, pemberdayaan, vokasi };
  }, [gradeModules]);

  // Filtered by search query & category
  const displaySubjects = useMemo(() => {
    return gradeModules.filter(m => {
      if (activeCategory !== 'all' && m.category !== activeCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.units.some(u => u.topic.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [gradeModules, activeCategory, searchQuery]);

  // Active module & unit
  const selectedModule = useMemo(() => {
    if (!selectedModuleId) return gradeModules[0] || null;
    return modules.find(m => m.id === selectedModuleId) || gradeModules[0] || null;
  }, [modules, selectedModuleId, gradeModules]);

  const selectedUnit = useMemo(() => {
    if (!selectedModule) return null;
    return (
      selectedModule.units.find(u => u.unitNumber === selectedUnitNumber) ||
      selectedModule.units[0] ||
      null
    );
  }, [selectedModule, selectedUnitNumber]);

  // Handler to enforce admin PIN verification on sensitive features
  const requireAdminAccess = (action: () => void, featureName: string) => {
    if (!securitySettings.isProtectionEnabled || isAdminAuthenticated) {
      action();
    } else {
      setAuthTargetName(featureName);
      setPendingAdminAction(() => action);
      setIsSecurityAuthOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setIsAdminAuthenticated(true);
    if (pendingAdminAction) {
      pendingAdminAction();
      setPendingAdminAction(null);
    }
  };

  const handleSaveInstitutionSettings = (newSettings: InstitutionSettings) => {
    setInstitutionSettings(newSettings);
    saveInstitutionSettings(newSettings);
  };

  const handleSaveTeachers = (updatedTeachers: Record<string, SubjectTeacher>) => {
    setInstitutionSettings(prev => {
      const next = { ...prev, subjectTeachers: updatedTeachers };
      saveInstitutionSettings(next);
      return next;
    });
  };

  const handleSaveSecuritySettings = (newSettings: AppSecuritySettings) => {
    setSecuritySettings(newSettings);
    saveSecuritySettings(newSettings);
  };

  const handleLockAdminSession = () => {
    setIsAdminAuthenticated(false);
    setIsTutorMode(false);
  };

  // Protected actions
  const handleToggleTutorMode = () => {
    if (isTutorMode) {
      setIsTutorMode(false);
    } else {
      if (securitySettings.isProtectionEnabled && securitySettings.protectTutorMode && !isAdminAuthenticated) {
        requireAdminAccess(() => setIsTutorMode(true), 'Mode Tutor (Kunci Jawaban & Rubrik)');
      } else {
        setIsTutorMode(true);
      }
    }
  };

  const handleOpenInstitutionSettings = () => {
    if (securitySettings.isProtectionEnabled && securitySettings.protectInstitutionSettings && !isAdminAuthenticated) {
      requireAdminAccess(() => setIsInstitutionSettingsOpen(true), 'Pengaturan Profil & Kop Lembaga');
    } else {
      setIsInstitutionSettingsOpen(true);
    }
  };

  const handleOpenSecuritySettings = () => {
    if (securitySettings.isProtectionEnabled && !isAdminAuthenticated) {
      requireAdminAccess(() => setIsSecuritySettingsOpen(true), 'Pengaturan Proteksi & Hak Akses Admin');
    } else {
      setIsSecuritySettingsOpen(true);
    }
  };

  const handleOpenAIGenerator = (targetGrade?: GradeLevel, targetSubjectId?: string, targetUnitNumber?: number) => {
    setAiGeneratorTarget({
      grade: targetGrade || currentGrade,
      subjectId: targetSubjectId || selectedModule?.id || 'tata-boga',
      unitNumber: targetUnitNumber || selectedUnitNumber || 1
    });

    if (securitySettings.isProtectionEnabled && securitySettings.protectAIGenerator && !isAdminAuthenticated) {
      requireAdminAccess(() => setIsAIGeneratorOpen(true), 'AI Generator & Sinkronisasi PDF Modul');
    } else {
      setIsAIGeneratorOpen(true);
    }
  };

  // Handle grade change
  const handleSelectGrade = (grade: GradeLevel) => {
    setCurrentGrade(grade);
    const targetFirst = modules.find(m => m.grade === grade);
    if (targetFirst) {
      setSelectedModuleId(targetFirst.id);
      setSelectedUnitNumber(1);
    }
  };

  // Handle module selection
  const handleSelectModule = (mod: SubjectModule) => {
    setSelectedModuleId(mod.id);
    setSelectedUnitNumber(1);
    setActiveView('document');
  };

  // Handle unit selection
  const handleSelectUnit = (unit: LKPDUnit) => {
    setSelectedUnitNumber(unit.unitNumber);
  };

  // Handle opening WhatsApp share modal
  const handleOpenWhatsApp = (
    mod?: SubjectModule | null,
    unit?: LKPDUnit | null,
    submission?: StudentWorksheetSubmission | null,
    tab?: 'kirim_tugas' | 'kirim_jawaban'
  ) => {
    const targetMod = mod || selectedModule;
    if (!targetMod) return;
    const targetUnit = unit || (targetMod.units.find(u => u.unitNumber === selectedUnitNumber) || targetMod.units[0]);
    setShareTargetModule(targetMod);
    setShareTargetUnit(targetUnit);
    setShareTargetSubmission(submission || null);
    setShareDispatchTab(tab || 'kirim_tugas');
    setIsWhatsAppModalOpen(true);
  };

  // Print current unit
  const handlePrintCurrentUnit = () => {
    if (!selectedModule || !selectedUnit) return;
    setPrintPayload({
      module: selectedModule,
      units: [selectedUnit],
      includeAnswerKey: isTutorMode
    });
    setTimeout(() => {
      try {
        window.print();
      } catch (e) {
        console.warn('Window print error:', e);
      }
    }, 150);
  };

  // Unlock teacher dashboard from student mode
  const handleUnlockTeacherMode = () => {
    requireAdminAccess(() => {
      setIsStudentMode(false);
      setActiveView('mapel');
      if (typeof window !== 'undefined') {
        try {
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch {
          // ignore
        }
      }
    }, 'Buka Dashboard Admin & Guru');
  };

  // Print full 1-year (8 units) for a module
  const handlePrintFullYear = (modToPrint?: SubjectModule) => {
    const targetModule = modToPrint || selectedModule;
    if (!targetModule) return;
    setPrintPayload({
      module: targetModule,
      units: targetModule.units,
      includeAnswerKey: isTutorMode
    });
    setTimeout(() => {
      try {
        window.print();
      } catch (e) {
        console.warn('Window print error:', e);
      }
    }, 150);
  };

  // Add or sync custom unit generated by AI
  const handleAddCustomUnit = (
    targetGrade: GradeLevel,
    targetSubjectId: string,
    customUnit: LKPDUnit,
    targetUnitNumber?: number
  ) => {
    setModules(prev =>
      prev.map(mod => {
        const isMatchedSubject =
          mod.grade === targetGrade &&
          (mod.id === targetSubjectId ||
            mod.id.includes(targetSubjectId) ||
            targetSubjectId.includes(mod.id));

        if (isMatchedSubject) {
          if (targetUnitNumber) {
            const existingIdx = mod.units.findIndex(u => u.unitNumber === targetUnitNumber);
            if (existingIdx >= 0) {
              const updatedUnits = [...mod.units];
              updatedUnits[existingIdx] = {
                ...customUnit,
                unitNumber: targetUnitNumber
              };
              return {
                ...mod,
                units: updatedUnits
              };
            }
          }
          return {
            ...mod,
            units: [...mod.units, customUnit]
          };
        }
        return mod;
      })
    );
  };

  const handleOpenDigitalTextbook = () => {
    setIsDigitalTextbookOpen(true);
  };

  const handleSyncUnitWithTextbook = (syncedData: {
    topic: string;
    subtopic?: string;
    capaian: string;
    tujuan: string[];
    materiTitle: string;
    materiPoints: string[];
    materiDeepDive: string;
    sourceBookTitle: string;
    officialUrl: string;
  }) => {
    if (!selectedModule || !selectedUnit) return;

    setModules(prev =>
      prev.map(mod => {
        if (mod.id === selectedModule.id && mod.grade === selectedModule.grade) {
          const updatedUnits = mod.units.map(u => {
            if (u.unitNumber === selectedUnit.unitNumber) {
              return {
                ...u,
                topic: syncedData.topic,
                subtopic: syncedData.subtopic || u.subtopic,
                capaianPembelajaran: syncedData.capaian,
                tujuanPembelajaran: syncedData.tujuan,
                materiSummary: {
                  title: syncedData.materiTitle,
                  points: syncedData.materiPoints,
                  deepDiveMarkdown: syncedData.materiDeepDive
                },
                digitalTextbookRef: {
                  bookTitle: syncedData.sourceBookTitle,
                  officialUrl: syncedData.officialUrl,
                  isExternalLinkActive: true,
                  curriculumCode: 'Kurikulum Merdeka SIBI Kemendikdasmen'
                }
              };
            }
            return u;
          });
          return {
            ...mod,
            units: updatedUnits
          };
        }
        return mod;
      })
    );
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-100 font-sans overflow-hidden">
      {/* Header: Student Portal Header if isStudentMode is true, otherwise Master Teacher Navbar */}
      {isStudentMode ? (
        <header className="bg-slate-900 text-white px-3 sm:px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-800 z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black shadow-inner shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-xs sm:text-sm text-white tracking-wide">
                  {institutionSettings.name}
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/40 uppercase">
                  Portal Lembar Kerja Siswa
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium truncate max-w-xs sm:max-w-md">
                {selectedModule
                  ? `${selectedModule.name} • Kelas ${selectedModule.grade} (${selectedModule.grade <= 9 ? 'Paket B' : 'Paket C'}) • Unit ${selectedUnitNumber}`
                  : 'Dokumen Penugasan Peserta Didik'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {selectedModule && (
              <button
                onClick={() => setIsDigitalTextbookOpen(true)}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-blue-800 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ring-1 ring-blue-500"
                title="Buka Buku Teks Kurikulum Merdeka (Link Modul SIBI Aktif)"
              >
                <BookOpen className="w-3.5 h-3.5 text-yellow-300" />
                <span className="hidden sm:inline">Buku Teks & Modul</span>
                <span className="sm:hidden">Buku SIBI</span>
              </button>
            )}

            {selectedModule && selectedUnit && (
              <button
                onClick={() => handleOpenWhatsApp(selectedModule, selectedUnit, null, 'kirim_jawaban')}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Kirim Lembar Jawaban Siswa ke WhatsApp Guru / Tutor"
              >
                <MessageCircle className="w-3.5 h-3.5 text-white" />
                <span>Kirim Jawaban ke Guru</span>
              </button>
            )}

            <button
              onClick={handlePrintCurrentUnit}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Simpan lembar kerja ke format PDF atau cetak"
            >
              <FileDown className="w-3.5 h-3.5 text-white" />
              <span>Simpan PDF / Cetak</span>
            </button>

            <button
              onClick={handleUnlockTeacherMode}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-all border border-slate-700 cursor-pointer"
              title="Buka Dashboard Admin & Guru (Memerlukan PIN)"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span className="hidden md:inline">Login Guru / Dashboard</span>
              <span className="md:hidden">Guru</span>
            </button>
          </div>
        </header>
      ) : (
        <Navbar
          currentGrade={currentGrade}
          onSelectGrade={handleSelectGrade}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isTutorMode={isTutorMode}
          onToggleTutorMode={handleToggleTutorMode}
          onOpenAIGenerator={handleOpenAIGenerator}
          onOpenDigitalTextbook={handleOpenDigitalTextbook}
          onOpenBatchDownload={() => setIsBatchDownloadOpen(true)}
          onOpenWhatsApp={() => handleOpenWhatsApp()}
          onOpenTeacherDirectory={() => setIsTeacherManagementOpen(true)}
          onOpenStudentDirectory={() => setIsStudentManagementOpen(true)}
          activeView={activeView}
          onSelectView={setActiveView}
          institutionSettings={institutionSettings}
          securitySettings={securitySettings}
          isAdminAuthenticated={isAdminAuthenticated}
          onOpenInstitutionSettings={handleOpenInstitutionSettings}
          onOpenSecuritySettings={handleOpenSecuritySettings}
        />
      )}

      {/* High Density 3-Panel Workstation Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Panel 1: Aside Sidebar for Navigation & Grade Selection */}
        {!isStudentMode && (
        <aside className="w-56 bg-slate-800 text-slate-300 p-2.5 shrink-0 flex flex-col justify-between overflow-y-auto border-r border-slate-900 hidden md:flex">
          <nav className="space-y-4">
            {/* Quick Menu Navigation */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                Menu Dashboard
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setActiveView('mapel');
                    setSearchQuery('');
                  }}
                  className={`w-full px-3 py-2 rounded text-xs cursor-pointer flex items-center gap-2 font-bold transition-colors ${
                    activeView === 'mapel'
                      ? 'bg-blue-600 text-white shadow-xs ring-1 ring-blue-400'
                      : 'hover:bg-slate-700 text-slate-200 bg-slate-700/40'
                  }`}
                  title="Kembali ke Dashboard Awal (15 Mata Pelajaran)"
                >
                  <Home className="w-4 h-4 text-blue-300" />
                  <span>Dashboard Awal</span>
                </button>

                <button
                  onClick={() => setActiveView('document')}
                  className={`w-full px-3 py-1.5 rounded text-xs cursor-pointer flex items-center gap-2 font-medium transition-colors ${
                    activeView === 'document'
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Dokumen LKPD Aktif</span>
                </button>

                <button
                  onClick={() => setActiveView('curriculum')}
                  className={`w-full px-3 py-1.5 rounded text-xs cursor-pointer flex items-center gap-2 font-medium transition-colors ${
                    activeView === 'curriculum'
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>Struktur Kurikulum</span>
                </button>

                <button
                  onClick={() => handleOpenWhatsApp()}
                  className="w-full px-3 py-1.5 rounded text-xs cursor-pointer flex items-center gap-2 font-bold transition-colors bg-emerald-600/90 hover:bg-emerald-600 text-white shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-white" />
                  <span>Kirim WhatsApp Siswa</span>
                </button>

                <button
                  onClick={() => setIsTeacherManagementOpen(true)}
                  className="w-full px-3 py-1.5 rounded text-xs cursor-pointer flex items-center gap-2 font-bold transition-colors bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border border-emerald-600/60 shadow-xs"
                  title="Buka Menu Daftar Guru: Upload Excel atau Input Manual"
                >
                  <Users className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Daftar Guru (Excel/Manual)</span>
                </button>

                <button
                  onClick={() => setIsStudentManagementOpen(true)}
                  className="w-full px-3 py-1.5 rounded text-xs cursor-pointer flex items-center gap-2 font-bold transition-colors bg-sky-800/80 hover:bg-sky-700 text-sky-100 border border-sky-600/60 shadow-xs"
                  title="Buka Menu Daftar Siswa: Upload Excel (.xlsx/.csv) atau Input Manual"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-sky-300" />
                  <span>Daftar Siswa (Excel/Manual)</span>
                </button>

                <button
                  onClick={() => setIsBatchDownloadOpen(true)}
                  className="w-full px-3 py-1.5 rounded text-xs cursor-pointer flex items-center gap-2 font-bold transition-colors bg-red-600/90 hover:bg-red-600 text-white shadow-xs"
                >
                  <FileDown className="w-3.5 h-3.5 text-white" />
                  <span>Simpan PDF & Cetak</span>
                </button>
              </div>
            </div>

            {/* Paket B */}
            <div>
              <div className="flex items-center justify-between px-2 mb-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Paket B (Setara SMP)
                </p>
                <span className="text-[9px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono font-bold">
                  Fase D
                </span>
              </div>
              <ul className="space-y-1">
                {[7, 8, 9].map(g => {
                  const isActive = currentGrade === g;
                  return (
                    <li
                      key={g}
                      onClick={() => handleSelectGrade(g as GradeLevel)}
                      className={`px-3 py-1.5 rounded text-xs cursor-pointer flex items-center justify-between font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-900 border border-blue-500 text-white font-bold shadow-xs'
                          : 'hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold">Kelas {g}</span>
                        <span className={`text-[10px] ${isActive ? 'text-blue-200' : 'text-slate-400'}`}>
                          15 Mapel • 8 LKPD
                        </span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0 text-blue-300" />}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Paket C */}
            <div>
              <div className="flex items-center justify-between px-2 mb-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Paket C (Setara SMA)
                </p>
                <span className="text-[9px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono font-bold">
                  Fase E / F
                </span>
              </div>
              <ul className="space-y-1">
                {[10, 11, 12].map(g => {
                  const isActive = currentGrade === g;
                  const phaseLabel = g === 10 ? 'Fase E' : 'Fase F';
                  return (
                    <li
                      key={g}
                      onClick={() => handleSelectGrade(g as GradeLevel)}
                      className={`px-3 py-1.5 rounded text-xs cursor-pointer flex items-center justify-between font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-900 border border-blue-500 text-white font-bold shadow-xs'
                          : 'hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold">Kelas {g} ({phaseLabel})</span>
                        <span className={`text-[10px] ${isActive ? 'text-blue-200' : 'text-slate-400'}`}>
                          15 Mapel • 8 LKPD
                        </span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0 text-blue-300" />}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Institution & Security Tools Section */}
            <div className="pt-2 border-t border-slate-700/80">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                Pengaturan & Admin
              </p>
              <div className="space-y-1">
                <button
                  onClick={handleOpenInstitutionSettings}
                  className="w-full px-3 py-1.5 rounded text-xs cursor-pointer flex items-center gap-2 font-semibold transition-colors bg-slate-700/70 hover:bg-slate-700 text-blue-200 hover:text-white"
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-300" />
                  <span>Profil & Kop Lembaga</span>
                </button>

                <button
                  onClick={handleOpenSecuritySettings}
                  className={`w-full px-3 py-1.5 rounded text-xs cursor-pointer flex items-center justify-between font-semibold transition-colors ${
                    isAdminAuthenticated
                      ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-300 hover:bg-emerald-900'
                      : 'bg-slate-700/70 hover:bg-slate-700 text-amber-300 hover:text-amber-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isAdminAuthenticated ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>Proteksi & PIN Admin</span>
                  </span>
                  {isAdminAuthenticated && (
                    <span className="text-[9px] bg-emerald-700 text-white px-1.5 py-0.2 rounded font-bold">
                      Aktif
                    </span>
                  )}
                </button>

                {isAdminAuthenticated && (
                  <button
                    onClick={handleLockAdminSession}
                    className="w-full px-3 py-1 rounded text-[11px] cursor-pointer flex items-center gap-2 font-medium transition-colors text-amber-400 hover:bg-amber-950/40"
                  >
                    <Lock className="w-3 h-3 text-amber-400" />
                    <span>Kunci Sesi Admin</span>
                  </button>
                )}
              </div>
            </div>
          </nav>

          {/* Generation Progress Widget */}
          <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-800 text-[11px]">
            <div className="text-[10px] text-slate-400 font-semibold mb-1 flex justify-between">
              <span>Status Kurikulum</span>
              <span className="text-green-400 font-bold">90 Modul Lengkap</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full w-full"></div>
            </div>
            <div className="text-[10px] text-slate-400 text-right mt-1.5 font-mono">
              720 LKPD Terpadu Siap
            </div>
          </div>
        </aside>
        )}

        {/* Panel 2: Master Subject List Column */}
        {!isStudentMode && (
        <section className="w-72 lg:w-80 border-r border-slate-200 bg-white overflow-y-auto p-3 shrink-0 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-slate-800 text-xs">
                Mata Pelajaran Kelas {currentGrade}
              </h2>
              <p className="text-[10px] text-slate-500">
                {currentGradeConfig.phase} (15 Mapel Standar)
              </p>
            </div>
            <span className="text-[9px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200">
              Sem 1 & 2
            </span>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="grid grid-cols-4 gap-1 mb-2.5 text-[9px] font-semibold">
            <button
              onClick={() => setActiveCategory('all')}
              className={`p-1 rounded text-center transition-colors cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua (15)
            </button>
            <button
              onClick={() => setActiveCategory('wajib')}
              className={`p-1 rounded text-center transition-colors cursor-pointer ${
                activeCategory === 'wajib'
                  ? 'bg-blue-700 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              Wajib (10)
            </button>
            <button
              onClick={() => setActiveCategory('pemberdayaan')}
              className={`p-1 rounded text-center transition-colors cursor-pointer ${
                activeCategory === 'pemberdayaan'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Berdya (1)
            </button>
            <button
              onClick={() => setActiveCategory('keterampilan-vokasi')}
              className={`p-1 rounded text-center transition-colors cursor-pointer ${
                activeCategory === 'keterampilan-vokasi'
                  ? 'bg-amber-700 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Vokasi (4)
            </button>
          </div>

          {/* Subject Items List */}
          <div className="space-y-1.5 flex-1">
            {displaySubjects.map(mod => {
              const isSelected = selectedModuleId === mod.id;

              return (
                <div
                  key={mod.id}
                  onClick={() => handleSelectModule(mod)}
                  className={`p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50 border-blue-600 shadow-xs ring-1 ring-blue-600'
                      : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {getSubjectIcon(mod.icon, "w-4 h-4")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 truncate text-xs">{mod.name}</h3>
                        <span
                          className={`text-[8px] font-bold px-1 rounded uppercase ${
                            mod.category === 'wajib'
                              ? 'bg-blue-100 text-blue-800'
                              : mod.category === 'pemberdayaan'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {mod.category === 'keterampilan-vokasi' ? 'Vokasi' : mod.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">
                        {mod.units.length} Unit LKPD • 1 Thn Lengkap
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Action in Left Panel */}
          <div className="pt-2 mt-2 border-t border-slate-200 space-y-1.5">
            <button
              onClick={() => handleOpenWhatsApp()}
              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-white" />
              <span>Kirim LKPD via WhatsApp</span>
            </button>

            <button
              onClick={() => setIsBatchDownloadOpen(true)}
              className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 text-white" />
              <span>Simpan PDF & Cetak (90 Modul)</span>
            </button>
          </div>
        </section>
        )}

        {/* Panel 3: Dynamic View Area based on Active Menu Selection */}
        <main className="flex-1 bg-slate-50 overflow-y-auto p-3 sm:p-4 flex flex-col">
          {!isStudentMode && activeView === 'curriculum' ? (
            <CurriculumSummaryView
              currentGrade={currentGrade}
              onSelectGrade={handleSelectGrade}
              modules={modules}
              onSelectSubject={handleSelectModule}
              onOpenBatchDownload={() => setIsBatchDownloadOpen(true)}
              onBackToDashboard={() => setActiveView('mapel')}
            />
          ) : !isStudentMode && activeView === 'mapel' ? (
            <div className="max-w-6xl w-full mx-auto space-y-4">
              {/* Menu Mapel Dashboard Banner */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-900 text-white">
                    <LayoutGrid className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Menu Mata Pelajaran • {currentGradeConfig.name}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      15 Mata Pelajaran Standar Kurikulum Merdeka {institutionSettings.name} (10 Umum/Wajib, 1 Pemberdayaan, 4 Vokasi)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleOpenInstitutionSettings()}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-800 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs shadow-2xs transition-all cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5 text-blue-200" />
                    <span>Profil Lembaga</span>
                  </button>

                  <button
                    onClick={() => handleOpenWhatsApp()}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-2xs transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-white" />
                    <span>Kirim WA ke Siswa</span>
                  </button>

                  <button
                    onClick={() => setIsBatchDownloadOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs shadow-2xs transition-all cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5 text-white" />
                    <span>Simpan PDF / Cetak Kelas {currentGrade}</span>
                  </button>
                </div>
              </div>

              {/* Subject Grid with Category filters */}
              <SubjectGrid
                modules={modules}
                currentGrade={currentGrade}
                selectedModule={selectedModule}
                onSelectModule={handleSelectModule}
                onQuickPrintSubject={mod => handlePrintFullYear(mod)}
                onShareWhatsAppSubject={mod => handleOpenWhatsApp(mod, mod.units[0])}
              />
            </div>
          ) : selectedModule && selectedUnit ? (
            <LKPDViewer
              module={selectedModule}
              unit={selectedUnit}
              allUnits={selectedModule.units}
              onSelectUnit={handleSelectUnit}
              onBackToSubjects={() => setActiveView('mapel')}
              isTutorMode={isStudentMode ? false : isTutorMode}
              isStudentMode={isStudentMode}
              initialStudentName={initialParams?.studentName || ''}
              onPrintCurrentUnit={handlePrintCurrentUnit}
              onPrintFullYear={() => handlePrintFullYear(selectedModule)}
              onShareWhatsApp={(sub, tab) => handleOpenWhatsApp(selectedModule, selectedUnit, sub, tab)}
              institutionSettings={institutionSettings}
              onOpenAIGenerator={handleOpenAIGenerator}
              onOpenDigitalTextbook={handleOpenDigitalTextbook}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Pilih mata pelajaran dari menu untuk membuka LKPD.
            </div>
          )}
        </main>
      </div>

      {/* High Density Management Console Footer */}
      <footer className="bg-white border-t border-slate-200 px-4 py-2 flex justify-between items-center text-[10px] text-slate-500 shrink-0 font-mono">
        <div>{institutionSettings.name} Management Console v2.0 • NPSN: {institutionSettings.npsn || '-'} • 15 Mapel Standar</div>
        <div>&copy; {institutionSettings.academicYear} Kurikulum Merdeka Pendidikan Kesetaraan</div>
      </footer>

      {/* Hidden Printable Document Container for window.print() */}
      {printPayload && (
        <PrintableDocument
          module={printPayload.module}
          unitsToPrint={printPayload.units}
          includeAnswerKey={printPayload.includeAnswerKey}
          institutionSettings={institutionSettings}
        />
      )}

      {/* Modals */}
      <InstitutionSettingsModal
        isOpen={isInstitutionSettingsOpen}
        onClose={() => setIsInstitutionSettingsOpen(false)}
        settings={institutionSettings}
        onSaveSettings={handleSaveInstitutionSettings}
        onOpenTeacherDirectory={() => setIsTeacherManagementOpen(true)}
      />

      <TeacherManagementModal
        isOpen={isTeacherManagementOpen}
        onClose={() => setIsTeacherManagementOpen(false)}
        institutionSettings={institutionSettings}
        onSaveTeachers={handleSaveTeachers}
      />

      <StudentManagementModal
        isOpen={isStudentManagementOpen}
        onClose={() => setIsStudentManagementOpen(false)}
        onSelectStudentForLKPD={(student) => {
          setIsStudentManagementOpen(false);
          handleOpenWhatsApp(selectedModule, selectedUnit);
        }}
      />

      <SecuritySettingsModal
        isOpen={isSecuritySettingsOpen}
        onClose={() => setIsSecuritySettingsOpen(false)}
        securitySettings={securitySettings}
        onSaveSecuritySettings={handleSaveSecuritySettings}
        onLockAdminSession={handleLockAdminSession}
      />

      <SecurityAuthModal
        isOpen={isSecurityAuthOpen}
        onClose={() => {
          setIsSecurityAuthOpen(false);
          setPendingAdminAction(null);
        }}
        securitySettings={securitySettings}
        onSuccess={handleAuthSuccess}
        onUpdateSecuritySettings={handleSaveSecuritySettings}
        targetFeatureName={authTargetName}
      />

      <AIGeneratorModal
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        onAddCustomUnit={handleAddCustomUnit}
        initialGrade={aiGeneratorTarget?.grade || currentGrade}
        initialSubjectId={aiGeneratorTarget?.subjectId || selectedModule?.id || 'tata-boga'}
        initialUnitNumber={aiGeneratorTarget?.unitNumber || selectedUnitNumber || 1}
        activeModule={selectedModule}
        activeUnit={selectedUnit}
      />

      <DigitalTextbookModal
        isOpen={isDigitalTextbookOpen}
        onClose={() => setIsDigitalTextbookOpen(false)}
        activeModule={selectedModule || undefined}
        activeUnit={selectedUnit || undefined}
        onSyncUnitWithTextbook={handleSyncUnitWithTextbook}
        onOpenAIGeneratorWithText={(text, title) => {
          handleOpenAIGenerator(selectedModule?.grade, selectedModule?.id, selectedUnit?.unitNumber);
        }}
      />

      <BatchDownloadModal
        isOpen={isBatchDownloadOpen}
        onClose={() => setIsBatchDownloadOpen(false)}
        modules={modules}
        onPrintSubject={mod => handlePrintFullYear(mod)}
        onShareWhatsAppSubject={mod => handleOpenWhatsApp(mod, mod.units[0])}
      />

      <WhatsAppShareModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        module={shareTargetModule}
        unit={shareTargetUnit}
        institutionSettings={institutionSettings}
        submissionData={shareTargetSubmission}
        initialDispatchTab={shareDispatchTab}
        onOpenTeacherDirectory={() => setIsTeacherManagementOpen(true)}
        onOpenStudentDirectory={() => setIsStudentManagementOpen(true)}
      />
    </div>
  );
}
