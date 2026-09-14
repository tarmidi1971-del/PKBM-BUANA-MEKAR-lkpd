// Database Buku Teks Pembelajaran & Modul Digital Kurikulum Merdeka
// Terintegrasi dengan Sistem Informasi Perbukuan Indonesia (SIBI Kemendikdasmen RI - https://buku.kemendikdasmen.go.id/),
// Platform Merdeka Mengajar (PMM), dan Modul Pendidikan Kesetaraan Ditjen PAUD Dikdasmen.

export const SIBI_KEMENDIKDASMEN_BASE_URL = 'https://buku.kemendikdasmen.go.id/';
export const SIBI_KEMENDIKDASMEN_KATALOG_URL = 'https://buku.kemendikdasmen.go.id/katalog';

export interface DigitalTextbookItem {
  id: string;
  subjectId: string;
  subjectName: string;
  programGroup: 'paket-b' | 'paket-c-wajib' | 'paket-c-ipa' | 'paket-c-ips' | 'vokasi' | 'bahasa-mulok';
  grade: 7 | 8 | 9 | 10 | 11 | 12;
  bookTitle: string;
  authorOrPublisher: string;
  editionYear: string;
  curriculumStandard: string;
  officialSourceUrl: string; // Active link to official SIBI Kemendikdasmen (buku.kemendikdasmen.go.id)
  pdfDownloadUrl?: string;
  sibiId?: string;
  chapters: {
    unitNumber: number;
    chapterTitle: string;
    subtopics: string[];
    summaryPoints: string[];
    fullLessonText: string;
    capaianPembelajaran: string;
    tujuanPembelajaran: string[];
  }[];
}

export const DIGITAL_TEXTBOOK_CATALOG: DigitalTextbookItem[] = [
  // ==========================================
  // 1. KETERAMPILAN: TATA BUSANA (PAKET B & C)
  // ==========================================
  {
    id: 'tb-textbook-01',
    subjectId: 'tata-busana',
    subjectName: 'Keterampilan: Tata Busana',
    programGroup: 'vokasi',
    grade: 10,
    bookTitle: 'Buku Modul Vokasi Tata Busana: Konstruksi Pola & Pembuatan Busana Mandiri',
    authorOrPublisher: 'Direktorat Pendidikan Vokasi & Kesetaraan Kemendikdasmen RI',
    editionYear: '2025/2026',
    curriculumStandard: 'Kurikulum Merdeka — Modul Kejuruan Mandiri',
    officialSourceUrl: 'https://buku.kemendikdasmen.go.id/katalog/buku-kurikulum-merdeka-tata-busana',
    pdfDownloadUrl: 'https://repositori.kemdikbud.go.id/modul-tata-busana-kesetaraan.pdf',
    sibiId: 'SIBI-VOKASI-TB-01',
    chapters: [
      {
        unitNumber: 1,
        chapterTitle: 'Unit 1: Pengenalan Serat Tekstil & Karakteristik Bahan Busana',
        subtopics: ['Klasifikasi Serat Alami & Sintetis', 'Uji Pembakaran Serat Kain', 'Pemilihan Bahan Sesuai Desain'],
        summaryPoints: [
          'Serat tekstil dibagi menjadi serat alami (kapas/katun, linen, wol, sutra) dan serat sintetis/buatan (polyester, nilon, rayon, spandeks).',
          'Uji pembakaran dilakukan untuk mengidentifikasi jenis kain: serat selulosa (katun) berbau seperti kertas terbakar dan meninggalkan abu halus.',
          'Pemilihan bahan harus memperhatikan sifat jatuh (drape), daya serap keringat, elastisitas, dan teknik penyetrikaan.'
        ],
        fullLessonText: `BAB 1: PENGENALAN SERAT TEKSTIL DAN KARAKTERISTIK BAHAN BUSANA

A. Klasifikasi Serat Tekstil
Kain merupakan bahan utama dalam pembuatan busana. Mutu dan kenyamanan pakaian sangat ditentukan oleh jenis serat penyusunnya. Secara umum serat tekstil terbagi menjadi:
1. Serat Alami Nabati (Selulosa): Contohnya katun (kapas) dan linen (flax). Sifatnya adem, mudah menyerap keringat, kuat, namun mudah kusut.
2. Serat Alami Hewani (Protein): Contohnya wol (bulu domba) dan sutra (kepompong ulat sutra). Memiliki kilau mewah, elastisitas tinggi, dan isolator panas yang baik.
3. Serat Buatan / Sintetis: Contohnya polyester, nilon, dan akrilik. Kuat, tidak mudah kusut, cepat kering, namun kurang menyerap keringat.
4. Serat Semi-Sintetis: Rayon (viscose) yang terbuat dari selulosa kayu yang diolah kembali.

B. Identifikasi Bahan dengan Uji Pembakaran (Burning Test)
- Katun/Linen: Terbakar cepat dengan nyala kuning, berbau kertas terbakar, abu abu-abu lembut.
- Sutra/Wol: Terbakar perlahan, padam sendiri jika dijauhkan dari api, berbau rambut terbakar, abu berupa butiran hitam rapuh.
- Polyester/Sintetis: Meleleh dan menggulung membentuk bulatan keras hitam berbau kimia menyengat.

C. Tips Praktis Pemilihan Bahan untuk Pemula
Bagi peserta didik homeschooling yang baru belajar menjahit, disarankan menggunakan kain katun polos atau motif kecil (katun jepang / katun rayon) karena tidak licin dan mudah dibentuk saat dijahit.`,
        capaianPembelajaran: 'Peserta didik mampu mengidentifikasi berbagai jenis serat tekstil, menguji karakteristik bahan, dan memilih kain yang tepat sesuai peruntukan busana.',
        tujuanPembelajaran: [
          'Menjelaskan perbedaan serat alami dan sintetis dengan tepat.',
          'Melakukan uji pembakaran untuk membedakan serat kain secara aman.',
          'Menentukan jenis kain yang sesuai untuk busana sehari-hari dan formal.'
        ]
      },
      {
        unitNumber: 2,
        chapterTitle: 'Unit 2: Pengambilan Ukuran Tubuh & Konstruksi Pola Dasar Busana',
        subtopics: ['Teknik Mengukur Tubuh Proporsional', 'Konstruksi Pola Dasar Badan Atas & Bawah', 'Tanda-Tanda Pola Jahitan'],
        summaryPoints: [
          'Pengambilan ukuran tubuh harus teliti menggunakan pita ukur (meteran) dengan posisi tubuh tegak alami.',
          'Ukuran utama meliputi: Lingkar Badan, Lingkar Pinggang, Lingkar Panggul, Panjang Punggung, Lebar Muka, dan Panjang Busana.',
          'Konstruksi pola dibuat pada kertas pola menggunakan skala 1:4 (latihan) atau 1:1 (pola kerja langsung).'
        ],
        fullLessonText: `BAB 2: PENGAMBILAN UKURAN TUBUH DAN KONSTRUKSI POLA DASAR

A. Prinsip Pengambilan Ukuran Tubuh
1. Pasang pita veterban (tali penanda) tepat pada pinggang terkecil sebagai garis acuan (waistline).
2. Ukur Lingkar Badan (LB): Keliling badan terbesar melewati puncak payudara, ditambah 4 cm untuk kelonggaran.
3. Ukur Lingkar Pinggang (LP): Keliling pinggang pas pada veterban.
4. Ukur Panjang Punggung (PP): Dari ruas tulang leher belakang yang menonjol sampai garis pinggang.
5. Ukur Lebar Punggung: Dari batas ketiak kiri sampai kanan di bagian punggung.

B. Pembuatan Pola Dasar (Sistem Meyneke / Praktis)
Pola dasar dibuat menjadi dua bagian utama: Pola Depan (Front) dan Pola Belakang (Back). Pola depan umumnya dibuat lebih besar 1-2 cm dari pola belakang untuk mengakomodasi bentuk dada wanita.

C. Tanda-Tanda Pola Standar Internasional
- Garis merah tebal: Garis pola depan.
- Garis biru tebal: Garis pola belakang.
- Garis putus-putus: Garis pertolongan atau kupnat.
- Tanda panah dua arah: Arah serat kain membujur (grainline).
- Tanda TM (Tengah Muka) dan TB (Tengah Belakang).`,
        capaianPembelajaran: 'Peserta didik mampu mengukur tubuh dengan akurat dan menggambar konstruksi pola dasar busana wanita sesuai standar industri.',
        tujuanPembelajaran: [
          'Melakukan pengukuran tubuh model secara mandiri dan sistematis.',
          'Menggambar pola dasar badan bagian depan dan belakang skala 1:1.',
          'Memberikan tanda pola dan kampuh jahitan dengan rapi.'
        ]
      },
      {
        unitNumber: 3,
        chapterTitle: 'Unit 3: Teknik Pengoperasian Mesin Jahit & Jahitan Dasar',
        subtopics: ['Bagian-Bagian Mesin Jahit Manual & Portable', 'Pemasangan Benang & Pengaturan Tegangan', 'Teknik Menjahit Kampuh & Kelim'],
        summaryPoints: [
          'Pengenalan bagian mesin jahit: spul (bobbin), sekoci, jarum jahit, sepatu penindas, dan pengatur jarak setikan (stitch regulator).',
          'Pengaturan tegangan benang atas dan bawah harus seimbang agar setikan jahitan tidak mengkerut atau kendur.',
          'Jenis kampuh utama: kampuh buka, kampuh balik, kampuh pipih, dan kampuh obras/overdeck.'
        ],
        fullLessonText: `BAB 3: PENGOPERASIAN MESIN JAHIT DAN TEKNIK JAHITAN DASAR

A. Komponen Kunci Mesin Jahit
1. Jarum Jahit Mesin: Pilih nomor jarum sesuai ketebalan kain (No. 11 untuk sifon/katun tipis, No. 13-14 untuk katun umum, No. 16 untuk denim/kanvas).
2. Sepatu Mesin Jahit (Presser Foot): Berfungsi menekan kain ke gigi penarik saat dijahit.
3. Spul dan Sekoci: Menyuplai benang bagian bawah. Pemasangan benang sekoci harus searah jarum jam.

B. Prosedur Keselamatan Kerja Menjahit
- Pastikan jari berada minimal 2 cm dari jarum yang bergerak.
- Lepaskan pedal gas sebelum mengganti jarum atau memasang sepatu mesin.
- Bersihkan serat debu dan lumasi mesin secara berkala dengan minyak pelumas khusus mesin jahit.

C. Latihan Menjahit Garis & Bentuk
Sebelum menjahit kain langsung, latih kontrol kecepatan mesin dengan menjahit pada kertas tanpa benang: garis lurus, garis zig-zag, dan spiral melengkung.`,
        capaianPembelajaran: 'Peserta didik menguasai keterampilan mengoperasikan mesin jahit, mengatur tegangan benang, dan membuat aneka kampuh jahitan standar.',
        tujuanPembelajaran: [
          'Memasang benang atas dan benang sekoci dengan urutan yang benar.',
          'Menjahit lurus dengan jarak setikan yang stabil dan rapi.',
          'Membuat kampuh buka dan kampuh balik pada contoh bahan kain.'
        ]
      }
    ]
  },

  // ==========================================
  // 2. KETERAMPILAN: TATA KECANTIKAN (PAKET B & C)
  // ==========================================
  {
    id: 'tk-textbook-01',
    subjectId: 'tata-kecantikan',
    subjectName: 'Keterampilan: Tata Kecantikan',
    programGroup: 'vokasi',
    grade: 10,
    bookTitle: 'Buku Modul Vokasi Tata Kecantikan: Perawatan Kulit Wajah & Seni Rias Natural',
    authorOrPublisher: 'Direktorat Pembinaan Kursus & Pelatihan Kemendikdasmen RI',
    editionYear: '2025/2026',
    curriculumStandard: 'Kurikulum Merdeka — Modul Kejuruan Mandiri',
    officialSourceUrl: 'https://buku.kemendikdasmen.go.id/katalog/buku-tata-kecantikan-kurikulum-merdeka',
    pdfDownloadUrl: 'https://repositori.kemdikbud.go.id/modul-tata-kecantikan-wajah.pdf',
    sibiId: 'SIBI-VOKASI-TK-01',
    chapters: [
      {
        unitNumber: 1,
        chapterTitle: 'Unit 1: Sanitasi Hygiene Salon & Analisis Jenis Kulit Wajah',
        subtopics: ['Standar Sanitasi Alat Kecantikan', 'Struktur Kulit Wajah', 'Analisis 4 Tipe Kulit'],
        summaryPoints: [
          'Sanitasi hygiene merupakan syarat mutlak dalam perawatan kecantikan untuk mencegah infeksi silang jamur atau bakteri.',
          'Sterilisasi kuas rias, spons, pinset, dan spatula menggunakan alkohol 70% atau cairan antiseptik khusus.',
          'Kulit wajah terbagi menjadi: normal, kering (dry), berminyak (oily), dan kombinasi (T-zone berminyak).'
        ],
        fullLessonText: `BAB 1: HYGIENE SANITASI SALON DAN ANALISIS KULIT WAJAH

A. Konsep Dasar Hygiene & Sanitasi
Hygiene adalah pemeliharaan kebersihan diri terapis/beautician (seperti mencuci tangan 6 langkah WHO, memotong kuku rapi, menggunakan masker). Sanitasi adalah sterilisasi alat kerja dan lingkungan ruang rias agar terbebas dari kuman patogen.

B. Metode Analisis Kulit Wajah Menggunakan Kaca Pembesar (Magnifying Lamp)
1. Kulit Normal: Pori-pori halus, kelembaban seimbang, tidak berjerawat, elastisitas kenyal.
2. Kulit Kering: Pori-pori sangat kecil, tekstur kusam atau bersisik, rentan garis halus di sekitar mata.
3. Kulit Berminyak: Pori-pori besar terlihat jelas, kilap minyak di seluruh wajah, rentan komedo dan jerawat.
4. Kulit Kombinasi: Berminyak pada area T-Zone (dahi, hidung, dagu) dan kering pada area pipi.

C. Form Kartu Analisis Wajah Klien
Sebelum melakukan tindakan perawatan atau makeup, terapis wajib mencatat kondisi kulit, riwayat alergi kosmetik, dan kebutuhan khusus klien dalam lembar rekam analisis kecantikan.`,
        capaianPembelajaran: 'Peserta didik memahami standar sanitasi salon serta mampu mendiagnosis jenis kulit wajah klien secara objektif dan sistematis.',
        tujuanPembelajaran: [
          'Menerapkan protokol sterilisasi alat makeup dan hygiene personal.',
          'Mengidentifikasi jenis dan kelainan kulit wajah melalui pemeriksaan visual.',
          'Mengisi lembar kartu konsultasi dan analisis kecantikan klien.'
        ]
      },
      {
        unitNumber: 2,
        chapterTitle: 'Unit 2: Prosedur Perawatan Kulit Wajah Dasar (Facial Treatment)',
        subtopics: ['Pembersihan Ganda (Double Cleansing)', 'Eksfoliasi & Penguapan', 'Masker Alami & Pelembab'],
        summaryPoints: [
          'Perawatan wajah dasar bertujuan menjaga elastisitas kulit, mengangkat sel kulit mati, dan merangsang sirkulasi darah.',
          'Langkah perawatan: Cleansing Milk -> Face Wash -> Gentle Scrub -> Massage Relaksasi -> Masker -> Toner & Sunscreen.',
          'Pijat wajah (facial massage) dilakukan mengikuti alur otot wajah ke arah atas untuk mencegah penuaan dini.'
        ],
        fullLessonText: `BAB 2: PROSEDUR PERAWATAN KULIT WAJAH DASAR (BASIC FACIAL)

A. Tahapan Perawatan Wajah Mandiri
1. Double Cleansing: Bersihkan makeup dan kotoran dengan cleansing oil / milk cleanser, dilanjutkan dengan sabun wajah ber-pH seimbang (5.5).
2. Gentle Exfoliation: Pengangkatan sel kulit mati menggunakan scrub butiran halus 1-2 kali seminggu. Hindari menggosok area berjerawat aktif.
3. Gerakan Effleurage (Pijatan Ringan): Gunakan minyak zaitun / massage cream, lakukan usapan melingkar dari dagu ke arah pelipis untuk memperlancar sirkulasi getah bening.
4. Aplikasi Masker: Pilih masker lempung (clay mask) untuk kulit berminyak atau masker gel/sheet mask untuk melembabkan kulit kering.
5. Penguncian Kelembaban: Aplikasikan hydrating toner, pelembab (moisturizer), dan tabir surya (sunscreen SPF 30+) pada siang hari.`,
        capaianPembelajaran: 'Peserta didik menguasai keterampilan melakukan tahapan perawatan kulit wajah secara mandiri dan higienis.',
        tujuanPembelajaran: [
          'Mempraktikkan teknik double cleansing yang tepat.',
          'Melakukan gerakan massage wajah relaksasi sesuai arah garis otot.',
          'Meracik dan mengaplikasikan masker wajah alami sesuai jenis kulit.'
        ]
      },
      {
        unitNumber: 3,
        chapterTitle: 'Unit 3: Tata Rias Wajah Sehari-hari (Daily Natural Makeup)',
        subtopics: ['Skin Preparation & Base Makeup', 'Teknik Membentuk Alis Natural', 'Rias Mata, Pipi, dan Bibir Segar'],
        summaryPoints: [
          'Daily makeup menekankan penampilan segar, flawless, dan tahan lama tanpa terkesan tebal/menumpuk.',
          'Gunakan cushion atau tinted moisturizer yang menyatu sempurna dengan undertone kulit (warm, cool, neutral).',
          'Pembingkaian alis mengikuti pertumbuhan rambut alami dengan arsiran tipis pada pangkal dan tegas pada ekor alis.'
        ],
        fullLessonText: `BAB 3: TATA RIAS WAJAH SEHARI-HARI (NATURAL FRESH MAKEUP)

A. Persiapan Kulit (Skin Prep)
Kunci riasan wajah menempel sempurna adalah kulit yang terhidrasi dengan baik. Bersihkan wajah, semprotkan face mist, aplikasikan moisturizer ringan, dan tunggu 2 menit hingga meresap sebelum mengaplikasikan primer.

B. Aplikasi Base Makeup
- Gunakan produk bertekstur cair (BB Cream / Tinted Serum).
- Ratakan menggunakan beauty blender lembab dengan teknik tepuk-tepuk (dabbing), bukan digeser.
- Set area berminyak dengan bedak tabur transparan (translucent powder).

C. Rias Mata dan Bibir Segar
- Eyeshadow bernuansa cokelat muda / peach lembut pada seluruh kelopak mata.
- Eyeliner tipis di garis bulu mata atas untuk menegaskan garis mata.
- Maskara diaplikasikan dengan gerakan zig-zag agar bulu mata terangkat lentik.
- Lip tint atau lipstik nude diaplikasikan dengan teknik ombre lips segar.`,
        capaianPembelajaran: 'Peserta didik terampil mengaplikasikan rias wajah natural sehari-hari yang proporsional sesuai bentuk wajah.',
        tujuanPembelajaran: [
          'Menentukan undertone kulit dan memilih warna foundation yang tepat.',
          'Membentuk dan mengarsir alis natural sesuai proporsi wajah.',
          'Menyelesaikan makeup natural fresh dengan ketahanan optimal.'
        ]
      }
    ]
  },

  // ==========================================
  // 3. KETERAMPILAN: TATA BOGA (PAKET B & C)
  // ==========================================
  {
    id: 'tboga-textbook-01',
    subjectId: 'tata-boga',
    subjectName: 'Keterampilan: Tata Boga',
    programGroup: 'vokasi',
    grade: 7,
    bookTitle: 'Buku Modul Vokasi Tata Boga: Keamanan Pangan & Pengolahan Kuliner Nusantara',
    authorOrPublisher: 'Direktorat PAUD Dikdasmen & Kesetaraan Kemendikdasmen RI',
    editionYear: '2025/2026',
    curriculumStandard: 'Kurikulum Merdeka — Modul Kejuruan Mandiri',
    officialSourceUrl: 'https://buku.kemendikdasmen.go.id/katalog/buku-tata-boga-kurikulum-merdeka',
    pdfDownloadUrl: 'https://repositori.kemdikbud.go.id/modul-tata-boga-kuliner.pdf',
    sibiId: 'SIBI-VOKASI-TBOGA-01',
    chapters: [
      {
        unitNumber: 1,
        chapterTitle: 'Unit 1: Keamanan Pangan, Sanitasi Dapur (HACCP) & Knife Skills',
        subtopics: ['Bahaya Kontaminasi Silang', 'Standar Kebersihan Dapur & Food Safety', 'Teknik Memotong Bahan Makanan'],
        summaryPoints: [
          'Keamanan pangan mencakup pencegahan kontaminasi biologis, kimia, dan fisik pada bahan makanan.',
          'Pemisahan talenan berdasarkan warna: Merah (daging mentah), Kuning (unggas), Biru (seafood), Hijau (sayur & buah), Putih (roti & matang).',
          'Teknik dasar memotong (knife skills): Julienne (korek api), Brunoise (dadu kecil), Chiffonade (irisan halus daun), Dice/Macedoine.'
        ],
        fullLessonText: `BAB 1: KEAMANAN PANGAN, SANITASI DAPUR DAN PENGUASAAN PISAU (KNIFE SKILLS)

A. Prinsip Keamanan Pangan & Danger Zone
Zona bahaya suhu makanan (Danger Zone) berada pada rentang 5°C hingga 60°C, di mana bakteri pathogen dapat berkembang biak dua kali lipat setiap 20 menit. Simpan makanan dingin di bawah 4°C dan sajikan makanan panas di atas 65°C.

B. Standar Personal Hygiene Juru Masak (Cook/Chef)
1. Kenakan celemek (apron) bersih dan penutup kepala (hairnet / chef hat).
2. Cuci tangan dengan sabun sebelum memegang makanan dan setelah memegang bahan mentah.
3. Tutup luka terbuka dengan plester kedap air dan gunakan sarung tangan makanan.

C. Teknik Dasar Memegang Pisau (The Claw Grip)
Tangan pemegang pisau mencengkeram pangkal pisau dengan jempol dan telunjuk di sisi bilah (pinch grip). Tangan pemegang bahan menekuk jari menyerupai cakar beruang (the claw) dengan buku jari menempel pada sisi pisau agar jari terlindung dari mata pisau.`,
        capaianPembelajaran: 'Peserta didik mampu menerapkan prinsip sanitasi HACCP, menjaga keamanan pangan, serta mengoperasikan pisau dapur dengan aman dan presisi.',
        tujuanPembelajaran: [
          'Menjelaskan zona bahaya suhu makanan dan pencegahan kontaminasi silang.',
          'Menerapkan aturan pemisahan talenan dan personal hygiene dapur.',
          'Mempraktikkan teknik memotong Julienne, Brunoise, dan Chiffonade dengan rapi.'
        ]
      },
      {
        unitNumber: 2,
        chapterTitle: 'Unit 2: Pembuatan Produk Baking & Pastry (Roti Manis & Kue Tradisional)',
        subtopics: ['Bahan Utama Pembuatan Roti (Terigu Protein Tinggi, Ragi, Lemak)', 'Metode Pengulenan Kalis & Proofing', 'Pencegahan Kegagalan Roti'],
        summaryPoints: [
          'Terigu protein tinggi (gluten >12%) diperlukan agar serat roti terbentuk kokoh dan elastis mengembang.',
          'Ragi (Saccharomyces cerevisiae) mengonversi gula menjadi gas CO2 yang membuat adonan mengembang.',
          'Pengujian adonan kalis elastis dilakukan dengan windowpane test (adonan ditarik tipis transparan tanpa robek).'
        ],
        fullLessonText: `BAB 2: PENGOLAHAN ROTI MANIS DAN KUE TRADISIONAL

A. Fungsi Bahan Pembuat Roti
1. Tepung Terigu Protein Tinggi (Cakra Kembar / sejenis): Membentuk jaringan gluten yang elastis untuk menahan gas fermentasi.
2. Ragi Instan (Yeast): Mikroorganisme penghasil gas karbon dioksida. Suhu air pencampur ragi tidak boleh melebihi 40°C agar sel ragi tidak mati.
3. Gula Pasir: Sumber makanan ragi serta memberi rasa manis dan warna karamel keemasan pada kulit roti.
4. Mentega / Margarin: Menghaluskan serat remah roti (crumb) dan memperpanjang kelembutan roti.
5. Garam: Mengontrol laju fermentasi ragi dan menguatkan jaringan gluten.

B. Tahapan Pembuatan Roti Manis Sempurna
- Mixing (Pencampuran bahan kering & basah)
- Kneading (Pengulenan hingga mencapai windowpane stage)
- First Proofing (Fermentasi awal 45-60 menit hingga mengembang 2x lipat)
- Punch Down & Scaling (Mengeluarkan udara berlebih dan menimbang per porsi)
- Shaping & Second Proofing (Pembentukan adonan dan fermentasi akhir)
- Baking (Pemanggangan pada suhu 180°C selama 12-15 menit).`,
        capaianPembelajaran: 'Peserta didik menguasai formulasi bahan, proses fermentasi ragi, dan teknik pengolahan aneka roti manis lembut bernilai jual.',
        tujuanPembelajaran: [
          'Menjelaskan fungsi masing-masing bahan pembuat roti secara ilmiah.',
          'Melakukan uji windowpane test untuk memastikan adonan telah kalis sempurna.',
          'Menganalisis dan mengatasi kendala roti bantat atau berpori kasar.'
        ]
      }
    ]
  },

  // ==========================================
  // 4. KETERAMPILAN: KOMPUTER & DIGITAL (PAKET B & C)
  // ==========================================
  {
    id: 'komp-textbook-01',
    subjectId: 'keterampilan-komputer',
    subjectName: 'Keterampilan: Komputer',
    programGroup: 'vokasi',
    grade: 8,
    bookTitle: 'Buku Modul Vokasi Komputer: Aplikasi Perkantoran & Desain Media Digital',
    authorOrPublisher: 'Direktorat Pendidikan Vokasi Kemendikdasmen RI',
    editionYear: '2025/2026',
    curriculumStandard: 'Kurikulum Merdeka — Modul Kejuruan Mandiri',
    officialSourceUrl: 'https://buku.kemendikdasmen.go.id/katalog/buku-informatika-komputer-kurikulum-merdeka',
    pdfDownloadUrl: 'https://repositori.kemdikbud.go.id/modul-komputer-desain-digital.pdf',
    sibiId: 'SIBI-VOKASI-KOMP-01',
    chapters: [
      {
        unitNumber: 1,
        chapterTitle: 'Unit 1: Pengolah Kata Profesional & Otomatisasi Dokumen (Mail Merge)',
        subtopics: ['Format Dokumen Baku & Heading Styles', 'Daftar Isi Otomatis & Penomoran Halaman', 'Pembuatan Surat Massal (Mail Merge)'],
        summaryPoints: [
          'Pemanfaatan Styles (Heading 1, 2, 3) memungkinkan pembuatan Daftar Isi otomatis secara instan dan rapi.',
          'Section Breaks (Next Page) digunakan untuk membedakan format penomoran halaman (romawi pada kata pengantar, angka arab pada isi bab).',
          'Mail Merge menghubungkan dokumen master surat dengan spreadsheet data penerima sehingga pembuatan sertifikat/surat massal efisien.'
        ],
        fullLessonText: `BAB 1: PENGOLAH KATA PROFESIONAL DAN OTOMATISASI DOKUMEN

A. Standardisasi Format Dokumen Ilmiah / Bisnis
- Ukuran Kertas: A4 (21 x 29.7 cm).
- Margin Standar: Atas 3 cm, Bawah 3 cm, Kiri 4 cm (untuk jilid), Kanan 3 cm.
- Tipografi: Gunakan font resmi berukuran 12pt (Times New Roman / Calibri / Arial) dengan spasi 1.5 baris.

B. Otomatisasi Navigasi Dokumen
Hindari membuat daftar isi secara manual dengan mengetik titik-titik secara manual. Gunakan fitur *Table of Contents* berbasis Heading Styles. Saat ada penambahan halaman, daftar isi dapat diperbarui hanya dengan menekan tombol *Update Field*.

C. Langkah Pembuatan Mail Merge
1. Buat Dokumen Master Template di aplikasi pengolah kata (misal surat undangan atau lembar sertifikat).
2. Buat file sumber data tabel (Excel/Spreadsheet) yang memuat kolom: Nama, Nomor Induk, Alamat.
3. Pada tab Mailings, hubungkan *Select Recipients -> Use an Existing List*.
4. Sisipkan *Insert Merge Field* pada posisi yang sesuai, lalu lakukan *Finish & Merge*.`,
        capaianPembelajaran: 'Peserta didik terampil menyusun dokumen berstandar profesional, mengelola tata letak dokumen panjang, dan mengotomatisasi dokumen massal.',
        tujuanPembelajaran: [
          'Membuat struktur dokumen menggunakan Heading Styles dan Table of Contents otomatis.',
          'Mengatur section breaks untuk penomoran halaman berbeda dalam satu file.',
          'Mengintegrasikan spreadsheet dengan pengolah kata untuk Mail Merge massal.'
        ]
      },
      {
        unitNumber: 2,
        chapterTitle: 'Unit 2: Desain Grafis Promosi Produk & Media Sosial (Canva / Vector)',
        subtopics: ['Prinsip Desain: CRAP (Contrast, Repetition, Alignment, Proximity)', 'Teori Warna 60-30-10 & Tipografi', 'Pembuatan Feed Promosi Instagram & Flyer'],
        summaryPoints: [
          'Prinsip CRAP memastikan pesan visual terbaca jelas dan memiliki hierarki fokus pandangan mata.',
          'Aturan warna 60-30-10: 60% warna dominan background, 30% warna sekunder struktur, 10% warna aksen tombol CTA.',
          'Ekspor visual digital menggunakan format PNG (kompresi lossless) dengan resolusi minimal 1080x1080 px untuk media sosial.'
        ],
        fullLessonText: `BAB 2: DASAR DESAIN GRAFIS PROMOSI PRODUK DAN MEDIA SOSIAL

A. Empat Pilar Prinsip Desain Grafis (C.R.A.P)
1. Contrast (Kontras): Buat perbedaan tegas antara elemen penting dengan latar belakang (misal teks putih tebal di atas background biru tua).
2. Repetition (Pengulangan): Gunakan gaya visual, palet warna, dan jenis font yang konsisten untuk membangun identitas visual merk (branding).
3. Alignment (Perataan): Sejajarkan setiap elemen pada grid panduan agar terlihat teratur dan profesional.
4. Proximity (Kedekatan): Kelompokkan informasi yang saling berkaitan (misal nama produk didekatkan dengan harga).

B. Tipografi Efektif
Kombinasikan maksimal 2 jenis font dalam satu desain: 1 font Display/Serif untuk Headline utama, dan 1 font Sans-Serif yang sangat mudah dibaca untuk Body Text.

C. Praktik Pembuatan Flyer Promosi UMKM
Peserta didik membuat materi promosi produk lokal dengan mencantumkan: Headline menarik, Foto produk tajam, Nilai keunggulan, Harga promo, dan Call-to-Action (No. WhatsApp / Link pemesanan).`,
        capaianPembelajaran: 'Peserta didik mampu merancang materi visual promosi digital yang estetik dan efektif sesuai kaidah desain grafis modern.',
        tujuanPembelajaran: [
          'Menganalisis penerapan prinsip CRAP pada desain media promosi.',
          'Memilih kombinasi warna dan tipografi yang harmonis.',
          'Membuat poster/flyer digital siap publikasi menggunakan aplikasi desain.'
        ]
      }
    ]
  },

  // ==========================================
  // 5. BAHASA INDONESIA (PAKET B — KELAS 7)
  // ==========================================
  {
    id: 'bindo-smp7-01',
    subjectId: 'bahasa-indonesia',
    subjectName: 'Bahasa Indonesia',
    programGroup: 'paket-b',
    grade: 7,
    bookTitle: 'Buku Siswa Bahasa Indonesia: Nusantara Bertutur — Kelas VII',
    authorOrPublisher: 'Pusat Perbukuan Badan Standar, Kurikulum, dan Asesmen Pendidikan Kemendikdasmen RI',
    editionYear: '2024/2025',
    curriculumStandard: 'Kurikulum Merdeka — Buku Teks Utama Nasional',
    officialSourceUrl: 'https://buku.kemendikdasmen.go.id/katalog/buku-bahasa-indonesia-smp-kelas-vii-kurikulum-merdeka',
    pdfDownloadUrl: 'https://repositori.kemdikbud.go.id/buku-bahasa-indonesia-kelas-7-smp.pdf',
    sibiId: 'SIBI-SMP7-BINDO',
    chapters: [
      {
        unitNumber: 1,
        chapterTitle: 'Unit 1: Jelajah Nusantara melalui Teks Deskripsi Objektif',
        subtopics: ['Ciri dan Struktur Teks Deskripsi', 'Penggunaan Cerapan Pancaindra', 'Menyusun Deskripsi Objek Wisata Lokal'],
        summaryPoints: [
          'Teks deskripsi menggambarkan objek, tempat, atau peristiwa secara terperinci sehingga pembaca seolah-olah melihat dan merasakan langsung.',
          'Struktur teks: Identifikasi/Pernyataan Umum, Deskripsi Bagian, dan Simpulan/Kesan.',
          'Menggunakan kata konkret, cerapan pancaindra (visual, auditori, taktil), dan kata sifat (adjektiva).'
        ],
        fullLessonText: `BAB 1: MENJELAJAHI KEINDAHAN NUSANTARA LEWAT TEKS DESKRIPSI

A. Hakikat Teks Deskripsi
Teks deskripsi adalah tulisan yang bertujuan menggambarkan suatu objek atau suasana secara hidup dan detail. Pembaca diajak menggunakan imajinasi inderawi untuk merasakan apa yang dipaparkan penulis.

B. Struktur Teks Deskripsi
1. Identifikasi: Berisi nama objek yang dideskripsikan, lokasi, sejarah, atau makna nama objek.
2. Deskripsi Bagian: Memerinci objek berdasarkan apa yang dilihat (warna, bentuk), didengar (suara ombak, kicau burung), atau diraba (tekstur batu karang).
3. Penutup: Berisi kesan umum atau simpulan penulis terhadap keindahan objek tersebut.

C. Kaidah Kebahasaan
- Menggunakan kata khusus (misal warna: merah marun, hijau toska).
- Menggunakan kalimat bermajas personifikasi (misal: "Angin laut membelai rambutku dengan lembut").`,
        capaianPembelajaran: 'Peserta didik mampu memahami informasi dan menyajikan gagasan dalam bentuk teks deskripsi dengan kosakata yang kaya dan struktur yang tepat.',
        tujuanPembelajaran: [
          'Menemukan informasi penting dan struktur teks deskripsi.',
          'Menganalisis penggunaan kalimat cerapan pancaindra.',
          'Menulis teks deskripsi mengenai keunggulan lingkungan sekitar tempat tinggal.'
        ]
      }
    ]
  },

  // ==========================================
  // 6. MATEMATIKA (PAKET B — KELAS 7)
  // ==========================================
  {
    id: 'mat-smp7-01',
    subjectId: 'matematika',
    subjectName: 'Matematika',
    programGroup: 'paket-b',
    grade: 7,
    bookTitle: 'Buku Siswa Matematika: Eksplorasi Pola Bilangan & Aljabar — Kelas VII',
    authorOrPublisher: 'Pusat Perbukuan Kemendikdasmen RI RI',
    editionYear: '2024/2025',
    curriculumStandard: 'Kurikulum Merdeka — Buku Teks Utama Nasional',
    officialSourceUrl: 'https://buku.kemendikdasmen.go.id/katalog/buku-matematika-smp-kelas-vii-kurikulum-merdeka',
    pdfDownloadUrl: 'https://repositori.kemdikbud.go.id/buku-matematika-kelas-7-smp.pdf',
    sibiId: 'SIBI-SMP7-MAT',
    chapters: [
      {
        unitNumber: 1,
        chapterTitle: 'Unit 1: Bilangan Bulat dan Pecahan dalam Kehidupan Finansial',
        subtopics: ['Operasi Hitung Bilangan Bulat Positif & Negatif', 'Representasi Garis Bilangan', 'Penerapan Untung, Rugi & Arus Kas'],
        summaryPoints: [
          'Bilangan bulat mencakup bilangan positif, nol, dan negatif untuk menyatakan besaran berlawanan (suhu, ketinggian, debit/kredit).',
          'Aturan perkalian tanda: (+) x (+) = (+), (-) x (-) = (+), (+) x (-) = (-).',
          'Aplikasi dalam aritmetika sosial sederhana: menghitung modal, omset penjualan, keuntungan bersih, dan persentase diskon.'
        ],
        fullLessonText: `BAB 1: BILANGAN BULAT DAN PECAHAN DALAM ARITMETIKA SOSIAL

A. Konsep Bilangan Bulat Negatif
Dalam kehidupan sehari-hari, bilangan negatif digunakan untuk menyatakan kondisi di bawah titik acuan, misalnya suhu es beku (-5°C), kedalaman penyelaman di bawah permukaan laut (-15 m), atau posisi saldo pengeluaran keuangan (defisit).

B. Operasi Hitung Campuran
Ingat aturan prioritas operasi matematika (KABATAKU / PEMDAS):
1. Tanda Kurung (Parentheses)
2. Pangkat dan Akar (Exponents)
3. Perkalian dan Pembagian dari kiri ke kanan (Multiplication & Division)
4. Penjumlahan dan Pengurangan dari kiri ke kanan (Addition & Subtraction).

C. Contoh Soal Kontekstual Homeschooling
Seorang peserta didik memiliki modal usaha minuman dingin Rp 100.000. Membeli bahan baku seharga Rp 65.000, lalu berhasil menjual 15 gelas dengan harga Rp 8.000/gelas.
- Total Pendapatan = 15 x Rp 8.000 = Rp 120.000
- Keuntungan Bersih = Rp 120.000 - Rp 65.000 = Rp 55.000.`,
        capaianPembelajaran: 'Peserta didik mampu mengoperasikan bilangan bulat dan pecahan serta memodelkannya dalam pemecahan masalah finansial nyata.',
        tujuanPembelajaran: [
          'Melakukan operasi hitung campuran bilangan bulat dan pecahan dengan tepat.',
          'Memodelkan permasalahan aritmetika sosial ke dalam ekspresi matematika.',
          'Menghitung persentase keuntungan dan diskon pada transaksi belanja.'
        ]
      }
    ]
  },

  // ==========================================
  // 7. IPA / ILMU PENGETAHUAN ALAM (PAKET B — KELAS 7)
  // ==========================================
  {
    id: 'ipa-smp7-01',
    subjectId: 'ipa',
    subjectName: 'IPA (Ilmu Pengetahuan Alam)',
    programGroup: 'paket-b',
    grade: 7,
    bookTitle: 'Buku Siswa Ilmu Pengetahuan Alam: Hakikat Sains & Ekosistem — Kelas VII',
    authorOrPublisher: 'Pusat Kurikulum dan Perbukuan Kemendikdasmen RI RI',
    editionYear: '2024/2025',
    curriculumStandard: 'Kurikulum Merdeka — Buku Teks Utama Nasional',
    officialSourceUrl: 'https://buku.kemendikdasmen.go.id/katalog/buku-ipa-smp-kelas-vii-kurikulum-merdeka',
    pdfDownloadUrl: 'https://repositori.kemdikbud.go.id/buku-ipa-kelas-7-smp.pdf',
    sibiId: 'SIBI-SMP7-IPA',
    chapters: [
      {
        unitNumber: 1,
        chapterTitle: 'Unit 1: Hakikat Sains, Pengukuran Ilmiah & Keselamatan Laboratorium',
        subtopics: ['Metode Ilmiah 6 Tahapan', 'Besaran Pokok & Satuan Internasional (SI)', 'Alat Ukur Presisi (Jangka Sorong & Neraca)'],
        summaryPoints: [
          'Sains adalah usaha sistematis untuk memahami fenomena alam melalui observasi dan eksperimen teruji.',
          'Tahapan Metode Ilmiah: Merumuskan Masalah -> Hipotesis -> Eksperimen -> Analisis Data -> Menarik Kesimpulan -> Publikasi.',
          'Tujuh Besaran Pokok: Panjang (m), Massa (kg), Waktu (s), Suhu (K), Kuat Arus (A), Jumlah Zat (mol), Intensitas Cahaya (cd).'
        ],
        fullLessonText: `BAB 1: HAKIKAT SAINS, METODE ILMIAH DAN PENGUKURAN

A. Apa Itu Sains?
Sains bukan sekadar kumpulan hafalan rumus, melainkan cara berpikir (way of thinking) dan cara menyelidiki (way of investigating). Seorang saintis muda selalu bersikap kritis, objektif, jujur dalam mencatat data, dan berani menguji hipotesis.

B. Langkah Eksperimen Mandiri Homeschooling
1. Observasi: Menemukan fenomena menarik (misal mengapa es di dalam termos mencair lebih lambat).
2. Variabel Percobaan:
   - Variabel Bebas: faktor yang sengaja diubah-ubah (misal jenis bahan pembungkus termos).
   - Variabel Terikat: faktor yang diamati responnya (misal waktu mencairnya es).
   - Variabel Kontrol: faktor yang dijaga tetap konstan (misal volume es batu awal dan suhu ruangan).

C. Pengukuran dan Konversi Satuan
Pengukuran yang sah harus menggunakan satuan baku Standar Internasional (SI) agar dapat dibandingkan secara global oleh ilmuwan di seluruh dunia.`,
        capaianPembelajaran: 'Peserta didik memahami hakikat sains, mampu merancang penyelidikan ilmiah sederhana, dan menggunakan alat ukur dengan presisi.',
        tujuanPembelajaran: [
          'Menjelaskan tahapan metode ilmiah dalam penyelidikan fenomena sekitar.',
          'Mengidentifikasi variabel bebas, terikat, dan kontrol dalam percobaan.',
          'Mengonversi satuan besaran pokok dan membaca skala alat ukur secara cermat.'
        ]
      }
    ]
  },

  // ==========================================
  // 8. BIOLOGI (PAKET C — KELAS 10)
  // ==========================================
  {
    id: 'bio-sma10-01',
    subjectId: 'biologi',
    subjectName: 'Biologi (Peminatan IPA)',
    programGroup: 'paket-c-ipa',
    grade: 10,
    bookTitle: 'Buku Siswa Biologi: Keanekaragaman Hayati & Ekologi Berkelanjutan — Kelas X',
    authorOrPublisher: 'Pusat Perbukuan Kemendikdasmen RI RI',
    editionYear: '2024/2025',
    curriculumStandard: 'Kurikulum Merdeka — Buku Teks Utama Nasional',
    officialSourceUrl: 'https://buku.kemendikdasmen.go.id/katalog/buku-biologi-sma-kelas-x-kurikulum-merdeka',
    pdfDownloadUrl: 'https://repositori.kemdikbud.go.id/buku-biologi-kelas-10-sma.pdf',
    sibiId: 'SIBI-SMA10-BIO',
    chapters: [
      {
        unitNumber: 1,
        chapterTitle: 'Unit 1: Keanekaragaman Hayati Indonesia & Bioteknologi Ramah Lingkungan',
        subtopics: ['Tingkat Keanekaragaman Gen, Jenis, dan Ekosistem', 'Fauna Tipe Asiatis, Peralihan & Australis', 'Konservasi In-Situ & Ex-Situ'],
        summaryPoints: [
          'Indonesia merupakan salah satu negara megabiodiversitas terbesar di dunia berkat posisi geografis khatulistiwa.',
          'Garis Wallace dan Garis Weber membagi wilayah persebaran fauna menjadi 3 zona biogeografis unik.',
          'Pemanfaatan bioteknologi konvensional (fermentasi tempe, yogurt, eco-enzyme) sebagai wujud sains aplikatif mandiri.'
        ],
        fullLessonText: `BAB 1: KEANEKARAGAMAN HAYATI DAN UPAYA PELESTARIAN ALAM

A. Tiga Tingkatan Keanekaragaman Hayati
1. Tingkat Gen: Variasi susunan genetik dalam satu spesies (contoh: varietas beras rojo lele, mentik wangi, dan beras hitam).
2. Tingkat Spesies (Jenis): Perbedaan antara spesies yang berbeda dalam satu famili (contoh: harimau sumatera, kucing rumahan, dan singa).
3. Tingkat Ekosistem: Keragaman habitat dan interaksi biotik-abiotik (contoh: ekosistem hutan hujan tropis, mangrove, dan terumbu karang).

B. Biogeografi Indonesia: Garis Wallace & Weber
- Zona Asiatis (Barat): Mamalia berukuran besar (gajah, badak), kera, burung berkicau merdu dengan warna tidak mencolok.
- Zona Peralihan (Tengah/Wallacea): Fauna endemik khas seperti anoa, komodo, dan burung maleo.
- Zona Australis (Timur): Mamalia berkantung (kuskus, kanguru pohon), burung berbulu indah cerah (cendrawasih, kasuari).

C. Proyek Konservasi Mandiri: Eco-Enzyme
Mengolah limbah kulit buah segar, gula merah, dan air (rasio 3:1:10) melalui fermentasi anaerobik 3 bulan untuk menghasilkan cairan serbaguna pembersih ramah lingkungan.`,
        capaianPembelajaran: 'Peserta didik menganalisis keanekaragaman hayati Indonesia serta merancang solusi pelestarian lingkungan berbasis bioteknologi sederhana.',
        tujuanPembelajaran: [
          'Mengklasifikasikan tingkatan keanekaragaman hayati berdasarkan data observasi.',
          'Menganalisis karakteristik persebaran fauna Indonesia menurut garis Wallace dan Weber.',
          'Mempraktikkan pembuatan produk bioteknologi ramah lingkungan secara mandiri.'
        ]
      }
    ]
  },

  // ==========================================
  // 9. FISIKA (PAKET C — KELAS 10)
  // ==========================================
  {
    id: 'fis-sma10-01',
    subjectId: 'fisika',
    subjectName: 'Fisika (Peminatan IPA)',
    programGroup: 'paket-c-ipa',
    grade: 10,
    bookTitle: 'Buku Siswa Fisika: Energi Terbarukan & Mekanika Gerak — Kelas X',
    authorOrPublisher: 'Pusat Perbukuan Kemendikdasmen RI RI',
    editionYear: '2024/2025',
    curriculumStandard: 'Kurikulum Merdeka — Buku Teks Utama Nasional',
    officialSourceUrl: 'https://buku.kemendikdasmen.go.id/katalog/buku-fisika-sma-kelas-x-kurikulum-merdeka',
    pdfDownloadUrl: 'https://repositori.kemdikbud.go.id/buku-fisika-kelas-10-sma.pdf',
    sibiId: 'SIBI-SMA10-FIS',
    chapters: [
      {
        unitNumber: 1,
        chapterTitle: 'Unit 1: Energi Terbarukan, Efisiensi Daya & Konservasi Energi',
        subtopics: ['Bentuk-Bentuk Energi (Kinetik, Potensial, Listrik)', 'Hukum Kekekalan Energi Mekanik', 'Rancang Bangun Panel Surya Sederhana'],
        summaryPoints: [
          'Energi tidak dapat diciptakan atau dimusnahkan, melainkan hanya dapat berubah dari satu bentuk ke bentuk lainnya (Hukum Kekekalan Energi).',
          'Energi kinetik Ek = 1/2 m v^2 dan Energi potensial gravitasi Ep = m g h.',
          'Pemanfaatan sumber energi terbarukan (solar cell, mikrohidro, biogas) untuk menekan emisi karbon global.'
        ],
        fullLessonText: `BAB 1: ENERGI TERBARUKAN DAN HUKUM KEKEKALAN ENERGI

A. Konsep Usaha dan Energi
Usaha (Work) terjadi ketika gaya yang diberikan menyebabkan benda berpindah sejajar arah gaya (W = F . s). Energi adalah kemampuan suatu sistem untuk melakukan usaha.

B. Transformasi dan Efisiensi Energi
Dalam setiap proses konversi energi (misal dari energi cahaya menjadi energi listrik pada panel surya), tidak semua energi berubah menjadi bentuk yang bermanfaat. Sebagian hilang sebagai energi kalor/panas.
Efisiensi Energi (η) dihitung dengan rumus:
η = (Energi Output Bermanfaat / Energi Input Total) x 100%.

C. Proyek Mandiri: Audit Energi Rumah Tangga
Peserta didik menghitung konsumsi kilowatt-hour (kWh) perangkat elektronik di rumah (kulkas, lampu LED, laptop) dan menyusun rekomendasi penghematan energi listrik keluarga.`,
        capaianPembelajaran: 'Peserta didik memahami konsep usaha, energi kinetik, potensial, serta merancang proyek pemanfaatan energi terbarukan ramah lingkungan.',
        tujuanPembelajaran: [
          'Menerapkan hukum kekekalan energi mekanik dalam pemecahan soal analitis.',
          'Menghitung efisiensi konversi energi pada sistem kelistrikan sederhana.',
          'Melakukan audit penggunaan energi listrik mandiri di lingkungan rumah.'
        ]
      }
    ]
  },

  // ==========================================
  // 10. SOSIOLOGI (PAKET C — KELAS 10)
  // ==========================================
  {
    id: 'sos-sma10-01',
    subjectId: 'sosiologi',
    subjectName: 'Sosiologi (Peminatan IPS)',
    programGroup: 'paket-c-ips',
    grade: 10,
    bookTitle: 'Buku Siswa Sosiologi: Menyelami Masyarakat & Realitas Sosial — Kelas X',
    authorOrPublisher: 'Pusat Perbukuan Kemendikdasmen RI RI',
    editionYear: '2024/2025',
    curriculumStandard: 'Kurikulum Merdeka — Buku Teks Utama Nasional',
    officialSourceUrl: 'https://buku.kemendikdasmen.go.id/katalog/buku-sosiologi-sma-kelas-x-kurikulum-merdeka',
    pdfDownloadUrl: 'https://repositori.kemdikbud.go.id/buku-sosiologi-kelas-10-sma.pdf',
    sibiId: 'SIBI-SMA10-SOS',
    chapters: [
      {
        unitNumber: 1,
        chapterTitle: 'Unit 1: Sosiologi sebagai Ilmu Mengamati Masyarakat & Tindakan Sosial',
        subtopics: ['Karakteristik Sosiologi (Empiris, Teoritis, Kumulatif, Non-Etis)', 'Interaksi Sosial & Kontak Sosial', 'Penelitian Sosial Berbasis Komunitas'],
        summaryPoints: [
          'Sosiologi bersifat non-etis: tidak menilai baik atau buruknya suatu fakta sosial, melainkan menjelaskan fakta tersebut secara ilmiah.',
          'Tindakan sosial (Max Weber): rasional instrumental, rasional nilai, afektif, dan tradisional.',
          'Metode observasi partisipatif dan wawancara mendalam untuk mengkaji kearifan lokal masyarakat.'
        ],
        fullLessonText: `BAB 1: SOSIOLOGI SEBAGAI ILMU KAJIAN MASYARAKAT

A. Sifat dan Ciri Sosiologi
1. Empiris: Didasarkan pada observasi realitas sosial yang nyata, bukan spekulasi imajinatif.
2. Teoritis: Selalu berusaha menyusun abstraksi dari hasil observasi untuk menarik hubungan sebab-akibat.
3. Kumulatif: Teori sosiologi dibangun dan diperluas atas dasar teori-teori yang telah ada sebelumnya.
4. Non-Etis: Bertujuan mendeskripsikan mengapa suatu gejala sosial terjadi tanpa menghakimi moralitas pelaku.

B. Interaksi Sosial: Syarat dan Bentuknya
Interaksi sosial terjadi apabila memenuhi dua syarat mutlak: Kontak Sosial (primer/sekunder) dan Komunikasi.
Bentuk interaksi dapat bersifat asosiatif (kerjasama, akomodasi, asimilasi) maupun disosiatif (persaingan, kontravensi, konflik).`,
        capaianPembelajaran: 'Peserta didik mampu menggunakan kacamata sosiologis untuk menganalisis fenomena interaksi sosial dan kearifan lokal di lingkungannya.',
        tujuanPembelajaran: [
          'Menjelaskan karakteristik utama sosiologi sebagai ilmu pengetahuan empiris.',
          'Menganalisis bentuk interaksi sosial asosiatif dan disosiatif di lingkungan sekitar.',
          'Melakukan wawancara singkat mengenai nilai gotong royong warga setempat.'
        ]
      }
    ]
  },

  // ==========================================
  // 11. EKONOMI (PAKET C — KELAS 10)
  // ==========================================
  {
    id: 'eko-sma10-01',
    subjectId: 'ekonomi',
    subjectName: 'Ekonomi (Peminatan IPS)',
    programGroup: 'paket-c-ips',
    grade: 10,
    bookTitle: 'Buku Siswa Ekonomi: Literasi Keuangan & Kewirausahaan Kreatif — Kelas X',
    authorOrPublisher: 'Pusat Perbukuan Kemendikdasmen RI RI',
    editionYear: '2024/2025',
    curriculumStandard: 'Kurikulum Merdeka — Buku Teks Utama Nasional',
    officialSourceUrl: 'https://buku.kemendikdasmen.go.id/katalog/buku-ekonomi-sma-kelas-x-kurikulum-merdeka',
    pdfDownloadUrl: 'https://repositori.kemdikbud.go.id/buku-ekonomi-kelas-10-sma.pdf',
    sibiId: 'SIBI-SMA10-EKO',
    chapters: [
      {
        unitNumber: 1,
        chapterTitle: 'Unit 1: Kelangkaan Sumber Daya, Skala Prioritas & Literasi Finansial',
        subtopics: ['Masalah Pokok Ekonomi (What, How, for Whom)', 'Opportunity Cost (Biaya Peluang)', 'Perencanaan Anggaran Pribadi & Investasi'],
        summaryPoints: [
          'Kelangkaan timbul karena kebutuhan manusia tak terbatas sedangkan alat pemuas kebutuhan jumlahnya terbatas.',
          'Biaya peluang (opportunity cost) adalah nilai manfaat dari alternatif terbaik yang dikorbankan saat mengambil keputusan.',
          'Penyusunan skala prioritas: Kebutuhan Primer (Mendesak) -> Sekunder -> Tersier.'
        ],
        fullLessonText: `BAB 1: KELANGKAAN, BIAYA PELUANG DAN PENGELOLAAN KEUANGAN PRIBADI

A. Inti Masalah Ekonomi
Inti masalah ekonomi adalah kelangkaan (scarcity). Setiap individu dituntut membuat pilihan rasional agar sumber daya waktu, uang, dan tenaga yang terbatas dapat memberikan kepuasan maksimal.

B. Memahami Biaya Peluang (Opportunity Cost)
Contoh Kasus: Seorang siswa memiliki tabungan Rp 500.000. Ia dihadapkan pada dua pilihan: membeli mesin jahit mini untuk usaha tata busana atau membeli jaket branded mahal. Jika ia memilih membeli jaket, biaya peluangnya adalah hilangnya potensi pendapatan dari jasa jahit busana mandiri.

C. Literasi Keuangan Praktis
Metode alokasi pendapatan 50-30-20:
- 50% untuk Kebutuhan Pokok Hidup (makan, transportasi, internet edukasi).
- 30% untuk Keinginan / Hiburan Terukur.
- 20% untuk Tabungan Darurat & Investasi Masa Depan.`,
        capaianPembelajaran: 'Peserta didik memahami prinsip kelangkaan dan terampil mengelola anggaran keuangan pribadi secara bijak.',
        tujuanPembelajaran: [
          'Menghitung biaya peluang dari berbagai alternatif keputusan ekonomi.',
          'Menyusun daftar skala prioritas kebutuhan mingguan secara rasional.',
          'Menerapkan strategi pengelolaan uang saku 50-30-20 dalam buku kas mandiri.'
        ]
      }
    ]
  }
];

// Helper to find digital textbook by subject and grade
export function findDigitalTextbook(subjectId: string, grade?: number): DigitalTextbookItem | undefined {
  // First attempt exact match on subjectId and grade
  if (grade) {
    const exact = DIGITAL_TEXTBOOK_CATALOG.find(b => b.subjectId === subjectId && b.grade === grade);
    if (exact) return exact;
  }

  // Second attempt match by subjectId
  const matchSub = DIGITAL_TEXTBOOK_CATALOG.find(b => b.subjectId === subjectId);
  if (matchSub) return matchSub;

  // Third attempt match partial name
  return DIGITAL_TEXTBOOK_CATALOG.find(b => 
    b.subjectName.toLowerCase().includes(subjectId.toLowerCase()) || 
    subjectId.toLowerCase().includes(b.subjectId.toLowerCase())
  );
}

// Helper to get fallback digital book for any subject
export function getOrCreateTextbookForSubject(subjectId: string, subjectName: string, grade: number): DigitalTextbookItem {
  const found = findDigitalTextbook(subjectId, grade);
  if (found) return found;

  const isSMP = grade <= 9;
  const programName = isSMP ? 'Paket B (Setara SMP)' : 'Paket C (Setara SMA)';

  return {
    id: `auto-${subjectId}-${grade}`,
    subjectId,
    subjectName,
    programGroup: isSMP ? 'paket-b' : 'paket-c-wajib',
    grade: (grade as any),
    bookTitle: `Buku Teks & Modul Pembelajaran Kurikulum Merdeka: ${subjectName} — Kelas ${grade}`,
    authorOrPublisher: `Pusat Perbukuan & Ditjen PAUD Dikdasmen Kemendikdasmen RI`,
    editionYear: '2025/2026',
    curriculumStandard: `Kurikulum Merdeka ${programName}`,
    officialSourceUrl: `https://buku.kemendikdasmen.go.id/katalog?query=${encodeURIComponent(subjectName)}`,
    pdfDownloadUrl: `https://repositori.kemdikbud.go.id/modul-${subjectId}.pdf`,
    sibiId: `SIBI-KM-${subjectId.toUpperCase()}-${grade}`,
    chapters: [
      {
        unitNumber: 1,
        chapterTitle: `Unit 1: Eksplorasi Konsep Dasar & Fondasi ${subjectName}`,
        subtopics: ['Pengenalan Konsep Kunci', 'Aplikasi Kontekstual Homeschooling', 'Aktivitas Praktik Mandiri'],
        summaryPoints: [
          `Memahami prinsip fundamental mata pelajaran ${subjectName} sesuai standar Kurikulum Merdeka.`,
          `Menganalisis keterkaitan materi dengan fenomena kehidupan sehari-hari peserta didik.`,
          `Mengerjakan proyek evaluasi dan lembar portofolio karya mandiri.`
        ],
        fullLessonText: `MODUL PEMBELAJARAN RESMI KURIKULUM MERDEKA: ${subjectName.toUpperCase()} KELAS ${grade}

A. Capaian Pembelajaran Fase Terpadu
Modul ini membimbing peserta didik untuk menguasai kompetensi dasar dan tingkat lanjut pada mata pelajaran ${subjectName}. Pembelajaran berpusat pada penguatan nalar kritis, kemandirian belajar, dan penguasaan kecakapan hidup abad 21.

B. Ringkasan Uraian Materi Bab 1
1. Penguasaan Konsep: Memahami hakikat, istilah kunci, serta struktur ilmu pengetahuan pada bidang ${subjectName}.
2. Studi Kasus Kontekstual: Mengaitkan permasalahan nyata di lingkungan keluarga atau masyarakat dengan solusi ilmiah yang tepat.
3. Penerapan Praktis: Menyusun laporan kegiatan, observasi langsung, atau karya produk nyata untuk melengkapi bukti portofolio belajar.`,
        capaianPembelajaran: `Peserta didik mampu memahami dan menerapkan konsep ${subjectName} dalam pemecahan masalah mandiri.`,
        tujuanPembelajaran: [
          `Mengidentifikasi konsep kunci mata pelajaran ${subjectName}.`,
          `Menerapkan konsep ke dalam studi kasus nyata.`,
          `Menyusun laporan hasil belajar mandiri secara terstruktur.`
        ]
      }
    ]
  };
}
