import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, Search, Trash2, Edit, X, Eye, EyeOff } from 'lucide-react';

const mapelList = [
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

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // State untuk Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ Name: '', Email: '', Password: '', NIP: '', Subject: '', Gender: 'Laki-laki' });

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/teachers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const responseData = response.data;
      if (Array.isArray(responseData)) {
        setTeachers(responseData);
      } else if (responseData && Array.isArray(responseData.data)) {
        setTeachers(responseData.data);
      } else {
        setTeachers([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Gagal mengambil data guru:', err);
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
    setFormData({ Name: '', Email: '', Password: '', NIP: '', Subject: '', Gender: 'Laki-laki' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (teacher) => {
    setIsEditMode(true);
    setShowPassword(false);
    setCurrentId(teacher.ID || teacher.id);
    
    setFormData({ 
      Name: teacher.Name || teacher.name || teacher.FullName || teacher.User?.Name || teacher.user?.Name || teacher.user?.name || '', 
      Email: teacher.Email || teacher.email || teacher.User?.Email || teacher.user?.Email || teacher.user?.email || '',
      Password: '',
      NIP: teacher.NIP || teacher.nip || '',
      Subject: teacher.Subject || teacher.subject || teacher.BidangStudi || teacher.bidang_studi || '', 
      Gender: teacher.Gender || teacher.gender || teacher.JenisKelamin || teacher.jenis_kelamin || 'Laki-laki'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        name: formData.Name,
        Name: formData.Name,
        email: formData.Email || `${formData.NIP || 'guru'}@sekolah.com`,
        Email: formData.Email || `${formData.NIP || 'guru'}@sekolah.com`,
        password: formData.Password,
        Password: formData.Password,
        nip: formData.NIP,
        NIP: formData.NIP,
        subject: formData.Subject,
        Subject: formData.Subject,
        gender: formData.Gender,
        Gender: formData.Gender
      };

      if (isEditMode) {
        await axios.put(`http://localhost:8080/api/teachers/${currentId}`, payload, { headers });
      } else {
        await axios.post('http://localhost:8080/api/teachers', payload, { headers });
      }

      setIsModalOpen(false);
      fetchTeachers();
    } catch (err) {
      console.error('Gagal menyimpan data guru:', err);
      const errMsg = err.response?.data?.error || 'Terjadi kesalahan saat menyimpan data.';
      alert(errMsg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data guru ini?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/teachers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTeachers();
    } catch (err) {
      console.error('Gagal menghapus data guru:', err);
      alert('Gagal menghapus data.');
    }
  };

  const filteredTeachers = Array.isArray(teachers) ? teachers.filter(t => {
    const name = t.Name || t.name || t.FullName || t.User?.Name || t.user?.Name || t.user?.name || '';
    const nip = t.NIP || t.nip || '';
    return name.toLowerCase().includes(search.toLowerCase()) || nip.toLowerCase().includes(search.toLowerCase());
  }) : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Manajemen Guru</h3>
          <p className="text-xs text-gray-400 mt-0.5">Kelola data seluruh guru pengajar di sekolah.</p>
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
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-400">Memuat data guru...</td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-400">Tidak ada data guru ditemukan.</td>
                </tr>
              ) : (
                filteredTeachers.map((teacher, index) => {
                  const teacherName = teacher.Name || teacher.name || teacher.User?.Name || teacher.user?.Name || teacher.user?.name || 'Tanpa Nama';
                  const teacherEmail = teacher.Email || teacher.email || teacher.User?.Email || teacher.user?.email || teacher.user?.Email || '-';
                  const teacherNip = teacher.NIP || teacher.nip || '-';
                  const teacherSubject = teacher.Subject || teacher.subject || teacher.BidangStudi || teacher.bidang_studi || '-';
                  const teacherGender = teacher.Gender || teacher.gender || teacher.JenisKelamin || teacher.jenis_kelamin || '-';

                  return (
                    <tr key={teacher.ID || teacher.id || index} className="hover:bg-gray-50/50 transition">
                      <td className="py-3.5 px-6 font-medium text-gray-400 whitespace-nowrap">{index + 1}</td>
                      <td className="py-3.5 px-6 font-bold text-gray-800 whitespace-nowrap">
                        {teacherName}
                      </td>
                      <td className="py-3.5 px-6 text-gray-500 whitespace-nowrap">{teacherEmail}</td>
                      <td className="py-3.5 px-6 text-gray-500 whitespace-nowrap">{teacherNip}</td>
                      <td className="py-3.5 px-6 font-medium text-[#1C4D8D] whitespace-nowrap">
                        {teacherSubject}
                      </td>
                      <td className="py-3.5 px-6 text-gray-500 whitespace-nowrap">{teacherGender}</td>
                      <td className="py-3.5 px-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleOpenEdit(teacher)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition" 
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(teacher.ID || teacher.id)}
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
                {isEditMode ? 'Edit Data Guru' : 'Tambah Guru Baru'}
              </h4>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.Name}
                  onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                  placeholder="Masukkan nama lengkap guru"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email / Username Login</label>
                <input
                  type="email"
                  required
                  value={formData.Email}
                  onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                  placeholder="Contoh: guru@sekolah.com"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Password Baru
                  {isEditMode && <span className="text-gray-400 font-normal ml-1">(Kosongkan jika tidak diubah)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required={!isEditMode}
                    value={formData.Password}
                    onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
                    placeholder={isEditMode ? "Ketik password baru untuk mengubah" : "Masukkan password login"}
                    className="w-full px-3.5 py-2 pr-10 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">NIP (Nomor Induk Pegawai)</label>
                <input
                  type="text"
                  required
                  value={formData.NIP}
                  onChange={(e) => setFormData({ ...formData, NIP: e.target.value })}
                  placeholder="Masukkan NIP"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Bidang Studi / Mengajar</label>
                <select
                  required
                  value={formData.Subject}
                  onChange={(e) => setFormData({ ...formData, Subject: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D] bg-white"
                >
                  <option value="">-- Pilih Mata Pelajaran --</option>
                  {mapelList.map((mapel, index) => (
                    <option key={index} value={mapel}>
                      {mapel}
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