import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { KeyRound, Pencil, Plus, Search, ShieldCheck, Trash2, UserRound, X } from 'lucide-react';

const API = '/api';
type AccountRole = 'CURRICULUM' | 'PRINCIPAL';
interface Account { ID: number; Name: string; Email: string; Role: AccountRole; CreatedAt?: string; }
const emptyForm = { Name: '', Email: '', Password: '', Role: 'CURRICULUM' as AccountRole };
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const roleLabel = (role: AccountRole) => role === 'CURRICULUM' ? 'Kurikulum' : 'Kepala Sekolah';

export default function AdminLeadershipAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API}/users/leadership-accounts`, { headers: headers() });
      setAccounts(response.data.data || []);
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'Daftar akun gagal dimuat.');
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const filteredAccounts = useMemo(() => accounts.filter((account) => `${account.Name} ${account.Email} ${roleLabel(account.Role)}`.toLowerCase().includes(search.toLowerCase())), [accounts, search]);
  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(''); setNotice(''); setModalOpen(true); };
  const openEdit = (account: Account) => { setEditing(account); setForm({ Name: account.Name, Email: account.Email, Password: '', Role: account.Role }); setError(''); setNotice(''); setModalOpen(true); };
  const closeModal = () => { if (!saving) setModalOpen(false); };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    const payload: Record<string, string> = { name: form.Name.trim(), email: form.Email.trim(), role: form.Role };
    if (!editing || form.Password.trim()) payload.password = form.Password;
    try {
      if (editing) await axios.put(`${API}/users/leadership-accounts/${editing.ID}`, payload, { headers: headers() });
      else await axios.post(`${API}/users/leadership-accounts`, payload, { headers: headers() });
      setNotice(editing ? 'Akun berhasil diperbarui.' : 'Akun berhasil dibuat.');
      setModalOpen(false);
      await fetchAccounts();
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'Akun gagal disimpan. Periksa kembali data yang diisi.');
    } finally { setSaving(false); }
  };

  const remove = async (account: Account) => {
    if (!window.confirm(`Hapus akun ${roleLabel(account.Role)} milik ${account.Name}?`)) return;
    setError(''); setNotice('');
    try {
      await axios.delete(`${API}/users/leadership-accounts/${account.ID}`, { headers: headers() });
      setNotice(`Akun ${account.Name} berhasil dihapus.`); await fetchAccounts();
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'Akun gagal dihapus.');
    }
  };

  return <div className="space-y-6">
    <section className="flex flex-wrap items-end justify-between gap-4 rounded-2xl bg-[#0F294A] p-5 text-white shadow-sm sm:p-6">
      <div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-200">Administrasi akun</p><h1 className="mt-1 text-2xl font-bold">Akun Pimpinan & Kurikulum</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100/70">Buat dan atur akun login Kepala Sekolah serta Kurikulum. Akun ini tidak dicampur dengan data profil guru.</p></div>
      <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#0F294A] transition hover:bg-blue-50"><Plus size={17}/>Tambah Akun</button>
    </section>

    {notice && <div role="status" className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>}
    {error && !modalOpen && <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4 sm:p-5"><div><h2 className="font-bold text-gray-800">Daftar akun</h2><p className="mt-1 text-xs text-gray-400">{accounts.length} akun · password tidak ditampilkan</p></div><label className="flex min-w-48 items-center gap-2 rounded-xl border border-gray-200 px-3 py-2"><Search size={16} className="text-gray-400"/><input aria-label="Cari akun" value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="Cari nama atau email" className="w-full text-xs outline-none"/></label></div>
      {loading ? <p className="p-8 text-center text-sm text-gray-500">Memuat akun...</p> : filteredAccounts.length ? <div className="divide-y divide-gray-100">{filteredAccounts.map((account)=><article key={account.ID} className="flex flex-wrap items-center justify-between gap-4 p-4 sm:px-5"><div className="flex min-w-0 items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#EAF1FA] text-[#1C4D8D]"><UserRound size={20}/></span><div className="min-w-0"><h3 className="truncate text-sm font-bold text-gray-800">{account.Name}</h3><p className="mt-0.5 truncate text-xs text-gray-500">{account.Email}</p><span className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${account.Role==='CURRICULUM'?'bg-blue-50 text-[#1C4D8D]':'bg-indigo-50 text-indigo-700'}`}><ShieldCheck size={12}/>{roleLabel(account.Role)}</span></div></div><div className="flex shrink-0 items-center gap-2"><button type="button" onClick={()=>openEdit(account)} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"><Pencil size={14}/>Edit</button><button type="button" onClick={()=>remove(account)} className="grid h-9 w-9 place-items-center rounded-lg border border-red-100 text-red-500 transition hover:bg-red-50" aria-label={`Hapus akun ${account.Name}`}><Trash2 size={15}/></button></div></article>)}</div> : <div className="p-10 text-center"><UserRound className="mx-auto text-gray-300" size={32}/><h3 className="mt-3 font-semibold text-gray-700">Belum ada akun</h3><p className="mt-1 text-sm text-gray-500">Tambahkan akun Kepala Sekolah atau Kurikulum untuk memberi akses masuk.</p></div>}
    </section>

    <aside className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900"><KeyRound size={18} className="mt-0.5 shrink-0 text-[#1C4D8D]"/><p><strong>Keamanan akun:</strong> password disimpan dalam bentuk hash dan tidak dapat dilihat kembali. Gunakan Edit untuk menetapkan password baru.</p></aside>

    {modalOpen && <div className="animate-in fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onMouseDown={(event)=>{if(event.target===event.currentTarget)closeModal();}}><section role="dialog" aria-modal="true" aria-labelledby="leadership-account-title" className="w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"><header className="flex items-center justify-between border-b border-gray-100 px-5 py-4"><div><h2 id="leadership-account-title" className="font-bold text-gray-800">{editing?'Edit akun':'Tambah akun baru'}</h2><p className="mt-1 text-xs text-gray-500">Akun untuk Kepala Sekolah atau Kurikulum</p></div><button type="button" onClick={closeModal} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100" aria-label="Tutup"><X size={18}/></button></header>
      <form onSubmit={submit} className="space-y-4 p-5"><label className="block text-xs font-semibold text-gray-600">Role<select value={form.Role} onChange={(event)=>setForm({...form,Role:event.target.value as AccountRole})} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-normal text-gray-800 focus:border-[#1C4D8D] focus:outline-none"><option value="CURRICULUM">Kurikulum</option><option value="PRINCIPAL">Kepala Sekolah</option></select></label>
      <label className="block text-xs font-semibold text-gray-600">Nama lengkap<input required minLength={2} maxLength={100} value={form.Name} onChange={(event)=>setForm({...form,Name:event.target.value})} placeholder="Nama lengkap" className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-normal focus:border-[#1C4D8D] focus:outline-none"/></label>
      <label className="block text-xs font-semibold text-gray-600">Email login<input required type="email" maxLength={150} value={form.Email} onChange={(event)=>setForm({...form,Email:event.target.value})} placeholder="nama@sekolah.sch.id" className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-normal focus:border-[#1C4D8D] focus:outline-none"/></label>
      <label className="block text-xs font-semibold text-gray-600">{editing?'Password baru (opsional)':'Password awal'}<input required={!editing} type="password" minLength={6} autoComplete="new-password" value={form.Password} onChange={(event)=>setForm({...form,Password:event.target.value})} placeholder={editing?'Kosongkan jika tidak ingin mengubah':'Minimal 6 karakter'} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-normal focus:border-[#1C4D8D] focus:outline-none"/>{!editing&&<span className="mt-1 block font-normal text-gray-400">Berikan password ini kepada pemilik akun secara langsung.</span>}</label>
      {error&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}
      <footer className="flex justify-end gap-2 border-t border-gray-100 pt-4"><button type="button" onClick={closeModal} disabled={saving} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50">Batal</button><button disabled={saving} className="rounded-xl bg-[#1C4D8D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#163e73] disabled:opacity-50">{saving?'Menyimpan...':editing?'Simpan perubahan':'Buat akun'}</button></footer></form></section></div>}
  </div>;
}
