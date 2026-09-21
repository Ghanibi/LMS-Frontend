import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Home, Plus, Search, Trash2, Edit, X } from 'lucide-react';

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // State Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    education_level_id: 1,
    grade: 10,
    major: '',
    class_number: 1,
    is_plus: false
  });

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const resData = response.data;
      if (Array.isArray(resData)) {
        setClasses(resData);
      } else if (resData && Array.isArray(resData.data)) {
        setClasses(resData.data);
      } else {
        setClasses([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Gagal mengambil data kelas:', err);
      setClasses([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData({
      name: '',
      education_level_id: 1,
      grade: 10,
      major: 'DKV',
      class_number: 1,
      is_plus: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls) => {
    setIsEditMode(true);
    setCurrentId(cls.ID || cls.id);
    setFormData({
      name: cls.Name || cls.name || '',
      education_level_id: cls.EducationLevelID || cls.education_level_id || 1,
      grade: cls.Grade || cls.grade || 10,
      major: cls.Major || cls.major || '',
      class_number: cls.ClassNumber || cls.class_number || 1,
      is_plus: cls.IsPlus !== undefined ? cls.IsPlus : (cls.is_plus || false)
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Generate otomatis nama kelas jika kosong berdasarkan inputan
      const generatedName = formData.name || `${formData.grade} ${formData.major} ${formData.is_plus ? 'PLUS' : formData.class_number}`;

      const payload = {
        name: generatedName,
        education_level_id: Number(formData.education_level_id),
        grade: Number(formData.grade),
        major: formData.major,
        class_number: Number(formData.class_number),
        is_plus: Boolean(formData.is_plus)
      };

      if (isEditMode) {
        await axios.put(`http://localhost:8080/api/classes/${currentId}`, payload, { headers });
      } else {
        await axios.post('http://localhost:8080/api/classes', payload, { headers });
      }

      setIsModalOpen(false);
      fetchClasses();
    } catch (err) {
      console.error('Gagal menyimpan data kelas:', err);
      const errMsg = err.response?.data?.error || 'Terjadi kesalahan saat menyimpan kelas.';
      alert(errMsg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kelas ini?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/classes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchClasses();
    } catch (err) {
      console.error('Gagal menghapus kelas:', err);
      alert('Gagal menghapus data kelas.');
    }
  };

  const filteredClasses = classes.filter(cls => {
    const name = cls.Name || cls.name || '';
    const major = cls.Major || cls.major || '';
    return name.toLowerCase().includes(search.toLowerCase()) || major.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Manajemen Kelas</h3>
          <p className="text-xs text-gray-400 mt-0.5">Kelola tingkat, jurusan, dan kelompok kelas sekolah.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-[#1C4D8D] hover:bg-[#1C4D8D]/90 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition shadow-sm"
        >
          <Plus size={18} /> Tambah Kelas
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
              placeholder="Cari nama kelas atau jurusan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1C4D8D]"
            />
          </div>
          <span className="text-xs text-gray-400 font-medium">Total: {filteredClasses.length} Kelas</span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-6 whitespace-nowrap">No</th>
                <th className="py-3 px-6 whitespace-nowrap">Nama Kelas</th>
                <th className="py-3 px-6 whitespace-nowrap">Tingkat (Grade)</th>
                <th className="py-3 px-6 whitespace-nowrap">Jurusan</th>
                <th className="py-3 px-6 whitespace-nowrap">Status Kelas</th>
                <th className="py-3 px-6 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400">Memuat data kelas...</td>
                </tr>
              ) : filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400">Tidak ada data kelas ditemukan.</td>
                </tr>
              ) : (
                filteredClasses.map((cls, index) => {
                  const className = cls.Name || cls.name || '-';
                  const classGrade = cls.Grade || cls.grade || '-';
                  const classMajor = cls.Major || cls.major || '-';
                  const isPlus = cls.IsPlus !== undefined ? cls.IsPlus : cls.is_plus;

                  return (
                    <tr key={cls.ID || cls.id || index} className="hover:bg-gray-50/50 transition">
                      <td className="py-3.5 px-6 font-medium text-gray-400 whitespace-nowrap">{index + 1}</td>
                      <td className="py-3.5 px-6 font-bold text-gray-800 whitespace-nowrap">{className}</td>
                      <td className="py-3.5 px-6 text-gray-500 whitespace-nowrap">Kelas {classGrade}</td>
                      <td className="py-3.5 px-6 text-gray-500 whitespace-nowrap">{classMajor}</td>
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        {isPlus ? (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-600 font-semibold rounded-md text-[10px]">PLUS</span>
                        ) : (
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-600 font-semibold rounded-md text-[10px]">REGULER</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleOpenEdit(cls)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition" 
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(cls.ID || cls.id)}
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

      {/* Modal Tambah / Edit Kelas */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h4 className="font-bold text-gray-800 text-base">
                {isEditMode ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Kelas (Opsional/Auto)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: 10 DKV PLUS (Boleh dikosongkan)"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tingkat Kelas</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D] bg-white"
                  >
                    <option value={10}>10</option>
                    <option value={11}>11</option>
                    <option value={12}>12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Jurusan</label>
                  <input
                    type="text"
                    required
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    placeholder="Contoh: DKV / PPLG"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nomor / Urutan Kelas</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.class_number}
                    onChange={(e) => setFormData({ ...formData, class_number: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Jenis Kelas</label>
                  <div className="flex items-center h-9 gap-3">
                    <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_plus}
                        onChange={(e) => setFormData({ ...formData, is_plus: e.target.checked })}
                        className="rounded border-gray-300 text-[#1C4D8D] focus:ring-[#1C4D8D]"
                      />
                      <span>Kelas Plus</span>
                    </label>
                  </div>
                </div>
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
                  {isEditMode ? 'Simpan Perubahan' : 'Tambah Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}