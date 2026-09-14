import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Loader2,
  CheckCircle2,
  BookOpen,
  Layers,
  Printer,
  Plus,
  FileText,
  Upload,
  RefreshCw,
  Eye,
  FileCheck2,
  HelpCircle,
  Award,
  ExternalLink,
  BookMarked,
  Link2
} from 'lucide-react';
import { GradeLevel, LKPDUnit, SubjectModule } from '../types';
import { ALL_SUBJECTS, GRADE_CONFIG } from '../data/subjectMeta';
import {
  getOrCreateTextbookForSubject,
  DIGITAL_TEXTBOOK_CATALOG,
  findDigitalTextbook
} from '../data/textbookDirectory';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomUnit: (grade: GradeLevel, subjectId: string, unit: LKPDUnit, targetUnitNumber?: number) => void;
  initialGrade?: GradeLevel;
  initialSubjectId?: string;
  initialUnitNumber?: number;
  activeModule?: SubjectModule | null;
  activeUnit?: LKPDUnit | null;
  onPrintPreview?: (module: SubjectModule, unit: LKPDUnit) => void;
}

// Preset samples for fast demo synchronization from PDF textbook
const SAMPLE_PDF_MATERIALS = [
  {
    title: 'Tata Busana: Pola Dasar & Menjahit Blus',
    subjectId: 'tata-busana',
    grade: 10,
    text: `MODUL KETERAMPILAN TATA BUSANA: KONSTRUKSI POLA DASAR DAN PEMBUATAN BLUS
Tata busana adalah keterampilan merancang dan menjahit pakaian berdasarkan ukuran tubuh proporsional.
Langkah-langkah utama pembuatan busana:
1. Pengambilan Ukuran Badan: Lingkar badan, lingkar pinggang, panjang punggung, lebar muka, dan panjang lengan.
2. Konstruksi Pola Dasar (Sistem Meyneke/Bunka): Membuat pola bagian depan dan belakang pada kertas pola dengan skala 1:1.
3. Peletakan Pola pada Kain (Layout Pattern): Memperhatikan arah serat kain (grainline) dan memberi kampuh jahitan 1.5 - 2 cm.
4. Pemotongan & Pemberian Tanda Jahitan (Rader & Karbon Jahit).
5. Proses Penjahitan: Menjahit kupnat, menyambung bahu, memasang kerah kemeja, menjahit sisi, dan memasang lengan (armhole).
6. Finishing & Quality Control: Membersihkan sisa benang, membuat lubang kancing, dan penyetrikaan uap (pressing).`
  },
  {
    title: 'Tata Kecantikan: Perawatan Kulit & Rias Wajah',
    subjectId: 'tata-kecantikan',
    grade: 10,
    text: `MODUL KETERAMPILAN TATA KECANTIKAN: HYGIENE SANITASI & DAILY MAKEUP
Tata kecantikan mencakup pemeliharaan kesehatan kulit serta seni memperindah penampilan wajah secara profesional.
Standar Prosedur Operasional (SOP):
1. Sanitasi & Sterilisasi Alat: Membersihkan kuas, spons, dan spatula kosmetik dengan alkohol 70% sebelum dan sesudah digunakan.
2. Analisis Kulit Klien: Mengidentifikasi jenis kulit (normal, kering, berminyak, atau kombinasi) dan sensitivitas kulit.
3. Tahap Skin Preparation: Pembersihan (cleansing), penyegaran (toning), dan pelembab (moisturizer & sunscreen SPF 30+).
4. Aplikasi Rias Wajah Sehari-hari (Natural Daily Look): Complexion tipis dengan cushion/foundation ringan, set bedak tabur, alis natural, eyeshadow warna tanah/nude, blush on segar, dan lip tint.`
  },
  {
    title: 'Tata Boga: Teknik Dasar Pastry & Roti Manis',
    subjectId: 'tata-boga',
    grade: 7,
    text: `MATERI PEMBELAJARAN: TEKNIK FERMENTASI DAN PEMBUATAN ROTI MANIS
Roti manis adalah produk rerotian yang menggunakan ragi Saccharomyces cerevisiae dalam proses pengembangan adonan (fermentasi). Bahan utama terdiri dari tepung terigu protein tinggi (kadar gluten 12-14%), gula pasir, ragi instan, air/susu dingin, margarin/butter, dan telur.
Tahap penting:
1. Pencampuran & Ulenan (Kalis): gluten terbentuk elastis hingga windowpane test.
2. Fermentasi Pertama (Bulk Fermentation): 45-60 menit hingga mengembang 2x lipat.
3. Degassing & Rounding: membuang gas CO2 berlebih dan membulatkan adonan.
4. Proofing Akhir: 45-50 menit pada kelembaban terjaga.
5. Pemanggangan: Suhu 180°C selama 15-20 menit hingga kuning keemasan.
Studi Kasus: Apabila roti bantat atau berpori kasar, penyebab utamanya adalah ragi mati akibat air panas, waktu proofing terlalu singkat, atau ulenan belum kalis sempurna.`
  },
  {
    title: 'Komputer: Desain Grafis & Aplikasi Digital',
    subjectId: 'keterampilan-komputer',
    grade: 8,
    text: `MODUL KETERAMPILAN KOMPUTER: DASAR DESAIN GRAFIS & MEDIA PROMOSI DIGITAL
Keterampilan komputer dan multimedia membekali peserta didik dengan kecakapan digital abad 21 untuk kebutuhan usaha mandiri.
Kompetensi Utama:
1. Prinsip Desain Grafis: Hierarchy, Contrast, Balance, Typography, dan Color Harmony (Teori Warna 60-30-10).
2. Perangkat Lunak Desain: Pemanfaatan Canva Pro / Adobe Photoshop / Inkscape untuk pembuatan aset visual.
3. Pembuatan Media Promosi: Mendesain flyer digital, logo brand UMKM, banner promosi, dan feed Instagram promosi.
4. Format Ekspor: Memahami perbedaan format file raster (PNG, JPG) dan vektor (SVG, PDF Print 300 DPI) untuk kebutuhan cetak maupun digital.`
  }
];

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({
  isOpen,
  onClose,
  onAddCustomUnit,
  initialGrade,
  initialSubjectId,
  initialUnitNumber,
  activeModule,
  activeUnit,
  onPrintPreview,
}) => {
  const [activeTab, setActiveTab] = useState<'pdf-sync' | 'ai-prompt'>('pdf-sync');
  const [grade, setGrade] = useState<GradeLevel>(initialGrade || 7);
  const [subjectId, setSubjectId] = useState<string>(initialSubjectId || 'tata-boga');
  const [syncTarget, setSyncTarget] = useState<'current-unit' | 'new-unit'>('current-unit');
  const [targetUnitNum, setTargetUnitNum] = useState<number>(initialUnitNumber || 1);

  // PDF Text & AI Prompt states
  const [pdfSourceText, setPdfSourceText] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [learningGoals, setLearningGoals] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedUnit, setGeneratedUnit] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync state whenever modal opens or props change
  useEffect(() => {
    if (initialGrade) setGrade(initialGrade);
    if (initialSubjectId) setSubjectId(initialSubjectId);
    if (initialUnitNumber) setTargetUnitNum(initialUnitNumber);
    if (activeUnit) {
      setTopic(activeUnit.topic);
    }
  }, [isOpen, initialGrade, initialSubjectId, initialUnitNumber, activeUnit]);

  if (!isOpen) return null;

  const currentSubjectObj = ALL_SUBJECTS.find(s => s.id === subjectId) || ALL_SUBJECTS[0];
  const officialTextbook = getOrCreateTextbookForSubject(subjectId, currentSubjectObj.name, grade);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setPdfSourceText(content);
        setSuccessMessage(`Berhasil memuat berkas: ${file.name} (${Math.round(file.size / 1024)} KB)`);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadOfficialChapter = (chapterIdx: number) => {
    const ch = officialTextbook.chapters[chapterIdx] || officialTextbook.chapters[0];
    if (!ch) return;
    setPdfSourceText(ch.fullLessonText);
    setTopic(ch.chapterTitle);
    setLearningGoals(ch.tujuanPembelajaran.join('; '));
    setSuccessMessage(`Materi Buku Teks "${ch.chapterTitle}" dimuat dari ${officialTextbook.bookTitle}!`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleLoadSample = (sample: typeof SAMPLE_PDF_MATERIALS[0]) => {
    setPdfSourceText(sample.text);
    setTopic(sample.title);
    setSubjectId(sample.subjectId);
    setGrade(sample.grade as GradeLevel);
    setSuccessMessage(`Materi sampel "${sample.title}" dimuat!`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGeneratedUnit(null);

    const sub = ALL_SUBJECTS.find(s => s.id === subjectId);

    try {
      const res = await fetch('/api/gemini/generate-lkpd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade,
          subjectName: sub?.name || 'Mata Pelajaran',
          topic: topic.trim() || undefined,
          learningGoals: learningGoals.trim() || undefined,
          mode: activeTab === 'pdf-sync' ? 'sync-pdf' : 'full-unit',
          sourcePdfText: activeTab === 'pdf-sync' ? pdfSourceText : undefined,
          targetUnitNumber: targetUnitNum
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        setGeneratedUnit(json.data);
        setSuccessMessage('LKPD berhasil disusun dan disinkronkan dengan AI!');
      } else {
        throw new Error(json.error || 'Gagal menghasilkan LKPD');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat menghubungkan ke AI');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToCurriculum = () => {
    if (!generatedUnit) return;

    const unitNumberToUse = syncTarget === 'current-unit' ? targetUnitNum : (activeModule?.units.length ? activeModule.units.length + 1 : 9);

    const newUnit: LKPDUnit = {
      id: `synced-${Date.now()}`,
      unitNumber: unitNumberToUse,
      semester: unitNumberToUse <= 4 ? 1 : 2,
      topic: generatedUnit.topic || topic || `Unit ${unitNumberToUse} - Topik Baru`,
      subtopic: generatedUnit.subtopic || 'Modul Pembelajaran Mandiri Terpadu',
      allocationWeeks: '2 Minggu (4 JP)',
      capaianPembelajaran: generatedUnit.capaian || 'Peserta didik mampu memahami konsep dan menerapkan dalam karya mandiri.',
      tujuanPembelajaran: Array.isArray(generatedUnit.tujuan) && generatedUnit.tujuan.length > 0
        ? generatedUnit.tujuan
        : ['Memahami materi pokok secara konseptual', 'Mempraktikkan keterampilan mandiri', 'Menyusun laporan refleksi'],
      homeschoolingInstructions: [
        'Pelajari ringkasan materi secara mandiri atau bersama orang tua/tutor.',
        'Selesaikan Aktivitas 1 Pemahaman Konsep dan Aktivitas 2 Studi Kasus Kontekstual.',
        'Lakukan Proyek Praktik Nyata (Aktivitas 3) dan dokumentasikan buktinya.',
        'Kerjakan Soal Evaluasi dan kumpulkan lembar jawaban kepada tutor pendamping.'
      ],
      materiSummary: {
        title: generatedUnit.materiTitle || generatedUnit.topic || 'Ringkasan Materi Pembelajaran',
        points: Array.isArray(generatedUnit.materiPoints) && generatedUnit.materiPoints.length > 0
          ? generatedUnit.materiPoints
          : ['Poin utama materi', 'Konsep kunci dan aplikasi'],
        deepDiveMarkdown: generatedUnit.materiDeepDive || (typeof generatedUnit.materiSummary === 'string' ? generatedUnit.materiSummary : undefined)
      },
      activity1Pemahaman: {
        instruction: 'Jawab pertanyaan pemahaman konsep berikut dengan uraian mendalam dan bahasa sendiri.',
        questions: Array.isArray(generatedUnit.activity1Questions) && generatedUnit.activity1Questions.length > 0
          ? generatedUnit.activity1Questions
          : [
              { id: 'q1', type: 'essay', question: 'Jelaskan konsep utama materi ini berdasarkan pemahamanmu!', points: 20 },
              { id: 'q2', type: 'essay', question: 'Sebutkan 3 contoh penerapan konsep ini dalam kehidupan sehari-hari!', points: 20 }
            ]
      },
      activity2Penerapan: {
        title: generatedUnit.activity2?.title || 'Studi Kasus Kontekstual Homeschooling',
        contextDescription: generatedUnit.activity2?.contextDescription || 'Analisis situasi nyata yang berkaitan dengan materi ini.',
        taskInstruction: generatedUnit.activity2?.taskInstruction || 'Berikan solusi langkah demi langkah berdasarkan konsep yang telah dipelajari.',
        guidingQuestions: generatedUnit.activity2?.guidingQuestions || ['Apa faktor penyebab utama masalah tersebut?', 'Langkah praktis apa yang kamu rekomendasikan?']
      },
      activity3ProyekPraktik: {
        title: generatedUnit.activity3Practical?.title || 'Praktik Proyek Nyata Mandiri',
        objective: generatedUnit.activity3Practical?.objective || 'Menerapkan keterampilan langsung menghasilkan produk/laporan nyata.',
        toolsAndMaterials: generatedUnit.activity3Practical?.toolsAndMaterials || ['Alat tulis / buku catatan', 'Peralatan praktik sesuai topik', 'Kamera HP untuk dokumentasi'],
        steps: generatedUnit.activity3Practical?.steps || ['Persiapkan alat dan bahan', 'Laksanakan tahapan praktik sesuai panduan keselamatan', 'Dokumentasikan hasil karya'],
        expectedOutput: generatedUnit.activity3Practical?.expectedOutput || 'Produk fisik / portofolio dokumentasi foto kegiatan',
        safetyNotes: generatedUnit.activity3Practical?.safetyNotes || 'Pastikan memperhatikan keselamatan dan kebersihan selama praktik.',
        evidenceType: (generatedUnit.activity3Practical?.evidenceType as any) || 'foto'
      },
      soalEvaluasi: Array.isArray(generatedUnit.evalQuestions) && generatedUnit.evalQuestions.length > 0
        ? generatedUnit.evalQuestions
        : [
            {
              id: 'ev1',
              type: 'multiple-choice',
              question: 'Manakah pernyataan yang paling tepat mengenai materi ini?',
              options: ['A. Pilihan jawaban A', 'B. Pilihan jawaban B', 'C. Pilihan jawaban C', 'D. Pilihan jawaban D'],
              correctAnswer: 'A. Pilihan jawaban A',
              points: 10
            },
            {
              id: 'ev2',
              type: 'essay',
              question: 'Jelaskan analisis kesimpulan dan dampak dari penerapan konsep ini!',
              points: 15
            }
          ],
      refleksiPesertaDidik: [
        'Apa hal baru dan paling menarik yang kamu pelajari dari materi ini?',
        'Tantangan apa yang kamu temukan saat menyelesaikan tugas praktik dan bagaimana kamu mengatasinya?'
      ],
      rubrikKeterampilan: Array.isArray(generatedUnit.rubrikKeterampilan) && generatedUnit.rubrikKeterampilan.length > 0
        ? generatedUnit.rubrikKeterampilan
        : [
            {
              aspect: 'Kualitas Pelaksanaan Praktik & Laporan',
              level4: 'Sangat Baik (Langkah tepat, output rapi, orisinal)',
              level3: 'Baik (Langkah runtut, output lengkap)',
              level2: 'Cukup (Sebagian langkah terlaksana)',
              level1: 'Perlu Bimbingan (Memerlukan pendampingan intensif)'
            }
          ],
      rubrikSikap: [
        { sikap: 'Kemandirian', deskripsi: 'Menunjukkan inisiatif belajar mandiri tanpa bergantung penuh pada orang lain.' },
        { sikap: 'Bernalar Kritis & Kreatif', deskripsi: 'Menganalisis masalah logis dan berani mencoba ide orisinal.' }
      ],
      kunciJawabanDanPedoman: {
        pemahamanKey: generatedUnit.kunciJawaban?.pemahamanKey || 'Panduan jawaban mengacu pada pemahaman konsep dan argumentasi logis siswa.',
        penerapanKey: generatedUnit.kunciJawaban?.penerapanKey || 'Panduan solusi studi kasus mengacu pada ketepatan identifikasi masalah dan kelayakan solusi.',
        evaluasiKey: generatedUnit.kunciJawaban?.evaluasiKey || [{ questionId: 'ev1', answer: 'A', explanation: 'Kunci jawaban objektif.' }],
        tutorNotes: generatedUnit.kunciJawaban?.tutorNotes || 'Berikan umpan balik yang membangun rasa percaya diri peserta didik homeschooling.'
      }
    };

    onAddCustomUnit(
      grade,
      subjectId,
      newUnit,
      syncTarget === 'current-unit' ? targetUnitNum : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header with Navy Branding */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between border-b-2 border-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white tracking-wide">
                  Sinkronisasi Materi PDF & AI Generator Modul
                </h3>
                <span className="text-[10px] bg-blue-500/30 text-blue-200 border border-blue-400/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  Gemini 3.7 Flash
                </span>
              </div>
              <p className="text-[11px] text-blue-200">
                Ekstrak materi dari buku teks PDF atau susun LKPD Kurikulum Merdeka PKBM Buana Mekar secara otomatis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 px-5 pt-2 border-b border-slate-200 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pdf-sync')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 border-t-2 ${
              activeTab === 'pdf-sync'
                ? 'bg-white text-blue-900 border-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>1. Ekstrak & Sinkronkan dari PDF / Buku Teks</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-prompt')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 border-t-2 ${
              activeTab === 'ai-prompt'
                ? 'bg-white text-indigo-900 border-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>2. Generate Topik / Proyek Cerdas AI</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs bg-slate-50/50">
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
              <strong>Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Target Destination Controls */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  Target Integrasi Modul:
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {currentSubjectObj.name} • Kelas {grade}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Grade */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenjang & Kelas:</label>
                  <select
                    value={grade}
                    onChange={e => setGrade(Number(e.target.value) as GradeLevel)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  >
                    {GRADE_CONFIG.map(g => (
                      <option key={g.grade} value={g.grade}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran:</label>
                  <select
                    value={subjectId}
                    onChange={e => setSubjectId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <optgroup label="📘 Paket B — Setara SMP (Kelas 7–9)">
                      {ALL_SUBJECTS.filter(s => s.programGroup === 'paket-b').map(s => (
                        <option key={s.id} value={s.id}>
                          📘 {s.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="📕 Paket C — Setara SMA (Wajib Umum)">
                      {ALL_SUBJECTS.filter(s => s.programGroup === 'paket-c-wajib').map(s => (
                        <option key={s.id} value={s.id}>
                          📕 {s.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🔬 Paket C — Pilihan IPA & Sains">
                      {ALL_SUBJECTS.filter(s => s.programGroup === 'paket-c-ipa').map(s => (
                        <option key={s.id} value={s.id}>
                          🔬 {s.name} (Peminatan IPA)
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="📊 Paket C — Pilihan IPS & Sosial">
                      {ALL_SUBJECTS.filter(s => s.programGroup === 'paket-c-ips').map(s => (
                        <option key={s.id} value={s.id}>
                          📊 {s.name} (Peminatan IPS)
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🛠️ Keterampilan Vokasi & Program Keahlian">
                      {ALL_SUBJECTS.filter(s => s.category === 'keterampilan-vokasi').map(s => (
                        <option key={s.id} value={s.id}>
                          🛠️ {s.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🌱 Kelompok Pemberdayaan">
                      {ALL_SUBJECTS.filter(s => s.category === 'pemberdayaan').map(s => (
                        <option key={s.id} value={s.id}>
                          🌱 {s.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🌐 Muatan Lokal & Bahasa Pilihan">
                      {ALL_SUBJECTS.filter(s => s.programGroup === 'bahasa-mulok').map(s => (
                        <option key={s.id} value={s.id}>
                          🌐 {s.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Target Unit Mode */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pilihan Unit Target:</label>
                  <div className="flex gap-2">
                    <select
                      value={syncTarget === 'current-unit' ? targetUnitNum : 'new'}
                      onChange={e => {
                        if (e.target.value === 'new') {
                          setSyncTarget('new-unit');
                        } else {
                          setSyncTarget('current-unit');
                          setTargetUnitNum(Number(e.target.value));
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(u => (
                        <option key={u} value={u}>
                          Sinkronkan ke Unit {u} (Semester {u <= 4 ? 1 : 2})
                        </option>
                      ))}
                      <option value="new">+ Tambah Sebagai Unit Baru</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* TAB 1: PDF Extractor & Sync */}
            {activeTab === 'pdf-sync' && (
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <label className="font-bold text-slate-800 block text-xs">
                      Teks Materi PDF / Buku Teks Pembelajaran:
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Tempel (paste) teks dari modul PDF atau unggah berkas catatan kurikulum
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md border border-slate-300 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>Unggah Teks/PDF</span>
                      <input
                        type="file"
                        accept=".txt,.doc,.docx,.pdf,.md"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Official Kurikulum Merdeka Digital Textbook Sync Banner */}
                <div className="bg-linear-to-r from-blue-900 to-indigo-950 text-white p-3 rounded-xl border border-blue-800 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-emerald-500 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded uppercase">
                          SIBI Kemendikdasmen
                        </span>
                        <span className="font-bold text-xs text-white">
                          {officialTextbook.bookTitle}
                        </span>
                      </div>
                      <p className="text-[10px] text-blue-200">
                        {officialTextbook.authorOrPublisher} ({officialTextbook.editionYear}) • {officialTextbook.curriculumStandard}
                      </p>
                    </div>

                    <a
                      href={officialTextbook.officialSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-bold text-[11px] shadow-2xs transition-colors shrink-0"
                      title="Buka Repositori Resmi SIBI Kemendikdasmen RI (Aktif)"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Buka Link SIBI (Aktif)</span>
                    </a>
                  </div>

                  <div className="pt-1 border-t border-blue-800/80">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-blue-200 font-bold">⚡ Muat Otomatis Bab:</span>
                      {officialTextbook.chapters.map((ch, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => handleLoadOfficialChapter(idx)}
                          className="px-2 py-0.5 bg-blue-800/90 hover:bg-blue-700 text-blue-100 hover:text-white border border-blue-600/80 rounded text-[10px] font-semibold transition-colors cursor-pointer"
                          title={`Muat teks: ${ch.chapterTitle}`}
                        >
                          Bab {ch.unitNumber}: {ch.chapterTitle.length > 20 ? ch.chapterTitle.slice(0, 20) + '...' : ch.chapterTitle}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sample Material Buttons for Fast Testing */}
                <div className="flex flex-wrap items-center gap-1.5 bg-blue-50/60 p-2.5 rounded-lg border border-blue-100">
                  <span className="text-[10px] font-bold text-blue-900 uppercase">Coba Contoh Lain:</span>
                  {SAMPLE_PDF_MATERIALS.map((sample, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => handleLoadSample(sample)}
                      className="px-2 py-0.5 bg-white hover:bg-blue-600 hover:text-white border border-blue-200 text-blue-900 font-semibold rounded text-[10px] transition-colors shadow-2xs"
                    >
                      {sample.title}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={6}
                  value={pdfSourceText}
                  onChange={e => setPdfSourceText(e.target.value)}
                  placeholder="Tempelkan isi materi bacaan dari modul PDF, buku pegangan guru/siswa, atau artikel ilmiah di sini..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 font-mono text-xs focus:bg-white focus:ring-1 focus:ring-blue-500"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Judul / Topik Utama (Opsional):
                    </label>
                    <input
                      type="text"
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      placeholder="Contoh: Fermentasi Roti Manis & Uji Gluten..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Fokus Keterampilan Proyek (Opsional):
                    </label>
                    <input
                      type="text"
                      value={learningGoals}
                      onChange={e => setLearningGoals(e.target.value)}
                      placeholder="Contoh: Praktik pembuatan di dapur rumah dan dokumentasi..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AI Prompt Based */}
            {activeTab === 'ai-prompt' && (
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Topik / Materi Pokok yang Diinginkan:
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="Contoh: Budidaya Sayuran Hidroponik Skala Rumah Tangga..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Capaian / Target Pembelajaran Khusus (Opsional):
                  </label>
                  <input
                    type="text"
                    value={learningGoals}
                    onChange={e => setLearningGoals(e.target.value)}
                    placeholder="Contoh: Mengukur pH air nutrisi, menyemai benih pakcoy, dan analisis biaya produksi..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (activeTab === 'pdf-sync' && !pdfSourceText.trim() && !topic.trim())}
              className="w-full py-3 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses Materi PDF & Menghasilkan Modul LKPD Lengkap...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {activeTab === 'pdf-sync'
                      ? 'Sinkronkan Materi PDF & Generate ke Modul'
                      : 'Generate LKPD Otomatis dengan AI'}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Generated Result Preview Card */}
          {generatedUnit && (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3.5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/80 pb-2.5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">
                    Hasil Sinkronisasi Selesai:
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {generatedUnit.topic}
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Sub-topik: {generatedUnit.subtopic} • Target: Unit {syncTarget === 'current-unit' ? targetUnitNum : 'Baru'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                    <FileCheck2 className="w-3 h-3 text-emerald-600" />
                    LKPD Terstruktur Valid
                  </span>
                </div>
              </div>

              {/* Capaian & Tujuan */}
              <div className="bg-white p-3 rounded-lg border border-blue-100 space-y-1.5">
                <p className="text-slate-800">
                  <strong className="text-blue-950 font-bold">Capaian Pembelajaran:</strong>{' '}
                  {generatedUnit.capaian}
                </p>
                {Array.isArray(generatedUnit.tujuan) && (
                  <div>
                    <span className="font-bold text-blue-950">Tujuan Pembelajaran:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-700 mt-0.5">
                      {generatedUnit.tujuan.map((t: string, i: number) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Ringkasan Materi */}
              {generatedUnit.materiDeepDive && (
                <div className="bg-white p-3 rounded-lg border border-blue-100 space-y-1">
                  <span className="font-bold text-blue-950 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    Ringkasan Materi Hasil Sinkronisasi:
                  </span>
                  <p className="text-slate-700 line-clamp-3 leading-relaxed text-[11px]">
                    {generatedUnit.materiDeepDive}
                  </p>
                </div>
              )}

              {/* Proyek & Evaluasi Snapshot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                {generatedUnit.activity3Practical && (
                  <div className="p-2.5 bg-white rounded-lg border border-blue-100">
                    <p className="font-bold text-indigo-950 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-indigo-600" />
                      Praktik: {generatedUnit.activity3Practical.title}
                    </p>
                    <p className="text-slate-600 mt-0.5 line-clamp-2">
                      {generatedUnit.activity3Practical.objective}
                    </p>
                  </div>
                )}
                {Array.isArray(generatedUnit.evalQuestions) && (
                  <div className="p-2.5 bg-white rounded-lg border border-blue-100">
                    <p className="font-bold text-emerald-950 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Evaluasi: {generatedUnit.evalQuestions.length} Butir Soal Terpadu
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      Termasuk kunci jawaban & pedoman penskoran tutor pendamping.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleApplyToCurriculum}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {syncTarget === 'current-unit'
                      ? `Terapkan & Sinkronkan ke Unit ${targetUnitNum} Modul Ini`
                      : `Tambahkan sebagai Unit Baru Kelas ${grade}`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[10px]">
            PKBM Buana Mekar AI Module Engine • Kurikulum Merdeka
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer shadow-2xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
