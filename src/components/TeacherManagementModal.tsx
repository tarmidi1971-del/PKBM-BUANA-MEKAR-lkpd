import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  X,
  Users,
  Search,
  Plus,
  Trash2,
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  Phone,
  PhoneCall,
  Edit3,
  Save,
  Power,
  Info,
  AlertCircle,
  ExternalLink,
  Filter,
  Check,
  RotateCcw,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { SubjectTeacher, InstitutionSettings } from '../types';
import { ALL_SUBJECTS } from '../data/subjectMeta';
import {
  DEFAULT_PRIMARY_PHONE,
  loadSubjectTeachers,
  saveSubjectTeachers,
  getAllTeachersList,
  importTeachersBatch
} from '../data/teacherDirectory';

interface TeacherManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutionSettings: InstitutionSettings;
  onSaveTeachers: (updatedTeachers: Record<string, SubjectTeacher>) => void;
}

export const TeacherManagementModal: React.FC<TeacherManagementModalProps> = ({
  isOpen,
  onClose,
  institutionSettings,
  onSaveTeachers
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'upload' | 'manual'>('list');
  const [teachersMap, setTeachersMap] = useState<Record<string, SubjectTeacher>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'wajib' | 'pemberdayaan' | 'keterampilan-vokasi' | 'muatan-lokal' | 'peminatan'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Manual Add / Edit Form State
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [formTeacherName, setFormTeacherName] = useState<string>('');
  const [formSubjectName, setFormSubjectName] = useState<string>('');
  const [formSelectedPreset, setFormSelectedPreset] = useState<string>('custom');
  const [formCategory, setFormCategory] = useState<'wajib' | 'pemberdayaan' | 'keterampilan-vokasi' | 'muatan-lokal' | 'peminatan'>('wajib');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formNip, setFormNip] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // Excel Upload States
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [parsedExcelRows, setParsedExcelRows] = useState<SubjectTeacher[]>([]);
  const [selectedRowIndices, setSelectedRowIndices] = useState<Set<number>>(new Set());
  const [uploadImportMode, setUploadImportMode] = useState<'merge' | 'replace'>('merge');
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete Confirmation
  const [teacherToDelete, setTeacherToDelete] = useState<SubjectTeacher | null>(null);

  // Initialize data on modal open
  useEffect(() => {
    if (isOpen) {
      const stored = loadSubjectTeachers();
      setTeachersMap(
        institutionSettings.subjectTeachers && Object.keys(institutionSettings.subjectTeachers).length > 0
          ? institutionSettings.subjectTeachers
          : stored
      );
      setNotification(null);
      setUploadError('');
      setExcelFile(null);
      setParsedExcelRows([]);
      setSelectedRowIndices(new Set());
      setEditingSubjectId(null);
      resetManualForm();
    }
  }, [isOpen, institutionSettings]);

  // Toast notification helper
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Convert map to list merged with standard subjects
  const teachersList = useMemo(() => {
    return getAllTeachersList(teachersMap, institutionSettings.phone || DEFAULT_PRIMARY_PHONE);
  }, [teachersMap, institutionSettings.phone]);

  // Filtered teachers for the table
  const filteredTeachers = useMemo(() => {
    return teachersList.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.teacherName.toLowerCase().includes(q) ||
        item.subjectName.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        (item.nipOrNiy && item.nipOrNiy.toLowerCase().includes(q));

      if (!matchQuery) return false;
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (statusFilter === 'active' && item.isActive === false) return false;
      if (statusFilter === 'inactive' && item.isActive !== false) return false;
      return true;
    });
  }, [teachersList, searchQuery, categoryFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = teachersList.length;
    const active = teachersList.filter(t => t.isActive !== false).length;
    const inactive = total - active;
    const custom = teachersList.filter(t => t.customSubject).length;
    return { total, active, inactive, custom };
  }, [teachersList]);

  const resetManualForm = () => {
    setEditingSubjectId(null);
    setFormTeacherName('');
    setFormSubjectName('');
    setFormSelectedPreset('custom');
    setFormCategory('wajib');
    setFormPhone(institutionSettings.phone || '');
    setFormNip('');
    setFormNotes('');
    setFormIsActive(true);
  };

  // Switch preset in manual add form
  const handlePresetSelect = (subjectId: string) => {
    setFormSelectedPreset(subjectId);
    if (subjectId === 'custom') {
      setFormSubjectName('');
      setFormCategory('wajib');
      return;
    }
    const found = ALL_SUBJECTS.find(s => s.id === subjectId);
    if (found) {
      setFormSubjectName(found.name);
      setFormCategory(found.category);
      if (!formNotes) {
        setFormNotes(`Tutor ${found.name}`);
      }
    }
  };

  // Start editing an existing teacher
  const handleStartEdit = (teacher: SubjectTeacher) => {
    setEditingSubjectId(teacher.subjectId);
    setFormTeacherName(teacher.teacherName || '');
    setFormSubjectName(teacher.subjectName || '');
    setFormSelectedPreset(teacher.customSubject ? 'custom' : teacher.subjectId);
    setFormCategory(teacher.category || 'wajib');
    setFormPhone(teacher.phone || '');
    setFormNip(teacher.nipOrNiy === '-' ? '' : (teacher.nipOrNiy || ''));
    setFormNotes(teacher.notes || '');
    setFormIsActive(teacher.isActive !== false);
    setActiveTab('manual');
  };

  // Save Manual Form (Add or Update)
  const handleSaveManualForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTeacherName.trim()) {
      showToast('Harap masukkan nama guru/tutor.', 'error');
      return;
    }
    if (!formSubjectName.trim()) {
      showToast('Harap tentukan mata pelajaran yang diampu.', 'error');
      return;
    }

    let subjectKey = editingSubjectId;
    if (!subjectKey) {
      const match = ALL_SUBJECTS.find(s => s.name.toLowerCase() === formSubjectName.trim().toLowerCase());
      if (match) {
        subjectKey = match.id;
      } else {
        subjectKey = formSubjectName
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || `mapel-${Date.now()}`;
      }
    }

    const updatedTeacher: SubjectTeacher = {
      subjectId: subjectKey,
      subjectName: formSubjectName.trim(),
      teacherName: formTeacherName.trim(),
      phone: formPhone.trim() || institutionSettings.phone || DEFAULT_PRIMARY_PHONE,
      nipOrNiy: formNip.trim() || '-',
      category: formCategory,
      isActive: formIsActive,
      notes: formNotes.trim() || `Tutor ${formSubjectName.trim()}`,
      customSubject: !ALL_SUBJECTS.some(s => s.id === subjectKey)
    };

    const newMap = {
      ...teachersMap,
      [subjectKey]: updatedTeacher
    };

    setTeachersMap(newMap);
    saveSubjectTeachers(newMap);
    onSaveTeachers(newMap);

    showToast(
      editingSubjectId
        ? `Perubahan guru "${updatedTeacher.teacherName}" (${updatedTeacher.subjectName}) berhasil disimpan!`
        : `Guru baru "${updatedTeacher.teacherName}" untuk mapel "${updatedTeacher.subjectName}" berhasil ditambahkan!`,
      'success'
    );

    resetManualForm();
    setActiveTab('list');
  };

  // Quick toggle active status
  const handleToggleActive = (subjectId: string) => {
    const current = teachersMap[subjectId] || teachersList.find(t => t.subjectId === subjectId);
    const newStatus = current ? current.isActive === false : false;

    const newMap: Record<string, SubjectTeacher> = {
      ...teachersMap,
      [subjectId]: {
        ...(current || {
          subjectId,
          subjectName: ALL_SUBJECTS.find(s => s.id === subjectId)?.name || subjectId,
          teacherName: 'Tutor Pengampu',
          phone: institutionSettings.phone || DEFAULT_PRIMARY_PHONE,
          category: 'wajib'
        }),
        isActive: newStatus
      }
    };

    setTeachersMap(newMap);
    saveSubjectTeachers(newMap);
    onSaveTeachers(newMap);

    showToast(
      newStatus
        ? `Guru untuk mapel ${newMap[subjectId].subjectName} telah diaktifkan (siap dipilih untuk LKPD).`
        : `Guru untuk mapel ${newMap[subjectId].subjectName} disetel Non-Aktif.`,
      'info'
    );
  };

  // Quick bulk toggle
  const handleBulkToggleActive = (status: boolean) => {
    const newMap: Record<string, SubjectTeacher> = { ...teachersMap };
    teachersList.forEach(item => {
      const existing = newMap[item.subjectId] || item;
      newMap[item.subjectId] = {
        ...existing,
        isActive: status
      };
    });

    setTeachersMap(newMap);
    saveSubjectTeachers(newMap);
    onSaveTeachers(newMap);

    showToast(
      status
        ? `Seluruh ${teachersList.length} guru pengampu telah diaktifkan untuk pengiriman LKPD!`
        : `Seluruh guru pengampu disetel Non-Aktif.`,
      'success'
    );
  };

  // Delete a teacher
  const handleConfirmDelete = () => {
    if (!teacherToDelete) return;
    const key = teacherToDelete.subjectId;
    const newMap = { ...teachersMap };
    delete newMap[key];

    setTeachersMap(newMap);
    saveSubjectTeachers(newMap);
    onSaveTeachers(newMap);

    showToast(`Mata pelajaran "${teacherToDelete.subjectName}" berhasil dihapus dari daftar guru.`, 'info');
    setTeacherToDelete(null);
  };

  // Excel File Parsing via SheetJS
  const processExcelFile = (file: File) => {
    setExcelFile(file);
    setUploadError('');
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          setUploadError('File Excel tidak memiliki lembar kerja (worksheet).');
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          setUploadError('Tidak ditemukan data baris pada file Excel yang diunggah.');
          return;
        }

        // Map columns intelligently
        const parsed: SubjectTeacher[] = [];

        rawJson.forEach((row, idx) => {
          // Detect Teacher Name
          const teacherName = (
            row['Nama Guru'] ||
            row['Nama Tutor'] ||
            row['Nama'] ||
            row['Guru'] ||
            row['Tutor'] ||
            row['Teacher Name'] ||
            row['Teacher'] ||
            ''
          ).toString().trim();

          // Detect Subject Name
          const subjectName = (
            row['Mata Pelajaran'] ||
            row['Mapel'] ||
            row['Pelajaran'] ||
            row['Bidang Studi'] ||
            row['Subject'] ||
            row['Mata Pelajaran / Topik'] ||
            ''
          ).toString().trim();

          if (!teacherName && !subjectName) {
            return; // skip blank rows
          }

          // Detect Phone
          let phone = (
            row['Nomor HP'] ||
            row['No HP'] ||
            row['No WA'] ||
            row['WhatsApp'] ||
            row['Nomor WhatsApp'] ||
            row['Telepon'] ||
            row['Phone'] ||
            row['No Telepon'] ||
            ''
          ).toString().trim();

          if (!phone) {
            phone = institutionSettings.phone || DEFAULT_PRIMARY_PHONE;
          }

          // Detect NIP/NIY
          const nipOrNiy = (
            row['NIP'] ||
            row['NIY'] ||
            row['NUPTK'] ||
            row['NIP/NIY'] ||
            row['ID Guru'] ||
            '-'
          ).toString().trim();

          // Detect Category
          const rawCat = (
            row['Kategori'] ||
            row['Kelompok'] ||
            row['Jenis Mapel'] ||
            row['Category'] ||
            'wajib'
          ).toString().toLowerCase();

          let category: 'wajib' | 'pemberdayaan' | 'keterampilan-vokasi' | 'muatan-lokal' | 'peminatan' = 'wajib';
          if (rawCat.includes('vokasi') || rawCat.includes('terampil')) category = 'keterampilan-vokasi';
          else if (rawCat.includes('daya') || rawCat.includes('berdaya')) category = 'pemberdayaan';
          else if (rawCat.includes('minat')) category = 'peminatan';
          else if (rawCat.includes('lokal') || rawCat.includes('mulok') || rawCat.includes('daerah')) category = 'muatan-lokal';

          // Detect Active Status
          const rawStatus = (
            row['Status'] ||
            row['Aktif'] ||
            row['Status Aktif'] ||
            row['Is Active'] ||
            'aktif'
          ).toString().toLowerCase().trim();

          const isActive = !(
            rawStatus === 'nonaktif' ||
            rawStatus === 'non-aktif' ||
            rawStatus === 'tidak' ||
            rawStatus === 'false' ||
            rawStatus === '0' ||
            rawStatus === 'off'
          );

          // Detect Notes
          const notes = (
            row['Catatan'] ||
            row['Keterangan'] ||
            row['Notes'] ||
            `Tutor ${subjectName || 'Mapel'}`
          ).toString().trim();

          // Generate unique slug
          const matchMeta = ALL_SUBJECTS.find(s => s.name.toLowerCase() === subjectName.toLowerCase());
          const subjectId = matchMeta ? matchMeta.id : (
            subjectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `import-${idx + 1}`
          );

          parsed.push({
            subjectId,
            subjectName: subjectName || matchMeta?.name || `Mapel ${idx + 1}`,
            teacherName: teacherName || 'Tutor Pengampu',
            phone,
            nipOrNiy: nipOrNiy || '-',
            category: matchMeta ? matchMeta.category : category,
            isActive,
            notes,
            customSubject: !matchMeta
          });
        });

        if (parsed.length === 0) {
          setUploadError('Tidak dapat membaca baris guru yang valid dari file ini. Pastikan kolom memiliki header: "Nama Guru", "Mata Pelajaran", dan "Nomor HP".');
          return;
        }

        setParsedExcelRows(parsed);
        // Select all by default
        setSelectedRowIndices(new Set(parsed.map((_, i) => i)));
        showToast(`Berhasil membaca ${parsed.length} baris data guru dari Excel!`, 'success');
      } catch (err: any) {
        console.error('Excel parse error:', err);
        setUploadError(`Gagal membaca file Excel: ${err.message || 'Format file tidak didukung'}`);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Apply parsed Excel rows into directory
  const handleApplyExcelImport = () => {
    const selectedRows = parsedExcelRows.filter((_, i) => selectedRowIndices.has(i));
    if (selectedRows.length === 0) {
      showToast('Pilih setidaknya 1 baris guru yang ingin diimpor.', 'error');
      return;
    }

    const updated = importTeachersBatch(selectedRows, uploadImportMode);
    setTeachersMap(updated);
    onSaveTeachers(updated);

    showToast(
      uploadImportMode === 'replace'
        ? `Berhasil mengganti seluruh daftar guru dengan ${selectedRows.length} data dari Excel!`
        : `Berhasil mengimpor dan menggabungkan ${selectedRows.length} guru ke dalam sistem!`,
      'success'
    );

    // Reset upload state and switch back to list
    setExcelFile(null);
    setParsedExcelRows([]);
    setSelectedRowIndices(new Set());
    setActiveTab('list');
  };

  // Download Sample Excel Template
  const handleDownloadExcelTemplate = () => {
    const templateData = [
      {
        'No': 1,
        'Nama Guru': 'Nurul Fadhilah, S.Pd.',
        'Mata Pelajaran': 'Bahasa Indonesia',
        'Nomor HP': '085722271680',
        'NIP': '19890420 201503 2 003',
        'Kategori': 'Wajib',
        'Status': 'Aktif',
        'Catatan': 'Tutor Literasi & Bahasa Indonesia'
      },
      {
        'No': 2,
        'Nama Guru': 'Rudi Hartono, S.Si., M.Pd.',
        'Mata Pelajaran': 'Matematika',
        'Nomor HP': '081234567890',
        'NIP': '19841108 200902 1 007',
        'Kategori': 'Wajib',
        'Status': 'Aktif',
        'Catatan': 'Tutor Matematika & Aritmatika'
      },
      {
        'No': 3,
        'Nama Guru': 'Dr. Hendra Gunawan, M.Si.',
        'Mata Pelajaran': 'Ilmu Pengetahuan Alam (IPA)',
        'Nomor HP': '087812345678',
        'NIP': '19800724 200801 1 012',
        'Kategori': 'Wajib',
        'Status': 'Aktif',
        'Catatan': 'Tutor Sains Terpadu'
      },
      {
        'No': 4,
        'Nama Guru': 'Dewi Sartika, S.Pd.',
        'Mata Pelajaran': 'Tata Busana',
        'Nomor HP': '089612345678',
        'NIP': '19880512 201402 2 006',
        'Kategori': 'Keterampilan-Vokasi',
        'Status': 'Aktif',
        'Catatan': 'Tutor Vokasi Menjahit & Pola Busana'
      },
      {
        'No': 5,
        'Nama Guru': 'Chef Anton Wijaya',
        'Mata Pelajaran': 'Tata Boga',
        'Nomor HP': '085212345678',
        'NIP': '-',
        'Kategori': 'Keterampilan-Vokasi',
        'Status': 'Aktif',
        'Catatan': 'Tutor Kuliner & Pengolahan Pangan'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    // Set column widths
    ws['!cols'] = [
      { wch: 5 },
      { wch: 30 },
      { wch: 30 },
      { wch: 18 },
      { wch: 24 },
      { wch: 20 },
      { wch: 10 },
      { wch: 35 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Daftar Guru');
    XLSX.writeFile(wb, 'Template_Daftar_Guru_PKBM.xlsx');
    showToast('Template file Excel berhasil diunduh!', 'info');
  };

  // Download Sample CSV Template
  const handleDownloadCsvTemplate = () => {
    const csvContent =
      'No,Nama Guru,Mata Pelajaran,Nomor HP,NIP,Kategori,Status,Catatan\n' +
      '1,Nurul Fadhilah S.Pd.,Bahasa Indonesia,085722271680,19890420 201503 2 003,Wajib,Aktif,Tutor Literasi\n' +
      '2,Rudi Hartono M.Pd.,Matematika,081234567890,19841108 200902 1 007,Wajib,Aktif,Tutor Matematika\n' +
      '3,Dewi Sartika S.Pd.,Tata Busana,089612345678,-,Keterampilan-Vokasi,Aktif,Tutor Vokasi Busana\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Template_Daftar_Guru_PKBM.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Template file CSV berhasil diunduh!', 'info');
  };

  // Export current list to Excel
  const handleExportCurrentToExcel = () => {
    const exportData = teachersList.map((t, i) => ({
      'No': i + 1,
      'Nama Guru': t.teacherName,
      'Mata Pelajaran': t.subjectName,
      'Nomor HP WhatsApp': t.phone,
      'NIP/NIY': t.nipOrNiy || '-',
      'Kategori': t.category?.toUpperCase() || 'WAJIB',
      'Status Aktif': t.isActive !== false ? 'AKTIF' : 'NON-AKTIF',
      'Catatan': t.notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = [
      { wch: 5 },
      { wch: 32 },
      { wch: 32 },
      { wch: 20 },
      { wch: 24 },
      { wch: 20 },
      { wch: 15 },
      { wch: 35 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Daftar Guru PKBM');
    const filename = `Daftar_Guru_${institutionSettings.shortName || 'PKBM'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
    showToast(`Daftar guru berhasil diekspor ke file ${filename}!`, 'success');
  };

  // Master Save All
  const handleSaveAll = () => {
    saveSubjectTeachers(teachersMap);
    onSaveTeachers(teachersMap);
    showToast(`Seluruh data daftar guru berhasil disimpan & tersinkronkan ke pengiriman LKPD!`, 'success');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b-2 border-emerald-900 flex items-center justify-between bg-emerald-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-emerald-900 flex items-center justify-center font-bold text-base shadow-sm shrink-0">
              <Users className="w-5 h-5 text-emerald-800" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg">
                  Menu Daftar Guru Pengampu
                </h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded border border-emerald-700/60">
                  {institutionSettings.name}
                </span>
              </div>
              <p className="text-[11px] text-emerald-200">
                Input manual, upload file Excel, kelola nomor WhatsApp guru mapel, dan sinkronkan aktif untuk pengiriman LKPD
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-xs transition-colors cursor-pointer"
              title="Simpan perubahan dan tutup modal"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Simpan & Selesai</span>
              <span className="sm:hidden">Simpan</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Notification Banner */}
        {notification && (
          <div
            className={`px-4 py-2 text-xs font-bold flex items-center gap-2 border-b animate-in fade-in duration-150 ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : notification.type === 'error'
                ? 'bg-red-50 text-red-900 border-red-200'
                : 'bg-blue-50 text-blue-900 border-blue-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification.message}</span>
          </div>
        )}

        {/* Quick Statistics Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-600 font-medium">Status Sinkronisasi LKPD:</span>
            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[11px]">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>{stats.active} Guru Aktif (Siap Kirim LKPD)</span>
            </span>
            {stats.inactive > 0 && (
              <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-full text-[11px]">
                <span>{stats.inactive} Non-Aktif</span>
              </span>
            )}
            <span className="text-slate-500 text-[11px]">Total: {stats.total} Mata Pelajaran</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleBulkToggleActive(true)}
              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 px-2 py-1 bg-white border border-emerald-300 rounded hover:bg-emerald-50 transition-colors cursor-pointer"
              title="Aktifkan seluruh guru agar dapat dipilih saat mengirim LKPD"
            >
              Aktifkan Semua
            </button>
            <button
              type="button"
              onClick={handleExportCurrentToExcel}
              className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 px-2 py-1 bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors flex items-center gap-1 cursor-pointer"
              title="Ekspor seluruh data daftar guru ke file Excel .xlsx"
            >
              <Download className="w-3 h-3" />
              <span>Ekspor Excel</span>
            </button>
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100 px-4 pt-2 gap-2 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'list'
                ? 'border-emerald-700 text-emerald-900 font-bold bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-700" />
            <span>1. Daftar Guru & Tabel Pengampu ({stats.total})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-emerald-700 text-emerald-900 font-bold bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-blue-700" />
            <span>2. Upload File Excel (.xlsx / .xls / .csv)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (editingSubjectId) resetManualForm();
              setActiveTab('manual');
            }}
            className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'manual'
                ? 'border-emerald-700 text-emerald-900 font-bold bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-emerald-700" />
            <span>3. Input Manual Guru Baru</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-4 flex-1 text-xs text-slate-800">
          
          {/* =========================================================
             TAB 1: DAFTAR & TABEL GURU PENGAMPU
             ========================================================= */}
          {activeTab === 'list' && (
            <div className="space-y-3">
              {/* Toolbar & Filter */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari nama guru, mata pelajaran, nomor WhatsApp, NIP..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('upload')}
                      className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Excel</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetManualForm();
                        setActiveTab('manual');
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Manual</span>
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-[11px]">
                  <div className="flex items-center gap-1 text-slate-500 font-semibold mr-1">
                    <Filter className="w-3 h-3" />
                    <span>Filter:</span>
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {[
                      { id: 'all', label: 'Semua Kategori' },
                      { id: 'wajib', label: 'Wajib Umum' },
                      { id: 'keterampilan-vokasi', label: 'Vokasi' },
                      { id: 'pemberdayaan', label: 'Pemberdayaan' },
                      { id: 'peminatan', label: 'Peminatan' },
                      { id: 'muatan-lokal', label: 'Muatan Lokal' }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setCategoryFilter(f.id as any)}
                        className={`px-2 py-0.5 rounded-full font-semibold transition-colors cursor-pointer ${
                          categoryFilter === f.id
                            ? 'bg-emerald-700 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Status Pills */}
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setStatusFilter('all')}
                      className={`px-2 py-0.5 rounded font-semibold cursor-pointer ${
                        statusFilter === 'all'
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Semua Status
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('active')}
                      className={`px-2 py-0.5 rounded font-semibold cursor-pointer ${
                        statusFilter === 'active'
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-100 text-emerald-800 hover:bg-emerald-50'
                      }`}
                    >
                      Hanya Aktif
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('inactive')}
                      className={`px-2 py-0.5 rounded font-semibold cursor-pointer ${
                        statusFilter === 'inactive'
                          ? 'bg-slate-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Non-Aktif
                    </button>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                        <th className="py-2.5 px-3 w-12 text-center">Status</th>
                        <th className="py-2.5 px-3 min-w-[160px]">Mata Pelajaran</th>
                        <th className="py-2.5 px-3 min-w-[200px]">Nama Guru / Tutor</th>
                        <th className="py-2.5 px-3 min-w-[160px]">Nomor WhatsApp</th>
                        <th className="py-2.5 px-3 min-w-[130px]">NIP / NIY</th>
                        <th className="py-2.5 px-3 text-center w-28">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTeachers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center gap-1.5">
                              <Users className="w-8 h-8 text-slate-300" />
                              <p className="font-semibold">Tidak ditemukan guru dengan kriteria pencarian ini.</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setSearchQuery('');
                                  setCategoryFilter('all');
                                  setStatusFilter('all');
                                }}
                                className="text-blue-600 underline font-semibold text-xs mt-1"
                              >
                                Bersihkan filter
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredTeachers.map((teacher, idx) => {
                          const isActive = teacher.isActive !== false;
                          const waFormatted = teacher.phone.replace(/\D/g, '').replace(/^0/, '62');
                          const waUrl = `https://wa.me/${waFormatted}`;

                          return (
                            <tr
                              key={teacher.subjectId || idx}
                              className={`hover:bg-slate-50 transition-colors ${
                                !isActive ? 'bg-slate-50/60 opacity-70' : ''
                              }`}
                            >
                              {/* Toggle Active Switch */}
                              <td className="py-2 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleActive(teacher.subjectId)}
                                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                                    isActive
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                      : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                                  }`}
                                  title={
                                    isActive
                                      ? 'Status: AKTIF (Tersinkron siap dipilih saat kirim LKPD). Klik untuk nonaktifkan.'
                                      : 'Status: NON-AKTIF. Klik untuk mengaktifkan.'
                                  }
                                >
                                  <Power className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                                </button>
                              </td>

                              {/* Subject Name & Category */}
                              <td className="py-2 px-3">
                                <div className="font-bold text-slate-900">{teacher.subjectName}</div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                      teacher.category === 'keterampilan-vokasi'
                                        ? 'bg-amber-100 text-amber-900'
                                        : teacher.category === 'pemberdayaan'
                                        ? 'bg-emerald-100 text-emerald-900'
                                        : teacher.category === 'peminatan'
                                        ? 'bg-purple-100 text-purple-900'
                                        : teacher.category === 'muatan-lokal'
                                        ? 'bg-teal-100 text-teal-900'
                                        : 'bg-blue-100 text-blue-900'
                                    }`}
                                  >
                                    {teacher.category === 'keterampilan-vokasi' ? 'Vokasi' : teacher.category}
                                  </span>
                                  {teacher.customSubject && (
                                    <span className="text-[9px] bg-slate-200 text-slate-700 px-1 rounded font-bold">
                                      Kustom
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Teacher Name */}
                              <td className="py-2 px-3">
                                <div className="font-bold text-slate-950 flex items-center gap-1.5">
                                  <span>{teacher.teacherName}</span>
                                  {isActive && (
                                    <span
                                      className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                                      title="Guru Aktif Tersinkron"
                                    />
                                  )}
                                </div>
                                {teacher.notes && (
                                  <p className="text-[10px] text-slate-500 truncate max-w-xs">{teacher.notes}</p>
                                )}
                              </td>

                              {/* Phone / WhatsApp with Direct Link */}
                              <td className="py-2 px-3 font-mono">
                                <div className="flex items-center gap-1.5">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span className="font-semibold text-slate-800">{teacher.phone}</span>
                                  {waFormatted && (
                                    <a
                                      href={waUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-emerald-600 hover:text-emerald-700 p-0.5 rounded hover:bg-emerald-50 transition-colors"
                                      title="Uji Kirim Chat WhatsApp Langsung"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              </td>

                              {/* NIP / NIY */}
                              <td className="py-2 px-3 font-mono text-slate-600 text-[11px]">
                                {teacher.nipOrNiy || '-'}
                              </td>

                              {/* Action Buttons */}
                              <td className="py-2 px-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(teacher)}
                                    className="p-1 rounded text-blue-700 hover:text-blue-900 hover:bg-blue-50 transition-colors cursor-pointer"
                                    title="Edit data guru ini"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setTeacherToDelete(teacher)}
                                    className="p-1 rounded text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors cursor-pointer"
                                    title="Hapus guru ini dari daftar"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
             TAB 2: UPLOAD EXCEL (.xlsx / .xls / .csv)
             ========================================================= */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              {/* Instructions & Template Download Card */}
              <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <h4 className="font-bold text-blue-950 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-blue-700" />
                    <span>Petunjuk Format Unggah File Excel / Spreadsheet:</span>
                  </h4>
                  <p className="text-[11px] text-blue-900 leading-relaxed">
                    Sistem otomatis membaca kolom Excel dengan header: <strong>Nama Guru</strong>,{' '}
                    <strong>Mata Pelajaran</strong>, <strong>Nomor HP (WhatsApp)</strong>, <strong>NIP</strong>,{' '}
                    dan <strong>Status (Aktif/Non-Aktif)</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadExcelTemplate}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Template Excel (.xlsx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadCsvTemplate}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh CSV</span>
                  </button>
                </div>
              </div>

              {/* Drag & Drop Upload Zone */}
              <div
                onDragOver={e => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => {
                  e.preventDefault();
                  setIsDragging(false);
                  const files = e.dataTransfer.files;
                  if (files && files.length > 0) {
                    processExcelFile(files[0]);
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                    : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-emerald-400'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      processExcelFile(e.target.files[0]);
                    }
                  }}
                />

                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-1 shadow-2xs">
                    <Upload className="w-6 h-6 text-emerald-700" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">
                    Klik di sini atau seret (drag & drop) file Excel / CSV ke area ini
                  </h4>
                  <p className="text-[11px] text-slate-500 max-w-md">
                    Mendukung format spreadsheet <strong>.XLSX</strong>, <strong>.XLS</strong>, dan <strong>.CSV</strong>.
                  </p>
                  {excelFile && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full font-bold text-xs">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                      <span>File terpilih: {excelFile.name} ({(excelFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Error Alert */}
              {uploadError && (
                <div className="bg-red-50 border border-red-300 text-red-900 p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span className="text-xs font-semibold">{uploadError}</span>
                </div>
              )}

              {/* Preview Parsed Rows Table */}
              {parsedExcelRows.length > 0 && (
                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-300 shadow-sm animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Pratinjau Data Guru dari Excel: {parsedExcelRows.length} Baris Terdeteksi</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Pilih baris yang ingin dimasukkan, lalu tentukan mode penggabungan data.
                      </p>
                    </div>

                    {/* Mode Choice */}
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 font-semibold text-xs text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="importMode"
                          checked={uploadImportMode === 'merge'}
                          onChange={() => setUploadImportMode('merge')}
                          className="accent-emerald-600"
                        />
                        <span>Gabungkan (Merge)</span>
                      </label>
                      <label className="flex items-center gap-1.5 font-semibold text-xs text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="importMode"
                          checked={uploadImportMode === 'replace'}
                          onChange={() => setUploadImportMode('replace')}
                          className="accent-emerald-600"
                        />
                        <span>Ganti Seluruh Daftar (Replace)</span>
                      </label>
                    </div>
                  </div>

                  {/* Checkbox selector header */}
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedRowIndices.size === parsedExcelRows.length) {
                          setSelectedRowIndices(new Set());
                        } else {
                          setSelectedRowIndices(new Set(parsedExcelRows.map((_, i) => i)));
                        }
                      }}
                      className="font-bold text-emerald-700 underline cursor-pointer"
                    >
                      {selectedRowIndices.size === parsedExcelRows.length ? 'Batalkan Semua Pilihan' : 'Pilih Semua Baris'}
                    </button>
                    <span>{selectedRowIndices.size} dari {parsedExcelRows.length} baris terpilih</span>
                  </div>

                  {/* Parsed table */}
                  <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 sticky top-0 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-2.5 w-10 text-center">Pilih</th>
                          <th className="py-2 px-2.5">Nama Guru</th>
                          <th className="py-2 px-2.5">Mata Pelajaran</th>
                          <th className="py-2 px-2.5">Nomor WhatsApp</th>
                          <th className="py-2 px-2.5">NIP</th>
                          <th className="py-2 px-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedExcelRows.map((row, idx) => {
                          const isSelected = selectedRowIndices.has(idx);
                          return (
                            <tr
                              key={idx}
                              onClick={() => {
                                const next = new Set(selectedRowIndices);
                                if (next.has(idx)) next.delete(idx);
                                else next.add(idx);
                                setSelectedRowIndices(next);
                              }}
                              className={`cursor-pointer hover:bg-emerald-50/50 ${
                                isSelected ? 'bg-emerald-50/30' : 'bg-white opacity-60'
                              }`}
                            >
                              <td className="py-1.5 px-2.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="accent-emerald-600 cursor-pointer"
                                />
                              </td>
                              <td className="py-1.5 px-2.5 font-bold text-slate-900">{row.teacherName}</td>
                              <td className="py-1.5 px-2.5">{row.subjectName}</td>
                              <td className="py-1.5 px-2.5 font-mono">{row.phone}</td>
                              <td className="py-1.5 px-2.5 font-mono text-slate-500">{row.nipOrNiy}</td>
                              <td className="py-1.5 px-2.5">
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                    row.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {row.isActive ? 'Aktif' : 'Non-Aktif'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Apply Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setExcelFile(null);
                        setParsedExcelRows([]);
                        setSelectedRowIndices(new Set());
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyExcelImport}
                      disabled={selectedRowIndices.size === 0}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Proses & Masukkan {selectedRowIndices.size} Guru ke Sistem</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
             TAB 3: INPUT MANUAL GURU
             ========================================================= */}
          {activeTab === 'manual' && (
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Plus className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {editingSubjectId ? `Edit Guru Pengampu: ${formSubjectName}` : 'Formulir Tambah Guru Pengampu Manual'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Masukkan data guru, mata pelajaran, nomor WhatsApp aktif, dan status pengampu LKPD
                    </p>
                  </div>
                </div>

                {editingSubjectId && (
                  <button
                    type="button"
                    onClick={resetManualForm}
                    className="text-xs text-slate-500 hover:text-slate-800 underline font-semibold"
                  >
                    Batal Edit & Tambah Baru
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveManualForm} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nama Guru */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Nama Lengkap Guru / Tutor Pengampu: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formTeacherName}
                      onChange={e => setFormTeacherName(e.target.value)}
                      placeholder="Contoh: Dra. Hj. Siti Rohmah, M.Pd."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold text-slate-900"
                    />
                  </div>

                  {/* Preset Subject Picker */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Pilih dari Mata Pelajaran Standar atau Kustom:
                    </label>
                    <select
                      value={formSelectedPreset}
                      onChange={e => handlePresetSelect(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                    >
                      <option value="custom">✏️ Tulis Nama Mapel Kustom Sendiri</option>
                      <optgroup label="Mapel Wajib / Umum (Paket B & C)">
                        {ALL_SUBJECTS.filter(s => s.category === 'wajib').map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Program Vokasi & Keterampilan">
                        {ALL_SUBJECTS.filter(s => s.category === 'keterampilan-vokasi').map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Pemberdayaan & Kewirausahaan">
                        {ALL_SUBJECTS.filter(s => s.category === 'pemberdayaan').map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Peminatan IPA / IPS (Paket C)">
                        {ALL_SUBJECTS.filter(s => s.category === 'peminatan').map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Muatan Lokal & Bahasa">
                        {ALL_SUBJECTS.filter(s => s.category === 'muatan-lokal').map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Mata Pelajaran Name */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Nama Mata Pelajaran: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formSubjectName}
                      onChange={e => setFormSubjectName(e.target.value)}
                      placeholder="Contoh: Tata Busana / Matematika / Bahasa Arab"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold"
                    />
                  </div>

                  {/* Kategori Mapel */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Kategori Kurikulum:
                    </label>
                    <select
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                    >
                      <option value="wajib">Wajib Umum (Nasional)</option>
                      <option value="keterampilan-vokasi">Keterampilan / Kejuruan (Vokasi)</option>
                      <option value="pemberdayaan">Pemberdayaan & Kewirausahaan</option>
                      <option value="peminatan">Peminatan Pilihan (IPA / IPS)</option>
                      <option value="muatan-lokal">Muatan Lokal / Bahasa Daerah</option>
                    </select>
                  </div>

                  {/* Nomor WhatsApp Guru */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Nomor HP WhatsApp Guru: <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={formPhone}
                        onChange={e => setFormPhone(e.target.value)}
                        placeholder="Contoh: 081234567890 atau 0857-2227-1680"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono font-bold text-slate-900"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Nomor ini yang akan menerima lembar jawaban siswa dan tercantum di penugasan LKPD.
                    </p>
                  </div>

                  {/* NIP / NIY */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      NIP / NIY / NUPTK (Opsional):
                    </label>
                    <input
                      type="text"
                      value={formNip}
                      onChange={e => setFormNip(e.target.value)}
                      placeholder="Contoh: 19850614 201101 1 008 atau -"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                    />
                  </div>
                </div>

                {/* Catatan / Keterangan */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Catatan / Spesialisasi Pengampu (Opsional):
                  </label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={e => setFormNotes(e.target.value)}
                    placeholder="Contoh: Pengampu Unit 1-8 Tata Busana Homeschooling & Praktik Mandiri"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Status Aktif Toggle */}
                <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="formIsActive"
                      checked={formIsActive}
                      onChange={e => setFormIsActive(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded accent-emerald-600 cursor-pointer"
                    />
                    <label htmlFor="formIsActive" className="text-xs font-bold text-emerald-950 cursor-pointer">
                      Status Guru Aktif (Tersinkronisasi & dapat dipilih saat mengirimkan LKPD)
                    </label>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    formIsActive ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                  }`}>
                    {formIsActive ? 'Aktif' : 'Non-Aktif'}
                  </span>
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      resetManualForm();
                      setActiveTab('list');
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{editingSubjectId ? 'Simpan Perubahan Guru' : 'Simpan & Tambahkan Guru'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Tersinkronisasi ke Fitur Kirim WhatsApp, Halaman LKPD Siswa, dan Lembar Jawaban Tutor</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {teacherToDelete && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-4 space-y-3 border border-slate-300 shadow-xl">
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>Konfirmasi Hapus Guru</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus data pengampu untuk mata pelajaran{' '}
              <strong className="text-slate-900">{teacherToDelete.subjectName}</strong> ({teacherToDelete.teacherName})?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setTeacherToDelete(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
