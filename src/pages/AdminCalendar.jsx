import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar as CalendarIcon, Plus, Search, Trash2, Edit, X } from 'lucide-react';

const defaultEvents = [
  { id: 1, title: 'Ujian Tengah Semester (UTS)', date: '2026-10-10', description: 'Pelaksanaan UTS Semester Ganjil', category: 'Akademik' },
  { id: 2, title: 'Libur Nasional Hari Pahlawan', date: '2026-11-10', description: 'Libur kegiatan belajar mengajar', category: 'Libur' }
];

export default function AdminCalendar() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // State Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: '',
    category: 'Akademik'
  });

  const fetchEvents = async () => {
    try {
      const savedEvents = localStorage.getItem('school_calendar_events');
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/calendars', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const resData = response.data;
      let dbData = [];
      if (Array.isArray(resData)) {
        dbData = resData;
      } else if (resData && Array.isArray(resData.data)) {
        dbData = resData.data;
      }

      const combined = dbData.length > 0 ? dbData : defaultEvents;
      setEvents(combined);
      localStorage.setItem('school_calendar_events', JSON.stringify(combined));
      setLoading(false);
    } catch (err) {
      console.error('Gagal mengambil data kalender dari API, menggunakan data lokal:', err);
      const savedEvents = localStorage.getItem('school_calendar_events');
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      } else {
        setEvents(defaultEvents);
        localStorage.setItem('school_calendar_events', JSON.stringify(defaultEvents));
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData({ title: '', date: '', description: '', category: 'Akademik' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ev) => {
    setIsEditMode(true);
    const targetId = ev.ID || ev.id;
    setCurrentId(targetId);
    
    setFormData({
      title: ev.Title || ev.title || '',
      date: ev.Date ? ev.Date.split('T')[0] : (ev.date ? ev.date.split('T')[0] : ''),
      description: ev.Description || ev.description || '',
      category: ev.Category || ev.category || 'Akademik'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        title: formData.title,
        Title: formData.title,
        date: formData.date,
        Date: formData.date,
        description: formData.description,
        Description: formData.description,
        category: formData.category,
        Category: formData.category
      };

      if (isEditMode) {
        const updatedEvents = events.map(ev => {
          const evId = ev.ID || ev.id;
          if (evId === currentId) {
            return { ...ev, title: formData.title, Title: formData.title, date: formData.date, Date: formData.date, description: formData.description, Description: formData.description, category: formData.category, Category: formData.category };
          }
          return ev;
        });
        setEvents(updatedEvents);
        localStorage.setItem('school_calendar_events', JSON.stringify(updatedEvents));

        if (typeof currentId === 'number' || (typeof currentId === 'string' && !currentId.startsWith('default-') && !currentId.startsWith('custom-'))) {
          await axios.put(`http://localhost:8080/api/calendars/${currentId}`, payload, { headers }).catch(() => {});
        }
      } else {
        const newEvent = {
          id: `custom-${Date.now()}`,
          ID: Date.now(),
          title: formData.title,
          Title: formData.title,
          date: formData.date,
          Date: formData.date,
          description: formData.description,
          Description: formData.description,
          category: formData.category,
          Category: formData.category
        };
        const updatedEvents = [newEvent, ...events];
        setEvents(updatedEvents);
        localStorage.setItem('school_calendar_events', JSON.stringify(updatedEvents));

        await axios.post('http://localhost:8080/api/calendars', payload, { headers }).catch(() => {});
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Gagal menyimpan agenda:', err);
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus agenda ini?')) return;
    try {
      const token = localStorage.getItem('token');
      const updatedEvents = events.filter(ev => (ev.ID || ev.id) !== id);
      setEvents(updatedEvents);
      localStorage.setItem('school_calendar_events', JSON.stringify(updatedEvents));

      if (typeof id === 'number' || (typeof id === 'string' && !id.startsWith('default-') && !id.startsWith('custom-'))) {
        await axios.delete(`http://localhost:8080/api/calendars/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Gagal menghapus agenda:', err);
    }
  };

  const filteredEvents = events.filter(ev => {
    const title = ev.Title || ev.title || '';
    const category = ev.Category || ev.category || '';
    return title.toLowerCase().includes(search.toLowerCase()) || category.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Kalender & Agenda</h3>
          <p className="text-xs text-gray-400 mt-0.5">Kelola jadwal kegiatan, ujian, dan hari libur sekolah.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-[#1C4D8D] hover:bg-[#1C4D8D]/90 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition shadow-sm"
        >
          <Plus size={18} /> Tambah Agenda
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Cari kegiatan atau kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1C4D8D]"
            />
          </div>
          <span className="text-xs text-gray-400 font-medium">Total: {filteredEvents.length} Agenda</span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-6 whitespace-nowrap">No</th>
                <th className="py-3 px-6 whitespace-nowrap">Nama Kegiatan</th>
                <th className="py-3 px-6 whitespace-nowrap">Tanggal</th>
                <th className="py-3 px-6 whitespace-nowrap">Kategori</th>
                <th className="py-3 px-6 min-w-[280px]">Deskripsi</th>
                <th className="py-3 px-6 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400">Memuat data kalender...</td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400">Tidak ada agenda kegiatan ditemukan.</td>
                </tr>
              ) : (
                filteredEvents.map((ev, index) => {
                  const evTitle = ev.Title || ev.title || '-';
                  const rawDate = ev.Date || ev.date || '';
                  const evDate = rawDate ? rawDate.split('T')[0] : '-';
                  const evCategory = ev.Category || ev.category || 'Umum';
                  const evDesc = ev.Description || ev.description || '-';

                  return (
                    <tr key={ev.ID || ev.id || index} className="hover:bg-gray-50/50 transition">
                      <td className="py-3.5 px-6 font-medium text-gray-400 whitespace-nowrap">{index + 1}</td>
                      <td className="py-3.5 px-6 font-bold text-gray-800 whitespace-nowrap">{evTitle}</td>
                      <td className="py-3.5 px-6 text-gray-500 whitespace-nowrap">{evDate}</td>
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md font-semibold text-[10px] ${
                          evCategory === 'Akademik' ? 'bg-blue-50 text-blue-600' :
                          evCategory === 'Libur' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                        }`}>
                          {evCategory}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-gray-600 break-words">{evDesc}</td>
                      <td className="py-3.5 px-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleOpenEdit(ev)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition" 
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(ev.ID || ev.id)}
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

      {/* Modal Tambah / Edit Agenda */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h4 className="font-bold text-gray-800 text-base">
                {isEditMode ? 'Edit Agenda Kegiatan' : 'Tambah Agenda Baru'}
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Kegiatan</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Ujian Tengah Semester"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D] bg-white"
                  >
                    <option value="Akademik">Akademik</option>
                    <option value="Libur">Libur</option>
                    <option value="Kegiatan Sekolah">Kegiatan Sekolah</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Deskripsi</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Keterangan lengkap kegiatan..."
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D]"
                />
              </div>

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
                  {isEditMode ? 'Simpan Perubahan' : 'Tambah Agenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}