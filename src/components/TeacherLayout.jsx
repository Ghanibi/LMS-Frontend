import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Users,
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', path: '/teacher/dashboard', icon: <LayoutDashboard size={18} /> },
  { name: 'Kelas Saya', path: '/teacher/classroom', icon: <Users size={18} /> },
  { name: 'Materi Pembelajaran', path: '/teacher/materials', icon: <BookOpen size={18} /> },
  { name: 'Tugas & Penilaian', path: '/teacher/assignments', icon: <ClipboardList size={18} /> },
];

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null') || {};
  } catch {
    return {};
  }
}

export default function TeacherLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const name = user.Name || user.name || 'Guru';
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      <aside className="hidden w-64 shrink-0 flex-col justify-between bg-[#0F294A] text-white shadow-md md:flex">
        <div>
          <div className="flex items-center gap-3 p-6">
            <div className="rounded-xl bg-[#1C4D8D] p-2 text-sm font-bold text-white shadow-sm">SI</div>
            <div>
              <h1 className="text-sm font-bold tracking-wide">SIAS Guru</h1>
              <p className="text-[10px] text-gray-400">Learning Management</p>
            </div>
          </div>

          <p className="px-6 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Menu Guru
          </p>
          <nav className="mt-1 space-y-1 px-4">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-medium transition ${
                    isActive
                      ? 'bg-[#1C4D8D] text-white shadow-sm'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="relative z-20 flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 shadow-sm sm:px-6">
          <div className="w-full max-w-xs">
            <input
              type="search"
              placeholder="Cari materi atau tugas..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-xs focus:border-[#1C4D8D] focus:outline-none"
            />
          </div>

          <div className="ml-4 flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate('/teacher/assignments')}
              className="relative rounded-xl bg-gray-50 p-2 text-gray-600 transition hover:bg-gray-100"
              title="Tugas dan penilaian"
            >
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1C4D8D] text-xs font-bold text-white shadow-sm">
                {initials || 'GU'}
              </div>
              <div className="hidden sm:block">
                <p className="max-w-36 truncate text-xs font-bold text-gray-800">{name}</p>
                <p className="max-w-36 truncate text-[10px] font-medium text-gray-400">Guru</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
