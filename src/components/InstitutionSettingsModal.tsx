import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Building2,
  Save,
  RotateCcw,
  Check,
  Award,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  Sparkles,
  FileText,
  Printer,
  Users,
  Search,
  MessageCircle,
  PhoneCall,
  CheckCircle2,
  Plus,
  Trash2,
  Info,
  Power,
  ExternalLink,
  BookOpen,
  Filter,
  CheckSquare,
  AlertTriangle
} from 'lucide-react';
import { InstitutionSettings, SubjectTeacher } from '../types';
import { DEFAULT_INSTITUTION_SETTINGS } from '../data/settingsStorage';
import { ALL_SUBJECTS } from '../data/subjectMeta';
import {
  INITIAL_SUBJECT_TEACHERS,
  POPULAR_SUBJECT_PRESETS,
  PAKET_B_SUBJECTS_PRESET,
  PAKET_C_WAJIB_PRESET,
  PAKET_C_IPA_PRESET,
  PAKET_C_IPS_PRESET,
  VOKASI_PEMBERDAYAAN_PRESET,
  BAHASA_MULOK_PRESET,
  SubjectPresetItem,
  loadSubjectTeachers,
  saveSubjectTeachers,
  resetSubjectTeachers,
  clearAllTeacherNames
} from '../data/teacherDirectory';

interface InstitutionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: InstitutionSettings;
  onSaveSettings: (newSettings: InstitutionSettings) => void;
  onOpenTeacherDirectory?: () => void;
}

export const InstitutionSettingsModal: React.FC<InstitutionSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onOpenTeacherDirectory,
}) => {
  const [formData, setFormData] = useState<InstitutionSettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'teachers' | 'preview'>('profile');
  
  // Teachers Management States
  const [teacherSearch, setTeacherSearch] = useState<string>('');
  const [teacherCategoryFilter, setTeacherCategoryFilter] = useState<'all' | 'wajib' | 'pemberdayaan' | 'keterampilan-vokasi' | 'muatan-lokal' | 'peminatan'>('all');
  const [teacherStatusFilter, setTeacherStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [bulkActionSuccess, setBulkActionSuccess] = useState<string>('');
  const [savedTeacherId, setSavedTeacherId] = useState<string | null>(null);

  // Manual Add Form State
  const [isAddingTeacher, setIsAddingTeacher] = useState<boolean>(false);
  const [activePresetGroup, setActivePresetGroup] = useState<'paket-b' | 'paket-c-wajib' | 'paket-c-ipa' | 'paket-c-ips' | 'vokasi' | 'bahasa-mulok'>('paket-b');
  const [newSubjectName, setNewSubjectName] = useState<string>('');
  const [newSubjectCategory, setNewSubjectCategory] = useState<'wajib' | 'pemberdayaan' | 'keterampilan-vokasi' | 'muatan-lokal' | 'peminatan'>('wajib');
  const [newTeacherName, setNewTeacherName] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newNipOrNiy, setNewNipOrNiy] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');
  const [newIsActive, setNewIsActive] = useState<boolean>(true);

  // Delete Confirmation State
  const [teacherToDelete, setTeacherToDelete] = useState<SubjectTeacher | null>(null);
  
  // Reset Teacher Names Confirmation State
  const [isResetTeacherNamesModalOpen, setIsResetTeacherNamesModalOpen] = useState<boolean>(false);

  // Sync / Configure Teacher Phone Modal
  const [isSyncTeacherPhoneModalOpen, setIsSyncTeacherPhoneModalOpen] = useState<boolean>(false);
  const [selectedTeacherForSync, setSelectedTeacherForSync] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const storedTeachers = loadSubjectTeachers();
      setFormData({
        ...settings,
        subjectTeachers: settings.subjectTeachers && Object.keys(settings.subjectTeachers).length > 0
          ? settings.subjectTeachers
          : storedTeachers
      });
      setSaveSuccess(false);
      setBulkActionSuccess('');
      setIsAddingTeacher(false);
      setTeacherToDelete(null);
      setIsResetTeacherNamesModalOpen(false);
      setIsSyncTeacherPhoneModalOpen(false);
      setSelectedTeacherForSync('');
    }
  }, [isOpen, settings]);

  // Combined teacher records list (from formData.subjectTeachers merged with standard meta)
  const allTeachersList = useMemo(() => {
    const currentTeachers = formData.subjectTeachers || INITIAL_SUBJECT_TEACHERS;
    const result: SubjectTeacher[] = [];
    const processedIds = new Set<string>();

    // 1. First add all teachers defined in currentTeachers
    Object.entries(currentTeachers).forEach(([key, val]) => {
      const t = val as SubjectTeacher;
      const standardMeta = ALL_SUBJECTS.find(s => s.id === key);
      result.push({
        subjectId: key,
        subjectName: t.subjectName || standardMeta?.name || key,
        teacherName: t.teacherName || 'Tutor Pengampu Mapel',
        phone: t.phone || '',
        nipOrNiy: t.nipOrNiy || '-',
        category: t.category || standardMeta?.category || 'wajib',
        isActive: t.isActive !== false, // default true
        notes: t.notes || (standardMeta ? `Tutor ${standardMeta.name}` : ''),
        customSubject: t.customSubject || !standardMeta
      });
      processedIds.add(key);
    });

    // 2. Add any remaining standard subjects that aren't yet in currentTeachers
    ALL_SUBJECTS.forEach(sub => {
      if (!processedIds.has(sub.id)) {
        result.push({
          subjectId: sub.id,
          subjectName: sub.name,
          teacherName: 'Tutor Pengampu Mapel',
          phone: '',
          nipOrNiy: '-',
          category: sub.category,
          isActive: true,
          notes: `Tutor ${sub.name}`,
          customSubject: false
        });
      }
    });

    return result;
  }, [formData.subjectTeachers, formData.phone]);

  // Filtered teachers list based on search, category and active status
  const filteredTeachers = useMemo(() => {
    return allTeachersList.filter((item) => {
      const q = teacherSearch.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.subjectName.toLowerCase().includes(q) ||
        item.teacherName.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        (item.nipOrNiy && item.nipOrNiy.toLowerCase().includes(q));

      if (!matchQuery) return false;

      if (teacherCategoryFilter !== 'all' && item.category !== teacherCategoryFilter) {
        return false;
      }

      if (teacherStatusFilter === 'active' && item.isActive === false) {
        return false;
      }

      if (teacherStatusFilter === 'inactive' && item.isActive !== false) {
        return false;
      }

      return true;
    });
  }, [allTeachersList, teacherSearch, teacherCategoryFilter, teacherStatusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = allTeachersList.length;
    const active = allTeachersList.filter(t => t.isActive !== false).length;
    const inactive = total - active;
    const custom = allTeachersList.filter(t => t.customSubject).length;
    return { total, active, inactive, custom };
  }, [allTeachersList]);

  if (!isOpen) return null;

  const handleChange = (field: keyof InstitutionSettings, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTeacherChange = (subjectId: string, field: keyof SubjectTeacher, value: any) => {
    setFormData(prev => {
      const current = prev.subjectTeachers || INITIAL_SUBJECT_TEACHERS;
      const existing = current[subjectId] || {
        subjectId,
        subjectName: ALL_SUBJECTS.find(s => s.id === subjectId)?.name || subjectId,
        teacherName: 'Tutor Pengampu',
        phone: prev.phone || '',
        isActive: true
      };

      const updated = {
        ...current,
        [subjectId]: {
          ...existing,
          [field]: value,
          subjectId
        }
      };

      return {
        ...prev,
        subjectTeachers: updated
      };
    });
  };

  // Quick save individual teacher
  const handleQuickSaveTeacher = (teacher: SubjectTeacher) => {
    const current = formData.subjectTeachers || INITIAL_SUBJECT_TEACHERS;
    const updated = {
      ...current,
      [teacher.subjectId]: {
        ...teacher
      }
    };
    saveSubjectTeachers(updated);
    setFormData(prev => ({ ...prev, subjectTeachers: updated }));
    setSavedTeacherId(teacher.subjectId);
    setTimeout(() => setSavedTeacherId(null), 2000);
  };

  // Toggle Active/Inactive status for a teacher
  const handleToggleTeacherActive = (subjectId: string, currentStatus: boolean = true) => {
    handleTeacherChange(subjectId, 'isActive', !currentStatus);
    const updatedStatus = !currentStatus;
    setBulkActionSuccess(
      updatedStatus
        ? `Status guru mapel berhasil diaktifkan.`
        : `Status guru mapel disetel ke Non-Aktif.`
    );
    setTimeout(() => setBulkActionSuccess(''), 2500);
  };

  // Set primary phone based on chosen teacher
  const handleSetPrimaryFromTeacher = (phone: string, teacherName: string) => {
    setFormData(prev => ({
      ...prev,
      phone: phone || ''
    }));
    setBulkActionSuccess(`Nomor HP Utama lembaga disesuaikan dengan pilihan guru: ${teacherName} (${phone || 'Kosong'})`);
    setTimeout(() => setBulkActionSuccess(''), 3000);
  };

  // Clear institution primary phone completely
  const handleClearPrimaryPhone = () => {
    setFormData(prev => ({
      ...prev,
      phone: ''
    }));
    setBulkActionSuccess('Nomor HP Utama lembaga berhasil dihapus / dikosongkan!');
    setTimeout(() => setBulkActionSuccess(''), 3000);
  };

  // Select teacher preset for a specific subject
  const handleSelectPresetForTeacher = (subjectId: string, presetSubjectId: string) => {
    const found = allTeachersList.find(t => t.subjectId === presetSubjectId);
    if (found) {
      setFormData(prev => {
        const current = prev.subjectTeachers || INITIAL_SUBJECT_TEACHERS;
        const existing = current[subjectId] || {};
        const updated = {
          ...current,
          [subjectId]: {
            ...existing,
            teacherName: found.teacherName,
            phone: found.phone || '',
            nipOrNiy: found.nipOrNiy || ''
          }
        };
        saveSubjectTeachers(updated);
        return {
          ...prev,
          subjectTeachers: updated
        };
      });
      setBulkActionSuccess(`Berhasil memilih guru ${found.teacherName} (${found.phone || 'tanpa HP'}) untuk mapel ini!`);
      setTimeout(() => setBulkActionSuccess(''), 2500);
    }
  };

  // Apply selected teacher phone to all subjects
  const handleApplySelectedTeacherPhoneToAll = (phone: string, teacherName: string) => {
    setFormData(prev => {
      const current = prev.subjectTeachers || INITIAL_SUBJECT_TEACHERS;
      const updated: Record<string, SubjectTeacher> = {};
      allTeachersList.forEach(item => {
        const existing = current[item.subjectId] || item;
        updated[item.subjectId] = {
          ...existing,
          phone: phone
        };
      });
      saveSubjectTeachers(updated);
      return {
        ...prev,
        subjectTeachers: updated
      };
    });
    setBulkActionSuccess(`Berhasil menerapkan nomor guru ${teacherName} (${phone}) ke seluruh mapel!`);
    setTimeout(() => setBulkActionSuccess(''), 3000);
    setIsSyncTeacherPhoneModalOpen(false);
  };

  // Set specific subject's phone to the primary phone
  const handleSetToPrimaryPhone = (subjectId: string) => {
    const targetPhone = formData.phone || '';
    handleTeacherChange(subjectId, 'phone', targetPhone);
    setBulkActionSuccess(`Nomor HP mapel telah disinkronkan ke HP Utama (${targetPhone || 'Dikosongkan'})`);
    setTimeout(() => setBulkActionSuccess(''), 2500);
  };

  // Bulk apply primary phone to all subject teachers
  const handleApplyPrimaryPhoneToAll = () => {
    const primary = formData.phone || '';
    if (!primary) {
      setIsSyncTeacherPhoneModalOpen(true);
      return;
    }
    setFormData(prev => {
      const current = prev.subjectTeachers || INITIAL_SUBJECT_TEACHERS;
      const updated: Record<string, SubjectTeacher> = {};
      
      allTeachersList.forEach(item => {
        const existing = current[item.subjectId] || item;
        updated[item.subjectId] = {
          ...existing,
          phone: primary
        };
      });

      saveSubjectTeachers(updated);
      return {
        ...prev,
        subjectTeachers: updated
      };
    });
    setBulkActionSuccess(`Berhasil menerapkan nomor HP (${primary}) ke seluruh ${allTeachersList.length} guru mapel!`);
    setTimeout(() => setBulkActionSuccess(''), 3000);
  };

  // Bulk clear phone numbers from all subject teachers
  const handleClearAllTeacherPhones = () => {
    setFormData(prev => {
      const current = prev.subjectTeachers || INITIAL_SUBJECT_TEACHERS;
      const updated: Record<string, SubjectTeacher> = {};
      
      allTeachersList.forEach(item => {
        const existing = current[item.subjectId] || item;
        updated[item.subjectId] = {
          ...existing,
          phone: ''
        };
      });

      saveSubjectTeachers(updated);
      return {
        ...prev,
        subjectTeachers: updated
      };
    });
    setBulkActionSuccess(`Berhasil menghapus nomor telepon dari seluruh guru mapel!`);
    setTimeout(() => setBulkActionSuccess(''), 3000);
  };

  // Add new manual teacher
  const handleAddManualTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim() || !newTeacherName.trim()) {
      return;
    }

    const generatedSlug = newSubjectName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const finalSlug = generatedSlug || `custom-mapel-${Date.now()}`;

    const newTeacherObj: SubjectTeacher = {
      subjectId: finalSlug,
      subjectName: newSubjectName.trim(),
      teacherName: newTeacherName.trim(),
      phone: newPhone.trim(),
      nipOrNiy: newNipOrNiy.trim() || '-',
      category: newSubjectCategory,
      isActive: newIsActive,
      notes: newNotes.trim() || `Tutor ${newSubjectName.trim()}`,
      customSubject: true
    };

    setFormData(prev => {
      const current = prev.subjectTeachers || INITIAL_SUBJECT_TEACHERS;
      const updated = {
        ...current,
        [finalSlug]: newTeacherObj
      };
      saveSubjectTeachers(updated);
      return {
        ...prev,
        subjectTeachers: updated
      };
    });

    // Reset Form
    setNewSubjectName('');
    setNewTeacherName('');
    setNewPhone('');
    setNewNipOrNiy('');
    setNewNotes('');
    setNewIsActive(true);
    setIsAddingTeacher(false);

    setBulkActionSuccess(`Berhasil menambahkan mata pelajaran "${newTeacherObj.subjectName}" & guru pengampu!`);
    setTimeout(() => setBulkActionSuccess(''), 3000);
  };

  // Apply preset to manual add form
  const handleSelectPreset = (preset: SubjectPresetItem) => {
    setNewSubjectName(preset.name);
    setNewSubjectCategory(preset.category);
    setNewIsActive(true);
    if (preset.defaultTeacherName) {
      setNewTeacherName(preset.defaultTeacherName);
    }
    if (preset.defaultNotes) {
      setNewNotes(preset.defaultNotes);
    }
    if (preset.defaultNip) {
      setNewNipOrNiy(preset.defaultNip);
    }
  };

  // Delete Teacher (Confirm)
  const handleConfirmDelete = () => {
    if (!teacherToDelete) return;
    const subjectId = teacherToDelete.subjectId;

    setFormData(prev => {
      const current = { ...(prev.subjectTeachers || INITIAL_SUBJECT_TEACHERS) };
      delete current[subjectId];
      saveSubjectTeachers(current);
      return {
        ...prev,
        subjectTeachers: current
      };
    });

    setBulkActionSuccess(`Mata pelajaran "${teacherToDelete.subjectName}" telah dihapus dari daftar.`);
    setTeacherToDelete(null);
    setTimeout(() => setBulkActionSuccess(''), 3000);
  };

  // Reset / Kosongkan HANYA nama guru pengampu untuk semua mata pelajaran
  const handleClearTeacherNamesOnly = () => {
    setFormData(prev => {
      const current = prev.subjectTeachers || INITIAL_SUBJECT_TEACHERS;
      const updated: Record<string, SubjectTeacher> = {};
      
      allTeachersList.forEach(item => {
        const existing = current[item.subjectId] || item;
        updated[item.subjectId] = {
          ...existing,
          teacherName: '',
          nipOrNiy: ''
        };
      });

      saveSubjectTeachers(updated);
      return {
        ...prev,
        subjectTeachers: updated
      };
    });

    setIsResetTeacherNamesModalOpen(false);
    setBulkActionSuccess('Berhasil menghapus seluruh nama guru pengampu! Nama mata pelajaran, nomor HP, dan profil lembaga tetap aman.');
    setTimeout(() => setBulkActionSuccess(''), 4000);
  };

  // Reset to default 15 subjects
  const handleResetToDefaultTeachers = () => {
    if (window.confirm('Kembalikan daftar guru ke 15 mata pelajaran standar kurikulum PKBM?')) {
      const restored = resetSubjectTeachers();
      setFormData(prev => ({
        ...prev,
        subjectTeachers: restored
      }));
      setBulkActionSuccess('Daftar guru & mata pelajaran telah dipulihkan ke format standar.');
      setTimeout(() => setBulkActionSuccess(''), 3000);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.subjectTeachers) {
      saveSubjectTeachers(formData.subjectTeachers);
    }
    onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    setFormData(DEFAULT_INSTITUTION_SETTINGS);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl border border-slate-300 shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b-2 border-blue-900 flex items-center justify-between bg-blue-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-white text-blue-900 flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              <Building2 className="w-5 h-5 text-blue-900" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2 flex-wrap">
                <span>Pengaturan Profil Lembaga & Guru Mapel</span>
                {formData.phone ? (
                  <span className="text-[10px] bg-blue-950 text-blue-200 px-2 py-0.5 rounded font-mono font-bold border border-blue-800 flex items-center gap-1">
                    <span>HP Utama: {formData.phone}</span>
                    <button
                      type="button"
                      onClick={handleClearPrimaryPhone}
                      className="text-rose-400 hover:text-rose-200 ml-1 cursor-pointer font-sans"
                      title="Hapus / kosongkan No. HP Utama Lembaga"
                    >
                      ×
                    </button>
                  </span>
                ) : (
                  <span className="text-[10px] bg-blue-950/80 text-blue-300 px-2 py-0.5 rounded font-medium border border-blue-800 italic">
                    HP Utama: Tidak Diaktifkan (Mengikuti Guru Terpilih)
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-blue-200">
                Kelola profil PKBM, nomor HP admin, input manual guru mapel, status aktif/non-aktif, simpan dan hapus mapel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-blue-200 hover:text-white hover:bg-blue-800 transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-100 px-3 sm:px-4 pt-2 gap-1 sm:gap-2 text-xs font-bold shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'profile'
                ? 'border-blue-700 text-blue-900 font-bold bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-blue-800" />
            <span>1. Profil & No. HP Utama Lembaga</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('teachers')}
            className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'teachers'
                ? 'border-blue-700 text-blue-900 font-bold bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-700" />
            <span>2. Guru Bidang Mapel & No. HP ({stats.total})</span>
            <span className="ml-1 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
              {stats.active} Aktif
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'preview'
                ? 'border-blue-700 text-blue-900 font-bold bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Printer className="w-3.5 h-3.5 text-indigo-700" />
            <span>3. Pratinjau Kop & Lembar Kerja</span>
          </button>

          {onOpenTeacherDirectory && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenTeacherDirectory();
              }}
              className="ml-auto mb-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-md text-[11px] font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              title="Buka Menu Daftar Guru: Upload Excel & Input Manual"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Menu Upload Excel Guru</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-4 flex-1 text-xs text-slate-800">
          
          {/* ==========================================================
             TAB 1: PROFIL & NOMOR HP UTAMA LEMBAGA
             ========================================================== */}
          {activeTab === 'profile' ? (
            <form id="institution-form" onSubmit={handleSave} className="space-y-4">
              
              {/* Highlight Card: Nomor HP Utama */}
              <div className="bg-blue-50/80 p-3.5 rounded-lg border-2 border-blue-300 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-blue-700" />
                    <span className="font-bold text-xs text-blue-950">
                      Nomor HP / WhatsApp Utama Lembaga & Admin:
                    </span>
                  </div>
                  <span className="text-[10px] bg-blue-700 text-white font-bold px-2 py-0.5 rounded">
                    Default Kontak Seluruh Sistem
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Nomor HP Utama Lembaga (Opsional):
                      </label>
                      {formData.phone && (
                        <button
                          type="button"
                          onClick={() => {
                            handleChange('phone', '');
                            setBulkActionSuccess('Nomor HP utama lembaga telah dihapus/dikosongkan.');
                            setTimeout(() => setBulkActionSuccess(''), 3000);
                          }}
                          className="text-[10px] text-red-600 hover:text-red-800 font-bold underline cursor-pointer"
                          title="Hapus nomor HP utama agar pengiriman LKPD langsung menggunakan nomor guru mapel"
                        >
                          Hapus Nomor HP Utama
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={formData.phone || ''}
                        onChange={e => handleChange('phone', e.target.value)}
                        placeholder="Kosongkan atau ketik nomor HP lembaga..."
                        className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-blue-400 rounded text-xs focus:ring-2 focus:ring-blue-600 font-mono font-bold text-blue-950"
                      />
                    </div>

                    {/* Opsi pilih guru untuk set HP utama */}
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">
                        Atau Sesuaikan HP Utama dengan Guru Terpilih:
                      </label>
                      <select
                        onChange={e => {
                          const teacher = allTeachersList.find(t => t.subjectId === e.target.value);
                          if (teacher && teacher.phone) {
                            handleSetPrimaryFromTeacher(teacher.phone, teacher.teacherName);
                          }
                        }}
                        defaultValue=""
                        className="w-full text-xs p-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-800 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="" disabled>-- Pilih Guru Pengampu untuk Set HP Utama --</option>
                        {allTeachersList.filter(t => t.phone).map(t => (
                          <option key={t.subjectId} value={t.subjectId}>
                            {t.teacherName} ({t.phone}) - {t.subjectName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {formData.phone ? (
                      <p className="text-[10px] text-slate-500 mt-1">
                        Nomor ini digunakan sebagai penerima default pengiriman tugas, jawaban siswa, dan kop surat lembaga.
                      </p>
                    ) : (
                      <div className="mt-1.5 p-2 bg-amber-50 border border-amber-300 rounded-lg text-[10px] text-amber-900 font-medium leading-relaxed flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Nomor HP Utama Dihapus / Kosong:</strong> Pengiriman LKPD dan lembar jawaban siswa akan secara otomatis tersinkronisasi langsung ke nomor WhatsApp masing-masing guru mapel yang aktif.
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Aksi Cepat Sinkronisasi ke Guru Mapel:
                    </label>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setIsSyncTeacherPhoneModalOpen(true)}
                        className="w-full py-1.5 px-3 bg-blue-800 hover:bg-blue-900 text-white rounded font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Sesuaikan No. HP dengan Pilihan Guru</span>
                      </button>

                      {formData.phone ? (
                        <button
                          type="button"
                          onClick={handleClearPrimaryPhone}
                          className="w-full py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus / Kosongkan HP Utama Lembaga</span>
                        </button>
                      ) : null}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1.5">
                      Buka tab <strong>"2. Guru Bidang Mapel"</strong> untuk menginput, mengedit, atau menghapus nomor spesifik tiap guru.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 1: Identitas Resmi */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5 text-blue-900">
                  <Award className="w-4 h-4 text-blue-700" />
                  <span>1. Identitas Resmi Lembaga PKBM / Sekolah</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nama Resmi Lembaga / PKBM: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => handleChange('name', e.target.value)}
                      placeholder="Contoh: PKBM Buana Mekar"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Inisial Logo / Singkatan: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={formData.shortName}
                      onChange={e => handleChange('shortName', e.target.value.toUpperCase())}
                      placeholder="Contoh: BM"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 font-bold uppercase text-center"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      NPSN (Nomor Pokok Sekolah Nasional):
                    </label>
                    <input
                      type="text"
                      value={formData.npsn}
                      onChange={e => handleChange('npsn', e.target.value)}
                      placeholder="Contoh: P9908123"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Slogan / Tagline Lembaga:
                    </label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={e => handleChange('tagline', e.target.value)}
                      placeholder="Pusat Kegiatan Belajar Masyarakat & Homeschooling Terpadu"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Alamat & Kontak */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5 text-blue-900">
                  <MapPin className="w-4 h-4 text-blue-700" />
                  <span>2. Alamat & Kontak Korespondensi</span>
                </h4>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Alamat Lengkap Lembaga:
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => handleChange('address', e.target.value)}
                    placeholder="Contoh: Jl. Raya Pendidikan No. 45, Bandung, Jawa Barat"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Kota / Kabupaten Titi Mangsa:
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={e => handleChange('city', e.target.value)}
                      placeholder="Contoh: Bandung"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Email Lembaga:
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => handleChange('email', e.target.value)}
                      placeholder="info@pkbm.sch.id"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Pimpinan & Tahun Akademik */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5 text-blue-900">
                  <User className="w-4 h-4 text-blue-700" />
                  <span>3. Penanggung Jawab & Tahun Akademik</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nama Kepala Lembaga / Ketua PKBM:
                    </label>
                    <input
                      type="text"
                      value={formData.headName}
                      onChange={e => handleChange('headName', e.target.value)}
                      placeholder="Drs. H. Yohanes Tarmidi, M.Pd."
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      NIP / NIY Kepala Lembaga:
                    </label>
                    <input
                      type="text"
                      value={formData.headNipOrNiy}
                      onChange={e => handleChange('headNipOrNiy', e.target.value)}
                      placeholder="Contoh: 19750819 200501 1 004"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nama Default Tim Tutor / Pengampu:
                    </label>
                    <input
                      type="text"
                      value={formData.defaultTutor}
                      onChange={e => handleChange('defaultTutor', e.target.value)}
                      placeholder="Tim Tutor PKBM"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Tahun Ajaran / Akademik:
                    </label>
                    <input
                      type="text"
                      value={formData.academicYear}
                      onChange={e => handleChange('academicYear', e.target.value)}
                      placeholder="2026/2027"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 font-bold"
                    />
                  </div>
                </div>
              </div>
            </form>
          ) : activeTab === 'teachers' ? (
            
            /* ==========================================================
               TAB 2: DAFTAR GURU BIDANG MAPEL, INPUT MANUAL, SIMPAN & HAPUS
               ========================================================== */
            <div className="space-y-3">
              
              {/* Notification Banner */}
              {bulkActionSuccess && (
                <div className="bg-emerald-100 text-emerald-900 border border-emerald-300 p-2.5 rounded-lg flex items-center gap-2 animate-in fade-in duration-150">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="font-bold text-xs">{bulkActionSuccess}</span>
                </div>
              )}

              {/* Control Header Card */}
              <div className="bg-blue-900 text-white p-3.5 rounded-xl border border-blue-700 space-y-3 shadow-sm">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 border-b border-blue-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-800 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-blue-200" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm flex items-center gap-2">
                        <span>Manajemen Guru Bidang Studi & Nomor WhatsApp</span>
                      </h4>
                      <p className="text-[11px] text-blue-200">
                        Total {stats.total} mapel ({stats.active} aktif, {stats.inactive} non-aktif, {stats.custom} kustom/peminatan).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setIsAddingTeacher(!isAddingTeacher)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs ${
                        isAddingTeacher
                          ? 'bg-amber-400 text-amber-950 hover:bg-amber-300'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {isAddingTeacher ? (
                        <>
                          <X className="w-3.5 h-3.5" />
                          <span>Tutup Form Input</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Input Manual Guru / Mapel Baru</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsSyncTeacherPhoneModalOpen(true)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-800 hover:bg-blue-700 text-blue-100 hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-blue-600 shadow-xs"
                      title="Sesuaikan nomor HP lembaga atau guru mapel berdasarkan pilihan guru"
                    >
                      <Phone className="w-3 h-3 text-yellow-300" />
                      <span className="hidden sm:inline">Sesuaikan HP Sesuai Pilihan Guru</span>
                      <span className="sm:hidden">Pilihan Guru</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClearAllTeacherPhones}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-slate-600"
                      title="Kosongkan nomor telepon pada seluruh mata pelajaran"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      <span>Hapus Nomor di Semua Mapel</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsResetTeacherNamesModalOpen(true)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-700 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer border border-rose-500 shadow-xs"
                      title="Menu Reset: Hapus / kosongkan nama guru saja untuk semua mata pelajaran"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-white" />
                      <span>Reset Nama Guru Saja</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetToDefaultTeachers}
                      className="p-1.5 bg-blue-950 hover:bg-blue-800 text-blue-300 hover:text-white rounded-lg transition-colors cursor-pointer border border-blue-800"
                      title="Pulihkan seluruh daftar ke 15 mapel standar PKBM"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Search, Category Filter, and Status Filter */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2">
                  
                  {/* Search bar */}
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-300" />
                    <input
                      type="text"
                      placeholder="Cari mata pelajaran, nama guru, NIP, atau no HP..."
                      value={teacherSearch}
                      onChange={e => setTeacherSearch(e.target.value)}
                      className="w-full pl-8 pr-7 py-1.5 bg-blue-950 border border-blue-700 rounded-lg text-xs text-white placeholder-blue-300/70 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                    {teacherSearch && (
                      <button
                        type="button"
                        onClick={() => setTeacherSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Status filter: All, Active, Inactive */}
                  <div className="flex items-center gap-1 bg-blue-950 p-1 rounded-lg border border-blue-800 text-[10px] shrink-0">
                    <span className="text-blue-300 px-1 font-semibold">Status:</span>
                    <button
                      type="button"
                      onClick={() => setTeacherStatusFilter('all')}
                      className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                        teacherStatusFilter === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'text-blue-300 hover:text-white'
                      }`}
                    >
                      Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeacherStatusFilter('active')}
                      className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                        teacherStatusFilter === 'active'
                          ? 'bg-emerald-600 text-white'
                          : 'text-blue-300 hover:text-white'
                      }`}
                    >
                      Aktif ({stats.active})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeacherStatusFilter('inactive')}
                      className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                        teacherStatusFilter === 'inactive'
                          ? 'bg-rose-600 text-white'
                          : 'text-blue-300 hover:text-white'
                      }`}
                    >
                      Non-Aktif ({stats.inactive})
                    </button>
                  </div>

                  {/* Category Filter */}
                  <div className="flex items-center gap-1 bg-blue-950 p-1 rounded-lg border border-blue-800 text-[10px] overflow-x-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setTeacherCategoryFilter('all')}
                      className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer shrink-0 ${
                        teacherCategoryFilter === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'text-blue-300 hover:text-white'
                      }`}
                    >
                      Semua Kategori
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeacherCategoryFilter('wajib')}
                      className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer shrink-0 ${
                        teacherCategoryFilter === 'wajib'
                          ? 'bg-blue-600 text-white'
                          : 'text-blue-300 hover:text-white'
                      }`}
                    >
                      Wajib
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeacherCategoryFilter('keterampilan-vokasi')}
                      className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer shrink-0 ${
                        teacherCategoryFilter === 'keterampilan-vokasi'
                          ? 'bg-blue-600 text-white'
                          : 'text-blue-300 hover:text-white'
                      }`}
                    >
                      Vokasi
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeacherCategoryFilter('pemberdayaan')}
                      className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer shrink-0 ${
                        teacherCategoryFilter === 'pemberdayaan'
                          ? 'bg-blue-600 text-white'
                          : 'text-blue-300 hover:text-white'
                      }`}
                    >
                      Pemberdayaan
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeacherCategoryFilter('peminatan')}
                      className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer shrink-0 ${
                        teacherCategoryFilter === 'peminatan'
                          ? 'bg-blue-600 text-white'
                          : 'text-blue-300 hover:text-white'
                      }`}
                    >
                      Peminatan/Pilihan
                    </button>
                  </div>
                </div>
              </div>

              {/* =======================================================
                  DRAWER FORM: INPUT MANUAL GURU / MAPEL BARU
                  ======================================================= */}
              {isAddingTeacher && (
                <form
                  onSubmit={handleAddManualTeacher}
                  className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-3.5 sm:p-4 space-y-3.5 shadow-md animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        <Plus className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-emerald-950">
                          Form Input Manual Guru Bidang Mata Pelajaran Baru
                        </h4>
                        <p className="text-[10px] text-emerald-800">
                          Tambahkan mata pelajaran peminatan, muatan lokal, atau tutor pengampu baru
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddingTeacher(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Auto-fill Preset Dropdown & Fast Tabbed Presets */}
                  <div className="space-y-2.5 bg-emerald-100/60 p-3 rounded-lg border border-emerald-300">
                    {/* DROPDOWN SELECTOR */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Pilihan Cepat Preset Mata Pelajaran Otomatis (Menu Dropdown):</span>
                        </label>
                        <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded font-bold">
                          Auto-Fill Nama & Kategori
                        </span>
                      </div>
                      <select
                        onChange={e => {
                          const val = e.target.value;
                          if (!val) return;
                          const preset = POPULAR_SUBJECT_PRESETS.find(p => p.id === val);
                          if (preset) {
                            handleSelectPreset(preset);
                          }
                        }}
                        defaultValue=""
                        className="w-full px-3 py-2 bg-white border-2 border-emerald-500 rounded-lg text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-700 focus:outline-none cursor-pointer shadow-xs"
                      >
                        <option value="" disabled>-- ⚡ Pilih Mata Pelajaran (Kategori & Tutor Terisi Otomatis) --</option>
                        <optgroup label="📘 Paket B — Setara SMP (Kelas 7–9)">
                          {PAKET_B_SUBJECTS_PRESET.map(p => (
                            <option key={`b-${p.id}`} value={p.id}>
                              📘 {p.name} [{p.category.toUpperCase()}]
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="📕 Paket C — Setara SMA (Kelas 10–12 Wajib Umum)">
                          {PAKET_C_WAJIB_PRESET.map(p => (
                            <option key={`cw-${p.id}`} value={p.id}>
                              📕 {p.name} [{p.category.toUpperCase()}]
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="🔬 Paket C — Pilihan IPA & Sains">
                          {PAKET_C_IPA_PRESET.map(p => (
                            <option key={`cipa-${p.id}`} value={p.id}>
                              🔬 {p.name} [PEMINATAN IPA]
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="📊 Paket C — Pilihan IPS & Sosial Humaniora">
                          {PAKET_C_IPS_PRESET.map(p => (
                            <option key={`cips-${p.id}`} value={p.id}>
                              📊 {p.name} [PEMINATAN IPS]
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="🛠️ Keterampilan / Program Keahlian (Vokasi)">
                          {VOKASI_PEMBERDAYAAN_PRESET.filter(p => p.category === 'keterampilan-vokasi').map(p => (
                            <option key={`vok-${p.id}`} value={p.id}>
                              🛠️ {p.name} [VOKASI]
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="🌱 Kelompok Pemberdayaan Komunitas">
                          {VOKASI_PEMBERDAYAAN_PRESET.filter(p => p.category === 'pemberdayaan').map(p => (
                            <option key={`pem-${p.id}`} value={p.id}>
                              🌱 {p.name} [PEMBERDAYAAN]
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="🌐 Bahasa Pilihan & Muatan Lokal">
                          {BAHASA_MULOK_PRESET.map(p => (
                            <option key={`mul-${p.id}`} value={p.id}>
                              🌐 {p.name} [{p.category.toUpperCase()}]
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    {/* TABBED QUICK PILL BUTTONS */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-emerald-900">
                          Atau Klik Preset Cepat Sesuai Kelompok Kurikulum:
                        </span>
                        <div className="flex items-center gap-1 overflow-x-auto text-[9px]">
                          <button
                            type="button"
                            onClick={() => setActivePresetGroup('paket-b')}
                            className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                              activePresetGroup === 'paket-b'
                                ? 'bg-blue-800 text-white'
                                : 'bg-white text-slate-700 hover:bg-emerald-200'
                            }`}
                          >
                            📘 Paket B (SMP)
                          </button>
                          <button
                            type="button"
                            onClick={() => setActivePresetGroup('paket-c-wajib')}
                            className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                              activePresetGroup === 'paket-c-wajib'
                                ? 'bg-blue-800 text-white'
                                : 'bg-white text-slate-700 hover:bg-emerald-200'
                            }`}
                          >
                            📕 Paket C (SMA Wajib)
                          </button>
                          <button
                            type="button"
                            onClick={() => setActivePresetGroup('paket-c-ipa')}
                            className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                              activePresetGroup === 'paket-c-ipa'
                                ? 'bg-blue-800 text-white'
                                : 'bg-white text-slate-700 hover:bg-emerald-200'
                            }`}
                          >
                            🔬 Pilihan IPA
                          </button>
                          <button
                            type="button"
                            onClick={() => setActivePresetGroup('paket-c-ips')}
                            className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                              activePresetGroup === 'paket-c-ips'
                                ? 'bg-blue-800 text-white'
                                : 'bg-white text-slate-700 hover:bg-emerald-200'
                            }`}
                          >
                            📊 Pilihan IPS
                          </button>
                          <button
                            type="button"
                            onClick={() => setActivePresetGroup('vokasi')}
                            className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                              activePresetGroup === 'vokasi'
                                ? 'bg-blue-800 text-white'
                                : 'bg-white text-slate-700 hover:bg-emerald-200'
                            }`}
                          >
                            🛠️ Vokasi
                          </button>
                          <button
                            type="button"
                            onClick={() => setActivePresetGroup('bahasa-mulok')}
                            className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                              activePresetGroup === 'bahasa-mulok'
                                ? 'bg-blue-800 text-white'
                                : 'bg-white text-slate-700 hover:bg-emerald-200'
                            }`}
                          >
                            🌐 Mulok/Bahasa
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white/70 rounded border border-emerald-200">
                        {(activePresetGroup === 'paket-b'
                          ? PAKET_B_SUBJECTS_PRESET
                          : activePresetGroup === 'paket-c-wajib'
                          ? PAKET_C_WAJIB_PRESET
                          : activePresetGroup === 'paket-c-ipa'
                          ? PAKET_C_IPA_PRESET
                          : activePresetGroup === 'paket-c-ips'
                          ? PAKET_C_IPS_PRESET
                          : activePresetGroup === 'vokasi'
                          ? VOKASI_PEMBERDAYAAN_PRESET
                          : BAHASA_MULOK_PRESET
                        ).map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleSelectPreset(preset)}
                            className="px-2 py-1 bg-white hover:bg-emerald-100 hover:border-emerald-500 border border-emerald-300 rounded text-[10px] text-emerald-950 font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                          >
                            <span>+ {preset.name}</span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold uppercase">
                              {preset.category === 'keterampilan-vokasi' ? 'Vokasi' : preset.category}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        Nama Mata Pelajaran: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newSubjectName}
                        onChange={e => setNewSubjectName(e.target.value)}
                        placeholder="Contoh: Fisika, Bahasa Sunda, Robotika"
                        className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded text-xs focus:ring-2 focus:ring-emerald-600 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        Kategori Mata Pelajaran (Otomatis / Ubah):
                      </label>
                      <select
                        value={newSubjectCategory}
                        onChange={e => setNewSubjectCategory(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded text-xs focus:ring-2 focus:ring-emerald-600 font-bold text-emerald-950"
                      >
                        <option value="wajib">Mata Pelajaran Wajib (Umum)</option>
                        <option value="peminatan">Mata Pelajaran Peminatan / Pilihan (IPA/IPS/Bahasa)</option>
                        <option value="keterampilan-vokasi">Keterampilan Vokasi / Kejuruan</option>
                        <option value="pemberdayaan">Pemberdayaan Komunitas</option>
                        <option value="muatan-lokal">Muatan Lokal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        Nama Guru / Tutor Pengampu: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newTeacherName}
                        onChange={e => setNewTeacherName(e.target.value)}
                        placeholder="Contoh: Dra. Siti Rahayu, M.Si."
                        className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded text-xs focus:ring-2 focus:ring-emerald-600 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span>Nomor WhatsApp Guru:</span>
                        {formData.phone ? (
                          <button
                            type="button"
                            onClick={() => setNewPhone(formData.phone)}
                            className="text-[9px] text-emerald-800 underline font-semibold cursor-pointer"
                          >
                            Gunakan HP Utama
                          </button>
                        ) : null}
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={newPhone}
                          onChange={e => setNewPhone(e.target.value)}
                          placeholder={formData.phone || 'Kosongkan atau ketik nomor HP...'}
                          className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-emerald-300 rounded text-xs focus:ring-2 focus:ring-emerald-600 font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        NIP / NIY / NUPTK:
                      </label>
                      <input
                        type="text"
                        value={newNipOrNiy}
                        onChange={e => setNewNipOrNiy(e.target.value)}
                        placeholder="Contoh: 19850110 201102 1 005"
                        className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded text-xs focus:ring-2 focus:ring-emerald-600 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        Catatan Tambahan / Tugas:
                      </label>
                      <input
                        type="text"
                        value={newNotes}
                        onChange={e => setNewNotes(e.target.value)}
                        placeholder="Contoh: Tutor Pengampu Peminatan IPA"
                        className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded text-xs focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-emerald-200">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-950">
                      <input
                        type="checkbox"
                        checked={newIsActive}
                        onChange={e => setNewIsActive(e.target.checked)}
                        className="rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span>Setel sebagai Guru Mapel Aktif</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingTeacher(false)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Simpan Guru Mapel Ini</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* =======================================================
                  LIST KARTU GURU MAPEL (CRUD + TOGGLE AKTIF + HAPUS MENU)
                  ======================================================= */}
              {filteredTeachers.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center space-y-2">
                  <Users className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="font-bold text-slate-700 text-xs">
                    Tidak ada mata pelajaran atau guru yang cocok dengan filter / pencarian.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Coba ganti kata kunci pencarian atau klik tombol "Input Manual Guru / Mapel Baru" di atas.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredTeachers.map((teacher) => {
                    const isUsingPrimaryPhone =
                      Boolean(formData.phone && teacher.phone && teacher.phone.replace(/\D/g, '') === formData.phone.replace(/\D/g, ''));
                    const isRecentlySaved = savedTeacherId === teacher.subjectId;
                    const isActive = teacher.isActive !== false;

                    return (
                      <div
                        key={teacher.subjectId}
                        className={`p-3 rounded-xl border transition-all ${
                          !isActive
                            ? 'bg-slate-100/80 border-slate-300 opacity-75 grayscale-30'
                            : isUsingPrimaryPhone
                            ? 'bg-slate-50/90 border-slate-200 hover:border-slate-300'
                            : 'bg-blue-50/60 border-blue-200 ring-1 ring-blue-200'
                        }`}
                      >
                        {/* Header Bar per Item */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2 mb-2.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-slate-900">
                              {teacher.subjectName}
                            </span>
                            
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                teacher.category === 'wajib'
                                  ? 'bg-blue-100 text-blue-800'
                                  : teacher.category === 'pemberdayaan'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : teacher.category === 'keterampilan-vokasi'
                                  ? 'bg-purple-100 text-purple-800'
                                  : teacher.category === 'muatan-lokal'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}
                            >
                              {teacher.category || 'mapel'}
                            </span>

                            {teacher.customSubject && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                                Kustom / Tambahan
                              </span>
                            )}

                            {/* Active Status Badge (Clickable Toggle) */}
                            <button
                              type="button"
                              onClick={() => handleToggleTeacherActive(teacher.subjectId, isActive)}
                              className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                                  : 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300'
                              }`}
                              title={isActive ? 'Klik untuk non-aktifkan guru mapel ini' : 'Klik untuk mengaktifkan guru mapel ini'}
                            >
                              <Power className="w-3 h-3" />
                              <span>{isActive ? 'Guru Mapel Aktif' : 'Non-Aktif'}</span>
                            </button>
                          </div>

                          {/* Quick Actions (HP Status, Set Jadi HP Utama, Quick Save, Delete) */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            
                            {/* Phone status badge */}
                            {teacher.phone ? (
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                                WA: {teacher.phone}
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-600 italic">
                                Tanpa No. WA
                              </span>
                            )}

                            {/* Set Sebagai HP Utama Lembaga */}
                            {teacher.phone && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryFromTeacher(teacher.phone, teacher.teacherName)}
                                className="text-[9.5px] text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 font-semibold cursor-pointer transition-colors"
                                title="Jadikan nomor HP guru ini sebagai HP Utama Lembaga"
                              >
                                Set Jadi HP Utama
                              </button>
                            )}

                            {/* Chat WhatsApp Test Button */}
                            {teacher.phone && (
                              <a
                                href={`https://wa.me/62${teacher.phone.replace(/\D/g, '').replace(/^0/, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded text-emerald-700 hover:bg-emerald-100 transition-colors"
                                title="Buka percakapan WhatsApp dengan guru ini"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            )}

                            {/* Quick Save button */}
                            <button
                              type="button"
                              onClick={() => handleQuickSaveTeacher(teacher)}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                isRecentlySaved
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white hover:bg-blue-50 text-slate-700 border border-slate-300'
                              }`}
                              title="Simpan perubahan untuk guru mapel ini"
                            >
                              {isRecentlySaved ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Tersimpan!</span>
                                </>
                              ) : (
                                <>
                                  <Save className="w-3 h-3 text-blue-700" />
                                  <span>Simpan</span>
                                </>
                              )}
                            </button>

                            {/* Delete Menu Button */}
                            <button
                              type="button"
                              onClick={() => setTeacherToDelete(teacher)}
                              className="p-1 rounded text-rose-600 hover:bg-rose-100 hover:text-rose-800 transition-colors cursor-pointer"
                              title="Hapus mata pelajaran / guru ini dari daftar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Preset Guru Dropdown Selector */}
                        <div className="mb-2 pb-2 border-b border-dashed border-slate-200 flex items-center gap-2 flex-wrap text-xs">
                          <span className="text-[10px] font-bold text-slate-600">Pilih Guru Pengampu:</span>
                          <select
                            onChange={e => handleSelectPresetForTeacher(teacher.subjectId, e.target.value)}
                            defaultValue=""
                            className="flex-1 max-w-sm px-2 py-1 bg-white border border-slate-300 rounded text-xs font-medium text-slate-800 focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="" disabled>-- Pilih dari Daftar Guru (Nama & No. HP Otomatis) --</option>
                            {allTeachersList.map(item => (
                              <option key={item.subjectId} value={item.subjectId}>
                                {item.teacherName} {item.phone ? `(${item.phone})` : '(Tanpa HP)'} - {item.subjectName}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Form Inputs Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          
                          {/* Nama Guru */}
                          <div>
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="block text-[10px] font-bold text-slate-600">
                                Nama Guru / Tutor Pengampu:
                              </label>
                              {teacher.teacherName && (
                                <button
                                  type="button"
                                  onClick={() => handleTeacherChange(teacher.subjectId, 'teacherName', '')}
                                  className="text-[9px] text-rose-600 hover:text-rose-800 hover:underline font-semibold cursor-pointer flex items-center gap-0.5"
                                  title="Hapus / kosongkan nama guru mapel ini saja"
                                >
                                  <X className="w-2.5 h-2.5" />
                                  <span>Hapus Nama</span>
                                </button>
                              )}
                            </div>
                            <input
                              type="text"
                              value={teacher.teacherName}
                              onChange={e => handleTeacherChange(teacher.subjectId, 'teacherName', e.target.value)}
                              placeholder="Ketik nama guru pengampu..."
                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 font-medium"
                            />
                          </div>

                          {/* Nomor HP WhatsApp */}
                          <div>
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="block text-[10px] font-bold text-slate-600">
                                Nomor HP WhatsApp Guru:
                              </label>
                              {teacher.phone && (
                                <button
                                  type="button"
                                  onClick={() => handleTeacherChange(teacher.subjectId, 'phone', '')}
                                  className="text-[9px] text-rose-600 hover:text-rose-800 hover:underline font-semibold cursor-pointer"
                                  title="Hapus nomor HP guru mapel ini"
                                >
                                  Hapus No HP
                                </button>
                              )}
                            </div>
                            <div className="relative">
                              <Phone className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="text"
                                value={teacher.phone}
                                onChange={e => handleTeacherChange(teacher.subjectId, 'phone', e.target.value)}
                                placeholder="Kosongkan atau ketik nomor HP..."
                                className="w-full pl-7 pr-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold focus:ring-1 focus:ring-blue-600 text-slate-900"
                              />
                            </div>
                          </div>

                          {/* NIP / NIY / Catatan */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                              NIP / NIY / Catatan Tambahan:
                            </label>
                            <input
                              type="text"
                              value={teacher.nipOrNiy || ''}
                              onChange={e => handleTeacherChange(teacher.subjectId, 'nipOrNiy', e.target.value)}
                              placeholder="Contoh: 19850110 201102 1 005"
                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-600 font-mono text-slate-700"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            
            /* ==========================================================
               TAB 3: LIVE KOP SURAT & COVER PREVIEW
               ========================================================== */
            <div className="space-y-4">
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-900 text-xs">
                <span className="font-bold">Pratinjau Kop Dokumen Otomatis:</span> Seluruh dokumen LKPD, lembar pengerjaan, berkas PDF siap cetak, dan pesan WhatsApp akan otomatis menggunakan identitas resmi di bawah ini.
              </div>

              {/* Kop Surat LKPD Preview */}
              <div className="bg-white p-6 rounded-lg border-2 border-slate-400 shadow-xs font-serif text-slate-900 space-y-4">
                <div className="border-b-2 border-black pb-3 text-center space-y-1">
                  <p className="text-xs font-sans font-extrabold tracking-widest text-slate-800 uppercase">
                    PUSAT KEGIATAN BELAJAR MASYARAKAT (PKBM) {formData.name.toUpperCase()}
                  </p>
                  <p className="text-[10px] font-sans text-slate-600">
                    NPSN: {formData.npsn || '-'} • {formData.address}
                  </p>
                  <h3 className="text-base font-sans font-black uppercase text-slate-950 pt-1">
                    LEMBAR KERJA PESERTA DIDIK (LKPD)
                  </h3>
                  <p className="text-[10px] font-sans text-slate-700">
                    Kurikulum Merdeka Pendidikan Kesetaraan • Tahun Ajaran {formData.academicYear}
                  </p>
                </div>

                <div className="grid grid-cols-2 text-[11px] font-sans pt-6 border-t border-slate-300">
                  <div>
                    <p className="text-slate-600">Tutor Pengampu Lembaga:</p>
                    <p className="font-bold text-slate-900">{formData.defaultTutor}</p>
                    <p className="text-[10px] text-slate-500 mt-1">WA Utama: {formData.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-600">{formData.city}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="text-slate-600">Kepala {formData.name},</p>
                    <p className="mt-8 font-bold underline">{formData.headName}</p>
                    <p className="text-[10px] text-slate-500">NIP/NIY: {formData.headNipOrNiy || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsResetTeacherNamesModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title="Menu Reset: Hapus / kosongkan nama guru saja untuk seluruh mata pelajaran"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>Reset Nama Guru Saja</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title="Reset profil umum lembaga ke bawaan sistem"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Profil Lembaga</span>
            </button>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Tutup
            </button>

            <button
              type="submit"
              form={activeTab === 'profile' ? 'institution-form' : undefined}
              onClick={activeTab !== 'profile' ? handleSave : undefined}
              className="flex items-center gap-2 px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Tersimpan Sukses!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-white" />
                  <span>Simpan Semua Pengaturan & Guru</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ==========================================================
            RESET NAMA GURU SAJA CONFIRMATION MODAL
            ========================================================== */}
        {isResetTeacherNamesModalOpen && (
          <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-slate-300 shadow-2xl max-w-md w-full p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2.5 text-rose-600">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Reset & Kosongkan Nama Guru Saja?
                  </h4>
                  <p className="text-[11px] text-rose-600 font-semibold">
                    Hanya menghapus nama guru & NIP pengampu
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda ingin menghapus/mengosongkan <strong>seluruh nama guru pengampu</strong> pada semua mata pelajaran?
              </p>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">Yang akan dilakukan:</p>
                <p>• Kolom <em>Nama Guru</em> dan <em>NIP</em> di semua mapel akan dikosongkan agar Anda dapat mengisi nama guru asli lembaga Anda.</p>
                <p className="text-emerald-700 font-semibold">• ✅ <strong>Aman:</strong> Nama mata pelajaran, kategori, nomor HP/WA, dan profil lembaga (nama PKBM, NPSN, alamat) tetap utuh tersimpan.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsResetTeacherNamesModalOpen(false)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleClearTeacherNamesOnly}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ya, Hapus Nama Guru Saja</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================================
            DELETE CONFIRMATION DIALOG (HAPUS MENU GURU MAPEL)
            ========================================================== */}
        {teacherToDelete && (
          <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-slate-300 shadow-2xl max-w-md w-full p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2.5 text-rose-600">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">
                  Hapus Mata Pelajaran / Guru?
                </h4>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus <strong>"{teacherToDelete.subjectName}"</strong> ({teacherToDelete.teacherName}) dari daftar mata pelajaran lembaga?
              </p>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                <p>• Mapel ini tidak akan muncul lagi di daftar guru lembaga.</p>
                <p>• Anda dapat menambahkannya kembali kapan saja atau memulihkan standar.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setTeacherToDelete(null)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================================
            SYNC / CONFIGURE TEACHER PHONE MODAL DIALOG
            ========================================================== */}
        {isSyncTeacherPhoneModalOpen && (
          <div className="fixed inset-0 z-60 bg-slate-950/65 backdrop-blur-2xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-slate-300 shadow-2xl max-w-lg w-full p-4 sm:p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm sm:text-base">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-800">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4>Sesuaikan Nomor HP Lembaga & Guru</h4>
                    <p className="text-[10.5px] font-normal text-slate-500">
                      Pilih guru pengampu untuk nomor HP utama atau kelola nomor seluruh mapel
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSyncTeacherPhoneModalOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Saat Ini */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Nomor HP Utama Lembaga Saat Ini:</span>
                  <span className="font-mono font-bold text-blue-950">
                    {formData.phone || '(Tidak diaktifkan / Kosong)'}
                  </span>
                </div>
                {formData.phone && (
                  <p className="text-[10px] text-slate-500">
                    Jika tidak ingin nomor utama lembaga muncul otomatis di LKPD, Anda dapat menghapusnya di bawah.
                  </p>
                )}
              </div>

              {/* Section 1: Pilih Guru Pengampu untuk dijadikan HP Utama */}
              <div className="space-y-2 border-t border-slate-200 pt-3">
                <label className="block text-xs font-bold text-slate-800">
                  1. Pilih Guru Pengampu untuk Dijadikan HP Utama Lembaga:
                </label>
                <select
                  value={selectedTeacherForSync}
                  onChange={e => setSelectedTeacherForSync(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Pilih Guru Pengampu dari Daftar --</option>
                  {allTeachersList.map(t => (
                    <option key={t.subjectId} value={t.subjectId}>
                      {t.teacherName} {t.phone ? `(${t.phone})` : '(Tanpa Nomor HP)'} - {t.subjectName}
                    </option>
                  ))}
                </select>

                {selectedTeacherForSync && (() => {
                  const teacher = allTeachersList.find(t => t.subjectId === selectedTeacherForSync);
                  if (!teacher) return null;
                  return (
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <div>
                          <span className="font-bold text-blue-950">{teacher.teacherName}</span>
                          <span className="text-slate-600 block text-[10.5px]">Mapel: {teacher.subjectName}</span>
                        </div>
                        <span className="font-mono font-bold text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                          {teacher.phone || 'Belum ada nomor HP'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {teacher.phone ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                handleSetPrimaryFromTeacher(teacher.phone, teacher.teacherName);
                                setIsSyncTeacherPhoneModalOpen(false);
                              }}
                              className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                            >
                              ✓ Jadikan HP Utama Lembaga
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApplySelectedTeacherPhoneToAll(teacher.phone, teacher.teacherName)}
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Terapkan ke Semua Mapel
                            </button>
                          </>
                        ) : (
                          <p className="text-[10px] text-amber-700 italic">
                            Guru ini belum memiliki nomor telepon. Anda dapat menginputkannya di formulir guru mapel.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Section 2: Tombol Cepat Pengelolaan Nomor */}
              <div className="space-y-2 border-t border-slate-200 pt-3">
                <label className="block text-xs font-bold text-slate-800">
                  2. Opsi Pengelolaan & Penghapusan Nomor HP:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {formData.phone ? (
                    <button
                      type="button"
                      onClick={() => {
                        handleClearPrimaryPhone();
                        setIsSyncTeacherPhoneModalOpen(false);
                      }}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Hapus HP Utama Lembaga</span>
                    </button>
                  ) : (
                    <div className="p-2 bg-slate-100 text-slate-500 rounded-lg text-xs text-center font-medium">
                      HP Utama Sudah Bersih / Kosong
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      handleClearAllTeacherPhones();
                      setIsSyncTeacherPhoneModalOpen(false);
                    }}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span>Hapus Nomor di Semua Mapel</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSyncTeacherPhoneModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
