import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, GraduationCap, BookOpen, FileText, Award, Bell, Clock } from 'lucide-react';

export default function DashboardHome() {
  const [stats, setStats] = useState({
    teachers: 0,
    students: 0,
    subjects: 0,
    assignments: 0,
    exams: 0
  });
  const [loading, setLoading] = useState(true);

  // Mengambil data statistik real-time dari backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Mengambil data secara paralel untuk performa lebih cepat
        const [teachersRes, studentsRes, subjectsRes] = await Promise.all([
          axios.get('http://localhost:8080/api/teachers', { headers }).catch(() => ({ data: [] })),
          axios.get('http://localhost:8080/api/students', { headers }).catch(() => ({ data: [] })),
          axios.get('http://localhost:8080/api/subjects', { headers }).catch(() => ({ data: [] })),
        ]);

        const getLen = (res: any) => {
          const d = res.data;
          if (Array.isArray(d)) return d.length;
          if (d && Array.isArray(d.data)) return d.data.length;
          return 0;
        };

        setStats({
          teachers: getLen(teachersRes),
          students: getLen(studentsRes),
          subjects: getLen(subjectsRes),
          assignments: 154, // Bisa disesuaikan dengan endpoint tugas jika sudah ada
          exams: 48         // Bisa disesuaikan dengan endpoint ujian jika sudah ada
        });
        setLoading(false);
      } catch (err) {
        console.error('Gagal memuat statistik:', err);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header sambutan */}
      <div>
        <h3 className="text-xl font-bold text-gray-800">Dashboard</h3>
        <p className="text-xs text-gray-400 mt-0.5">Selamat datang kembali, Admin. Berikut ringkasan aktivitas sekolah hari ini.</p>
      </div>

      {/* Statistik Cards (Real-time data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><GraduationCap size={22} /></div>
          <div>
            <h4 className="text-lg font-bold text-gray-800">{loading ? '...' : stats.teachers}</h4>
            <p className="text-[11px] text-gray-400 font-medium">Total Guru</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={22} /></div>
          <div>
            <h4 className="text-lg font-bold text-gray-800">{loading ? '...' : stats.students}</h4>
            <p className="text-[11px] text-gray-400 font-medium">Total Siswa</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><BookOpen size={22} /></div>
          <div>
            <h4 className="text-lg font-bold text-gray-800">{loading ? '...' : stats.subjects}</h4>
            <p className="text-[11px] text-gray-400 font-medium">Total Mata Pelajaran</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><FileText size={22} /></div>
          <div>
            <h4 className="text-lg font-bold text-gray-800">{stats.assignments}</h4>
            <p className="text-[11px] text-gray-400 font-medium">Total Tugas</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><Award size={22} /></div>
          <div>
            <h4 className="text-lg font-bold text-gray-800">{stats.exams}</h4>
            <p className="text-[11px] text-gray-400 font-medium">Total Ujian</p>
          </div>
        </div>
      </div>

      {/* Grid Bagian Bawah: Grafik & Kalender / Notifikasi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grafik Aktivitas */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-gray-800 text-sm">Grafik Aktivitas Sekolah</h4>
            <span className="text-xs text-gray-400">Semester Ganjil</span>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-xs">
            [Visualisasi Grafik Statistik Bulanan]
          </div>
        </div>

        {/* Kalender Akademik */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h4 className="font-bold text-gray-800 text-sm">Kalender Akademik</h4>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex gap-3 items-center">
              <div className="bg-blue-100 text-blue-700 font-bold px-2.5 py-1.5 rounded-lg text-center">12<br/><span className="text-[9px]">DES</span></div>
              <div>
                <p className="font-bold text-gray-800">Ujian Akhir Semester</p>
                <p className="text-gray-400 text-[10px]">08:00 - 12:00 WIB</p>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex gap-3 items-center">
              <div className="bg-purple-100 text-purple-700 font-bold px-2.5 py-1.5 rounded-lg text-center">18<br/><span className="text-[9px]">DES</span></div>
              <div>
                <p className="font-bold text-gray-800">Rapat Wali Kelas</p>
                <p className="text-gray-400 text-[10px]">13:00 WIB - Aula</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}