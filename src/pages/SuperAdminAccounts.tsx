import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { KeyRound, Pencil, Plus, Search, Shield, Trash2, UserRound, X } from 'lucide-react';

const API = 'http://localhost:8080/api';
interface AdminAccount { ID: number; Name: string; Email: string; }
const emptyForm = { name: '', email: '', password: '' };
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function SuperAdminAccounts() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAccount | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try { const response = await axios.get(`${API}/super-admin/accounts`, { headers: auth() }); setAccounts(response.data.data || []); }
    catch (requestError: any) { setError(requestError.response?.data?.error || 'Daftar Admin gagal dimuat.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  const filtered = useMemo(() => accounts.filter((item) => `${item.Name} ${item.Email}`.toLowerCase().includes(search.toLowerCase())), [accounts, search]);
  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(''); setModalOpen(true); };
  const openEdit = (item: AdminAccount) => { setEditing(item); setForm({ name: item.Name, email: item.Email, password: '' }); setError(''); setModalOpen(true); };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    const body: Record<string, string> = { name: form.name.trim(), email: form.email.trim() };
    if (!editing || form.password) body.password = form.password;
    try {
      if (editing) await axios.put(`${API}/super-admin/accounts/${editing.ID}`, body, { headers: auth() });
      else await axios.post(`${API}/super-admin/accounts`, body, { headers: auth() });
      setModalOpen(false); setNotice(editing ? 'Data Admin diperbarui.' : 'Akun Admin berhasil dibuat.'); await refresh();
    } catch (requestError: any) { setError(requestError.response?.data?.error || 'Akun Admin gagal disimpan.'); }
    finally { setSaving(false); }
  };

  const remove = async (item: AdminAccount) => {
    if (!window.confirm(`Hapus akses Admin untuk ${item.Name}?`)) return;
    setError(''); setNotice('');
    try { await axios.delete(`${API}/super-admin/accounts/${item.ID}`, { headers: auth() }); setNotice(`Akun ${item.Name} dihapus.`); await refresh(); }
    catch (requestError: any) { setError(requestError.response?.data?.error || 'Akun Admin gagal dihapus.'); }
  };

  return <div className="space-y-6">
    <section className="flex flex-wrap items-end justify-between gap-4 rounded-2xl bg-[#0F294A] p-5 text-white shadow-sm sm:p-6"><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-200">Kontrol sistem</p><h1 className="mt-1 text-2xl font-bold">Manajemen Admin</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100/75">Buat, perbarui, atau cabut akun Administrator sekolah. Akun Super Admin dikelola terpisah dan tidak muncul di sini.</p></div><button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#0F294A] transition hover:bg-blue-50"><Plus size={17} />Tambah Admin</button></section>
    {notice && <p role="status" className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}{error && !modalOpen && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4 sm:p-5"><div><h2 className="font-bold text-gray-800">Akun Admin</h2><p className="mt-1 text-xs text-gray-400">{accounts.length} Administrator · password tidak ditampilkan</p></div><label className="flex min-w-48 items-center gap-2 rounded-xl border border-gray-200 px-3 py-2"><Search size={16} className="text-gray-400" /><input aria-label="Cari akun Admin" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama atau email" className="w-full text-xs outline-none" /></label></div>
      {loading ? <p className="p-8 text-center text-sm text-gray-500">Memuat akun...</p> : filtered.length ? <div className="divide-y divide-gray-100">{filtered.map((item) => <article key={item.ID} className="flex flex-wrap items-center justify-between gap-4 p-4 sm:px-5"><div className="flex min-w-0 items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#EAF1FA] text-[#1C4D8D]"><UserRound size={20} /></span><div className="min-w-0"><h3 className="truncate text-sm font-bold text-gray-800">{item.Name}</h3><p className="mt-0.5 truncate text-xs text-gray-500">{item.Email}</p><span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-[#1C4D8D]"><Shield size={12} />Administrator</span></div></div><div className="flex shrink-0 items-center gap-2"><button type="button" onClick={() => openEdit(item)} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"><Pencil size={14} />Edit</button><button type="button" onClick={() => remove(item)} aria-label={`Hapus ${item.Name}`} className="grid h-9 w-9 place-items-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50"><Trash2 size={15} /></button></div></article>)}</div> : <div className="p-10 text-center"><UserRound className="mx-auto text-gray-300" size={32} /><h3 className="mt-3 font-semibold text-gray-700">Belum ada akun Admin</h3><p className="mt-1 text-sm text-gray-500">Buat Administrator untuk membantu mengelola data sekolah.</p></div>}</section>
    <aside className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900"><KeyRound size={18} className="mt-0.5 shrink-0 text-[#1C4D8D]" /><p>Super Admin punya akses penuh. Hak Super Admin tidak dapat diberikan dari halaman ini; pembuatan awal dilakukan Admin satu kali melalui menu Aktivasi Super Admin.</p></aside>
    {modalOpen && <div className="animate-in fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setModalOpen(false); }}><section role="dialog" aria-modal="true" aria-labelledby="admin-account-title" className="w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"><header className="flex items-center justify-between border-b border-gray-100 px-5 py-4"><div><h2 id="admin-account-title" className="font-bold text-gray-800">{editing ? 'Edit akun Admin' : 'Tambah akun Admin'}</h2><p className="mt-1 text-xs text-gray-500">{editing ? 'Password opsional jika tidak ingin diganti.' : 'Buat akses Administrator baru.'}</p></div><button type="button" onClick={() => setModalOpen(false)} aria-label="Tutup" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"><X size={18} /></button></header><form onSubmit={submit} className="space-y-4 p-5"><label className="block text-xs font-semibold text-gray-600">Nama<input required minLength={2} maxLength={100} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-normal focus:border-[#1C4D8D] focus:outline-none" /></label><label className="block text-xs font-semibold text-gray-600">Email login<input required type="email" maxLength={150} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-normal focus:border-[#1C4D8D] focus:outline-none" /></label><label className="block text-xs font-semibold text-gray-600">{editing ? 'Password baru (opsional)' : 'Password awal'}<input required={!editing} type="password" minLength={6} autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder={editing ? 'Kosongkan jika tidak diubah' : 'Minimal 6 karakter'} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-normal focus:border-[#1C4D8D] focus:outline-none" /></label>{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}<footer className="flex justify-end gap-2 border-t border-gray-100 pt-4"><button type="button" onClick={() => setModalOpen(false)} disabled={saving} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50">Batal</button><button disabled={saving} className="rounded-xl bg-[#1C4D8D] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Menyimpan...' : editing ? 'Simpan perubahan' : 'Buat akun Admin'}</button></footer></form></section></div>}
  </div>;
}
