import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Bell, User, LogOut, LayoutDashboard, Users, GraduationCap, BookOpen, Layers, Calendar, Megaphone } from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: 'Fulani bin Fulano',
    email: 'admin@sias.edu',
    role: 'Administrator'
  });

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Manajemen Siswa', path: '/admin/students', icon: <Users size={18} /> },
    { name: 'Manajemen Guru', path: '/admin/teachers', icon: <GraduationCap size={18} /> },
    { name: 'Daftar Mata Pelajaran', path: '/admin/subjects', icon: <BookOpen size={18} /> },
    { name: 'Manajemen Kelas', path: '/admin/classes', icon: <Layers size={18} /> },
    { name: 'Kalender', path: '/admin/calendar', icon: <Calendar size={18} /> },
    { name: 'Pengumuman', path: '/admin/announcements', icon: <Megaphone size={18} /> },
  ];

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    alert('Profil berhasil diperbarui!');
    setIsProfileModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar Sesuai Desain Figma */}
      <aside className="w-64 bg-[#0F294A] text-white flex flex-col justify-between hidden md:flex shadow-md">
        <div>
          <div className="p-6 flex items-center gap-3">
            <div className="bg-[#1C4D8D] text-white p-2 rounded-xl font-bold text-sm shadow-sm">SI</div>
            <div>
              <h1 className="font-bold text-sm tracking-wide">SIAS Admin</h1>
              <p className="text-[10px] text-gray-400">Institutional Control</p>
            </div>
          </div>
          <nav className="px-4 space-y-1 mt-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition ${
                    isActive ? 'bg-[#1C4D8D] text-white shadow-sm' : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {item.icon} {item.name}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => { localStorage.clear(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl text-xs font-medium transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between relative z-40 shadow-xs">
          <div className="relative w-80">
            <input 
              type="text" 
              name="global_search"
              id="global_search"
              placeholder="Cari data, siswa, atau materi..." 
              className="w-full pl-4 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D]"
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Tombol Notifikasi */}
            <div className="relative">
              <button 
                onClick={() => navigate('/admin/announcements')}
                className="relative p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition"
                title="Notifikasi"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
              </button>
            </div>

            {/* Dropdown Profil Pengguna */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-50 transition text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-[#1C4D8D] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  FA
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">{profileData.name}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{profileData.role}</p>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 text-xs text-gray-700">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-bold text-gray-800">{profileData.name}</p>
                    <p className="text-[10px] text-gray-400">{profileData.email}</p>
                  </div>
                  <button 
                    onClick={() => { setShowProfileMenu(false); setIsProfileModalOpen(true); }}
                    className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-gray-50 text-gray-600 transition"
                  >
                    <User size={14} /> Atur Profil & Foto
                  </button>
                  <button 
                    onClick={() => { setShowProfileMenu(false); localStorage.clear(); navigate('/login'); }}
                    className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-red-50 text-red-500 transition font-medium border-t border-gray-100 mt-1"
                  >
                    <LogOut size={14} /> Keluar Aplikasi
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content (Di sinilah halaman anak seperti Dashboard/Siswa/Guru akan dirender) */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>

      {/* Modal Pengaturan Profil */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 space-y-4">
            <h4 className="font-bold text-gray-800 text-base">Atur Profil Akun Pribadi</h4>
            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-gray-600">Nama Lengkap</label>
                <input 
                  type="text" 
                  name="modal_name"
                  id="modal_name"
                  value={profileData.name} 
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1C4D8D]"
                  required
                />
              </div>
              <div>
                <label className="font-semibold block mb-1 text-gray-600">Alamat Email</label>
                <input 
                  type="email" 
                  name="modal_email"
                  id="modal_email"
                  value={profileData.email} 
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1C4D8D]"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 font-semibold"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1C4D8D] text-white font-semibold shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}