import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Users, Plus, Search, Trash2, Edit, X, Eye, EyeOff, Check } from 'lucide-react';
import FileDropzone from '../components/FileDropzone';
import { responseRecordId, uploadAttachments } from '../lib/attachments';

const API = 'http://localhost:8080/api';
const idOf = (item: any) => Number(item?.ID ?? item?.id ?? 0);
const nameOf = (item: any) => item?.Name ?? item?.name ?? '';

interface SchoolClass { ID?: number; id?: number; Name?: string; name?: string; }
interface Subject { ID?: number; id?: number; Name?: string; name?: string; }
interface TeachingAssignment {
  ID: number; TeacherID: number; TeacherName: string; ClassID: number;
  ClassName: string; SubjectID: number; SubjectName: string;
}

const emptyForm = { Name: '', Email: '', Password: '', NIP: '', SubjectID: '', Gender: 'Laki-laki' };

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<TeachingAssignment[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [teacherRes, classRes, subjectRes, assignmentRes] = await Promise.all([
        axios.get(`${API}/teachers`, { headers: headers() }),
        axios.get(`${API}/classes`, { headers: headers() }),
        axios.get(`${API}/subjects`, { headers: headers() }),
        axios.get(`${API}/teaching-assignments`, { headers: headers() }),
      ]);
      setTeachers(teacherRes.data.data || teacherRes.data || []);
      setClasses(classRes.data.data || classRes.data || []);
      setSubjects(subjectRes.data.data || subjectRes.data || []);
      setAssignments(assignmentRes.data.data || assignmentRes.data || []);
    } catch {
      setTeachers([]);
      setClasses([]);
      setSubjects([]);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdminData(); }, []);

  const assignmentByTeacher = useMemo(() => {
    const grouped = new Map<number, TeachingAssignment[]>();
    assignments.forEach((assignment) => {
      const teacherId = Number(assignment.TeacherID);
      grouped.set(teacherId, [...(grouped.get(teacherId) || []), assignment]);
    });
    return grouped;
  }, [assignments]);

  const handleOpenAdd = () => {
    setIsEditMode(false); setCurrentId(null); setShowPassword(false);
    setFormErrors({}); setFormData(emptyForm); setSelectedClassIds([]); setAttachmentFiles([]); setIsModalOpen(true);
  };

  const handleOpenEdit = (teacher: any) => {
    const teacherId = idOf(teacher);
    const currentAssignments = assignmentByTeacher.get(teacherId) || [];
    const teacherSubject = teacher.subject || teacher.Subject || '';
    const subjectFromAssignment = currentAssignments[0]?.SubjectID;
    const subjectFromTeacher = subjects.find((subject) => nameOf(subject).toLowerCase() === String(teacherSubject).toLowerCase());
    const subjectId = subjectFromAssignment || (subjectFromTeacher ? idOf(subjectFromTeacher) : '');
    setIsEditMode(true); setCurrentId(teacherId); setShowPassword(false); setFormErrors({});
    setFormData({
      Name: teacher.user?.Name || teacher.user?.name || teacher.Name || teacher.name || '',
      Email: teacher.user?.Email || teacher.user?.email || teacher.Email || teacher.email || '',
      Password: '', NIP: teacher.nip || teacher.NIP || '',
      SubjectID: subjectId ? String(subjectId) : '', Gender: teacher.gender || teacher.Gender || 'Laki-laki',
    });
    setAttachmentFiles([]);
    setSelectedClassIds(currentAssignments.map((assignment) => String(assignment.ClassID)));
    setIsModalOpen(true);
  };

  const handleClassToggle = (classId: string) => {
    setSelectedClassIds((selected) => selected.includes(classId)
      ? selected.filter((id) => id !== classId)
      : [...selected, classId]);
  };

  const syncTeacherAssignments = async (teacherId: number, subjectId: number) => {
    const response = await axios.get(`${API}/teaching-assignments`, { headers: headers() });
    const latestAssignments: TeachingAssignment[] = response.data.data || response.data || [];
    const existing = latestAssignments.filter((assignment) => Number(assignment.TeacherID) === teacherId);
    const selected = new Set(selectedClassIds.map(Number));
    const retained = existing.filter((assignment) => selected.has(Number(assignment.ClassID)) && Number(assignment.SubjectID) === subjectId);
    const toDelete = existing.filter((assignment) => !retained.includes(assignment));
    const retainedClassIds = new Set(retained.map((assignment) => Number(assignment.ClassID)));
    const toCreate = [...selected].filter((classId) => !retainedClassIds.has(classId));
    await Promise.all(toDelete.map((assignment) => axios.delete(`${API}/teaching-assignments/${assignment.ID}`, { headers: headers() })));
    await Promise.all(toCreate.map((classId) => axios.post(`${API}/teaching-assignments`, {
      teacher_id: teacherId, class_id: classId, subject_id: subjectId,
    }, { headers: headers() })));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); setFormErrors({});
    if (!formData.SubjectID) { setFormErrors({ Subject: 'Pilih bidang studi guru.' }); return; }
    if (selectedClassIds.length === 0) { setFormErrors({ Classes: 'Pilih minimal satu kelas untuk guru ini.' }); return; }
    setSaving(true);
    try {
      const subject = subjects.find((item) => idOf(item) === Number(formData.SubjectID));
      const payload: any = {
        name: formData.Name, email: formData.Email, nip: formData.NIP,
        subject: nameOf(subject), gender: formData.Gender,
      };
      if (formData.Password.trim()) payload.password = formData.Password;
      let teacherId = currentId;
      if (isEditMode && teacherId) {
        await axios.put(`${API}/teachers/${teacherId}`, payload, { headers: headers() });
      } else {
        const response = await axios.post(`${API}/teachers`, payload, { headers: headers() });
        teacherId = responseRecordId(response);
      }
      if (!teacherId) throw new Error('Data guru tersimpan, tetapi ID guru tidak ditemukan.');
      await syncTeacherAssignments(teacherId, Number(formData.SubjectID));
      await uploadAttachments('teachers', teacherId, attachmentFiles, headers());
      setIsModalOpen(false); await fetchAdminData();
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Gagal menyimpan data guru.';
      const lowerMessage = String(message).toLowerCase();
      const nextErrors: Record<string, string> = {};
      if (lowerMessage.includes('email')) nextErrors.Email = 'Email ini sudah terpakai atau tidak valid.';
      if (lowerMessage.includes('nip')) nextErrors.NIP = 'NIP ini sudah terdaftar.';
      if (lowerMessage.includes('password')) nextErrors.Password = 'Password minimal 6 karakter.';
      if (Object.keys(nextErrors).length === 0) nextErrors.General = message;
      setFormErrors(nextErrors);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data guru ini?')) return;
    try { await axios.delete(`${API}/teachers/${id}`, { headers: headers() }); await fetchAdminData(); }
    catch { window.alert('Gagal menghapus data guru.'); }
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const name = teacher.user?.Name || teacher.user?.name || teacher.Name || '';
    const nip = teacher.nip || teacher.NIP || '';
    return `${name} ${nip}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Manajemen Guru</h3>
          <p className="mt-0.5 text-xs text-gray-400">Kelola data, bidang studi, dan penugasan kelas setiap guru.</p>
        </div>
        <button type="button" onClick={handleOpenAdd} className="flex shrink-0 items-center gap-2 rounded-xl bg-[#1C4D8D] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#1C4D8D]/90">
          <Plus size={18} /> Tambah Guru
        </button>
      </div>

      <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 p-4">
          <div className="relative w-full max-w-sm">
            <Search size={16} className="absolute inset-y-0 left-3 my-auto text-gray-400" />
            <input type="search" placeholder="Cari nama atau NIP..." value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-xs focus:border-[#1C4D8D] focus:outline-none" />
          </div>
          <span className="shrink-0 text-xs font-medium text-gray-400">Total: {teachers.length} Guru</span>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-max border-collapse text-left">
            <thead><tr className="border-b border-gray-100 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              <th className="whitespace-nowrap px-6 py-3">No</th><th className="whitespace-nowrap px-6 py-3">Nama Lengkap</th>
              <th className="whitespace-nowrap px-6 py-3">Email</th><th className="whitespace-nowrap px-6 py-3">NIP</th>
              <th className="whitespace-nowrap px-6 py-3">Bidang Studi</th><th className="whitespace-nowrap px-6 py-3">Kelas Diampu</th>
              <th className="whitespace-nowrap px-6 py-3">Jenis Kelamin</th><th className="whitespace-nowrap px-6 py-3 text-center">Aksi</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {loading ? <tr><td colSpan={8} className="py-8 text-center text-gray-400">Memuat data guru...</td></tr>
                : filteredTeachers.length === 0 ? <tr><td colSpan={8} className="py-8 text-center text-gray-400">Tidak ada data guru ditemukan.</td></tr>
                : filteredTeachers.map((teacher, index) => {
                  const teacherId = idOf(teacher);
                  const teacherClasses = [...new Set((assignmentByTeacher.get(teacherId) || []).map((item) => item.ClassName))];
                  return <tr key={teacherId || index} className="transition hover:bg-gray-50/50">
                    <td className="whitespace-nowrap px-6 py-3.5 font-medium text-gray-400">{index + 1}</td>
                    <td className="whitespace-nowrap px-6 py-3.5 font-bold text-gray-800">{teacher.user?.Name || teacher.user?.name || teacher.Name || 'Tanpa Nama'}</td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-gray-500">{teacher.user?.Email || teacher.user?.email || teacher.Email || '-'}</td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-gray-500">{teacher.nip || teacher.NIP || '-'}</td>
                    <td className="whitespace-nowrap px-6 py-3.5 font-medium text-[#1C4D8D]">{teacher.subject || teacher.Subject || '-'}</td>
                    <td className="max-w-xs px-6 py-3.5 text-gray-500">{teacherClasses.length ? teacherClasses.join(', ') : <span className="text-gray-400">Belum ditugaskan</span>}</td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-gray-500">{teacher.gender || teacher.Gender || '-'}</td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-center"><div className="flex items-center justify-center gap-2">
                      <button type="button" onClick={() => handleOpenEdit(teacher)} className="rounded-lg bg-blue-50 p-1.5 text-blue-600 transition hover:bg-blue-100" title="Edit guru dan kelas"><Edit size={14} /></button>
                      <button type="button" onClick={() => handleDelete(teacherId)} className="rounded-lg bg-red-50 p-1.5 text-red-500 transition hover:bg-red-100" title="Hapus guru"><Trash2 size={14} /></button>
                    </div></td>
                  </tr>;
                })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
        <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div><h4 className="text-base font-bold text-gray-800">{isEditMode ? 'Edit Data Guru' : 'Tambah Guru Baru'}</h4><p className="mt-1 text-xs text-gray-400">Atur bidang studi dan pilih satu atau beberapa kelas.</p></div>
            <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="max-h-[calc(90vh-72px)] space-y-5 overflow-y-auto p-6">
            {formErrors.General && <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-center text-xs text-red-600">{formErrors.General}</div>}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block text-xs font-semibold text-gray-600">Nama Lengkap
                <input required value={formData.Name} onChange={(event) => setFormData({ ...formData, Name: event.target.value })} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs font-normal focus:border-[#1C4D8D] focus:outline-none" placeholder="Nama guru" />
              </label>
              <label className="block text-xs font-semibold text-gray-600">Email Login
                <input type="email" required value={formData.Email} onChange={(event) => setFormData({ ...formData, Email: event.target.value })} className={`mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-xs font-normal focus:border-[#1C4D8D] focus:outline-none ${formErrors.Email ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} placeholder="guru@sekolah.com" />
                {formErrors.Email && <span className="mt-1 block text-[11px] text-red-500">{formErrors.Email}</span>}
              </label>
              <label className="block text-xs font-semibold text-gray-600">Password {isEditMode && <span className="font-normal text-gray-400">(opsional)</span>}
                <span className="relative mt-1.5 block"><input type={showPassword ? 'text' : 'password'} required={!isEditMode} value={formData.Password} onChange={(event) => setFormData({ ...formData, Password: event.target.value })} className={`w-full rounded-xl border px-3.5 py-2.5 pr-10 text-xs font-normal focus:border-[#1C4D8D] focus:outline-none ${formErrors.Password ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} placeholder="Minimal 6 karakter" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 text-gray-400 hover:text-gray-600" aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                </span>{formErrors.Password && <span className="mt-1 block text-[11px] text-red-500">{formErrors.Password}</span>}
              </label>
              <label className="block text-xs font-semibold text-gray-600">NIP
                <input required value={formData.NIP} onChange={(event) => setFormData({ ...formData, NIP: event.target.value })} className={`mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-xs font-normal focus:border-[#1C4D8D] focus:outline-none ${formErrors.NIP ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} placeholder="Nomor induk pegawai" />
                {formErrors.NIP && <span className="mt-1 block text-[11px] text-red-500">{formErrors.NIP}</span>}
              </label>
              <label className="block text-xs font-semibold text-gray-600">Bidang Studi / Keahlian
                <select required value={formData.SubjectID} onChange={(event) => setFormData({ ...formData, SubjectID: event.target.value })} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-normal focus:border-[#1C4D8D] focus:outline-none">
                  <option value="">-- Pilih bidang studi --</option>{subjects.map((subject) => <option key={idOf(subject)} value={idOf(subject)}>{nameOf(subject)}</option>)}
                </select>{formErrors.Subject && <span className="mt-1 block text-[11px] text-red-500">{formErrors.Subject}</span>}
              </label>
              <label className="block text-xs font-semibold text-gray-600">Jenis Kelamin
                <select value={formData.Gender} onChange={(event) => setFormData({ ...formData, Gender: event.target.value })} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-normal focus:border-[#1C4D8D] focus:outline-none"><option value="Laki-laki">Laki-laki</option><option value="Perempuan">Perempuan</option></select>
              </label>
            </div>

            <section>
              <div className="mb-2 flex items-center justify-between gap-3"><div><h5 className="text-xs font-bold text-gray-700">Kelas yang Diampu</h5><p className="mt-0.5 text-[11px] text-gray-400">Pilih beberapa kelas. Bidang studi di atas akan dipakai untuk semua kelas terpilih.</p></div><span className="shrink-0 rounded-full bg-[#EAF1FA] px-2.5 py-1 text-[11px] font-semibold text-[#1C4D8D]">{selectedClassIds.length} dipilih</span></div>
              {formErrors.Classes && <p className="mb-2 text-[11px] text-red-500">{formErrors.Classes}</p>}
              <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-3 sm:grid-cols-2">
                {classes.length === 0 ? <p className="col-span-full py-4 text-center text-xs text-gray-400">Belum ada data kelas. Tambahkan kelas terlebih dahulu.</p> : classes.map((schoolClass) => {
                  const classId = String(idOf(schoolClass)); const checked = selectedClassIds.includes(classId);
                  return <label key={classId} className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-xs transition ${checked ? 'border-[#1C4D8D] bg-white text-[#0F294A]' : 'border-transparent bg-white/60 text-gray-600 hover:border-gray-200 hover:bg-white'}`}>
                    <input type="checkbox" checked={checked} onChange={() => handleClassToggle(classId)} className="sr-only" />
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${checked ? 'border-[#1C4D8D] bg-[#1C4D8D] text-white' : 'border-gray-300 bg-white'}`}>{checked && <Check size={12} />}</span>{nameOf(schoolClass)}
                  </label>;
                })}
              </div>
            </section>

            <FileDropzone files={attachmentFiles} onChange={setAttachmentFiles} label="Lampiran data guru" resourceType="teachers" resourceId={isEditMode ? currentId : null} />
            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-500 transition hover:bg-gray-100">Batal</button>
              <button type="submit" disabled={saving || classes.length === 0 || subjects.length === 0} className="flex items-center gap-2 rounded-xl bg-[#1C4D8D] px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1C4D8D]/90 disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Menyimpan...' : <><Users size={14} />{isEditMode ? 'Simpan Perubahan' : 'Tambah Guru'}</>}</button>
            </div>
          </form>
        </div>
      </div>}
    </div>
  );
}
