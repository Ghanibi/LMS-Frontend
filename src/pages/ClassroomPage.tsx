import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CalendarDays, MessageCircle, Plus, Send, Users } from 'lucide-react';

interface Classroom {
  ID: number;
  Name: string;
  Grade?: number;
  Major?: string;
}

interface Announcement {
  ID: number;
  Title: string;
  Content: string;
  CreatedAt: string;
}

interface Discussion {
  ID: number;
  ClassID: number;
  ParentID?: number | null;
  Title?: string;
  Content: string;
  CreatedAt: string;
  Author?: { Name?: string };
}

interface AttendanceRow {
  student_id: number;
  student_name: string;
  nis: string;
  status: string;
  note: string;
}

interface ClassroomEvent {
  ID: number;
  Title: string;
  Description: string;
  StartsAt: string;
  EndsAt?: string | null;
}

interface HomeroomNote {
  ID: number;
  StudentID: number;
  Content: string;
  CreatedAt: string;
}

const API = 'http://localhost:8080/api';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

function formatDate(value: string) {
  return new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

function localDateValue() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function ClassroomPage() {
  const navigate = useNavigate();
  const role = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null')?.Role || ''; }
    catch { return ''; }
  })();
  const isTeacher = role === 'TEACHER';
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [activeClassId, setActiveClassId] = useState<number | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [attendanceDate, setAttendanceDate] = useState(localDateValue());
  const [classEvents, setClassEvents] = useState<ClassroomEvent[]>([]);
  const [homeroomNotes, setHomeroomNotes] = useState<HomeroomNote[]>([]);
  const [selectedNoteStudent, setSelectedNoteStudent] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [eventForm, setEventForm] = useState({ title: '', description: '', starts_at: '' });
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '' });
  const [discussionForm, setDiscussionForm] = useState({ title: '', content: '' });
  const [replies, setReplies] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const activeClass = classrooms.find((item) => Number(item.ID) === activeClassId);
  const roots = useMemo(() => discussions.filter((item) => !item.ParentID), [discussions]);

  const fetchClassrooms = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API}/classrooms/mine`, { headers: headers() });
      const items = response.data.data || [];
      setClassrooms(items);
      setActiveClassId((current) => current && items.some((item: Classroom) => item.ID === current) ? current : items[0]?.ID || null);
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'Gagal memuat kelas.');
      setClassrooms([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassDetails = async (classId: number) => {
    setError('');
    try {
      const requests: Promise<any>[] = [
        axios.get(`${API}/classrooms/${classId}/announcements`, { headers: headers() }),
        axios.get(`${API}/classrooms/${classId}/discussions`, { headers: headers() }),
        axios.get(`${API}/classrooms/${classId}/attendance?date=${attendanceDate}`, { headers: headers() }),
        axios.get(`${API}/classrooms/${classId}/events`, { headers: headers() }),
      ];
      if (isTeacher) {
        requests.push(axios.get(`${API}/classrooms/${classId}/students`, { headers: headers() }));
        requests.push(axios.get(`${API}/classrooms/${classId}/notes`, { headers: headers() }));
      }
      const [announcementResponse, discussionResponse, attendanceResponse, eventsResponse, studentsResponse, notesResponse] = await Promise.all(requests);
      setAnnouncements(announcementResponse.data.data || []);
      setDiscussions(discussionResponse.data.data || []);
      setAttendance(attendanceResponse.data.data || []);
      setClassEvents(eventsResponse.data.data || []);
      setStudents(studentsResponse?.data.data || []);
      setHomeroomNotes(notesResponse?.data.data || []);
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'Gagal memuat konten kelas.');
      setAnnouncements([]);
      setDiscussions([]);
      setStudents([]);
      setAttendance([]);
      setClassEvents([]);
      setHomeroomNotes([]);
    }
  };

  useEffect(() => { fetchClassrooms(); }, []);
  useEffect(() => { if (activeClassId) fetchClassDetails(activeClassId); }, [activeClassId, isTeacher, attendanceDate]);

  const updateAttendance = (studentId: number, field: 'status' | 'note', value: string) => {
    setAttendance((current) => current.map((row) => row.student_id === studentId ? { ...row, [field]: value } : row));
  };

  const saveAttendance = async () => {
    if (!activeClassId || attendance.some((row) => !row.status || row.status === 'Belum diisi')) {
      setError('Pilih status presensi untuk semua siswa terlebih dahulu.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await axios.post(`${API}/classrooms/${activeClassId}/attendance`, {
        date: attendanceDate,
        records: attendance.map(({ student_id, status, note }) => ({ student_id, status, note })),
      }, { headers: headers() });
      await fetchClassDetails(activeClassId);
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'Presensi gagal disimpan.');
    } finally { setSubmitting(false); }
  };

  const createClassEvent = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeClassId || !eventForm.starts_at) return;
    setSubmitting(true);
    setError('');
    try {
      await axios.post(`${API}/classrooms/${activeClassId}/events`, {
        ...eventForm,
        starts_at: new Date(eventForm.starts_at).toISOString(),
      }, { headers: headers() });
      setEventForm({ title: '', description: '', starts_at: '' });
      await fetchClassDetails(activeClassId);
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'Agenda gagal disimpan.');
    } finally { setSubmitting(false); }
  };

  const createHomeroomNote = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeClassId || !selectedNoteStudent || !noteContent.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await axios.post(`${API}/classrooms/${activeClassId}/notes`, {
        student_id: Number(selectedNoteStudent),
        content: noteContent,
      }, { headers: headers() });
      setNoteContent('');
      await fetchClassDetails(activeClassId);
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'Catatan pembinaan gagal disimpan.');
    } finally { setSubmitting(false); }
  };

  const createAnnouncement = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeClassId) return;
    setSubmitting(true);
    setError('');
    try {
      await axios.post(`${API}/classrooms/${activeClassId}/announcements`, announcementForm, { headers: headers() });
      setAnnouncementForm({ title: '', content: '' });
      await fetchClassDetails(activeClassId);
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'Pengumuman gagal dikirim.');
    } finally { setSubmitting(false); }
  };

  const createDiscussion = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeClassId) return;
    setSubmitting(true);
    setError('');
    try {
      await axios.post(`${API}/classrooms/${activeClassId}/discussions`, discussionForm, { headers: headers() });
      setDiscussionForm({ title: '', content: '' });
      await fetchClassDetails(activeClassId);
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'Diskusi gagal dikirim.');
    } finally { setSubmitting(false); }
  };

  const replyToDiscussion = async (event: React.FormEvent, discussionId: number) => {
    event.preventDefault();
    if (!activeClassId || !replies[discussionId]?.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await axios.post(`${API}/classrooms/${activeClassId}/discussions`, {
        parent_id: discussionId,
        content: replies[discussionId],
      }, { headers: headers() });
      setReplies((current) => ({ ...current, [discussionId]: '' }));
      await fetchClassDetails(activeClassId);
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'Balasan gagal dikirim.');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500">Memuat Kelas Saya...</div>;
  if (!classrooms.length) return <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
    <Users className="mx-auto text-[#1C4D8D]" size={30} />
    <h2 className="mt-3 font-bold text-gray-800">{isTeacher ? 'Belum ada kelas wali' : 'Data kelas belum tersedia'}</h2>
    <p className="mt-1 text-sm text-gray-500">{isTeacher ? 'Admin perlu menetapkan Anda sebagai wali kelas dari menu Manajemen Kelas.' : 'Hubungi wali kelas atau Admin untuk memastikan data kelas Anda.'}</p>
  </div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Kelas Saya</h1>
          <p className="mt-1 text-xs text-gray-400">Pengumuman dan diskusi bersama warga kelas.</p>
        </div>
        {classrooms.length > 1 && <select value={activeClassId || ''} onChange={(event) => setActiveClassId(Number(event.target.value))} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 focus:border-[#1C4D8D] focus:outline-none">
          {classrooms.map((item) => <option key={item.ID} value={item.ID}>{item.Name}</option>)}
        </select>}
        {!isTeacher && <button type="button" onClick={() => { localStorage.clear(); navigate('/login', { replace: true }); }} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">Keluar</button>}
      </div>

      {error && <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      <section className="rounded-2xl bg-[#0F294A] p-6 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">Ruang Kelas</p>
        <h2 className="mt-1 text-2xl font-bold">{activeClass?.Name}</h2>
        <p className="mt-2 text-sm text-blue-100">Kelas {activeClass?.Grade || '-'}{activeClass?.Major ? ` · ${activeClass.Major}` : ''}</p>
      </section>

      {isTeacher && <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2"><Users size={18} className="text-[#1C4D8D]" /><h2 className="font-bold text-gray-800">Daftar Siswa</h2><span className="rounded-full bg-[#EAF1FA] px-2 py-0.5 text-xs font-semibold text-[#1C4D8D]">{students.length}</span></div>
        {students.length ? <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{students.map((student) => <div key={student.ID || student.id} className="rounded-xl bg-gray-50 px-3 py-2.5 text-sm text-gray-700">{student.Name || student.User?.Name || student.user?.Name || 'Siswa'}<span className="ml-2 text-xs text-gray-400">{student.NIS || student.nis || ''}</span></div>)}</div> : <p className="text-sm text-gray-400">Belum ada siswa di kelas ini.</p>}
      </section>}

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="font-bold text-gray-800">Presensi Kelas</h2><p className="mt-1 text-xs text-gray-400">Catat kehadiran harian siswa.</p></div>
          <input type="date" value={attendanceDate} onChange={(event) => setAttendanceDate(event.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
        </div>
        {isTeacher ? <>
          {attendance.length ? <div className="space-y-2">{attendance.map((row) => <div key={row.student_id} className="grid gap-2 rounded-xl bg-gray-50 p-3 sm:grid-cols-[1fr_150px_1fr] sm:items-center">
            <div><p className="text-sm font-semibold text-gray-700">{row.student_name}</p><p className="text-xs text-gray-400">NIS {row.nis}</p></div>
            <select value={row.status === 'Belum diisi' ? '' : row.status} onChange={(event) => updateAttendance(row.student_id, 'status', event.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
              <option value="">Pilih status</option><option>Hadir</option><option>Izin</option><option>Sakit</option><option>Alpa</option>
            </select>
            <input value={row.note || ''} onChange={(event) => updateAttendance(row.student_id, 'note', event.target.value)} placeholder="Catatan (opsional)" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm" />
          </div>)}</div> : <p className="text-sm text-gray-400">Belum ada siswa di kelas untuk dicatat.</p>}
          {attendance.length > 0 && <button type="button" disabled={submitting} onClick={saveAttendance} className="mt-4 rounded-xl bg-[#1C4D8D] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Simpan Presensi</button>}
        </> : attendance.map((row) => <div key={row.student_id} className="flex items-center justify-between rounded-xl bg-gray-50 p-4"><span className="text-sm font-medium text-gray-600">Status kehadiranmu</span><span className={`rounded-full px-3 py-1 text-sm font-semibold ${row.status === 'Hadir' ? 'bg-green-50 text-green-700' : row.status === 'Belum diisi' ? 'bg-gray-100 text-gray-500' : 'bg-amber-50 text-amber-700'}`}>{row.status}</span>{row.note && <span className="ml-3 text-xs text-gray-500">{row.note}</span>}</div>)}
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2"><CalendarDays size={18} className="text-[#1C4D8D]" /><h2 className="font-bold text-gray-800">Agenda Kelas</h2></div>
        {isTeacher && <form onSubmit={createClassEvent} className="mb-5 grid gap-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-2">
          <input required maxLength={150} value={eventForm.title} onChange={(event) => setEventForm({ ...eventForm, title: event.target.value })} placeholder="Nama kegiatan" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm" />
          <input required type="datetime-local" value={eventForm.starts_at} onChange={(event) => setEventForm({ ...eventForm, starts_at: event.target.value })} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm" />
          <input value={eventForm.description} onChange={(event) => setEventForm({ ...eventForm, description: event.target.value })} placeholder="Keterangan (opsional)" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm sm:col-span-2" />
          <button disabled={submitting} className="justify-self-start rounded-xl bg-[#1C4D8D] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Tambah Agenda</button>
        </form>}
        {classEvents.length ? <div className="space-y-2">{classEvents.map((item) => <article key={item.ID} className="rounded-xl border border-gray-100 p-4"><h3 className="font-semibold text-gray-800">{item.Title}</h3><p className="mt-1 text-xs font-medium text-[#1C4D8D]">{formatDate(item.StartsAt)}</p>{item.Description && <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">{item.Description}</p>}</article>)}</div> : <p className="text-sm text-gray-400">Belum ada agenda kelas.</p>}
      </section>

      {isTeacher && <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-2"><h2 className="font-bold text-gray-800">Catatan Pembinaan</h2><p className="mt-1 text-xs text-gray-400">Catatan ini hanya dapat dilihat wali kelas dan admin.</p></div>
        <form onSubmit={createHomeroomNote} className="mb-5 space-y-3 rounded-xl bg-gray-50 p-4">
          <select required value={selectedNoteStudent} onChange={(event) => setSelectedNoteStudent(event.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"><option value="">Pilih siswa</option>{students.map((student) => <option key={student.ID} value={student.ID}>{student.Name} · {student.NIS}</option>)}</select>
          <textarea required rows={3} value={noteContent} onChange={(event) => setNoteContent(event.target.value)} placeholder="Catat tindak lanjut atau pembinaan..." className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm" />
          <button disabled={submitting || !students.length} className="rounded-xl bg-[#1C4D8D] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Simpan Catatan Privat</button>
        </form>
        {homeroomNotes.length ? <div className="space-y-2">{homeroomNotes.map((note) => {
          const student = students.find((item) => Number(item.ID) === note.StudentID);
          return <article key={note.ID} className="rounded-xl border border-gray-100 p-4"><div className="flex flex-wrap justify-between gap-2"><h3 className="text-sm font-semibold text-gray-800">{student?.Name || `Siswa #${note.StudentID}`}</h3><span className="text-xs text-gray-400">{formatDate(note.CreatedAt)}</span></div><p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">{note.Content}</p></article>;
        })}</div> : <p className="text-sm text-gray-400">Belum ada catatan pembinaan.</p>}
      </section>}

      {isTeacher && <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2"><BookOpen size={18} className="text-[#1C4D8D]" /><h2 className="font-bold text-gray-800">Buat Pengumuman Kelas</h2></div>
        <form onSubmit={createAnnouncement} className="space-y-3">
          <input required maxLength={150} value={announcementForm.title} onChange={(event) => setAnnouncementForm({ ...announcementForm, title: event.target.value })} placeholder="Judul pengumuman" className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#1C4D8D] focus:outline-none" />
          <textarea required rows={3} value={announcementForm.content} onChange={(event) => setAnnouncementForm({ ...announcementForm, content: event.target.value })} placeholder="Tulis pengumuman untuk kelas ini..." className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#1C4D8D] focus:outline-none" />
          <button disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-[#1C4D8D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1C4D8D]/90 disabled:opacity-50"><Plus size={16} />Terbitkan</button>
        </form>
      </section>}

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2"><CalendarDays size={18} className="text-[#1C4D8D]" /><h2 className="font-bold text-gray-800">Pengumuman Kelas</h2></div>
        {announcements.length ? <div className="space-y-3">{announcements.map((item) => <article key={item.ID} className="rounded-xl border border-gray-100 p-4"><h3 className="font-semibold text-gray-800">{item.Title}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">{item.Content}</p><p className="mt-3 text-[11px] text-gray-400">{formatDate(item.CreatedAt)}</p></article>)}</div> : <p className="text-sm text-gray-400">Belum ada pengumuman untuk kelas ini.</p>}
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2"><MessageCircle size={18} className="text-[#1C4D8D]" /><h2 className="font-bold text-gray-800">Diskusi Kelas</h2></div>
        <form onSubmit={createDiscussion} className="mb-6 space-y-3 rounded-xl bg-gray-50 p-4">
          <input required maxLength={150} value={discussionForm.title} onChange={(event) => setDiscussionForm({ ...discussionForm, title: event.target.value })} placeholder="Topik diskusi" className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:border-[#1C4D8D] focus:outline-none" />
          <textarea required rows={3} value={discussionForm.content} onChange={(event) => setDiscussionForm({ ...discussionForm, content: event.target.value })} placeholder="Mulai diskusi atau ajukan pertanyaan..." className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:border-[#1C4D8D] focus:outline-none" />
          <button disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-[#1C4D8D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1C4D8D]/90 disabled:opacity-50"><Send size={15} />Mulai Diskusi</button>
        </form>
        {roots.length ? <div className="space-y-4">{roots.map((post) => {
          const postReplies = discussions.filter((item) => Number(item.ParentID) === post.ID);
          return <article key={post.ID} className="rounded-xl border border-gray-100 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-semibold text-gray-800">{post.Title}</h3><span className="text-[11px] text-gray-400">{formatDate(post.CreatedAt)}</span></div>
            <p className="mt-1 text-xs font-medium text-[#1C4D8D]">{post.Author?.Name || 'Anggota kelas'}</p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600">{post.Content}</p>
            {postReplies.length > 0 && <div className="mt-4 space-y-2 border-l-2 border-[#EAF1FA] pl-4">{postReplies.map((reply) => <div key={reply.ID} className="rounded-lg bg-gray-50 p-3"><div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-gray-700">{reply.Author?.Name || 'Anggota kelas'}</span><span className="text-[10px] text-gray-400">{formatDate(reply.CreatedAt)}</span></div><p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">{reply.Content}</p></div>)}</div>}
            <form onSubmit={(event) => replyToDiscussion(event, post.ID)} className="mt-4 flex gap-2"><input value={replies[post.ID] || ''} onChange={(event) => setReplies({ ...replies, [post.ID]: event.target.value })} placeholder="Tulis balasan..." className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs focus:border-[#1C4D8D] focus:outline-none" /><button disabled={submitting} aria-label="Kirim balasan" className="rounded-lg bg-[#1C4D8D] px-3 text-white hover:bg-[#1C4D8D]/90 disabled:opacity-50"><Send size={14} /></button></form>
          </article>;
        })}</div> : <p className="text-sm text-gray-400">Belum ada topik diskusi. Mulai diskusi pertama di kelas ini.</p>}
      </section>
    </div>
  );
}
