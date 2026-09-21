import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  School, 
  Calendar, 
  Bell, 
  LogOut,
  Search
} from 'lucide-react';

export default function AdminLayout({ children, activeMenu, setActiveMenu }) {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Manajemen Siswa', icon: Users },
    { name: 'Manajemen Guru', icon: GraduationCap },
    { name: 'Daftar Mata Pelajaran', icon: BookOpen },
    { name: 'Manajemen Kelas', icon: School },
    { name: 'Kalender', icon: Calendar },
    { name: 'Pengumuman', icon: Bell },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* Sidebar dengan warna Figma #0F2854 */}
      <aside className="w-64 bg-[#0F2854] text-slate-300 flex flex-col justify-between p-6">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-[#4988C4] p-2 rounded-lg text-white font-bold">SI</div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">SIAS Admin</h1>
              <p className="text-xs text-[#4988C4]">Institutional Control</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveMenu(item.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    isActive 
                      ? 'bg-[#1C4D8D] text-white shadow-lg shadow-[#1C4D8D]/30' 
                      : 'hover:bg-[#1C4D8D]/40 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/10 transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8">
          <h2 className="text-xl font-bold text-gray-800">{activeMenu}</h2>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Cari data, siswa, atau materi..."
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#4988C4] w-72"
              />
            </div>

            <button className="relative p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-3 border-l pl-6 border-gray-200">
              <div className="w-10 h-10 rounded-full bg-[#4988C4]/10 flex items-center font-bold text-[#1C4D8D] justify-center">
                FA
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Fulani bin Fulano</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="p-8 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}