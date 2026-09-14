import React, { useState, useEffect, useMemo } from 'react';
import {
  SubjectModule,
  LKPDUnit,
  StudentWorksheetSubmission,
  InstitutionSettings,
  GradeLevel
} from '../types';
import { loadInstitutionSettings, saveInstitutionSettings } from '../data/settingsStorage';
import { getTeacherForSubject, getAllTeachersList, updateTeacherForSubject } from '../data/teacherDirectory';
import { getOrCreateTextbookForSubject } from '../data/textbookDirectory';
import {
  Printer,
  FileText,
  Save,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Eye,
  Lock,
  Download,
  Calendar,
  User,
  Clock,
  Sparkles,
  BookOpen,
  FileDown,
  Info,
  MessageCircle,
  Share2,
  Home,
  ArrowLeft,
  ExternalLink,
  UploadCloud,
  BookMarked,
  Link2,
  Phone,
  Edit3,
  Trash2,
  X,
  Check
} from 'lucide-react';
import { getSubjectIcon } from './SubjectGrid';

interface LKPDViewerProps {
  module: SubjectModule;
  unit: LKPDUnit;
  allUnits: LKPDUnit[];
  onSelectUnit: (unit: LKPDUnit) => void;
  onBackToSubjects: () => void;
  isTutorMode: boolean;
  isStudentMode?: boolean;
  initialStudentName?: string;
  onPrintCurrentUnit: () => void;
  onPrintFullYear: () => void;
  onShareWhatsApp?: (submissionData?: StudentWorksheetSubmission, initialTab?: 'kirim_tugas' | 'kirim_jawaban') => void;
  institutionSettings?: InstitutionSettings;
  onOpenAIGenerator?: (grade?: GradeLevel, subjectId?: string, unitNumber?: number) => void;
  onOpenDigitalTextbook?: () => void;
}

export const LKPDViewer: React.FC<LKPDViewerProps> = ({
  module,
  unit,
  allUnits,
  onSelectUnit,
  onBackToSubjects,
  isTutorMode,
  isStudentMode = false,
  initialStudentName = '',
  onPrintCurrentUnit,
  onPrintFullYear,
  onShareWhatsApp,
  institutionSettings,
  onOpenAIGenerator,
  onOpenDigitalTextbook,
}) => {
  const isSMP = module.grade <= 9;
  const [inst, setInst] = useState<InstitutionSettings>(() => institutionSettings || loadInstitutionSettings());

  useEffect(() => {
    if (institutionSettings) {
      setInst(institutionSettings);
    }
  }, [institutionSettings]);

  useEffect(() => {
    const handleSettingsChange = (e: any) => {
      if (e?.detail) {
        setInst(e.detail);
      } else {
        setInst(loadInstitutionSettings());
      }
    };
    window.addEventListener('pkbm_institution_settings_changed', handleSettingsChange);
    return () => {
      window.removeEventListener('pkbm_institution_settings_changed', handleSettingsChange);
    };
  }, []);

  const subjectTeacher = useMemo(() => {
    return getTeacherForSubject(module.id, inst.subjectTeachers, '', inst.defaultTutor);
  }, [module.id, inst]);
  const activeBook = useMemo(() => {
    return getOrCreateTextbookForSubject(module.id, module.name, module.grade);
  }, [module.id, module.name, module.grade]);
  const storageKey = `submission_${module.grade}_${module.id}_unit_${unit.unitNumber}`;

  // Interactive state
  const [studentName, setStudentName] = useState<string>(initialStudentName || 'Peserta Didik Mandiri');
  const [studentId, setStudentId] = useState<string>('BM-2026-001');
  const [currentTopic, setCurrentTopic] = useState<string>(unit.topic);
  const [submissionDate, setSubmissionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activity2Response, setActivity2Response] = useState<string>('');
  const [activity3ResultNote, setActivity3ResultNote] = useState<string>('');
  const [reflectionResponses, setReflectionResponses] = useState<Record<number, string>>({});
  const [attitudeGrades, setAttitudeGrades] = useState<Record<string, 'Baik' | 'Cukup' | 'Perlu Bimbingan'>>({
    'Tanggung jawab': 'Baik',
    'Disiplin': 'Baik',
    'Mandiri': 'Baik',
    'Kerja sama': 'Baik',
    'Percaya diri': 'Baik'
  });
  const [tutorFeedback, setTutorFeedback] = useState<string>('');
  const [parentNotes, setParentNotes] = useState<string>('');
  const [scoreKnowledge, setScoreKnowledge] = useState<number>(90);
  const [scoreSkills, setScoreSkills] = useState<number>(92);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [showAnswerKey, setShowAnswerKey] = useState<boolean>(isTutorMode);

  // Interactive Tutor Pengampu state for editing/clearing directly from LKPD
  const [isEditingTutor, setIsEditingTutor] = useState<boolean>(false);
  const [editTutorName, setEditTutorName] = useState<string>(subjectTeacher.teacherName);
  const [editTutorPhone, setEditTutorPhone] = useState<string>(subjectTeacher.phone || '');

  useEffect(() => {
    setEditTutorName(subjectTeacher.teacherName);
    setEditTutorPhone(subjectTeacher.phone || '');
  }, [subjectTeacher]);

  const allAvailableTeachers = useMemo(() => {
    return getAllTeachersList(inst.subjectTeachers);
  }, [inst.subjectTeachers]);

  const handleSaveTutorInfo = () => {
    const updated = updateTeacherForSubject(module.id, {
      teacherName: editTutorName.trim() || 'Tutor Pengampu',
      phone: editTutorPhone.trim()
    });
    const updatedInst = {
      ...inst,
      subjectTeachers: updated
    };
    setInst(updatedInst);
    saveInstitutionSettings(updatedInst);
    setIsEditingTutor(false);
  };

  const handleClearTeacherPhone = () => {
    const updated = updateTeacherForSubject(module.id, {
      phone: ''
    });
    const updatedInst = {
      ...inst,
      subjectTeachers: updated
    };
    setInst(updatedInst);
    setEditTutorPhone('');
    saveInstitutionSettings(updatedInst);
  };

  const handleSelectTeacherPreset = (teacherKey: string) => {
    const found = allAvailableTeachers.find(t => t.subjectId === teacherKey);
    if (found) {
      setEditTutorName(found.teacherName);
      setEditTutorPhone(found.phone || '');
    }
  };

  // Sync currentTopic when unit changes
  useEffect(() => {
    setCurrentTopic(unit.topic);
  }, [unit.topic]);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: StudentWorksheetSubmission = JSON.parse(saved);
        setStudentName(parsed.studentName || initialStudentName || 'Peserta Didik Mandiri');
        setStudentId(parsed.studentId || 'BM-2026-001');
        setSubmissionDate(parsed.submittedAt || new Date().toISOString().split('T')[0]);
        setAnswers(parsed.answers || {});
        setActivity2Response(parsed.activity2Response || '');
        setActivity3ResultNote(parsed.activity3ResultNote || '');
        setReflectionResponses(parsed.reflectionResponses || {});
        if (parsed.attitudeGrades) setAttitudeGrades(parsed.attitudeGrades);
        if (parsed.tutorFeedback) setTutorFeedback(parsed.tutorFeedback);
        if (parsed.parentNotes) setParentNotes(parsed.parentNotes);
        if (parsed.scoreKnowledge !== undefined) setScoreKnowledge(parsed.scoreKnowledge);
        if (parsed.scoreSkills !== undefined) setScoreSkills(parsed.scoreSkills);
      } else if (initialStudentName) {
        setStudentName(initialStudentName);
      }
    } catch (e) {
      console.warn("Could not load stored submission", e);
    }
  }, [storageKey, initialStudentName]);

  const handleSaveProgress = () => {
    const payload: StudentWorksheetSubmission = {
      id: storageKey,
      unitId: unit.id,
      grade: module.grade,
      subjectName: module.name,
      studentName,
      studentId,
      submittedAt: submissionDate,
      answers,
      activity2Response,
      activity3ResultNote,
      reflectionResponses,
      attitudeGrades,
      tutorFeedback,
      parentNotes,
      scoreKnowledge,
      scoreSkills,
      isGraded: true
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const getSubmissionPayload = (): StudentWorksheetSubmission => ({
    id: storageKey,
    unitId: unit.id,
    grade: module.grade,
    subjectName: module.name,
    studentName,
    studentId,
    submittedAt: submissionDate,
    answers,
    activity2Response,
    activity3ResultNote,
    reflectionResponses,
    attitudeGrades,
    tutorFeedback,
    parentNotes,
    scoreKnowledge,
    scoreSkills,
    isGraded: true
  });

  const handleShareTask = () => {
    onShareWhatsApp?.(undefined, 'kirim_tugas');
  };

  const handleShareSubmission = () => {
    handleSaveProgress();
    onShareWhatsApp?.(getSubmissionPayload(), 'kirim_jawaban');
  };

  const handleAnswerChange = (qId: string, val: string) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleReflectionChange = (idx: number, val: string) => {
    setReflectionResponses(prev => ({ ...prev, [idx]: val }));
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-12">
      {/* Student Mode Banner if opened via student deep link */}
      {isStudentMode && (
        <div className="bg-linear-to-r from-emerald-800 to-teal-900 text-white p-3 sm:p-4 rounded-xl border border-emerald-600 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-inner">
              🎓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-400 text-emerald-950 px-2 py-0.5 rounded font-black text-[10px] uppercase tracking-wider">
                  Mode Siswa
                </span>
                <h4 className="font-bold text-sm sm:text-base text-white">
                  Lembar Kerja Peserta Didik (LKPD) Mandiri
                </h4>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                Silakan baca materi & jawab soal di bawah ini. Jawaban Anda tersimpan otomatis di perangkat. Setelah selesai, klik tombol <strong>Kirim Jawaban ke Tutor</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={handleShareSubmission}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 rounded-lg font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
          >
            <MessageCircle className="w-4 h-4 fill-emerald-950/20" />
            <span>Kirim Jawaban ke Guru ({subjectTeacher.teacherName})</span>
          </button>
        </div>
      )}

      {/* Top Workstation Control Bar */}
      <div className="bg-white border border-slate-300 rounded-lg p-2.5 shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Back to Dashboard Button & Module Breadcrumb */}
        <div className="flex items-center gap-2">
          {!isStudentMode && (
            <>
              <button
                onClick={onBackToSubjects}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                title="Kembali ke Dashboard Awal / Pilihan Mata Pelajaran"
              >
                <Home className="w-3.5 h-3.5 text-blue-700" />
                <span>Kembali ke Dashboard</span>
              </button>

              <div className="h-6 w-px bg-slate-300 mx-0.5 hidden sm:block" />
            </>
          )}

          <div className="w-7 h-7 rounded bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
            {getSubjectIcon(module.icon, "w-4 h-4")}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900">{module.name}</span>
              <span className="text-[10px] text-slate-500 font-mono">
                [Kelas {module.grade} • {isSMP ? 'Paket B' : 'Paket C'}]
              </span>
              {isStudentMode && (
                <span className="bg-emerald-100 text-emerald-900 text-[9px] font-black px-2 py-0.5 rounded uppercase">
                  Dokumen Penugasan Siswa
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 truncate max-w-xs sm:max-w-md">
              Semester {unit.semester} • Unit {unit.unitNumber}: {unit.topic}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {onOpenDigitalTextbook && (
            <button
              onClick={onOpenDigitalTextbook}
              className="flex items-center gap-1 px-2.5 py-1 rounded font-bold text-xs bg-blue-800 hover:bg-blue-900 text-white shadow-2xs transition-all cursor-pointer ring-1 ring-blue-500"
              title="Buka Buku Teks & Modul Digital Kurikulum Merdeka (Link Modul SIBI Aktif)"
            >
              <BookOpen className="w-3.5 h-3.5 text-yellow-300" />
              <span>Buku Teks & Modul (Link Aktif)</span>
            </button>
          )}

          {!isStudentMode && onOpenAIGenerator && (
            <button
              onClick={() => onOpenAIGenerator(module.grade, module.id, unit.unitNumber)}
              className="flex items-center gap-1 px-2.5 py-1 rounded font-bold text-xs bg-indigo-700 hover:bg-indigo-800 text-white shadow-2xs transition-all cursor-pointer ring-1 ring-indigo-400"
              title="Buka materi PDF, ekstrak atau sinkronkan dan generate langsung ke modul unit ini"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Sinkron / Generate AI dari PDF</span>
            </button>
          )}

          {onShareWhatsApp && (
            <>
              <button
                onClick={handleShareSubmission}
                className="flex items-center gap-1 px-2.5 py-1 rounded font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs transition-colors cursor-pointer"
                title={`Kirim lembar hasil pengerjaan/jawaban siswa langsung ke WhatsApp Tutor (${subjectTeacher.teacherName} - ${subjectTeacher.phone})`}
              >
                <MessageCircle className="w-3.5 h-3.5 text-white fill-white/20" />
                <span>Kirim Jawaban ke Guru ({subjectTeacher.teacherName})</span>
              </button>

              {!isStudentMode && (
                <button
                  onClick={handleShareTask}
                  className="flex items-center gap-1 px-2.5 py-1 rounded font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors cursor-pointer"
                  title="Kirim link penugasan lembar soal ini ke WhatsApp siswa / grup"
                >
                  <Share2 className="w-3.5 h-3.5 text-white" />
                  <span>Kirim Soal ke Siswa</span>
                </button>
              )}
            </>
          )}

          <button
            onClick={handleSaveProgress}
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold text-xs transition-all border ${
              isSaved
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            {isSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaved ? 'Tersimpan!' : 'Simpan Jawaban'}</span>
          </button>

          <button
            onClick={onPrintCurrentUnit}
            className="flex items-center gap-1 px-2.5 py-1 rounded font-bold text-xs bg-red-600 hover:bg-red-700 text-white shadow-2xs transition-colors"
            title="Simpan lembar kerja unit ini ke format PDF atau cetak A4"
          >
            <FileDown className="w-3.5 h-3.5 text-white" />
            <span>Simpan PDF / Cetak</span>
          </button>

          {!isStudentMode && (
            <>
              <button
                onClick={onPrintFullYear}
                className="flex items-center gap-1 px-2.5 py-1 rounded font-bold text-xs bg-blue-900 hover:bg-blue-800 text-white shadow-2xs transition-colors"
                title="Simpan seluruh 8 unit 1 tahun ajaran ke format PDF"
              >
                <Download className="w-3.5 h-3.5 text-blue-200" />
                <span className="hidden sm:inline">Simpan PDF (1 Tahun / 8 Unit)</span>
              </button>

              <button
                onClick={onPrintCurrentUnit}
                className="flex items-center gap-1 px-2 py-1 rounded font-semibold text-xs bg-slate-800 hover:bg-slate-900 text-white transition-colors"
                title="Cetak langsung ke printer A4"
              >
                <Printer className="w-3.5 h-3.5 text-slate-300" />
                <span className="hidden md:inline">Cetak A4</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Unit Selector Strip (Units 1 - 8) */}
      <div className="bg-white border border-slate-300 rounded-lg p-2 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase px-1 shrink-0">
            Pilih Unit:
          </span>
          {allUnits.map(u => {
            const isCurrent = u.unitNumber === unit.unitNumber;
            const isS1 = u.semester === 1;
            return (
              <button
                key={u.id}
                onClick={() => onSelectUnit(u)}
                className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors border ${
                  isCurrent
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : isS1
                    ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    : 'bg-indigo-50/60 hover:bg-indigo-100/80 text-indigo-900 border-indigo-200'
                }`}
              >
                Unit {u.unitNumber} ({isS1 ? 'Sem 1' : 'Sem 2'})
              </button>
            );
          })}
        </div>
      </div>

      {/* Authentic High Density Document Sheet */}
      <div className="bg-white shadow-sm border border-slate-300 mx-auto w-full p-6 sm:p-8 text-[11px] leading-relaxed text-slate-800 space-y-4">
        {/* Document Header Kop */}
        <div className="text-center border-b-2 border-slate-900 pb-3 mb-4 space-y-1">
          <h3 className="font-bold uppercase text-sm sm:text-base tracking-wider text-slate-950 mb-0.5">
            LEMBAR KERJA PESERTA DIDIK (LKPD)
          </h3>
          <h4 className="font-black text-xs sm:text-sm text-slate-900 mb-0.5">
            PUSAT KEGIATAN BELAJAR MASYARAKAT (PKBM) {inst.name.toUpperCase()}
          </h4>
          <p className="text-[9.5px] uppercase tracking-tight text-slate-600 font-mono">
            HOMESCHOOLING TERPADU • KURIKULUM MERDEKA • TAHUN AJARAN {inst.academicYear}
          </p>
          <p className="text-[9px] text-slate-600">
            NPSN: <span className="font-mono font-semibold text-slate-800">{inst.npsn || '-'}</span> • {inst.address}
          </p>
          {/* Baris Informasi Tutor Pengampu Mapel (jika tersedia) */}
          {subjectTeacher.phone ? (
            <div className="pt-1 flex justify-center items-center gap-2 text-[9.5px]">
              <span className="bg-blue-50 text-blue-950 border border-blue-200 px-2.5 py-0.5 rounded font-semibold inline-flex items-center gap-1.5 shadow-2xs">
                <span>👤 WA Tutor Pengampu:</span>
                <span className="font-mono text-blue-800 font-bold">{subjectTeacher.phone}</span>
                <span className="text-blue-700">({subjectTeacher.teacherName})</span>
                <button
                  type="button"
                  onClick={handleClearTeacherPhone}
                  className="ml-1 text-rose-600 hover:text-rose-800 hover:underline font-bold text-[9px] cursor-pointer"
                  title="Hapus / kosongkan nomor telepon ini dari LKPD"
                >
                  (Hapus No. HP)
                </button>
              </span>
            </div>
          ) : null}
        </div>

        {/* Student Metadata Table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 mb-4 border-b border-dashed border-slate-300 pb-3 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="font-bold inline-block w-28 text-slate-700">Nama Siswa</span>
            <span>:</span>
            <input
              type="text"
              value={studentName}
              onChange={e => setStudentName(e.target.value)}
              className="flex-1 border-b border-dotted border-slate-400 bg-transparent px-1 py-0.5 font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold inline-block w-28 text-slate-700">Program / Jenjang</span>
            <span>:</span>
            <span className="font-semibold text-slate-900">
              {isSMP ? 'Paket B (Setara SMP)' : 'Paket C (Setara SMA)'} - Kelas {module.grade}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold inline-block w-28 text-slate-700">Mata Pelajaran</span>
            <span>:</span>
            <span className="font-semibold text-slate-900">{module.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold inline-block w-28 text-slate-700">Semester / Unit</span>
            <span>:</span>
            <span className="font-semibold text-slate-900">
              Semester {unit.semester} • Unit {unit.unitNumber} ({unit.allocationWeeks})
            </span>
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            <span className="font-bold inline-block w-28 text-slate-700">Materi / Topik</span>
            <span>:</span>
            <span className="flex-1 inline-flex items-center gap-1.5 bg-blue-50/80 hover:bg-blue-50 border border-blue-200/90 rounded-md px-2.5 py-1 text-[11.5px] sm:text-xs font-bold text-blue-950 shadow-2xs transition-all focus-within:ring-1 focus-within:ring-blue-500 focus-within:bg-white focus-within:border-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
              <input
                type="text"
                value={currentTopic}
                onChange={e => setCurrentTopic(e.target.value)}
                className="w-full bg-transparent font-bold text-blue-950 focus:outline-none tracking-tight"
                placeholder="Tuliskan materi/topik lembar kerja baru..."
                title="Edit materi / topik lembar kerja ini"
              />
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:col-span-2 bg-slate-50/70 p-2 rounded-lg border border-slate-200">
            <span className="font-bold inline-block w-28 text-slate-700 shrink-0">Tutor Pengampu:</span>
            {!isEditingTutor ? (
              <div className="flex-1 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-900">{subjectTeacher.teacherName}</span>
                  {subjectTeacher.phone ? (
                    <span className="text-[10.5px] text-blue-800 font-mono font-bold bg-blue-100/70 px-2 py-0.5 rounded border border-blue-200">
                      WA: {subjectTeacher.phone}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">
                      (Belum ada nomor HP)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsEditingTutor(true)}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 rounded text-[10.5px] font-semibold transition-colors cursor-pointer"
                    title="Pilih guru atau edit nomor HP untuk LKPD ini"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Pilih / Edit Guru & No. HP</span>
                  </button>
                  {subjectTeacher.phone && (
                    <button
                      type="button"
                      onClick={handleClearTeacherPhone}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded text-[10.5px] font-medium transition-colors cursor-pointer"
                      title="Hapus nomor telepon dari LKPD ini"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus No. HP</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 w-full space-y-2 bg-white p-2.5 rounded border border-blue-300 shadow-xs">
                <div className="text-[10.5px] font-bold text-blue-900 flex items-center justify-between">
                  <span>Pilih Guru Pengampu atau Ketik Langsung:</span>
                  <span className="text-[9.5px] text-slate-500 font-normal">Sesuai dengan guru yang Anda pilih</span>
                </div>
                
                {/* Preset Selector */}
                <div>
                  <select
                    onChange={e => handleSelectTeacherPreset(e.target.value)}
                    defaultValue=""
                    className="w-full text-xs p-1.5 bg-slate-50 border border-slate-300 rounded font-medium focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="" disabled>-- Pilih Guru dari Daftar Direktori --</option>
                    {allAvailableTeachers.map(t => (
                      <option key={t.subjectId} value={t.subjectId}>
                        {t.teacherName} {t.phone ? `(${t.phone})` : '(Tanpa No. HP)'} - {t.subjectName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Manual Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9.5px] font-semibold text-slate-600 mb-0.5">Nama Tutor:</label>
                    <input
                      type="text"
                      value={editTutorName}
                      onChange={e => setEditTutorName(e.target.value)}
                      placeholder="Nama Tutor Pengampu..."
                      className="w-full text-xs p-1 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9.5px] font-semibold text-slate-600 mb-0.5">No. HP / WA Tutor:</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editTutorPhone}
                        onChange={e => setEditTutorPhone(e.target.value)}
                        placeholder="Contoh: 081234567890 (kosongkan jika tanpa no)"
                        className="flex-1 text-xs p-1 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-blue-500"
                      />
                      {editTutorPhone && (
                        <button
                          type="button"
                          onClick={() => setEditTutorPhone('')}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                          title="Hapus / kosongkan nomor"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsEditingTutor(false)}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTutorInfo}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded shadow-2xs cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section A: Capaian Pembelajaran */}
        <div className="space-y-1">
          <div className="bg-slate-100 font-bold px-2 py-1 mb-1 border-l-2 border-blue-800 text-slate-900 text-xs">
            A. CAPAIAN PEMBELAJARAN (CP)
          </div>
          <p className="px-2 text-justify text-slate-700 leading-relaxed italic">
            {unit.capaianPembelajaran}
          </p>
        </div>

        {/* Section B: Tujuan Pembelajaran */}
        <div className="space-y-1">
          <div className="bg-slate-100 font-bold px-2 py-1 mb-1 border-l-2 border-blue-800 text-slate-900 text-xs">
            B. TUJUAN PEMBELAJARAN (TP)
          </div>
          <ul className="list-disc pl-6 space-y-1 text-slate-700">
            {unit.tujuanPembelajaran.map((tp, idx) => (
              <li key={idx}>{tp}</li>
            ))}
          </ul>
        </div>

        {/* Section C: Petunjuk Belajar Homeschooling */}
        <div className="space-y-1">
          <div className="bg-slate-100 font-bold px-2 py-1 mb-1 border-l-2 border-blue-800 text-slate-900 text-xs">
            C. PETUNJUK BELAJAR HOMESCHOOLING TERPADU
          </div>
          <ol className="list-decimal pl-6 space-y-1 text-slate-700">
            {unit.homeschoolingInstructions.map((instruction, idx) => (
              <li key={idx}>{instruction}</li>
            ))}
          </ol>
        </div>

        {/* Section D: Ringkasan Materi */}
        <div className="space-y-2">
          <div className="bg-slate-100 font-bold px-2 py-1 mb-1 border-l-2 border-blue-800 text-slate-900 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-800" />
              <span>D. RINGKASAN MATERI PEMBELAJARAN DARI MODUL / BUKU TEKS</span>
            </span>
            <div className="flex items-center gap-1.5">
              {onOpenDigitalTextbook && (
                <button
                  type="button"
                  onClick={onOpenDigitalTextbook}
                  className="text-[10px] text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-300 transition-colors"
                  title="Buka Buku Teks & Modul Digital Kurikulum Merdeka (Link Aktif)"
                >
                  <BookMarked className="w-3 h-3 text-emerald-700" />
                  <span>Katalog Buku & Modul SIBI</span>
                </button>
              )}
              {onOpenAIGenerator && (
                <button
                  type="button"
                  onClick={() => onOpenAIGenerator(module.grade, module.id, unit.unitNumber)}
                  className="text-[10px] text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 transition-colors"
                  title="Sinkronkan materi baru dari PDF / Modul menggunakan AI"
                >
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  <span>Sinkronkan Ulang AI</span>
                </button>
              )}
            </div>
          </div>

          {/* Official Textbook & Active Module Link Card */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="bg-blue-600 text-white font-black text-[9px] px-1.5 py-0.2 rounded uppercase">
                  Kurikulum Merdeka
                </span>
                <span className="font-bold text-slate-900">
                  {unit.digitalTextbookRef?.bookTitle || activeBook.bookTitle}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                Penerbit: {activeBook.authorOrPublisher} ({activeBook.editionYear}) • Tersinkronisasi dengan Capaian Pembelajaran (CP) Modul Unit {unit.unitNumber}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <a
                href={unit.digitalTextbookRef?.officialUrl || activeBook.officialSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] rounded shadow-2xs transition-colors"
                title="Buka Link Modul / Buku Teks Resmi di SIBI Kemendikdasmen RI (buku.kemendikdasmen.go.id)"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Link SIBI Kemendikdasmen (Aktif)</span>
              </a>

              {onOpenDigitalTextbook && (
                <button
                  type="button"
                  onClick={onOpenDigitalTextbook}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-blue-900 font-bold text-[11px] rounded border border-blue-300 transition-colors cursor-pointer"
                  title="Buka Pembaca Teks & Sinkronisasi PDF"
                >
                  <Eye className="w-3 h-3 text-blue-700" />
                  <span>Baca Teks Modul</span>
                </button>
              )}
            </div>
          </div>

          <p className="px-2 font-bold text-slate-900 text-xs">{unit.materiSummary.title}</p>
          <ul className="list-disc pl-6 space-y-1 text-slate-700">
            {unit.materiSummary.points.map((pt, idx) => (
              <li key={idx} className="leading-relaxed">{pt}</li>
            ))}
          </ul>
          {unit.materiSummary.deepDiveMarkdown && (
            <div className="mt-2 p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-slate-700 leading-relaxed text-[11px]">
              <p className="font-bold text-blue-950 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-blue-700" />
                Uraian Materi & Pendalaman Konsep:
              </p>
              <div className="whitespace-pre-line text-slate-800">
                {unit.materiSummary.deepDiveMarkdown}
              </div>
            </div>
          )}
        </div>

        {/* Section E: Aktivitas 1 */}
        <div className="space-y-2">
          <div className="bg-slate-100 font-bold px-2 py-1 mb-1 border-l-2 border-blue-800 text-slate-900 text-xs">
            E. AKTIVITAS 1 – PEMAHAMAN KONSEP
          </div>
          <p className="px-2 italic text-slate-600">{unit.activity1Pemahaman.instruction}</p>
          <div className="space-y-3 px-2">
            {unit.activity1Pemahaman.questions.map((q, idx) => (
              <div key={q.id} className="space-y-1">
                <p className="font-bold text-slate-800">
                  {idx + 1}. {q.question}
                </p>
                <textarea
                  rows={3}
                  value={answers[q.id] || ''}
                  onChange={e => handleAnswerChange(q.id, e.target.value)}
                  placeholder="Tuliskan jawaban analisis dan argumen pemahamanmu di sini..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-[11px] focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-900"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Section F: Aktivitas 2 */}
        <div className="space-y-2">
          <div className="bg-slate-100 font-bold px-2 py-1 mb-1 border-l-2 border-blue-800 text-slate-900 text-xs">
            F. AKTIVITAS 2 – PENERAPAN KONTEKSTUAL & STUDI KASUS
          </div>
          <div className="px-2 space-y-2">
            <p className="font-bold text-slate-900">{unit.activity2Penerapan.title}</p>
            <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded text-slate-800">
              <p className="font-semibold text-blue-900 mb-1">Konteks Permasalahan:</p>
              <p className="text-justify">{unit.activity2Penerapan.contextDescription}</p>
            </div>
            <p className="font-bold text-slate-800">Tugas Analisis:</p>
            <p className="text-slate-700">{unit.activity2Penerapan.taskInstruction}</p>
            <textarea
              rows={4}
              value={activity2Response}
              onChange={e => setActivity2Response(e.target.value)}
              placeholder="Tuliskan hasil kajian kasus kontekstual dan solusi yang kamu rumuskan..."
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-[11px] focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-900"
            />
          </div>
        </div>

        {/* Section G: Aktivitas 3 Praktik */}
        <div className="space-y-2">
          <div className="bg-slate-100 font-bold px-2 py-1 mb-1 border-l-2 border-blue-800 text-slate-900 text-xs">
            G. AKTIVITAS 3 – TUGAS PROYEK / PRAKTIK NYATA
          </div>
          <div className="px-2 space-y-2">
            <p className="font-bold text-slate-900 text-xs">{unit.activity3ProyekPraktik.title}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-slate-50 border border-slate-200 rounded">
              <div>
                <p className="font-bold text-slate-700">Tujuan Praktik:</p>
                <p className="text-slate-600">{unit.activity3ProyekPraktik.objective}</p>
              </div>
              <div>
                <p className="font-bold text-slate-700">Alat & Bahan:</p>
                <p className="text-slate-600">{unit.activity3ProyekPraktik.toolsAndMaterials.join(', ')}</p>
              </div>
            </div>

            <div>
              <p className="font-bold text-slate-800 mb-1">Langkah Kerja Proyek:</p>
              <ol className="list-decimal pl-6 space-y-1 text-slate-700">
                {unit.activity3ProyekPraktik.steps.map((st, sIdx) => (
                  <li key={sIdx}>{st}</li>
                ))}
              </ol>
            </div>

            {unit.activity3ProyekPraktik.safetyNotes && (
              <p className="p-2 bg-amber-50 border border-amber-200 rounded text-amber-900 font-medium">
                * Aspek K3 & Keselamatan: {unit.activity3ProyekPraktik.safetyNotes}
              </p>
            )}

            <div>
              <p className="font-bold text-slate-800 mb-1">Catatan Hasil & Refleksi Praktik:</p>
              <textarea
                rows={3}
                value={activity3ResultNote}
                onChange={e => setActivity3ResultNote(e.target.value)}
                placeholder="Deskripsikan hasil karya praktik yang kamu buat dan kendala yang dihadapi..."
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-[11px] focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Section H: Evaluasi */}
        <div className="space-y-2">
          <div className="bg-slate-100 font-bold px-2 py-1 mb-1 border-l-2 border-blue-800 text-slate-900 text-xs">
            H. SOAL EVALUASI & PEMAHAMAN
          </div>
          <div className="px-2 space-y-3">
            {unit.soalEvaluasi.map((q, idx) => (
              <div key={q.id} className="space-y-1.5 border-b border-slate-100 pb-2">
                <p className="font-bold text-slate-800">
                  {idx + 1}. {q.question}
                </p>
                {q.type === 'multiple-choice' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-2">
                    {q.options.map((opt, oIdx) => {
                      const letter = String.fromCharCode(65 + oIdx);
                      const isSelected = answers[q.id] === letter;
                      return (
                        <label
                          key={oIdx}
                          className={`flex items-center gap-2 p-1.5 rounded border cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-100 border-blue-400 font-semibold text-blue-900'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            checked={isSelected}
                            onChange={() => handleAnswerChange(q.id, letter)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span>({letter}) {opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
                {q.type !== 'multiple-choice' && (
                  <textarea
                    rows={2}
                    value={answers[q.id] || ''}
                    onChange={e => handleAnswerChange(q.id, e.target.value)}
                    placeholder="Tuliskan jawaban uraian evaluasi di sini..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-[11px] focus:outline-none focus:bg-white text-slate-900"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section I: Refleksi Peserta Didik */}
        <div className="space-y-2">
          <div className="bg-slate-100 font-bold px-2 py-1 mb-1 border-l-2 border-blue-800 text-slate-900 text-xs">
            I. REFLEKSI PESERTA DIDIK
          </div>
          <div className="px-2 space-y-2">
            {unit.refleksiPesertaDidik.map((ref, idx) => (
              <div key={idx} className="space-y-1">
                <p className="font-semibold text-slate-800">{idx + 1}. {ref}</p>
                <input
                  type="text"
                  value={reflectionResponses[idx] || ''}
                  onChange={e => handleReflectionChange(idx, e.target.value)}
                  placeholder="Isi refleksi mandiri..."
                  className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-[11px] focus:outline-none focus:bg-white text-slate-900"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Section J & K: Rubrik Penilaian */}
        <div className="space-y-2">
          <div className="bg-slate-100 font-bold px-2 py-1 mb-1 border-l-2 border-blue-800 text-slate-900 text-xs">
            J & K. RUBRIK PENILAIAN PENGETAHUAN & KETERAMPILAN
          </div>
          <div className="overflow-x-auto px-2">
            <table className="w-full border-collapse border border-slate-300 text-[10px]">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold text-center">
                  <th className="border border-slate-300 p-1.5 text-left w-1/4">Aspek Penilaian</th>
                  <th className="border border-slate-300 p-1.5 w-1/5">Sangat Baik (4)</th>
                  <th className="border border-slate-300 p-1.5 w-1/5">Baik (3)</th>
                  <th className="border border-slate-300 p-1.5 w-1/5">Cukup (2)</th>
                  <th className="border border-slate-300 p-1.5 w-1/5">Perlu Bimbingan (1)</th>
                </tr>
              </thead>
              <tbody>
                {unit.rubrikKeterampilan.map((rub, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50">
                    <td className="border border-slate-300 p-1.5 font-bold text-slate-800">{rub.aspect}</td>
                    <td className="border border-slate-300 p-1.5 text-slate-600">{rub.level4}</td>
                    <td className="border border-slate-300 p-1.5 text-slate-600">{rub.level3}</td>
                    <td className="border border-slate-300 p-1.5 text-slate-600">{rub.level2}</td>
                    <td className="border border-slate-300 p-1.5 text-slate-600">{rub.level1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section L: Sikap Profil Pelajar Pancasila */}
        <div className="space-y-2">
          <div className="bg-slate-100 font-bold px-2 py-1 mb-1 border-l-2 border-blue-800 text-slate-900 text-xs">
            L. PENILAIAN SIKAP (PROFIL PELAJAR PANCASILA)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 px-2">
            {Object.keys(attitudeGrades).map(sikap => (
              <div key={sikap} className="p-2 border border-slate-200 rounded bg-slate-50 text-center">
                <p className="font-bold text-[10px] text-slate-800 mb-1">{sikap}</p>
                <select
                  value={attitudeGrades[sikap]}
                  onChange={e => setAttitudeGrades(prev => ({ ...prev, [sikap]: e.target.value as any }))}
                  className="w-full bg-white border border-slate-300 rounded p-1 text-[10px] font-semibold text-slate-800"
                >
                  <option value="Baik">Sangat Baik / Baik</option>
                  <option value="Cukup">Cukup</option>
                  <option value="Perlu Bimbingan">Perlu Bimbingan</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Section M: Pengesahan Tiga Pihak & Mengetahui Kepala Lembaga */}
        <div className="mt-8 pt-4 border-t-2 border-slate-900">
          <div className="text-right text-[10px] text-slate-600 mb-2 font-mono">
            {inst.city || 'Bandung'}, .................................... {inst.academicYear.split('/')[0]}
          </div>
          <p className="text-[10px] font-bold text-center text-slate-500 uppercase mb-4 tracking-wider">
            Lembar Pengesahan Homeschooling Terpadu
          </p>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="space-y-12">
              <p className="font-bold text-slate-700">Peserta Didik</p>
              <div className="border-t border-slate-800 w-28 mx-auto pt-1 font-semibold text-slate-900">
                ( {studentName || 'Peserta Didik'} )
              </div>
            </div>

            <div className="space-y-12">
              <p className="font-bold text-slate-700">Orang Tua / Wali</p>
              <div className="border-t border-slate-800 w-28 mx-auto pt-1 font-semibold text-slate-900">
                ( Orang Tua / Wali )
              </div>
            </div>

            <div className="space-y-12">
              <p className="font-bold text-slate-700">Tutor Pengampu Mapel</p>
              <div className="border-t border-slate-800 w-36 mx-auto pt-1 font-semibold text-slate-900">
                ( {subjectTeacher.teacherName} )
              </div>
              <p className="text-[9px] text-slate-500">
                {subjectTeacher.nipOrNiy ? `NIP/NIY: ${subjectTeacher.nipOrNiy}` : subjectTeacher.phone ? `WA: ${subjectTeacher.phone}` : ''}
              </p>
            </div>
          </div>

          {/* Mengetahui Kepala Lembaga PKBM */}
          <div className="mt-8 pt-4 border-t border-dashed border-slate-300 text-center space-y-10 text-[10px]">
            <div>
              <p className="text-slate-500">Mengetahui,</p>
              <p className="font-bold text-slate-900 text-[11px]">Kepala {inst.name}</p>
            </div>
            <div>
              <div className="border-t border-slate-800 w-52 mx-auto pt-1 font-bold text-slate-900">
                ( {inst.headName} )
              </div>
              {inst.headNipOrNiy && (
                <p className="text-[9.5px] text-slate-700 mt-1">
                  NIP/NIY: {inst.headNipOrNiy}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Info Lembaga PKBM */}
        <div className="mt-4 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[9.5px] text-slate-600 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="font-semibold text-slate-700">
            {inst.name} • Kurikulum Merdeka Pendidikan Kesetaraan
          </div>
          <div className="text-slate-500 text-[9px]">
            NPSN: {inst.npsn || '-'} • Alamat: {inst.address}
          </div>
        </div>

        {/* Section N: Kunci Jawaban & Panduan Tutor - Strictly hidden in student mode */}
        {!isStudentMode && (isTutorMode || showAnswerKey) && (
          <div className="mt-6 pt-4 border-t border-dashed border-slate-400">
            <div className="flex items-center justify-between bg-slate-900 text-white p-2 rounded">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs">PANDUAN PENILAIAN & KUNCI JAWABAN TUTOR</span>
              </div>
              <button
                onClick={() => setShowAnswerKey(!showAnswerKey)}
                className="text-[10px] px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-amber-300 font-semibold transition-colors cursor-pointer"
              >
                {showAnswerKey ? 'Sembunyikan' : 'Buka Kunci Jawaban'}
              </button>
            </div>

            {showAnswerKey && (
              <div className="mt-2 p-3 bg-amber-50/70 border border-amber-300 rounded space-y-2 text-[10px] text-amber-950">
                <p><strong>Panduan Aktivitas 1:</strong> {unit.kunciJawabanDanPedoman.pemahamanKey}</p>
                <p><strong>Panduan Aktivitas 2:</strong> {unit.kunciJawabanDanPedoman.penerapanKey}</p>
                <div>
                  <p className="font-bold mb-0.5">Kunci Soal Evaluasi:</p>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {unit.kunciJawabanDanPedoman.evaluasiKey.map((ek, idx) => (
                      <li key={idx}><strong>Soal {idx + 1} ({ek.answer})</strong>: {ek.explanation}</li>
                    ))}
                  </ul>
                </div>
                <p><strong>Catatan Penguatan:</strong> {unit.kunciJawabanDanPedoman.tutorNotes}</p>
              </div>
            )}
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {!isStudentMode ? (
            <button
              onClick={onBackToSubjects}
              className="flex items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Dashboard Awal</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>Lembar Soal & Pengerjaan Penugasan Mandiri Peserta Didik</span>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {onShareWhatsApp && (
              <>
                <button
                  onClick={handleShareSubmission}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  title={`Kirim lembar hasil pengerjaan/jawaban siswa langsung ke WhatsApp Tutor (${subjectTeacher.teacherName} - ${subjectTeacher.phone})`}
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                  <span>Kirim Jawaban ke Guru ({subjectTeacher.teacherName})</span>
                </button>

                {!isStudentMode && (
                  <button
                    onClick={handleShareTask}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    title="Kirim link penugasan lembar soal ini ke WhatsApp siswa / grup"
                  >
                    <Share2 className="w-4 h-4 text-white" />
                    <span>Kirim Soal ke Siswa</span>
                  </button>
                )}
              </>
            )}
            <button
              onClick={onPrintCurrentUnit}
              className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs shadow-2xs transition-colors cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Simpan PDF / Cetak</span>
            </button>

            {!isStudentMode && (
              <button
                onClick={onPrintFullYear}
                className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Simpan PDF 1 Tahun</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
