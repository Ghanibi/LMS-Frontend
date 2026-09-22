import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, Search, Trash2, Edit, X, Eye, EyeOff } from 'lucide-react';

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    Name: '', Email: '', Password: '', NIS: '', Gender: 'Laki-laki', ClassID: ''
  });
  
  // State error per field
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data.data || response.data || []);
      setLoading(false);
    } catch (err) {
      setStudents([]);
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClassesList(response.data.data || response.data || []);
    } catch (err) {}
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const handleOpenAdd = () => {
    fetchClasses();
    setIsEditMode(false);
    setShowPassword(false);
    setFormErrors({});
    setFormData({ Name: '', Email: '', Password: '', NIS: '', Gender: 'Laki-laki', ClassID: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: any) => {
    fetchClasses();
    setIsEditMode(true);
    setShowPassword(false);
    setFormErrors({});
    setCurrentId(student.id || student.ID);
    
    setFormData({ 
      Name: student.user?.Name || student.Name || '', 
      Email: student.user?.Email || student.Email || '',
      Password: '',
      NIS: student.nisn || student.nis || student.NIS || '',
      Gender: student.gender || student.Gender || 'Laki-laki',
      ClassID: student.class_id || student.ClassID ? String(student.class_id || student.ClassID) : ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const payload: any = {
        name: formData.Name,
        email: formData.Email || `${formData.NIS}@school.com`,
        nis: formData.NIS,
        nisn: formData.NIS,
        gender: formData.Gender,
        class_id: Number(formData.ClassID)
      };

      if (formData.Password && formData.Password.trim() !== '') {
        payload.password = formData.Password;
      }

      if (isEditMode) {
        await axios.put(`http://localhost:8080/api/students/${currentId}`, payload, { headers });
      } else {
        await axios.post('http://localhost:8080/api/students', payload, { headers });
      }

      setIsModalOpen(false);
      fetchStudents();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Gagal menyimpan data.';
      const lowerErr = errMsg.toLowerCase();
      const newErrors: Record<string, string> = {};

      if (lowerErr.includes('email')) {
        newErrors.Email = '(Email ini sudah terpakai)';
      } else if (lowerErr.includes('nis') || lowerErr.includes('nisn')) {
        newErrors.NIS = '(NISN ini sudah terdaftar)';
      } else {
        newErrors.General = errMsg;
      }
      
      setFormErrors(newErrors);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStudents();
    } catch (err) {}
  };

  const filteredStudents = students.filter(s => {
    const name = s.user?.Name || s.Name || '';
    const nisn = s.nisn || s.nis || s.NIS || '';
    return name.toLowerCase().includes(search.toLowerCase()) || nisn.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Manajemen Siswa</h3>
          <p className="text-xs text-gray-400 mt-0.5">Kelola data seluruh siswa terdaftar di sekolah (TypeScript).</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-[#1C4D8D] hover:bg-[#1C4D8D]/90 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition shadow-sm"
        >
          <Plus size={18} /> Tambah Siswa
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
              placeholder="Cari nama atau NISN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1C4D8D]"
            />
          </div>
          <span className="text-xs text-gray-400 font-medium">Total: {students.length} Siswa</span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-6 whitespace-nowrap">No</th>
                <th className="py-3 px-6 whitespace-nowrap">Nama Lengkap</th>
                <th className="py-3 px-6 whitespace-nowrap">Email</th>
                <th className="py-3 px-6 whitespace-nowrap">NISN</th>
                <th className="py-3 px-6 whitespace-nowrap">Kelas</th>
                <th className="py-3 px-6 whitespace-nowrap">Jenis Kelamin</th>
                <th className="py-3 px-6 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">Memuat data siswa...</td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">Tidak ada data siswa ditemukan.</td></tr>
              ) : (
                filteredStudents.map((student, index) => {
                  const studentName = student.user?.Name || student.Name || 'Tanpa Nama';
                  const studentEmail = student.user?.Email || student.Email || '-';
                  const studentNisn = student.nisn || student.nis || student.NIS || '-';
                  const studentClass = student.class?.Name || student.Class?.Name || 'Belum ada kelas';
                  const studentGender = student.gender || student.Gender || '-';
                  const rowKey = student.id || student.ID || index;

                  return (
                    <tr key={rowKey} className="hover:bg-gray-50/50 transition">
                      <td className="py-3.5 px-6 font-medium text-gray-400 whitespace-nowrap">{index + 1}</td>
                      <td className="py-3.5 px-6 font-bold text-gray-800 whitespace-nowrap">{studentName}</td>
                      <td className="py-3.5 px-6 text-gray-500 whitespace-nowrap">{studentEmail}</td>
                      <td className="py-3.5 px-6 text-gray-500 whitespace-nowrap">{studentNisn}</td>
                      <td className="py-3.5 px-6 font-medium text-[#1C4D8D] whitespace-nowrap">{studentClass}</td>
                      <td className="py-3.5 px-6 text-gray-500 whitespace-nowrap">{studentGender}</td>
                      <td className="py-3.5 px-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleOpenEdit(student)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition" title="Edit">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDelete(student.id || student.ID)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition" title="Hapus">
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
                {isEditMode ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {formErrors.General && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium text-center">
                  {formErrors.General}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Lengkap</label>
                <input
                  type="text" required value={formData.Name}
                  onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Email / Username Login
                  {formErrors.Email && <span className="text-red-500 font-medium ml-1">{formErrors.Email}</span>}
                </label>
                <input
                  type="email" required value={formData.Email}
                  onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                  className={`w-full px-3.5 py-2 border rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D] ${formErrors.Email ? 'border-red-400 bg-red-50/30' : 'border-gray-200'}`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Password {isEditMode && <span className="text-gray-400 font-normal ml-1">(Kosongkan jika tidak diubah)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required={!isEditMode} value={formData.Password}
                    onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
                    className="w-full px-3.5 py-2 pr-10 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D]"
                  />
                  <button
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  NISN
                  {formErrors.NIS && <span className="text-red-500 font-medium ml-1">{formErrors.NIS}</span>}
                </label>
                <input
                  type="text" required value={formData.NIS}
                  onChange={(e) => setFormData({ ...formData, NIS: e.target.value })}
                  className={`w-full px-3.5 py-2 border rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D] ${formErrors.NIS ? 'border-red-400 bg-red-50/30' : 'border-gray-200'}`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Kelas</label>
                <select
                  required value={formData.ClassID}
                  onChange={(e) => setFormData({ ...formData, ClassID: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D] bg-white"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {classesList.map((cls) => (
                    <option key={cls.id || cls.ID} value={cls.id || cls.ID}>
                      {cls.Name || cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Jenis Kelamin</label>
                <select
                  value={formData.Gender}
                  onChange={(e) => setFormData({ ...formData, Gender: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D] bg-white"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 transition">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#1C4D8D] text-white hover:bg-[#1C4D8D]/90 transition shadow-sm">
                  {isEditMode ? 'Simpan Perubahan' : 'Tambah Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}