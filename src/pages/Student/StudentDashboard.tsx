import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity, ArrowRight, BookOpen, CalendarDays, ClipboardList, MessageCircle, Megaphone } from 'lucide-react';
import { authHeaders, STUDENT_API, StudentPageState, useStudentLearning } from './useStudentLearning';

export default function StudentDashboard() {
  const { learning, loading, error } = useStudentLearning();
  const [classroom, setClassroom] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const classes = await axios.get(`${STUDENT_API}/classrooms/mine`, { headers: authHeaders() });
        const room = (classes.data.data || [])[0]; if (!active || !room) return;
        setClassroom(room);
        const date = new Date(); const localDate = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
        const [a, e, p] = await Promise.all([
          axios.get(`${STUDENT_API}/classrooms/${room.ID}/announcements`, { headers: authHeaders() }),
          axios.get(`${STUDENT_API}/classrooms/${room.ID}/events`, { headers: authHeaders() }),
          axios.get(`${STUDENT_API}/classrooms/${room.ID}/attendance?date=${localDate}`, { headers: authHeaders() }),
        ]);
        if (!active) return;
        setAnnouncements(a.data.data || []); setEvents(e.data.data || []); setAttendance(p.data.data || []);
      } catch { /* ClassroomPage explains class-data access in detail. */ }
    };
    load(); return () => { active = false; };
  }, []);
  const assignments = learning?.assignments || [];
  const submissions = learning?.submissions || [];
  const submitted = new Set(submissions.map((item: any) => item.AssignmentID));
  const pending = assignments.filter((item: any) => !submitted.has(item.ID));
  const upcoming = pending.slice(0, 3);
  let sessionUser: any = {};
  try { sessionUser = JSON.parse(localStorage.getItem('user') || 'null') || {}; } catch { sessionUser = {}; }
  const name = sessionUser.Name || sessionUser.name || learning?.student?.User?.Name || learning?.student?.user?.Name || learning?.student?.user?.name || 'Siswa';
  return <StudentPageState loading={loading} error={error}><div className="space-y-6">
    <section className="role-item-in rounded-2xl bg-[#0F294A] p-5 text-white shadow-sm sm:p-7"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">Ruang belajar siswa</p><h1 className="mt-2 text-2xl font-bold sm:text-3xl">Halo, {name} 👋</h1><p className="mt-2 text-sm leading-6 text-blue-100/75">{classroom?.Name ? `Selamat datang di kelas ${classroom.Name}.` : 'Pantau materi, tugas, dan kegiatan kelasmu di sini.'} Semua aktivitas belajarmu ada dalam satu tempat.</p><button onClick={() => navigate('/student/classroom')} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#0F294A] transition hover:bg-blue-50">Buka Kelas Saya <ArrowRight size={16}/></button></section>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
      { label: 'Mata Pelajaran', value: learning?.class_subjects?.length || 0, icon: BookOpen, to: '/student/materials' },
      { label: 'Materi Tersedia', value: learning?.materials?.length || 0, icon: BookOpen, to: '/student/materials' },
      { label: 'Tugas Belum Dikumpulkan', value: pending.length, icon: ClipboardList, to: '/student/assignments' },
      { label: 'Presensi Hari Ini', value: attendance[0]?.status || 'Belum ada', icon: Activity, to: '/student/classroom' },
    ].map(({label,value,icon:Icon,to}, index) => <button key={label} onClick={() => navigate(to)} style={{ animationDelay: `${index*60}ms` }} className="role-item-in flex min-w-0 items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><span className="rounded-xl bg-[#EAF1FA] p-3 text-[#1C4D8D]"><Icon size={20}/></span><span className="min-w-0"><span className="block text-xl font-bold text-gray-800">{value}</span><span className="block truncate text-xs text-gray-500">{label}</span></span></button>)}</div>
    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold text-gray-800">Tugas berikutnya</h2><p className="mt-1 text-xs text-gray-400">Yang belum kamu kumpulkan</p></div><button onClick={() => navigate('/student/assignments')} className="text-xs font-semibold text-[#1C4D8D]">Semua tugas</button></div>{upcoming.length ? <div className="space-y-2">{upcoming.map((item:any)=><article key={item.ID} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 p-4"><div><h3 className="text-sm font-semibold text-gray-800">{item.Title}</h3><p className="mt-1 text-xs text-gray-500">{item.ClassSubject?.Subject?.Name || 'Mata pelajaran'} · Tenggat {new Date(item.DueDate).toLocaleDateString('id-ID',{dateStyle:'medium'})}</p></div><button onClick={()=>navigate('/student/assignments')} className="rounded-lg bg-[#1C4D8D] px-3 py-2 text-xs font-semibold text-white">Kerjakan</button></article>)}</div>:<p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">Semua tugas sudah dikumpulkan. Pertahankan!</p>}</section>
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><h2 className="font-bold text-gray-800">Akses cepat</h2><div className="mt-4 grid grid-cols-2 gap-2">{[{label:'Materi belajar',icon:BookOpen,to:'/student/materials'},{label:'Diskusi kelas',icon:MessageCircle,to:'/student/classroom'},{label:'Pengumuman',icon:Megaphone,to:'/student/classroom'},{label:'Agenda kelas',icon:CalendarDays,to:'/student/classroom'}].map(({label,icon:Icon,to})=><button key={label} onClick={()=>navigate(to)} className="flex items-center gap-2 rounded-xl border border-gray-100 p-3 text-left text-xs font-medium text-gray-600 transition hover:border-blue-200 hover:bg-blue-50"><Icon size={16} className="text-[#1C4D8D]"/>{label}</button>)}</div></section>
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><h2 className="font-bold text-gray-800">Pengumuman kelas</h2>{announcements.length ? <div className="mt-4 space-y-3">{announcements.slice(0,3).map((item:any)=><article key={item.ID} className="border-l-2 border-[#1C4D8D] pl-3"><p className="text-sm font-semibold text-gray-800">{item.Title}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">{item.Content}</p></article>)}</div>:<p className="mt-3 text-sm text-gray-400">Belum ada pengumuman baru.</p>}</section>
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><h2 className="font-bold text-gray-800">Agenda mendatang</h2>{events.length ? <div className="mt-4 space-y-3">{events.slice(0,3).map((item:any)=><article key={item.ID} className="flex gap-3"><CalendarDays size={17} className="mt-0.5 text-[#1C4D8D]"/><div><p className="text-sm font-semibold text-gray-800">{item.Title}</p><p className="mt-1 text-xs text-gray-500">{new Date(item.StartsAt).toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'})}</p></div></article>)}</div>:<p className="mt-3 text-sm text-gray-400">Belum ada agenda yang dijadwalkan.</p>}</section>
    </div>
  </div></StudentPageState>;
}
