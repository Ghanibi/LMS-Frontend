import React from 'react';
import { GraduationCap, Users, BookOpen, FileText, Award, Bell } from 'lucide-react';

export default function DashboardHome() {
  const stats = [
    { title: 'Total Guru', value: '86', icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Total Siswa', value: '2.000', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Total Mata Pelajaran', value: '19', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Total Tugas', value: '154', icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50' },
    { title: 'Total Ujian', value: '48', icon: Award, color: 'text-rose-500', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div>
        <h3 className="text-xl font-bold text-gray-800">Dashboard</h3>
        <p className="text-xs text-gray-500 mt-0.5">Selamat datang kembali, Fulani. Berikut ringkasan aktivitas sekolah hari ini.</p>
      </div>

      {/* Stats Cards (5 Kolom) */}
      <div className="grid grid-cols-5 gap-4">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3.5">
              <div className={`p-2.5 rounded-xl ${item.bg} ${item.color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-800">{item.value}</p>
                <p className="text-[11px] text-gray-400 font-medium">{item.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid Tengah (Grafik & Kalender Akademik) */}
      <div className="grid grid-cols-3 gap-6">
        {/* Grafik Aktivitas Sekolah (2 Kolom) */}
        <div className="col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-gray-800 text-sm">Grafik Aktivitas Sekolah</h4>
              <p className="text-[11px] text-gray-400">Jumlah aktivitas per bulan (semester ganjil)</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#0F2854] rounded-full"></span> Tugas</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#4988C4] rounded-full"></span> Ujian</span>
            </div>
          </div>
          
          <div className="h-52 flex items-end justify-between px-2 pt-6 border-b border-gray-100">
            {['Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'].map((month, i) => (
              <div key={i} className="flex flex-col items-center gap-2 h-full justify-end">
                <div className="flex items-end gap-1 h-40">
                  <div className="w-3.5 bg-[#0F2854] rounded-t-sm" style={{ height: `${45 + i * 10}%` }}></div>
                  <div className="w-3.5 bg-[#4988C4] rounded-t-sm" style={{ height: `${35 + i * 12}%` }}></div>
                </div>
                <span className="text-[11px] text-gray-400 font-medium">{month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Kalender Akademik (1 Kolom) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h4 className="font-bold text-gray-800 text-sm">Kalender Akademik</h4>
          
          <div className="space-y-3">
            {[
              { date: '12 DES', title: 'Ujian Akhir Semester', desc: '08:00 - 12:00 WIB' },
              { date: '18 DES', title: 'Rapat Wali Kelas', desc: '13:00 WIB - Aula' },
              { date: '22 DES', title: 'Pembagian Rapor', desc: '08:00 WIB - Kelas' },
              { date: '25 DES', title: 'Libur Semester Ganjil', desc: 'Sepanjang hari' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                <div className="bg-white px-2.5 py-1.5 rounded-lg text-center shadow-xs">
                  <span className="block text-[10px] font-bold text-amber-500">{item.date.split(' ')[0]}</span>
                  <span className="block text-[9px] font-bold text-gray-400">{item.date.split(' ')[1]}</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">{item.title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Bawah (Aktivitas Terbaru & Notifikasi) */}
      <div className="grid grid-cols-3 gap-6">
        {/* Aktivitas Terbaru (2 Kolom) */}
        <div className="col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-gray-800 text-sm">Aktivitas Terbaru</h4>
            <span className="text-xs text-[#1C4D8D] font-semibold cursor-pointer hover:underline">Lihat Semua</span>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-3 text-[11px] font-bold text-gray-400 pb-2 border-b border-gray-100">
              <span>Pengguna</span>
              <span>Aktivitas</span>
              <span className="text-right">Waktu</span>
            </div>

            {[
              { name: 'Rahmania', act: 'Mengunggah materi Fisika Bab 5', time: '5 menit lalu', img: 'RA' },
              { name: 'Ahmad Fauzi', act: 'Mengumpulkan tugas Matematika', time: '22 menit lalu', img: 'AF' },
              { name: 'Dewi Lestari', act: 'Membuat jadwal ujian Biologi', time: '1 jam lalu', img: 'DL' },
              { name: 'Sri Wulandari', act: 'Mengunduh materi Sejarah', time: '2 jam lalu', img: 'SW' },
              { name: 'Bambang Wijaya', act: 'Menambahkan pengumuman baru', time: '3 jam lalu', img: 'BW' },
            ].map((item, i) => (
              <div key={i} className="grid grid-cols-3 items-center py-2 border-b border-gray-50 last:border-none text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#1C4D8D]/10 text-[#1C4D8D] font-bold flex items-center justify-center text-[10px]">
                    {item.img}
                  </div>
                  <span className="font-semibold text-gray-800">{item.name}</span>
                </div>
                <span className="text-gray-600">{item.act}</span>
                <span className="text-right text-gray-400 text-[11px]">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notifikasi (1 Kolom) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-gray-800 text-sm">Notifikasi</h4>
            <span className="text-xs text-[#1C4D8D] font-semibold">4 Baru</span>
          </div>

          <div className="space-y-3">
            {[
              { title: '15 tugas baru menunggu ditinjau', time: 'Baru saja', bg: 'bg-blue-50 text-blue-600' },
              { title: '3 guru belum mengisi nilai UAS', time: '30 menit lalu', bg: 'bg-red-50 text-red-500' },
              { title: '12 siswa baru terdaftar hari ini', time: '1 jam lalu', bg: 'bg-emerald-50 text-emerald-600' },
              { title: 'Jadwal UAS akan dimulai besok', time: '2 jam lalu', bg: 'bg-amber-50 text-amber-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                <div className={`p-2 rounded-lg ${item.bg}`}>
                  <Bell size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 leading-snug">{item.title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}