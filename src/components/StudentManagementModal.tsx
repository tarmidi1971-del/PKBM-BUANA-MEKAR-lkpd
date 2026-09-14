import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  X,
  GraduationCap,
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
  BookOpen,
  UserCheck,
  UserX
} from 'lucide-react';
import { GradeLevel, StudentContact } from '../types';
import {
  loadStudentContacts,
  saveStudentContacts,
  importStudentsBatch,
  saveSingleStudent,
  deleteStudent,
  bulkDeleteStudents,
  toggleStudentStatus,
  bulkSetStudentStatus,
  parseStudentGrade,
  getGradePackageInfo,
  resetToDefaultStudentContacts
} from '../data/studentDirectory';

interface StudentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStudentForLKPD?: (student: StudentContact) => void;
}

export const StudentManagementModal: React.FC<StudentManagementModalProps> = ({
  isOpen,
  onClose,
  onSelectStudentForLKPD
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'upload' | 'manual'>('list');
  const [students, setStudents] = useState<StudentContact[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [gradeFilter, setGradeFilter] = useState<'all' | 'paket-b' | 'paket-c' | '7' | '8' | '9' | '10' | '11' | '12'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'L' | 'P'>('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Manual Add / Edit Form State
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [formNisn, setFormNisn] = useState<string>('');
  const [formGrade, setFormGrade] = useState<GradeLevel>(7);
  const [formGender, setFormGender] = useState<'L' | 'P'>('L');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formParentName, setFormParentName] = useState<string>('');
  const [formParentPhone, setFormParentPhone] = useState<string>('');
  const [formGroupName, setFormGroupName] = useState<string>('');
  const [formAddress, setFormAddress] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // Excel Upload States
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [parsedExcelRows, setParsedExcelRows] = useState<StudentContact[]>([]);
  const [selectedExcelIndices, setSelectedExcelIndices] = useState<Set<number>>(new Set());
  const [uploadImportMode, setUploadImportMode] = useState<'merge' | 'replace'>('merge');
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete Confirmation Modal State
  const [studentToDelete, setStudentToDelete] = useState<StudentContact | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);

  // Load students on open & listen to updates
  useEffect(() => {
    if (isOpen) {
      refreshData();
      setNotification(null);
      setUploadError('');
      setExcelFile(null);
      setParsedExcelRows([]);
      setSelectedExcelIndices(new Set());
      setSelectedStudentIds(new Set());
      setEditingStudentId(null);
      resetManualForm();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleSync = (e: any) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setStudents(e.detail);
      } else {
        setStudents(loadStudentContacts());
      }
    };
    window.addEventListener('pkbm_student_contacts_changed', handleSync);
    return () => {
      window.removeEventListener('pkbm_student_contacts_changed', handleSync);
    };
  }, []);

  const refreshData = () => {
    const loaded = loadStudentContacts();
    setStudents(loaded);
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Reset form
  const resetManualForm = () => {
    setEditingStudentId(null);
    setFormName('');
    setFormNisn('');
    setFormGrade(7);
    setFormGender('L');
    setFormPhone('');
    setFormParentName('');
    setFormParentPhone('');
    setFormGroupName('');
    setFormAddress('');
    setFormNotes('');
    setFormIsActive(true);
  };

  // Prepare edit
  const handleStartEdit = (student: StudentContact) => {
    setEditingStudentId(student.id);
    setFormName(student.name);
    setFormNisn(student.nisnOrNis || '');
    setFormGrade(student.grade);
    setFormGender(student.gender || 'L');
    setFormPhone(student.phone);
    setFormParentName(student.parentName || '');
    setFormParentPhone(student.parentPhone || '');
    setFormGroupName(student.groupName || '');
    setFormAddress(student.address || '');
    setFormNotes(student.notes || '');
    setFormIsActive(student.isActive !== false);
    setActiveTab('manual');
  };

  // Save manual form
  const handleSaveManualForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Harap masukkan nama lengkap siswa.', 'error');
      return;
    }

    const cleanPhone = formPhone.trim().replace(/[^0-9]/g, '');
    const cleanParentPhone = formParentPhone.trim().replace(/[^0-9]/g, '');

    const newOrUpdatedStudent: StudentContact = {
      id: editingStudentId || `std-custom-${Date.now()}`,
      name: formName.trim(),
      nisnOrNis: formNisn.trim() || undefined,
      grade: formGrade,
      gender: formGender,
      phone: cleanPhone,
      parentName: formParentName.trim() || undefined,
      parentPhone: cleanParentPhone || undefined,
      groupName: formGroupName.trim() || `Kelas ${formGrade}`,
      address: formAddress.trim() || undefined,
      notes: formNotes.trim() || undefined,
      isActive: formIsActive
    };

    const updated = saveSingleStudent(newOrUpdatedStudent);
    setStudents(updated);

    showToast(
      editingStudentId
        ? `Data siswa "${newOrUpdatedStudent.name}" berhasil diperbarui!`
        : `Siswa baru "${newOrUpdatedStudent.name}" berhasil ditambahkan!`,
      'success'
    );

    resetManualForm();
    setActiveTab('list');
  };

  // Toggle active status
  const handleToggleStatus = (id: string) => {
    const updated = toggleStudentStatus(id);
    setStudents(updated);
    const target = updated.find(s => s.id === id);
    showToast(
      target?.isActive !== false
        ? `Siswa "${target?.name}" diaktifkan.`
        : `Siswa "${target?.name}" disetel non-aktif.`,
      'info'
    );
  };

  // Single Delete
  const handleConfirmSingleDelete = () => {
    if (!studentToDelete) return;
    const deletedName = studentToDelete.name;
    const wasActive = studentToDelete.isActive !== false;
    const targetId = studentToDelete.id;

    const updated = deleteStudent(targetId);
    setStudents(updated);
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      next.delete(targetId);
      return next;
    });
    setStudentToDelete(null);

    const newActiveCount = updated.filter((s) => s.isActive !== false).length;
    showToast(
      `Siswa "${deletedName}" berhasil dihapus. ${
        wasActive
          ? `Jumlah siswa aktif berkurang 1 (kini ${newActiveCount} siswa aktif).`
          : `Jumlah total siswa berkurang 1 (kini ${updated.length} siswa terdaftar).`
      }`,
      'info'
    );
  };

  // Bulk Delete
  const handleConfirmBulkDelete = () => {
    const ids = Array.from(selectedStudentIds);
    if (ids.length === 0) return;

    const deletedActiveCount = students.filter(
      (s) => selectedStudentIds.has(s.id) && s.isActive !== false
    ).length;

    const updated = bulkDeleteStudents(selectedStudentIds);
    setStudents(updated);
    setSelectedStudentIds(new Set());
    setIsBulkDeleting(false);

    const newActiveCount = updated.filter((s) => s.isActive !== false).length;
    showToast(
      `Berhasil menghapus ${ids.length} siswa. Jumlah siswa aktif berkurang ${deletedActiveCount} (kini ${newActiveCount} siswa aktif).`,
      'info'
    );
  };

  // Bulk Active / Inactive
  const handleBulkStatusChange = (active: boolean) => {
    if (selectedStudentIds.size === 0) {
      // Apply to all filtered
      const targetIds = new Set(filteredStudents.map(s => s.id));
      const current = loadStudentContacts();
      const updated = current.map(s => targetIds.has(s.id) ? { ...s, isActive: active } : s);
      saveStudentContacts(updated);
      setStudents(updated);
      showToast(
        active
          ? `${filteredStudents.length} siswa telah diaktifkan!`
          : `${filteredStudents.length} siswa disetel non-aktif.`,
        'success'
      );
    } else {
      const current = loadStudentContacts();
      const updated = current.map(s => selectedStudentIds.has(s.id) ? { ...s, isActive: active } : s);
      saveStudentContacts(updated);
      setStudents(updated);
      showToast(
        active
          ? `${selectedStudentIds.size} siswa terpilih telah diaktifkan!`
          : `${selectedStudentIds.size} siswa terpilih disetel non-aktif.`,
        'success'
      );
      setSelectedStudentIds(new Set());
    }
  };

  // Filter logic
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.nisnOrNis && s.nisnOrNis.toLowerCase().includes(q)) ||
        s.phone.includes(q) ||
        (s.groupName && s.groupName.toLowerCase().includes(q)) ||
        (s.parentName && s.parentName.toLowerCase().includes(q)) ||
        (s.address && s.address.toLowerCase().includes(q));

      if (!matchQuery) return false;

      // Grade / Package Filter
      if (gradeFilter === 'paket-b' && (s.grade < 7 || s.grade > 9)) return false;
      if (gradeFilter === 'paket-c' && (s.grade < 10 || s.grade > 12)) return false;
      if (['7', '8', '9', '10', '11', '12'].includes(gradeFilter) && s.grade !== Number(gradeFilter)) return false;

      // Status filter
      if (statusFilter === 'active' && s.isActive === false) return false;
      if (statusFilter === 'inactive' && s.isActive !== false) return false;

      // Gender filter
      if (genderFilter !== 'all' && s.gender !== genderFilter) return false;

      return true;
    });
  }, [students, searchQuery, gradeFilter, statusFilter, genderFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter(s => s.isActive !== false).length;
    const paketB = students.filter(s => s.grade >= 7 && s.grade <= 9).length;
    const paketC = students.filter(s => s.grade >= 10 && s.grade <= 12).length;
    return { total, active, paketB, paketC };
  }, [students]);

  // Selection toggle
  const handleToggleSelectAllFiltered = () => {
    if (selectedStudentIds.size === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const handleToggleSelectStudent = (id: string) => {
    const next = new Set(selectedStudentIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedStudentIds(next);
  };

  // Process Excel File
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
          setUploadError('Tidak ditemukan baris data siswa pada file Excel.');
          return;
        }

        const parsed: StudentContact[] = [];

        rawJson.forEach((row, idx) => {
          // Detect Name
          const name = (
            row['Nama Siswa'] ||
            row['Nama Lengkap'] ||
            row['Peserta Didik'] ||
            row['Nama'] ||
            row['Nama Peserta Didik'] ||
            row['Student Name'] ||
            ''
          ).toString().trim();

          if (!name) return; // skip blank rows

          // Detect NISN
          const nisnOrNis = (
            row['NISN'] ||
            row['NIS'] ||
            row['No Induk'] ||
            row['NISN/NIS'] ||
            row['Nomor Induk'] ||
            ''
          ).toString().trim();

          // Detect Grade
          const rawGrade = (
            row['Kelas'] ||
            row['Tingkat'] ||
            row['Tingkat/Kelas'] ||
            row['Grade'] ||
            row['Paket'] ||
            '7'
          );
          const grade = parseStudentGrade(rawGrade);

          // Detect Gender
          const rawGender = (
            row['Jenis Kelamin'] ||
            row['JK'] ||
            row['Gender'] ||
            ''
          ).toString().trim().toUpperCase();
          const gender: 'L' | 'P' = (rawGender === 'P' || rawGender.includes('PEREMPUAN') || rawGender.includes('WANITA')) ? 'P' : 'L';

          // Detect Phone
          const phone = (
            row['Nomor HP'] ||
            row['No HP'] ||
            row['No WA'] ||
            row['WhatsApp'] ||
            row['Nomor WhatsApp'] ||
            row['Telepon'] ||
            row['Phone'] ||
            ''
          ).toString().trim().replace(/[^0-9]/g, '');

          // Detect Parent
          const parentName = (
            row['Nama Orang Tua'] ||
            row['Orang Tua'] ||
            row['Wali'] ||
            row['Nama Wali'] ||
            row['Parent'] ||
            ''
          ).toString().trim();

          const parentPhone = (
            row['HP Orang Tua'] ||
            row['No HP Wali'] ||
            row['WA Orang Tua'] ||
            row['HP Wali'] ||
            ''
          ).toString().trim().replace(/[^0-9]/g, '');

          // Detect Rombel / Group
          const groupName = (
            row['Kelompok Belajar'] ||
            row['Rombel'] ||
            row['Kelas PKBM'] ||
            row['Grup'] ||
            `Kelas ${grade}`
          ).toString().trim();

          // Detect Address
          const address = (
            row['Alamat'] ||
            row['Domisili'] ||
            row['Alamat Siswa'] ||
            ''
          ).toString().trim();

          // Detect Notes
          const notes = (
            row['Catatan'] ||
            row['Keterangan'] ||
            ''
          ).toString().trim();

          // Detect Status
          const rawStatus = (
            row['Status'] ||
            row['Status Siswa'] ||
            'Aktif'
          ).toString().toLowerCase();
          const isActive = !rawStatus.includes('non') && !rawStatus.includes('keluar') && !rawStatus.includes('tidak') && !rawStatus.includes('alumni');

          parsed.push({
            id: `std-excel-${Date.now()}-${idx}`,
            name,
            nisnOrNis: nisnOrNis || undefined,
            grade,
            gender,
            phone,
            parentName: parentName || undefined,
            parentPhone: parentPhone || undefined,
            groupName: groupName || `Kelas ${grade}`,
            address: address || undefined,
            notes: notes || undefined,
            isActive
          });
        });

        if (parsed.length === 0) {
          setUploadError('Gagal mendeteksi kolom nama siswa. Pastikan terdapat kolom "Nama Siswa" atau "Nama Lengkap".');
          return;
        }

        setParsedExcelRows(parsed);
        setSelectedExcelIndices(new Set(parsed.map((_, i) => i)));
        showToast(`Berhasil membaca ${parsed.length} baris data siswa dari file Excel!`, 'success');
      } catch (err) {
        console.error('Error reading excel file:', err);
        setUploadError('Gagal memproses file Excel. Pastikan format file valid (.xlsx, .xls, .csv).');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Apply Excel Import
  const handleApplyExcelImport = () => {
    const selectedRows = parsedExcelRows.filter((_, i) => selectedExcelIndices.has(i));
    if (selectedRows.length === 0) {
      showToast('Pilih setidaknya 1 baris siswa yang ingin diimpor.', 'error');
      return;
    }

    const updated = importStudentsBatch(selectedRows, uploadImportMode);
    setStudents(updated);

    showToast(
      uploadImportMode === 'replace'
        ? `Berhasil mengganti seluruh daftar siswa dengan ${selectedRows.length} data dari Excel!`
        : `Berhasil mengimpor dan menggabungkan ${selectedRows.length} siswa ke dalam sistem!`,
      'success'
    );

    setExcelFile(null);
    setParsedExcelRows([]);
    setSelectedExcelIndices(new Set());
    setActiveTab('list');
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'No': 1,
        'Nama Siswa': 'Ahmad Fauzi Ridwan',
        'NISN': '3081234501',
        'Kelas': 7,
        'Jenis Kelamin': 'L',
        'No WhatsApp': '081234567801',
        'Kelompok Belajar': 'Kelompok 7A Mandiri',
        'Nama Orang Tua': 'Hendra Ridwan',
        'HP Orang Tua': '081234567800',
        'Alamat': 'Jl. Melati No. 12, Bandung',
        'Status': 'Aktif',
        'Catatan': 'Peserta didik baru Paket B'
      },
      {
        'No': 2,
        'Nama Siswa': 'Siti Nurhaliza',
        'NISN': '3081234502',
        'Kelas': 7,
        'Jenis Kelamin': 'P',
        'No WhatsApp': '081345678902',
        'Kelompok Belajar': 'Kelompok 7A Mandiri',
        'Nama Orang Tua': 'Khadijah',
        'HP Orang Tua': '081345678900',
        'Alamat': 'Jl. Anggrek No. 5, Cimahi',
        'Status': 'Aktif',
        'Catatan': 'Aktif pembelajaran hybrid'
      },
      {
        'No': 3,
        'Nama Siswa': 'Muhammad Rizky Pratama',
        'NISN': '3071234501',
        'Kelas': 8,
        'Jenis Kelamin': 'L',
        'No WhatsApp': '081298765401',
        'Kelompok Belajar': 'Kelompok 8 Reguler',
        'Nama Orang Tua': 'Pratama Jaya',
        'HP Orang Tua': '081298765400',
        'Alamat': 'Jl. Cempaka No. 3, Bandung',
        'Status': 'Aktif',
        'Catatan': 'Kelas 8 Paket B'
      },
      {
        'No': 4,
        'Nama Siswa': 'Bayu Samudra',
        'NISN': '3051234501',
        'Kelas': 10,
        'Jenis Kelamin': 'L',
        'No WhatsApp': '081399887701',
        'Kelompok Belajar': 'Kelas 10 Peminatan IPA',
        'Nama Orang Tua': 'Samudra Jaya',
        'HP Orang Tua': '081399887700',
        'Alamat': 'Jl. Sukajadi No. 45, Bandung',
        'Status': 'Aktif',
        'Catatan': 'Paket C Setara SMA'
      },
      {
        'No': 5,
        'Nama Siswa': 'Cantika Dewi',
        'NISN': '3051234502',
        'Kelas': 10,
        'Jenis Kelamin': 'P',
        'No WhatsApp': '085799887702',
        'Kelompok Belajar': 'Kelas 10 Peminatan IPS',
        'Nama Orang Tua': 'Dewi Kartika',
        'HP Orang Tua': '085799887700',
        'Alamat': 'Jl. Setiabudhi No. 110, Bandung',
        'Status': 'Aktif',
        'Catatan': 'Paket C Setara SMA'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    ws['!cols'] = [
      { wch: 5 },
      { wch: 28 },
      { wch: 16 },
      { wch: 8 },
      { wch: 14 },
      { wch: 16 },
      { wch: 24 },
      { wch: 22 },
      { wch: 16 },
      { wch: 30 },
      { wch: 10 },
      { wch: 28 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Siswa');
    XLSX.writeFile(wb, 'Template_Daftar_Siswa_PKBM.xlsx');
    showToast('Template Excel berhasil diunduh. Silakan isi dan unggah kembali!', 'success');
  };

  // Export current list to Excel
  const handleExportToExcel = () => {
    const exportData = filteredStudents.map((s, idx) => {
      const pkg = getGradePackageInfo(s.grade);
      return {
        'No': idx + 1,
        'Nama Siswa': s.name,
        'NISN/NIS': s.nisnOrNis || '-',
        'Kelas': s.grade,
        'Jenjang Paket': pkg.paket,
        'Jenis Kelamin': s.gender === 'P' ? 'Perempuan' : 'Laki-laki',
        'No WhatsApp': s.phone,
        'Kelompok Belajar': s.groupName || `Kelas ${s.grade}`,
        'Nama Orang Tua/Wali': s.parentName || '-',
        'HP Orang Tua': s.parentPhone || '-',
        'Alamat': s.address || '-',
        'Status': s.isActive !== false ? 'Aktif' : 'Non-Aktif',
        'Catatan': s.notes || '-'
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = [
      { wch: 5 },
      { wch: 28 },
      { wch: 16 },
      { wch: 8 },
      { wch: 14 },
      { wch: 16 },
      { wch: 16 },
      { wch: 24 },
      { wch: 22 },
      { wch: 16 },
      { wch: 30 },
      { wch: 12 },
      { wch: 25 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Daftar Siswa');
    const filename = `Daftar_Siswa_PKBM_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
    showToast(`Berhasil mengekspor ${filteredStudents.length} data siswa ke "${filename}"!`, 'success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-md">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Daftar Siswa & Peserta Didik
                </h2>
                <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {students.length} Siswa Terdaftar • {stats.active} Aktif
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Kelola data murid PKBM & Homeschooling, unggah file Excel, atau input manual
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Notification */}
        {notification && (
          <div
            className={`px-4 py-2.5 text-xs font-semibold flex items-center justify-between border-b ${
              notification.type === 'success'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : notification.type === 'error'
                ? 'bg-red-950 text-red-300 border-red-800'
                : 'bg-sky-950 text-sky-300 border-sky-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : notification.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-sky-400 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer ml-2"
            >
              &times;
            </button>
          </div>
        )}

        {/* Tab Navigation Header */}
        <div className="px-5 pt-3 bg-slate-900 border-b border-slate-800 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'list'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>📋 Daftar Siswa ({filteredStudents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'upload'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>📤 Upload File Excel (.xlsx / .csv)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (activeTab !== 'manual') resetManualForm();
              setActiveTab('manual');
            }}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'manual'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{editingStudentId ? '✏️ Edit Siswa' : '➕ Input Manual Siswa'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">

          {/* ========================================================
              TAB 1: DAFTAR SISWA (LIST & MANAGEMENT)
             ======================================================== */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              
              {/* Summary Badges Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">Total Siswa</div>
                    <div className="text-base font-bold text-white">{stats.total} Orang</div>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">Siswa Aktif</div>
                    <div className="text-base font-bold text-emerald-400">{stats.active} Siswa</div>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">Paket B (SMP)</div>
                    <div className="text-base font-bold text-blue-400">{stats.paketB} Siswa</div>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">Paket C (SMA)</div>
                    <div className="text-base font-bold text-indigo-400">{stats.paketC} Siswa</div>
                  </div>
                </div>
              </div>

              {/* Filter & Action Toolbar */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari siswa berdasarkan nama, NISN, no WhatsApp, rombel, orang tua..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                      >
                        &times;
                      </button>
                    )}
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* Grade / Package Filter */}
                    <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                      <Filter className="w-3.5 h-3.5 text-sky-400" />
                      <select
                        value={gradeFilter}
                        onChange={(e: any) => setGradeFilter(e.target.value)}
                        className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
                      >
                        <option value="all" className="bg-slate-900">Semua Kelas & Paket</option>
                        <option value="paket-b" className="bg-slate-900">Semua Paket B (7, 8, 9)</option>
                        <option value="paket-c" className="bg-slate-900">Semua Paket C (10, 11, 12)</option>
                        <option value="7" className="bg-slate-900">Kelas 7 (Paket B)</option>
                        <option value="8" className="bg-slate-900">Kelas 8 (Paket B)</option>
                        <option value="9" className="bg-slate-900">Kelas 9 (Paket B)</option>
                        <option value="10" className="bg-slate-900">Kelas 10 (Paket C)</option>
                        <option value="11" className="bg-slate-900">Kelas 11 (Paket C)</option>
                        <option value="12" className="bg-slate-900">Kelas 12 (Paket C)</option>
                      </select>
                    </div>

                    {/* Status Filter */}
                    <select
                      value={statusFilter}
                      onChange={(e: any) => setStatusFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1.5 rounded-lg text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="all">Semua Status</option>
                      <option value="active">Hanya Siswa Aktif</option>
                      <option value="inactive">Hanya Non-Aktif</option>
                    </select>

                    {/* Gender Filter */}
                    <select
                      value={genderFilter}
                      onChange={(e: any) => setGenderFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1.5 rounded-lg text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="all">Semua Gender</option>
                      <option value="L">Laki-laki (L)</option>
                      <option value="P">Perempuan (P)</option>
                    </select>
                  </div>
                </div>

                {/* Bulk Actions & Excel Tools Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">
                      Menampilkan <strong className="text-white">{filteredStudents.length}</strong> dari {students.length} siswa
                    </span>
                    {selectedStudentIds.size > 0 && (
                      <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 font-bold border border-sky-800">
                        {selectedStudentIds.size} dipilih
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Action buttons for selected */}
                    {selectedStudentIds.size > 0 ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleBulkStatusChange(true)}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-semibold flex items-center gap-1 cursor-pointer"
                          title="Aktifkan siswa yang dipilih"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Aktifkan Terpilih</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBulkStatusChange(false)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold flex items-center gap-1 cursor-pointer border border-slate-700"
                          title="Nonaktifkan siswa yang dipilih"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Non-Aktifkan Terpilih</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsBulkDeleting(true)}
                          className="px-2.5 py-1 bg-red-700 hover:bg-red-600 text-white rounded font-semibold flex items-center gap-1 cursor-pointer"
                          title="Hapus siswa yang dipilih"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus ({selectedStudentIds.size})</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleBulkStatusChange(true)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer border border-slate-700"
                          title="Aktifkan seluruh siswa yang tampil"
                        >
                          <Check className="w-3 h-3" />
                          <span>Aktifkan Semua</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBulkStatusChange(false)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer border border-slate-700"
                          title="Nonaktifkan seluruh siswa yang tampil"
                        >
                          <Power className="w-3 h-3" />
                          <span>Non-Aktifkan Semua</span>
                        </button>
                      </>
                    )}

                    {/* Export to Excel */}
                    <button
                      type="button"
                      onClick={handleExportToExcel}
                      className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded font-semibold flex items-center gap-1 cursor-pointer shadow-xs border border-emerald-600/50"
                      title="Unduh data siswa saat ini ke file Excel"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Ekspor Excel</span>
                    </button>

                    {/* Restore / Sync Default Complete Student Phone Numbers */}
                    <button
                      type="button"
                      onClick={() => {
                        const defaults = resetToDefaultStudentContacts();
                        setStudents(defaults);
                        showToast(`Berhasil menyinkronkan seluruh ${defaults.length} kontak nomor HP siswa!`, 'success');
                      }}
                      className="px-2.5 py-1 bg-sky-800 hover:bg-sky-700 text-sky-100 rounded font-semibold flex items-center gap-1 cursor-pointer shadow-xs border border-sky-600/50"
                      title="Muat ulang seluruh 20+ kontak siswa beserta nomor HP lengkap"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-sky-300" />
                      <span>Sinkronkan No. HP Lengkap</span>
                    </button>

                    {/* Add manual shortcut */}
                    <button
                      type="button"
                      onClick={() => {
                        resetManualForm();
                        setActiveTab('manual');
                      }}
                      className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Siswa</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 select-none">
                      <tr>
                        <th className="py-2.5 px-3 w-8 text-center">
                          <input
                            type="checkbox"
                            checked={
                              filteredStudents.length > 0 &&
                              selectedStudentIds.size === filteredStudents.length
                            }
                            onChange={handleToggleSelectAllFiltered}
                            className="rounded border-slate-700 text-sky-600 focus:ring-sky-500 cursor-pointer"
                          />
                        </th>
                        <th className="py-2.5 px-3 w-10 text-center">No</th>
                        <th className="py-2.5 px-3">Nama Siswa & NISN</th>
                        <th className="py-2.5 px-3">Tingkat / Paket</th>
                        <th className="py-2.5 px-3">Rombel / Belajar</th>
                        <th className="py-2.5 px-3">WhatsApp Siswa</th>
                        <th className="py-2.5 px-3">Orang Tua / Wali</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-slate-500">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <GraduationCap className="w-8 h-8 text-slate-600" />
                              <p className="font-semibold">Tidak ada data siswa yang cocok dengan pencarian / filter.</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setSearchQuery('');
                                  setGradeFilter('all');
                                  setStatusFilter('all');
                                  setGenderFilter('all');
                                }}
                                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded text-xs mt-1 cursor-pointer"
                              >
                                Reset Filter Pencarian
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((student, idx) => {
                          const pkg = getGradePackageInfo(student.grade);
                          const isSelected = selectedStudentIds.has(student.id);

                          return (
                            <tr
                              key={student.id}
                              className={`transition-colors hover:bg-slate-900/60 ${
                                isSelected ? 'bg-sky-950/40' : ''
                              }`}
                            >
                              {/* Checkbox */}
                              <td className="py-2.5 px-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelectStudent(student.id)}
                                  className="rounded border-slate-700 text-sky-600 focus:ring-sky-500 cursor-pointer"
                                />
                              </td>

                              {/* Number */}
                              <td className="py-2.5 px-3 text-center text-slate-500 font-mono">
                                {idx + 1}
                              </td>

                              {/* Nama & NISN */}
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center shrink-0 ${
                                      student.gender === 'P'
                                        ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                    }`}
                                    title={student.gender === 'P' ? 'Perempuan' : 'Laki-laki'}
                                  >
                                    {student.gender || 'L'}
                                  </span>
                                  <span className="font-bold text-white text-xs">
                                    {student.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                                  <span>NISN: {student.nisnOrNis || '-'}</span>
                                  {student.notes && (
                                    <span className="text-slate-500 italic max-w-[180px] truncate" title={student.notes}>
                                      • {student.notes}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Grade / Package */}
                              <td className="py-2.5 px-3">
                                <div className="flex flex-col gap-0.5">
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${pkg.badgeColor} w-fit`}>
                                    {pkg.paket}
                                  </span>
                                  <span className="text-[11px] text-slate-300 font-medium">
                                    Kelas {student.grade}
                                  </span>
                                </div>
                              </td>

                              {/* Rombel */}
                              <td className="py-2.5 px-3">
                                <span className="text-xs text-slate-300">
                                  {student.groupName || '-'}
                                </span>
                              </td>

                              {/* Phone Siswa & WhatsApp Link */}
                              <td className="py-2.5 px-3">
                                <a
                                  href={`https://wa.me/62${student.phone.replace(/^0+/, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-400 hover:text-emerald-300 font-mono font-medium flex items-center gap-1 hover:underline text-[11px]"
                                  title={`Kirim WhatsApp ke ${student.name}`}
                                >
                                  <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                                  <span>{student.phone}</span>
                                </a>
                              </td>

                              {/* Orang Tua / Wali */}
                              <td className="py-2.5 px-3">
                                <div className="text-xs text-slate-300 font-medium">
                                  {student.parentName || '-'}
                                </div>
                                {student.parentPhone && (
                                  <a
                                    href={`https://wa.me/62${student.parentPhone.replace(/^0+/, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] text-slate-400 hover:text-emerald-300 font-mono flex items-center gap-1 hover:underline"
                                    title="Hubungi WhatsApp Orang Tua/Wali"
                                  >
                                    <span>WA: {student.parentPhone}</span>
                                  </a>
                                )}
                              </td>

                              {/* Status Toggle */}
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(student.id)}
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                                    student.isActive !== false
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                                      : 'bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700'
                                  }`}
                                  title="Klik untuk mengubah status aktif / non-aktif"
                                >
                                  {student.isActive !== false ? 'Aktif' : 'Non-Aktif'}
                                </button>
                              </td>

                              {/* Actions */}
                              <td className="py-2.5 px-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {/* Select for LKPD if callback provided */}
                                  {onSelectStudentForLKPD && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onSelectStudentForLKPD(student);
                                        onClose();
                                      }}
                                      className="p-1 rounded text-sky-400 hover:bg-sky-950/60 hover:text-sky-300 transition-colors cursor-pointer"
                                      title="Pilih siswa ini untuk LKPD aktif"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {/* Edit Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(student)}
                                    className="p-1 rounded text-amber-400 hover:bg-amber-950/60 hover:text-amber-300 transition-colors cursor-pointer"
                                    title="Edit data siswa"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Delete Button */}
                                  <button
                                    type="button"
                                    onClick={() => setStudentToDelete(student)}
                                    className="p-1 rounded text-red-400 hover:bg-red-950/60 hover:text-red-300 transition-colors cursor-pointer"
                                    title="Hapus siswa dari daftar"
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

          {/* ========================================================
              TAB 2: UPLOAD FILE EXCEL (.xlsx / .csv)
             ======================================================== */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              {/* Info Guide Card */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Panduan Impor Data Siswa dari File Excel
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Sistem secara otomatis mendeteksi kolom: <strong>Nama Siswa</strong>, <strong>NISN</strong>, <strong>Kelas</strong> (7-12 / Paket B / Paket C), <strong>No WhatsApp</strong>, <strong>Orang Tua</strong>, dan <strong>Rombel</strong>.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                  title="Unduh format tabel Excel yang siap diisi"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Template Excel</span>
                </button>
              </div>

              {/* Drag & Drop Upload Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const files = e.dataTransfer.files;
                  if (files && files[0]) {
                    processExcelFile(files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-emerald-400 bg-emerald-950/20'
                    : 'border-slate-700 hover:border-slate-500 bg-slate-950/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files[0]) {
                      processExcelFile(files[0]);
                    }
                  }}
                />

                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 mb-1">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    {excelFile ? `File Terpilih: ${excelFile.name}` : 'Tarik & Lepas File Excel Disini, atau Klik untuk Memilih'}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md">
                    Mendukung format <strong>.xlsx</strong>, <strong>.xls</strong>, dan <strong>.csv</strong>. File akan diproses secara lokal di peramban Anda.
                  </p>
                </div>
              </div>

              {/* Error Alert */}
              {uploadError && (
                <div className="bg-red-950 border border-red-800 text-red-300 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Preview Table if rows parsed */}
              {parsedExcelRows.length > 0 && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Pratinjau Data Siswa Hasil Pembacaan Excel ({parsedExcelRows.length} Siswa)</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {selectedExcelIndices.size} dari {parsedExcelRows.length} baris dicentang untuk diimpor.
                      </p>
                    </div>

                    {/* Import Mode Selector */}
                    <div className="flex items-center gap-2 text-xs">
                      <label className="text-slate-400 font-medium">Metode:</label>
                      <select
                        value={uploadImportMode}
                        onChange={(e: any) => setUploadImportMode(e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-slate-200 px-2.5 py-1 rounded text-xs focus:outline-none cursor-pointer"
                      >
                        <option value="merge">Gabungkan & Perbarui (Merge)</option>
                        <option value="replace">Ganti Seluruh Data (Replace All)</option>
                      </select>
                    </div>
                  </div>

                  {/* Preview Table */}
                  <div className="max-h-64 overflow-y-auto border border-slate-800 rounded-lg">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900 text-slate-400 font-semibold sticky top-0 border-b border-slate-800">
                        <tr>
                          <th className="py-2 px-2.5 w-8 text-center">
                            <input
                              type="checkbox"
                              checked={selectedExcelIndices.size === parsedExcelRows.length}
                              onChange={() => {
                                if (selectedExcelIndices.size === parsedExcelRows.length) {
                                  setSelectedExcelIndices(new Set());
                                } else {
                                  setSelectedExcelIndices(new Set(parsedExcelRows.map((_, i) => i)));
                                }
                              }}
                              className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                          </th>
                          <th className="py-2 px-2.5 w-10 text-center">No</th>
                          <th className="py-2 px-2.5">Nama Siswa</th>
                          <th className="py-2 px-2.5">NISN</th>
                          <th className="py-2 px-2.5">Kelas & Paket</th>
                          <th className="py-2 px-2.5">No WhatsApp</th>
                          <th className="py-2 px-2.5">Orang Tua/Wali</th>
                          <th className="py-2 px-2.5">Rombel</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {parsedExcelRows.map((row, idx) => {
                          const isRowSelected = selectedExcelIndices.has(idx);
                          const pkg = getGradePackageInfo(row.grade);
                          return (
                            <tr
                              key={idx}
                              className={`hover:bg-slate-900/50 ${
                                isRowSelected ? 'bg-emerald-950/20' : 'opacity-60'
                              }`}
                            >
                              <td className="py-2 px-2.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={isRowSelected}
                                  onChange={() => {
                                    const next = new Set(selectedExcelIndices);
                                    if (next.has(idx)) next.delete(idx);
                                    else next.add(idx);
                                    setSelectedExcelIndices(next);
                                  }}
                                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                />
                              </td>
                              <td className="py-2 px-2.5 text-center text-slate-500">{idx + 1}</td>
                              <td className="py-2 px-2.5 font-bold text-white">{row.name}</td>
                              <td className="py-2 px-2.5 font-mono text-slate-400">{row.nisnOrNis || '-'}</td>
                              <td className="py-2 px-2.5">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${pkg.badgeColor}`}>
                                  {pkg.fullLabel}
                                </span>
                              </td>
                              <td className="py-2 px-2.5 font-mono text-emerald-400">{row.phone}</td>
                              <td className="py-2 px-2.5 text-slate-300">{row.parentName || '-'}</td>
                              <td className="py-2 px-2.5 text-slate-400">{row.groupName}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setExcelFile(null);
                        setParsedExcelRows([]);
                        setSelectedExcelIndices(new Set());
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Batal / Reset
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyExcelImport}
                      disabled={selectedExcelIndices.size === 0}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                    >
                      <Save className="w-4 h-4" />
                      <span>Simpan & Terapkan {selectedExcelIndices.size} Data Siswa</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TAB 3: INPUT MANUAL SISWA (ADD / EDIT)
             ======================================================== */}
          {activeTab === 'manual' && (
            <form onSubmit={handleSaveManualForm} className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {editingStudentId ? '✏️ Edit Data Siswa' : '➕ Tambah Siswa Baru Secara Manual'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Lengkapi data peserta didik secara lengkap untuk mempermudah distribusi tugas & LKPD
                    </p>
                  </div>

                  {editingStudentId && (
                    <button
                      type="button"
                      onClick={resetManualForm}
                      className="text-xs text-amber-400 hover:underline cursor-pointer"
                    >
                      Beralih ke Tambah Baru
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Nama Lengkap Siswa */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Nama Lengkap Siswa <span className="text-red-400">*</span>:
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Contoh: Ahmad Fauzi Ridwan"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  {/* NISN / NIS */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      NISN / NIS (Nomor Induk):
                    </label>
                    <input
                      type="text"
                      value={formNisn}
                      onChange={(e) => setFormNisn(e.target.value)}
                      placeholder="Contoh: 3081234501"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  {/* Tingkat / Kelas & Paket */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Jenjang & Kelas <span className="text-red-400">*</span>:
                    </label>
                    <select
                      value={formGrade}
                      onChange={(e: any) => setFormGrade(Number(e.target.value) as GradeLevel)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-semibold focus:ring-1 focus:ring-sky-500 cursor-pointer"
                    >
                      <optgroup label="Paket B (Setara SMP/MTs)">
                        <option value={7}>Kelas 7 — Paket B</option>
                        <option value={8}>Kelas 8 — Paket B</option>
                        <option value={9}>Kelas 9 — Paket B</option>
                      </optgroup>
                      <optgroup label="Paket C (Setara SMA/MA)">
                        <option value={10}>Kelas 10 — Paket C</option>
                        <option value={11}>Kelas 11 — Paket C</option>
                        <option value={12}>Kelas 12 — Paket C</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* Jenis Kelamin */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Jenis Kelamin:
                    </label>
                    <div className="flex items-center gap-4 mt-2">
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                        <input
                          type="radio"
                          name="gender"
                          value="L"
                          checked={formGender === 'L'}
                          onChange={() => setFormGender('L')}
                          className="text-sky-600 focus:ring-sky-500"
                        />
                        <span>Laki-laki (L)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                        <input
                          type="radio"
                          name="gender"
                          value="P"
                          checked={formGender === 'P'}
                          onChange={() => setFormGender('P')}
                          className="text-pink-600 focus:ring-pink-500"
                        />
                        <span>Perempuan (P)</span>
                      </label>
                    </div>
                  </div>

                  {/* Nomor WhatsApp Siswa */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Nomor HP / WhatsApp Siswa <span className="text-red-400">*</span>:
                    </label>
                    <input
                      type="text"
                      required
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="Contoh: 081234567801 atau 085722271680"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono font-bold focus:ring-1 focus:ring-sky-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Nomor aktif WhatsApp untuk menerima link LKPD & konfirmasi tugas
                    </span>
                  </div>

                  {/* Kelompok Belajar / Rombel */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Kelompok Belajar / Rombel:
                    </label>
                    <input
                      type="text"
                      value={formGroupName}
                      onChange={(e) => setFormGroupName(e.target.value)}
                      placeholder="Contoh: Kelompok 7A Mandiri, Homeschooling, Reguler..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  {/* Nama Orang Tua / Wali */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Nama Orang Tua / Wali:
                    </label>
                    <input
                      type="text"
                      value={formParentName}
                      onChange={(e) => setFormParentName(e.target.value)}
                      placeholder="Contoh: Hendra Ridwan (Ayah) / Khadijah (Ibu)"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  {/* No HP Orang Tua / Wali */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Nomor WhatsApp Orang Tua / Wali:
                    </label>
                    <input
                      type="text"
                      value={formParentPhone}
                      onChange={(e) => setFormParentPhone(e.target.value)}
                      placeholder="Contoh: 081234567800"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  {/* Alamat Siswa */}
                  <div className="md:col-span-2">
                    <label className="block text-slate-300 font-bold mb-1">
                      Alamat / Domisili:
                    </label>
                    <input
                      type="text"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      placeholder="Contoh: Jl. Melati No. 12, Bandung"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  {/* Catatan Tambahan */}
                  <div className="md:col-span-2">
                    <label className="block text-slate-300 font-bold mb-1">
                      Catatan / Keterangan Tambahan:
                    </label>
                    <input
                      type="text"
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="Contoh: Siswa aktif pembelajaran mandiri / homeschooling / persiapan ujian"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  {/* Status Keaktifan */}
                  <div className="md:col-span-2 flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <div>
                      <div className="font-bold text-white text-xs">Status Siswa Aktif</div>
                      <div className="text-[11px] text-slate-400">
                        Siswa aktif akan otomatis tampil dalam pilihan tujuan kirim tugas & evaluasi
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsActive}
                        onChange={(e) => setFormIsActive(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      resetManualForm();
                      setActiveTab('list');
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingStudentId ? 'Simpan Perubahan Siswa' : 'Simpan Siswa Baru'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-sky-400" />
            <span>Daftar Siswa Terintegrasi dengan LKPD & Pengiriman WhatsApp</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>

      {/* Single Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 max-w-sm w-full text-slate-100 space-y-3 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <Trash2 className="w-5 h-5" />
              <span>Hapus Data Siswa?</span>
            </div>
            <p className="text-xs text-slate-300">
              Apakah Anda yakin ingin menghapus peserta didik <strong>"{studentToDelete.name}"</strong> (Kelas {studentToDelete.grade})? Tindakan ini akan menghapus data siswa dari sistem.
            </p>
            {studentToDelete.isActive !== false ? (
              <div className="text-[11px] p-2 bg-red-950/60 border border-red-800/80 rounded-lg text-red-200">
                ⚠️ <strong>Pengurangan Siswa Aktif:</strong> Siswa ini saat ini berstatus <strong>Aktif</strong>. Saat dihapus, jumlah siswa aktif akan berkurang dari <strong>{stats.active}</strong> menjadi <strong>{Math.max(0, stats.active - 1)}</strong>.
              </div>
            ) : (
              <div className="text-[11px] p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300">
                ℹ️ Siswa ini berstatus Non-Aktif. Jumlah total siswa terdaftar akan berkurang dari <strong>{stats.total}</strong> menjadi <strong>{Math.max(0, stats.total - 1)}</strong>.
              </div>
            )}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleDelete}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold cursor-pointer"
              >
                Ya, Hapus Siswa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleting && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 max-w-sm w-full text-slate-100 space-y-3 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <Trash2 className="w-5 h-5" />
              <span>Hapus {selectedStudentIds.size} Siswa Terpilih?</span>
            </div>
            <p className="text-xs text-slate-300">
              Apakah Anda yakin ingin menghapus sebanyak <strong>{selectedStudentIds.size} siswa</strong> yang dipilih secara massal?
            </p>
            <div className="text-[11px] p-2 bg-red-950/60 border border-red-800/80 rounded-lg text-red-200">
              ⚠️ <strong>Pengurangan Siswa Aktif:</strong> Dari {selectedStudentIds.size} siswa terpilih, terdapat{' '}
              <strong>
                {students.filter((s) => selectedStudentIds.has(s.id) && s.isActive !== false).length} siswa aktif
              </strong>
              . Jumlah siswa aktif akan langsung berkurang setelah konfirmasi.
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsBulkDeleting(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold cursor-pointer"
              >
                Ya, Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
