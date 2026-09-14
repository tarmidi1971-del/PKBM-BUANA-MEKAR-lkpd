import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Lock,
  Unlock,
  Save,
  Check,
  RotateCcw,
  AlertTriangle,
  FileText,
  Building2,
  Sparkles,
  Layers,
  Eye,
  EyeOff
} from 'lucide-react';
import { AppSecuritySettings } from '../types';
import { DEFAULT_SECURITY_SETTINGS } from '../data/settingsStorage';

interface SecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  securitySettings: AppSecuritySettings;
  onSaveSecuritySettings: (newSettings: AppSecuritySettings) => void;
  onLockAdminSession: () => void;
}

export const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({
  isOpen,
  onClose,
  securitySettings,
  onSaveSecuritySettings,
  onLockAdminSession,
}) => {
  const [formData, setFormData] = useState<AppSecuritySettings>(securitySettings);
  const [oldPin, setOldPin] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setFormData(securitySettings);
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen, securitySettings]);

  if (!isOpen) return null;

  const handleToggle = (field: keyof AppSecuritySettings) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    let updatedPin = formData.adminPin;

    // If user attempted to change PIN
    if (newPin.trim()) {
      if (oldPin.trim() !== securitySettings.adminPin.trim()) {
        setErrorMessage('PIN Lama tidak sesuai.');
        return;
      }
      if (newPin.trim().length < 4) {
        setErrorMessage('PIN Baru minimal 4 karakter/angka.');
        return;
      }
      if (newPin.trim() !== confirmPin.trim()) {
        setErrorMessage('Konfirmasi PIN baru tidak sama.');
        return;
      }
      updatedPin = newPin.trim();
    }

    const updatedSettings: AppSecuritySettings = {
      ...formData,
      adminPin: updatedPin,
    };

    onSaveSecuritySettings(updatedSettings);
    setSuccessMessage('Pengaturan proteksi & keamanan aplikasi berhasil disimpan!');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleResetDefaults = () => {
    setFormData(DEFAULT_SECURITY_SETTINGS);
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl border border-slate-300 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b-2 border-slate-900 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              <ShieldCheck className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <span>Pengaturan Proteksi & Keamanan Admin</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-mono font-bold">
                  Hak Akses Guru/Admin
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                Kendalikan proteksi kunci jawaban, pengaturan lembaga, dan modul pembelajaran agar hanya bisa dibuka oleh admin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs text-slate-800">
          <form id="security-form" onSubmit={handleSave} className="space-y-4">
            {/* Master Switch */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-blue-950 text-xs">
                  Status Proteksi Keamanan Aplikasi
                </h4>
                <p className="text-[11px] text-blue-800">
                  {formData.isProtectionEnabled
                    ? 'Proteksi AKTIF — Fitur administratif memerlukan PIN Admin.'
                    : 'Proteksi NONAKTIF — Semua menu dapat diakses bebas tanpa PIN.'}
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isProtectionEnabled}
                  onChange={() => handleToggle('isProtectionEnabled')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Checklist of Protected Features */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2.5">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                <Lock className="w-4 h-4 text-blue-800" />
                <span>Pilih Fitur yang Wajib Memakai PIN Admin:</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <label className="flex items-start gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer hover:bg-slate-50 select-none">
                  <input
                    type="checkbox"
                    checked={formData.protectTutorMode}
                    onChange={() => handleToggle('protectTutorMode')}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900">Mode Tutor & Kunci Jawaban</span>
                    <p className="text-[10px] text-slate-500">Mencegah siswa melihat kunci jawaban & rubrik penilaian</p>
                  </div>
                </label>

                <label className="flex items-start gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer hover:bg-slate-50 select-none">
                  <input
                    type="checkbox"
                    checked={formData.protectInstitutionSettings}
                    onChange={() => handleToggle('protectInstitutionSettings')}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900">Profil & Kop Lembaga</span>
                    <p className="text-[10px] text-slate-500">Mencegah perubahan nama PKBM, NPSN, dan kepala lembaga</p>
                  </div>
                </label>

                <label className="flex items-start gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer hover:bg-slate-50 select-none">
                  <input
                    type="checkbox"
                    checked={formData.protectAIGenerator}
                    onChange={() => handleToggle('protectAIGenerator')}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900">AI Generator Modul</span>
                    <p className="text-[10px] text-slate-500">Membatasi penambahan unit baru hanya oleh guru</p>
                  </div>
                </label>

                <label className="flex items-start gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer hover:bg-slate-50 select-none">
                  <input
                    type="checkbox"
                    checked={formData.protectCurriculumEdit}
                    onChange={() => handleToggle('protectCurriculumEdit')}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900">Struktur Kurikulum & Unduh Massal</span>
                    <p className="text-[10px] text-slate-500">Proteksi konfigurasi kurikulum 90 modul</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Change Admin PIN Section */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-blue-800" />
                  <span>Ubah PIN Admin (Opsional)</span>
                </span>
                <span className="text-[10px] text-slate-500 font-normal">
                  PIN saat ini: <code className="font-mono font-bold text-slate-800">{showPin ? formData.adminPin : '••••••'}</code>
                </span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    PIN Lama:
                  </label>
                  <input
                    type="password"
                    maxLength={16}
                    value={oldPin}
                    onChange={e => setOldPin(e.target.value)}
                    placeholder="PIN Lama..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    PIN Baru:
                  </label>
                  <input
                    type="password"
                    maxLength={16}
                    value={newPin}
                    onChange={e => setNewPin(e.target.value)}
                    placeholder="PIN Baru..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Ulangi PIN Baru:
                  </label>
                  <input
                    type="password"
                    maxLength={16}
                    value={confirmPin}
                    onChange={e => setConfirmPin(e.target.value)}
                    placeholder="Ulangi PIN Baru..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Recovery Question & Answer */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                <Shield className="w-4 h-4 text-blue-800" />
                <span>Pertanyaan Pemulihan Sandi (Jika Lupa PIN)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Pertanyaan Rahasia:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.securityQuestion}
                    onChange={e => setFormData({ ...formData, securityQuestion: e.target.value })}
                    placeholder="Contoh: Nama hewan peliharaan pertama?"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Jawaban Rahasia:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.securityAnswer}
                    onChange={e => setFormData({ ...formData, securityAnswer: e.target.value })}
                    placeholder="Ketik jawaban rahasia..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Error or Success notification */}
            {errorMessage && (
              <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-2.5 rounded bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2 font-bold">
                <Check className="w-4 h-4 text-green-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-1 px-3 py-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title="Reset ke pengaturan default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onLockAdminSession();
                onClose();
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title="Kunci sesi admin saat ini agar kembali ke mode siswa"
            >
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>Kunci Sesi Admin Sekarang</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Tutup
            </button>

            <button
              type="submit"
              form="security-form"
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan Keamanan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
