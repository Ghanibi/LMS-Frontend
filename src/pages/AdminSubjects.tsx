import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Plus, Search, Trash2, Edit, X } from 'lucide-react';

interface Subject {
  id?: string | number;
  ID?: number;
  name?: string;
  Name?: string;
  code?: string;
  Code?: string;
  description?: string;
  Description?: string;
  deskripsi?: string;
}

const mapelListDefault: string[] = [
  "Matematika",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "Pendidikan Agama",
  "PPKn",
  "Sejarah Indonesia",
  "Pendidikan Jasmani, Olahraga, dan Kesehatan",
  "Seni Budaya",
  "IPAS",
  "Projek Kreatif dan Kewirausahaan",
  "Bimbingan Konseling",
  "Pemrograman Web",
  "Basis Data",
  "Pemrograman Berorientasi Objek",
  "Desain Grafis",
  "Jaringan Komputer",
  "Administrasi Sistem Jaringan",
  "Marketing Digital",
  "Manajemen Perkantoran",
];

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });

  const fetchSubjects = async () => {
    try {
      const savedSubjects = localStorage.getItem('school_subjects_list');
      if (savedSubjects) {
        setSubjects(JSON.parse(savedSubjects));
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/subjects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const resData = response.data;
      let dbData: Subject[] = [];
      if (Array.isArray(resData)) {
        dbData = resData;
      } else if (resData && Array.isArray(resData.data)) {
        dbData = resData.data;
      }

      const formattedDefault: Subject[] = mapelListDefault.map((m, idx) => ({
        id: `default-${idx + 1}`,
        name: m,
        code: `MP-${101 + idx}`,
        description: 'Mata pelajaran wajib dan kejuruan sekolah'
      }));

      const combined = [...dbData, ...formattedDefault.filter(def => !dbData.some(db => (db.Name || db.name)?.toLowerCase() === def.name?.toLowerCase()))];
      
      setSubjects(combined);
      localStorage.setItem('school_subjects_list', JSON.stringify(combined));
      setLoading(false);
    } catch (err) {
      console.error('Gagal mengambil data dari API, menggunakan list default:', err);
      const savedSubjects = localStorage.getItem('school_subjects_list');
      if (savedSubjects) {
        setSubjects(JSON.parse(savedSubjects));
      } else {
        const defaultData: Subject[] = mapelListDefault.map((m, idx) => ({
          id: `default-${idx + 1}`,
          name: m,
          code: `MP-${101 + idx}`,
          description: 'Mata pelajaran wajib dan kejuruan sekolah'
        }));
        setSubjects(defaultData);
        localStorage.setItem('school_subjects_list', JSON.stringify(defaultData));
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData({ name: '', code: '', description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setIsEditMode(true);
    const targetId = subject.ID !== undefined ? subject.ID : subject.id!;
    setCurrentId(targetId);
    
    setFormData({
      name: subject.Name || subject.name || '',
      code: subject.Code || subject.code || '',
      description: subject.Description || subject.description || subject.deskripsi || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        name: formData.name,
        Name: formData.name,
        code: formData.code,
        Code: formData.code,
        description: formData.description,
        Description: formData.description
      };

      if (isEditMode) {
        const updatedSubjects = subjects.map(s => {
          const sId = s.ID !== undefined ? s.ID : s.id;
          if (sId === currentId) {
            return { ...s, name: formData.name, Name: formData.name, code: formData.code, Code: formData.code, description: formData.description, Description: formData.description };
          }
          return s;
        });
        setSubjects(updatedSubjects);
        localStorage.setItem('school_subjects_list', JSON.stringify(updatedSubjects));

        if (typeof currentId === 'number' || (typeof currentId === 'string' && !currentId.startsWith('default-'))) {
          await axios.put(`http://localhost:8080/api/subjects/${currentId}`, payload, { headers }).catch(() => {});
        }
      } else {
        const newSub: Subject = {
          id: `custom-${Date.now()}`,
          ID: Date.now(),
          name: formData.name,
          Name: formData.name,
          code: formData.code,
          Code: formData.code,
          description: formData.description,
          Description: formData.description
        };
        const updatedSubjects = [newSub, ...subjects];
        setSubjects(updatedSubjects);
        localStorage.setItem('school_subjects_list', JSON.stringify(updatedSubjects));

        await axios.post('http://localhost:8080/api/subjects', payload, { headers }).catch(() => {});
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Gagal menyimpan data mata pelajaran:', err);
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini?')) return;
    try {
      const token = localStorage.getItem('token');
      const updatedSubjects = subjects.filter(s => (s.ID !== undefined ? s.ID : s.id) !== id);
      setSubjects(updatedSubjects);
      localStorage.setItem('school_subjects_list', JSON.stringify(updatedSubjects));

      if (typeof id === 'number' || (typeof id === 'string' && !id.startsWith('default-'))) {
        await axios.delete(`http://localhost:8080/api/subjects/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Gagal menghapus dari server:', err);
    }
  };

  const filteredSubjects = subjects.filter(s => {
    const name = s.Name || s.name || '';
    const code = s.Code || s.code || '';
    return name.toLowerCase().includes(search.toLowerCase()) || code.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Daftar Mata Pelajaran</h3>
          <p className="text-xs text-gray-400 mt-0.5">Kelola kurikulum dan daftar mata pelajaran sekolah (TypeScript).</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-[#1C4D8D] hover:bg-[#1C4D8D]/90 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition shadow-sm"
        >
          <Plus size={18} /> Tambah Mata Pelajaran
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
              placeholder="Cari mata pelajaran atau kode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1C4D8D]"
            />
          </div>
          <span className="text-xs text-gray-400 font-medium">Total: {filteredSubjects.length} Mapel</span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-6 whitespace-nowrap">No</th>
                <th className="py-3 px-6 whitespace-nowrap">Nama Mata Pelajaran</th>
                <th className="py-3 px-6 whitespace-nowrap">Kode Mapel</th>
                <th className="py-3 px-6 min-w-[280px]">Deskripsi</th>
                <th className="py-3 px-6 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">Memuat data mata pelajaran...</td>
                </tr>
              ) : filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">Tidak ada data mata pelajaran ditemukan.</td>
                </tr>
              ) : (
                filteredSubjects.map((sub, index) => {
                  const subName = sub.Name || sub.name || '-';
                  const subCode = sub.Code || sub.code || '-';
                  const subDesc = sub.Description || sub.description || sub.deskripsi || '-';
                  const rowKey = sub.ID !== undefined ? sub.ID : (sub.id || index);

                  return (
                    <tr key={rowKey} className="hover:bg-gray-50/50 transition">
                      <td className="py-3.5 px-6 font-medium text-gray-400 whitespace-nowrap">{index + 1}</td>
                      <td className="py-3.5 px-6 font-bold text-gray-800 whitespace-nowrap">{subName}</td>
                      <td className="py-3.5 px-6 text-gray-500 whitespace-nowrap">{subCode}</td>
                      <td className="py-3.5 px-6 text-gray-600 break-words">{subDesc}</td>
                      <td className="py-3.5 px-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleOpenEdit(sub)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition" 
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(sub.ID !== undefined ? sub.ID : sub.id!)}
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
                {isEditMode ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Mata Pelajaran</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Pemrograman Web"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Kode Mapel</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Contoh: WEB-101"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Deskripsi</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Keterangan singkat mata pelajaran..."
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
                  {isEditMode ? 'Simpan Perubahan' : 'Tambah Mapel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}