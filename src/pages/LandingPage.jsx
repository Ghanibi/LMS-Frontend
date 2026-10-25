import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown, ArrowRight, ArrowUpRight, BookOpen, CalendarDays,
  Camera, Check, CheckCircle2, Clock3, Database, GraduationCap,
  LayoutDashboard, MapPin, Megaphone, Menu, MessageCircle, Phone,
  ShieldCheck, Sparkles, Users, X, Globe,
} from 'lucide-react';

const audiences = [
  { id: 'siswa', label: 'Siswa', icon: GraduationCap, greeting: 'Belajar jadi lebih terarah.', detail: 'Materi, tugas, dan kabar kelas ada di satu tempat.', tag: 'RUANG SISWA', metric: '12', metricLabel: 'materi tersedia', activity: 'Tugas Basis Data', activityMeta: 'Dikumpulkan · 2 hari lagi', color: '#A7F3D0' },
  { id: 'guru', label: 'Guru', icon: BookOpen, greeting: 'Mengajar, lebih terhubung.', detail: 'Kelola kelas, bagikan materi, dan dampingi murid.', tag: 'RUANG GURU', metric: '08', metricLabel: 'kelas aktif', activity: 'Diskusi Kelas 12 PPLG 2', activityMeta: '3 balasan baru', color: '#BFDBFE' },
  { id: 'kurikulum', label: 'Kurikulum', icon: CalendarDays, greeting: 'Rencana sekolah terlihat jelas.', detail: 'Pantau agenda, mata pelajaran, dan kegiatan belajar.', tag: 'RUANG KURIKULUM', metric: '24', metricLabel: 'agenda semester', activity: 'Evaluasi tengah semester', activityMeta: 'Terjadwal · 14 Oktober', color: '#FDE68A' },
  { id: 'pimpinan', label: 'Pimpinan', icon: ShieldCheck, greeting: 'Lihat sekolah dari satu pandangan.', detail: 'Informasi penting membantu keputusan lebih cepat.', tag: 'RUANG PIMPINAN', metric: '96%', metricLabel: 'aktivitas terpantau', activity: 'Ringkasan pembelajaran', activityMeta: 'Diperbarui hari ini', color: '#DDD6FE' },
];

const features = [
  { icon: BookOpen, number: '01', title: 'Materi & tugas', description: 'Guru membagikan bahan belajar dan tugas sesuai mata pelajaran. Siswa melihat instruksi dan tenggat dari ruang belajarnya.' },
  { icon: Users, number: '02', title: 'Kelas & wali kelas', description: 'Wali kelas melihat daftar siswa, menyampaikan pengumuman khusus, dan menjaga percakapan kelas tetap terarah.' },
  { icon: CheckCircle2, number: '03', title: 'Presensi harian', description: 'Wali kelas mencatat status hadir, izin, sakit, atau alpa. Siswa dapat melihat catatan kehadirannya sendiri.' },
  { icon: Megaphone, number: '04', title: 'Pengumuman sekolah', description: 'Informasi sekolah dan kabar khusus kelas tersimpan terpisah agar pengumuman sampai ke audiens yang tepat.' },
  { icon: CalendarDays, number: '05', title: 'Agenda kelas', description: 'Kegiatan kelas tersusun dengan tanggal dan keterangan, sehingga siswa dan guru mudah mengecek rencana.' },
  { icon: MessageCircle, number: '06', title: 'Diskusi & pembinaan', description: 'Siswa dan guru dapat berdiskusi di ruang kelas. Catatan pembinaan dibuat privat untuk wali kelas dan admin.' },
];

const quickFeatures = [
  { icon: BookOpen, label: 'Materi & tugas' },
  { icon: CheckCircle2, label: 'Presensi kelas' },
  { icon: Megaphone, label: 'Pengumuman' },
  { icon: CalendarDays, label: 'Agenda' },
  { icon: MessageCircle, label: 'Diskusi' },
  { icon: Database, label: 'Data terhubung' },
];

const steps = [
  { number: '01', label: 'MULAI', icon: LayoutDashboard, title: 'Login ke ruang sekolah', detail: 'Masuk menggunakan akun yang diberikan sekolah. SIAS akan membuka halaman sesuai peranmu.' },
  { number: '02', label: 'TEMUKAN', icon: Users, title: 'Pilih kelas dan aktivitas', detail: 'Buka materi, tugas, presensi, agenda, atau pengumuman yang berkaitan dengan kelasmu.' },
  { number: '03', label: 'BERPARTISIPASI', icon: MessageCircle, title: 'Belajar dan berkomunikasi', detail: 'Kumpulkan tugas, ikuti diskusi, atau bagikan informasi kepada anggota kelas.' },
  { number: '04', label: 'PANTAU', icon: Clock3, title: 'Lihat perkembangan', detail: 'Informasi akademik tertata sehingga siswa, guru, dan sekolah bisa mengikuti kegiatan dengan lebih mudah.' },
];

export default function LandingPage() {
  const [activeAudience, setActiveAudience] = useState(audiences[0]);
  const [menuOpen, setMenuOpen] = useState(false);
  const ActiveIcon = activeAudience.icon;

  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -35px 0px' });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-[#F7F9FC] font-sans text-[#102A4C] selection:bg-blue-200">
      <header className="sias-intro relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link to="/" className="flex items-center gap-3" aria-label="SIAS beranda">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#1C4D8D] text-sm font-black tracking-tight text-white shadow-lg shadow-blue-900/15">SI</span>
          <span><span className="block text-sm font-extrabold tracking-[0.14em]">SIAS</span><span className="block text-[10px] font-medium tracking-wide text-slate-500">SMK Citra Negara · Depok</span></span>
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

      <div className="sias-intro sias-intro-delay mx-auto grid max-w-7xl grid-cols-2 gap-2 px-5 pb-2 sm:grid-cols-3 sm:px-8 lg:grid-cols-6 lg:px-12" aria-label="Fitur SIAS">
        {quickFeatures.map(({ icon: Icon, label }) => <a key={label} href="#fitur" className="group flex items-center gap-2 rounded-xl border border-blue-100/80 bg-white/75 px-3 py-2.5 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-[#1C4D8D]/30 hover:text-[#1C4D8D] sm:px-3.5 sm:text-xs"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#E8F0FA] text-[#1C4D8D] transition group-hover:bg-[#1C4D8D] group-hover:text-white"><Icon size={14} /></span>{label}</a>)}
      </div>

      <main>
        <section id="tentang" className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-12 sm:px-8 sm:pb-28 sm:pt-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8 lg:px-12 lg:pb-32 lg:pt-20">
          <div className="pointer-events-none absolute -left-48 top-12 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />
          <div data-reveal className="sias-reveal relative z-10 max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3.5 py-2 text-xs font-semibold text-[#1C4D8D] shadow-sm">
              <Sparkles size={14} /> Satu ruang untuk seluruh ekosistem sekolah
            </div>
            <h1 className="text-[clamp(3.2rem,7.4vw,6.5rem)] font-black leading-[0.96] tracking-[-0.075em] text-[#0F294A]">
              Sekolah maju,<br /><span className="relative inline-block text-[#2C69AC]">bersama-.<span className="absolute -bottom-1 left-1 h-2 w-[94%] -rotate-2 rounded-full bg-[#F5B942]/80" /></span>
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

          <div id="ekosistem" data-reveal className="sias-reveal sias-reveal-right relative mx-auto w-full max-w-[610px] lg:ml-auto">
            <div className="sias-orbit absolute -right-10 -top-12 h-52 w-52 rounded-full border border-blue-200/80" />
            <div className="sias-orbit-reverse absolute -right-4 -top-6 h-52 w-52 rounded-full border border-dashed border-blue-300/70" />
            <div className="sias-glow absolute -bottom-12 -left-10 h-48 w-48 rounded-full bg-[#F5B942]/20 blur-2xl" />

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

            <div className="sias-float absolute -left-8 top-[20%] hidden items-center gap-2 rounded-2xl border border-white bg-white px-3 py-2.5 text-xs font-semibold text-[#102A4C] shadow-xl shadow-blue-950/10 sm:flex"><span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-100 text-emerald-700"><Check size={15} /></span>Belajar lebih tertata</div>
            <div className="sias-float-delayed absolute -right-5 bottom-[22%] hidden items-center gap-2 rounded-2xl border border-white bg-white px-3 py-2.5 text-xs font-semibold text-[#102A4C] shadow-xl shadow-blue-950/10 sm:flex"><span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-100 text-amber-700"><CalendarDays size={15} /></span>Semua agenda terlihat</div>
          </div>
        </section>

        <section id="fitur" className="relative bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-end">
              <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2C69AC]">Belajar, terhubung, berkembang</p><h2 className="mt-4 max-w-lg text-4xl font-black leading-tight tracking-[-0.055em] text-[#0F294A] sm:text-5xl">Hal penting sekolah, <span className="text-[#2C69AC]">lebih dekat.</span></h2></div>
              <p className="max-w-xl text-sm leading-7 text-slate-500 md:justify-self-end md:text-base">Dari tugas pertama hari ini sampai agenda sekolah berikutnya—SIAS membuat informasi akademik mudah ditemukan oleh orang yang tepat.</p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, number, title, description }, featureIndex) => <article data-reveal key={number} style={{ transitionDelay: `${(featureIndex % 3) * 90}ms` }} className="sias-reveal group relative overflow-hidden rounded-[1.75rem] border border-slate-100 bg-[#F8FAFD] p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-100 hover:bg-white hover:shadow-xl hover:shadow-blue-950/5 sm:p-7">
                <div className="flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#E8F0FA] text-[#1C4D8D] transition group-hover:bg-[#1C4D8D] group-hover:text-white"><Icon size={21} /></span><span className="text-xs font-bold tracking-widest text-slate-300">{number}</span></div>
                <h3 className="mt-8 text-lg font-extrabold text-[#102A4C]">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
                <div className="absolute -bottom-12 -right-8 h-28 w-28 rounded-full bg-blue-100/50 blur-2xl transition group-hover:bg-blue-200/70" />
              </article>)}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-white py-20 text-[#102A4C] sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20 lg:px-12">
            <div data-reveal className="sias-reveal self-center lg:sticky lg:top-24 lg:self-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#1C4D8D]"><Sparkles size={13} /> Cara kerja SIAS</span>
              <h2 className="mt-5 text-4xl font-black leading-[1.04] tracking-[-0.06em] text-[#102A4C] sm:text-5xl">Dari login sampai kegiatan kelas, <span className="text-[#1C4D8D]">semuanya tersambung.</span></h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-slate-600">Setiap peran punya ruang yang sesuai. Informasi belajar dan kegiatan kelas lebih mudah ditemukan tanpa berpindah-pindah.</p>
              <Link to="/login" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#1C4D8D] transition hover:gap-3">Lihat ruangmu <ArrowRight size={16} /></Link>
            </div>
            <div className="relative">
              <div className="absolute bottom-8 left-[25px] top-8 w-px bg-gradient-to-b from-transparent via-blue-200 to-transparent sm:left-[31px]" />
              <div className="space-y-3">
                {steps.map(({ number, label, icon: Icon, title, detail }, stepIndex) => <article data-reveal key={number} style={{ transitionDelay: `${stepIndex * 100}ms` }} className="sias-reveal group relative grid grid-cols-[52px_1fr] gap-4 rounded-2xl p-3 transition-colors duration-300 hover:bg-[#0F294A] hover:text-white hover:shadow-lg hover:shadow-blue-950/10 focus-within:bg-[#0F294A] focus-within:text-white sm:grid-cols-[64px_1fr] sm:gap-5 sm:p-4">
                  <span className="relative z-10 grid h-[52px] w-[52px] place-items-center rounded-full border border-blue-200 bg-white text-[#1C4D8D] shadow-[0_0_0_5px_rgba(255,255,255,0.92)] transition-colors duration-300 group-hover:border-blue-300 group-hover:bg-[#1C4D8D] group-hover:text-white group-hover:shadow-[0_0_0_5px_rgba(15,41,74,0.9)] group-focus-within:border-blue-300 group-focus-within:bg-[#1C4D8D] group-focus-within:text-white sm:h-16 sm:w-16"><Icon size={20} /></span>
                  <div className="border-b border-blue-100 pb-5 pt-1 transition-colors duration-300 group-hover:border-white/20 group-focus-within:border-white/20 sm:pb-6"><p className="text-[10px] font-extrabold tracking-[0.2em] text-[#1C4D8D] transition-colors group-hover:text-blue-200 group-focus-within:text-blue-200">{number} <span className="mx-1 text-slate-300 group-hover:text-white/40 group-focus-within:text-white/40">/</span> {label}</p><h3 className="mt-2 text-lg font-extrabold text-[#102A4C] transition-colors group-hover:text-white group-focus-within:text-white sm:text-xl">{title}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 transition-colors group-hover:text-blue-100/80 group-focus-within:text-blue-100/80">{detail}</p></div>
                </article>)}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#0F294A] py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <div data-reveal className="sias-reveal mx-auto max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F5B942]">Satu ekosistem sekolah</p><h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">Dibangun untuk kebutuhan belajar bersama.</h2><p className="mt-3 text-sm leading-6 text-blue-100/65">Ruang dan informasi disesuaikan dengan tanggung jawab masing-masing peran.</p></div>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { value: '4', label: 'Peran terhubung', text: 'Siswa · Guru · Kurikulum · Pimpinan' },
                { value: '1', label: 'Ruang akademik', text: 'Belajar dan pengelolaan kelas dalam satu platform' },
                { value: 'Sesuai peran', label: 'Akses informasi', text: 'Setiap pengguna masuk ke area kerjanya' },
                { value: 'Terarah', label: 'Komunikasi kelas', text: 'Pengumuman dan diskusi khusus kelas' },
              ].map((item, index) => <article data-reveal key={item.label} style={{ transitionDelay: `${index * 80}ms` }} className="sias-reveal rounded-2xl border border-white/10 bg-white/[0.055] p-5 transition hover:-translate-y-1 hover:bg-white/10"><p className="text-2xl font-black tracking-tight text-white sm:text-3xl">{item.value}</p><h3 className="mt-2 text-sm font-bold text-[#F5B942]">{item.label}</h3><p className="mt-2 text-xs leading-5 text-blue-100/60">{item.text}</p></article>)}
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

      <footer className="bg-[#0B2039] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.2fr_0.8fr_1fr] md:gap-12 lg:px-12 lg:py-16">
          <div>
            <Link to="/" className="inline-flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#1C4D8D] text-sm font-black text-white">SI</span><span><span className="block text-sm font-extrabold tracking-[0.14em]">SIAS</span><span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-blue-200/60">SMK Citra Negara</span></span></Link>
            <p className="mt-5 max-w-sm text-sm leading-6 text-blue-100/65">Sistem Informasi Akademik Sekolah untuk membantu kegiatan belajar dan pengelolaan kelas berjalan lebih tertata, terhubung, dan mudah diikuti.</p>
            <p className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-blue-100/50"><MapPin size={14} /> Jl. Tanah Baru No.99, Kecamatan Beji, Kota Depok, Jawa Barat</p>
          </div>

          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#F5B942]">Jelajahi</h2>
            <div className="mt-5 flex flex-col items-start gap-3 text-sm text-blue-100/65">
              <a href="#tentang" className="transition hover:translate-x-1 hover:text-white">Tentang SIAS</a>
              <a href="#fitur" className="transition hover:translate-x-1 hover:text-white">Fitur platform</a>
              <a href="#ekosistem" className="transition hover:translate-x-1 hover:text-white">Ekosistem sekolah</a>
              <Link to="/login" className="transition hover:translate-x-1 hover:text-white">Login pengguna <ArrowUpRight size={13} className="ml-1 inline" /></Link>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#F5B942]">Hubungi sekolah</h2>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <a href="https://www.instagram.com/smkcitranegaradepok/" target="_blank" rel="noreferrer" aria-label="Instagram SMK Citra Negara" title="Instagram" className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-blue-100 transition hover:-translate-y-1 hover:border-[#F5B942]/50 hover:bg-[#1C4D8D]"><Camera size={18} /></a>
              <a href="https://smk.citranegara.sch.id/" target="_blank" rel="noreferrer" aria-label="Website SMK Citra Negara" title="Website sekolah" className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-blue-100 transition hover:-translate-y-1 hover:border-[#F5B942]/50 hover:bg-[#1C4D8D]"><Globe size={18} /></a>
              <a href="tel:+622177201052" aria-label="Telepon sekolah +62 21 7720 1052" title="+62 21 7720 1052" className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-blue-100 transition hover:-translate-y-1 hover:border-[#F5B942]/50 hover:bg-[#1C4D8D]"><Phone size={18} /></a>
              <a href="https://api.whatsapp.com/send/?phone=6281325269477&text&type=phone_number&app_absent=0" target="_blank" rel="noreferrer" aria-label="WhatsApp sekolah" title="WhatsApp sekolah" className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-blue-100 transition hover:-translate-y-1 hover:border-[#F5B942]/50 hover:bg-[#1C4D8D]"><MessageCircle size={18} /></a>
            </div>
            <p className="mt-4 text-sm text-blue-100/65">Telepon <a href="tel:+622177201052" className="font-semibold text-white transition hover:text-[#F5B942]">+62 21 7720 1052</a></p>
            <p className="mt-2 text-xs leading-5 text-blue-100/45">Punya pertanyaan? Hubungi kami melalui kanal resmi sekolah.</p>
          </div>
        </div>
        <div className="border-t border-white/10 px-5 py-5 text-center sm:px-8">
          <p className="text-[11px] leading-5 text-blue-100/45">© 2026 SIAS — Fabian Nanday Ghanian. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
