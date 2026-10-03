import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Trash2, Edit, X } from 'lucide-react';
import FileDropzone from '../../components/FileDropzone';
import { responseRecordId, uploadAttachments } from '../../lib/attachments';

interface MyClass {
  class_subject_id: number;
  class_name: string;
  subject_name: string;
}

interface MaterialItem {
  ID?: number;
  id?: number;
  Title?: string;
  title?: string;
  Description?: string;
  description?: string;
  FileURL?: string;
  file_url?: string;
  ClassSubject?: { Class?: { Name?: string }; Subject?: { Name?: string }; ID?: number };
  class_subject_id?: number;
}

export default function TeacherMaterials() {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [myClasses, setMyClasses] = useState<MyClass[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    class_subject_id: '',
    title: '',
    description: '',
    file_url: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const fetchMaterials = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/materials', { headers: headers() });
      setMaterials(res.data.data || res.data || []);
    } catch (err) {
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyClasses = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/teacher/me/classes', { headers: headers() });
      setMyClasses(res.data.data || res.data || []);
    } catch (err) {
      setMyClasses([]);
    }
  };

  useEffect(() => {
    fetchMaterials();
    fetchMyClasses();
  }, []);

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setCurrentId(null);
    setErrorMsg('');
    setAttachmentFiles([]);
    setFormData({ class_subject_id: '', title: '', description: '', file_url: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: MaterialItem) => {
    setIsEditMode(true);
    setErrorMsg('');
    setAttachmentFiles([]);
    setCurrentId(m.ID || m.id!);
    setFormData({
      class_subject_id: String(m.class_subject_id || m.ClassSubject?.ID || ''),
      title: m.Title || m.title || '',
      description: m.Description || m.description || '',
      file_url: m.FileURL || m.file_url || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const payload = {
        class_subject_id: Number(formData.class_subject_id),
        title: formData.title,
        description: formData.description,
        file_url: formData.file_url
      };

      let materialId = currentId;
      if (isEditMode) await axios.put(`http://localhost:8080/api/materials/${currentId}`, payload, { headers: headers() });
      else materialId = responseRecordId(await axios.post('http://localhost:8080/api/materials', payload, { headers: headers() }));
      if (materialId) await uploadAttachments('materials', materialId, attachmentFiles, headers());

      setIsModalOpen(false);
      fetchMaterials();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Gagal menyimpan materi.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Hapus materi ini?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/materials/${id}`, { headers: headers() });
      fetchMaterials();
    } catch (err) {
      alert('Gagal menghapus materi.');
    }
  };

  const filtered = materials.filter(m => {
    const title = m.Title || m.title || '';
    return title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Materi Ajar</h3>
          <p className="text-xs text-gray-400 mt-0.5">Kelola materi untuk kelas yang Anda ampu.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          disabled={myClasses.length === 0}
          className="bg-[#1C4D8D] hover:bg-[#1C4D8D]/90 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition shadow-sm disabled:opacity-50"
        >
          <Plus size={18} /> Tambah Materi
        </button>
      </div>

      {myClasses.length === 0 && !loading && (
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-xs">
          Anda belum ditugaskan mengajar kelas & mata pelajaran manapun. Hubungi Admin untuk penugasan.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Cari judul materi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1C4D8D]"
            />
          </div>
          <span className="text-xs text-gray-400 font-medium">Total: {filtered.length} Materi</span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-6 whitespace-nowrap">No</th>
                <th className="py-3 px-6 whitespace-nowrap">Judul</th>
                <th className="py-3 px-6 whitespace-nowrap">Kelas</th>
                <th className="py-3 px-6 whitespace-nowrap">Mapel</th>
                <th className="py-3 px-6 min-w-[220px]">Deskripsi</th>
                <th className="py-3 px-6 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Memuat data materi...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Belum ada materi.</td></tr>
              ) : (
                filtered.map((m, index) => {
                  const title = m.Title || m.title || '-';
                  const desc = m.Description || m.description || '-';
                  const className = m.ClassSubject?.Class?.Name || '-';
                  const subjectName = m.ClassSubject?.Subject?.Name || '-';
                  const rowKey = m.ID || m.id || index;
                  return (
                    <tr key={rowKey} className="hover:bg-gray-50/50 transition">
                      <td className="py-3.5 px-6 font-medium text-gray-400 whitespace-nowrap">{index + 1}</td>
                      <td className="py-3.5 px-6 font-bold text-gray-800 whitespace-nowrap">{title}</td>
                      <td className="py-3.5 px-6 text-gray-500 whitespace-nowrap">{className}</td>
                      <td className="py-3.5 px-6 font-medium text-[#1C4D8D] whitespace-nowrap">{subjectName}</td>
                      <td className="py-3.5 px-6 text-gray-600 break-words">{desc}</td>
                      <td className="py-3.5 px-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleOpenEdit(m)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition" title="Edit">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDelete(m.ID || m.id!)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition" title="Hapus">
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
                {isEditMode ? 'Edit Materi' : 'Tambah Materi Baru'}
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium text-center">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Kelas & Mata Pelajaran</label>
                <select
                  required
                  value={formData.class_subject_id}
                  onChange={(e) => setFormData({ ...formData, class_subject_id: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D] bg-white"
                >
                  <option value="">-- Pilih Kelas & Mapel --</option>
                  {myClasses.map((mc) => (
                    <option key={mc.class_subject_id} value={mc.class_subject_id}>
                      {mc.class_name} - {mc.subject_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Judul Materi</label>
                <input
                  type="text" required value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Pengenalan HTML & CSS"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Deskripsi</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ringkasan materi..."
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Link File (opsional)</label>
                <input
                  type="text" value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D]"
                />
              </div>

              <FileDropzone files={attachmentFiles} onChange={setAttachmentFiles} label="Lampiran materi" resourceType="materials" resourceId={isEditMode ? currentId : null} />

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 transition">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#1C4D8D] text-white hover:bg-[#1C4D8D]/90 transition shadow-sm">
                  {isEditMode ? 'Simpan Perubahan' : 'Tambah Materi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
