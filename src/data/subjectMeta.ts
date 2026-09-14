export interface SubjectDefinition {
  id: string;
  name: string;
  category: 'wajib' | 'pemberdayaan' | 'keterampilan-vokasi' | 'muatan-lokal' | 'peminatan';
  icon: string;
  color: string;
  description: string;
  programGroup?: 'paket-b' | 'paket-c-wajib' | 'paket-c-ipa' | 'paket-c-ips' | 'bahasa-mulok' | 'pemberdayaan' | 'vokasi';
  applicablePrograms?: ('paket-b' | 'paket-c')[];
}

export const ALL_SUBJECTS: SubjectDefinition[] = [
  // ==========================================
  // MAPEL UMUM / WAJIB (PAKET B & PAKET C)
  // ==========================================
  {
    id: 'pendidikan-agama',
    name: 'Pendidikan Agama dan Budi Pekerti',
    category: 'wajib',
    icon: 'BookOpen',
    color: 'emerald',
    description: 'Penguatan akhlak mulia, keimanan, toleransi, dan implementasi nilai ibadah dalam keseharian homeschooling.',
    applicablePrograms: ['paket-b', 'paket-c'],
    programGroup: 'paket-b'
  },
  {
    id: 'pendidikan-pancasila',
    name: 'Pendidikan Pancasila',
    category: 'wajib',
    icon: 'ShieldCheck',
    color: 'rose',
    description: 'Konstitusi, hak & kewajiban warga negara, norma sosial, musyawarah, dan wawasan kebangsaan NKRI.',
    applicablePrograms: ['paket-b', 'paket-c'],
    programGroup: 'paket-b'
  },
  {
    id: 'bahasa-indonesia',
    name: 'Bahasa Indonesia',
    category: 'wajib',
    icon: 'Feather',
    color: 'amber',
    description: 'Keterampilan literasi, teks deskripsi, narasi, eksposisi, prosedur, editorial, artikel ilmiah, dan sastra.',
    applicablePrograms: ['paket-b', 'paket-c'],
    programGroup: 'paket-b'
  },
  {
    id: 'matematika',
    name: 'Matematika',
    category: 'wajib',
    icon: 'Calculator',
    color: 'blue',
    description: 'Aritmatika sosial, aljabar, geometri, statistika kontekstual, kalkulus dasar, dan pemecahan masalah nyata.',
    applicablePrograms: ['paket-b', 'paket-c'],
    programGroup: 'paket-b'
  },
  {
    id: 'ipa',
    name: 'Ilmu Pengetahuan Alam (IPA)',
    category: 'wajib',
    icon: 'Atom',
    color: 'teal',
    description: 'Eksperimen sains rumahan, biologi, fisika terapan, kimia lingkungan, dan ekosistem terpadu.',
    applicablePrograms: ['paket-b', 'paket-c'],
    programGroup: 'paket-b'
  },
  {
    id: 'ips',
    name: 'Ilmu Pengetahuan Sosial (IPS)',
    category: 'wajib',
    icon: 'Globe',
    color: 'cyan',
    description: 'Interaksi keruangan, sejarah nusantara & dunia, literasi finansial keluarga, dinamika masyarakat.',
    applicablePrograms: ['paket-b', 'paket-c'],
    programGroup: 'paket-b'
  },
  {
    id: 'bahasa-inggris',
    name: 'Bahasa Inggris',
    category: 'wajib',
    icon: 'Languages',
    color: 'indigo',
    description: 'Komunikasi fungsional, reading comprehension, writing report, ekspresi opini, dan dialog percakapan global.',
    applicablePrograms: ['paket-b', 'paket-c'],
    programGroup: 'paket-b'
  },
  {
    id: 'sejarah',
    name: 'Sejarah',
    category: 'wajib',
    icon: 'Landmark',
    color: 'amber',
    description: 'Peristiwa sejarah nasional & dunia, dinamika peradaban, pemikiran kritis historis, dan kearifan masa lalu.',
    applicablePrograms: ['paket-c'],
    programGroup: 'paket-c-wajib'
  },
  {
    id: 'pjok',
    name: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    category: 'wajib',
    icon: 'Activity',
    color: 'orange',
    description: 'Kebugaran jasmani mandiri di rumah, pola hidup sehat gizi seimbang, senam ritmik, dan pencegahan cedera.',
    applicablePrograms: ['paket-b', 'paket-c'],
    programGroup: 'paket-b'
  },
  {
    id: 'seni-budaya',
    name: 'Seni dan Budaya',
    category: 'wajib',
    icon: 'Palette',
    color: 'pink',
    description: 'Eksplorasi seni rupa, kriya nusantara, seni musik, desain visual, dan apresiasi karya budaya lokal.',
    applicablePrograms: ['paket-b', 'paket-c'],
    programGroup: 'paket-b'
  },
  {
    id: 'informatika',
    name: 'Informatika',
    category: 'wajib',
    icon: 'Cpu',
    color: 'violet',
    description: 'Berpikir komputasional, algoritma, pemrograman dasar, etika digital, dan keamanan siber.',
    applicablePrograms: ['paket-b', 'paket-c'],
    programGroup: 'paket-b'
  },

  // ==========================================
  // PAKET C — PEMINATAN / PILIHAN IPA & SAINS
  // ==========================================
  {
    id: 'fisika',
    name: 'Fisika',
    category: 'peminatan',
    icon: 'Zap',
    color: 'sky',
    description: 'Mekanika, fluida, termodinamika, gelombang, optika, listrik magnet, dan fisika modern aplikatif.',
    applicablePrograms: ['paket-c'],
    programGroup: 'paket-c-ipa'
  },
  {
    id: 'kimia',
    name: 'Kimia',
    category: 'peminatan',
    icon: 'FlaskConical',
    color: 'purple',
    description: 'Struktur materi, ikatan kimia, stoikiometri, larutan asam-basa, elektrokimia, dan kimia organik rumah tangga.',
    applicablePrograms: ['paket-c'],
    programGroup: 'paket-c-ipa'
  },
  {
    id: 'biologi',
    name: 'Biologi',
    category: 'peminatan',
    icon: 'Dna',
    color: 'emerald',
    description: 'Biologi sel, genetika, metabolisme tubuh, bioteknologi terapan, ekologi modern, dan keanekaragaman hayati.',
    applicablePrograms: ['paket-c'],
    programGroup: 'paket-c-ipa'
  },

  // ==========================================
  // PAKET C — PEMINATAN / PILIHAN IPS & SOSIAL
  // ==========================================
  {
    id: 'ekonomi',
    name: 'Ekonomi dan Akuntansi',
    category: 'peminatan',
    icon: 'TrendingUp',
    color: 'emerald',
    description: 'Teori ekonomi mikro-makro, mekanisme pasar, manajemen keuangan, siklus akuntansi jasa/dagang, dan perpajakan.',
    applicablePrograms: ['paket-c'],
    programGroup: 'paket-c-ips'
  },
  {
    id: 'geografi',
    name: 'Geografi',
    category: 'peminatan',
    icon: 'MapPin',
    color: 'teal',
    description: 'Litosfer, atmosfer, hidrosfer, penginderaan jauh, sistem informasi geospasial (SIG), dan tata ruang wilayah.',
    applicablePrograms: ['paket-c'],
    programGroup: 'paket-c-ips'
  },
  {
    id: 'sosiologi',
    name: 'Sosiologi',
    category: 'peminatan',
    icon: 'Users2',
    color: 'amber',
    description: 'Interaksi sosial, struktur kemasyarakatan, integrasi sosial, resolusi konflik, dan perubahan sosial modern.',
    applicablePrograms: ['paket-c'],
    programGroup: 'paket-c-ips'
  },
  {
    id: 'antropologi',
    name: 'Antropologi',
    category: 'peminatan',
    icon: 'Smile',
    color: 'indigo',
    description: 'Kajian ragam kebudayaan, etnografi nusantara, bahasa, tradisi lisan, dan evolusi peradaban manusia.',
    applicablePrograms: ['paket-c'],
    programGroup: 'paket-c-ips'
  },

  // ==========================================
  // MUATAN LOKAL & BAHASA PILIHAN
  // ==========================================
  {
    id: 'bahasa-daerah',
    name: 'Bahasa Daerah (Sunda / Jawa)',
    category: 'muatan-lokal',
    icon: 'MessageSquare',
    color: 'amber',
    description: 'Tata krama basa (undak-usuk), sastra daerah, carita pondok / babad, tembang, dan kearifan lokal nusantara.',
    applicablePrograms: ['paket-b', 'paket-c'],
    programGroup: 'bahasa-mulok'
  },
  {
    id: 'bahasa-arab',
    name: 'Bahasa Arab',
    category: 'peminatan',
    icon: 'BookMarked',
    color: 'emerald',
    description: 'Qira\'ah, hiwar percakapan, nahwu sharof dasar, insya\' terpadu, dan pemahaman teks bahasa Arab.',
    applicablePrograms: ['paket-b', 'paket-c'],
    programGroup: 'bahasa-mulok'
  },
  {
    id: 'bahasa-jepang',
    name: 'Bahasa Jepang',
    category: 'peminatan',
    icon: 'Languages',
    color: 'rose',
    description: 'Huruf Hiragana/Katakana/Kanji dasar, kaiwa percakapan praktis, dokkai, dan etika budaya Jepang (aisatsu).',
    applicablePrograms: ['paket-c'],
    programGroup: 'bahasa-mulok'
  },

  // ==========================================
  // KELOMPOK KHUSUS: PEMBERDAYAAN
  // ==========================================
  {
    id: 'pemberdayaan',
    name: 'Pemberdayaan',
    category: 'pemberdayaan',
    icon: 'Users',
    color: 'lime',
    description: 'Pengembangan potensi diri, kepemimpinan pemuda, pemetaan potensi lokal, dan aksi sosial kemasyarakatan.',
    applicablePrograms: ['paket-b', 'paket-c'],
    programGroup: 'pemberdayaan'
  },
  {
    id: 'kewirausahaan',
    name: 'Kewirausahaan & Bisnis Mandiri',
    category: 'pemberdayaan',
    icon: 'Briefcase',
    color: 'emerald',
    description: 'Perencanaan usaha (business model canvas), riset pasar, inovasi produk lokal, dan laporan keuangan mandiri.',
    applicablePrograms: ['paket-b', 'paket-c'],
    programGroup: 'pemberdayaan'
  },

  // ==========================================
  // KELOMPOK KHUSUS: KETERAMPILAN / PROGRAM KEAHLIAN (VOKASI)
  // ==========================================
  {
    id: 'tata-busana',
    name: 'Keterampilan: Tata Busana',
    category: 'keterampilan-vokasi',
    icon: 'Scissors',
    color: 'fuchsia',
    description: 'Pengenalan serat kain, teknik menjahit tangan & mesin, pembuatan pola dasar busana, dan kreasi fashion mandiri.',
    applicablePrograms: ['paket-b', 'paket-c'],
    programGroup: 'vokasi'
  },
  {
    id: 'tata-kecantikan',
    name: 'Keterampilan: Tata Kecantikan',
    category: 'keterampilan-vokasi',
    icon: 'Sparkles',
    color: 'purple',
    description: 'Perawatan kulit alami (skincare), sanitasi hygiene salon, rias wajah sehari-hari/panggung, dan tata rias rambut/hijab.',
    applicablePrograms: ['paket-b', 'paket-c'],
    programGroup: 'vokasi'
  },
  {
    id: 'tata-boga',
    name: 'Keterampilan: Tata Boga',
    category: 'keterampilan-vokasi',
    icon: 'UtensilsCrossed',
    color: 'red',
    description: 'Sanitasi dapur (HACCP), teknik pengolahan masakan nusantara, baking & pastry, tata hidang, dan food costing.',
    applicablePrograms: ['paket-b', 'paket-c'],
    programGroup: 'vokasi'
  },
  {
    id: 'keterampilan-komputer',
    name: 'Keterampilan: Komputer',
    category: 'keterampilan-vokasi',
    icon: 'Laptop',
    color: 'sky',
    description: 'Aplikasi perkantoran, desain grafis (Canva/Photoshop), pengolah data & spreadsheet, dan literasi digital praktis.',
    applicablePrograms: ['paket-b', 'paket-c'],
    programGroup: 'vokasi'
  },
  {
    id: 'robotika-iot',
    name: 'Keterampilan: Robotika & IoT',
    category: 'keterampilan-vokasi',
    icon: 'Cpu',
    color: 'cyan',
    description: 'Mikrokontroler Arduino/ESP32, sensor otomatisasi, Internet of Things (IoT), dan robotika cerdas.',
    applicablePrograms: ['paket-b', 'paket-c'],
    programGroup: 'vokasi'
  },
  {
    id: 'desain-web',
    name: 'Keterampilan: Desain Web & Multimedia',
    category: 'keterampilan-vokasi',
    icon: 'Globe2',
    color: 'blue',
    description: 'Dasar web HTML/CSS, UI/UX prototyping dengan Figma, editing video YouTube/TikTok, dan produksi multimedia.',
    applicablePrograms: ['paket-c'],
    programGroup: 'vokasi'
  },
  {
    id: 'pertanian-hidroponik',
    name: 'Keterampilan: Pertanian Hidroponik & Urban Farming',
    category: 'keterampilan-vokasi',
    icon: 'Sprout',
    color: 'green',
    description: 'Sistem hidroponik NFT/DFT, nutrisi AB Mix, budidaya sayur organik rumah tangga, dan agribisnis perkotaan.',
    applicablePrograms: ['paket-b', 'paket-c'],
    programGroup: 'vokasi'
  },
  {
    id: 'peternakan-unggas',
    name: 'Keterampilan: Budidaya & Peternakan Unggas',
    category: 'keterampilan-vokasi',
    icon: 'Egg',
    color: 'amber',
    description: 'Manajemen pakan unggas/ikan lele, kandang ramah lingkungan, pencegahan penyakit ternak, dan pasca panen.',
    applicablePrograms: ['paket-b', 'paket-c'],
    programGroup: 'vokasi'
  }
];

export const GRADE_CONFIG: { grade: number; program: 'paket-b' | 'paket-c'; name: string; phase: string }[] = [
  { grade: 7, program: 'paket-b', name: 'Paket B - Kelas 7 (SMP)', phase: 'Fase D (Tahun ke-1)' },
  { grade: 8, program: 'paket-b', name: 'Paket B - Kelas 8 (SMP)', phase: 'Fase D (Tahun ke-2)' },
  { grade: 9, program: 'paket-b', name: 'Paket B - Kelas 9 (SMP)', phase: 'Fase D (Tahun ke-3)' },
  { grade: 10, program: 'paket-c', name: 'Paket C - Kelas 10 (SMA)', phase: 'Fase E' },
  { grade: 11, program: 'paket-c', name: 'Paket C - Kelas 11 (SMA)', phase: 'Fase F (Tahun ke-1)' },
  { grade: 12, program: 'paket-c', name: 'Paket C - Kelas 12 (SMA)', phase: 'Fase F (Tahun ke-2)' }
];
