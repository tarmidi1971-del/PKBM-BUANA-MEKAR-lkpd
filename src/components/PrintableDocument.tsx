import React, { useMemo } from 'react';
import { LKPDUnit, SubjectModule, InstitutionSettings } from '../types';
import { DEFAULT_INSTITUTION_SETTINGS } from '../data/settingsStorage';
import { getTeacherForSubject } from '../data/teacherDirectory';

interface PrintableDocumentProps {
  module: SubjectModule;
  unitsToPrint: LKPDUnit[];
  includeAnswerKey?: boolean;
  institutionSettings?: InstitutionSettings;
}

export const PrintableDocument: React.FC<PrintableDocumentProps> = ({
  module,
  unitsToPrint,
  includeAnswerKey = false,
  institutionSettings = DEFAULT_INSTITUTION_SETTINGS,
}) => {
  const isSMP = module.grade <= 9;
  const inst = institutionSettings || DEFAULT_INSTITUTION_SETTINGS;
  const subjectTeacher = useMemo(() => {
    return getTeacherForSubject(module.id, inst.subjectTeachers, '', inst.defaultTutor);
  }, [module.id, inst]);

  return (
    <div className="print-document hidden print:block text-black bg-white text-[11pt] font-serif leading-normal p-0 m-0">
      {/* If printing full year, add a Cover Page */}
      {unitsToPrint.length > 1 && (
        <div className="min-h-screen flex flex-col justify-between p-12 border-4 border-double border-slate-900 page-break-after">
          <div className="text-center space-y-4 pt-12">
            <p className="text-sm font-sans uppercase font-extrabold tracking-widest text-emerald-800">
              PUSAT KEGIATAN BELAJAR MASYARAKAT (PKBM) {inst.name.toUpperCase()}
            </p>
            <h1 className="text-3xl font-black font-sans uppercase tracking-tight text-slate-950">
              KUMPULAN MODUL & LKPD HOMESCHOOLING TERPADU
            </h1>
            <p className="text-lg font-bold font-sans text-slate-800 uppercase">
              1 TAHUN AJARAN LENGKAP (SEMESTER 1 & 2)
            </p>
            <div className="h-1 w-24 bg-emerald-800 mx-auto my-4" />
            <p className="text-sm font-sans text-slate-600">
              Kurikulum Merdeka Kesetaraan • Tahun Ajaran {inst.academicYear}
            </p>
            <p className="text-xs font-sans text-slate-500">
              NPSN: {inst.npsn || '-'} • {inst.address}
            </p>
          </div>

          <div className="my-16 p-8 bg-slate-50 border-2 border-slate-300 rounded-lg text-center space-y-3 font-sans">
            <h2 className="text-2xl font-extrabold text-slate-900">{module.name}</h2>
            <p className="text-base font-bold text-emerald-800">
              {isSMP ? 'PROGRAM PAKET B (SETARA SMP)' : 'PROGRAM PAKET C (SETARA SMA)'} — KELAS {module.grade}
            </p>
            <p className="text-xs text-slate-500">
              Berisi 8 Unit Lembar Kerja Peserta Didik Berbasis Proyek & Vokasi Mandiri
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-xs font-sans border-t-2 border-slate-800 pt-6">
            <div>
              <p className="font-bold text-slate-600">Identitas Peserta Didik:</p>
              <p className="mt-2 text-slate-900">Nama : ..............................................................</p>
              <p className="mt-2 text-slate-900">NIS : ..............................................................</p>
              <p className="mt-2 text-slate-900">Alamat : ..............................................................</p>
            </div>
            <div>
              <p className="font-bold text-slate-600">Penyelenggara Homeschooling:</p>
              <p className="mt-2 font-bold text-slate-900">{inst.name}</p>
              <p className="mt-1 text-slate-700">Kepala Lembaga: {inst.headName}</p>
              <p className="mt-1 text-slate-700">Tutor Pengampu Mapel: {subjectTeacher.teacherName}{subjectTeacher.phone ? ` (${subjectTeacher.phone})` : ''}</p>
              <p className="mt-1 text-slate-700">Tahun Ajaran: {inst.academicYear}</p>
            </div>
          </div>
        </div>
      )}

      {/* Render each unit */}
      {unitsToPrint.map((unit, uIdx) => (
        <div key={unit.id} className="unit-print-section p-8 space-y-6 page-break-after">
          {/* Header Kop */}
          <div className="border-b-2 border-black pb-3 text-center space-y-1">
            <p className="text-[10pt] font-sans font-bold tracking-wider text-slate-800 uppercase">
              {inst.name.toUpperCase()} • HOMESCHOOLING TERPADU
            </p>
            <p className="text-[8.5pt] font-sans text-slate-600">
              NPSN: {inst.npsn || '-'} • {inst.address}
            </p>
            {subjectTeacher.phone ? (
              <p className="text-[8.5pt] font-sans text-slate-800">
                <span>WA Tutor: <span className="font-semibold">{subjectTeacher.phone}</span> ({subjectTeacher.teacherName})</span>
              </p>
            ) : null}
            <h2 className="text-[15pt] font-sans font-black uppercase text-slate-950 pt-0.5">
              LEMBAR KERJA PESERTA DIDIK (LKPD)
            </h2>
            <p className="text-[9.5pt] font-sans text-slate-700">
              {isSMP ? 'Paket B (Setara SMP)' : 'Paket C (Setara SMA)'} Kelas {module.grade} • {module.name} • Tutor: {subjectTeacher.teacherName}
            </p>
          </div>

          {/* Metadata Table */}
          <table className="w-full text-[10pt] font-sans border border-black mb-4">
            <tbody>
              <tr>
                <td className="p-1.5 border border-black font-bold w-1/4 bg-slate-100">Nama Peserta Didik</td>
                <td className="p-1.5 border border-black w-1/4">........................................</td>
                <td className="p-1.5 border border-black font-bold w-1/4 bg-slate-100">Semester / Unit</td>
                <td className="p-1.5 border border-black w-1/4">Semester {unit.semester} / Unit {unit.unitNumber}</td>
              </tr>
              <tr>
                <td className="p-1.5 border border-black font-bold bg-slate-100">Mata Pelajaran</td>
                <td className="p-1.5 border border-black">{module.name}</td>
                <td className="p-1.5 border border-black font-bold bg-slate-100">Alokasi Waktu</td>
                <td className="p-1.5 border border-black">{unit.allocationWeeks}</td>
              </tr>
              <tr>
                <td className="p-1.5 border border-black font-bold bg-slate-100">Materi / Topik</td>
                <td colSpan={3} className="p-1.5 border border-black font-bold">{unit.topic}</td>
              </tr>
              <tr>
                <td className="p-1.5 border border-black font-bold bg-slate-100">Tutor Pengampu</td>
                <td colSpan={3} className="p-1.5 border border-black">
                  {subjectTeacher.teacherName} {subjectTeacher.phone ? <span className="font-normal text-[8.5pt]">({subjectTeacher.phone})</span> : null}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Section A: CP */}
          <div className="space-y-1">
            <h3 className="font-sans font-bold text-[11pt] uppercase border-b border-black pb-0.5">
              A. CAPAIAN PEMBELAJARAN (CP)
            </h3>
            <p className="text-[10pt] text-justify">{unit.capaianPembelajaran}</p>
          </div>

          {/* Section B: TP */}
          <div className="space-y-1">
            <h3 className="font-sans font-bold text-[11pt] uppercase border-b border-black pb-0.5">
              B. TUJUAN PEMBELAJARAN (TP)
            </h3>
            <ul className="list-disc pl-5 text-[10pt] space-y-0.5">
              {unit.tujuanPembelajaran.map((tp, idx) => (
                <li key={idx}>{tp}</li>
              ))}
            </ul>
          </div>

          {/* Section C: Petunjuk */}
          <div className="space-y-1">
            <h3 className="font-sans font-bold text-[11pt] uppercase border-b border-black pb-0.5">
              C. PETUNJUK BELAJAR HOMESCHOOLING
            </h3>
            <ol className="list-decimal pl-5 text-[9.5pt] space-y-0.5">
              {unit.homeschoolingInstructions.map((instItem, idx) => (
                <li key={idx}>{instItem}</li>
              ))}
            </ol>
          </div>

          {/* Section D: Ringkasan Materi */}
          <div className="space-y-1">
            <h3 className="font-sans font-bold text-[11pt] uppercase border-b border-black pb-0.5">
              D. RINGKASAN MATERI
            </h3>
            <p className="font-bold text-[10pt] font-sans text-slate-900">{unit.materiSummary.title}</p>
            <ul className="list-disc pl-5 text-[10pt] space-y-1">
              {unit.materiSummary.points.map((pt, idx) => (
                <li key={idx}>{pt}</li>
              ))}
            </ul>
            {unit.materiSummary.deepDiveMarkdown && (
              <p className="text-[9.5pt] italic text-justify mt-1">
                {unit.materiSummary.deepDiveMarkdown}
              </p>
            )}
          </div>

          {/* Section E: Aktivitas 1 */}
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-[11pt] uppercase border-b border-black pb-0.5">
              E. AKTIVITAS 1 – PEMAHAMAN KONSEP & MATERI
            </h3>
            <p className="text-[9.5pt] italic">{unit.activity1Pemahaman.instruction}</p>
            <div className="space-y-3">
              {unit.activity1Pemahaman.questions.map((q, idx) => (
                <div key={q.id} className="text-[10pt] space-y-1">
                  <p className="font-bold">{idx + 1}. {q.question}</p>
                  <div className="border-b border-dotted border-slate-500 h-10 w-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Section F: Aktivitas 2 */}
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-[11pt] uppercase border-b border-black pb-0.5">
              F. AKTIVITAS 2 – PENERAPAN KONTEKSTUAL & STUDI KASUS
            </h3>
            <p className="font-bold text-[10pt]">{unit.activity2Penerapan.title}</p>
            <p className="text-[9.5pt] text-justify"><strong>Konteks:</strong> {unit.activity2Penerapan.contextDescription}</p>
            <p className="text-[9.5pt] font-bold"><strong>Tugas:</strong> {unit.activity2Penerapan.taskInstruction}</p>
            <div className="border border-slate-400 p-2 min-h-20 text-[9pt] text-slate-400">
              Lembar Jawaban Analisis Kasus Peserta Didik:
            </div>
          </div>

          {/* Section G: Aktivitas 3 Praktik */}
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-[11pt] uppercase border-b border-black pb-0.5">
              G. AKTIVITAS 3 – TUGAS PROYEK / PRAKTIK NYATA
            </h3>
            <p className="font-bold text-[10pt] font-sans">{unit.activity3ProyekPraktik.title}</p>
            <p className="text-[9.5pt]"><strong>Tujuan:</strong> {unit.activity3ProyekPraktik.objective}</p>
            <p className="text-[9.5pt]"><strong>Alat & Bahan:</strong> {unit.activity3ProyekPraktik.toolsAndMaterials.join(', ')}</p>
            <p className="text-[9.5pt] font-bold">Langkah Kerja:</p>
            <ol className="list-decimal pl-5 text-[9.5pt] space-y-0.5">
              {unit.activity3ProyekPraktik.steps.map((st, sIdx) => (
                <li key={sIdx}>{st}</li>
              ))}
            </ol>
            {unit.activity3ProyekPraktik.safetyNotes && (
              <p className="text-[9pt] font-bold italic text-slate-800">
                * K3 & Keselamatan: {unit.activity3ProyekPraktik.safetyNotes}
              </p>
            )}
            <div className="border-2 border-dashed border-slate-400 p-3 text-center text-[9pt] text-slate-500 min-h-24">
              [ Tempelkan Foto / Lampiran Dokumentasi Karya Praktik di Sini ]
            </div>
          </div>

          {/* Section H: Evaluasi */}
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-[11pt] uppercase border-b border-black pb-0.5">
              H. SOAL EVALUASI
            </h3>
            <div className="space-y-2 text-[9.5pt]">
              {unit.soalEvaluasi.map((q, idx) => (
                <div key={q.id} className="space-y-0.5">
                  <p className="font-bold">{idx + 1}. {q.question}</p>
                  {q.type === 'multiple-choice' && q.options && (
                    <div className="grid grid-cols-2 gap-x-4 pl-4 text-[9pt]">
                      {q.options.map((opt, oIdx) => (
                        <p key={oIdx}>({String.fromCharCode(65 + oIdx)}) {opt}</p>
                      ))}
                    </div>
                  )}
                  {q.type !== 'multiple-choice' && (
                    <div className="border-b border-dotted border-slate-400 h-6 w-full" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section I: Refleksi */}
          <div className="space-y-1">
            <h3 className="font-sans font-bold text-[11pt] uppercase border-b border-black pb-0.5">
              I. REFLEKSI PESERTA DIDIK
            </h3>
            <ol className="list-decimal pl-5 text-[9.5pt] space-y-1">
              {unit.refleksiPesertaDidik.map((ref, idx) => (
                <li key={idx} className="space-y-0.5">
                  <span>{ref}</span>
                  <div className="border-b border-dotted border-slate-400 h-5 w-full" />
                </li>
              ))}
            </ol>
          </div>

          {/* Rubrik Penilaian Table */}
          <div className="space-y-1 pt-2">
            <h3 className="font-sans font-bold text-[10pt] uppercase">
              J & K. RUBRIK PENILAIAN
            </h3>
            <table className="w-full text-[8.5pt] font-sans border border-black border-collapse">
              <thead className="bg-slate-100 font-bold border-b border-black">
                <tr>
                  <th className="p-1 border border-black">Aspek</th>
                  <th className="p-1 border border-black">Sangat Baik (4)</th>
                  <th className="p-1 border border-black">Baik (3)</th>
                  <th className="p-1 border border-black">Cukup (2)</th>
                  <th className="p-1 border border-black">Perlu Bimbingan (1)</th>
                </tr>
              </thead>
              <tbody>
                {unit.rubrikKeterampilan.map((rub, rIdx) => (
                  <tr key={rIdx}>
                    <td className="p-1 border border-black font-bold">{rub.aspect}</td>
                    <td className="p-1 border border-black">{rub.level4}</td>
                    <td className="p-1 border border-black">{rub.level3}</td>
                    <td className="p-1 border border-black">{rub.level2}</td>
                    <td className="p-1 border border-black">{rub.level1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Lembar Pengesahan */}
          <div className="pt-4 border-t-2 border-black font-sans text-[9pt]">
            <div className="text-right text-[8.5pt] mb-2 text-slate-700">
              {inst.city}, .................................... {inst.academicYear.split('/')[0]}
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-12">
                <p>Peserta Didik</p>
                <p className="font-bold">( ....................................... )</p>
              </div>
              <div className="space-y-12">
                <p>Orang Tua / Wali</p>
                <p className="font-bold">( ....................................... )</p>
              </div>
              <div className="space-y-12">
                <p>Tutor Pengampu Mapel</p>
                <p className="font-bold">( {subjectTeacher.teacherName} )</p>
                {subjectTeacher.phone && (
                  <p className="text-[7.5pt] text-slate-600">WA: {subjectTeacher.phone}</p>
                )}
              </div>
            </div>

            {/* Mengetahui Kepala Lembaga PKBM */}
            <div className="mt-6 pt-3 text-center space-y-10">
              <div>
                <p className="text-[8.5pt] text-slate-600">Mengetahui,</p>
                <p className="font-bold text-[9pt]">Kepala {inst.name}</p>
              </div>
              <div>
                <p className="font-bold underline text-[9pt]">( {inst.headName} )</p>
                {inst.headNipOrNiy && (
                  <p className="text-[8pt] text-slate-700">
                    NIP/NIY: {inst.headNipOrNiy}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Optional Answer Key page */}
          {includeAnswerKey && (
            <div className="mt-8 pt-6 border-t-2 border-dashed border-black page-break-before space-y-2 font-sans text-[9pt]">
              <h4 className="font-bold uppercase text-[10pt] text-center">
                KUNCI JAWABAN & PANDUAN PENILAIAN TUTOR — UNIT {unit.unitNumber}
              </h4>
              <p><strong>Panduan Aktivitas 1:</strong> {unit.kunciJawabanDanPedoman.pemahamanKey}</p>
              <p><strong>Panduan Aktivitas 2:</strong> {unit.kunciJawabanDanPedoman.penerapanKey}</p>
              <p className="font-bold">Kunci Soal Evaluasi:</p>
              <ul className="list-disc pl-5 space-y-0.5">
                {unit.kunciJawabanDanPedoman.evaluasiKey.map((ek, idx) => (
                  <li key={idx}><strong>Soal {idx + 1} ({ek.answer})</strong>: {ek.explanation}</li>
                ))}
              </ul>
              <p><strong>Catatan Tutor:</strong> {unit.kunciJawabanDanPedoman.tutorNotes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
