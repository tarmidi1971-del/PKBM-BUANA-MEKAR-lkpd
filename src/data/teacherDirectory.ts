import { SubjectTeacher } from '../types';
import { ALL_SUBJECTS } from './subjectMeta';

export const DEFAULT_PRIMARY_PHONE = '';
export const DEFAULT_PRIMARY_CONTACT_NAME = 'Yohanes Tarmidi';

export const INITIAL_SUBJECT_TEACHERS: Record<string, SubjectTeacher> = {
  // === MAPEL WAJIB UMUM (PAKET B & PAKET C) ===
  'pendidikan-agama': {
    subjectId: 'pendidikan-agama',
    subjectName: 'Pendidikan Agama dan Budi Pekerti',
    teacherName: 'Ust. Ahmad Hidayat, S.Pd.I.',
    phone: '',
    nipOrNiy: '19820315 201001 1 008',
    category: 'wajib',
    isActive: true,
    notes: 'Tutor Pengampu Keagamaan & Budi Pekerti'
  },
  'pendidikan-pancasila': {
    subjectId: 'pendidikan-pancasila',
    subjectName: 'Pendidikan Pancasila',
    teacherName: 'Dra. Endang Sulistyowati, M.Pd.',
    phone: '',
    nipOrNiy: '19780512 200604 2 005',
    category: 'wajib',
    isActive: true,
    notes: 'Tutor Pendidikan Pancasila & Kewarganegaraan'
  },
  'bahasa-indonesia': {
    subjectId: 'bahasa-indonesia',
    subjectName: 'Bahasa Indonesia',
    teacherName: 'Nurul Fadhilah, S.Pd.',
    phone: '',
    nipOrNiy: '19890420 201503 2 003',
    category: 'wajib',
    isActive: true,
    notes: 'Tutor Literasi & Bahasa Indonesia'
  },
  'matematika': {
    subjectId: 'matematika',
    subjectName: 'Matematika',
    teacherName: 'Rudi Hartono, S.Si., M.Pd.',
    phone: '',
    nipOrNiy: '19841108 200902 1 007',
    category: 'wajib',
    isActive: true,
    notes: 'Tutor Matematika & Aritmatika Sosial'
  },
  'ipa': {
    subjectId: 'ipa',
    subjectName: 'Ilmu Pengetahuan Alam (IPA)',
    teacherName: 'Dr. Hendra Gunawan, M.Si.',
    phone: '',
    nipOrNiy: '19800724 200801 1 012',
    category: 'wajib',
    isActive: true,
    notes: 'Tutor Sains, Biologi & Fisika Terapan'
  },
  'ips': {
    subjectId: 'ips',
    subjectName: 'Ilmu Pengetahuan Sosial (IPS)',
    teacherName: 'Siti Rahmawati, S.Pd.',
    phone: '',
    nipOrNiy: '19860218 201101 2 006',
    category: 'wajib',
    isActive: true,
    notes: 'Tutor Sejarah & Wawasan Sosial'
  },
  'bahasa-inggris': {
    subjectId: 'bahasa-inggris',
    subjectName: 'Bahasa Inggris',
    teacherName: 'David Pratama, S.Pd., M.Hum.',
    phone: '',
    nipOrNiy: '19871005 201402 1 004',
    category: 'wajib',
    isActive: true,
    notes: 'Tutor English Communication & Literacy'
  },
  'sejarah': {
    subjectId: 'sejarah',
    subjectName: 'Sejarah',
    teacherName: 'Drs. Agus Suryana, M.Hum.',
    phone: '',
    nipOrNiy: '19790814 200701 1 006',
    category: 'wajib',
    isActive: true,
    notes: 'Tutor Pengampu Sejarah Indonesia & Dunia'
  },
  'pjok': {
    subjectId: 'pjok',
    subjectName: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    teacherName: 'Rian Firmansyah, S.Pd.',
    phone: '',
    nipOrNiy: '19910629 201801 1 003',
    category: 'wajib',
    isActive: true,
    notes: 'Tutor Kebugaran Jasmani & Pola Hidup Sehat'
  },
  'seni-budaya': {
    subjectId: 'seni-budaya',
    subjectName: 'Seni dan Budaya',
    teacherName: 'Dewi Lestari, S.Sn.',
    phone: '',
    nipOrNiy: '19900311 201602 2 004',
    category: 'wajib',
    isActive: true,
    notes: 'Tutor Seni Rupa, Desain & Budaya Nusantara'
  },
  'informatika': {
    subjectId: 'informatika',
    subjectName: 'Informatika',
    teacherName: 'Bagus Setiawan, S.Kom.',
    phone: '',
    nipOrNiy: '19920814 201903 1 002',
    category: 'wajib',
    isActive: true,
    notes: 'Tutor Algoritma & Berpikir Komputasional'
  },

  // === PAKET C — PEMINATAN / PILIHAN IPA ===
  'fisika': {
    subjectId: 'fisika',
    subjectName: 'Fisika',
    teacherName: 'Bambang Irawan, S.Si., M.Pd.',
    phone: '',
    nipOrNiy: '19830514 200801 1 009',
    category: 'peminatan',
    isActive: true,
    notes: 'Tutor Pengampu Peminatan Fisika'
  },
  'kimia': {
    subjectId: 'kimia',
    subjectName: 'Kimia',
    teacherName: 'Dr. Indah Permatasari, M.Si.',
    phone: '',
    nipOrNiy: '19860719 201102 2 008',
    category: 'peminatan',
    isActive: true,
    notes: 'Tutor Pengampu Peminatan Kimia'
  },
  'biologi': {
    subjectId: 'biologi',
    subjectName: 'Biologi',
    teacherName: 'Tri Wahyuni, S.Si., M.Biotech.',
    phone: '',
    nipOrNiy: '19871103 201302 2 004',
    category: 'peminatan',
    isActive: true,
    notes: 'Tutor Pengampu Peminatan Biologi'
  },

  // === PAKET C — PEMINATAN / PILIHAN IPS ===
  'ekonomi': {
    subjectId: 'ekonomi',
    subjectName: 'Ekonomi dan Akuntansi',
    teacherName: 'Farhan Maulana, S.E., M.M.',
    phone: '',
    nipOrNiy: '19840217 200903 1 005',
    category: 'peminatan',
    isActive: true,
    notes: 'Tutor Pengampu Peminatan Ekonomi & Akuntansi'
  },
  'geografi': {
    subjectId: 'geografi',
    subjectName: 'Geografi',
    teacherName: 'Dra. Sri Wahyuni, M.Pd.',
    phone: '',
    nipOrNiy: '19790412 200604 2 007',
    category: 'peminatan',
    isActive: true,
    notes: 'Tutor Pengampu Peminatan Geografi'
  },
  'sosiologi': {
    subjectId: 'sosiologi',
    subjectName: 'Sosiologi',
    teacherName: 'Rahmat Kurnia, S.Sos., M.Si.',
    phone: '',
    nipOrNiy: '19851025 201201 1 003',
    category: 'peminatan',
    isActive: true,
    notes: 'Tutor Pengampu Peminatan Sosiologi'
  },
  'antropologi': {
    subjectId: 'antropologi',
    subjectName: 'Antropologi',
    teacherName: 'Dr. Lestari Handayani, M.Hum.',
    phone: '',
    nipOrNiy: '19810815 200701 2 006',
    category: 'peminatan',
    isActive: true,
    notes: 'Tutor Pengampu Antropologi & Kajian Budaya'
  },

  // === MUATAN LOKAL & BAHASA PILIHAN ===
  'bahasa-daerah': {
    subjectId: 'bahasa-daerah',
    subjectName: 'Bahasa Daerah (Sunda / Jawa)',
    teacherName: 'Ki Dedi Supardi, S.Pd.',
    phone: '',
    nipOrNiy: '19760920 200501 1 003',
    category: 'muatan-lokal',
    isActive: true,
    notes: 'Tutor Muatan Lokal Bahasa & Budaya Daerah'
  },
  'bahasa-arab': {
    subjectId: 'bahasa-arab',
    subjectName: 'Bahasa Arab',
    teacherName: 'Ust. Zulkifli, Lc., M.Pd.I.',
    phone: '',
    nipOrNiy: '19880112 201502 1 004',
    category: 'peminatan',
    isActive: true,
    notes: 'Tutor Bahasa Arab & Qira\'ah'
  },
  'bahasa-jepang': {
    subjectId: 'bahasa-jepang',
    subjectName: 'Bahasa Jepang',
    teacherName: 'Rina Sakura, S.Pd., M.Ed.',
    phone: '',
    nipOrNiy: '19920318 202102 2 001',
    category: 'peminatan',
    isActive: true,
    notes: 'Tutor Bahasa Jepang & Komunikasi Internasional'
  },

  // === KELOMPOK PEMBERDAYAAN ===
  'pemberdayaan': {
    subjectId: 'pemberdayaan',
    subjectName: 'Pemberdayaan',
    teacherName: 'Drs. H. Yohanes Tarmidi, M.Pd.',
    phone: '',
    nipOrNiy: '19750819 200501 1 004',
    category: 'pemberdayaan',
    isActive: true,
    notes: 'Tutor Kepemimpinan & Potensi Lokal'
  },
  'kewirausahaan': {
    subjectId: 'kewirausahaan',
    subjectName: 'Kewirausahaan & Bisnis Mandiri',
    teacherName: 'Ir. Hendro Wicaksono, M.M.',
    phone: '',
    nipOrNiy: '19800612 200701 1 008',
    category: 'pemberdayaan',
    isActive: true,
    notes: 'Tutor Wirausaha & Bisnis Komunitas'
  },

  // === KELOMPOK KETERAMPILAN / PROGRAM KEAHLIAN (VOKASI) ===
  'tata-busana': {
    subjectId: 'tata-busana',
    subjectName: 'Keterampilan: Tata Busana',
    teacherName: 'Hj. Ratna Sari, S.Pd.',
    phone: '',
    nipOrNiy: '19810903 200701 2 009',
    category: 'keterampilan-vokasi',
    isActive: true,
    notes: 'Instruktur Vokasi Pola, Menjahit & Tata Busana Mandiri'
  },
  'tata-kecantikan': {
    subjectId: 'tata-kecantikan',
    subjectName: 'Keterampilan: Tata Kecantikan',
    teacherName: 'Maya Anggraini, S.Pd.',
    phone: '',
    nipOrNiy: '19881225 201302 2 007',
    category: 'keterampilan-vokasi',
    isActive: true,
    notes: 'Instruktur Vokasi Perawatan Kulit & Tata Rias Wajah'
  },
  'tata-boga': {
    subjectId: 'tata-boga',
    subjectName: 'Keterampilan: Tata Boga',
    teacherName: 'Chef Wahyu Hidayat, S.Pd.',
    phone: '',
    nipOrNiy: '19850110 201102 1 005',
    category: 'keterampilan-vokasi',
    isActive: true,
    notes: 'Instruktur Vokasi Kuliner Nusantara, Baking & Pastry'
  },
  'keterampilan-komputer': {
    subjectId: 'keterampilan-komputer',
    subjectName: 'Keterampilan: Komputer',
    teacherName: 'Irfan Maulana, S.Kom.',
    phone: '',
    nipOrNiy: '19930417 202001 1 001',
    category: 'keterampilan-vokasi',
    isActive: true,
    notes: 'Instruktur Vokasi Aplikasi Komputer, Desain Grafis & Digital'
  },
  'robotika-iot': {
    subjectId: 'robotika-iot',
    subjectName: 'Keterampilan: Robotika & IoT',
    teacherName: 'Aldi Pratama, S.T.',
    phone: '',
    nipOrNiy: '19940822 202101 1 002',
    category: 'keterampilan-vokasi',
    isActive: true,
    notes: 'Instruktur Otomasi & Internet of Things'
  },
  'desain-web': {
    subjectId: 'desain-web',
    subjectName: 'Keterampilan: Desain Web & Multimedia',
    teacherName: 'Fikri Haikal, S.Kom.',
    phone: '',
    nipOrNiy: '19950519 202201 1 001',
    category: 'keterampilan-vokasi',
    isActive: true,
    notes: 'Instruktur Desain Web & Multimedia'
  },
  'pertanian-hidroponik': {
    subjectId: 'pertanian-hidroponik',
    subjectName: 'Keterampilan: Pertanian Hidroponik & Urban Farming',
    teacherName: 'Ir. Agus Santoso',
    phone: '',
    nipOrNiy: '19790214 200602 1 005',
    category: 'keterampilan-vokasi',
    isActive: true,
    notes: 'Instruktur Urban Farming & Hidroponik'
  },
  'peternakan-unggas': {
    subjectId: 'peternakan-unggas',
    subjectName: 'Keterampilan: Budidaya & Peternakan Unggas',
    teacherName: 'Dr. Ir. Joko Susilo, M.P.',
    phone: '',
    nipOrNiy: '19780315 200501 1 007',
    category: 'keterampilan-vokasi',
    isActive: true,
    notes: 'Instruktur Budidaya Ternak & Agribisnis'
  }
};

// =========================================================================
// STRUCTURED PRESET GROUPS FOR FAST ONE-CLICK POPULATION
// =========================================================================

export interface SubjectPresetItem {
  id: string;
  name: string;
  category: 'wajib' | 'pemberdayaan' | 'keterampilan-vokasi' | 'muatan-lokal' | 'peminatan';
  group: string;
  defaultTeacherName?: string;
  defaultNip?: string;
  defaultNotes?: string;
}

// 📘 1. Paket B — Setara SMP (Kelas 7–9) Preset Baku
export const PAKET_B_SUBJECTS_PRESET: SubjectPresetItem[] = [
  { id: 'pendidikan-agama', name: 'Pendidikan Agama dan Budi Pekerti', category: 'wajib', group: 'Paket B (Setara SMP)', defaultTeacherName: 'Ust. Ahmad Hidayat, S.Pd.I.', defaultNotes: 'Tutor Pengampu Keagamaan & Budi Pekerti' },
  { id: 'pendidikan-pancasila', name: 'Pendidikan Pancasila', category: 'wajib', group: 'Paket B (Setara SMP)', defaultTeacherName: 'Dra. Endang Sulistyowati, M.Pd.', defaultNotes: 'Tutor Pendidikan Pancasila & Kewarganegaraan' },
  { id: 'bahasa-indonesia', name: 'Bahasa Indonesia', category: 'wajib', group: 'Paket B (Setara SMP)', defaultTeacherName: 'Nurul Fadhilah, S.Pd.', defaultNotes: 'Tutor Literasi & Bahasa Indonesia' },
  { id: 'matematika', name: 'Matematika', category: 'wajib', group: 'Paket B (Setara SMP)', defaultTeacherName: 'Rudi Hartono, S.Si., M.Pd.', defaultNotes: 'Tutor Matematika & Aritmatika Sosial' },
  { id: 'ipa', name: 'IPA (Ilmu Pengetahuan Alam)', category: 'wajib', group: 'Paket B (Setara SMP)', defaultTeacherName: 'Dr. Hendra Gunawan, M.Si.', defaultNotes: 'Tutor Sains Terpadu' },
  { id: 'ips', name: 'IPS (Ilmu Pengetahuan Sosial)', category: 'wajib', group: 'Paket B (Setara SMP)', defaultTeacherName: 'Siti Rahmawati, S.Pd.', defaultNotes: 'Tutor Sejarah & Sosial Kemasyarakatan' },
  { id: 'bahasa-inggris', name: 'Bahasa Inggris', category: 'wajib', group: 'Paket B (Setara SMP)', defaultTeacherName: 'David Pratama, S.Pd., M.Hum.', defaultNotes: 'Tutor English Communication & Literacy' },
  { id: 'pjok', name: 'PJOK', category: 'wajib', group: 'Paket B (Setara SMP)', defaultTeacherName: 'Rian Firmansyah, S.Pd.', defaultNotes: 'Tutor Kebugaran Jasmani & Kesehatan' },
  { id: 'seni-budaya', name: 'Seni dan Budaya', category: 'wajib', group: 'Paket B (Setara SMP)', defaultTeacherName: 'Dewi Lestari, S.Sn.', defaultNotes: 'Tutor Seni Rupa, Musik & Kriya' },
  { id: 'informatika', name: 'Informatika', category: 'wajib', group: 'Paket B (Setara SMP)', defaultTeacherName: 'Bagus Setiawan, S.Kom.', defaultNotes: 'Tutor Berpikir Komputasional & Digital' },
  { id: 'pemberdayaan', name: 'Pemberdayaan', category: 'pemberdayaan', group: 'Paket B (Setara SMP)', defaultTeacherName: 'Drs. H. Yohanes Tarmidi, M.Pd.', defaultNotes: 'Tutor Kepemimpinan & Potensi Diri' },
  { id: 'tata-busana', name: 'Keterampilan: Tata Busana', category: 'keterampilan-vokasi', group: 'Paket B (Setara SMP)', defaultTeacherName: 'Hj. Ratna Sari, S.Pd.', defaultNotes: 'Instruktur Vokasi Tata Busana' },
  { id: 'tata-kecantikan', name: 'Keterampilan: Tata Kecantikan', category: 'keterampilan-vokasi', group: 'Paket B (Setara SMP)', defaultTeacherName: 'Maya Anggraini, S.Pd.', defaultNotes: 'Instruktur Vokasi Tata Kecantikan' },
  { id: 'tata-boga', name: 'Keterampilan: Tata Boga', category: 'keterampilan-vokasi', group: 'Paket B (Setara SMP)', defaultTeacherName: 'Chef Wahyu Hidayat, S.Pd.', defaultNotes: 'Instruktur Vokasi Tata Boga & Kuliner' },
  { id: 'keterampilan-komputer', name: 'Keterampilan: Komputer', category: 'keterampilan-vokasi', group: 'Paket B (Setara SMP)', defaultTeacherName: 'Irfan Maulana, S.Kom.', defaultNotes: 'Instruktur Vokasi Komputer & Desain' }
];

// 📕 2. Paket C — Setara SMA (Kelas 10–12) Mapel Wajib Baku
export const PAKET_C_WAJIB_PRESET: SubjectPresetItem[] = [
  { id: 'pendidikan-agama', name: 'Pendidikan Agama dan Budi Pekerti', category: 'wajib', group: 'Paket C (Wajib Umum SMA)', defaultTeacherName: 'Ust. Ahmad Hidayat, S.Pd.I.', defaultNotes: 'Tutor Pengampu Keagamaan & Budi Pekerti' },
  { id: 'pendidikan-pancasila', name: 'Pendidikan Pancasila', category: 'wajib', group: 'Paket C (Wajib Umum SMA)', defaultTeacherName: 'Dra. Endang Sulistyowati, M.Pd.', defaultNotes: 'Tutor Pendidikan Pancasila & Hukum' },
  { id: 'bahasa-indonesia', name: 'Bahasa Indonesia', category: 'wajib', group: 'Paket C (Wajib Umum SMA)', defaultTeacherName: 'Nurul Fadhilah, S.Pd.', defaultNotes: 'Tutor Literasi & Artikel Ilmiah' },
  { id: 'matematika', name: 'Matematika', category: 'wajib', group: 'Paket C (Wajib Umum SMA)', defaultTeacherName: 'Rudi Hartono, S.Si., M.Pd.', defaultNotes: 'Tutor Matematika & Kalkulus Terapan' },
  { id: 'bahasa-inggris', name: 'Bahasa Inggris', category: 'wajib', group: 'Paket C (Wajib Umum SMA)', defaultTeacherName: 'David Pratama, S.Pd., M.Hum.', defaultNotes: 'Tutor English Academic & Business Communication' },
  { id: 'sejarah', name: 'Sejarah', category: 'wajib', group: 'Paket C (Wajib Umum SMA)', defaultTeacherName: 'Drs. Agus Suryana, M.Hum.', defaultNotes: 'Tutor Sejarah Nasional & Dunia' },
  { id: 'pjok', name: 'PJOK', category: 'wajib', group: 'Paket C (Wajib Umum SMA)', defaultTeacherName: 'Rian Firmansyah, S.Pd.', defaultNotes: 'Tutor Kebugaran Jasmani & Pola Hidup Sehat' },
  { id: 'seni-budaya', name: 'Seni dan Budaya', category: 'wajib', group: 'Paket C (Wajib Umum SMA)', defaultTeacherName: 'Dewi Lestari, S.Sn.', defaultNotes: 'Tutor Seni & Budaya Kontemporer' },
  { id: 'informatika', name: 'Informatika', category: 'wajib', group: 'Paket C (Wajib Umum SMA)', defaultTeacherName: 'Bagus Setiawan, S.Kom.', defaultNotes: 'Tutor Pemrograman & Keamanan Siber' },
  { id: 'pemberdayaan', name: 'Pemberdayaan', category: 'pemberdayaan', group: 'Paket C (Wajib Umum SMA)', defaultTeacherName: 'Drs. H. Yohanes Tarmidi, M.Pd.', defaultNotes: 'Tutor Pengembangan Diri & Aksi Komunitas' },
  { id: 'tata-busana', name: 'Keterampilan: Tata Busana', category: 'keterampilan-vokasi', group: 'Paket C (Wajib Umum SMA)', defaultTeacherName: 'Hj. Ratna Sari, S.Pd.', defaultNotes: 'Instruktur Vokasi Tata Busana Mandiri' },
  { id: 'tata-kecantikan', name: 'Keterampilan: Tata Kecantikan', category: 'keterampilan-vokasi', group: 'Paket C (Wajib Umum SMA)', defaultTeacherName: 'Maya Anggraini, S.Pd.', defaultNotes: 'Instruktur Vokasi Tata Kecantikan & Estetika' },
  { id: 'tata-boga', name: 'Keterampilan: Tata Boga', category: 'keterampilan-vokasi', group: 'Paket C (Wajib Umum SMA)', defaultTeacherName: 'Chef Wahyu Hidayat, S.Pd.', defaultNotes: 'Instruktur Vokasi Tata Boga & Kuliner' },
  { id: 'keterampilan-komputer', name: 'Keterampilan: Komputer', category: 'keterampilan-vokasi', group: 'Paket C (Wajib Umum SMA)', defaultTeacherName: 'Irfan Maulana, S.Kom.', defaultNotes: 'Instruktur Vokasi Komputer & Desain Grafis' }
];

// 🔬 3. Paket C — Pilihan IPA & Sains
export const PAKET_C_IPA_PRESET: SubjectPresetItem[] = [
  { id: 'fisika', name: 'Fisika', category: 'peminatan', group: 'Paket C (Pilihan IPA)', defaultTeacherName: 'Bambang Irawan, S.Si., M.Pd.', defaultNotes: 'Tutor Peminatan Fisika Terapan' },
  { id: 'kimia', name: 'Kimia', category: 'peminatan', group: 'Paket C (Pilihan IPA)', defaultTeacherName: 'Dr. Indah Permatasari, M.Si.', defaultNotes: 'Tutor Peminatan Kimia Terapan' },
  { id: 'biologi', name: 'Biologi', category: 'peminatan', group: 'Paket C (Pilihan IPA)', defaultTeacherName: 'Tri Wahyuni, S.Si., M.Biotech.', defaultNotes: 'Tutor Peminatan Biologi & Bioteknologi' },
  { id: 'ipa', name: 'IPA dan/atau Sains Terkait Pilihan', category: 'peminatan', group: 'Paket C (Pilihan IPA)', defaultTeacherName: 'Dr. Hendra Gunawan, M.Si.', defaultNotes: 'Tutor Sains Pilihan Terintegrasi' }
];

// 📊 4. Paket C — Pilihan IPS & Sosial Humaniora
export const PAKET_C_IPS_PRESET: SubjectPresetItem[] = [
  { id: 'ekonomi', name: 'Ekonomi dan Akuntansi', category: 'peminatan', group: 'Paket C (Pilihan IPS)', defaultTeacherName: 'Farhan Maulana, S.E., M.M.', defaultNotes: 'Tutor Peminatan Ekonomi & Manajemen' },
  { id: 'geografi', name: 'Geografi', category: 'peminatan', group: 'Paket C (Pilihan IPS)', defaultTeacherName: 'Dra. Sri Wahyuni, M.Pd.', defaultNotes: 'Tutor Peminatan Geografi & Geospasial' },
  { id: 'sosiologi', name: 'Sosiologi', category: 'peminatan', group: 'Paket C (Pilihan IPS)', defaultTeacherName: 'Rahmat Kurnia, S.Sos., M.Si.', defaultNotes: 'Tutor Peminatan Sosiologi Masyarakat' },
  { id: 'antropologi', name: 'Antropologi', category: 'peminatan', group: 'Paket C (Pilihan IPS)', defaultTeacherName: 'Dr. Lestari Handayani, M.Hum.', defaultNotes: 'Tutor Antropologi & Etnografi' },
  { id: 'ips', name: 'IPS dan/atau Sosial Terkait Pilihan', category: 'peminatan', group: 'Paket C (Pilihan IPS)', defaultTeacherName: 'Siti Rahmawati, S.Pd.', defaultNotes: 'Tutor Sosial Humaniora Terintegrasi' }
];

// 🛠️ 5. Keterampilan Vokasi & Pemberdayaan
export const VOKASI_PEMBERDAYAAN_PRESET: SubjectPresetItem[] = [
  { id: 'tata-busana', name: 'Keterampilan: Tata Busana', category: 'keterampilan-vokasi', group: 'Vokasi Kejuruan', defaultTeacherName: 'Hj. Ratna Sari, S.Pd.', defaultNotes: 'Instruktur Vokasi Pola & Tata Busana' },
  { id: 'tata-kecantikan', name: 'Keterampilan: Tata Kecantikan', category: 'keterampilan-vokasi', group: 'Vokasi Kejuruan', defaultTeacherName: 'Maya Anggraini, S.Pd.', defaultNotes: 'Instruktur Vokasi Estetika & Tata Rias Wajah' },
  { id: 'tata-boga', name: 'Keterampilan: Tata Boga', category: 'keterampilan-vokasi', group: 'Vokasi Kejuruan', defaultTeacherName: 'Chef Wahyu Hidayat, S.Pd.', defaultNotes: 'Instruktur Vokasi Kuliner Nusantara & Baking' },
  { id: 'keterampilan-komputer', name: 'Keterampilan: Komputer', category: 'keterampilan-vokasi', group: 'Vokasi Kejuruan', defaultTeacherName: 'Irfan Maulana, S.Kom.', defaultNotes: 'Instruktur Vokasi Komputer & Desain Grafis' },
  { id: 'robotika-iot', name: 'Keterampilan: Robotika & IoT', category: 'keterampilan-vokasi', group: 'Vokasi Kejuruan', defaultTeacherName: 'Aldi Pratama, S.T.', defaultNotes: 'Instruktur Robotika & IoT' },
  { id: 'desain-web', name: 'Keterampilan: Desain Web & Multimedia', category: 'keterampilan-vokasi', group: 'Vokasi Kejuruan', defaultTeacherName: 'Fikri Haikal, S.Kom.', defaultNotes: 'Instruktur Desain Web & Multimedia' },
  { id: 'pertanian-hidroponik', name: 'Keterampilan: Pertanian Hidroponik', category: 'keterampilan-vokasi', group: 'Vokasi Kejuruan', defaultTeacherName: 'Ir. Agus Santoso', defaultNotes: 'Instruktur Hidroponik & Urban Farming' },
  { id: 'peternakan-unggas', name: 'Keterampilan: Budidaya & Peternakan', category: 'keterampilan-vokasi', group: 'Vokasi Kejuruan', defaultTeacherName: 'Dr. Ir. Joko Susilo, M.P.', defaultNotes: 'Instruktur Agribisnis & Peternakan' },
  { id: 'kewirausahaan', name: 'Kewirausahaan & Bisnis Mandiri', category: 'pemberdayaan', group: 'Pemberdayaan', defaultTeacherName: 'Ir. Hendro Wicaksono, M.M.', defaultNotes: 'Tutor Wirausaha & Bisnis Komunitas' }
];

// 🌐 6. Bahasa Pilihan & Muatan Lokal
export const BAHASA_MULOK_PRESET: SubjectPresetItem[] = [
  { id: 'bahasa-daerah', name: 'Bahasa Daerah (Sunda / Jawa)', category: 'muatan-lokal', group: 'Muatan Lokal', defaultTeacherName: 'Ki Dedi Supardi, S.Pd.', defaultNotes: 'Tutor Muatan Lokal Bahasa Daerah' },
  { id: 'bahasa-arab', name: 'Bahasa Arab', category: 'peminatan', group: 'Bahasa Asing', defaultTeacherName: 'Ust. Zulkifli, Lc., M.Pd.I.', defaultNotes: 'Tutor Bahasa Arab & Qira\'ah' },
  { id: 'bahasa-jepang', name: 'Bahasa Jepang', category: 'peminatan', group: 'Bahasa Asing', defaultTeacherName: 'Rina Sakura, S.Pd., M.Ed.', defaultNotes: 'Tutor Bahasa Jepang & Budaya' }
];

// Aggregated presets for easy iteration
export const POPULAR_SUBJECT_PRESETS: SubjectPresetItem[] = [
  ...PAKET_B_SUBJECTS_PRESET,
  ...PAKET_C_WAJIB_PRESET,
  ...PAKET_C_IPA_PRESET,
  ...PAKET_C_IPS_PRESET,
  ...VOKASI_PEMBERDAYAAN_PRESET,
  ...BAHASA_MULOK_PRESET
];

const TEACHERS_STORAGE_KEY = 'pkbm_subject_teachers_v3';

// Helper to extract clean subject key from a module ID
export const extractSubjectKey = (moduleIdOrSubjectId: string): string => {
  if (!moduleIdOrSubjectId) return 'tata-boga';
  const clean = moduleIdOrSubjectId.toLowerCase();
  
  // Direct match in ALL_SUBJECTS or presets
  const foundDirect = ALL_SUBJECTS.find(s => clean === s.id || clean.endsWith(s.id));
  if (foundDirect) return foundDirect.id;

  for (const s of ALL_SUBJECTS) {
    if (clean.includes(s.id)) return s.id;
  }
  return clean.replace(/[^a-z0-9-_]/g, '-');
};

export const loadSubjectTeachers = (): Record<string, SubjectTeacher> => {
  if (typeof window === 'undefined') return INITIAL_SUBJECT_TEACHERS;
  try {
    const raw = localStorage.getItem(TEACHERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        // Strip auto-populated primary phone from subjects
        let hasAutoPrimary = false;
        const cleaned: Record<string, SubjectTeacher> = {};
        for (const [k, v] of Object.entries(parsed as Record<string, SubjectTeacher>)) {
          if (v.phone === '085722271680' || v.phone === '0857-2227-1680') {
            hasAutoPrimary = true;
            cleaned[k] = { ...v, phone: '' };
          } else {
            cleaned[k] = v;
          }
        }
        if (hasAutoPrimary) {
          localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(cleaned));
        }
        return cleaned;
      }
    }
  } catch (e) {
    console.error('Error loading subject teachers', e);
  }
  return INITIAL_SUBJECT_TEACHERS;
};

export const clearAllTeacherPhones = (
  customTeachers?: Record<string, SubjectTeacher>
): Record<string, SubjectTeacher> => {
  const current = customTeachers || loadSubjectTeachers();
  const updated: Record<string, SubjectTeacher> = {};

  Object.entries(current).forEach(([key, teacher]) => {
    updated[key] = {
      ...teacher,
      phone: ''
    };
  });

  saveSubjectTeachers(updated);
  return updated;
};

export const saveSubjectTeachers = (teachers: Record<string, SubjectTeacher>): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(teachers));
    window.dispatchEvent(new CustomEvent('pkbm_subject_teachers_changed', { detail: teachers }));
  } catch (e) {
    console.error('Error saving subject teachers', e);
  }
};

export const deleteSubjectTeacher = (subjectId: string): Record<string, SubjectTeacher> => {
  const current = loadSubjectTeachers();
  const updated = { ...current };
  delete updated[subjectId];
  saveSubjectTeachers(updated);
  return updated;
};

export const toggleSubjectTeacherActive = (subjectId: string): Record<string, SubjectTeacher> => {
  const current = loadSubjectTeachers();
  const existing = current[subjectId];
  if (!existing) return current;
  const updated: Record<string, SubjectTeacher> = {
    ...current,
    [subjectId]: {
      ...existing,
      isActive: existing.isActive === false ? true : false
    }
  };
  saveSubjectTeachers(updated);
  return updated;
};

export const resetSubjectTeachers = (): Record<string, SubjectTeacher> => {
  saveSubjectTeachers(INITIAL_SUBJECT_TEACHERS);
  return INITIAL_SUBJECT_TEACHERS;
};

/**
 * Resets/Clears ONLY teacher names from all subjects (setting teacherName to empty string)
 * while preserving all subject categories, custom subjects, phone numbers, and institution settings.
 */
export const clearAllTeacherNames = (
  customTeachers?: Record<string, SubjectTeacher>
): Record<string, SubjectTeacher> => {
  const current = customTeachers || loadSubjectTeachers();
  const updated: Record<string, SubjectTeacher> = {};

  Object.entries(current).forEach(([key, teacher]) => {
    updated[key] = {
      ...teacher,
      teacherName: '',
      nipOrNiy: ''
    };
  });

  saveSubjectTeachers(updated);
  return updated;
};

export const getTeacherForSubject = (
  moduleIdOrSubjectId: string,
  customTeachers?: Record<string, SubjectTeacher>,
  fallbackPhone?: string,
  fallbackName?: string
): SubjectTeacher => {
  const key = extractSubjectKey(moduleIdOrSubjectId);
  const teachers = customTeachers || loadSubjectTeachers();
  
  if (teachers[key]) {
    return teachers[key];
  }

  // Find matching subject from meta
  const meta = ALL_SUBJECTS.find(s => s.id === key);
  return {
    subjectId: key,
    subjectName: meta?.name || 'Mata Pelajaran',
    teacherName: fallbackName || 'Drs. H. Yohanes Tarmidi, M.Pd.',
    phone: fallbackPhone || '',
    category: meta?.category || 'wajib',
    isActive: true,
    notes: 'Tutor Pengampu'
  };
};

export const updateTeacherForSubject = (
  subjectId: string,
  teacherData: Partial<SubjectTeacher>
): Record<string, SubjectTeacher> => {
  const current = loadSubjectTeachers();
  const key = extractSubjectKey(subjectId);
  const existing = current[key] || {
    subjectId: key,
    subjectName: ALL_SUBJECTS.find(s => s.id === key)?.name || key,
    teacherName: 'Tutor Mapel',
    phone: '',
    isActive: true
  };

  const updated: Record<string, SubjectTeacher> = {
    ...current,
    [key]: {
      ...existing,
      ...teacherData,
      subjectId: key
    }
  };

  saveSubjectTeachers(updated);
  return updated;
};

/**
 * Returns array of all teachers merged with ALL_SUBJECTS
 */
export const getAllTeachersList = (
  customTeachers?: Record<string, SubjectTeacher>,
  fallbackPhone?: string
): SubjectTeacher[] => {
  const current = customTeachers || loadSubjectTeachers();
  const result: SubjectTeacher[] = [];
  const processed = new Set<string>();

  Object.entries(current).forEach(([key, val]) => {
    const standardMeta = ALL_SUBJECTS.find(s => s.id === key);
    result.push({
      subjectId: key,
      subjectName: val.subjectName || standardMeta?.name || key,
      teacherName: val.teacherName || 'Tutor Pengampu Mapel',
      phone: val.phone || fallbackPhone || '',
      nipOrNiy: val.nipOrNiy || '-',
      category: val.category || standardMeta?.category || 'wajib',
      isActive: val.isActive !== false,
      notes: val.notes || (standardMeta ? `Tutor ${standardMeta.name}` : ''),
      customSubject: val.customSubject || !standardMeta,
      email: val.email
    });
    processed.add(key);
  });

  ALL_SUBJECTS.forEach(sub => {
    if (!processed.has(sub.id)) {
      result.push({
        subjectId: sub.id,
        subjectName: sub.name,
        teacherName: 'Tutor Pengampu Mapel',
        phone: fallbackPhone || '',
        nipOrNiy: '-',
        category: sub.category,
        isActive: true,
        notes: `Tutor ${sub.name}`,
        customSubject: false
      });
    }
  });

  return result;
};

/**
 * Returns only actively synchronized teachers (isActive !== false)
 */
export const getActiveTeachers = (
  customTeachers?: Record<string, SubjectTeacher>,
  fallbackPhone?: string
): SubjectTeacher[] => {
  const all = getAllTeachersList(customTeachers, fallbackPhone);
  return all.filter(t => t.isActive !== false && t.teacherName.trim() !== '');
};

/**
 * Batch import teachers from Excel / Manual import
 */
export const importTeachersBatch = (
  newTeachers: SubjectTeacher[],
  mode: 'merge' | 'replace' = 'merge'
): Record<string, SubjectTeacher> => {
  const current = mode === 'replace' ? {} : loadSubjectTeachers();
  const updated: Record<string, SubjectTeacher> = { ...current };

  newTeachers.forEach(t => {
    const key = extractSubjectKey(t.subjectId || t.subjectName);
    const standardMeta = ALL_SUBJECTS.find(s => s.id === key || s.name.toLowerCase() === t.subjectName.toLowerCase());
    const finalKey = standardMeta ? standardMeta.id : key;

    updated[finalKey] = {
      subjectId: finalKey,
      subjectName: t.subjectName || standardMeta?.name || finalKey,
      teacherName: t.teacherName || 'Tutor Pengampu',
      phone: t.phone || '',
      nipOrNiy: t.nipOrNiy || '-',
      category: t.category || standardMeta?.category || 'wajib',
      isActive: t.isActive !== false,
      notes: t.notes || (standardMeta ? `Tutor ${standardMeta.name}` : ''),
      customSubject: !standardMeta,
      email: t.email
    };
  });

  saveSubjectTeachers(updated);
  return updated;
};

