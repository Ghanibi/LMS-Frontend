import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown, ArrowRight, ArrowUpRight, BookOpen, CalendarDays,
  Check, GraduationCap, LayoutDashboard, Megaphone, Menu, MessageCircle,
  ShieldCheck, Sparkles, Users, X,
} from 'lucide-react';

const audiences = [
  { id: 'siswa', label: 'Siswa', icon: GraduationCap, greeting: 'Belajar jadi lebih terarah.', detail: 'Materi, tugas, dan kabar kelas ada di satu tempat.', tag: 'RUANG SISWA', metric: '12', metricLabel: 'materi tersedia', activity: 'Tugas Basis Data', activityMeta: 'Dikumpulkan · 2 hari lagi', color: '#A7F3D0' },
  { id: 'guru', label: 'Guru', icon: BookOpen, greeting: 'Mengajar, lebih terhubung.', detail: 'Kelola kelas, bagikan materi, dan dampingi murid.', tag: 'RUANG GURU', metric: '08', metricLabel: 'kelas aktif', activity: 'Diskusi Kelas 12 PPLG 2', activityMeta: '3 balasan baru', color: '#BFDBFE' },
  { id: 'kurikulum', label: 'Kurikulum', icon: CalendarDays, greeting: 'Rencana sekolah terlihat jelas.', detail: 'Pantau agenda, mata pelajaran, dan kegiatan belajar.', tag: 'RUANG KURIKULUM', metric: '24', metricLabel: 'agenda semester', activity: 'Evaluasi tengah semester', activityMeta: 'Terjadwal · 14 Oktober', color: '#FDE68A' },
  { id: 'pimpinan', label: 'Pimpinan', icon: ShieldCheck, greeting: 'Lihat sekolah dari satu pandangan.', detail: 'Informasi penting membantu keputusan lebih cepat.', tag: 'RUANG PIMPINAN', metric: '96%', metricLabel: 'aktivitas terpantau', activity: 'Ringkasan pembelajaran', activityMeta: 'Diperbarui hari ini', color: '#DDD6FE' },
];

const features = [
  { icon: BookOpen, number: '01', title: 'Belajar terorganisir', description: 'Materi dan tugas tersusun sesuai kelas dan mata pelajaran, jadi semua orang tahu apa yang perlu dikerjakan.' },
  { icon: MessageCircle, number: '02', title: 'Kelas tetap terhubung', description: 'Pengumuman, agenda, dan diskusi kelas menjaga komunikasi guru dan siswa tetap dekat.' },
  { icon: Users, number: '03', title: 'Peran yang saling terhubung', description: 'Siswa, guru, wali kelas, kurikulum, dan pimpinan bekerja dalam satu ruang yang sama.' },
];

export default function LandingPage() {
  const [activeAudience, setActiveAudience] = useState(audiences[0]);
  const [menuOpen, setMenuOpen] = useState(false);
  const ActiveIcon = activeAudience.icon;

  return (
    <div className="min-h-screen overflow-hidden bg-[#F7F9FC] font-sans text-[#102A4C] selection:bg-blue-200">
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link to="/" className="flex items-center gap-3" aria-label="SIAS beranda">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#1C4D8D] text-sm font-black tracking-tight text-white shadow-lg shadow-blue-900/15">SI</span>
          <span><span className="block text-sm font-extrabold tracking-[0.14em]">SIAS</span><span className="block text-[10px] font-medium tracking-wide text-slate-500">Sistem Informasi Akademik Sekolah</span></span>
        </Link>

        <nav className={`${menuOpen ? 'absolute left-4 right-4 top-[76px] flex flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-xl' : 'hidden'} items-stretch gap-1 md:static md:flex md:flex-row md:items-center md:gap-8 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
          <a onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-[#1C4D8D]" href="#fitur">Fitur</a>
          <a onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-[#1C4D8D]" href="#ekosistem">Ekosistem</a>
          <a onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-[#1C4D8D]" href="#tentang">Tentang SIAS</a>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/login" className="group inline-flex items-center gap-2 rounded-full bg-[#1C4D8D] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-[#153d72]">
            Login <ArrowUpRight size={16} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <button className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}>
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      <main>
        <section id="tentang" className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-12 sm:px-8 sm:pb-28 sm:pt-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8 lg:px-12 lg:pb-32 lg:pt-20">
          <div className="pointer-events-none absolute -left-48 top-12 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="relative z-10 max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3.5 py-2 text-xs font-semibold text-[#1C4D8D] shadow-sm">
              <Sparkles size={14} /> Satu ruang untuk seluruh ekosistem sekolah
            </div>
            <h1 className="text-[clamp(3.2rem,7.4vw,6.5rem)] font-black leading-[0.96] tracking-[-0.075em] text-[#0F294A]">
              Sekolah maju,<br /><span className="relative inline-block text-[#2C69AC]">bareng-bareng.<span className="absolute -bottom-1 left-1 h-2 w-[94%] -rotate-2 rounded-full bg-[#F5B942]/80" /></span>
            </h1>
            <p className="mt-8 max-w-lg text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              SIAS menyatukan kegiatan belajar, pengelolaan kelas, dan komunikasi sekolah dalam pengalaman digital yang lebih rapi dan mudah diikuti.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link to="/login" className="group inline-flex items-center gap-3 rounded-full bg-[#F5B942] px-6 py-3.5 text-sm font-bold text-[#102A4C] shadow-lg shadow-amber-900/10 transition hover:-translate-y-0.5 hover:bg-[#f8c65f]">Masuk ke SIAS <ArrowRight size={17} className="transition group-hover:translate-x-1" /></Link>
              <a href="#fitur" className="inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-white">Jelajahi fitur <ArrowDown size={16} /></a>
            </div>
            <div className="mt-12 flex items-center gap-4 border-t border-slate-200/80 pt-6">
              <div className="flex -space-x-2">
                {['S', 'G', 'K', 'P'].map((letter, index) => <span key={letter} className={`grid h-9 w-9 place-items-center rounded-full border-2 border-[#F7F9FC] text-xs font-bold text-[#102A4C] ${['bg-emerald-200', 'bg-blue-200', 'bg-amber-200', 'bg-violet-200'][index]}`}>{letter}</span>)}
              </div>
              <p className="text-xs leading-5 text-slate-500"><strong className="font-bold text-slate-700">Satu platform, banyak peran.</strong><br />Dirancang untuk tumbuh bersama sekolah.</p>
            </div>
          </div>

          <div id="ekosistem" className="relative mx-auto w-full max-w-[610px] lg:ml-auto">
            <div className="absolute -right-10 -top-12 h-52 w-52 rounded-full border border-blue-200/80" />
            <div className="absolute -right-4 -top-6 h-52 w-52 rounded-full border border-dashed border-blue-300/70" />
            <div className="absolute -bottom-12 -left-10 h-48 w-48 rounded-full bg-[#F5B942]/20 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] bg-[#0F294A] p-4 shadow-[0_35px_100px_-35px_rgba(15,41,74,0.55)] sm:p-6">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#9fc5f5 0.7px, transparent 0.7px)', backgroundSize: '18px 18px' }} />
              <div className="relative flex items-center justify-between px-1 pb-5">
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#F5B942] shadow-[0_0_12px_#F5B942]" /><span className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-100/75">SIAS · Ruang Belajar</span></div>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-blue-100/70">Pratinjau interaktif</span>
              </div>

              <div className="relative rounded-[1.5rem] bg-[#F8FAFD] p-4 sm:p-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{activeAudience.tag}</p><p className="mt-1 text-sm font-bold text-[#102A4C]">Halo, teman belajar <span className="inline-block animate-[wave_2s_ease-in-out_infinite]">✦</span></p></div>
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#E8F0FA] text-[#1C4D8D]"><ActiveIcon size={17} /></div>
                </div>

                <div key={activeAudience.id} className="landing-preview-enter py-5">
                  <h2 className="text-2xl font-extrabold tracking-tight text-[#102A4C] sm:text-[1.75rem]">{activeAudience.greeting}</h2>
                  <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">{activeAudience.detail}</p>
                </div>

                <div className="grid grid-cols-[0.78fr_1.22fr] gap-3">
                  <div className="rounded-2xl bg-[#EAF1FA] p-4">
                    <p className="text-[10px] font-semibold text-[#51729a]">Hari ini</p>
                    <p className="mt-3 text-3xl font-black tracking-tight text-[#1C4D8D]">{activeAudience.metric}</p>
                    <p className="mt-1 text-[10px] leading-4 text-slate-500">{activeAudience.metricLabel}</p>
                    <div className="mt-4 flex h-8 items-end gap-1">{[40, 65, 48, 84, 59, 100, 72].map((height, index) => <span key={index} className={`w-full rounded-t-sm ${index === 5 ? 'bg-[#1C4D8D]' : 'bg-[#B7CBE4]'}`} style={{ height: `${height}%` }} />)}</div>
                  </div>
                  <div className="flex flex-col justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                    <div className="flex items-center justify-between"><span className="text-[10px] font-semibold text-slate-400">Aktivitas terbaru</span><span className="h-2 w-2 rounded-full bg-emerald-400" /></div>
                    <div className="my-4 flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: activeAudience.color }}><BookOpen size={16} className="text-[#102A4C]" /></span><div><p className="text-xs font-bold text-[#102A4C]">{activeAudience.activity}</p><p className="mt-1 text-[10px] text-slate-400">{activeAudience.activityMeta}</p></div></div>
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#1C4D8D]"><Check size={13} /> Semua dalam satu tempat</div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
                  <div className="mb-2 flex items-center justify-between px-1"><span className="text-[10px] font-bold text-slate-500">Lihat dari sisi kamu</span><span className="text-[9px] font-medium uppercase tracking-widest text-slate-300">Pilih peran</span></div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {audiences.map((audience) => {
                      const Icon = audience.icon;
                      const selected = activeAudience.id === audience.id;
                      return <button key={audience.id} onClick={() => setActiveAudience(audience)} className={`flex flex-col items-center gap-1.5 rounded-xl px-1 py-2.5 text-[10px] font-semibold transition ${selected ? 'bg-[#1C4D8D] text-white shadow-md shadow-blue-900/15' : 'text-slate-500 hover:bg-slate-50 hover:text-[#1C4D8D]'}`}><Icon size={15} />{audience.label}</button>;
                    })}
                  </div>
                </div>
              </div>
              <div className="relative flex items-center justify-center gap-2 pt-4 text-[10px] font-medium text-blue-100/65"><Megaphone size={13} /> Pengumuman, kelas, dan agenda saling terhubung</div>
            </div>

            <div className="absolute -left-8 top-[28%] hidden items-center gap-2 rounded-2xl border border-white bg-white px-3 py-2.5 text-xs font-semibold text-[#102A4C] shadow-xl shadow-blue-950/10 sm:flex"><span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-100 text-emerald-700"><Check size={15} /></span>Belajar lebih tertata</div>
            <div className="absolute -right-5 bottom-[18%] hidden items-center gap-2 rounded-2xl border border-white bg-white px-3 py-2.5 text-xs font-semibold text-[#102A4C] shadow-xl shadow-blue-950/10 sm:flex"><span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-100 text-amber-700"><CalendarDays size={15} /></span>Semua agenda terlihat</div>
          </div>
        </section>

        <section id="fitur" className="relative bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-end">
              <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2C69AC]">Belajar, terhubung, bertumbuh</p><h2 className="mt-4 max-w-lg text-4xl font-black leading-tight tracking-[-0.055em] text-[#0F294A] sm:text-5xl">Hal penting sekolah, <span className="text-[#2C69AC]">lebih dekat.</span></h2></div>
              <p className="max-w-xl text-sm leading-7 text-slate-500 md:justify-self-end md:text-base">Dari tugas pertama hari ini sampai agenda sekolah berikutnya—SIAS membuat informasi akademik mudah ditemukan oleh orang yang tepat.</p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {features.map(({ icon: Icon, number, title, description }) => <article key={number} className="group relative overflow-hidden rounded-[1.75rem] border border-slate-100 bg-[#F8FAFD] p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-100 hover:bg-white hover:shadow-xl hover:shadow-blue-950/5 sm:p-7">
                <div className="flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#E8F0FA] text-[#1C4D8D] transition group-hover:bg-[#1C4D8D] group-hover:text-white"><Icon size={21} /></span><span className="text-xs font-bold tracking-widest text-slate-300">{number}</span></div>
                <h3 className="mt-8 text-lg font-extrabold text-[#102A4C]">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
                <div className="absolute -bottom-12 -right-8 h-28 w-28 rounded-full bg-blue-100/50 blur-2xl transition group-hover:bg-blue-200/70" />
              </article>)}
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#0F294A] px-6 py-12 sm:px-12 sm:py-16">
            <div className="absolute -right-10 -top-40 h-96 w-96 rounded-full border border-white/10" /><div className="absolute -right-1 -top-32 h-96 w-96 rounded-full border border-dashed border-white/10" />
            <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F5B942]">Mulai dari sini</p><h2 className="mt-4 text-3xl font-black leading-tight tracking-[-0.05em] text-white sm:text-5xl">Ruang belajar yang terasa lebih satu.</h2><p className="mt-4 max-w-lg text-sm leading-6 text-blue-100/70">Masuk untuk menemukan ruang yang sesuai dengan peranmu di sekolah.</p></div><Link to="/login" className="group inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-[#F5B942] px-6 py-3.5 text-sm font-bold text-[#102A4C] transition hover:bg-[#f8c65f]">Masuk ke SIAS <ArrowRight size={17} className="transition group-hover:translate-x-1" /></Link></div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-slate-200/80 px-5 py-7 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <div className="flex items-center gap-2 font-bold tracking-[0.16em] text-slate-600"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#1C4D8D] text-[10px] text-white">SI</span>SIAS</div>
        <p>Ruang digital untuk belajar dan bertumbuh bersama.</p>
        <span>© {new Date().getFullYear()} SIAS</span>
      </footer>
    </div>
  );
}
