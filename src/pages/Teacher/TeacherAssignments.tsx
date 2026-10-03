import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Trash2, Edit, X, Eye } from 'lucide-react';
import FileDropzone from '../../components/FileDropzone';
import { responseRecordId, uploadAttachments } from '../../lib/attachments';

interface MyClass {
  class_subject_id: number;
  class_name: string;
  subject_name: string;
}

interface AssignmentItem {
  ID?: number;
  id?: number;
  Title?: string;
  Description?: string;
  DueDate?: string;
  MaxScore?: number;
  ClassSubject?: { Class?: { Name?: string }; Subject?: { Name?: string }; ID?: number };
  class_subject_id?: number;
}

interface SubmissionItem {
  ID?: number;
  id?: number;
  AssignmentID?: number;
  Student?: { User?: { Name?: string } };
  SubmissionText?: string;
  FileURL?: string;
  Score?: number | null;
  Feedback?: string;
  Status?: string;
}

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
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
    due_date: '',
    max_score: 100
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);

  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState<AssignmentItem | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [gradeInputs, setGradeInputs] = useState<Record<number, { score: string; feedback: string }>>({});

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const fetchAssignments = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/assignments', { headers: headers() });
      setAssignments(res.data.data || res.data || []);
    } catch (err) {
      setAssignments([]);
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
    fetchAssignments();
    fetchMyClasses();
  }, []);

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setCurrentId(null);
    setErrorMsg('');
    setAttachmentFiles([]);
    setFormData({ class_subject_id: '', title: '', description: '', due_date: '', max_score: 100 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (a: AssignmentItem) => {
    setIsEditMode(true);
    setErrorMsg('');
    setAttachmentFiles([]);
    setCurrentId(a.ID || a.id!);
    setFormData({
      class_subject_id: String(a.class_subject_id || a.ClassSubject?.ID || ''),
      title: a.Title || '',
      description: a.Description || '',
      due_date: a.DueDate ? a.DueDate.slice(0, 10) : '',
      max_score: a.MaxScore || 100
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
        due_date: new Date(formData.due_date).toISOString(),
        max_score: Number(formData.max_score)
      };

      let assignmentId = currentId;
      if (isEditMode) await axios.put(`http://localhost:8080/api/assignments/${currentId}`, payload, { headers: headers() });
      else assignmentId = responseRecordId(await axios.post('http://localhost:8080/api/assignments', payload, { headers: headers() }));
      if (assignmentId) await uploadAttachments('assignments', assignmentId, attachmentFiles, headers());

      setIsModalOpen(false);
      fetchAssignments();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Gagal menyimpan tugas.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Hapus tugas ini? Semua pengumpulan terkait juga akan hilang.')) return;
    try {
      await axios.delete(`http://localhost:8080/api/assignments/${id}`, { headers: headers() });
      fetchAssignments();
    } catch (err) {
      alert('Gagal menghapus tugas.');
    }
  };

  const handleOpenGrading = async (a: AssignmentItem) => {
    setActiveAssignment(a);
    setIsGradeModalOpen(true);
    try {
      const res = await axios.get('http://localhost:8080/api/submissions', { headers: headers() });
      const all: SubmissionItem[] = res.data.data || res.data || [];
      const aid = a.ID || a.id;
      const filteredSubs = all.filter(s => s.AssignmentID === aid);
      setSubmissions(filteredSubs);

      const initial: Record<number, { score: string; feedback: string }> = {};
      filteredSubs.forEach(s => {
        const sid = s.ID || s.id!;
        initial[sid] = {
          score: s.Score !== null && s.Score !== undefined ? String(s.Score) : '',
          feedback: s.Feedback || ''
        };
      });
      setGradeInputs(initial);
    } catch (err) {
      setSubmissions([]);
    }
  };

  const handleSaveGrade = async (submissionId: number) => {
    const input = gradeInputs[submissionId];
    if (!input || input.score === '') {
      alert('Nilai wajib diisi.');
      return;
    }
    try {
      await axios.put(`http://localhost:8080/api/submissions/${submissionId}/grade`, {
        score: Number(input.score),
        feedback: input.feedback
      }, { headers: headers() });
      alert('Nilai berhasil disimpan.');
      if (activeAssignment) handleOpenGrading(activeAssignment);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Gagal menyimpan nilai.');
    }
  };

  const filtered = assignments.filter(a => (a.Title || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Tugas & Penilaian</h3>
          <p className="text-xs text-gray-400 mt-0.5">Kelola tugas dan nilai pengumpulan siswa untuk kelas yang Anda ampu.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          disabled={myClasses.length === 0}
          className="bg-[#1C4D8D] hover:bg-[#1C4D8D]/90 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition shadow-sm disabled:opacity-50"
        >
          <Plus size={18} /> Tambah Tugas
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
              placeholder="Cari judul tugas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1C4D8D]"
            />
          </div>
          <span className="text-xs text-gray-400 font-medium">Total: {filtered.length} Tugas</span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-6 whitespace-nowrap">No</th>
                <th className="py-3 px-6 whitespace-nowrap">Judul</th>
                <th className="py-3 px-6 whitespace-nowrap">Kelas</th>
                <th className="py-3 px-6 whitespace-nowrap">Mapel</th>
                <th className="py-3 px-6 whitespace-nowrap">Batas Waktu</th>
                <th className="py-3 px-6 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Memuat data tugas...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Belum ada tugas.</td></tr>
              ) : (
                filtered.map((a, index) => {
                  const className = a.ClassSubject?.Class?.Name || '-';
                  const subjectName = a.ClassSubject?.Subject?.Name || '-';
                  const due = a.DueDate ? a.DueDate.slice(0, 10) : '-';
                  const rowKey = a.ID || a.id || index;
                  return (
                    <tr key={rowKey} className="hover:bg-gray-50/50 transition">
                      <td className="py-3.5 px-6 font-medium text-gray-400 whitespace-nowrap">{index + 1}</td>
                      <td className="py-3.5 px-6 font-bold text-gray-800 whitespace-nowrap">{a.Title}</td>
                      <td className="py-3.5 px-6 text-gray-500 whitespace-nowrap">{className}</td>
                      <td className="py-3.5 px-6 font-medium text-[#1C4D8D] whitespace-nowrap">{subjectName}</td>
                      <td className="py-3.5 px-6 text-gray-500 whitespace-nowrap">{due}</td>
                      <td className="py-3.5 px-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleOpenGrading(a)} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition" title="Lihat & Nilai">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => handleOpenEdit(a)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition" title="Edit">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDelete(a.ID || a.id!)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition" title="Hapus">
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
                {isEditMode ? 'Edit Tugas' : 'Tambah Tugas Baru'}
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
                <label className="block text-xs font-semibold text-gray-600 mb-1">Judul Tugas</label>
                <input
                  type="text" required value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Latihan Membuat Form Login"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Deskripsi</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Instruksi pengerjaan tugas..."
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Batas Waktu</label>
                  <input
                    type="date" required value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nilai Maksimal</label>
                  <input
                    type="number" min={1} value={formData.max_score}
                    onChange={(e) => setFormData({ ...formData, max_score: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D]"
                  />
                </div>
              </div>

              <FileDropzone files={attachmentFiles} onChange={setAttachmentFiles} label="Lampiran tugas" resourceType="assignments" resourceId={isEditMode ? currentId : null} />

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 transition">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#1C4D8D] text-white hover:bg-[#1C4D8D]/90 transition shadow-sm">
                  {isEditMode ? 'Simpan Perubahan' : 'Tambah Tugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isGradeModalOpen && activeAssignment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <div>
                <h4 className="font-bold text-gray-800 text-base">Pengumpulan Tugas</h4>
                <p className="text-xs text-gray-400 mt-0.5">{activeAssignment.Title}</p>
              </div>
              <button onClick={() => setIsGradeModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {submissions.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">Belum ada siswa yang mengumpulkan tugas ini.</p>
              ) : (
                submissions.map((s) => {
                  const sid = s.ID || s.id!;
                  const studentName = s.Student?.User?.Name || 'Tanpa Nama';
                  const input = gradeInputs[sid] || { score: '', feedback: '' };
                  return (
                    <div key={sid} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-gray-800 text-xs">{studentName}</p>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${s.Status === 'GRADED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {s.Status === 'GRADED' ? 'Sudah Dinilai' : 'Menunggu Nilai'}
                        </span>
                      </div>
                      {s.SubmissionText && <p className="text-xs text-gray-600">{s.SubmissionText}</p>}
                      {s.FileURL && (
                        <a href={s.FileURL} target="_blank" rel="noreferrer" className="text-xs text-[#1C4D8D] underline break-all">
                          {s.FileURL}
                        </a>
                      )}
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <input
                          type="number"
                          placeholder="Nilai"
                          value={input.score}
                          onChange={(e) => setGradeInputs({ ...gradeInputs, [sid]: { ...input, score: e.target.value } })}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1C4D8D]"
                        />
                        <input
                          type="text"
                          placeholder="Feedback (opsional)"
                          value={input.feedback}
                          onChange={(e) => setGradeInputs({ ...gradeInputs, [sid]: { ...input, feedback: e.target.value } })}
                          className="col-span-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1C4D8D]"
                        />
                        <button
                          onClick={() => handleSaveGrade(sid)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1C4D8D] text-white hover:bg-[#1C4D8D]/90 transition"
                        >
                          Simpan Nilai
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
