import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, CalendarDays, ClipboardList, GraduationCap, LayoutDashboard, LogOut, Menu, MessageCircle, Users, X } from 'lucide-react';

const items = [
  { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
  { name: 'Materi Belajar', path: '/student/materials', icon: BookOpen },
  { name: 'Tugas', path: '/student/assignments', icon: ClipboardList },
  { name: 'Nilai', path: '/student/grades', icon: GraduationCap },
  { name: 'Jadwal Pelajaran', path: '/student/timetable', icon: CalendarDays },
  { name: 'Kelas Saya', path: '/student/classroom', icon: Users },
];

function getUser() { try { return JSON.parse(localStorage.getItem('user') || 'null') || {}; } catch { return {}; } }

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const user = getUser();
  const name = user.Name || user.name || 'Siswa';
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('');
  const logout = () => { localStorage.clear(); navigate('/login', { replace: true }); };
  const nav = (mobile = false) => <nav className="space-y-1 px-3 py-2">{items.map(({ name: label, path, icon: Icon }) => <button key={path} type="button" onClick={() => { if (mobile) setMobileOpen(false); navigate(path); }} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${location.pathname === path ? 'bg-[#1C4D8D] text-white shadow-sm' : 'text-blue-100/75 hover:bg-white/10 hover:text-white'}`}><Icon size={18} />{label}</button>)}</nav>;
  return <div className="flex h-dvh overflow-hidden bg-gray-50 font-sans">
    <aside className="hidden w-64 shrink-0 flex-col justify-between bg-[#0F294A] text-white md:flex"><div><div className="flex items-center gap-3 p-6"><div className="rounded-xl bg-[#1C4D8D] p-2 text-sm font-bold">SI</div><div><h1 className="text-sm font-bold tracking-wide">SIAS Siswa</h1><p className="text-[10px] text-blue-100/55">Ruang Belajar</p></div></div><p className="px-6 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-widest text-blue-100/45">Menu Siswa</p>{nav()}</div><button type="button" onClick={logout} className="m-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/10"><LogOut size={18} />Keluar</button></aside>
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden"><header className="relative z-40 flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-3 shadow-sm sm:px-6"><div className="flex items-center gap-3"><button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="grid h-10 w-10 place-items-center rounded-xl border border-gray-200 text-[#1C4D8D] md:hidden" aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}>{mobileOpen ? <X size={19} /> : <Menu size={19} />}</button><div className="hidden items-center gap-2 text-sm font-semibold text-gray-500 sm:flex"><CalendarDays size={17} className="text-[#1C4D8D]" />Tahun ajaran berjalan</div></div><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1C4D8D] text-xs font-bold text-white">{initials || 'SW'}</div><div className="hidden sm:block"><p className="max-w-40 truncate text-xs font-bold text-gray-800">{name}</p><p className="text-[10px] text-gray-400">Siswa</p></div></div></header>
      {mobileOpen && <><button type="button" aria-label="Tutup menu" onClick={() => setMobileOpen(false)} className="fixed inset-x-0 bottom-0 top-16 z-40 bg-black/35 md:hidden"/><aside className="mobile-nav-enter fixed bottom-0 left-0 top-16 z-50 flex w-72 max-w-[85vw] flex-col justify-between overflow-y-auto bg-[#0F294A] text-white shadow-2xl md:hidden"><div><div className="border-b border-white/10 px-5 py-4"><p className="text-sm font-bold">SIAS Siswa</p><p className="mt-1 text-[10px] text-blue-100/55">Menu Siswa</p></div>{nav(true)}</div><button type="button" onClick={logout} className="m-3 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-300 hover:bg-red-500/10"><LogOut size={18}/>Keluar</button></aside></>}
      <main key={location.pathname} className="role-page-enter min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-3 sm:p-4 lg:p-6"><Outlet /></main>
    </div>
  </div>;
}
