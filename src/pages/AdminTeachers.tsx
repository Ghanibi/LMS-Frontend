import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, Search, Trash2, Edit, X, Eye, EyeOff } from 'lucide-react';

const mapelList: string[] = [
  "Matematika", "Bahasa Indonesia", "Bahasa Inggris", "Pendidikan Agama", "PPKn",
  "Sejarah Indonesia", "Pendidikan Jasmani, Olahraga, dan Kesehatan", "Seni Budaya",
  "IPAS", "Projek Kreatif dan Kewirausahaan", "Bimbingan Konseling", "Pemrograman Web",
  "Basis Data", "Pemrograman Berorientasi Objek", "Desain Grafis", "Jaringan Komputer",
  "Administrasi Sistem Jaringan", "Marketing Digital", "Manajemen Perkantoran",
];

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    Name: '', Email: '', Password: '', NIP: '', Subject: '', Gender: 'Laki-laki'
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/teachers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeachers(response.data.data || response.data || []);
      setLoading(false);
    } catch (err) {
      setTeachers([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setShowPassword(false);
    setFormErrors({});
    setFormData({ Name: '', Email: '', Password: '', NIP: '', Subject: '', Gender: 'Laki-laki' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (teacher: any) => {
    setIsEditMode(true);
    setShowPassword(false);
    setFormErrors({});
    setCurrentId(teacher.id || teacher.ID);
    
    setFormData({ 
      Name: teacher.user?.Name || teacher.Name || '', 
      Email: teacher.user?.Email || teacher.Email || '',
      Password: '',
      NIP: teacher.nip || teacher.NIP || '',
      Subject: teacher.subject || teacher.Subject || '', 
      Gender: teacher.gender || teacher.Gender || 'Laki-laki'
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
        email: formData.Email || `${formData.NIP || 'guru'}@sekolah.com`,
        nip: formData.NIP,
        subject: formData.Subject,
        gender: formData.Gender
      };

      if (formData.Password && formData.Password.trim() !== '') {
        payload.password = formData.Password;
      }

      if (isEditMode) {
        await axios.put(`http://localhost:8080/api/teachers/${currentId}`, payload, { headers });
      } else {
        await axios.post('http://localhost:8080/api/teachers', payload, { headers });
      }

      setIsModalOpen(false);
      fetchTeachers();
    } catch (err: any) {
      console.error("DETAIL ERROR DARI BACKEND:", err.response?.data);
      
      const responseMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      const rawErr = typeof responseMsg === 'object' ? JSON.stringify(responseMsg) : String(responseMsg);
      const lowerErr = rawErr.toLowerCase();
      
      const newErrors: Record<string, string> = {};

      if (lowerErr.includes('email') || lowerErr.includes('unique') || lowerErr.includes('duplicate')) {
        newErrors.Email = 'Email ini sudah terpakai!';
      } 
      
      if (lowerErr.includes('nip') || lowerErr.includes('duplicate')) {
        newErrors.NIP = 'NIP ini sudah terdaftar!';
      } 
      
      if (lowerErr.includes('password') || lowerErr.includes('min')) {
        newErrors.Password = 'Password minimal 6 karakter!';
      }

      if (Object.keys(newErrors).length === 0) {
        newErrors.General = rawErr;
      }
      
      setFormErrors(newErrors);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data guru ini?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/teachers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTeachers();
    } catch (err) {}
  };

  const filteredTeachers = teachers.filter(t => {
    const name = t.user?.Name || t.Name || '';
    const nip = t.nip || t.NIP || '';
    return name.toLowerCase().includes(search.toLowerCase()) || nip.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Manajemen Guru</h3>
          <p className="text-xs text-gray-400 mt-0.5">Kelola data seluruh guru pengajar di sekolah (TypeScript).</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-[#1C4D8D] hover:bg-[#1C4D8D]/90 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition shadow-sm"
        >
          <Plus size={18} /> Tambah Guru
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
              placeholder="Cari nama atau NIP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1C4D8D]"
            />
          </div>
          <span className="text-xs text-gray-400 font-medium">Total: {teachers.length} Guru</span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-6 whitespace-nowrap">No</th>
                <th className="py-3 px-6 whitespace-nowrap">Nama Lengkap</th>
                <th className="py-3 px-6 whitespace-nowrap">Email</th>
                <th className="py-3 px-6 whitespace-nowrap">NIP</th>
                <th className="py-3 px-6 whitespace-nowrap">Bidang Studi</th>
                <th className="py-3 px-6 whitespace-nowrap">Jenis Kelamin</th>
                <th className="py-3 px-6 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">Memuat data guru...</td></tr>
              ) : filteredTeachers.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">Tidak ada data guru ditemukan.</td></tr>
              ) : (
                filteredTeachers.map((teacher, index) => {
                  const teacherName = teacher.user?.Name || teacher.Name || 'Tanpa Nama';
                  const teacherEmail = teacher.user?.Email || teacher.Email || '-';
                  const teacherNip = teacher.nip || teacher.NIP || '-';
                  const teacherSubject = teacher.subject || teacher.Subject || '-';
                  const teacherGender = teacher.gender || teacher.Gender || '-';
                  const rowKey = teacher.id || teacher.ID || index;

                  return (
                    <tr key={rowKey} className="hover:bg-gray-50/50 transition">
                      <td className="py-3.5 px-6 font-medium text-gray-400 whitespace-nowrap">{index + 1}</td>
                      <td className="py-3.5 px-6 font-bold text-gray-800 whitespace-nowrap">{teacherName}</td>
                      <td className="py-3.5 px-6 text-gray-500 whitespace-nowrap">{teacherEmail}</td>
                      <td className="py-3.5 px-6 text-gray-500 whitespace-nowrap">{teacherNip}</td>
                      <td className="py-3.5 px-6 font-medium text-[#1C4D8D] whitespace-nowrap">{teacherSubject}</td>
                      <td className="py-3.5 px-6 text-gray-500 whitespace-nowrap">{teacherGender}</td>
                      <td className="py-3.5 px-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleOpenEdit(teacher)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition" title="Edit">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDelete(teacher.id || teacher.ID)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition" title="Hapus">
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
                {isEditMode ? 'Edit Data Guru' : 'Tambah Guru Baru'}
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {formErrors.General && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium text-center">
                  ⚠️ {formErrors.General}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Lengkap</label>
                <input
                  type="text" required value={formData.Name}
                  onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                  placeholder="Masukkan nama lengkap guru"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-gray-600">Email / Username Login</label>
                  {formErrors.Email && <span className="text-red-500 text-[11px] font-bold">⚠️ {formErrors.Email}</span>}
                </div>
                <input
                  type="email" required value={formData.Email}
                  onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                  placeholder="Contoh: guru@sekolah.com"
                  className={`w-full px-3.5 py-2 border rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D] ${formErrors.Email ? 'border-red-500 bg-red-50/40 text-red-900' : 'border-gray-200'}`}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-gray-600">
                    Password {isEditMode && <span className="text-gray-400 font-normal">(Opsional)</span>}
                  </label>
                  {formErrors.Password && <span className="text-red-500 text-[11px] font-bold">⚠️ {formErrors.Password}</span>}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required={!isEditMode} value={formData.Password}
                    onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className={`w-full px-3.5 py-2 pr-10 border rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D] ${formErrors.Password ? 'border-red-500 bg-red-50/40' : 'border-gray-200'}`}
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
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-gray-600">NIP (Nomor Induk Pegawai)</label>
                  {formErrors.NIP && <span className="text-red-500 text-[11px] font-bold">⚠️ {formErrors.NIP}</span>}
                </div>
                <input
                  type="text" required value={formData.NIP}
                  onChange={(e) => setFormData({ ...formData, NIP: e.target.value })}
                  placeholder="Masukkan NIP"
                  className={`w-full px-3.5 py-2 border rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D] ${formErrors.NIP ? 'border-red-500 bg-red-50/40 text-red-900' : 'border-gray-200'}`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Bidang Studi / Mengajar</label>
                <select
                  required value={formData.Subject}
                  onChange={(e) => setFormData({ ...formData, Subject: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D] bg-white"
                >
                  <option value="">-- Pilih Mata Pelajaran --</option>
                  {mapelList.map((mapel, index) => (
                    <option key={index} value={mapel}>{mapel}</option>
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
                  {isEditMode ? 'Simpan Perubahan' : 'Tambah Guru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}