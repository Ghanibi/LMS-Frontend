import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layers, BookOpen, ClipboardList, AlertCircle } from 'lucide-react';

export default function TeacherDashboard() {
  const [stats, setStats] = useState({ classes: 0, materials: 0, assignments: 0, ungraded: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        const [classesRes, materialsRes, assignmentsRes, submissionsRes] = await Promise.all([
          axios.get('http://localhost:8080/api/teacher/me/classes', { headers }).catch(() => ({ data: [] })),
          axios.get('http://localhost:8080/api/materials', { headers }).catch(() => ({ data: [] })),
          axios.get('http://localhost:8080/api/assignments', { headers }).catch(() => ({ data: [] })),
          axios.get('http://localhost:8080/api/submissions', { headers }).catch(() => ({ data: [] })),
        ]);

        const getLen = (res: any) => {
          const d = res.data;
          if (Array.isArray(d)) return d.length;
          if (d && Array.isArray(d.data)) return d.data.length;
          return 0;
        };

        const submissions = submissionsRes.data.data || submissionsRes.data || [];
        const ungraded = Array.isArray(submissions) ? submissions.filter((s: any) => s.Status !== 'GRADED').length : 0;

        setStats({
          classes: getLen(classesRes),
          materials: getLen(materialsRes),
          assignments: getLen(assignmentsRes),
          ungraded
        });
      } catch (err) {
        console.error('Gagal memuat statistik guru:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-800">Dashboard Guru</h3>
        <p className="text-xs text-gray-400 mt-0.5">Ringkasan aktivitas mengajar Anda.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#EAF1FA] text-[#1C4D8D]"><Layers size={22} /></div>
          <div>
            <h4 className="text-lg font-bold text-gray-800">{loading ? '...' : stats.classes}</h4>
            <p className="text-[11px] text-gray-400 font-medium">Kelas Diampu</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#EAF1FA] text-[#1C4D8D]"><BookOpen size={22} /></div>
          <div>
            <h4 className="text-lg font-bold text-gray-800">{loading ? '...' : stats.materials}</h4>
            <p className="text-[11px] text-gray-400 font-medium">Materi Diunggah</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#EAF1FA] text-[#1C4D8D]"><ClipboardList size={22} /></div>
          <div>
            <h4 className="text-lg font-bold text-gray-800">{loading ? '...' : stats.assignments}</h4>
            <p className="text-[11px] text-gray-400 font-medium">Tugas Dibuat</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#EAF1FA] text-[#1C4D8D]"><AlertCircle size={22} /></div>
          <div>
            <h4 className="text-lg font-bold text-gray-800">{loading ? '...' : stats.ungraded}</h4>
            <p className="text-[11px] text-gray-400 font-medium">Menunggu Dinilai</p>
          </div>
        </div>
      </div>
    </div>
  );
}
