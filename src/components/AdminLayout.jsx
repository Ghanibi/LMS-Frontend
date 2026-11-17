import React, { useState } from 'react';
import axios from 'axios';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Bell, User, LogOut, LayoutDashboard, Users, GraduationCap, BookOpen, Layers, Calendar, Megaphone, Menu, X, KeyRound } from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  let currentUser = {};
  try { currentUser = JSON.parse(localStorage.getItem('user') || 'null') || {}; } catch { currentUser = {}; }
  const isSuperAdmin = String(currentUser.Role || '').toUpperCase() === 'SUPER_ADMIN';
  const initials = String(currentUser.Name || 'Admin').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('');
  const [profileData, setProfileData] = useState({
    name: currentUser.Name || 'Administrator',
    email: currentUser.Email || 'admin@sias.edu',
    role: isSuperAdmin ? 'Super Administrator' : 'Administrator'
  });

  const menuItems = [
    { name: 'Dashboard', path: isSuperAdmin ? '/super-admin/dashboard' : '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Manajemen Siswa', path: '/admin/students', icon: <Users size={18} /> },
    { name: 'Manajemen Guru', path: '/admin/teachers', icon: <GraduationCap size={18} /> },
    { name: 'Akun Pimpinan & Kurikulum', path: '/admin/leadership-accounts', icon: <User size={18} /> },
    { name: 'Daftar Mata Pelajaran', path: '/admin/subjects', icon: <BookOpen size={18} /> },
    { name: 'Manajemen Kelas', path: '/admin/classes', icon: <Layers size={18} /> },
    { name: 'Kalender', path: '/admin/calendar', icon: <Calendar size={18} /> },
    { name: 'Pengumuman', path: '/admin/announcements', icon: <Megaphone size={18} /> },
    ...(isSuperAdmin
      ? [{ name: 'Manajemen Admin', path: '/super-admin/accounts', icon: <Users size={18} /> }]
      : [{ name: 'Aktifkan Super Admin', path: '/admin/super-admin', icon: <User size={18} /> }]),
  ];

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    alert('Profil berhasil diperbarui!');
    setIsProfileModalOpen(false);
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setPasswordError('');
    if (passwordForm.newPassword.length < 8) { setPasswordError('Password baru minimal 8 karakter.'); return; }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { setPasswordError('Konfirmasi password baru belum sama.'); return; }
    setPasswordSaving(true);
    try {
      await axios.post('/api/auth/change-password', {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsPasswordModalOpen(false);
      window.alert('Password berhasil diubah. Gunakan password baru saat login berikutnya.');
    } catch (requestError) {
      setPasswordError(requestError.response?.data?.error || 'Password gagal diubah. Coba lagi.');
    } finally { setPasswordSaving(false); }
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-gray-50 font-sans">
      {/* Sidebar Sesuai Desain Figma */}
      <aside className="w-64 bg-[#0F294A] text-white flex flex-col justify-between hidden md:flex shadow-md">
        <div>
          <div className="p-6 flex items-center gap-3">
            <div className="bg-[#1C4D8D] text-white p-2 rounded-xl font-bold text-sm shadow-sm">SI</div>
            <div>
              <h1 className="font-bold text-sm tracking-wide">{isSuperAdmin ? 'SIAS Super Admin' : 'SIAS Admin'}</h1>
              <p className="text-[10px] text-gray-400">{isSuperAdmin ? 'System Control' : 'Institutional Control'}</p>
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
        <header className="relative z-40 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-gray-100 bg-white px-3 shadow-xs sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button type="button" onClick={() => setIsMobileNavOpen(!isMobileNavOpen)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gray-200 bg-white text-[#1C4D8D] md:hidden" aria-label={isMobileNavOpen ? 'Tutup menu' : 'Buka menu'}>
              {isMobileNavOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          <div className="relative w-full max-w-[190px] sm:max-w-xs lg:max-w-80">
            <input 
              type="text" 
              name="global_search"
              id="global_search"
              placeholder="Cari data, siswa, atau materi..." 
              className="w-full pl-4 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D]"
            />
          </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
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
                  {initials || 'AD'}
                </div>
                <div className="hidden sm:block">
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
                    onClick={() => { setShowProfileMenu(false); setPasswordError(''); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); setIsPasswordModalOpen(true); }}
                    className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-gray-50 text-gray-600 transition"
                  >
                    <KeyRound size={14} /> Ganti Password
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

        {isMobileNavOpen && <>
          <button type="button" aria-label="Tutup menu" onClick={() => setIsMobileNavOpen(false)} className="fixed inset-x-0 bottom-0 top-16 z-40 bg-black/35 md:hidden" />
          <aside className="mobile-nav-enter fixed bottom-0 left-0 top-16 z-50 flex w-72 max-w-[85vw] flex-col justify-between overflow-y-auto bg-[#0F294A] text-white shadow-2xl md:hidden">
            <div>
              <div className="border-b border-white/10 px-5 py-4"><p className="text-sm font-bold">{isSuperAdmin ? 'SIAS Super Admin' : 'SIAS Admin'}</p><p className="mt-1 text-[10px] text-blue-100/55">Menu Administrasi</p></div>
              <nav className="space-y-1 px-3 py-4">
                {menuItems.map((item) => <button key={item.path} type="button" onClick={() => { setIsMobileNavOpen(false); navigate(item.path); }} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-medium transition ${location.pathname === item.path ? 'bg-[#1C4D8D] text-white' : 'text-gray-300 hover:bg-white/5'}`}>{item.icon}{item.name}</button>)}
              </nav>
            </div>
            <button type="button" onClick={() => { localStorage.clear(); navigate('/login'); }} className="m-3 flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-medium text-red-300 hover:bg-red-500/10"><LogOut size={18} /> Logout</button>
          </aside>
        </>}

        {/* Dynamic Page Content (Di sinilah halaman anak seperti Dashboard/Siswa/Guru akan dirender) */}
        <main key={location.pathname} className="role-page-enter min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-3 sm:p-4 lg:p-6">
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
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby="change-password-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start gap-3"><span className="rounded-xl bg-blue-50 p-3 text-[#1C4D8D]"><KeyRound size={20}/></span><div><h2 id="change-password-title" className="font-bold text-gray-800">Ganti Password</h2><p className="mt-1 text-xs text-gray-500">Masukkan password lama dan buat password baru minimal 8 karakter.</p></div></div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <label className="block text-xs font-semibold text-gray-600">Password lama<input required type="password" autoComplete="current-password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-normal focus:border-[#1C4D8D] focus:outline-none" /></label>
              <label className="block text-xs font-semibold text-gray-600">Password baru<input required minLength={8} maxLength={72} type="password" autoComplete="new-password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-normal focus:border-[#1C4D8D] focus:outline-none" /></label>
              <label className="block text-xs font-semibold text-gray-600">Konfirmasi password baru<input required minLength={8} maxLength={72} type="password" autoComplete="new-password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-normal focus:border-[#1C4D8D] focus:outline-none" /></label>
              {passwordError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{passwordError}</p>}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4"><button type="button" disabled={passwordSaving} onClick={() => setIsPasswordModalOpen(false)} className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 disabled:opacity-50">Batal</button><button disabled={passwordSaving} className="rounded-xl bg-[#1C4D8D] px-5 py-2 text-xs font-semibold text-white shadow-sm disabled:opacity-50">{passwordSaving ? 'Menyimpan...' : 'Simpan Password Baru'}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
