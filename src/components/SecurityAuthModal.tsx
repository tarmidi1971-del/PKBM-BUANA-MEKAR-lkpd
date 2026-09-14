import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AppSecuritySettings } from '../types';

interface SecurityAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  securitySettings: AppSecuritySettings;
  onSuccess: () => void;
  onUpdateSecuritySettings?: (newSettings: AppSecuritySettings) => void;
  targetFeatureName?: string;
}

export const SecurityAuthModal: React.FC<SecurityAuthModalProps> = ({
  isOpen,
  onClose,
  securitySettings,
  onSuccess,
  onUpdateSecuritySettings,
  targetFeatureName = 'Fitur Terproteksi Admin',
}) => {
  const [pinInput, setPinInput] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isRecoveryMode, setIsRecoveryMode] = useState<boolean>(false);
  
  // Recovery form state
  const [securityAnswerInput, setSecurityAnswerInput] = useState<string>('');
  const [newPinInput, setNewPinInput] = useState<string>('');
  const [confirmNewPinInput, setConfirmNewPinInput] = useState<string>('');
  const [recoverySuccess, setRecoverySuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setPinInput('');
      setErrorMessage('');
      setIsRecoveryMode(false);
      setSecurityAnswerInput('');
      setNewPinInput('');
      setConfirmNewPinInput('');
      setRecoverySuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) {
      setErrorMessage('Silakan masukkan PIN Admin.');
      return;
    }

    if (pinInput.trim() === securitySettings.adminPin.trim()) {
      setErrorMessage('');
      onSuccess();
      onClose();
    } else {
      setErrorMessage('PIN Admin salah. Silakan coba lagi atau gunakan menu pemulihan PIN.');
      setPinInput('');
    }
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      securityAnswerInput.trim().toLowerCase() !==
      securitySettings.securityAnswer.trim().toLowerCase()
    ) {
      setErrorMessage('Jawaban pertanyaan keamanan salah.');
      return;
    }

    if (newPinInput.trim().length < 4) {
      setErrorMessage('PIN baru minimal harus 4 digit.');
      return;
    }

    if (newPinInput.trim() !== confirmNewPinInput.trim()) {
      setErrorMessage('Konfirmasi PIN baru tidak sesuai.');
      return;
    }

    // Successfully verified recovery question
    if (onUpdateSecuritySettings) {
      const updated: AppSecuritySettings = {
        ...securitySettings,
        adminPin: newPinInput.trim(),
      };
      onUpdateSecuritySettings(updated);
    }

    setRecoverySuccess(true);
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl border border-slate-300 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b-2 border-slate-900 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm flex items-center gap-1.5">
                <span>Otentikasi Akses Admin</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-mono font-bold">
                  PIN Proteksi
                </span>
              </h3>
              <p className="text-[10px] text-slate-300">
                {targetFeatureName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5 text-xs text-slate-800">
          {!isRecoveryMode ? (
            <form onSubmit={handleVerifyPin} className="space-y-3">
              <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Akses Dibatasi:</span> Masukkan PIN Admin untuk membuka {targetFeatureName}. (PIN Default awal: <code className="font-bold font-mono bg-amber-100 px-1 rounded">123456</code>).
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Masukkan PIN / Sandi Admin:
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    autoFocus
                    maxLength={16}
                    value={pinInput}
                    onChange={e => {
                      setPinInput(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Masukkan PIN..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm tracking-widest font-mono text-center focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="p-2 rounded bg-red-50 border border-red-200 text-red-700 text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRecoveryMode(true);
                    setErrorMessage('');
                  }}
                  className="text-[11px] text-blue-700 hover:text-blue-900 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Lupa PIN Admin?</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Buka Akses</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Recovery / Forgot PIN Mode */
            <form onSubmit={handleRecoverySubmit} className="space-y-3">
              <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200 text-blue-900 text-[11px]">
                <p className="font-bold flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-blue-700" />
                  <span>Pemulihan PIN Admin dengan Pertanyaan Keamanan</span>
                </p>
                <p className="mt-1 text-slate-600">
                  Jawab pertanyaan rahasia keamanan untuk menyetel ulang PIN Admin.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Pertanyaan Keamanan:
                </label>
                <p className="p-2 bg-slate-100 rounded text-[11px] text-slate-900 font-semibold border border-slate-200">
                  {securitySettings.securityQuestion}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Jawaban Anda:
                </label>
                <input
                  type="text"
                  required
                  value={securityAnswerInput}
                  onChange={e => setSecurityAnswerInput(e.target.value)}
                  placeholder="Ketik jawaban keamanan..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    PIN Baru (4-8 digit):
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={8}
                    value={newPinInput}
                    onChange={e => setNewPinInput(e.target.value)}
                    placeholder="PIN Baru..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Konfirmasi PIN:
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={8}
                    value={confirmNewPinInput}
                    onChange={e => setConfirmNewPinInput(e.target.value)}
                    placeholder="Ulangi PIN..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-2 rounded bg-red-50 border border-red-200 text-red-700 text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {recoverySuccess && (
                <div className="p-2 rounded bg-green-50 border border-green-200 text-green-800 text-[11px] flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  <span>PIN berhasil diperbarui dan akses terbuka!</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRecoveryMode(false);
                    setErrorMessage('');
                  }}
                  className="text-[11px] text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Kembali ke Masuk PIN
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset & Buka Akses</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
