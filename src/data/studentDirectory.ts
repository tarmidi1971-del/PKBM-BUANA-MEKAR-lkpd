import { GradeLevel, StudentContact } from '../types';

export type { StudentContact };

export const INITIAL_STUDENT_CONTACTS: StudentContact[] = [
  // Kelas 7 (Paket B)
  {
    id: 'std-7-01',
    name: 'Ahmad Fauzi Ridwan',
    nisnOrNis: '3081234501',
    phone: '081234567801',
    grade: 7,
    parentName: 'Hendra Ridwan (Ayah)',
    groupName: 'Kelompok 7A Mandiri',
  },
  {
    id: 'std-7-02',
    name: 'Siti Nurhaliza',
    nisnOrNis: '3081234502',
    phone: '081345678902',
    grade: 7,
    parentName: 'Khadijah (Ibu)',
    groupName: 'Kelompok 7A Mandiri',
  },
  {
    id: 'std-7-03',
    name: 'Budi Prasetyo',
    nisnOrNis: '3081234503',
    phone: '085712345603',
    grade: 7,
    parentName: 'Bambang Prasetyo',
    groupName: 'Kelompok 7B Homeschooling',
  },
  {
    id: 'std-7-04',
    name: 'Dewi Sartika Putri',
    nisnOrNis: '3081234504',
    phone: '087812345604',
    grade: 7,
    parentName: 'Ratna Dewi',
    groupName: 'Kelompok 7B Homeschooling',
  },

  // Kelas 8 (Paket B)
  {
    id: 'std-8-01',
    name: 'Muhammad Rizky Pratama',
    nisnOrNis: '3071234501',
    phone: '081298765401',
    grade: 8,
    parentName: 'Pratama Jaya',
    groupName: 'Kelompok 8 Reguler',
  },
  {
    id: 'std-8-02',
    name: 'Annisa Rahmawati',
    nisnOrNis: '3071234502',
    phone: '085698765402',
    grade: 8,
    parentName: 'Lina Rahmawati',
    groupName: 'Kelompok 8 Reguler',
  },
  {
    id: 'std-8-03',
    name: 'Dimas Anggara',
    nisnOrNis: '3071234503',
    phone: '081987654303',
    grade: 8,
    parentName: 'Suryo Anggara',
    groupName: 'Kelompok 8 Mandiri',
  },

  // Kelas 9 (Paket B)
  {
    id: 'std-9-01',
    name: 'Farhan Maulana',
    nisnOrNis: '3061234501',
    phone: '081234569901',
    grade: 9,
    parentName: 'H. Maulana',
    groupName: 'Kelompok 9 Persiapan Ujian',
  },
  {
    id: 'std-9-02',
    name: 'Nabila Zahra Khairunnisa',
    nisnOrNis: '3061234502',
    phone: '082134569902',
    grade: 9,
    parentName: 'Zahra Siregar',
    groupName: 'Kelompok 9 Persiapan Ujian',
  },
  {
    id: 'std-9-03',
    name: 'Rian Hidayat',
    nisnOrNis: '3061234503',
    phone: '085234569903',
    grade: 9,
    parentName: 'Wawan Hidayat',
    groupName: 'Kelompok 9 Mandiri',
  },

  // Kelas 10 (Paket C)
  {
    id: 'std-10-01',
    name: 'Andi Saputra',
    nisnOrNis: '3051234501',
    phone: '081311223301',
    grade: 10,
    parentName: 'Saputra Jaya',
    groupName: 'Kelas 10 Paket C Vokasi',
  },
  {
    id: 'std-10-02',
    name: 'Putri Ayu Lestari',
    nisnOrNis: '3051234502',
    phone: '081711223302',
    grade: 10,
    parentName: 'Sri Lestari',
    groupName: 'Kelas 10 Paket C Vokasi',
  },
  {
    id: 'std-10-03',
    name: 'Reza Rahardian Putra',
    nisnOrNis: '3051234503',
    phone: '087711223303',
    grade: 10,
    parentName: 'Gunawan Rahardian',
    groupName: 'Kelas 10 Homeschooling',
  },

  // Kelas 11 (Paket C)
  {
    id: 'std-11-01',
    name: 'Bayu Wibowo',
    nisnOrNis: '3041234501',
    phone: '081299887701',
    grade: 11,
    parentName: 'Wibowo Santoso',
    groupName: 'Kelas 11 Pemberdayaan',
  },
  {
    id: 'std-11-02',
    name: 'Dinda Permatasari',
    nisnOrNis: '3041234502',
    phone: '085799887702',
    grade: 11,
    parentName: 'Evi Permata',
    groupName: 'Kelas 11 Pemberdayaan',
  },
  {
    id: 'std-11-03',
    name: 'Kevin Pratama',
    nisnOrNis: '3041234503',
    phone: '081899887703',
    grade: 11,
    parentName: 'Irwan Pratama',
    groupName: 'Kelas 11 Mandiri',
  },

  // Kelas 12 (Paket C)
  {
    id: 'std-12-01',
    name: 'Aditia Nugraha',
    nisnOrNis: '3031234501',
    phone: '081277665501',
    grade: 12,
    parentName: 'Bagus Nugraha',
    groupName: 'Kelas 12 Kelulusan',
  },
  {
    id: 'std-12-02',
    name: 'Mega Utami',
    nisnOrNis: '3031234502',
    phone: '082277665502',
    grade: 12,
    parentName: 'Endang Utami',
    groupName: 'Kelas 12 Kelulusan',
  },
  {
    id: 'std-12-03',
    name: 'Teguh Firmansyah',
    nisnOrNis: '3031234503',
    phone: '085377665503',
    grade: 12,
    parentName: 'Agus Firmansyah',
    groupName: 'Kelas 12 Mandiri',
  }
];

const CONTACTS_STORAGE_KEY = 'pkbm_student_contacts_v2';

/**
 * Parses any grade representation into GradeLevel (7 | 8 | 9 | 10 | 11 | 12)
 */
export const parseStudentGrade = (gradeInput: any): GradeLevel => {
  if (!gradeInput) return 7;
  const str = String(gradeInput).trim().toLowerCase();

  // Explicit checks
  if (str === '7' || str === 'vii' || str.includes('kelas 7') || str.includes('kelas vii') || str.includes('paket b - 7')) return 7;
  if (str === '8' || str === 'viii' || str.includes('kelas 8') || str.includes('kelas viii') || str.includes('paket b - 8')) return 8;
  if (str === '9' || str === 'ix' || str.includes('kelas 9') || str.includes('kelas ix') || str.includes('paket b - 9')) return 9;
  if (str === '10' || str === 'x' || str.includes('kelas 10') || str.includes('kelas x') || str.includes('paket c - 10')) return 10;
  if (str === '11' || str === 'xi' || str.includes('kelas 11') || str.includes('kelas xi') || str.includes('paket c - 11')) return 11;
  if (str === '12' || str === 'xii' || str.includes('kelas 12') || str.includes('kelas xii') || str.includes('paket c - 12')) return 12;

  // General Paket indicators
  if (str.includes('paket b') || str.includes('smp')) return 7;
  if (str.includes('paket c') || str.includes('sma')) return 10;

  const num = parseInt(str.replace(/[^0-9]/g, ''), 10);
  if ([7, 8, 9, 10, 11, 12].includes(num)) {
    return num as GradeLevel;
  }

  return 7;
};

/**
 * Returns package information and display labels for a grade
 */
export const getGradePackageInfo = (grade: GradeLevel) => {
  const isPaketB = grade >= 7 && grade <= 9;
  return {
    paket: isPaketB ? ('Paket B' as const) : ('Paket C' as const),
    jenjang: isPaketB ? 'Setara SMP/MTs' : 'Setara SMA/MA',
    kelasLabel: `Kelas ${grade}`,
    fullLabel: `${isPaketB ? 'Paket B' : 'Paket C'} — Kelas ${grade}`,
    badgeColor: isPaketB ? 'bg-sky-100 text-sky-800 border-sky-300' : 'bg-indigo-100 text-indigo-800 border-indigo-300'
  };
};

export const loadStudentContacts = (): StudentContact[] => {
  if (typeof window === 'undefined') {
    return INITIAL_STUDENT_CONTACTS.map(s => ({ ...s, isActive: s.isActive !== false }));
  }
  try {
    const raw = localStorage.getItem(CONTACTS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item: any) => item.id !== 'std-primary-085722271680' && item.id !== 'std-primary-085722271680-sma')
          .map((item: any) => ({
            ...item,
            grade: parseStudentGrade(item.grade),
            isActive: item.isActive !== false
          }));
      }
    }
  } catch (e) {
    console.error('Error loading student contacts', e);
  }

  // Default first time initialize (only when key has never been set)
  const defaults = INITIAL_STUDENT_CONTACTS.map(s => ({ ...s, isActive: true }));
  try {
    localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(defaults));
  } catch (e) {
    console.error('Error saving initial student contacts', e);
  }
  return defaults;
};

export const resetToDefaultStudentContacts = (): StudentContact[] => {
  const defaults = INITIAL_STUDENT_CONTACTS.map(s => ({ ...s, isActive: true }));
  saveStudentContacts(defaults);
  return defaults;
};

export const saveStudentContacts = (contacts: StudentContact[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
    window.dispatchEvent(new CustomEvent('pkbm_student_contacts_changed', { detail: contacts }));
  } catch (e) {
    console.error('Error saving student contacts', e);
  }
};

/**
 * Import batch of students (merge or replace)
 */
export const importStudentsBatch = (
  newStudents: StudentContact[],
  mode: 'merge' | 'replace' = 'merge'
): StudentContact[] => {
  const existing = mode === 'replace' ? [] : loadStudentContacts();
  
  if (mode === 'replace') {
    saveStudentContacts(newStudents);
    return newStudents;
  }

  // Merge mode: match by NISN or Phone or Name
  const map = new Map<string, StudentContact>();
  existing.forEach(s => {
    const key = s.nisnOrNis ? `nisn-${s.nisnOrNis}` : (s.phone ? `phone-${s.phone}` : `id-${s.id}`);
    map.set(key, s);
  });

  newStudents.forEach(s => {
    const key = s.nisnOrNis ? `nisn-${s.nisnOrNis}` : (s.phone ? `phone-${s.phone}` : `id-${s.id}`);
    const existingEntry = map.get(key);
    if (existingEntry) {
      map.set(key, {
        ...existingEntry,
        ...s,
        id: existingEntry.id,
        isActive: s.isActive !== undefined ? s.isActive : existingEntry.isActive !== false
      });
    } else {
      map.set(key, {
        ...s,
        isActive: s.isActive !== undefined ? s.isActive : true
      });
    }
  });

  const merged = Array.from(map.values());
  saveStudentContacts(merged);
  return merged;
};

/**
 * Add or update single student
 */
export const saveSingleStudent = (student: StudentContact): StudentContact[] => {
  const current = loadStudentContacts();
  const index = current.findIndex(s => s.id === student.id);
  let updated: StudentContact[];

  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...updated[index], ...student };
  } else {
    updated = [student, ...current];
  }

  saveStudentContacts(updated);
  return updated;
};

/**
 * Delete student by ID
 */
export const deleteStudent = (id: string): StudentContact[] => {
  const current = loadStudentContacts();
  const targetId = String(id).trim();
  const updated = current.filter(s => String(s.id).trim() !== targetId);
  saveStudentContacts(updated);
  return updated;
};

/**
 * Bulk delete students by IDs
 */
export const bulkDeleteStudents = (ids: string[] | Set<string>): StudentContact[] => {
  const targetIds = new Set(Array.from(ids).map(i => String(i).trim()));
  const current = loadStudentContacts();
  const updated = current.filter(s => !targetIds.has(String(s.id).trim()));
  saveStudentContacts(updated);
  return updated;
};

/**
 * Toggle student active status
 */
export const toggleStudentStatus = (id: string): StudentContact[] => {
  const current = loadStudentContacts();
  const updated = current.map(s => {
    if (s.id === id) {
      return { ...s, isActive: s.isActive === false ? true : false };
    }
    return s;
  });
  saveStudentContacts(updated);
  return updated;
};

/**
 * Bulk set active status
 */
export const bulkSetStudentStatus = (status: boolean): StudentContact[] => {
  const current = loadStudentContacts();
  const updated = current.map(s => ({ ...s, isActive: status }));
  saveStudentContacts(updated);
  return updated;
};
