import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Send,
  ExternalLink,
  BookOpen,
  MessageCircle,
  FileText,
  User,
  Phone,
  Calendar,
  Layers,
  GraduationCap,
  Users,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Link,
  Award,
  PhoneCall,
  Edit3,
  Save,
  RotateCcw,
  Info
} from 'lucide-react';
import {
  SubjectModule,
  LKPDUnit,
  InstitutionSettings,
  StudentWorksheetSubmission,
  StudentContact,
  GradeLevel,
  SubjectTeacher
} from '../types';
import { DEFAULT_INSTITUTION_SETTINGS, saveInstitutionSettings } from '../data/settingsStorage';
import { loadStudentContacts, saveStudentContacts } from '../data/studentDirectory';
import { ALL_SUBJECTS } from '../data/subjectMeta';
import {
  DEFAULT_PRIMARY_PHONE,
  getTeacherForSubject,
  updateTeacherForSubject,
  loadSubjectTeachers,
  saveSubjectTeachers,
  getActiveTeachers
} from '../data/teacherDirectory';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: SubjectModule | null;
  unit: LKPDUnit | null;
  institutionSettings?: InstitutionSettings;
  submissionData?: StudentWorksheetSubmission | null;
  initialDispatchTab?: 'kirim_tugas' | 'kirim_jawaban';
  onOpenTeacherDirectory?: () => void;
  onOpenStudentDirectory?: () => void;
}

const DEFAULT_STUDENT_NAME = 'Peserta Didik';

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  module,
  unit,
  institutionSettings = DEFAULT_INSTITUTION_SETTINGS,
  submissionData = null,
  initialDispatchTab = 'kirim_tugas',
  onOpenTeacherDirectory,
  onOpenStudentDirectory,
}) => {
  // Main dispatch tab: 'kirim_tugas' (Guru -> Siswa) or 'kirim_jawaban' (Siswa -> Guru)
  const [dispatchTab, setDispatchTab] = useState<'kirim_tugas' | 'kirim_jawaban'>(initialDispatchTab);

  const primaryPhone = institutionSettings?.phone || DEFAULT_PRIMARY_PHONE;

  // Teachers Map state - synchronized with localStorage and settings events
  const [teachersMap, setTeachersMap] = useState<Record<string, SubjectTeacher>>(() => {
    return institutionSettings?.subjectTeachers && Object.keys(institutionSettings.subjectTeachers).length > 0
      ? institutionSettings.subjectTeachers
      : loadSubjectTeachers();
  });

  // Active Subject Teacher State
  const initialSubjectTeacher = useMemo(() => {
    if (!module) {
      return {
        subjectId: 'tata-boga',
        subjectName: 'Mata Pelajaran',
        teacherName: institutionSettings?.defaultTutor || 'Drs. H. Yohanes Tarmidi, M.Pd.',
        phone: primaryPhone,
        notes: 'Tutor Pengampu'
      };
    }
    return getTeacherForSubject(
      module.id,
      teachersMap,
      '',
      institutionSettings?.defaultTutor
    );
  }, [module, teachersMap, institutionSettings]);

  const [activeTeacher, setActiveTeacher] = useState<SubjectTeacher>(initialSubjectTeacher);

  // All active teachers synchronized with Daftar Guru & Tabel Pengampu
  const allActiveTeachers = useMemo(() => {
    return getActiveTeachers(teachersMap, '');
  }, [teachersMap]);

  // Official subject teacher designated for this specific module from Tabel Pengampu
  const designatedSubjectTeacher = useMemo(() => {
    if (!module) return initialSubjectTeacher;
    return getTeacherForSubject(
      module.id,
      teachersMap,
      '',
      institutionSettings?.defaultTutor
    );
  }, [module, teachersMap, institutionSettings, initialSubjectTeacher]);

  const [phoneMode, setPhoneMode] = useState<'subject_teacher' | 'primary' | 'custom'>('subject_teacher');
  const [phoneEditMessage, setPhoneEditMessage] = useState<string>('');
  const [isEditingTeacherInline, setIsEditingTeacherInline] = useState<boolean>(false);

  // Mode 1: Kirim Tugas & Soal state (Target penerima adalah siswa)
  const [studentName, setStudentName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [deadline, setDeadline] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>(
    'Kerjakan lembar kerja soal ini secara mandiri atau melalui link interaktif. Kirimkan lembar jawaban atau konfirmasi pengerjaan ke nomor ini.'
  );

  // Student directory & search states
  const [contacts, setContacts] = useState<StudentContact[]>([]);
  const [contactSearchQuery, setContactSearchQuery] = useState<string>('');
  const [isContactDropdownOpen, setIsContactDropdownOpen] = useState<boolean>(false);
  const [selectedContact, setSelectedContact] = useState<StudentContact | null>(null);
  const [isAddingNewContact, setIsAddingNewContact] = useState<boolean>(false);

  // New contact form state
  const [newContactName, setNewContactName] = useState<string>('');
  const [newContactPhone, setNewContactPhone] = useState<string>('');
  const [newContactParent, setNewContactParent] = useState<string>('');
  const [newContactGroup, setNewContactGroup] = useState<string>('');
  const [newContactGrade, setNewContactGrade] = useState<GradeLevel>(module?.grade || 7);

  // Filter contacts by grade tab
  const [contactGradeFilter, setContactGradeFilter] = useState<'all' | 'current' | GradeLevel>('all');

  // Customization checkboxes for what to include in the WhatsApp task message
  const [includeMateriSummary, setIncludeMateriSummary] = useState<boolean>(true);
  const [includeInstructions, setIncludeInstructions] = useState<boolean>(true);
  const [includeActivity1, setIncludeActivity1] = useState<boolean>(true);
  const [includeActivity2, setIncludeActivity2] = useState<boolean>(true);
  const [includeActivity3, setIncludeActivity3] = useState<boolean>(true);
  const [includeEvaluasi, setIncludeEvaluasi] = useState<boolean>(true);
  const [includeRefleksi, setIncludeRefleksi] = useState<boolean>(true);
  const [includeDirectLink, setIncludeDirectLink] = useState<boolean>(true);
  const [shareMode, setShareMode] = useState<'lengkap' | 'soal_evaluasi' | 'tugas_praktik' | 'ringkas'>('lengkap');

  // Mode 2: Kirim Jawaban Siswa state
  const [subStudentName, setSubStudentName] = useState<string>(submissionData?.studentName || DEFAULT_STUDENT_NAME);
  const [subStudentId, setSubStudentId] = useState<string>(submissionData?.studentId || 'BM-2026-001');
  const [subTutorPhone, setSubTutorPhone] = useState<string>(initialSubjectTeacher.phone);
  const [subTutorName, setSubTutorName] = useState<string>(initialSubjectTeacher.teacherName);
  const [subStudentNotes, setSubStudentNotes] = useState<string>(
    'Tugas LKPD telah selesai saya kerjakan secara mandiri. Mohon koreksi dan bimbingan dari Bapak/Ibu Tutor.'
  );
  const [loadedSubmission, setLoadedSubmission] = useState<StudentWorksheetSubmission | null>(submissionData);

  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync state when opened
  useEffect(() => {
    if (isOpen) {
      setDispatchTab(initialDispatchTab);
      setCopiedText(false);
      setCopiedLink(false);
      setPhoneEditMessage('');
      setIsEditingTeacherInline(false);

      const latestTeachers = loadSubjectTeachers();
      if (latestTeachers && Object.keys(latestTeachers).length > 0) {
        setTeachersMap(latestTeachers);
      }

      const loaded = loadStudentContacts();
      setContacts(loaded);

      if (module) {
        setNewContactGrade(module.grade);
        const t = getTeacherForSubject(
          module.id,
          latestTeachers,
          '',
          institutionSettings?.defaultTutor
        );
        setActiveTeacher(t);
        setSubTutorName(t.teacherName);
        setSubTutorPhone(t.phone);

        // Default target phone to student contact that exists in the student directory
        const matchingStudent = loaded.find(c => c.grade === module.grade && c.isActive !== false)
          || loaded.find(c => c.isActive !== false)
          || loaded[0];

        if (matchingStudent) {
          setSelectedContact(matchingStudent);
          setStudentName(matchingStudent.name);
          setPhoneNumber(matchingStudent.phone || '');
        } else {
          setSelectedContact(null);
          setStudentName('');
          setPhoneNumber('');
        }
        setPhoneMode('custom');
      }

      if (!studentName && (!loaded || loaded.length === 0)) {
        setStudentName('');
      }

      // Check if submission data exists in props or local storage
      if (submissionData) {
        setLoadedSubmission(submissionData);
        setSubStudentName(submissionData.studentName || DEFAULT_STUDENT_NAME);
        setSubStudentId(submissionData.studentId || 'BM-2026-001');
      } else if (module && unit) {
        const storageKey = `submission_${module.grade}_${module.id}_unit_${unit.unitNumber}`;
        try {
          const saved = localStorage.getItem(storageKey);
          if (saved) {
            const parsed: StudentWorksheetSubmission = JSON.parse(saved);
            setLoadedSubmission(parsed);
            if (parsed.studentName) setSubStudentName(parsed.studentName);
            if (parsed.studentId) setSubStudentId(parsed.studentId);
          }
        } catch (e) {
          console.warn('Could not read local submission', e);
        }
      }
    }
  }, [isOpen, module, unit, initialDispatchTab, submissionData, institutionSettings, primaryPhone]);

  // Listen to directory teacher updates from TeacherManagementModal or settings
  useEffect(() => {
    const handleTeacherDirectorySync = (e: any) => {
      const updated = e?.detail && typeof e.detail === 'object' ? e.detail : loadSubjectTeachers();
      setTeachersMap(updated);
      if (module) {
        const latestDesignated = getTeacherForSubject(
          module.id,
          updated,
          '',
          institutionSettings?.defaultTutor
        );
        setActiveTeacher(prev => {
          if (prev.subjectId === latestDesignated.subjectId) {
            return latestDesignated;
          }
          return prev;
        });
        setSubTutorName(prev => {
          if (prev === activeTeacher.teacherName) {
            return latestDesignated.teacherName;
          }
          return prev;
        });
        setSubTutorPhone(prev => {
          if (prev === activeTeacher.phone) {
            return latestDesignated.phone;
          }
          return prev;
        });
      }
    };

    window.addEventListener('pkbm_subject_teachers_changed', handleTeacherDirectorySync);
    window.addEventListener('pkbm_institution_settings_changed', handleTeacherDirectorySync);
    return () => {
      window.removeEventListener('pkbm_subject_teachers_changed', handleTeacherDirectorySync);
      window.removeEventListener('pkbm_institution_settings_changed', handleTeacherDirectorySync);
    };
  }, [module, primaryPhone, institutionSettings, activeTeacher]);

  // Synchronized selected value for teacher dropdowns in both tabs
  const currentTeacherDropdownValue = useMemo(() => {
    const targetPhone = dispatchTab === 'kirim_jawaban' ? subTutorPhone : (phoneMode === 'primary' ? primaryPhone : activeTeacher.phone);
    const targetName = dispatchTab === 'kirim_jawaban' ? subTutorName : activeTeacher.teacherName;

    if (phoneMode === 'primary' || (targetPhone === primaryPhone && targetName === (institutionSettings?.headName || 'Drs. H. Yohanes Tarmidi, M.Pd.'))) {
      return 'primary_institution';
    }
    if (designatedSubjectTeacher && targetName === designatedSubjectTeacher.teacherName && targetPhone === designatedSubjectTeacher.phone) {
      return `subject_${designatedSubjectTeacher.subjectId}`;
    }
    const matchTeacher = allActiveTeachers.find(t => t.teacherName === targetName && t.phone === targetPhone);
    if (matchTeacher) {
      return `teacher_${matchTeacher.subjectId}`;
    }
    const matchBySub = allActiveTeachers.find(t => t.subjectId === activeTeacher.subjectId);
    if (matchBySub) {
      return `teacher_${matchBySub.subjectId}`;
    }
    return `subject_${designatedSubjectTeacher?.subjectId || 'default'}`;
  }, [dispatchTab, subTutorPhone, subTutorName, phoneMode, primaryPhone, activeTeacher, designatedSubjectTeacher, allActiveTeachers, institutionSettings]);

  // Teacher selection handler synchronized across tabs
  const handleTeacherSelectionChange = (val: string) => {
    if (val === 'primary_institution') {
      const headName = institutionSettings?.headName || 'Drs. H. Yohanes Tarmidi, M.Pd.';
      setActiveTeacher({
        subjectId: 'primary_head',
        subjectName: 'Kepala Lembaga',
        teacherName: headName,
        phone: primaryPhone,
        notes: 'Kontak Utama Lembaga'
      });
      setSubTutorName(headName);
      setSubTutorPhone(primaryPhone);
      setPhoneMode('primary');
      setPhoneEditMessage(`Guru pengirim dialihkan ke Kontak Lembaga: ${headName} (${primaryPhone})`);
      setTimeout(() => setPhoneEditMessage(''), 2500);
      return;
    }

    if (val === 'designated_subject_teacher' || val.startsWith('subject_')) {
      handleSelectSubjectTeacher(designatedSubjectTeacher);
      return;
    }

    if (val.startsWith('teacher_')) {
      const subId = val.replace('teacher_', '');
      const found = allActiveTeachers.find(t => t.subjectId === subId);
      if (found) {
        handleSelectSubjectTeacher(found);
      }
      return;
    }

    const foundDirect = allActiveTeachers.find(t => t.subjectId === val);
    if (foundDirect) {
      handleSelectSubjectTeacher(foundDirect);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsContactDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen to directory student updates
  useEffect(() => {
    const handleSync = (e: any) => {
      const updated = e?.detail && Array.isArray(e.detail) ? e.detail : loadStudentContacts();
      setContacts(updated);
      setSelectedContact((prev) => {
        if (!prev) return null;
        const stillExists = updated.find((c: any) => c.id === prev.id);
        return stillExists || null;
      });
    };
    window.addEventListener('pkbm_student_contacts_changed', handleSync);
    return () => {
      window.removeEventListener('pkbm_student_contacts_changed', handleSync);
    };
  }, []);

  // Filtered contacts based on search query and grade
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const q = contactSearchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.nisnOrNis && c.nisnOrNis.toLowerCase().includes(q)) ||
        (c.parentName && c.parentName.toLowerCase().includes(q)) ||
        (c.groupName && c.groupName.toLowerCase().includes(q));

      if (!matchQuery) return false;

      if (contactGradeFilter === 'all') return true;
      if (contactGradeFilter === 'current') return module ? c.grade === module.grade : true;
      return c.grade === contactGradeFilter;
    });
  }, [contacts, contactSearchQuery, contactGradeFilter, module]);

  if (!isOpen || !module || !unit) return null;

  // Extract clean subject identifier
  const subjectSlug = module.id.split('-').slice(2).join('-') || module.id;

  // Direct link targeted strictly at student worksheet mode for this specific unit
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const studentQuery = studentName.trim() ? `&nama=${encodeURIComponent(studentName.trim())}` : '';
  const directLink = `${origin}${pathname}?mode=siswa&grade=${module.grade}&subject=${encodeURIComponent(subjectSlug)}&unit=${unit.unitNumber}${studentQuery}`;

  // Format Indonesian phone number to international WhatsApp format (e.g. 085722271680 -> 6285722271680)
  const formatPhoneNumber = (num: string) => {
    let cleaned = num.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    } else if (cleaned.startsWith('8')) {
      cleaned = '62' + cleaned;
    }
    return cleaned;
  };

  const isSMP = module.grade <= 9;
  const programLabel = isSMP
    ? `Paket B (Setara SMP Kelas ${module.grade})`
    : `Paket C (Setara SMA Kelas ${module.grade})`;

  // Switch to Subject Teacher Phone
  const handleSelectSubjectTeacher = (teacher: SubjectTeacher) => {
    setActiveTeacher(teacher);
    setSubTutorName(teacher.teacherName);
    setSubTutorPhone(teacher.phone);
    setPhoneMode('subject_teacher');
    setPhoneEditMessage(`Guru pengampu dialihkan ke: ${teacher.teacherName} (${teacher.phone})`);
    setTimeout(() => setPhoneEditMessage(''), 2500);
  };

  // Switch to Primary Phone
  const handleSelectPrimaryPhone = () => {
    setActiveTeacher({
      subjectId: 'primary_head',
      subjectName: 'Kepala Lembaga',
      teacherName: institutionSettings.headName || 'Drs. H. Yohanes Tarmidi, M.Pd.',
      phone: primaryPhone,
      notes: 'Kontak Utama Lembaga'
    });
    setSubTutorName(institutionSettings.headName || 'Drs. H. Yohanes Tarmidi, M.Pd.');
    setSubTutorPhone(primaryPhone);
    setPhoneMode('primary');
    setPhoneEditMessage(`Guru pengampu dialihkan ke HP Utama Lembaga (${primaryPhone})`);
    setTimeout(() => setPhoneEditMessage(''), 2500);
  };

  // Save current phone as the Subject Teacher's phone
  const handleSaveAsSubjectTeacherPhone = () => {
    if (!module) return;
    const currentNum = dispatchTab === 'kirim_tugas' ? phoneNumber : subTutorPhone;
    const currentName = dispatchTab === 'kirim_tugas' ? activeTeacher.teacherName : subTutorName;

    const updated = updateTeacherForSubject(module.id, {
      teacherName: currentName,
      phone: currentNum
    });

    const key = activeTeacher.subjectId;
    if (updated[key]) {
      setActiveTeacher(updated[key]);
    }
    setPhoneEditMessage(`Berhasil menyimpan ${currentNum} sebagai nomor HP Guru ${module.name}!`);
    setTimeout(() => setPhoneEditMessage(''), 3000);
  };

  // Save current phone as Primary Institution phone
  const handleSaveAsPrimaryPhone = () => {
    const currentNum = dispatchTab === 'kirim_tugas' ? phoneNumber : subTutorPhone;
    const newSettings: InstitutionSettings = {
      ...institutionSettings,
      phone: currentNum
    };
    saveInstitutionSettings(newSettings);
    setPhoneEditMessage(`Berhasil memperbarui Nomor HP Utama Lembaga menjadi ${currentNum}!`);
    setTimeout(() => setPhoneEditMessage(''), 3000);
  };

  // Handle select contact from directory
  const handleSelectContact = (contact: StudentContact) => {
    setSelectedContact(contact);
    setStudentName(contact.name);
    setPhoneNumber(contact.phone || '');
    setIsContactDropdownOpen(false);
    setContactSearchQuery('');
    setPhoneEditMessage(`Target penerima disesuaikan: ${contact.name} (${contact.phone || 'tanpa nomor WA'})`);
    setTimeout(() => setPhoneEditMessage(''), 2500);
  };

  // Handle saving/adjusting the student's phone number directly to the student directory
  const handleSavePhoneToSelectedStudent = () => {
    if (!selectedContact) {
      setPhoneEditMessage('Pilih siswa dari daftar terlebih dahulu untuk menyimpan nomor HP ke data siswa.');
      setTimeout(() => setPhoneEditMessage(''), 3000);
      return;
    }
    const cleanNum = phoneNumber.trim().replace(/[^0-9]/g, '');
    if (!cleanNum) {
      setPhoneEditMessage('Nomor HP siswa tidak boleh kosong.');
      setTimeout(() => setPhoneEditMessage(''), 3000);
      return;
    }

    const updatedContact: StudentContact = {
      ...selectedContact,
      name: studentName.trim() || selectedContact.name,
      phone: cleanNum,
    };

    const updatedList = contacts.map((c) => (c.id === selectedContact.id ? updatedContact : c));
    setContacts(updatedList);
    saveStudentContacts(updatedList);
    setSelectedContact(updatedContact);
    setPhoneNumber(cleanNum);
    setPhoneEditMessage(`Nomor HP siswa "${updatedContact.name}" berhasil disesuaikan menjadi ${cleanNum} di Daftar Siswa!`);
    setTimeout(() => setPhoneEditMessage(''), 3500);
  };

  // Handle add new contact
  const handleSaveNewContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const newContact: StudentContact = {
      id: `std-custom-${Date.now()}`,
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      grade: newContactGrade,
      parentName: newContactParent.trim() || undefined,
      groupName: newContactGroup.trim() || undefined,
    };

    const updated = [newContact, ...contacts];
    setContacts(updated);
    saveStudentContacts(updated);

    handleSelectContact(newContact);
    setIsAddingNewContact(false);
    setNewContactName('');
    setNewContactPhone('');
    setNewContactParent('');
    setNewContactGroup('');
  };

  // Handle delete contact
  const handleDeleteContact = (contactId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = contacts.filter((c) => c.id !== contactId);
    setContacts(updated);
    saveStudentContacts(updated);
    if (selectedContact?.id === contactId) {
      setSelectedContact(null);
    }
  };

  // Handle template preset change
  const handlePresetChange = (mode: 'lengkap' | 'soal_evaluasi' | 'tugas_praktik' | 'ringkas') => {
    setShareMode(mode);
    if (mode === 'lengkap') {
      setIncludeMateriSummary(true);
      setIncludeInstructions(true);
      setIncludeActivity1(true);
      setIncludeActivity2(true);
      setIncludeActivity3(true);
      setIncludeEvaluasi(true);
      setIncludeRefleksi(true);
      setIncludeDirectLink(true);
    } else if (mode === 'soal_evaluasi') {
      setIncludeMateriSummary(false);
      setIncludeInstructions(true);
      setIncludeActivity1(true);
      setIncludeActivity2(false);
      setIncludeActivity3(false);
      setIncludeEvaluasi(true);
      setIncludeRefleksi(false);
      setIncludeDirectLink(true);
    } else if (mode === 'tugas_praktik') {
      setIncludeMateriSummary(true);
      setIncludeInstructions(true);
      setIncludeActivity1(false);
      setIncludeActivity2(true);
      setIncludeActivity3(true);
      setIncludeEvaluasi(false);
      setIncludeRefleksi(true);
      setIncludeDirectLink(true);
    } else if (mode === 'ringkas') {
      setIncludeMateriSummary(false);
      setIncludeInstructions(true);
      setIncludeActivity1(false);
      setIncludeActivity2(false);
      setIncludeActivity3(false);
      setIncludeEvaluasi(false);
      setIncludeRefleksi(false);
      setIncludeDirectLink(true);
    }
  };

  // 1. Compile Penugasan Guru -> Siswa (Naskah LKPD Soal & Perintah Pengerjaan)
  const generateTaskMessage = () => {
    const studentDisplayName = studentName.trim() || 'Peserta Didik';
    const greeting = `Halo Siswa Homeschooling *${studentDisplayName}* 👋`;
    const deadlineText = deadline.trim() ? `\n⏰ *Batas Waktu Pengumpulan:* ${deadline.trim()}` : '';
    const noteText = customNote.trim() ? `\n📌 *Instruksi Tambahan Tutor:* \n_${customNote.trim()}_\n` : '';

    const activeTutorDisplay = activeTeacher.teacherName || institutionSettings.headName || 'Drs. H. Yohanes Tarmidi, M.Pd.';
    const activePhoneDisplay = activeTeacher.phone || primaryPhone;

    let content = `*LEMBAR KERJA PESERTA DIDIK (LKPD)*
*NASKAH SOAL & PERINTAH PENGERJAAN TUGAS*
*${(institutionSettings?.name || 'PKBM BUANA MEKAR').toUpperCase()}*
━━━━━━━━━━━━━━━━━━━━━━━━━━
${greeting}

Berikut naskah soal dan petunjuk pengerjaan tugas mandiri untuk:
📚 *Mata Pelajaran:* ${module.name}
🎓 *Jenjang Program:* ${programLabel}
📑 *Unit ${unit.unitNumber}:* ${unit.topic}
🎯 *Capaian Pembelajaran (CP):* _${unit.capaianPembelajaran}_${deadlineText}
`;

    // Perintah & Petunjuk Pengerjaan
    if (includeInstructions && unit.homeschoolingInstructions && unit.homeschoolingInstructions.length > 0) {
      content += `\n📋 *PETUNJUK & PERINTAH PENGERJAAN:*`;
      unit.homeschoolingInstructions.forEach((inst, i) => {
        content += `\n${i + 1}. ${inst}`;
      });
      content += `\n`;
    }

    // Rangkuman Materi Pembelajaran
    if (includeMateriSummary && unit.materiSummary) {
      content += `\n📖 *RANGKUMAN MATERI PEMBELAJARAN:*`;
      content += `\n*Materi Pokok:* ${unit.materiSummary.title}`;
      if (unit.materiSummary.points && unit.materiSummary.points.length > 0) {
        unit.materiSummary.points.forEach((pt) => {
          content += `\n• ${pt}`;
        });
      }
      content += `\n`;
    }

    // Aktivitas 1: Soal Pemahaman Konsep
    if (includeActivity1 && unit.activity1Pemahaman) {
      content += `\n📝 *BAGIAN 1: SOAL PEMAHAMAN KONSEP (${unit.activity1Pemahaman.questions.length} Butir Soal)*`;
      if (unit.activity1Pemahaman.instruction) {
        content += `\n_Petunjuk: ${unit.activity1Pemahaman.instruction}_\n`;
      }
      unit.activity1Pemahaman.questions.forEach((q, idx) => {
        content += `\n*Soal 1.${idx + 1} (${q.points} Poin)*`;
        content += `\n${q.question}`;
        if (q.options && q.options.length > 0) {
          q.options.forEach((opt, oIdx) => {
            const optLabel = String.fromCharCode(65 + oIdx);
            content += `\n   ${optLabel}. ${opt}`;
          });
        }
      });
      content += `\n`;
    }

    // Aktivitas 2: Kasus Penerapan
    if (includeActivity2 && unit.activity2Penerapan) {
      content += `\n🔍 *BAGIAN 2: TUGAS ANALISIS KASUS & PENERAPAN KONTEKSTUAL*`;
      content += `\n*Topik Kasus:* ${unit.activity2Penerapan.title}`;
      content += `\n*Konteks Masalah:* ${unit.activity2Penerapan.contextDescription}`;
      content += `\n*Instruksi Tugas:* ${unit.activity2Penerapan.taskInstruction}`;
      if (unit.activity2Penerapan.guidingQuestions && unit.activity2Penerapan.guidingQuestions.length > 0) {
        content += `\n*Pertanyaan Panduan Analisis:*`;
        unit.activity2Penerapan.guidingQuestions.forEach((gq, i) => {
          content += `\n   ${i + 1}. ${gq}`;
        });
      }
      content += `\n`;
    }

    // Aktivitas 3: Tugas Praktik Proyek
    if (includeActivity3 && unit.activity3ProyekPraktik) {
      const p = unit.activity3ProyekPraktik;
      content += `\n🛠️ *BAGIAN 3: TUGAS PROYEK & PRAKTIK HOMESCHOOLING*`;
      content += `\n*Judul Proyek:* ${p.title}`;
      content += `\n*Tujuan Kegiatan:* ${p.objective}`;
      if (p.toolsAndMaterials && p.toolsAndMaterials.length > 0) {
        content += `\n*Alat & Bahan:* ${p.toolsAndMaterials.join(', ')}`;
      }
      if (p.steps && p.steps.length > 0) {
        content += `\n*Langkah Pengerjaan Praktik:*`;
        p.steps.forEach((st, sIdx) => {
          content += `\n   ${sIdx + 1}. ${st}`;
        });
      }
      content += `\n*Hasil / Output yang Diserahkan:* ${p.expectedOutput} (Bukti: ${p.evidenceType.toUpperCase()})`;
      if (p.safetyNotes) {
        content += `\n*Catatan Keselamatan / Bimbingan:* _${p.safetyNotes}_`;
      }
      content += `\n`;
    }

    // Soal Evaluasi
    if (includeEvaluasi && unit.soalEvaluasi && unit.soalEvaluasi.length > 0) {
      content += `\n✍️ *BAGIAN 4: SOAL EVALUASI MANDIRI (${unit.soalEvaluasi.length} Butir Soal)*`;
      unit.soalEvaluasi.forEach((q, idx) => {
        content += `\n\n*${idx + 1}. [${q.type === 'multiple-choice' ? 'Pilihan Ganda' : 'Esai'}] (${q.points} Poin)*`;
        content += `\n${q.question}`;
        if (q.options && q.options.length > 0) {
          q.options.forEach((opt, oIdx) => {
            const optLabel = String.fromCharCode(65 + oIdx);
            content += `\n   ${optLabel}. ${opt}`;
          });
        }
      });
      content += `\n`;
    }

    // Refleksi Diri
    if (includeRefleksi && unit.refleksiPesertaDidik && unit.refleksiPesertaDidik.length > 0) {
      content += `\n💭 *BAGIAN 5: LEMBAR REFLEKSI DIRI SISWA*`;
      unit.refleksiPesertaDidik.forEach((ref, idx) => {
        content += `\n${idx + 1}. ${ref}`;
      });
      content += `\n`;
    }

    content += noteText;

    // Petunjuk Pengumpulan Jawaban
    content += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 *PETUNJUK PENGUMPULAN JAWABAN TUGAS:*
1. Kerjakan di buku tulis/kertas lembar kerja, lalu foto dan kirim ke WhatsApp Tutor.
2. Atau ketikkan langsung jawaban Anda melalui pesan WhatsApp ke:
   👤 *Tutor Pengampu:* ${activeTutorDisplay}
   📱 *WhatsApp Tutor:* ${activePhoneDisplay}
`;

    // Direct Link strictly for student worksheet document (no dashboard access)
    if (includeDirectLink) {
      content += `\n🌐 *Tautan Dokumen Soal LKPD Siswa (Khusus Penugasan):*
${directLink}
_(Klik tautan di atas untuk membuka naskah lembar penugasan dan menjawab soal secara langsung tanpa akses dashboard admin)_
`;
    }

    content += `━━━━━━━━━━━━━━━━━━━━━━━━━━
_${institutionSettings?.name || 'PKBM Buana Mekar'} • ${institutionSettings?.tagline || 'Pendidikan Kesetaraan & Homeschooling'}_`;
    return content;
  };

  // 2. Compile Pengiriman Lembar Jawaban Siswa -> Tutor
  const generateSubmissionMessage = () => {
    const sName = subStudentName.trim() || 'Peserta Didik Mandiri';
    const sId = subStudentId.trim() || 'BM-2026-001';
    const todayStr = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let content = `*LEMBAR PENGIRIMAN JAWABAN TUGAS SISWA*
*${(institutionSettings?.name || 'PKBM BUANA MEKAR').toUpperCase()}*
━━━━━━━━━━━━━━━━━━━━━━━━━━
Kepada Yth. Tutor Pengampu:
👤 *Bapak/Ibu Tutor:* ${subTutorName} (${subTutorPhone})
🏛️ *Lembaga:* ${institutionSettings?.name || 'PKBM Buana Mekar'}

Saya yang bertanda tangan di bawah ini:
👤 *Nama Siswa:* *${sName}*
🆔 *NISN / No Induk:* ${sId}
🎓 *Jenjang Program:* ${programLabel}
📚 *Mata Pelajaran:* ${module.name}
📑 *Unit ${unit.unitNumber}:* ${unit.topic}
📅 *Tanggal Pengiriman:* ${todayStr}

━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 *RINGKASAN JAWABAN & HASIL PENGERJAAN:*

`;

    // Jawaban Aktivitas 1
    content += `*A. JAWABAN AKTIVITAS 1 (PEMAHAMAN KONSEP):*\n`;
    unit.activity1Pemahaman.questions.forEach((q, idx) => {
      const ans = loadedSubmission?.answers?.[q.id] || '(Sudah dikerjakan di lembar manual/buku tugas)';
      content += `*Soal 1.${idx + 1}:* ${q.question.slice(0, 70)}...\n👉 *Jawaban:* ${ans}\n\n`;
    });

    // Jawaban Aktivitas 2
    content += `*B. JAWABAN AKTIVITAS 2 (ANALISIS STUDI KASUS):*\n`;
    content += `*Kasus:* ${unit.activity2Penerapan.title}\n`;
    content += `👉 *Hasil Analisis & Solusi Siswa:*\n${loadedSubmission?.activity2Response || '(Tercantum pada laporan tugas terlampir)'}\n\n`;

    // Jawaban Aktivitas 3
    content += `*C. HASIL AKTIVITAS 3 (PROYEK / PRAKTIK NYATA):*\n`;
    content += `*Judul Proyek:* ${unit.activity3ProyekPraktik.title}\n`;
    content += `👉 *Deskripsi Karya / Catatan Siswa:*\n${loadedSubmission?.activity3ResultNote || '(Hasil karya fisik/foto siap dikirimkan)'}\n\n`;

    // Jawaban Soal Evaluasi
    content += `*D. LEMBAR JAWABAN EVALUASI (${unit.soalEvaluasi.length} Butir Soal):*\n`;
    unit.soalEvaluasi.forEach((q, idx) => {
      const userAns = loadedSubmission?.answers?.[q.id] || '-';
      content += `*${idx + 1}.* [${q.type === 'multiple-choice' ? 'PG' : 'Esai'}] ➡️ *Jawaban:* ${userAns}\n`;
    });
    content += `\n`;

    // Refleksi Siswa
    if (loadedSubmission?.reflectionResponses && Object.keys(loadedSubmission.reflectionResponses).length > 0) {
      content += `*E. REFLEKSI DIRI SISWA:*\n`;
      unit.refleksiPesertaDidik.forEach((ref, idx) => {
        const val = loadedSubmission.reflectionResponses[idx];
        if (val) {
          content += `• _${ref}_: ${val}\n`;
        }
      });
      content += `\n`;
    }

    if (subStudentNotes.trim()) {
      content += `💬 *Catatan dari Siswa / Orang Tua:*\n"${subStudentNotes.trim()}"\n\n`;
    }

    content += `━━━━━━━━━━━━━━━━━━━━━━━━━━
_Demikian lembar jawaban tugas LKPD ini saya serahkan untuk dinilai oleh Guru ${module.name} (${subTutorName})._
🔗 Link Lembar Soal: ${directLink}`;

    return content;
  };

  const messageText = dispatchTab === 'kirim_tugas' ? generateTaskMessage() : generateSubmissionMessage();
  const currentTargetPhone = dispatchTab === 'kirim_tugas' ? phoneNumber : subTutorPhone;
  const targetPhone = formatPhoneNumber(currentTargetPhone);

  // URLs for WhatsApp dispatch
  const waUniversalUrl = targetPhone
    ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(messageText)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;

  const waWebDirectUrl = targetPhone
    ? `https://web.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(messageText)}`
    : `https://web.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(directLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendUniversal = () => {
    window.open(waUniversalUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSendWeb = () => {
    window.open(waWebDirectUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl border border-slate-300 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b-2 border-emerald-900 flex items-center justify-between bg-emerald-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-white text-emerald-900 flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              <Share2 className="w-5 h-5 text-emerald-900" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2 flex-wrap">
                <span>Distribusi & Pengiriman WhatsApp LKPD</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded">
                  {module.name} • Unit {unit.unitNumber}
                </span>
              </h3>
              <p className="text-[11px] text-emerald-200">
                Distribusi LKPD disesuaikan dengan nomor HP siswa dari daftar siswa &amp; koordinasi dengan guru pengampu mapel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dispatch Mode Selector Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100 px-4 pt-2 gap-2 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setDispatchTab('kirim_tugas')}
            className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              dispatchTab === 'kirim_tugas'
                ? 'border-emerald-700 text-emerald-900 font-bold bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-emerald-700" />
            <span>1. Kirim Naskah Soal & Tugas ke Siswa / Grup</span>
          </button>

          <button
            type="button"
            onClick={() => setDispatchTab('kirim_jawaban')}
            className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              dispatchTab === 'kirim_jawaban'
                ? 'border-blue-700 text-blue-900 font-bold bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
            <span>2. Kirim Lembar Jawaban Siswa ke Tutor / Guru Mapel</span>
            <span className="ml-1 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full text-[10px]">
              Tutor: {activeTeacher.teacherName}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs text-slate-800">
          {/* Status Message Notification */}
          {phoneEditMessage && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-2.5 rounded-lg flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold text-xs">{phoneEditMessage}</span>
            </div>
          )}

          {/* Teacher & Phone Quick-Switch Toolbar (User requested: Memilih dan tersingkronkan aktif untuk mengirimkan lkpd) */}
          <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs text-slate-100">
                  Sinkronisasi Guru Pengampu Aktif Pengirim LKPD:
                </span>
              </div>
              <div className="flex items-center gap-2">
                {onOpenTeacherDirectory && (
                  <button
                    type="button"
                    onClick={onOpenTeacherDirectory}
                    className="text-[10px] text-emerald-300 hover:text-white font-bold bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded border border-emerald-500/40 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Buka Menu Daftar Guru Lengkap (Upload Excel / Input Manual)"
                  >
                    <Users className="w-3 h-3" />
                    <span>Menu Daftar Guru (Excel & Manual)</span>
                  </button>
                )}
                <span className="text-[10px] text-slate-400 font-mono">
                  Mapel: <strong className="text-emerald-300">{module.name}</strong>
                </span>
              </div>
            </div>

            {/* Dropdown: Pilih Guru Pengampu Aktif yang Tersinkronkan */}
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <label className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pilih dari Daftar Guru & Tabel Pengampu:</span>
                </label>
                <span className="text-[10px] text-slate-400">
                  {allActiveTeachers.length} Guru Aktif di Tabel Pengampu
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={currentTeacherDropdownValue}
                  onChange={(e) => handleTeacherSelectionChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-medium focus:ring-1 focus:ring-emerald-400 cursor-pointer"
                >
                  <optgroup label="⭐ Guru Pengampu Mata Pelajaran Ini (Tabel Pengampu)">
                    <option value={`subject_${designatedSubjectTeacher.subjectId}`}>
                      ⭐ {designatedSubjectTeacher.teacherName} — Tutor {module.name} ({designatedSubjectTeacher.phone}) [Pengampu Resmi]
                    </option>
                  </optgroup>
                  <optgroup label="👥 Seluruh Guru Pengampu Aktif (Daftar Guru & Tabel Pengampu)">
                    {allActiveTeachers.map(t => (
                      <option key={t.subjectId} value={`teacher_${t.subjectId}`}>
                        {t.teacherName} — Mapel: {t.subjectName} ({t.phone})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🏫 Kontak Utama Lembaga / Kepala Sekolah">
                    <option value="primary_institution">
                      {institutionSettings.headName || 'Drs. H. Yohanes Tarmidi, M.Pd.'} — Kepala Lembaga ({primaryPhone})
                    </option>
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Quick-Switch Buttons & Status */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {/* Option 1: HP Guru Pengampu Mapel Ini */}
              <button
                type="button"
                onClick={() => handleSelectSubjectTeacher(designatedSubjectTeacher)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTeacher.phone === designatedSubjectTeacher.phone && activeTeacher.teacherName === designatedSubjectTeacher.teacherName
                    ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400/50'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="Gunakan nomor HP guru pengampu mapel ini"
              >
                <Award className="w-3.5 h-3.5 text-yellow-300" />
                <span>Pengampu {module.name}: {designatedSubjectTeacher.teacherName}</span>
              </button>

              {/* Option 2: HP Guru Terpilih (jika beda dengan pengampu resmi) */}
              {activeTeacher.subjectId !== designatedSubjectTeacher.subjectId && (
                <button
                  type="button"
                  onClick={() => handleSelectSubjectTeacher(activeTeacher)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold bg-emerald-700 text-white ring-2 ring-emerald-400/50 cursor-pointer"
                  title="Guru terpilih dari tabel pengampu"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Tutor Terpilih: {activeTeacher.teacherName} ({activeTeacher.phone})</span>
                </button>
              )}

              {/* Option 3: HP Utama Lembaga (hanya jika disetel) */}
              {institutionSettings?.phone ? (
                <button
                  type="button"
                  onClick={handleSelectPrimaryPhone}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    phoneMode === 'primary'
                      ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-400/50'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Gunakan nomor HP utama lembaga / admin"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-300" />
                  <span>HP Utama Lembaga ({institutionSettings.phone})</span>
                </button>
              ) : (
                <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 text-amber-300 text-[10px] border border-slate-700">
                  <Info className="w-3 h-3 text-amber-400" />
                  <span>HP Utama Lembaga Kosong (Langsung menggunakan HP Guru)</span>
                </div>
              )}

              {/* Toggle Inline Editor */}
              <button
                type="button"
                onClick={() => setIsEditingTeacherInline(!isEditingTeacherInline)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 cursor-pointer ml-auto text-[11px]"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditingTeacherInline ? 'Tutup Editor Guru' : '✏️ Edit Guru & No HP'}</span>
              </button>
            </div>

            {/* Inline Teacher Editor Drawer */}
            {isEditingTeacherInline && (
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-700 space-y-2.5 animate-in fade-in duration-150 text-xs">
                <div className="flex items-center justify-between text-amber-300 font-bold text-[11px]">
                  <span>Edit Guru Pengampu & Nomor HP untuk {module.name}:</span>
                  <span className="text-[10px] text-slate-400">Tersimpan otomatis ke database profil</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Nama Guru / Tutor:</label>
                    <input
                      type="text"
                      value={activeTeacher.teacherName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setActiveTeacher(prev => ({ ...prev, teacherName: val }));
                        if (dispatchTab === 'kirim_jawaban') setSubTutorName(val);
                      }}
                      placeholder="Contoh: Dra. Siti Aminah, M.Pd."
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:ring-1 focus:ring-amber-400 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Nomor HP WhatsApp Guru:</label>
                    <input
                      type="text"
                      value={activeTeacher.phone}
                      onChange={(e) => {
                        const val = e.target.value;
                        setActiveTeacher(prev => ({ ...prev, phone: val }));
                        if (dispatchTab === 'kirim_jawaban') setSubTutorPhone(val);
                      }}
                      placeholder="081234567890"
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono font-bold focus:ring-1 focus:ring-amber-400"
                    />
                  </div>

                  <div className="flex items-end gap-1.5">
                    <button
                      type="button"
                      onClick={handleSaveAsSubjectTeacherPhone}
                      className="flex-1 py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan sbg HP Mapel</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAsPrimaryPhone}
                      className="flex-1 py-1 px-2.5 bg-blue-700 hover:bg-blue-600 text-white rounded text-xs font-bold shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan sbg HP Utama</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {dispatchTab === 'kirim_tugas' ? (
            /* ========================================================
               TAB 1: PENGIRIMAN TUGAS DARI GURU KE SISWA / GRUP
               ======================================================== */
            <>
              {/* Directory Bar & Search */}
              <div className="bg-emerald-950 text-white p-3 rounded-lg border border-emerald-800 space-y-2.5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs">
                      Buku Kontak Siswa & Orang Tua:
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {onOpenStudentDirectory && (
                      <button
                        type="button"
                        onClick={onOpenStudentDirectory}
                        className="flex items-center gap-1 px-2.5 py-1 bg-sky-700 hover:bg-sky-600 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                        title="Buka Menu Kelola Siswa: Upload Excel (.xlsx/.csv) atau Input Manual"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-sky-300" />
                        <span>Kelola Siswa (Excel/Manual)</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsAddingNewContact(!isAddingNewContact)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Kontak Baru</span>
                    </button>
                  </div>
                </div>

                {/* Search / Dropdown Toggle Bar */}
                <div className="relative" ref={dropdownRef}>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari siswa dari buku kontak (Ketik nama atau no HP)..."
                        value={contactSearchQuery}
                        onFocus={() => setIsContactDropdownOpen(true)}
                        onChange={(e) => {
                          setContactSearchQuery(e.target.value);
                          setIsContactDropdownOpen(true);
                        }}
                        className="w-full pl-8 pr-8 py-1.5 bg-white text-slate-900 placeholder-slate-400 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium"
                      />
                      {contactSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setContactSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsContactDropdownOpen(!isContactDropdownOpen)}
                      className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 rounded-lg text-xs font-bold shrink-0 cursor-pointer border border-emerald-700 flex items-center gap-1"
                    >
                      <span>{isContactDropdownOpen ? 'Tutup Daftar' : 'Buka Daftar Siswa'}</span>
                    </button>
                  </div>

                  {/* Dropdown List */}
                  {isContactDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white text-slate-900 rounded-lg border border-slate-300 shadow-xl max-h-56 overflow-y-auto z-30 divide-y divide-slate-100">
                      <div className="p-2 bg-slate-100 text-[10px] font-bold text-slate-600 flex items-center justify-between">
                        <span>Pilih nama siswa untuk mengisi nomor WhatsApp tujuan:</span>
                        <span className="text-emerald-700">{filteredContacts.length} Kontak</span>
                      </div>
                      {filteredContacts.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 text-xs">
                          Tidak ditemukan kontak dengan kata kunci "{contactSearchQuery}".
                        </div>
                      ) : (
                        filteredContacts.map((contact) => (
                          <div
                            key={contact.id}
                            onClick={() => handleSelectContact(contact)}
                            className={`p-2.5 flex items-center justify-between hover:bg-emerald-50 cursor-pointer transition-colors ${
                              phoneNumber === contact.phone ? 'bg-emerald-100/70' : ''
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-xs">{contact.name}</span>
                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] rounded font-bold">
                                  Kelas {contact.grade}
                                </span>
                                {contact.groupName && (
                                  <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                    {contact.groupName}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-slate-600">
                                <span className="font-mono font-semibold text-emerald-800 flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-emerald-600" />
                                  {contact.phone}
                                </span>
                                {contact.parentName && (
                                  <span className="text-slate-500 truncate">Wali: {contact.parentName}</span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded hover:bg-emerald-200">
                                Pilih Kontak ➡️
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteContact(contact.id, e)}
                                title="Hapus kontak ini"
                                className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Contact Status Card */}
                {selectedContact && (
                  <div className="bg-emerald-900/60 p-2 rounded border border-emerald-700 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-400 text-emerald-950 flex items-center justify-center font-black text-xs">
                        ✓
                      </div>
                      <div>
                        <span className="text-emerald-200 text-[10px] block">Kontak Aktif Terpilih:</span>
                        <span className="font-bold text-white">
                          {selectedContact.name} ({selectedContact.phone}) • Kelas {selectedContact.grade}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedContact(null);
                        setStudentName('');
                        setPhoneNumber('');
                      }}
                      className="text-[10px] text-emerald-300 hover:text-white underline cursor-pointer"
                    >
                      Reset Pilihan
                    </button>
                  </div>
                )}

                {/* Expandable Form: Add New Contact */}
                {isAddingNewContact && (
                  <form
                    onSubmit={handleSaveNewContact}
                    className="bg-emerald-900/90 p-3 rounded-lg border border-emerald-600 space-y-2.5 animate-in fade-in duration-150"
                  >
                    <div className="text-xs font-bold text-emerald-200 flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Simpan Kontak Siswa / No HP Baru ke Buku Telepon:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-200 mb-0.5">Nama Siswa: *</label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Rahmat Santoso"
                          value={newContactName}
                          onChange={(e) => setNewContactName(e.target.value)}
                          className="w-full px-2 py-1 bg-white text-slate-900 rounded text-xs focus:ring-1 focus:ring-emerald-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-200 mb-0.5">
                          Nomor HP WhatsApp: *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: 081234567890"
                          value={newContactPhone}
                          onChange={(e) => setNewContactPhone(e.target.value)}
                          className="w-full px-2 py-1 bg-white text-slate-900 rounded text-xs font-mono focus:ring-1 focus:ring-emerald-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-200 mb-0.5">Kelas / Jenjang:</label>
                        <select
                          value={newContactGrade}
                          onChange={(e) => setNewContactGrade(Number(e.target.value) as GradeLevel)}
                          className="w-full px-2 py-1 bg-white text-slate-900 rounded text-xs focus:ring-1 focus:ring-emerald-400"
                        >
                          <option value={7}>Kelas 7 (Paket B)</option>
                          <option value={8}>Kelas 8 (Paket B)</option>
                          <option value={9}>Kelas 9 (Paket B)</option>
                          <option value={10}>Kelas 10 (Paket C)</option>
                          <option value={11}>Kelas 11 (Paket C)</option>
                          <option value={12}>Kelas 12 (Paket C)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-200 mb-0.5">
                          Nama Orang Tua / Wali:
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: Orang Tua / Wali"
                          value={newContactParent}
                          onChange={(e) => setNewContactParent(e.target.value)}
                          className="w-full px-2 py-1 bg-white text-slate-900 rounded text-xs focus:ring-1 focus:ring-emerald-400"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingNewContact(false)}
                        className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-emerald-200 rounded text-xs font-semibold"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded text-xs shadow-xs"
                      >
                        Simpan & Pilih Kontak
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Form Fields: Recipient, Phone Number, Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {/* Quick Selector: Pilihan Nama Siswa Sesuai Daftar Siswa */}
                <div className="sm:col-span-2 bg-emerald-50/90 border border-emerald-200 rounded-md p-2.5 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <label className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-emerald-700" />
                      <span>Pilih Nama Siswa Sesuai Daftar Siswa (Terkoneksi &amp; Tersinkronisasi No HP):</span>
                    </label>
                    {selectedContact && (
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                        ✓ Siswa Terpilih: {selectedContact.name} ({selectedContact.phone || 'Belum ada No WA'})
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <select
                        value={selectedContact?.id || ''}
                        onChange={(e) => {
                          const found = contacts.find((c) => c.id === e.target.value);
                          if (found) {
                            handleSelectContact(found);
                          }
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border-2 border-emerald-400 rounded text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer shadow-2xs"
                      >
                        <option value="">-- Pilih Nama Siswa Sesuai Daftar Siswa ({contacts.length} siswa tersedia) --</option>
                        <optgroup label={`🎯 Siswa Kelas ${module.grade} (Sesuai Jenjang LKPD Ini)`}>
                          {contacts
                            .filter((c) => c.grade === module.grade && c.isActive !== false)
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name} — No HP WA: {c.phone || '(Belum ada No WA)'} {c.parentName ? `(Wali: ${c.parentName})` : ''}
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label="👥 Seluruh Siswa Lainnya di Daftar">
                          {contacts
                            .filter((c) => c.grade !== module.grade && c.isActive !== false)
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                [Kelas {c.grade}] {c.name} — No HP WA: {c.phone || '(Belum ada No WA)'} {c.parentName ? `(Wali: ${c.parentName})` : ''}
                              </option>
                            ))}
                        </optgroup>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {onOpenStudentDirectory && (
                        <button
                          type="button"
                          onClick={onOpenStudentDirectory}
                          className="w-full px-2.5 py-1.5 bg-sky-700 hover:bg-sky-600 text-white rounded text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                          title="Buka Menu Kelola Siswa"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Daftar Siswa</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Clickable Quick Pills for Students in Current Grade */}
                  <div className="pt-1.5 border-t border-emerald-200/80">
                    <div className="flex items-center gap-1 mb-1 text-[10px] font-bold text-emerald-900">
                      <span>⚡ Klik Cepat Nama Siswa Kelas {module.grade} (No HP Langsung Terkoneksi):</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {contacts
                        .filter((c) => c.grade === module.grade && c.isActive !== false)
                        .map((c) => {
                          const isSelected = selectedContact?.id === c.id || (Boolean(phoneNumber) && phoneNumber === c.phone);
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleSelectContact(c)}
                              className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                                isSelected
                                  ? 'bg-emerald-700 text-white border-emerald-800 font-bold shadow-xs scale-102 ring-1 ring-emerald-400'
                                  : 'bg-white text-emerald-900 hover:bg-emerald-100 border-emerald-300'
                              }`}
                              title={`Pilih ${c.name} (No WA: ${c.phone || 'Belum ada'})`}
                            >
                              <span>{isSelected ? '✓ ' : ''}{c.name.split(' ')[0]}</span>
                              <span className="font-mono text-[9px] opacity-90 font-bold">
                                ({c.phone || 'tanpa no'})
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-emerald-700" />
                      <span>Nama Siswa (Pilihan dari Daftar Siswa):</span>
                    </span>
                    {selectedContact ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                        Tersinkron: {selectedContact.name}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-normal">Ketik Manual</span>
                    )}
                  </label>
                  <div className="space-y-1">
                    <select
                      value={selectedContact?.id || 'manual'}
                      onChange={(e) => {
                        if (e.target.value === 'manual') {
                          setSelectedContact(null);
                        } else {
                          const found = contacts.find((c) => c.id === e.target.value);
                          if (found) {
                            handleSelectContact(found);
                          }
                        }
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-emerald-400 rounded text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer shadow-2xs"
                    >
                      <option value="">-- Pilih Nama Siswa dari Daftar Siswa --</option>
                      <optgroup label={`🎯 Siswa Kelas ${module.grade} (Jenjang Ini)`}>
                        {contacts
                          .filter((c) => c.grade === module.grade && c.isActive !== false)
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} — No HP WA: {c.phone || '(Belum ada)'}
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label="👥 Siswa Kelas Lainnya">
                        {contacts
                          .filter((c) => c.grade !== module.grade && c.isActive !== false)
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              [Kelas {c.grade}] {c.name} — No HP WA: {c.phone || '(Belum ada)'}
                            </option>
                          ))}
                      </optgroup>
                      <option value="manual">✏️ Tulis Nama Manual di Luar Daftar...</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Nama siswa pada naskah pesan WhatsApp"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-800 font-medium"
                      title="Nama siswa yang akan tercantum di pesan WA"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Target Nomor HP WhatsApp Siswa (Terkoneksi &amp; Tersinkronisasi):</span>
                    </span>
                    {selectedContact ? (
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        Terkoneksi: {selectedContact.name}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-emerald-700 font-bold">
                        Format WA: {targetPhone ? `+${targetPhone}` : '(Grup / Tanpa No)'}
                      </span>
                    )}
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder={selectedContact ? `No HP ${selectedContact.name} (contoh: 081234567890)` : "Contoh: 081234567890"}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border-2 border-emerald-500 rounded text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-slate-900 font-bold shadow-2xs"
                    />
                    {selectedContact && (
                      <button
                        type="button"
                        onClick={handleSavePhoneToSelectedStudent}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-700 rounded text-[10px] font-bold whitespace-nowrap cursor-pointer flex items-center gap-1 shadow-2xs transition-colors"
                        title={`Simpan nomor ${phoneNumber} ke data siswa "${selectedContact.name}" di daftar siswa`}
                      >
                        <Save className="w-3 h-3" />
                        <span>Simpan No HP</span>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-600 mt-1">
                    <span className="flex items-center gap-1">
                      {selectedContact ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 inline" />
                          <span>
                            No HP terkoneksi langsung dengan <strong>{selectedContact.name}</strong> ({selectedContact.phone || 'belum ada nomor di daftar'})
                          </span>
                        </>
                      ) : (
                        <span>Pilih nama siswa pada dropdown untuk menghubungkan nomor HP otomatis.</span>
                      )}
                    </span>
                    {selectedContact && phoneNumber !== selectedContact.phone && (
                      <span className="text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        ⚠️ No HP diedit (klik Simpan untuk memperbarui Daftar Siswa)
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>Batas Waktu Pengumpulan (Deadline):</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Jumat, 25 Agustus 2026, Pk 17.00 WIB"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-slate-500" />
                    <span>Instruksi / Catatan Tambahan Tutor:</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Petunjuk pengumpulan..."
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-800"
                  />
                </div>
              </div>

              {/* Granular Component Toggles */}
              <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">
                    Pilih Format Naskah LKPD & Soal untuk WhatsApp:
                  </span>
                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handlePresetChange('lengkap')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        shareMode === 'lengkap'
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                      title="Naskah lengkap: Petunjuk, Rangkuman Materi, Soal Pemahaman, Analisis Kasus, Tugas Praktik, Evaluasi, dan Refleksi"
                    >
                      LKPD Lengkap (Rekomendasi)
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePresetChange('soal_evaluasi')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        shareMode === 'soal_evaluasi'
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                      title="Khusus butir-butir soal evaluasi dan pemahaman konsep"
                    >
                      Khusus Soal
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePresetChange('tugas_praktik')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        shareMode === 'tugas_praktik'
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                      title="Khusus tugas analisis kasus dan proyek praktik homeschooling"
                    >
                      Tugas Praktik
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePresetChange('ringkas')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        shareMode === 'ringkas'
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                      title="Petunjuk ringkas dan tautan pengerjaan lembar kerja online"
                    >
                      Ringkas + Link
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeInstructions}
                      onChange={(e) => setIncludeInstructions(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>📋 Petunjuk Pengerjaan</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeMateriSummary}
                      onChange={(e) => setIncludeMateriSummary(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>📖 Rangkuman Materi</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeActivity1}
                      onChange={(e) => setIncludeActivity1(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>📝 Soal Pemahaman</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeActivity2}
                      onChange={(e) => setIncludeActivity2(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>🔍 Analisis Kasus</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeActivity3}
                      onChange={(e) => setIncludeActivity3(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>🛠️ Tugas Proyek Praktik</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeEvaluasi}
                      onChange={(e) => setIncludeEvaluasi(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>✍️ Butir Soal Evaluasi</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeRefleksi}
                      onChange={(e) => setIncludeRefleksi(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>💭 Refleksi Siswa</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none font-bold text-emerald-800">
                    <input
                      type="checkbox"
                      checked={includeDirectLink}
                      onChange={(e) => setIncludeDirectLink(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>🌐 Link Dokumen Soal Siswa</span>
                  </label>
                </div>
              </div>
            </>
          ) : (
            /* ========================================================
               TAB 2: PENGIRIMAN LEMBAR JAWABAN SISWA KE TUTOR
               ======================================================== */
            <div className="space-y-3">
              {/* Submission Status & Target Tutor Card (Menu Siswa Pengiriman LKPD) */}
              <div className="bg-blue-950 text-white p-3.5 rounded-xl border border-blue-700 shadow-md space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-300" />
                    <span className="font-bold text-xs text-white">
                      Target Pengiriman Lembar Jawaban Siswa ke Guru / Tutor Pengampu:
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {onOpenTeacherDirectory && (
                      <button
                        type="button"
                        onClick={onOpenTeacherDirectory}
                        className="text-[10px] text-yellow-300 hover:text-white font-bold bg-blue-900 hover:bg-blue-800 px-2 py-1 rounded border border-yellow-400/40 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Buka Menu Tabel Pengampu & Direktori Guru"
                      >
                        <Users className="w-3 h-3" />
                        <span>Tabel Pengampu & Daftar Guru</span>
                      </button>
                    )}
                    <span className="text-[10px] text-blue-300 font-mono bg-blue-900/60 px-2 py-0.5 rounded border border-blue-800">
                      Mapel: <strong className="text-yellow-300">{module.name}</strong>
                    </span>
                  </div>
                </div>

                {/* Dropdown Guru Terpadu & Tersinkronkan */}
                <div className="bg-blue-900/80 p-2.5 rounded-lg border border-blue-700 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <label className="font-bold text-yellow-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" />
                      <span>Pilih Guru / Tutor Pengampu Penerima LKPD:</span>
                    </label>
                    <span className="text-[10px] text-blue-200">
                      Tersinkronkan dengan {allActiveTeachers.length} Guru di Tabel Pengampu
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={currentTeacherDropdownValue}
                      onChange={(e) => handleTeacherSelectionChange(e.target.value)}
                      className="w-full px-2.5 py-2 bg-blue-950 border border-blue-600 rounded-lg text-xs text-white font-bold focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                    >
                      <optgroup label="⭐ Guru Pengampu Mata Pelajaran Ini (Tabel Pengampu)">
                        <option value={`subject_${designatedSubjectTeacher.subjectId}`}>
                          ⭐ {designatedSubjectTeacher.teacherName} — Tutor {module.name} ({designatedSubjectTeacher.phone}) [Pengampu Resmi]
                        </option>
                      </optgroup>
                      <optgroup label="👥 Seluruh Guru Pengampu Aktif (Daftar Guru & Tabel Pengampu)">
                        {allActiveTeachers.map(t => (
                          <option key={t.subjectId} value={`teacher_${t.subjectId}`}>
                            {t.teacherName} — Pengampu: {t.subjectName} ({t.phone})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="🏫 Kontak Utama Lembaga / Kepala Sekolah">
                        <option value="primary_institution">
                          {institutionSettings.headName || 'Drs. H. Yohanes Tarmidi, M.Pd.'} — Kepala Lembaga ({primaryPhone})
                        </option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                {/* Quick-Switch Buttons & Status */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => handleSelectSubjectTeacher(designatedSubjectTeacher)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      subTutorPhone === designatedSubjectTeacher.phone && subTutorName === designatedSubjectTeacher.teacherName
                        ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400/50'
                        : 'bg-blue-900 text-blue-200 hover:bg-blue-800'
                    }`}
                    title="Gunakan guru pengampu resmi untuk mata pelajaran ini"
                  >
                    <Award className="w-3.5 h-3.5 text-yellow-300" />
                    <span>Tutor {module.name}: {designatedSubjectTeacher.teacherName}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSelectPrimaryPhone}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      phoneMode === 'primary' || (subTutorPhone === primaryPhone && subTutorName === (institutionSettings.headName || 'Drs. H. Yohanes Tarmidi, M.Pd.'))
                        ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-400/50'
                        : 'bg-blue-900 text-blue-200 hover:bg-blue-800'
                    }`}
                    title="Gunakan kontak WhatsApp utama lembaga"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-300" />
                    <span>HP Lembaga ({primaryPhone})</span>
                  </button>

                  <div className="ml-auto text-[10px] text-blue-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Tersinkronkan Otomatis</span>
                  </div>
                </div>

                {/* Detail Recipient Tutor & Verification */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs bg-blue-900/50 p-2.5 rounded-lg border border-blue-800">
                  <div>
                    <span className="text-[10px] text-blue-300 block font-semibold">Nama Tutor Penerima LKPD:</span>
                    <input
                      type="text"
                      value={subTutorName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSubTutorName(val);
                        setActiveTeacher(prev => ({ ...prev, teacherName: val }));
                      }}
                      className="w-full mt-0.5 px-2.5 py-1 bg-blue-950 border border-blue-600 rounded text-xs text-white font-bold focus:ring-1 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-300 block font-semibold">No WhatsApp Tutor Penerima:</span>
                    <input
                      type="text"
                      value={subTutorPhone}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSubTutorPhone(val);
                        setActiveTeacher(prev => ({ ...prev, phone: val }));
                      }}
                      className="w-full mt-0.5 px-2.5 py-1 bg-blue-950 border border-blue-600 rounded text-xs text-white font-mono font-bold focus:ring-1 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-300 block font-semibold">Status Lembar Jawaban:</span>
                    <div className="mt-0.5 px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-700 rounded text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">
                        {loadedSubmission ? 'Jawaban Terisi Lengkap' : 'Siap Dikirim / Verifikasi'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Identity Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" />
                    <span>Nama Lengkap Siswa:</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Yohanes Tarmidi"
                    value={subStudentName}
                    onChange={(e) => setSubStudentName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-slate-500" />
                    <span>Nomor Induk / NISN:</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: BM-2026-001"
                    value={subStudentId}
                    onChange={(e) => setSubStudentId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-slate-500" />
                    <span>Catatan Penyampaian / Pesan untuk Guru:</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Tugas telah selesai dikerjakan secara mandiri..."
                    value={subStudentNotes}
                    onChange={(e) => setSubStudentNotes(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Live WhatsApp Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {dispatchTab === 'kirim_tugas'
                    ? 'Pratinjau Pesan Penugasan Guru ke Siswa:'
                    : `Pratinjau Lembar Pengiriman Jawaban Siswa ke Tutor (${subTutorName}):`}
                </span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Link Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Link className="w-3 h-3" />
                      <span>Salin Link Soal Siswa</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-slate-900 text-slate-100 p-3 rounded-lg border border-slate-800 text-[11px] font-mono leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto select-all shadow-inner">
              {messageText}
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyMessage}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            {copiedText ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span>Teks Format Berhasil Disalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Teks Lengkap</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSendWeb}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Buka langsung di WhatsApp Web komputer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
              <span>WhatsApp Web (PC)</span>
            </button>

            <button
              type="button"
              onClick={handleSendUniversal}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              title={
                targetPhone
                  ? `Kirim langsung ke WhatsApp No: +${targetPhone}`
                  : 'Kirim ke WhatsApp (Pilih kontak/grup di aplikasi WhatsApp)'
              }
            >
              <Send className="w-4 h-4 text-white" />
              <span>
                {targetPhone
                  ? `Kirim ke No ${currentTargetPhone} (+${targetPhone})`
                  : 'Kirim via WhatsApp'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
