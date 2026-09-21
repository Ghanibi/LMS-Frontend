import React, { useState } from 'react';
import Login from './pages/Login';
import AdminLayout from './components/AdminLayout';
import DashboardHome from './pages/DashboardHome';
import AdminStudents from './pages/AdminStudents';
import AdminTeachers from './pages/AdminTeachers';
import AdminSubjects from './pages/AdminSubjects';
import AdminClasses from './pages/AdminClasses';
import AdminCalendar from './pages/AdminCalendar';
import AdminAnnouncements from './pages/AdminAnnounchements'; // Sesuaikan dengan nama file asli Anda

export default function App() {
  const token = localStorage.getItem('token');
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  if (!token) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeMenu) {
      case 'Dashboard':
        return <DashboardHome />;
      case 'Manajemen Siswa':
        return <AdminStudents />;
      case 'Manajemen Guru':
        return <AdminTeachers />;
      case 'Daftar Mata Pelajaran':
        return <AdminSubjects />;
      case 'Manajemen Kelas':
        return <AdminClasses />;
      case 'Kalender':
        return <AdminCalendar />;
      case 'Pengumuman':
        return <AdminAnnouncements />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <AdminLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
      {renderContent()}
    </AdminLayout>
  );
}