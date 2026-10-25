import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Home, Plus, Search, Trash2, Edit, X, CalendarDays, GripVertical, Save, Loader2 } from 'lucide-react';
import FileDropzone from '../components/FileDropzone';
import { responseRecordId, uploadAttachments } from '../lib/attachments';

interface SchoolClass {
  id?: number;
  ID?: number;
  name?: string;
  Name?: string;
  education_level_id?: number;
  EducationLevelID?: number;
  grade?: number;
  Grade?: number;
  major?: string;
  Major?: string;
  class_number?: number;
  ClassNumber?: number;
  is_plus?: boolean;
  IsPlus?: boolean;
  homeroom_teacher_id?: number;
  HomeroomTeacherID?: number;
  HomeroomTeacher?: { User?: { Name?: string } };
  homeroom_teacher?: { User?: { Name?: string }; user?: { Name?: string }; };
}

// SMP: kelas 7-9, SMA/SMK: kelas 10-12
const getGradeOptions = (levelName: string): number[] => {
  if (levelName === 'SMP') return [7, 8, 9];
  return [10, 11, 12];
};

export default function AdminClasses() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    education_level_id: 0, // 0 = belum dipilih
    grade: 10,
    major: '',
    class_number: 1,
    is_plus: false,
    homeroom_teacher_id: ''
  });
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [scheduleClass, setScheduleClass] = useState<SchoolClass | null>(null);

  // Jenjang yang sedang dipilih di form
  const selectedLevel = levels.find(l => (l.ID || l.id) === formData.education_level_id);
  const selectedLevelName = String(selectedLevel?.Name || selectedLevel?.name || '').toUpperCase();
  const isSMK = selectedLevelName === 'SMK';
  const gradeOptions = getGradeOptions(selectedLevelName);

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

  const fetchLevels = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/education-levels', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = response.data;
      if (Array.isArray(resData)) {
        setLevels(resData);
      } else if (resData && Array.isArray(resData.data)) {
        setLevels(resData.data);
      } else {
        setLevels([]);
      }
    } catch (err) {
      console.error('Gagal mengambil data jenjang pendidikan:', err);
      setLevels([]);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/teachers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTeachers(response.data.data || response.data || []);
    } catch {
      setTeachers([]);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchLevels();
    fetchTeachers();
  }, []);

  const handleLevelChange = (levelId: number) => {
    const lvl = levels.find(l => (l.ID || l.id) === levelId);
    const lvlName = String(lvl?.Name || lvl?.name || '').toUpperCase();
    const options = getGradeOptions(lvlName);

    setFormData(prev => ({
      ...prev,
      education_level_id: levelId,
      grade: options.includes(prev.grade) ? prev.grade : options[0],
      major: lvlName === 'SMK' ? (prev.major || 'DKV') : ''
    }));
  };

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setCurrentId(null);
    setAttachmentFiles([]);
    setFormData({
      name: '',
      education_level_id: 0,
      grade: 10,
      major: '',
      class_number: 1,
      is_plus: false,
      homeroom_teacher_id: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls: SchoolClass) => {
    setIsEditMode(true);
    setCurrentId(cls.ID !== undefined ? cls.ID : cls.id!);
    setAttachmentFiles([]);
    setFormData({
      name: cls.Name || cls.name || '',
      education_level_id: cls.EducationLevelID || cls.education_level_id || 0,
      grade: cls.Grade || cls.grade || 10,
      major: cls.Major || cls.major || '',
      class_number: cls.ClassNumber || cls.class_number || 1,
      is_plus: cls.IsPlus !== undefined ? cls.IsPlus : (cls.is_plus || false),
      homeroom_teacher_id: String(cls.HomeroomTeacherID || cls.homeroom_teacher_id || '')
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // SMK: "10 DKV 1" / "10 DKV PLUS"  |  SMP & SMA: "7-1", "10-2", dst
      const autoName = isSMK
        ? `${formData.grade} ${formData.major} ${formData.is_plus ? 'PLUS' : formData.class_number}`
        : `${formData.grade}-${formData.class_number}`;
      const generatedName = formData.name || autoName;

      const payload = {
        name: generatedName,
        Name: generatedName,
        education_level_id: Number(formData.education_level_id),
        grade: Number(formData.grade),
        Grade: Number(formData.grade),
        major: formData.major,
        Major: formData.major,
        class_number: Number(formData.class_number),
        ClassNumber: Number(formData.class_number),
        is_plus: Boolean(formData.is_plus),
        IsPlus: Boolean(formData.is_plus),
        homeroom_teacher_id: formData.homeroom_teacher_id ? Number(formData.homeroom_teacher_id) : null
      };

      let classId = currentId;
      if (isEditMode) await axios.put(`http://localhost:8080/api/classes/${currentId}`, payload, { headers });
      else classId = responseRecordId(await axios.post('http://localhost:8080/api/classes', payload, { headers }));
      if (classId) await uploadAttachments('classes', classId, attachmentFiles, headers);

      setIsModalOpen(false);
      fetchClasses();
    } catch (err: any) {
      console.error('Gagal menyimpan data kelas:', err);
      const errMsg = err.response?.data?.error || 'Terjadi kesalahan saat menyimpan kelas.';
      alert(errMsg);
    }
  };

  const handleDelete = async (id: number) => {
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Manajemen Kelas</h3>
          <p className="text-xs text-gray-400 mt-0.5">Kelola tingkat, jurusan, dan kelompok kelas sekolah (TypeScript).</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-[#1C4D8D] hover:bg-[#1C4D8D]/90 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition shadow-sm"
        >
          <Plus size={18} /> Tambah Kelas
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-xs">
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
                <th className="py-3 px-6 whitespace-nowrap">Wali Kelas</th>
                <th className="py-3 px-6 whitespace-nowrap">Status Kelas</th>
                <th className="py-3 px-6 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">Memuat data kelas...</td>
                </tr>
              ) : filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">Tidak ada data kelas ditemukan.</td>
                </tr>
              ) : (
                filteredClasses.map((cls, index) => {
                  const className = cls.Name || cls.name || '-';
                  const classGrade = cls.Grade || cls.grade || '-';
                  const classMajor = cls.Major || cls.major || '-';
                  const isPlus = cls.IsPlus !== undefined ? cls.IsPlus : cls.is_plus;
                  const rowKey = cls.ID !== undefined ? cls.ID : (cls.id || index);

                  return (
                    <tr key={rowKey} className="hover:bg-gray-50/50 transition">
                      <td className="py-3.5 px-6 font-medium text-gray-400 whitespace-nowrap">{index + 1}</td>
                      <td className="py-3.5 px-6 font-bold text-gray-800 whitespace-nowrap">{className}</td>
                      <td className="py-3.5 px-6 text-gray-500 whitespace-nowrap">Kelas {classGrade}</td>
                      <td className="py-3.5 px-6 text-gray-500 whitespace-nowrap">{classMajor}</td>
                      <td className="py-3.5 px-6 whitespace-nowrap text-gray-600">
                        {cls.HomeroomTeacher?.User?.Name || cls.homeroom_teacher?.User?.Name || cls.homeroom_teacher?.user?.Name || 'Belum ditentukan'}
                      </td>
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
                            onClick={() => setScheduleClass(cls)}
                            className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
                            title="Atur jadwal pelajaran"
                          >
                            <CalendarDays size={14} />
                          </button>
                          <button 
                            onClick={() => handleOpenEdit(cls)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition" 
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(cls.ID !== undefined ? cls.ID : cls.id!)}
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
                  placeholder={isSMK || !selectedLevelName
                    ? 'Contoh: 10 DKV PLUS (Boleh dikosongkan)'
                    : `Contoh: ${formData.grade}-1 (Boleh dikosongkan)`}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Jenjang Pendidikan</label>
                <select
                  required
                  value={formData.education_level_id || ''}
                  onChange={(e) => handleLevelChange(Number(e.target.value))}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D] bg-white"
                >
                  <option value="">-- Pilih Jenjang --</option>
                  {levels.map((lvl) => (
                    <option key={lvl.ID || lvl.id} value={lvl.ID || lvl.id}>
                      {lvl.Name || lvl.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tingkat Kelas</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D] bg-white"
                  >
                    {gradeOptions.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Jurusan {!isSMK && <span className="text-gray-400 font-normal">(Opsional)</span>}
                  </label>
                  <input
                    type="text"
                    required={isSMK}
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    placeholder="Contoh: DKV / PPLG"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nomor / Urutan Kelas</label>
                  <input
                    type="number"
                    min={1}
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

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Wali Kelas</label>
                <select
                  value={formData.homeroom_teacher_id}
                  onChange={(e) => setFormData({ ...formData, homeroom_teacher_id: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs focus:border-[#1C4D8D] focus:outline-none"
                >
                  <option value="">-- Belum ditentukan --</option>
                  {teachers.map((teacher) => (
                    (() => {
                      const teacherId = Number(teacher.ID || teacher.id);
                      const assignedClass = classes.find((item) =>
                        Number(item.HomeroomTeacherID || item.homeroom_teacher_id) === teacherId &&
                        Number(item.ID || item.id) !== currentId
                      );
                      return <option key={teacherId} value={teacherId} disabled={Boolean(assignedClass)}>
                      {teacher.User?.Name || teacher.user?.Name || teacher.Name || teacher.name || 'Guru'}
                        {assignedClass ? ` — sudah menjadi wali ${assignedClass.Name || assignedClass.name}` : ''}
                      </option>;
                    })()
                  ))}
                </select>
                <p className="mt-1 text-[10px] text-gray-400">Guru wali kelas dapat mengelola pengumuman dan diskusi kelas.</p>
              </div>

              <FileDropzone files={attachmentFiles} onChange={setAttachmentFiles} label="Lampiran data kelas" resourceType="classes" resourceId={isEditMode ? currentId : null} />

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
      {scheduleClass && <ClassScheduleEditor schoolClass={scheduleClass} onClose={() => setScheduleClass(null)} />}
    </div>
  );
}

const DAYS = [
  { key: 'MONDAY', label: 'Senin' }, { key: 'TUESDAY', label: 'Selasa' },
  { key: 'WEDNESDAY', label: 'Rabu' }, { key: 'THURSDAY', label: 'Kamis' }, { key: 'FRIDAY', label: 'Jumat' },
];
const SLOTS = [
  ['06:30','07:10'], ['07:10','07:50'], ['07:50','08:30'], ['08:30','09:10'],
  ['09:40','10:15'], ['10:15','10:50'], ['10:50','11:25'], ['11:25','12:00'],
  ['12:40','13:20'], ['13:20','14:00'], ['14:00','14:40'],
];

function ClassScheduleEditor({ schoolClass, onClose }: { schoolClass: SchoolClass; onClose: () => void }) {
  const classId = Number(schoolClass.ID || schoolClass.id);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [draggedSubject, setDraggedSubject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const nameOf = (item: any) => item.Name || item.name || '';
  const idOf = (item: any) => Number(item.ID || item.id);

  React.useEffect(() => {
    Promise.all([
      axios.get('http://localhost:8080/api/subjects', { headers }),
      axios.get('http://localhost:8080/api/teachers', { headers }),
      axios.get(`http://localhost:8080/api/classes/${classId}/schedule`, { headers }),
    ]).then(([subjectRes, teacherRes, scheduleRes]) => {
      setSubjects(subjectRes.data.data || subjectRes.data || []);
      setTeachers(teacherRes.data.data || teacherRes.data || []);
      setEntries(scheduleRes.data.data || []);
    }).catch((err: any) => setError(err.response?.data?.error || 'Data jadwal gagal dimuat.'))
      .finally(() => setLoading(false));
  }, [classId]);

  const slot = (day: string, period: number) => entries.find((item) => item.day === day && Number(item.period) === period);
  const placeSubject = (day: string, period: number, subject: any) => {
    const current = slot(day, period);
    const start = day === 'FRIDAY' ? [['06:30','07:15'],['07:15','08:00'],['08:00','08:45'],['09:15','10:00'],['10:00','10:45'],['10:45','11:30']][period-1] : SLOTS[period-1];
    if (!start) return;
    const end = day === 'FRIDAY' ? [['06:30','07:15'],['07:15','08:00'],['08:00','08:45'],['09:15','10:00'],['10:00','10:45'],['10:45','11:30']][period-1] : SLOTS[period-1];
    setEntries((prev) => [...prev.filter((item) => !(item.day === day && Number(item.period) === period)), {
      day, period, start_time: start[0], end_time: end[1], subject_id: idOf(subject), subject,
      teacher_id: current?.teacher_id || null, teacher: current?.teacher || null,
        teacher_code: current?.teacher_code || current?.TeacherCode || 0,
        teacher_name: current?.teacher_name || current?.TeacherName || '',
        teacher_field: current?.teacher_field || current?.TeacherField || '',
        subject_suggestion: '', needs_review: false,
    }]);
  };
  const save = async () => {
    setSaving(true); setError('');
    try {
      const response = await axios.put(`http://localhost:8080/api/classes/${classId}/schedule`, entries.map((item) => ({
        day: item.day, period: item.period, start_time: item.start_time, end_time: item.end_time,
        subject_id: Number(item.subject_id || item.SubjectID || 0), teacher_id: item.teacher_id ? Number(item.teacher_id) : null,
        teacher_code: Number(item.teacher_code || item.TeacherCode || 0), teacher_name: item.teacher_name || item.TeacherName || '',
        teacher_field: item.teacher_field || item.TeacherField || '', subject_suggestion: item.subject_suggestion || item.SubjectSuggestion || '',
      })), { headers });
      setEntries(response.data.data || []); onClose();
    } catch (err: any) { setError(err.response?.data?.error || 'Jadwal gagal disimpan.'); }
    finally { setSaving(false); }
  };

  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-6">
    <section className="flex max-h-[94dvh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
      <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6"><div><h2 className="font-bold text-gray-800">Jadwal Pelajaran · {nameOf(schoolClass)}</h2><p className="mt-1 text-xs text-gray-500">Tarik mata pelajaran ke jam yang sesuai. Semua siswa di kelas ini memakai jadwal yang sama.</p></div><button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100" aria-label="Tutup"><X size={18}/></button></header>
      {error && <p role="alert" className="mx-5 mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700 sm:mx-6">{error}</p>}
      {loading ? <div className="p-10 text-center text-sm text-gray-500"><Loader2 className="mx-auto mb-2 animate-spin"/>Memuat jadwal dan data mapel...</div> : <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-4 lg:grid-cols-[220px_minmax(0,1fr)] sm:p-6">
        <aside className="rounded-xl border border-gray-100 bg-gray-50 p-3"><h3 className="mb-1 text-sm font-bold text-gray-800">Mata pelajaran</h3><p className="mb-3 text-[11px] text-gray-500">Seret mapel ke slot jadwal.</p><div className="flex gap-2 overflow-x-auto pb-2 lg:max-h-[60vh] lg:flex-col lg:overflow-y-auto">{subjects.map((subject) => <button draggable onDragStart={() => setDraggedSubject(subject)} onDragEnd={() => setDraggedSubject(null)} key={idOf(subject)} className="flex shrink-0 cursor-grab items-center gap-2 rounded-lg border border-blue-100 bg-white px-3 py-2 text-left text-xs font-semibold text-[#1C4D8D] active:cursor-grabbing"><GripVertical size={14}/>{nameOf(subject)}</button>)}</div></aside>
        <div className="space-y-4">{DAYS.map((day) => <section key={day.key} className="overflow-hidden rounded-xl border border-gray-100"><h3 className="bg-[#0F294A] px-4 py-2 text-sm font-semibold text-white">{day.label}</h3><div className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: day.key === 'FRIDAY' ? 6 : 11 }, (_, index) => index + 1).map((period) => {
          const item = slot(day.key, period); const times = day.key === 'FRIDAY' ? [['06:30','07:15'],['07:15','08:00'],['08:00','08:45'],['09:15','10:00'],['10:00','10:45'],['10:45','11:30']][period-1] : SLOTS[period-1];
          return <div key={`${day.key}-${period}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (draggedSubject) placeSubject(day.key, period, draggedSubject); setDraggedSubject(null); }} className={`min-h-24 rounded-xl border border-dashed p-3 transition ${item ? item.needs_review || item.NeedsReview ? 'border-amber-200 bg-amber-50/70' : 'border-blue-200 bg-blue-50/70' : 'border-gray-200 bg-gray-50 hover:border-[#1C4D8D] hover:bg-blue-50'}`}><div className="flex items-start justify-between gap-2"><p className="text-[11px] font-bold text-gray-500">Jam ke-{period}</p><p className="text-[10px] text-gray-400">{times?.[0]}–{times?.[1]}</p></div>{item ? <><div className="mt-2 flex items-start justify-between gap-2"><div><p className="text-xs font-bold text-[#0F294A]">{item.subject?.Name || item.Subject?.Name || subjects.find((s) => idOf(s) === Number(item.subject_id || item.SubjectID))?.Name || 'Mapel perlu dikonfirmasi'}</p>{(item.subject_suggestion || item.SubjectSuggestion) && <p className="mt-0.5 text-[10px] text-amber-700">Saran: {item.subject_suggestion || item.SubjectSuggestion}</p>}</div><button onClick={() => setEntries((prev) => prev.filter((entry) => !(entry.day === day.key && Number(entry.period) === period)))} className="text-[10px] text-red-500">Hapus</button></div><p className="mt-1 text-[10px] text-gray-500">{item.teacher_name || item.TeacherName || item.teacher?.User?.Name || item.Teacher?.User?.Name || 'Guru belum ditentukan'}{(item.teacher_code || item.TeacherCode) ? ` · Kode ${item.teacher_code || item.TeacherCode}` : ''}</p><select value={item.teacher_id || ''} onChange={(event) => { const selected = teachers.find((teacher) => idOf(teacher) === Number(event.target.value)); setEntries((prev) => prev.map((entry) => entry === item ? { ...entry, teacher_id: event.target.value ? Number(event.target.value) : null, teacher_name: selected?.User?.Name || selected?.user?.Name || entry.teacher_name || '' } : entry)); }} className="mt-2 w-full rounded-lg border border-blue-100 bg-white px-2 py-1.5 text-[11px] text-gray-600"><option value="">Pilih guru (opsional)</option>{teachers.map((teacher) => <option key={idOf(teacher)} value={idOf(teacher)}>{teacher.User?.Name || teacher.user?.Name || teacher.name || `Guru ${idOf(teacher)}`}</option>)}</select>{(item.needs_review || item.NeedsReview) && <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-800">Perlu konfirmasi mapel</span>}</> : <p className="mt-3 text-[11px] text-gray-400">Lepas mapel di sini</p>}</div>;
        })}</div></section>)}</div>
      </div>}
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 sm:px-6"><p className="text-[11px] text-gray-400">Jumat mengikuti slot waktu yang lebih singkat.</p><div className="flex gap-2"><button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100">Batal</button><button onClick={save} disabled={loading || saving} className="inline-flex items-center gap-2 rounded-xl bg-[#1C4D8D] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Save size={15}/>{saving ? 'Menyimpan...' : 'Simpan Jadwal'}</button></div></footer>
    </section>
  </div>;
}
