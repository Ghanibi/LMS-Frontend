import React from 'react';
import { Award, GraduationCap } from 'lucide-react';
import { StudentPageState, useStudentLearning } from './useStudentLearning';

export default function StudentGrades() {
  const { learning, loading, error } = useStudentLearning();
  const submissions = (learning?.submissions || []).filter((item: any) => item.Score !== null && item.Score !== undefined);
  const grades = learning?.grades || [];
  const scores = [
    ...submissions.map((item: any) => ({ id: `s-${item.ID}`, subject: item.Assignment?.ClassSubject?.Subject?.Name || 'Tugas', title: item.Assignment?.Title || 'Nilai tugas', score: item.Score, max: item.Assignment?.MaxScore || 100, notes: item.Feedback, date: item.SubmittedAt })),
    ...grades.map((item: any) => ({ id: `g-${item.ID}`, subject: learning?.class_subjects?.find((classSubject: any) => classSubject.SubjectID === item.SubjectID)?.Subject?.Name || 'Nilai mata pelajaran', title: item.Notes || 'Penilaian', score: item.Score, max: 100, notes: '', date: item.CreatedAt })),
  ];
  const average = scores.length ? (scores.reduce((sum: number, item: any) => sum + Number(item.score), 0) / scores.length).toFixed(1) : '—';

  return (
    <StudentPageState loading={loading} error={error}>
      <div className="space-y-5">
        <div><h1 className="text-xl font-bold text-gray-800">Nilai Saya</h1><p className="mt-1 text-sm text-gray-500">Rekap hasil tugas dan penilaian yang sudah dibagikan guru.</p></div>
        <section className="flex items-center gap-4 rounded-2xl bg-[#0F294A] p-5 text-white"><span className="rounded-xl bg-white/10 p-3 text-blue-200"><Award size={24} /></span><div><p className="text-xs text-blue-100/70">Rata-rata nilai tercatat</p><p className="mt-1 text-2xl font-bold">{average}</p></div><p className="ml-auto hidden text-xs text-blue-100/60 sm:block">{scores.length} penilaian</p></section>
        {scores.length ? (
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"><div className="divide-y divide-gray-100">
            {scores.map((item: any) => (
              <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-5"><div className="flex items-start gap-3"><span className="rounded-xl bg-[#EAF1FA] p-2.5 text-[#1C4D8D]"><GraduationCap size={18} /></span><div><p className="text-sm font-semibold text-gray-800">{item.title}</p><p className="mt-1 text-xs text-gray-500">{item.subject}{item.date ? ` · ${new Date(item.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}` : ''}</p>{item.notes && <p className="mt-2 text-xs text-gray-600">Umpan balik: {item.notes}</p>}</div></div><strong className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700">{item.score}/{item.max}</strong></article>
            ))}
          </div></div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center"><GraduationCap className="mx-auto text-gray-300" size={34} /><h2 className="mt-3 font-semibold text-gray-700">Belum ada nilai</h2><p className="mt-1 text-sm text-gray-500">Nilai akan muncul setelah guru memeriksa tugasmu.</p></div>
        )}
      </div>
    </StudentPageState>
  );
}
