import { GradeLevel, LKPDQuestion, LKPDUnit, ProgramType, SubjectModule } from '../types';
import { ALL_SUBJECTS, GRADE_CONFIG } from './subjectMeta';

// Topics curriculum map for each subject & grade level
interface GradeSubjectTopicPlan {
  grade: GradeLevel;
  subjectId: string;
  semester1Topics: { title: string; sub: string; practicalName: string; materials: string[]; steps: string[] }[];
  semester2Topics: { title: string; sub: string; practicalName: string; materials: string[]; steps: string[] }[];
}

// Generate structured authentic curriculum data for 15 subjects x 6 grades = 90 modules
export function generateCurriculumModules(): SubjectModule[] {
  const modules: SubjectModule[] = [];

  for (const gradeConf of GRADE_CONFIG) {
    const grade = gradeConf.grade as GradeLevel;
    const program: ProgramType = gradeConf.program;

    for (const subDef of ALL_SUBJECTS) {
      const units: LKPDUnit[] = [];

      // Generate 8 units per academic year (4 for S1, 4 for S2)
      for (let u = 1; u <= 8; u++) {
        const semester: 1 | 2 = u <= 4 ? 1 : 2;
        const unitInSem = semester === 1 ? u : u - 4;

        const topicInfo = getTopicContent(grade, subDef.id, semester, unitInSem);

        const unit: LKPDUnit = {
          id: `lkpd-${grade}-${subDef.id}-u${u}`,
          unitNumber: u,
          semester,
          topic: topicInfo.topic,
          subtopic: topicInfo.subtopic,
          allocationWeeks: `Minggu ${unitInSem * 4 - 3} - ${unitInSem * 4} (${unitInSem === 4 ? 'Ujian Modul & Proyek' : '4-6 JP / Mandiri'})`,
          capaianPembelajaran: topicInfo.capaian,
          tujuanPembelajaran: topicInfo.tujuan,
          homeschoolingInstructions: [
            'Pelajari ringkasan materi secara seksama melalui modul ini dan sumber belajar pendukung (modul digital PKBM Buana Mekar / video tutorial).',
            'Diskusikan materi bersama Tutor Pendamping pada sesi konsultasi tatap muka berkala atau daring mandiri.',
            'Lakukan Aktivitas 1 (Pemahaman Konsep) dan Aktivitas 2 (Studi Kasus Kontekstual Homeschooling).',
            'Kerjakan Aktivitas 3 (Praktik / Proyek Nyata) di lingkungan rumah/komunitas dengan pendampingan orang tua/wali.',
            'Unggah bukti foto/video hasil karya atau portofolio praktik ke lembar kerja yang disediakan.',
            'Isi lembar refleksi diri secara jujur untuk mengukur pemahaman dan perkembangan karakter.',
            'Serahkan hasil LKPD kepada Tutor untuk verifikasi, penilaian rubrik, dan feedback pengesahan.'
          ],
          materiSummary: {
            title: topicInfo.materiTitle,
            points: topicInfo.materiPoints,
            deepDiveMarkdown: topicInfo.materiDeepDive
          },
          activity1Pemahaman: {
            instruction: 'Jawablah pertanyaan analisis dan pemahaman konsep di bawah ini dengan argumen yang jelas dan berbasis literasi materi.',
            questions: topicInfo.activity1Questions
          },
          activity2Penerapan: {
            title: topicInfo.activity2Title,
            contextDescription: topicInfo.activity2Context,
            taskInstruction: topicInfo.activity2Instruction,
            guidingQuestions: topicInfo.activity2Guiding
          },
          activity3ProyekPraktik: {
            title: topicInfo.practicalTitle,
            objective: topicInfo.practicalObjective,
            toolsAndMaterials: topicInfo.practicalTools,
            steps: topicInfo.practicalSteps,
            expectedOutput: topicInfo.practicalOutput,
            safetyNotes: topicInfo.practicalSafety,
            evidenceType: topicInfo.evidenceType
          },
          soalEvaluasi: topicInfo.soalEvaluasi,
          refleksiPesertaDidik: [
            'Konsep atau keterampilan baru apa yang paling menarik dan bermanfaat yang saya pelajari pada unit ini?',
            'Kendala atau bagian materi mana yang masih membutuhkan pendalaman atau bantuan bimbingan tutor/orang tua?',
            'Bagaimana cara saya menerapkan materi ini dalam kegiatan harian, kemandirian hidup, atau rencana masa depan saya?',
            'Apa komitmen perbaikan sikap/disiplin belajar yang akan saya terapkan pada pembelajaran unit selanjutnya?'
          ],
          rubrikKeterampilan: topicInfo.rubrikKeterampilan,
          rubrikSikap: [
            { sikap: 'Kemandirian (Self-Directed Learning)', deskripsi: 'Mampu mengatur jadwal belajar mandiri di rumah dan menyelesaikan tugas tanpa paksaan.' },
            { sikap: 'Bernalar Kritis & Tanggung Jawab', deskripsi: 'Menganalisis permasalahan secara logis, teliti, dan menyelesaikan tugas sesuai batas waktu.' },
            { sikap: 'Kreativitas & Daya Inovasi', deskripsi: 'Menghasilkan solusi atau produk karya orisinal dengan memanfaatkan sarana di sekitar.' },
            { sikap: 'Gotong Royong & Komunikasi', deskripsi: 'Berinteraksi aktif dengan tutor, keluarga, dan mitra komunitas dalam proyek terpadu.' }
          ],
          kunciJawabanDanPedoman: {
            pemahamanKey: topicInfo.pemahamanKey,
            penerapanKey: topicInfo.penerapanKey,
            evaluasiKey: topicInfo.evaluasiKey,
            tutorNotes: topicInfo.tutorNotes
          }
        };

        units.push(unit);
      }

      modules.push({
        id: `${program}-${grade}-${subDef.id}`,
        name: subDef.name,
        category: subDef.category,
        icon: subDef.icon,
        color: subDef.color,
        description: subDef.description,
        grade,
        program,
        academicYear: '2026/2027',
        units
      });
    }
  }

  return modules;
}

// Helper function to craft authentic, differentiated curricular details per subject & grade level
function getTopicContent(grade: GradeLevel, subjectId: string, semester: 1 | 2, unitIndex: number) {
  const isSMP = grade <= 9;
  const gradeStr = `Kelas ${grade}`;
  const semStr = `Semester ${semester}`;

  // Subject-specific tailored topics
  if (subjectId === 'tata-boga') {
    if (isSMP) {
      if (semester === 1) {
        if (unitIndex === 1) {
          return {
            topic: 'Sanitasi, Hygiene & Keamanan Dapur Rumah (HACCP Dasar)',
            subtopic: 'Standar Kebersihan Alat, Bahan, dan Personal Hygiene Homeschooling',
            capaian: 'Peserta didik mampu menerapkan prinsip dasar sanitasi, personal hygiene, serta keselamatan kerja di dapur pengolahan makanan keluarga.',
            tujuan: [
              'Mengidentifikasi potensi bahaya kontaminasi silang pada makanan.',
              'Mempraktikkan standar cuci tangan 6 langkah dan penggunaan APD dapur (celemek, hairnet).',
              'Menyusun checklist sanitasi area kerja dapur mandiri.'
            ],
            materiTitle: 'Prinsip Dasar Hygiene dan Sanitasi Pengolahan Makanan',
            materiPoints: [
              'Personal Hygiene: Kebersihan kuku, rambut, pakaian kerja, dan etika bersin/batuk.',
              'Food Safety Danger Zone: Suhu bahaya pertumbuhan bakteri antara 5°C - 60°C.',
              'Pemisahan Talenan & Pisau: Mencegah kontaminasi antara bahan mentah (daging) dan bahan matang/sayur.',
              'Sanitasi Peralatan & Permukaan: Pembersihan dengan air panas, sabun food-grade, dan pengeringan higienis.'
            ],
            materiDeepDive: 'Sanitasi dapur adalah pondasi utama dalam industri kuliner maupun rumah tangga. Bakteri patogen seperti Salmonella dan E. coli dapat berkembang biak cepat pada rentang suhu 5°C hingga 60°C...',
            activity1Questions: [
              { id: 'q1', type: 'essay' as const, question: 'Jelaskan apa yang dimaksud dengan kontaminasi silang (cross contamination) dan berikan 2 contoh konkret di dapur rumah!', points: 15 },
              { id: 'q2', type: 'essay' as const, question: 'Mengapa rentang suhu 5°C - 60°C disebut "Danger Zone" dalam keamanan pangan?', points: 15 }
            ],
            activity2Title: 'Audit Sanitasi Dapur Mandiri Homeschooling',
            activity2Context: 'Sebagai peserta didik homeschooling, dapur rumah adalah laboratorium kulinermu.',
            activity2Instruction: 'Lakukan audit mandiri pada area dapur rumahmu menggunakan formulir standar HACCP sederhana.',
            activity2Guiding: [
              'Bagaimana pemisahan tempat penyimpanan bahan basah dan kering di dapurmu?',
              'Apakah terdapat pemisahan pisau/talenan untuk unggas mentah dan buah/sayuran siap makan?'
            ],
            practicalTitle: 'Praktik Sanitasi Dapur & Pembuatan Larutan Desinfektan Food-Safe',
            practicalObjective: 'Menerapkan prosedur deep cleaning dapur dan penyimpanan bahan makanan higienis.',
            practicalTools: ['Celemek & hairnet', 'Sabun cuci piring food-grade', 'Lap microfiber 3 warna', 'Checklist audit sanitasi'],
            practicalSteps: [
              'Kenakan APD dapur lengkap (celemek bersih, ikat rambut rapi).',
              'Bersihkan area meja kerja (countertop) dengan teknik searah.',
              'Tata kulkas: letakkan daging mentah di rak paling bawah untuk mencegah tetesan ke makanan lain.',
              'Ambil foto dokumentasi sebelum (before) dan sesudah (after) penataan higienis.'
            ],
            practicalOutput: 'Laporan visual foto before-after penataan dapur higienis beserta formulir audit terisi.',
            practicalSafety: 'Hati-hati saat menggunakan air panas dan pastikan lantai dapur kering agar tidak licin.',
            evidenceType: 'foto' as const,
            soalEvaluasi: generateEvalQuestions([
              { q: 'Suhu zona bahaya (danger zone) pertumbuhan mikroba pada makanan adalah...', opt: ['-10°C s.d 0°C', '5°C s.d 60°C', '75°C s.d 100°C', '100°C s.d 150°C'], ans: '5°C s.d 60°C' },
              { q: 'Talenan warna merah dalam standar dapur internasional diperuntukkan untuk...', opt: ['Sayuran segar', 'Roti dan pastry', 'Daging merah mentah', 'Makanan matang siap saji'], ans: 'Daging merah mentah' },
              { q: 'Tindakan yang tepat saat menyimpan daging ayam mentah di dalam kulkas adalah...', opt: ['Ditaruh di rak paling atas tanpa wadah', 'Ditaruh di pintu kulkas', 'Ditaruh dalam wadah kedap tertutup di rak terbawah', 'Diletakkan bersama buah potong'], ans: 'Ditaruh dalam wadah kedap tertutup di rak terbawah' }
            ]),
            rubrikKeterampilan: standardVocationRubric('Ketepatan penerapan APD & Prosedur Sanitasi'),
            pemahamanKey: 'Kontaminasi silang adalah perpindahan mikroorganisme berbahaya dari satu bahan makanan/alat ke bahan makanan lain...',
            penerapanKey: 'Checklist audit terisi lengkap mencakup aspek kebersihan kulkas, pemisahan pisau, dan ventilasi.',
            evaluasiKey: [
              { questionId: 'ev-1', answer: 'B', explanation: 'Rentang 5-60 derajat Celcius adalah zona subur bakteri berkembang biak.' },
              { questionId: 'ev-2', answer: 'C', explanation: 'Merah untuk raw red meat, hijau untuk vegetables.' }
            ],
            tutorNotes: 'Pastikan peserta didik menyertakan foto diri memakai celemek saat audit dapur.'
          };
        } else if (unitIndex === 2) {
          return createStandardVocationalUnit(grade, subjectId, semester, unitIndex, 'Teknik Pemotongan Sayuran & Bahan Pangan (Knife Skills)', 'Chiffonade, Julienne, Brunoise, Dice, dan Paysanne');
        } else if (unitIndex === 3) {
          return createStandardVocationalUnit(grade, subjectId, semester, unitIndex, 'Pengolahan Aneka Masakan Tradisional Berbasis Unggas & Ikan', 'Teknik Merebus (Boiling), Mengukus (Steaming), dan Menumis (Sauteing)');
        } else {
          return createStandardVocationalUnit(grade, subjectId, semester, unitIndex, 'Ujian Proyek Semester 1: Hidangan 3-Course Nusantara Hemat Energi', 'Menu Pembuka, Menu Utama, dan Minuman Tradisional');
        }
      } else {
        // Semester 2 SMP Tata Boga
        const s2Titles = [
          'Teknik Dasar Baking & Pembuatan Roti Manis Sederhana',
          'Pastry & Kue Tradisional Nusantara (Jajanan Pasar Berbahan Ketan & Singkong)',
          'Food Costing, Perhitungan HPP & Pengemasan Ramah Lingkungan',
          'Proyek Akhir Tahun: Bazar Kuliner Homeschooling Berkelanjutan'
        ];
        return createStandardVocationalUnit(grade, subjectId, semester, unitIndex, s2Titles[unitIndex - 1], `Topik Lanjutan Tata Boga ${gradeStr} ${semStr}`);
      }
    } else {
      // Paket C (Kelas 10, 11, 12) SMA Tata Boga
      const smaTitlesS1 = [
        'HACCP Tingkat Lanjut & Manajemen Dapur Restoran Komersial',
        'Seni Pengolahan Continental Cuisine & Western Entree',
        'Teknik Pembuatan Saus Dasar (Mother Sauces: Bechamel, Veloute, Espagnole, Tomato, Hollandaise)',
        'Proyek Semester 1: Pop-up Fine Dining Experience di Rumah'
      ];
      const smaTitlesS2 = [
        'Artisan Bread, Laminated Dough & Croissant Making',
        'Dessert Plating, Sugar Art & Chocolate Tempering',
        'Business Plan Katering Mandiri & Digital Marketing Kuliner',
        'Proyek Portofolio Akhir: Uji Kompetensi Keahlian (UKK) Tata Boga Mandiri'
      ];
      const selectedTitle = semester === 1 ? smaTitlesS1[unitIndex - 1] : smaTitlesS2[unitIndex - 1];
      return createStandardVocationalUnit(grade, subjectId, semester, unitIndex, selectedTitle, `Vokasi Spesialisasi Tata Boga Tingkat Menengah Atas`);
    }
  }

  // Tata Busana
  if (subjectId === 'tata-busana') {
    const titlesBusana = isSMP
      ? [
          'Pengenalan Serat Tekstil, Alat Jahit Manual & Keselamatan Kerja',
          'Teknik Jahit Tangan (Tusuk Jelujur, Tikam Jejak, Flanel, Feston)',
          'Pengambilan Ukuran Tubuh & Pembuatan Pola Dasar Rok/Blus Skala 1:4',
          'Proyek Semester 1: Pembuatan Pouch / Tote Bag Kreasi Perca',
          'Teknik Mengoperasikan Mesin Jahit Rumah Tangga (Portable & Klasik)',
          'Penyelesaian Tepi Kain, Kelim, dan Pemasangan Ritsleting / Kancing',
          'Pembuatan Pola dan Menjahit Celana Santai / Daster Rumahan',
          'Proyek Semester 2: Fashion Show Karya Busana Santai Ramah Lingkungan'
        ]
      : [
          'Analisis Karakteristik Kain Woven, Knit, dan Serat Organik',
          'Konstruksi Pola Busana Wanita Tingkat Mahir (Sistem Meyneke & Bunka)',
          'Teknik Pemecahan Pola Drapping dan Manipulasi Kain (Smock, Pleats)',
          'Proyek Semester 1: Produksi Blus Kerja dengan Furing & Kerah Kemeja',
          'Pembuatan Pola dan Menjahit Gaun Pesta / Kebaya Modifikasi',
          'Teknik Bordir Manual / Payet (Beading) untuk Busana Eksklusif',
          'Cost Calculation, Standar QC Butik, dan Branding Brand Fashion',
          'Proyek Akhir UKK: Koleksi Busana Siap Pakai (Ready to Wear) 3 Look'
        ];

    const idx = (semester - 1) * 4 + (unitIndex - 1);
    return createStandardVocationalUnit(grade, subjectId, semester, unitIndex, titlesBusana[idx], `Modul Kejuruan Tata Busana PKBM Buana Mekar`);
  }

  // Tata Kecantikan
  if (subjectId === 'tata-kecantikan') {
    const titlesKecantikan = isSMP
      ? [
          'Anatomi Kulit Wajah, Hygiene Sanitasi Alat Salon & Personal Grooming',
          'Teknik Pembersihan Wajah 3 Langkah & Pemijatan Dasar (Face Massage)',
          'Pengenalan Kosmetika Dasar & Rias Wajah Sehari-hari (Daily Natural Look)',
          'Proyek Semester 1: Portofolio Sebelum & Sesudah Perawatan Wajah Alami',
          'Perawatan Rambut & Kulit Kepala (Creambath Tradisional Mandiri)',
          'Teknik Dasar Penataan Rambut (Kepang 3, French Braid, Bun Modern)',
          'Manikur & Pedikur Sederhana di Rumah dengan Bahan Alami',
          'Proyek Semester 2: Simulasi Mini Home-Salon Pelayanan Keluarga'
        ]
      : [
          'Diagnosa Kelainan Kulit Wajah, Kontraindikasi & Terapi Perawatan Medis Ringan',
          'Teknik Rias Wajah Panggung, Fantasi & Karakter (Special Effect Makeup)',
          'Rias Pengantin Tradisional & Modern (Bridal Makeup & Hijab Do)',
          'Proyek Semester 1: Glamour Bridal Makeover Lengkap dengan Wardrobe',
          'Perawatan Tubuh Tradisional (Lulur, Body Scrub, Herbal Spa Aromaterapi)',
          'Pewarnaan Rambut (Coloring, Bleaching, Balayage) & Hair Cutting Dasar',
          'Manajemen Usaha Studio Kecantikan, HPP Jasa & Etika Pelayanan Prima',
          'Proyek Akhir UKK: Portfolio Editorial Beauty Lookbook & Pelayanan Klien'
        ];

    const idx = (semester - 1) * 4 + (unitIndex - 1);
    return createStandardVocationalUnit(grade, subjectId, semester, unitIndex, titlesKecantikan[idx], `Modul Tata Kecantikan Terpadu`);
  }

  // Keterampilan Komputer & Informatika
  if (subjectId === 'keterampilan-komputer' || subjectId === 'informatika') {
    const compTitles = isSMP
      ? [
          'Pengenalan Hardware Komputer, OS, dan Pengelolaan File Terstruktur',
          'Pengolah Kata Lanjutan: Pembuatan Laporan Resmi, Daftar Isi Otomatis & Sitasi',
          'Pengolah Angka (Spreadsheet): Formula Dasar (SUM, AVERAGE, IF, VLOOKUP) & Grafik',
          'Proyek Semester 1: E-Katalog Produk UMKM Keluarga Berbasis Canva/Docs',
          'Desain Grafis Komputer: Prinsip Desain, Typography, dan Desain Feed Sosmed',
          'Pemrograman Blok (Scratch): Logika Perulangan, Percabangan & Mini Game',
          'Literasi Digital, Etika Berinternet (Netiquette) & Perlindungan Data Pribadi',
          'Proyek Semester 2: Pembuatan Website Portofolio Sederhana Google Sites'
        ]
      : [
          'Arsitektur Komputer Modern, Jaringan Komputer (LAN/WAN/IP Subnetting)',
          'Otomatisasi Perkantoran: Advanced Excel (Pivot Table, Macro, Dashboard Interaktif)',
          'UI/UX Design Fundamental: Wireframing & Prototyping Aplikasi dengan Figma',
          'Proyek Semester 1: Desain Prototipe Aplikasi Solusi Masalah Komunitas',
          'Dasar Pemrograman Web: HTML5, Tailwind CSS, dan Logika JavaScript Modern',
          'Manajemen Basis Data Relasional & Analisis Data Menggunakan Spreadsheet/SQL',
          'Keamanan Siber (Cyber Security Awareness), Enkripsi, dan Cloud Computing',
          'Proyek Akhir UKK: Pembuatan Aplikasi Web Interaktif Portofolio Siswa'
        ];
    const idx = (semester - 1) * 4 + (unitIndex - 1);
    return createStandardAcademicUnit(grade, subjectId, semester, unitIndex, compTitles[idx], `Kurikulum Merdeka Bidang Teknologi Informasi`);
  }

  // Matematika
  if (subjectId === 'matematika') {
    const mathTitles = isSMP
      ? [
          'Bilangan Bulat, Pecahan & Rasional dalam Perencanaan Keuangan Keluarga',
          'Aljabar Sederhana: Persamaan & Pertidaksamaan Linear Satu Variabel',
          'Aritmatika Sosial: Untung-Rugi, Diskon, Pajak, Bunga Tunggal & Angsuran',
          'Proyek Semester 1: Analisis Pembukuan Keuangan Usaha Rumahan 1 Bulan',
          'Perbandingan Senilai & Berbalik Nilai dalam Skala Denah Rumah',
          'Geometri: Luas dan Keliling Bangun Datar Gabungan Serta Teorema Pythagoras',
          'Statistika Terapan: Pengumpulan Data Harian, Diagram Batang, Mean, Median, Modus',
          'Proyek Semester 2: Sensus Mini Lingkungan RT & Penyajian Infografis Data'
        ]
      : [
          'Eksponen, Logaritma & Barisan Aritmatika-Geometri dalam Pertumbuhan Investasi',
          'Sistem Persamaan Linear Tiga Variabel (SPLTV) & Program Linear Optimalisasi Laba',
          'Fungsi Kuadrat, Matriks, dan Transformasi Geometri (Rotasi, Refleksi, Dilatasi)',
          'Proyek Semester 1: Model Matematika Optimasi Biaya Produksi Vokasi Siswa',
          'Trigonometri Dasar: Sinus, Cosinus, Tangen dalam Pengukuran Ketinggian Nyata',
          'Kombinatorika, Peluang Kejadian Majemuk & Distribusi Frekuensi',
          'Kalkulus Terapan: Konsep Limit & Turunan Fungsi Aljabar (Laju Perubahan)',
          'Proyek Akhir: Analisis Statistik Prediktif Tren Penjualan Online'
        ];
    const idx = (semester - 1) * 4 + (unitIndex - 1);
    return createStandardAcademicUnit(grade, subjectId, semester, unitIndex, mathTitles[idx], `Matematika Kontekstual Homeschooling`);
  }

  // IPA
  if (subjectId === 'ipa') {
    const ipaTitles = isSMP
      ? [
          'Hakikat Sains, Metode Ilmiah & Pengukuran Besaran dalam Kehidupan Sehari-hari',
          'Zat dan Perubahannya: Wujud Zat, Pemuaian, Perubahan Fisika & Kimia di Rumah',
          'Suhu, Kalor dan Perpindahannya: Efek Termos, Isolator, Konveksi Udara Rumah',
          'Proyek Semester 1: Pembuatan Miniatur Rumah Hemat Energi & Ramah Lingkungan',
          'Struktur Sel, Jaringan Tumbuhan dan Fotosintesis (Percobaan Sach Sederhana)',
          'Sistem Organ Tubuh Manusia: Pencernaan, Peredaran Darah & Pola Hidup Sehat',
          'Ekologi & Keanekaragaman Hayati: Rantai Makanan & Pengolahan Sampah Kompos',
          'Proyek Semester 2: Biopori Lingkungan & Budidaya Tanaman Sayur Hidroponik'
        ]
      : [
          'Fisika Terapan: Mekanika Gerak Lurus, Hukum Newton & Energi Terbarukan (Panel Surya)',
          'Kimia Terapan: Struktur Atom, Ikatan Kimia & Reaksi Asam-Basa dalam Produk Rumah Tangga',
          'Biologi Modern: Genetika, Hukum Mendel, Bioteknologi Konvensional (Fermentasi Yoghurt/Tempe)',
          'Proyek Semester 1: Produksi Pangan Fermentasi Higienis dan Uji Kualitas Laboratorium Rumahan',
          'Termodinamika, Gelombang Elektromagnetik & Optik (Lensa dan Mikroskop)',
          'Kinetika Reaksi, Larutan Elektrolit & Pencemaran Lingkungan Mikroplastik',
          'Ekosistem Global, Perubahan Iklim (Carbon Footprint) & Konservasi Sumber Daya Alam',
          'Proyek Akhir: Pembuatan Filter Air Bertingkat / Sistem Pengolahan Limbah Cair'
        ];
    const idx = (semester - 1) * 4 + (unitIndex - 1);
    return createStandardAcademicUnit(grade, subjectId, semester, unitIndex, ipaTitles[idx], `Sains Eksperimental Homeschooling`);
  }

  // Bahasa Indonesia
  if (subjectId === 'bahasa-indonesia') {
    const indoTitles = isSMP
      ? [
          'Teks Deskripsi: Menarasikan Keindahan Wisata Lokal & Profil Tokoh Teladan',
          'Teks Narasi (Cerpen): Menggali Nilai Moral, Alur Cerita & Penokohan Orisinal',
          'Teks Prosedur: Menyusun Petunjuk Operasional Pembuatan Karya Vokasi Mandiri',
          'Proyek Semester 1: Penerbitan Buku Antologi Cerpen Homeschooling Buana Mekar',
          'Teks Laporan Hasil Observasi (LHO): Meneliti Flora & Fauna di Pekarangan',
          'Teks Berita & Literasi Kritis: Membedakan Fakta, Opini, dan Menangkal Berita Hoaks',
          'Puisi & Musikalisasi: Mengekspresikan Emosi & Kritik Sosial Secara Estetis',
          'Proyek Semester 2: Mini Podcast Wawancara Sosok Inspiratif Komunitas'
        ]
      : [
          'Teks Eksposisi & Argumentasi Kritis: Menulis Esai Opini Kebijakan Publik',
          'Teks Editorial & Artikel Ilmiah Populer untuk Media Massa Cetak/Digital',
          'Surat Lamaran Pekerjaan, Curriculum Vitae (CV) ATS-Friendly & Portofolio Kerja',
          'Proyek Semester 1: Pembuatan Company Profile & Brosur Usaha Kesetaraan',
          'Kritik Sastra & Resensi Novel Klasik/Kontemporer Indonesia',
          'Karya Tulis Ilmiah Sederhana: Metodologi Penelitian Sosial/Eksperimen Mandiri',
          'Debat Formal & Public Speaking: Mengemukakan Gagasan dengan Bahasa Baku',
          'Proyek Akhir: Presentasi Sidang Karya Ilmiah Portofolio Kelulusan'
        ];
    const idx = (semester - 1) * 4 + (unitIndex - 1);
    return createStandardAcademicUnit(grade, subjectId, semester, unitIndex, indoTitles[idx], `Literasi & Berbahasa Indonesia`);
  }

  // Bahasa Inggris
  if (subjectId === 'bahasa-inggris') {
    const engTitles = isSMP
      ? [
          'Greetings, Self-Introduction & Expressing Daily Routines in English',
          'Descriptive Text: Describing Famous People, Tourism Places and Favorite Animals',
          'Procedure Text: How to Make a Creative Craft & Traditional Culinary Recipe',
          'Project Semester 1: English Video Vlog "My Homeschooling Life & Kitchen Tour"',
          'Recount Text: Sharing Memorable Vacation & Learning Experiences',
          'Narrative Text: Folktales, Fables & Moral Values from Indonesian Legends',
          'Giving Advice, Asking for Opinions & Social Expressions in Daily Conversations',
          'Project Semester 2: English Storytelling Showcase with Digital Puppets'
        ]
      : [
          'Formal Exposition Text: Environmental Awareness & Sustainable Lifestyle',
          'Analytical Exposition & Opinion Essay: Future of Remote Work & AI Technology',
          'Business English: Writing Formal Emails, Job Application & Resume Presentation',
          'Project Semester 1: English Mock Interview & Elevator Pitch for Career Portfolio',
          'Discussion Text & Argumentative Debate: Pros and Cons of Digital Education',
          'News Item & Report Text: Reporting Local Community Empowerment Stories',
          'Review Text: Reviewing International Books, Tech Gadgets & Educational Films',
          'Project Final: Comprehensive English Presentation of Vocational Graduation Project'
        ];
    const idx = (semester - 1) * 4 + (unitIndex - 1);
    return createStandardAcademicUnit(grade, subjectId, semester, unitIndex, engTitles[idx], `English for Homeschooling & Global Communication`);
  }

  // Pendidikan Pancasila
  if (subjectId === 'pendidikan-pancasila') {
    const pknTitles = isSMP
      ? [
          'Sejarah Lahirnya Pancasila, Piagam Jakarta, dan Peran Pendiri Bangsa',
          'Norma dan Keadilan: Menegakkan Aturan Hukum dalam Keluarga & Masyarakat',
          'UUD NRI Tahun 1945 sebagai Hukum Dasar Tertinggi Negara Kesatuan RI',
          'Proyek Semester 1: Pembuatan Poster Kampanye Penegakan Norma Sosial di Medsos',
          'Keberagaman Suku, Agama, Ras, dan Antargolongan dalam Bingkai Bhinneka Tunggal Ika',
          'Kerjasama dalam Berbagai Bidang Kehidupan Menuju Kesejahteraan Bersama',
          'Menjaga Keutuhan NKRI dan Wawasan Nusantara Generasi Muda',
          'Proyek Semester 2: Aksi Gotong Royong Bakti Sosial Lingkungan PKBM'
        ]
      : [
          'Pancasila sebagai Meja Statis dan Leitstar Dinamis dalam Kehidupan Berbangsa',
          'Penegakan Hak Asasi Manusia (HAM) & Tantangan Keadilan Hukum di Era Digital',
          'Sistem Hukum dan Peradilan di Indonesia: Struktur MK, MA, dan Kejaksaan',
          'Proyek Semester 1: Simulasi Sidang Musyawarah Perumusan Aturan Komunitas',
          'Demokrasi Pancasila, Pemilu Berkualitas & Partisipasi Politik Generasi Z',
          'Wawasan Nusantara & Geopolitik Indonesia Menghadapi Dinamika Global',
          'Pencegahan Radikalisme, Intoleransi, dan Penguatan Bela Negara Non-Militer',
          'Proyek Akhir: Policy Brief Rekomendasi Solusi Isu Kemasyarakatan Lokal'
        ];
    const idx = (semester - 1) * 4 + (unitIndex - 1);
    return createStandardAcademicUnit(grade, subjectId, semester, unitIndex, pknTitles[idx], `Pendidikan Pancasila & Kewarganegaraan`);
  }

  // Pendidikan Agama
  if (subjectId === 'pendidikan-agama') {
    const agamaTitles = isSMP
      ? [
          'Memperteguh Keimanan, Rukun Iman & Implementasi Akhlak Terpuji kepada Sesama',
          'Thaharah (Bersuci), Shalat Wajib & Sunnah sebagai Tiang Kedisiplinan Pribadi',
          'Membaca Al-Qur\'an / Kitab Suci dengan Tartil, Tajwid & Tadabbur Makna',
          'Proyek Semester 1: Jurnal Harian Ibadah & Refleksi Perbuatan Baik Selama 30 Hari',
          'Keteladanan Para Nabi & Rasul dalam Menghadapi Ujian Kehidupan',
          'Toleransi Beragama, Menghormati Perbedaan & Menjauhi Sikap Ekstremisme',
          'Adab Bermedia Sosial dalam Perspektif Nilai-Nilai Religius & Moralitas',
          'Proyek Semester 2: Bakti Sosial & Berbagi Santunan kepada Warga Kurang Mampu'
        ]
      : [
          'Kajian Kritis Ayat-Ayat Sains & Kosmologi dalam Meneguhkan Rasionalitas Iman',
          'Hukum Muamalah Kontemporer: Transaksi Digital, E-Commerce, dan Etika Finansial',
          'Manajemen Qolbu, Pengendalian Diri & Menjaga Kesehatan Mental Spiritual',
          'Proyek Semester 1: Esai Refleksi Filosofis "Spiritualitas di Era Kecerdasan Buatan"',
          'Peradaban Emas Keilmuan dan Kontribusi Cendekiawan Muslim / Tokoh Agama Dunia',
          'Prinsip Pernikahan, Keluarga Sakinah & Tanggung Jawab Moral Generasi Muda',
          'Etika Lingkungan Hidup (Eco-Theology): Menjaga Bumi sebagai Amanah Ketuhanan',
          'Proyek Akhir: Dokumentasi Aksi Nyata Peduli Lingkungan Berbasis Ajaran Agama'
        ];
    const idx = (semester - 1) * 4 + (unitIndex - 1);
    return createStandardAcademicUnit(grade, subjectId, semester, unitIndex, agamaTitles[idx], `Pendidikan Agama & Budi Pekerti`);
  }

  // Default fallback for other subjects (IPS, PJOK, Seni Budaya, Pemberdayaan)
  const defaultSubjectTitles: Record<string, string[]> = {
    ips: isSMP
      ? [
          'Kondisi Geografis Indonesia, Iklim & Potensi Sumber Daya Alam Lokal',
          'Interaksi Antarruang, Mobilitas Penduduk dan Dinamika Kependudukan',
          'Kegiatan Ekonomi (Produksi, Distribusi, Konsumsi) dan Pembentukan Harga Pasar',
          'Proyek Semester 1: Pemetaan Potensi Ekonomi Kreatif di Sekitar Tempat Tinggal',
          'Kerajaan-Kerajaan Hindu-Buddha dan Islam di Nusantara serta Peninggalannya',
          'Masa Kolonialisme, Pergerakan Nasional & Proklamasi Kemerdekaan 1945',
          'Lembaga Sosial & Perubahan Sosial Budaya Masyarakat di Era Globalisasi',
          'Proyek Semester 2: Laporan Mini Riset Sejarah Tokoh Pejuang Daerah'
        ]
      : [
          'Struktur Sosial, Diferensiasi & Stratifikasi Sosial Masyarakat Kontemporer',
          'Ekonomi Makro: Kebijakan Moneter, Fiskal, Inflasi, dan Pengangguran',
          'Geomorfologi, Penginderaan Jauh & Sistem Informasi Geografis (SIG) Sederhana',
          'Proyek Semester 1: Analisis Kesenjangan Sosial Ekonomi di Wilayah Perkotaan/Desa',
          'Globalisasi, Kearifan Lokal & Tantangan Eksistensi Budaya Nusantara',
          'Kerjasama Ekonomi Internasional, Neraca Perdagangan & Pasar Modal',
          'Manajemen Konflik Sosial & Resolusi Damai dalam Masyarakat Multikultural',
          'Proyek Akhir: Rancangan Pemberdayaan Ekonomi Komunitas Berbasis Potensi Lokal'
        ],
    pjok: [
      'Kebugaran Jasmani Mandiri: Pengukuran Vo2Max Sederhana & Latihan Sirkuit Rumahan',
      'Pola Gerak Dasar Senam Ritmik & Aerobik Pembakaran Lemak Mandiri',
      'Pola Makan Bergizi Seimbang, Menghitung Kebutuhan Kalori Harian (BMR/TDEE)',
      'Proyek Semester 1: Video Panduan Senam Pagi Homeschooling 5 Menit Ceria',
      'Olahraga Atletik & Bela Diri Praktis untuk Pertahanan Diri Mandiri',
      'Pertolongan Pertama Pada Kecelakaan (P3K) di Lingkungan Rumah & Pencegahan Cedera',
      'Bahaya Rokok, Alkohol, Zat Adiktif (NAPZA) dan Menjaga Kesehatan Reproduksi',
      'Proyek Semester 2: Rencana Aksi Pola Hidup Sehat 60 Hari Bersama Keluarga'
    ],
    'seni-budaya': [
      'Dasar Seni Rupa: Garis, Bentuk, Tekstur, Warna & Teknik Menggambar Perspektif',
      'Kriya Nusantara: Eksplorasi Seni Batik Celup / Anyaman Bahan Alami',
      'Apresiasi Musik Nusantara: Mengenal Alat Musik Tradisional & Harmoni Suara',
      'Proyek Semester 1: Pameran Karya Seni Rupa Digital & Fisik Virtual Homeschooling',
      'Seni Tari Tradisional: Memahami Pola Lantai, Gerak Dasar & Wiraga Wirama',
      'Seni Teater / Monolog: Mengekspresikan Karakter dan Olah Vokal di Depan Kamera',
      'Desain Visual & Seni Daur Ulang (Upcycling) dari Barang Bekas Bernilai Jual',
      'Proyek Semester 2: Pagelaran Seni Terpadu Akhir Tahun PKBM Buana Mekar'
    ],
    pemberdayaan: [
      'Pemetaan Potensi Diri (Self-Discovery), Minat Bakat & Growth Mindset',
      'Literasi Finansial Pemuda: Menabung, Investasi Leher ke Atas & Hindari Pinjol Ilegal',
      'Keterampilan Komunikasi Efektif, Negosiasi & Manajemen Waktu Belajar Homeschooling',
      'Proyek Semester 1: Rencana Aksi Pengembangan Diri (Personal Development Plan 1 Tahun)',
      'Identifikasi Masalah Sosial di Lingkungan Sekitar & Metode Design Thinking',
      'Kewirausahaan Berkelanjutan (Social Entrepreneurship) & Pengelolaan Modal Usaha',
      'Kepemimpinan Pemuda, Membangun Komunitas Positif & Kampanye Sosial Digital',
      'Proyek Akhir: Aksi Nyata Pengabdian Masyarakat Berdampak Positif di Lingkungan Rumah'
    ]
  };

  const titleList = defaultSubjectTitles[subjectId] || defaultSubjectTitles['ips'];
  const idx = (semester - 1) * 4 + (unitIndex - 1);
  return createStandardAcademicUnit(grade, subjectId, semester, unitIndex, titleList[idx] || `Topik Unit ${unitIndex} ${semStr}`, `Modul PKBM Buana Mekar ${gradeStr}`);
}

// Builder helper for vocational subjects with deep hands-on steps
function createStandardVocationalUnit(grade: GradeLevel, subjectId: string, semester: 1 | 2, unitIndex: number, topic: string, subtopic: string) {
  return {
    topic,
    subtopic,
    capaian: `Peserta didik mampu menguasai pengetahuan teoritis, prosedur keselamatan kerja, dan keterampilan praktik mandiri pada topik "${topic}" sesuai standar kompetensi vokasi PKBM Buana Mekar.`,
    tujuan: [
      `Menjelaskan prinsip dasar dan terminologi teknis ${topic}.`,
      `Mempersiapkan alat, bahan, dan keselamatan kerja sesuai SOP.`,
      `Melaksanakan langkah kerja praktik secara mandiri dan sistematis.`,
      `Mengevaluasi hasil karya/produk dan menghitung estimasi biaya/kualitas.`
    ],
    materiTitle: `Ringkasan Materi Vokasi: ${topic}`,
    materiPoints: [
      `Konsep Utama: Penguasaan teknik dasar dan standar industri pada ${topic}.`,
      `Alat & Bahan: Pemilihan peralatan yang tepat guna, higienis, dan aman digunakan di rumah.`,
      `Prosedur Operasional Standar (SOP): Urutan langkah kerja dari persiapan, proses, hingga finishing.`,
      `Kontrol Kualitas (QC): Kriteria produk yang baik dari segi fungsi, estetika, dan ketahanan.`
    ],
    materiDeepDive: `Pembelajaran vokasi di PKBM Buana Mekar dirancang agar peserta didik memiliki keterampilan bernilai ekonomis dan siap pakai. Pada modul ini, peserta didik akan mempraktikkan langsung tahapan ${topic}...`,
    activity1Questions: [
      { id: 'act1-1', type: 'essay' as const, question: `Jelaskan fungsi utama dari setiap peralatan kerja yang digunakan dalam materi ${topic}!`, points: 15 },
      { id: 'act1-2', type: 'essay' as const, question: `Sebutkan 3 potensi kesalahan umum yang sering terjadi saat melakukan proses ini dan bagaimana cara mengatasinya?`, points: 15 }
    ],
    activity2Title: `Studi Kasus & Analisis Penerapan Nyata`,
    activity2Context: `Seorang wirausahawan pemula ingin memasarkan produk berbasis ${topic} kepada konsumen lokal.`,
    activity2Instruction: `Buatlah alur perencanaan kerja terperinci yang mencakup estimasi waktu, kebutuhan bahan, dan standar kualitas produk.`,
    activity2Guiding: [
      `Bagaimana cara memastikan kualitas produk tetap konsisten?`,
      `Apa langkah antisipasi jika terjadi kendala pada saat proses produksi?`
    ],
    practicalTitle: `Praktik Mandiri: Pembuatan Karya / Uji Keterampilan ${topic}`,
    practicalObjective: `Menghasilkan produk nyata sesuai standar SOP dan mendokumentasikannya dalam lembar portofolio.`,
    practicalTools: ['Peralatan utama pendukung materi', 'Bahan baku berkualitas', 'Kamera/Smartphone untuk dokumentasi', 'Lembar checklist kerja'],
    practicalSteps: [
      'Persiapkan area kerja, kenakan perlengkapan pelindung diri (APD).',
      'Timbang dan siapkan bahan sesuai formula / takaran yang ditentukan.',
      'Lakukan proses pengerjaan secara cermat mengikuti instruksi tutorial.',
      'Lakukan finishing, pembersihan area kerja, dan evaluasi hasil produk.',
      'Ambil foto/video proses kerja dan hasil akhir dengan pencahayaan jelas.'
    ],
    practicalOutput: `Produk fisik jadi / dokumentasi video proses kerja dan lembar evaluasi mandiri.`,
    practicalSafety: `Patuhi protokol keselamatan kerja, hati-hati terhadap benda tajam, panas, atau bahan kimia.`,
    evidenceType: 'foto' as const,
    soalEvaluasi: generateEvalQuestions([
      { q: `Langkah pertama yang paling krusial sebelum memulai pengerjaan ${topic} adalah...`, opt: ['Langsung mengolah bahan tanpa takaran', 'Mempersiapkan alat, bahan dan sanitasi tempat kerja', 'Menjual produk ke konsumen', 'Membersihkan hasil akhir'], ans: 'Mempersiapkan alat, bahan dan sanitasi tempat kerja' },
      { q: `Faktor utama penentu kepuasan klien/konsumen dalam bidang keterampilan ini adalah...`, opt: ['Harga sangat mahal', 'Kerapian, ketepatan teknik, dan higienitas/estetika', 'Waktu pengerjaan yang terburu-buru', 'Penggunaan alat yang rusak'], ans: 'Kerapian, ketepatan teknik, dan higienitas/estetika' },
      { q: `Penyimpanan alat kerja setelah selesai digunakan harus dilakukan dengan cara...`, opt: ['Dibiarkan kotor di atas meja', 'Dibersihkan, dikeringkan, dan disimpan di tempat tertata rapi', 'Direndam air selamanya', 'Dibuang ke tempat sampah'], ans: 'Dibersihkan, dikeringkan, dan disimpan di tempat tertata rapi' }
    ]),
    rubrikKeterampilan: standardVocationRubric(`Keahlian Praktik ${topic}`),
    pemahamanKey: `Pemahaman menyeluruh mengenai alat, fungsi, dan SOP pengerjaan ${topic}.`,
    penerapanKey: `Alur kerja terstruktur dengan solusi antisipasi kendala yang masuk akal.`,
    evaluasiKey: [
      { questionId: 'ev-1', answer: 'B', explanation: 'Persiapan matang dan sanitasi adalah langkah awal wajib.' },
      { questionId: 'ev-2', answer: 'B', explanation: 'Kualitas hasil ditentukan oleh ketepatan teknik dan kerapian.' }
    ],
    tutorNotes: `Periksa foto bukti dokumentasi peserta didik dan berikan catatan pengembangan teknik.`
  };
}

// Builder helper for academic subjects
function createStandardAcademicUnit(grade: GradeLevel, subjectId: string, semester: 1 | 2, unitIndex: number, topic: string, subtopic: string) {
  return {
    topic,
    subtopic,
    capaian: `Peserta didik mampu memahami konsep esensial, bernalar kritis, dan menerapkan literasi sains/sosial/bahasa pada topik "${topic}" dalam kehidupan sehari-hari secara mandiri.`,
    tujuan: [
      `Menjelaskan konsep dan definisi fundamental terkait ${topic}.`,
      `Menganalisis fenomena nyata di lingkungan sekitar berdasarkan teori yang dipelajari.`,
      `Menyelesaikan persoalan kontekstual melalui penalaran logis dan sistematis.`,
      `Menyusun laporan refleksi dan karya mini proyek secara mandiri.`
    ],
    materiTitle: `Ringkasan Materi Esensial: ${topic}`,
    materiPoints: [
      `Definisi & Teori Dasar: Memahami konsep fundamental secara komprehensif.`,
      `Korelasi Nyata: Bagaimana materi ini bekerja dan berdampak dalam kehidupan harian.`,
      `Analisis Kritis: Metode membedah studi kasus dan pemecahan masalah bertahap.`,
      `Integrasi Karakter: Penerapan nilai Profil Pelajar Pancasila (Mandiri & Bernalar Kritis).`
    ],
    materiDeepDive: `Modul pembelajaran ${topic} ini dirancang dengan pendekatan saintifik dan kontekstual. Peserta didik diajak untuk mengamati, menanya, mencoba, dan menyimpulkan fenomena...`,
    activity1Questions: [
      { id: 'act1-1', type: 'essay' as const, question: `Jelaskan dengan kata-katamu sendiri apa konsep inti dari ${topic} dan mengapa hal ini penting dipelajari?`, points: 15 },
      { id: 'act1-2', type: 'essay' as const, question: `Berikan 2 contoh konkret penerapan materi ini yang pernah kamu temui di lingkungan tempat tinggalmu!`, points: 15 }
    ],
    activity2Title: `Studi Kasus Lingkungan: Analisis Kritis ${topic}`,
    activity2Context: `Dalam kehidupan bermasyarakat, sering ditemukan situasi yang membutuhkan pemahaman mendalam tentang materi ini.`,
    activity2Instruction: `Analisis situasi tersebut dan rumuskan 3 rekomendasi tindakan yang dapat diambil berdasarkan prinsip ilmu yang telah dipelajari.`,
    activity2Guiding: [
      `Faktor apa saja yang menjadi penyebab utama permasalahan tersebut?`,
      `Bagaimana solusi yang paling efektif dan dapat diterapkan secara mandiri?`
    ],
    practicalTitle: `Mini Proyek Eksplorasi Mandiri: ${topic}`,
    practicalObjective: `Melakukan observasi, eksperimen mini, atau pembuatan karya infografis berbasis data.`,
    practicalTools: ['Buku catatan / Laptop', 'Alat tulis & pewarna / Aplikasi Canva', 'Kamera untuk dokumentasi observasi', 'Sumber pustaka referensi'],
    practicalSteps: [
      'Tentukan objek pengamatan atau fokus studi yang ada di sekitar rumah.',
      'Kumpulkan data dan fakta melalui observasi langsung atau wawancara singkat.',
      'Olah data yang didapatkan ke dalam bentuk ringkasan laporan / tabel / infografis.',
      'Tuliskan kesimpulan dan rekomendasi perbaikan.'
    ],
    practicalOutput: `Laporan tertulis 1-2 halaman atau lembar infografis rangkuman hasil observasi.`,
    practicalSafety: `Tetap utamakan etika berkomunikasi saat mengumpulkan data di lingkungan.`,
    evidenceType: 'laporan' as const,
    soalEvaluasi: generateEvalQuestions([
      { q: `Manfaat utama mempelajari materi ${topic} dalam kehidupan sehari-hari adalah...`, opt: ['Hanya untuk mendapatkan nilai di rapor', 'Membantu mengambil keputusan logis dan memecahkan masalah nyata', 'Menghafal rumus tanpa memahami maknanya', 'Menghabiskan waktu luang saja'], ans: 'Membantu mengambil keputusan logis dan memecahkan masalah nyata' },
      { q: `Sikap ilmiah yang harus ditunjukkan saat menghadapi data yang berbeda dengan perkiraan adalah...`, opt: ['Mengubah data agar sesuai perkiraan', 'Bersikap jujur, terbuka, dan menganalisis penyebab perbedaan data', 'Mengabaikan hasil pengamatan', 'Menyalahkan teman atau tutor'], ans: 'Bersikap jujur, terbuka, dan menganalisis penyebab perbedaan data' },
      { q: `Langkah awal dalam merumuskan solusi berbasis penalaran kritis adalah...`, opt: ['Langsung mengambil kesimpulan terburu-buru', 'Mengidentifikasi akar permasalahan dan mengumpulkan fakta valid', 'Menyebarkan kabar yang belum terverifikasi', 'Menyerah tanpa mencoba'], ans: 'Mengidentifikasi akar permasalahan dan mengumpulkan fakta valid' }
    ]),
    rubrikKeterampilan: standardAcademicRubric(`Kualitas Analisis & Laporan ${topic}`),
    pemahamanKey: `Jawaban mencakup pemahaman konsep dasar yang runtut dan contoh nyata yang relevan.`,
    penerapanKey: `Analisis kasus memiliki argumen logis dengan rekomendasi yang terukur.`,
    evaluasiKey: [
      { questionId: 'ev-1', answer: 'B', explanation: 'Tujuan pembelajaran kontekstual adalah aplikasi pemecahan masalah.' },
      { questionId: 'ev-2', answer: 'B', explanation: 'Integritas ilmiah menuntut kejujuran dan keterbukaan terhadap data.' }
    ],
    tutorNotes: `Berikan apresiasi pada kedalaman argumen dan originalitas observasi peserta didik.`
  };
}

function generateEvalQuestions(seeds: { q: string; opt: string[]; ans: string }[]): LKPDQuestion[] {
  const result: LKPDQuestion[] = [];
  seeds.forEach((s, idx) => {
    result.push({
      id: `ev-${idx + 1}`,
      type: 'multiple-choice',
      question: s.q,
      options: s.opt,
      correctAnswer: s.ans,
      points: 10
    });
  });

  // Add 2 essay HOTS questions
  result.push({
    id: `ev-h1`,
    type: 'essay',
    question: 'Jelaskan bagaimana kamu dapat mengajarkan atau membagikan pemahaman materi ini kepada anggota keluarga atau teman di lingkungan rumahmu!',
    points: 15
  });
  result.push({
    id: `ev-h2`,
    type: 'case-study',
    question: 'Jika kamu diberikan kesempatan untuk membuat inovasi baru berbasis materi ini, inovasi apa yang ingin kamu ciptakan? Jelaskan ide dan manfaatnya!',
    points: 15
  });

  return result;
}

function standardVocationRubric(aspectTitle: string) {
  return [
    {
      aspect: aspectTitle,
      level4: 'Sangat Mahir: Menguasai teknik kerja dengan presisi tinggi, APD lengkap, hasil kerja rapi dan estetis.',
      level3: 'Mahir: Mengikuti langkah kerja dengan benar, APD sesuai, hasil kerja baik dengan sedikit bimbingan.',
      level2: 'Cukup: Memahami sebagian langkah kerja, memerlukan bantuan tutor untuk menyelesaikan tahap penting.',
      level1: 'Perlu Bimbingan: Belum menguasai teknik dasar, mengabaikan SOP keselamatan kerja.'
    },
    {
      aspect: 'Kemandirian & Tanggung Jawab Kerja',
      level4: 'Sangat Mandiri: Menyiapkan alat, membersihkan area kerja secara tuntas tanpa disuruh.',
      level3: 'Mandiri: Menyelesaikan tugas tepat waktu dan merapikan kembali peralatan kerja.',
      level2: 'Cukup: Menyelesaikan tugas dengan dorongan berkala dari orang tua/tutor.',
      level1: 'Perlu Bimbingan: Tidak menyelesaikan tugas atau meninggalkan area kerja kotor.'
    },
    {
      aspect: 'Kreativitas & Daya Inovasi Produk',
      level4: 'Sangat Kreatif: Menampilkan modifikasi orisinal, variasi menarik dan nilai tambah tinggi.',
      level3: 'Kreatif: Mampu memberikan sedikit sentuhan variasi pada produk standar.',
      level2: 'Cukup: Mengikuti contoh standar persis tanpa modifikasi.',
      level1: 'Perlu Bimbingan: Karya belum memenuhi kriteria minimal yang ditetapkan.'
    }
  ];
}

function standardAcademicRubric(aspectTitle: string) {
  return [
    {
      aspect: aspectTitle,
      level4: 'Sangat Baik: Analisis mendalam, berbasis data valid, argumen logis dan terstruktur rapi.',
      level3: 'Baik: Menjelaskan konsep dengan jelas dan menghubungkannya dengan contoh nyata.',
      level2: 'Cukup: Penjelasan masih bersifat umum dan belum disertai contoh yang kuat.',
      level1: 'Perlu Bimbingan: Belum memahami konsep dasar dan membutuhkan penjelasan ulang.'
    },
    {
      aspect: 'Kelengkapan Laporan & Sistematika',
      level4: 'Sangat Lengkap: Memuat seluruh komponen laporan, rapi, tepat waktu, dan disertai bukti visual.',
      level3: 'Lengkap: Memuat komponen utama laporan dengan sistematika yang baik.',
      level2: 'Cukup: Ada beberapa bagian laporan yang terlewatkan namun inti tugas terpenuhi.',
      level1: 'Perlu Bimbingan: Laporan tidak lengkap dan tidak tersusun sistematis.'
    }
  ];
}
