import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { KeyRound, ShieldCheck } from 'lucide-react';

const API = '/api';
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function AdminSuperAdminBootstrap() {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    axios.get(`${API}/super-admin-bootstrap/status`, { headers: auth() })
      .then((response) => setAvailable(Boolean(response.data.available)))
      .catch((requestError: any) => setError(requestError.response?.data?.error || 'Status Super Admin gagal diperiksa.'))
      .finally(() => setLoading(false));
  }, []);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError('');
    try { await axios.post(`${API}/super-admin-bootstrap`, form, { headers: auth() }); setAvailable(false); setDone(true); }
    catch (requestError: any) { setError(requestError.response?.data?.error || 'Super Admin gagal dibuat.'); }
    finally { setSaving(false); }
  };
  return <div className="mx-auto max-w-3xl space-y-5">
    <section className="rounded-2xl bg-[#0F294A] p-5 text-white shadow-sm sm:p-7"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-200">Setup satu kali</p><h1 className="mt-1 text-2xl font-bold">Aktifkan Super Admin</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100/75">Super Admin mendapat akses ke seluruh modul Admin dan dapat mengelola akun Admin. Akun awal hanya bisa dibuat sekali dari halaman ini.</p></section>
    {loading ? <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500">Memeriksa status Super Admin...</div> : done ? <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><span className="rounded-xl bg-emerald-50 p-3 text-emerald-700"><ShieldCheck size={22} /></span><div><h2 className="font-bold text-gray-800">Super Admin berhasil dibuat</h2><p className="mt-1 text-sm text-gray-500">Akun Admin kamu tetap aktif. Keluar lalu login memakai email dan password Super Admin untuk membuka akses penuh.</p></div></div></section> : !available ? <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><span className="rounded-xl bg-blue-50 p-3 text-[#1C4D8D]"><ShieldCheck size={22} /></span><div><h2 className="font-bold text-gray-800">Super Admin sudah diaktifkan</h2><p className="mt-1 text-sm text-gray-500">Akun Super Admin hanya dapat dibuat sekali. Gunakan akun yang sudah terdaftar untuk mengelola Administrator.</p></div></div></section> : <form onSubmit={submit} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"><div className="flex gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs leading-5 text-amber-800"><KeyRound size={17} className="mt-0.5 shrink-0" /><p>Akun ini memiliki akses penuh ke data SIAS dan pengelolaan Admin. Simpan password dengan aman.</p></div><label className="block text-xs font-semibold text-gray-600">Nama lengkap<input required minLength={2} maxLength={100} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-normal focus:border-[#1C4D8D] focus:outline-none" placeholder="Nama Super Admin" /></label><label className="block text-xs font-semibold text-gray-600">Email login<input required type="email" maxLength={150} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-normal focus:border-[#1C4D8D] focus:outline-none" placeholder="superadmin@sekolah.sch.id" /></label><label className="block text-xs font-semibold text-gray-600">Password awal<input required type="password" minLength={6} autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-normal focus:border-[#1C4D8D] focus:outline-none" placeholder="Minimal 6 karakter" /></label>{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}<button disabled={saving} className="rounded-xl bg-[#1C4D8D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#163e73] disabled:opacity-50">{saving ? 'Membuat akun...' : 'Buat Super Admin'}</button></form>}
  </div>;
}

