import React from 'react';
import {
  Search,
  Sparkles,
  UserCheck,
  Shield,
  ShieldCheck,
  Building2,
  Lock,
  Unlock,
  KeyRound,
  LayoutGrid,
  FileSpreadsheet,
  BarChart2,
  FileDown,
  Home,
  MessageCircle,
  BookOpen,
  ExternalLink,
  Users,
  GraduationCap
} from 'lucide-react';
import { GradeLevel, InstitutionSettings, AppSecuritySettings } from '../types';

interface NavbarProps {
  currentGrade: GradeLevel;
  onSelectGrade: (grade: GradeLevel) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isTutorMode: boolean;
  onToggleTutorMode: () => void;
  onOpenAIGenerator: () => void;
  onOpenDigitalTextbook?: () => void;
  onOpenBatchDownload: () => void;
  onOpenWhatsApp?: () => void;
  onOpenTeacherDirectory?: () => void;
  onOpenStudentDirectory?: () => void;
  activeView: 'mapel' | 'document' | 'curriculum';
  onSelectView: (view: 'mapel' | 'document' | 'curriculum') => void;
  institutionSettings: InstitutionSettings;
  securitySettings: AppSecuritySettings;
  isAdminAuthenticated: boolean;
  onOpenInstitutionSettings: () => void;
  onOpenSecuritySettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentGrade,
  onSelectGrade,
  searchQuery,
  onSearchChange,
  isTutorMode,
  onToggleTutorMode,
  onOpenAIGenerator,
  onOpenDigitalTextbook,
  onOpenBatchDownload,
  onOpenWhatsApp,
  onOpenTeacherDirectory,
  onOpenStudentDirectory,
  activeView,
  onSelectView,
  institutionSettings,
  securitySettings,
  isAdminAuthenticated,
  onOpenInstitutionSettings,
  onOpenSecuritySettings,
}) => {
  return (
    <header className="bg-blue-900 text-white p-2 sm:p-2.5 flex flex-col md:flex-row justify-between items-stretch md:items-center border-b-2 border-blue-800 shrink-0 gap-2">
      {/* Brand & Identity (Clickable to return to dashboard) */}
      <div
        onClick={() => onSelectView('mapel')}
        className="flex items-center space-x-2.5 cursor-pointer group select-none transition-opacity hover:opacity-95"
        title="Klik untuk kembali ke Dashboard Awal"
      >
        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white rounded flex items-center justify-center text-blue-900 font-black text-base sm:text-lg shadow-xs shrink-0 select-none uppercase group-hover:scale-105 transition-transform">
          {institutionSettings.shortName || 'BM'}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h1 className="text-sm sm:text-base font-black leading-tight tracking-wide uppercase truncate group-hover:text-blue-100 transition-colors">
              {institutionSettings.name || 'PKBM BUANA MEKAR'}
            </h1>
            {securitySettings.isProtectionEnabled && (
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                  isAdminAuthenticated
                    ? 'bg-emerald-500 text-slate-950 shadow-2xs'
                    : 'bg-blue-950 text-blue-300 border border-blue-700'
                }`}
                title={isAdminAuthenticated ? 'Sesi Admin Terbuka' : 'Proteksi PIN Aktif (Mode Siswa)'}
              >
                {isAdminAuthenticated ? 'Admin Unlocked' : 'Protected'}
              </span>
            )}
          </div>
          <p className="text-[10px] text-blue-200 truncate max-w-xs sm:max-w-md">
            {institutionSettings.tagline || 'Sistem LKPD Homeschooling Terpadu • Kurikulum Merdeka'}
          </p>
        </div>
      </div>

      {/* Main Navigation Menu Bar */}
      <div className="flex items-center gap-1 bg-blue-950/90 p-1 rounded-lg border border-blue-800 self-center md:self-auto overflow-x-auto">
        <button
          onClick={() => onSelectView('mapel')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeView === 'mapel'
              ? 'bg-blue-600 text-white shadow-xs ring-1 ring-blue-400'
              : 'text-blue-200 hover:text-white hover:bg-blue-800/60'
          }`}
          title="Kembali ke Dashboard Awal (15 Mata Pelajaran)"
        >
          <Home className="w-3.5 h-3.5 text-blue-200" />
          <span>Dashboard Awal</span>
        </button>

        <button
          onClick={() => onSelectView('document')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeView === 'document'
              ? 'bg-blue-600 text-white shadow-xs ring-1 ring-blue-400'
              : 'text-blue-200 hover:text-white hover:bg-blue-800/60'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-blue-200" />
          <span>Dokumen LKPD</span>
        </button>

        <button
          onClick={() => onSelectView('curriculum')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeView === 'curriculum'
              ? 'bg-blue-600 text-white shadow-xs ring-1 ring-blue-400'
              : 'text-blue-200 hover:text-white hover:bg-blue-800/60'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5 text-blue-200" />
          <span>Struktur Kurikulum</span>
        </button>
      </div>

      {/* Center Search controls */}
      <div className="flex items-center gap-1.5 flex-1 max-w-xs mx-0 md:mx-1">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-300" />
          <input
            type="text"
            placeholder="Cari mapel, topik..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-blue-950/80 border border-blue-700/80 rounded text-xs text-white placeholder-blue-300/70 focus:outline-none focus:ring-1 focus:ring-blue-400 font-sans"
          />
        </div>
      </div>

      {/* Right Status & Tools */}
      <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-xs">
        {/* Menu Pengaturan Lembaga */}
        <button
          onClick={onOpenInstitutionSettings}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-800 hover:bg-blue-700 text-white font-semibold text-xs transition-colors border border-blue-600/80 shadow-2xs cursor-pointer"
          title="Buka Pengaturan Lembaga, NPSN, Kop LKPD, & Kepala Sekolah"
        >
          <Building2 className="w-3.5 h-3.5 text-blue-200" />
          <span className="hidden sm:inline">Lembaga</span>
        </button>

        {/* Menu Daftar Guru (Upload Excel / Input Manual) */}
        {onOpenTeacherDirectory && (
          <button
            onClick={onOpenTeacherDirectory}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs transition-colors border border-emerald-600/80 shadow-2xs cursor-pointer"
            title="Buka Menu Daftar Guru: Input manual, upload Excel, dan kelola WhatsApp guru"
          >
            <Users className="w-3.5 h-3.5 text-emerald-300" />
            <span>Daftar Guru</span>
          </button>
        )}

        {/* Menu Daftar Siswa (Upload Excel / Input Manual) */}
        {onOpenStudentDirectory && (
          <button
            onClick={onOpenStudentDirectory}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-sky-800 hover:bg-sky-700 text-white font-bold text-xs transition-colors border border-sky-600/80 shadow-2xs cursor-pointer"
            title="Buka Menu Daftar Siswa: Input manual, upload Excel (.xlsx/.csv), dan kelola data murid"
          >
            <GraduationCap className="w-3.5 h-3.5 text-sky-300" />
            <span>Daftar Siswa</span>
          </button>
        )}

        {/* Menu Proteksi Admin */}
        <button
          onClick={onOpenSecuritySettings}
          className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold text-xs transition-colors border shadow-2xs cursor-pointer ${
            isAdminAuthenticated
              ? 'bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-500'
              : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/50'
          }`}
          title="Pengaturan Proteksi Aplikasi & PIN Admin"
        >
          {isAdminAuthenticated ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Admin: Terbuka</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Proteksi Admin</span>
            </>
          )}
        </button>

        {/* Prominent WhatsApp Dispatch & Kirim LKPD Action Button */}
        {onOpenWhatsApp && (
          <button
            onClick={onOpenWhatsApp}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            title="Buka Menu Pengiriman Lembar Kerja Soal & Jawaban via WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">Kirim LKPD</span>
          </button>
        )}

        {/* Prominent Save PDF / Cetak Action Button */}
        <button
          onClick={onOpenBatchDownload}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          title="Buka Menu Simpan PDF & Cetak Seluruh LKPD"
        >
          <FileDown className="w-3.5 h-3.5 text-white" />
          <span className="hidden lg:inline">Simpan PDF / Cetak</span>
          <span className="lg:hidden">Cetak</span>
        </button>

        {/* Buku Teks & Modul Digital Kurikulum Merdeka */}
        {onOpenDigitalTextbook && (
          <button
            onClick={onOpenDigitalTextbook}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-colors border border-blue-500/80 cursor-pointer"
            title="Buka Pusat Buku Teks & Modul Digital Kurikulum Merdeka (Tersinkronisasi buku.kemendikdasmen.go.id)"
          >
            <BookOpen className="w-3.5 h-3.5 text-yellow-300" />
            <span className="hidden sm:inline">Buku & Modul</span>
            <span className="sm:hidden">Buku</span>
          </button>
        )}

        {/* Link Langsung Portal Resmi Kemendikdasmen */}
        <a
          href="https://buku.kemendikdasmen.go.id/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden xl:inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-950/80 hover:bg-blue-800 text-blue-200 hover:text-white border border-blue-700/70 text-[11px] font-semibold transition-colors"
          title="Kunjungi Portal Perbukuan Resmi Kemendikdasmen: https://buku.kemendikdasmen.go.id/ (Tab Baru)"
        >
          <ExternalLink className="w-3 h-3 text-amber-400" />
          <span>buku.kemendikdasmen.go.id</span>
        </a>

        {/* AI Generator Button */}
        <button
          onClick={onOpenAIGenerator}
          className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
          title="Buka AI Generator LKPD"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span className="hidden sm:inline">AI Gen</span>
        </button>

        {/* Tutor Mode Toggle */}
        <button
          onClick={onToggleTutorMode}
          className={`flex items-center gap-1 px-2 py-1 rounded font-semibold text-xs transition-colors border cursor-pointer ${
            isTutorMode
              ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs'
              : 'bg-blue-950 text-blue-200 border-blue-700 hover:bg-blue-800'
          }`}
          title={isTutorMode ? 'Mode Tutor Aktif (Kunci Jawaban Tampil)' : 'Mode Siswa (Kunci Jawaban Tersembunyi)'}
        >
          {isTutorMode ? (
            <>
              <Shield className="w-3.5 h-3.5 text-slate-950" />
              <span>Tutor</span>
            </>
          ) : (
            <>
              <UserCheck className="w-3.5 h-3.5" />
              <span>Siswa</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
