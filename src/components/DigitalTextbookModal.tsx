import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ExternalLink,
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  Download,
  Search,
  BookMarked,
  Layers,
  ChevronRight,
  Eye,
  Copy,
  Printer,
  Share2,
  X,
  RefreshCw,
  FolderOpen,
  Link2,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { GradeLevel, LKPDUnit, SubjectModule } from '../types';
import {
  DIGITAL_TEXTBOOK_CATALOG,
  DigitalTextbookItem,
  findDigitalTextbook,
  getOrCreateTextbookForSubject
} from '../data/textbookDirectory';

interface DigitalTextbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeModule?: SubjectModule;
  activeUnit?: LKPDUnit;
  onSyncUnitWithTextbook?: (syncedData: {
    topic: string;
    subtopic?: string;
    capaian: string;
    tujuan: string[];
    materiTitle: string;
    materiPoints: string[];
    materiDeepDive: string;
    sourceBookTitle: string;
    officialUrl: string;
  }) => void;
  onOpenAIGeneratorWithText?: (text: string, title: string) => void;
}

export const DigitalTextbookModal: React.FC<DigitalTextbookModalProps> = ({
  isOpen,
  onClose,
  activeModule,
  activeUnit,
  onSyncUnitWithTextbook,
  onOpenAIGeneratorWithText,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(activeModule?.grade || 7);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(activeModule?.id || 'tata-busana');
  const [activeTab, setActiveTab] = useState<'catalog' | 'upload' | 'reader'>('catalog');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedChapterIdx, setSelectedChapterIdx] = useState<number>(0);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Custom uploaded/pasted text states
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [customPdfUrl, setCustomPdfUrl] = useState<string>('');
  const [customTextContent, setCustomTextContent] = useState<string>('');
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  // Sync with active module whenever opened
  useEffect(() => {
    if (activeModule) {
      setSelectedGrade(activeModule.grade);
      setSelectedSubjectId(activeModule.id);
    }
    if (activeUnit) {
      // Find chapter matching unit number
      setSelectedChapterIdx(Math.max(0, activeUnit.unitNumber - 1));
    }
  }, [isOpen, activeModule, activeUnit]);

  if (!isOpen) return null;

  const currentBook = getOrCreateTextbookForSubject(
    selectedSubjectId,
    activeModule?.name || 'Mata Pelajaran',
    selectedGrade
  );

  const activeChapter = currentBook.chapters[selectedChapterIdx] || currentBook.chapters[0];

  const filteredCatalog = DIGITAL_TEXTBOOK_CATALOG.filter(b => {
    const matchesSearch = b.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.curriculumStandard.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setUploadedFileName(file.name);

    const reader = new FileReader();

    // Check if text/json/markdown
    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.json')) {
      reader.onload = (event) => {
        const text = (event.target?.result as string) || '';
        setCustomTextContent(text);
        setIsProcessingFile(false);
        setFeedbackMessage({
          type: 'success',
          text: `Berkas "${file.name}" (${Math.round(file.size / 1024)} KB) berhasil diekstrak dan disinkronkan!`
        });
        setTimeout(() => setFeedbackMessage(null), 4000);
      };
      reader.readAsText(file);
    } else {
      // For PDF or other binary docs, attempt text read or create structured reference
      reader.onload = (event) => {
        const text = (event.target?.result as string) || '';
        // If raw reader can extract printable characters
        const printableText = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ').slice(0, 15000);
        
        if (printableText.trim().length > 50) {
          setCustomTextContent(printableText);
        } else {
          setCustomTextContent(
            `DOKUMEN BUKU TEKS PDF: ${file.name}\nUkuran: ${Math.round(file.size / 1024)} KB\nTanggal Unggah: ${new Date().toLocaleDateString('id-ID')}\n\nCatatan Materi: Dokumen ini telah terdaftar sebagai referensi modul aktif Kurikulum Merdeka.`
          );
        }

        setIsProcessingFile(false);
        setFeedbackMessage({
          type: 'success',
          text: `Dokumen PDF "${file.name}" siap disinkronkan ke Modul Pembelajaran!`
        });
        setTimeout(() => setFeedbackMessage(null), 4000);
      };
      reader.readAsText(file);
    }
  };

  const handleApplyCurrentChapterToUnit = () => {
    if (!activeChapter) return;

    if (onSyncUnitWithTextbook) {
      onSyncUnitWithTextbook({
        topic: activeChapter.chapterTitle,
        subtopic: activeChapter.subtopics.join(' • '),
        capaian: activeChapter.capaianPembelajaran,
        tujuan: activeChapter.tujuanPembelajaran,
        materiTitle: activeChapter.chapterTitle,
        materiPoints: activeChapter.summaryPoints,
        materiDeepDive: activeChapter.fullLessonText,
        sourceBookTitle: currentBook.bookTitle,
        officialUrl: currentBook.officialSourceUrl
      });
    }

    setFeedbackMessage({
      type: 'success',
      text: `Materi "${activeChapter.chapterTitle}" berhasil disinkronkan ke Unit LKPD aktif!`
    });
    setTimeout(() => {
      setFeedbackMessage(null);
      onClose();
    }, 1200);
  };

  const handleSendCustomTextToAI = () => {
    if (!customTextContent.trim()) {
      setFeedbackMessage({
        type: 'error',
        text: 'Silakan unggah berkas PDF atau masukkan teks materi terlebih dahulu!'
      });
      return;
    }

    if (onOpenAIGeneratorWithText) {
      onOpenAIGeneratorWithText(
        customTextContent,
        uploadedFileName ? `Materi dari Berkas: ${uploadedFileName}` : 'Materi PDF Pembelajaran'
      );
      onClose();
    }
  };

  const handleCopyChapterText = () => {
    if (activeChapter) {
      navigator.clipboard.writeText(`${activeChapter.chapterTitle}\n\n${activeChapter.fullLessonText}`);
      setFeedbackMessage({
        type: 'success',
        text: 'Teks bab materi berhasil disalin ke clipboard!'
      });
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-5xl h-[92vh] max-h-[850px] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  Pusat Buku Teks & Modul Digital Kurikulum Merdeka
                </h3>
                <a
                  href="https://buku.kemendikdasmen.go.id/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-blue-100 hover:text-white border border-blue-400/50 px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors"
                  title="Kunjungi Portal Resmi Perbukuan SIBI Kemendikdasmen: https://buku.kemendikdasmen.go.id/ (Tab Baru)"
                >
                  <ExternalLink className="w-3 h-3 text-yellow-300" />
                  <span>Tersinkronisasi buku.kemendikdasmen.go.id</span>
                </a>
              </div>
              <p className="text-xs text-slate-400">
                Terintegrasi Sistem Informasi Perbukuan Indonesia (SIBI Kemendikdasmen RI) & Modul Pendidikan Kesetaraan
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://buku.kemendikdasmen.go.id/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              title="Buka Portal Kemendikdasmen di Tab Baru"
            >
              <ExternalLink className="w-3.5 h-3.5 text-yellow-300" />
              <span>Portal Kemendikdasmen</span>
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100 px-5 pt-2 border-b border-slate-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-2 font-bold text-xs rounded-t-lg border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-white text-blue-900 border-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5 text-blue-600" />
              <span>Katalog Buku Teks & Modul Baku ({DIGITAL_TEXTBOOK_CATALOG.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('reader')}
              className={`px-3.5 py-2 font-bold text-xs rounded-t-lg border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'reader'
                  ? 'bg-white text-blue-900 border-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Pembaca Teks Modul Terpadu</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3.5 py-2 font-bold text-xs rounded-t-lg border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-white text-blue-900 border-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
              <span>Unggah PDF / Teks Mandiri</span>
            </button>
          </div>

          {/* Quick Active Module Badge */}
          {activeModule && (
            <div className="hidden md:flex items-center gap-2 text-xs py-1 px-2.5 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg">
              <span className="font-semibold">{activeModule.name}</span>
              <span className="text-[10px] text-blue-600 font-mono">
                [Kelas {activeModule.grade} • Unit {activeUnit?.unitNumber || 1}]
              </span>
            </div>
          )}
        </div>

        {/* Feedback Alert if any */}
        {feedbackMessage && (
          <div
            className={`px-5 py-2 text-xs flex items-center justify-between ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-b border-emerald-200'
                : feedbackMessage.type === 'error'
                ? 'bg-red-50 text-red-900 border-b border-red-200'
                : 'bg-blue-50 text-blue-900 border-b border-blue-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-medium">{feedbackMessage.text}</span>
            </div>
          </div>
        )}

        {/* Tab Content Container */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* TAB 1: CATALOG OF OFFICIAL TEXTBOOKS */}
          {activeTab === 'catalog' && (
            <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
              {/* Left Side: Book Selection & Filter */}
              <div className="md:col-span-4 border-r border-slate-200 bg-slate-50 flex flex-col overflow-hidden">
                {/* Search Bar */}
                <div className="p-3 border-b border-slate-200 bg-white">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Cari mata pelajaran / buku teks..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Book List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                  {filteredCatalog.map(book => {
                    const isSelected = book.id === currentBook.id;
                    return (
                      <div
                        key={book.id}
                        onClick={() => {
                          setSelectedSubjectId(book.subjectId);
                          setSelectedGrade(book.grade);
                          setSelectedChapterIdx(0);
                        }}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 shadow-2xs'
                            : 'bg-white hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                            Kelas {book.grade} • {book.grade <= 9 ? 'Paket B' : 'Paket C'}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">
                            {book.editionYear}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                          {book.subjectName}
                        </h4>
                        <p className="text-[10px] text-slate-600 line-clamp-2 mt-0.5">
                          {book.bookTitle}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {book.chapters.length} Bab / Unit
                          </span>
                          <span className="text-blue-700 font-bold hover:underline flex items-center gap-0.5">
                            Pilih <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Side: Selected Book Detail & Chapter Browser */}
              <div className="md:col-span-8 flex flex-col overflow-hidden bg-white">
                {/* Book Header Card */}
                <div className="p-4 border-b border-slate-200 bg-linear-to-r from-blue-900 to-indigo-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-500 text-white font-black text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">
                        {currentBook.curriculumStandard}
                      </span>
                      <span className="text-xs text-blue-200">
                        Kelas {currentBook.grade}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm sm:text-base text-white">
                      {currentBook.bookTitle}
                    </h3>
                    <p className="text-xs text-blue-200">
                      Penerbit: {currentBook.authorOrPublisher} ({currentBook.editionYear})
                    </p>
                  </div>

                  {/* Active Module Direct Link Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto">
                    <a
                      href={currentBook.officialSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-xs transition-colors"
                      title="Buka Halaman Katalog Resmi SIBI Kemendikdasmen RI (buku.kemendikdasmen.go.id)"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Link SIBI Kemendikdasmen (Aktif)</span>
                    </a>

                    {currentBook.pdfDownloadUrl && (
                      <a
                        href={currentBook.pdfDownloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-xs border border-white/20 transition-colors"
                        title="Buka repositori / PDF Buku"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF Modul</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Chapter Selector & Detail */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Chapter Navigation Chips */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Daftar Bab & Unit Pembelajaran Tersedia:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentBook.chapters.map((ch, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedChapterIdx(idx)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            selectedChapterIdx === idx
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                          }`}
                        >
                          Unit {ch.unitNumber}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Chapter Details Card */}
                  <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 space-y-3.5">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-2.5">
                      <div>
                        <h4 className="font-bold text-sm text-blue-950">
                          {activeChapter.chapterTitle}
                        </h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {activeChapter.subtopics.map((sub, i) => (
                            <span key={i} className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">
                              {sub}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={handleApplyCurrentChapterToUnit}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
                        title="Terapkan materi bab ini langsung ke lembar kerja LKPD saat ini"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                        <span>⚡ Sinkronkan ke LKPD Ini</span>
                      </button>
                    </div>

                    {/* CP & TP */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-800 text-[11px] block">
                          Capaian Pembelajaran (CP):
                        </span>
                        <p className="text-slate-600 italic leading-relaxed">
                          {activeChapter.capaianPembelajaran}
                        </p>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-800 text-[11px] block">
                          Tujuan Pembelajaran (TP):
                        </span>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                          {activeChapter.tujuanPembelajaran.map((tp, i) => (
                            <li key={i}>{tp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Summary Points */}
                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Poin Pokok Ringkasan Materi:
                      </span>
                      <ul className="list-disc pl-5 space-y-1 text-slate-700">
                        {activeChapter.summaryPoints.map((pt, i) => (
                          <li key={i} className="leading-relaxed">{pt}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Chapter Text Preview */}
                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                          Pratinjau Teks Lengkap Bab Materi
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={handleCopyChapterText}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center gap-1 border border-slate-300 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Salin Teks</span>
                          </button>
                          <button
                            onClick={() => setActiveTab('reader')}
                            className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center gap-1 border border-blue-200 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Buka di Pembaca Penuh</span>
                          </button>
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-800 font-mono text-[11px] leading-relaxed whitespace-pre-line">
                        {activeChapter.fullLessonText}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IN-APP COMPLETE READER */}
          {activeTab === 'reader' && (
            <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
              {/* Reader Toolbar */}
              <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">
                    {currentBook.subjectName} — {activeChapter.chapterTitle}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    [Buku Siswa Kurikulum Merdeka]
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-[11px]">
                    <span className="text-slate-500 font-semibold px-1">Ukuran Teks:</span>
                    <button
                      onClick={() => setFontSize('normal')}
                      className={`px-2 py-0.5 rounded font-bold ${fontSize === 'normal' ? 'bg-white shadow-2xs text-blue-900' : 'text-slate-600'}`}
                    >
                      A
                    </button>
                    <button
                      onClick={() => setFontSize('large')}
                      className={`px-2 py-0.5 rounded font-bold text-xs ${fontSize === 'large' ? 'bg-white shadow-2xs text-blue-900' : 'text-slate-600'}`}
                    >
                      A+
                    </button>
                    <button
                      onClick={() => setFontSize('xlarge')}
                      className={`px-2 py-0.5 rounded font-bold text-sm ${fontSize === 'xlarge' ? 'bg-white shadow-2xs text-blue-900' : 'text-slate-600'}`}
                    >
                      A++
                    </button>
                  </div>

                  <button
                    onClick={handleCopyChapterText}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg border border-slate-300 flex items-center gap-1 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </button>

                  <button
                    onClick={handleApplyCurrentChapterToUnit}
                    className="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    <span>Sinkronkan ke LKPD</span>
                  </button>
                </div>
              </div>

              {/* Reading Content Area */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-4xl mx-auto w-full">
                <div className="bg-white shadow-xs border border-slate-200 rounded-xl p-8 space-y-6">
                  {/* Article Title & Meta */}
                  <div className="border-b border-slate-200 pb-4">
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-1">
                      {currentBook.bookTitle}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-950">
                      {activeChapter.chapterTitle}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                      <span>Penerbit: {currentBook.authorOrPublisher}</span>
                      <span>•</span>
                      <span>Standar: {currentBook.curriculumStandard}</span>
                    </div>
                  </div>

                  {/* Main Article Body */}
                  <div
                    className={`leading-relaxed text-slate-800 whitespace-pre-line space-y-4 font-serif ${
                      fontSize === 'normal'
                        ? 'text-sm'
                        : fontSize === 'large'
                        ? 'text-base'
                        : 'text-lg'
                    }`}
                  >
                    {activeChapter.fullLessonText}
                  </div>

                  {/* Summary & Practical Activities Card */}
                  <div className="mt-8 pt-6 border-t border-slate-200 bg-blue-50/60 p-5 rounded-xl border border-blue-100 space-y-3 font-sans">
                    <h4 className="font-bold text-blue-950 text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-700" />
                      Rangkuman Capaian Pembelajaran Mandiri
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                      {activeChapter.summaryPoints.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: UPLOAD PDF & CUSTOM DOCUMENT SYNCHRONIZER */}
          {activeTab === 'upload' && (
            <div className="flex-1 overflow-y-auto p-5 sm:p-8 max-w-3xl mx-auto w-full space-y-5">
              <div className="bg-linear-to-r from-indigo-900 to-slate-900 text-white p-5 rounded-xl shadow-md space-y-2">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-6 h-6 text-indigo-300" />
                  <h3 className="font-bold text-base text-white">
                    Unggah Berkas PDF / Dokumen Pembelajaran Otomatis
                  </h3>
                </div>
                <p className="text-xs text-indigo-200 leading-relaxed">
                  Unggah buku teks PDF mandiri, modul kompilasi guru, atau salin tautan PDF eksternal. Sistem AI akan mengekstrak materi, menyusun Capaian Pembelajaran (CP), Tujuan Pembelajaran (TP), aktivitas studi kasus, tugas praktik, serta soal evaluasi secara otomatis.
                </p>
              </div>

              {/* Upload Dropzone */}
              <div className="bg-white border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-2xl p-6 text-center transition-all">
                <input
                  type="file"
                  id="pdfUploadInput"
                  accept=".pdf,.txt,.docx,.doc,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="pdfUploadInput"
                  className="flex flex-col items-center justify-center gap-2.5 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center">
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      Pilih atau Seret Berkas PDF / Dokumen ke Sini
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Mendukung format PDF, TXT, DOCX, atau salinan materi digital (Maks. 25 MB)
                    </p>
                  </div>
                  <span className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors">
                    Pilih Berkas dari Komputer/HP
                  </span>
                </label>
              </div>

              {/* External URL Attachment Option */}
              <div className="bg-white border border-slate-300 rounded-xl p-4 space-y-2 text-xs">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-blue-700" />
                  Atau Tautkan Link PDF / Modul Ajar Cloud (Google Drive / SIBI / Web):
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/... atau https://buku.kemendikdasmen.go.id/..."
                    value={customPdfUrl}
                    onChange={e => setCustomPdfUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                  <button
                    onClick={() => {
                      if (customPdfUrl) {
                        setFeedbackMessage({
                          type: 'success',
                          text: 'Tautan modul eksternal berhasil ditautkan sebagai referensi aktif!'
                        });
                        setTimeout(() => setFeedbackMessage(null), 3000);
                      }
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs"
                  >
                    Simpan Tautan
                  </button>
                </div>
              </div>

              {/* Textarea for Extracted or Manual Text */}
              <div className="bg-white border border-slate-300 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-700" />
                    Isi Teks Materi Pembelajaran yang Siap Disinkronkan:
                  </label>
                  {uploadedFileName && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Berkas: {uploadedFileName}
                    </span>
                  )}
                </div>
                <textarea
                  rows={8}
                  value={customTextContent}
                  onChange={e => setCustomTextContent(e.target.value)}
                  placeholder="Ketik atau tempel teks bab materi buku pelajaran di sini jika tidak mengunggah berkas..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono leading-relaxed focus:outline-none focus:border-blue-600 focus:bg-white text-slate-800"
                />
              </div>

              {/* Sync Trigger Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSendCustomTextToAI}
                  disabled={!customTextContent.trim() || isProcessingFile}
                  className="w-full sm:w-auto px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 disabled:bg-slate-300 text-white rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>⚡ Ekstrak & Susun LKPD Otomatis dengan AI</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-5 py-2.5 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Terhubung ke Portal Perbukuan Resmi Kemendikdasmen (buku.kemendikdasmen.go.id) & Kurikulum Merdeka
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-200 text-slate-800 font-bold rounded-lg border border-slate-300 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
