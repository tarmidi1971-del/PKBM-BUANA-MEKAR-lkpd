import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Lazy initialization for Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      school: "PKBM Buana Mekar",
      program: "Homeschooling Terpadu Paket B & Paket C",
      academicYear: "2026/2027"
    });
  });

  // AI Endpoint: Generate or Customize LKPD topic / rubric with Gemini & Sync from PDF text
  app.post("/api/gemini/generate-lkpd", async (req, res) => {
    try {
      const { grade, subjectName, topic, learningGoals, mode, sourcePdfText, targetUnitNumber } = req.body;
      
      let sourceContext = "";
      if (sourcePdfText && typeof sourcePdfText === 'string' && sourcePdfText.trim().length > 0) {
        sourceContext = `\n\nMATERI SUMBER DARI BUKU/DOKUMEN PDF:\n"""\n${sourcePdfText.slice(0, 12000)}\n"""\nEkstrak dan sinkronisasikan materi PDF di atas menjadi unit LKPD yang komprehensif, terstruktur, dan sesuai standar Kurikulum Merdeka PKBM Buana Mekar.`;
      }

      const prompt = `Anda adalah Tim Pengembang Kurikulum Homeschooling Terpadu PKBM Buana Mekar (Kurikulum Merdeka 2026/2027).
Buatkan/sinkronisasikan konten Lembar Kerja Peserta Didik (LKPD) lengkap, berkualitas tinggi, dan siap pakai untuk:
- Program: ${grade <= 9 ? 'Paket B (Setara SMP)' : 'Paket C (Setara SMA)'}
- Kelas: ${grade}
- Mata Pelajaran: ${subjectName}
- Unit Target: Unit ${targetUnitNumber || '1'}
- Topik / Materi Khusus: ${topic || 'Sesuai Capaian Pembelajaran'}
- Tujuan Pembelajaran: ${learningGoals || 'Penguasaan konsep dan keterampilan aplikatif mandiri'}
- Mode Permintaan: ${mode || 'full-unit'}${sourceContext}

Berikan output HANYA dalam format JSON valid yang memiliki struktur persis seperti berikut (tanpa markdown wrapper tambahan di luar JSON):
{
  "topic": "Judul Topik Terpadu",
  "subtopic": "Sub-topik kontekstual",
  "capaian": "Deskripsi Capaian Pembelajaran Fase Kurikulum Merdeka",
  "tujuan": ["TP 1", "TP 2", "TP 3", "TP 4"],
  "materiTitle": "Judul Ringkasan Materi",
  "materiPoints": ["Poin 1...", "Poin 2...", "Poin 3...", "Poin 4..."],
  "materiDeepDive": "Penjelasan mendalam materi 2-3 paragraf komprehensif...",
  "activity1Questions": [
    {"id": "q1", "type": "essay", "question": "Pertanyaan Pemahaman 1", "points": 15},
    {"id": "q2", "type": "essay", "question": "Pertanyaan Pemahaman 2", "points": 15}
  ],
  "activity2": {
    "title": "Judul Studi Kasus Homeschooling Kontekstual",
    "contextDescription": "Konteks permasalahan nyata yang relevan dengan kehidupan sehari-hari",
    "taskInstruction": "Instruksi analisis tindakan dan pemecahan masalah",
    "guidingQuestions": ["Panduan analisis 1", "Panduan analisis 2"]
  },
  "activity3Practical": {
    "title": "Judul Tugas Praktik / Proyek Nyata",
    "objective": "Tujuan spesifik proyek",
    "toolsAndMaterials": ["Alat 1", "Bahan 2", "Dokumentasi Foto/Video"],
    "steps": ["Langkah 1", "Langkah 2", "Langkah 3", "Langkah 4"],
    "expectedOutput": "Output fisik / laporan yang dihasilkan",
    "safetyNotes": "Catatan keselamatan kerja atau etika",
    "evidenceType": "foto"
  },
  "evalQuestions": [
    {"id": "ev1", "type": "multiple-choice", "question": "Soal Pilihan Ganda 1", "options": ["A. Opsi 1", "B. Opsi 2", "C. Opsi 3", "D. Opsi 4"], "correctAnswer": "A. Opsi 1", "points": 10},
    {"id": "ev2", "type": "multiple-choice", "question": "Soal Pilihan Ganda 2", "options": ["A. Opsi 1", "B. Opsi 2", "C. Opsi 3", "D. Opsi 4"], "correctAnswer": "B. Opsi 2", "points": 10},
    {"id": "ev3", "type": "essay", "question": "Soal HOTS Uraian & Analisis Mandiri", "points": 15}
  ],
  "rubrikKeterampilan": [
    {
      "aspect": "Penguasaan Keterampilan / Analisis Proyek",
      "level4": "Sangat Baik (Skor 4)",
      "level3": "Baik (Skor 3)",
      "level2": "Cukup (Skor 2)",
      "level1": "Perlu Bimbingan (Skor 1)"
    }
  ],
  "kunciJawaban": {
    "pemahamanKey": "Panduan jawaban pemahaman...",
    "penerapanKey": "Panduan analisis penerapan...",
    "evaluasiKey": [
      {"questionId": "ev1", "answer": "A", "explanation": "Penjelasan..."}
    ],
    "tutorNotes": "Catatan khusus bagi Tutor Pendamping..."
  }
}`;

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7
        }
      });

      const text = response.text || "{}";
      const parsedData = JSON.parse(text);
      res.json({ success: true, data: parsedData });
    } catch (error: any) {
      console.error("Gemini LKPD Generation Error:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to generate AI LKPD" });
    }
  });

  // AI Assistant endpoint for tutor feedback & auto-grading suggestions
  app.post("/api/gemini/tutor-assist", async (req, res) => {
    try {
      const { studentAnswers, topic, subjectName, rubricCriteria } = req.body;
      const prompt = `Sebagai Tutor Ahli PKBM Buana Mekar, evaluasi jawaban peserta didik homeschooling berikut:
Mata Pelajaran: ${subjectName}
Topik: ${topic}
Kriteria Rubrik: ${JSON.stringify(rubricCriteria || {})}
Jawaban Peserta Didik: ${JSON.stringify(studentAnswers || {})}

Berikan feedback konstruktif, perkiraan nilai (0-100), saran pengayaan/remedial, dan catatan motivasi ramah untuk orang tua dan siswa dalam format JSON:
{
  "scoreEstimated": 85,
  "feedbackPengetahuan": "...",
  "feedbackKeterampilan": "...",
  "feedbackSikap": "...",
  "parentNotes": "...",
  "remedialOrEnrichment": "..."
}`;

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.5
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({ success: true, feedback: parsed });
    } catch (err: any) {
      console.error("Tutor assist error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PKBM Buana Mekar LKPD Server running on http://localhost:${PORT}`);
  });
}

startServer();
