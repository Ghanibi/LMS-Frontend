import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Plus, Search, Trash2, Edit, X } from 'lucide-react';

interface Announcement {
  id?: number;
  ID?: number;
  title?: string;
  Title?: string;
  content?: string;
  Content?: string;
  target_role?: string;
  TargetRole?: string;
}

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_role: 'Semua'
  });

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/announcements', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const resData = response.data;
      if (Array.isArray(resData)) {
        setAnnouncements(resData);
      } else if (resData && Array.isArray(resData.data)) {
        setAnnouncements(resData.data);
      } else {
        setAnnouncements([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Gagal mengambil data pengumuman:', err);
      setAnnouncements([
        { id: 1, title: 'Pembagian Rapor Semester', content: 'Pembagian rapor akan dilaksanakan pada akhir bulan.', target_role: 'Semua' }
      ]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData({ title: '', content: '', target_role: 'Semua' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Announcement) => {
    setIsEditMode(true);
    setCurrentId(item.ID !== undefined ? item.ID : item.id!);
    setFormData({
      title: item.Title || item.title || '',
      content: item.Content || item.content || '',
      target_role: item.TargetRole || item.target_role || 'Semua'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        title: formData.title,
        Title: formData.title,
        content: formData.content,
        Content: formData.content,
        target_role: formData.target_role,
        TargetRole: formData.target_role
      };

      if (isEditMode) {
        await axios.put(`http://localhost:8080/api/announcements/${currentId}`, payload, { headers });
      } else {
        await axios.post('http://localhost:8080/api/announcements', payload, { headers });
      }

      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (err: any) {
      console.error('Gagal menyimpan pengumuman:', err);
      const errMsg = err.response?.data?.error || 'Terjadi kesalahan saat menyimpan pengumuman.';
      alert(errMsg);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAnnouncements();
    } catch (err) {
      console.error('Gagal menghapus pengumuman:', err);
      alert('Gagal menghapus data pengumuman.');
    }
  };

  const filteredAnnouncements = announcements.filter(item => {
    const title = item.Title || item.title || '';
    const content = item.Content || item.content || '';
    return title.toLowerCase().includes(search.toLowerCase()) || content.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Pengumuman Sekolah</h3>
          <p className="text-xs text-gray-400 mt-0.5">Kelola informasi dan pengumuman untuk siswa maupun guru (TypeScript).</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-[#1C4D8D] hover:bg-[#1C4D8D]/90 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition shadow-sm"
        >
          <Plus size={18} /> Buat Pengumuman
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Cari judul atau isi pengumuman..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1C4D8D]"
            />
          </div>
          <span className="text-xs text-gray-400 font-medium">Total: {filteredAnnouncements.length} Pengumuman</span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-6 whitespace-nowrap">No</th>
                <th className="py-3 px-6 whitespace-nowrap">Judul Pengumuman</th>
                <th className="py-3 px-6 whitespace-nowrap">Target Sasaran</th>
                <th className="py-3 px-6 min-w-[280px]">Isi Pengumuman</th>
                <th className="py-3 px-6 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">Memuat data pengumuman...</td>
                </tr>
              ) : filteredAnnouncements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">Tidak ada pengumuman ditemukan.</td>
                </tr>
              ) : (
                filteredAnnouncements.map((item, index) => {
                  const title = item.Title || item.title || '-';
                  const target = item.TargetRole || item.target_role || 'Semua';
                  const content = item.Content || item.content || '-';
                  const rowKey = item.ID !== undefined ? item.ID : (item.id || index);

                  return (
                    <tr key={rowKey} className="hover:bg-gray-50/50 transition">
                      <td className="py-3.5 px-6 font-medium text-gray-400 whitespace-nowrap">{index + 1}</td>
                      <td className="py-3.5 px-6 font-bold text-gray-800 whitespace-nowrap">{title}</td>
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 font-semibold rounded-md text-[10px]">
                          {target}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-gray-600 break-words">{content}</td>
                      <td className="py-3.5 px-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition" 
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.ID !== undefined ? item.ID : item.id!)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition" 
                            title="Hapus"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h4 className="font-bold text-gray-800 text-base">
                {isEditMode ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Judul Pengumuman</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Libur Nasional..."
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Target Sasaran</label>
                <select
                  value={formData.target_role}
                  onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D] bg-white"
                >
                  <option value="Semua">Semua (Siswa & Guru)</option>
                  <option value="Siswa">Siswa</option>
                  <option value="Guru">Guru</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Isi Pengumuman</label>
                <textarea
                  rows={4}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Tulis isi pengumuman lengkap di sini..."
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#1C4D8D] text-white hover:bg-[#1C4D8D]/90 transition shadow-sm"
                >
                  {isEditMode ? 'Simpan Perubahan' : 'Kirim Pengumuman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}