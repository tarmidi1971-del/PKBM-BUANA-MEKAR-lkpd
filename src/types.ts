export type ProgramType = 'paket-b' | 'paket-c';

export type GradeLevel = 7 | 8 | 9 | 10 | 11 | 12;

export interface LKPDQuestion {
  id: string;
  type: 'multiple-choice' | 'essay' | 'case-study' | 'practical';
  question: string;
  options?: string[];
  correctAnswer?: string;
  rubricHint?: string;
  points: number;
}

export interface PracticalTask {
  title: string;
  objective: string;
  toolsAndMaterials: string[];
  steps: string[];
  expectedOutput: string;
  safetyNotes?: string;
  evidenceType: 'foto' | 'video' | 'laporan' | 'produk-fisik' | 'file-digital';
}

export interface RubricCriteria {
  aspect: string;
  level4: string; // Sangat Baik
  level3: string; // Baik
  level2: string; // Cukup
  level1: string; // Perlu Bimbingan
}

export interface LKPDUnit {
  id: string;
  unitNumber: number; // 1 to 8 across 1 academic year
  semester: 1 | 2;
  topic: string;
  subtopic?: string;
  allocationWeeks: string; // e.g. "Minggu 1-2 (4 JP)"
  capaianPembelajaran: string;
  tujuanPembelajaran: string[];
  homeschoolingInstructions: string[];
  materiSummary: {
    title: string;
    points: string[];
    deepDiveMarkdown?: string;
  };
  activity1Pemahaman: {
    instruction: string;
    questions: LKPDQuestion[];
  };
  activity2Penerapan: {
    title: string;
    contextDescription: string;
    taskInstruction: string;
    guidingQuestions: string[];
  };
  activity3ProyekPraktik: PracticalTask;
  soalEvaluasi: LKPDQuestion[]; // 10-15 questions per unit for deep evaluation
  refleksiPesertaDidik: string[];
  rubrikKeterampilan: RubricCriteria[];
  rubrikSikap: {
    sikap: string;
    deskripsi: string;
  }[];
  digitalTextbookRef?: {
    bookTitle: string;
    officialUrl?: string;
    sourceUrl?: string;
    fullTextExcerpt?: string;
    isExternalLinkActive?: boolean;
    curriculumCode?: string;
  };
  kunciJawabanDanPedoman: {
    pemahamanKey: string;
    penerapanKey: string;
    evaluasiKey: { questionId: string; answer: string; explanation: string }[];
    tutorNotes: string;
  };
}

export interface SubjectModule {
  id: string;
  name: string;
  category: 'wajib' | 'pemberdayaan' | 'keterampilan-vokasi' | 'muatan-lokal' | 'peminatan';
  icon: string;
  color: string;
  description: string;
  grade: GradeLevel;
  program: ProgramType;
  academicYear: string;
  textbookInfo?: {
    officialBookTitle: string;
    publisher: string;
    officialSourceUrl: string;
    pdfDownloadUrl?: string;
  };
  units: LKPDUnit[];
}

export interface StudentWorksheetSubmission {
  id: string;
  unitId: string;
  studentName: string;
  studentId?: string;
  grade: GradeLevel;
  subjectName: string;
  submittedAt: string;
  answers: Record<string, string>; // questionId -> answer text or choice
  activity2Response: string;
  activity3ResultNote: string;
  activity3UploadedFiles?: string[];
  reflectionResponses: Record<number, string>;
  scoreKnowledge?: number;
  scoreSkills?: number;
  attitudeGrades?: Record<string, 'Baik' | 'Cukup' | 'Perlu Bimbingan'>;
  tutorFeedback?: string;
  parentNotes?: string;
  isGraded?: boolean;
}

export interface SubjectTeacher {
  subjectId: string; // e.g. "tata-boga", "matematika" or custom slug
  subjectName: string;
  teacherName: string;
  phone: string; // WhatsApp phone e.g. "0857-2227-1680" or "081234567890"
  nipOrNiy?: string;
  category?: 'wajib' | 'pemberdayaan' | 'keterampilan-vokasi' | 'muatan-lokal' | 'peminatan';
  isActive?: boolean; // Status Guru Mapel Aktif / Non-Aktif
  email?: string;
  notes?: string;
  customSubject?: boolean; // true if manually added
}

export interface InstitutionSettings {
  name: string; // e.g. "PKBM Buana Mekar"
  shortName: string; // e.g. "BM"
  npsn: string; // e.g. "P9908123"
  address: string; // e.g. "Jl. Pendidikan No. 45, Bandung"
  phone: string; // e.g. "0857-2227-1680" (Nomor HP / WhatsApp Utama Lembaga)
  email: string; // e.g. "info@pkbmbuanamekar.sch.id"
  headName: string; // e.g. "Drs. H. Yohanes Tarmidi, M.Pd."
  headNipOrNiy: string; // e.g. "19750819 200501 1 004"
  defaultTutor: string; // e.g. "Tim Tutor PKBM"
  academicYear: string; // e.g. "2026/2027"
  city: string; // e.g. "Bandung"
  tagline: string; // e.g. "Pusat Kegiatan Belajar Masyarakat & Homeschooling Terpadu"
  themeColor: string; // e.g. "emerald" or "blue"
  website?: string;
  subjectTeachers?: Record<string, SubjectTeacher>; // Daftar nomor HP & nama guru per mata pelajaran
}

export interface StudentContact {
  id: string;
  name: string;
  nisnOrNis?: string;
  phone: string; // e.g. "081234567890"
  grade: GradeLevel;
  parentName?: string;
  parentPhone?: string;
  groupName?: string; // e.g. "Kelompok Belajar A"
  address?: string;
  gender?: 'L' | 'P';
  isActive?: boolean;
  notes?: string;
}

export interface AppSecuritySettings {
  isProtectionEnabled: boolean; // is PIN protection active
  adminPin: string; // 6-digit PIN or password
  securityQuestion: string;
  securityAnswer: string;
  protectTutorMode: boolean; // require PIN for Kunci Jawaban & Rubrik
  protectInstitutionSettings: boolean; // require PIN for setting lembaga
  protectAIGenerator: boolean; // require PIN for generating new units
  protectCurriculumEdit: boolean; // require PIN for modifying modules
  isAppLocked: boolean; // Student exam mode / fully locked app
}
