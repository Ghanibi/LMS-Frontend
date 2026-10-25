import React from 'react';
import { CalendarDays, Clock3, GraduationCap } from 'lucide-react';
import { StudentPageState, useStudentLearning } from './useStudentLearning';

const DAYS = [
  ['MONDAY', 'Senin'], ['TUESDAY', 'Selasa'], ['WEDNESDAY', 'Rabu'], ['THURSDAY', 'Kamis'], ['FRIDAY', 'Jumat'],
];

export default function StudentTimetable() {
  const { learning, loading, error } = useStudentLearning();
  const schedule = learning?.timetable || [];
  const className = learning?.student?.Class?.Name || learning?.student?.class?.Name || 'Kelas saya';
  return <StudentPageState loading={loading} error={error}><div className="space-y-5">
    <header><p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1C4D8D]"><CalendarDays size={15}/>Jadwal kelas</p><h1 className="mt-1 text-2xl font-bold text-gray-800">Jadwal Pelajaran</h1><p className="mt-1 text-sm text-gray-500">{className} · Jadwal ini sama untuk semua siswa di kelasmu.</p></header>
    {!schedule.length ? <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center"><CalendarDays className="mx-auto text-gray-300" size={34}/><h2 className="mt-3 font-semibold text-gray-700">Jadwal belum tersedia</h2><p className="mt-1 text-sm text-gray-500">Admin sekolah akan menambahkan jadwal kelasmu.</p></section> : DAYS.map(([day, label]) => {
      const rows = schedule.filter((item: any) => item.Day === day || item.day === day).sort((a: any, b: any) => Number(a.Period || a.period) - Number(b.Period || b.period));
      if (!rows.length) return null;
      return <section key={day} className="role-item-in overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"><div className="flex items-center gap-3 bg-[#0F294A] px-4 py-3 text-white"><span className="rounded-lg bg-white/10 p-2"><CalendarDays size={17}/></span><div><h2 className="font-bold">{label}</h2><p className="text-[11px] text-blue-100/70">{rows.length} jam pelajaran</p></div></div><div className="divide-y divide-gray-100">{rows.map((item: any) => { const teacherName = item.Teacher?.User?.Name || item.teacher?.user?.Name || item.teacher_name || item.TeacherName; const review = item.needs_review ?? item.NeedsReview; return <article key={item.ID || `${day}-${item.Period}`} className="flex items-center gap-3 p-4 sm:gap-4"><div className="w-14 shrink-0 text-center"><span className="block text-[10px] font-bold uppercase text-gray-400">Jam</span><span className="text-lg font-bold text-[#1C4D8D]">{item.Period || item.period}</span></div><div className="h-10 w-px bg-gray-100"/><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-bold text-gray-800">{item.Subject?.Name || item.subject?.Name || 'Mapel perlu dikonfirmasi'}</h3>{review && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-semibold text-amber-700">Menunggu konfirmasi</span>}</div><p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500"><span className="inline-flex items-center gap-1"><Clock3 size={13}/>{item.StartTime || item.start_time}–{item.EndTime || item.end_time}</span>{teacherName && <span className="inline-flex items-center gap-1"><GraduationCap size={13}/>{teacherName}{(item.TeacherCode || item.teacher_code) ? ` · Kode ${item.TeacherCode || item.teacher_code}` : ''}</span>}</p></div></article>; })}</div></section>;
    })}
  </div></StudentPageState>;
}
