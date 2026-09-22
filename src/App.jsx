import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './components/AdminLayout';
import DashboardHome from './pages/DashboardHome';
import AdminStudents from './pages/AdminStudents';
import AdminTeachers from './pages/AdminTeachers';
import AdminSubjects from './pages/AdminSubjects';
import AdminClasses from './pages/AdminClasses';
import AdminCalendar from './pages/AdminCalendar';
import AdminAnnouncements from './pages/AdminAnnounchements'; // Sesuai nama file asli kamu

export default function App() {
  const token = localStorage.getItem('token');

  // Jika belum login, arahkan ke halaman Login
  if (!token) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      
      {/* Layout Admin yang membungkus seluruh menu menggunakan <Outlet /> */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<DashboardHome />} />
        <Route path="/admin/students" element={<AdminStudents />} />
        <Route path="/admin/teachers" element={<AdminTeachers />} />
        <Route path="/admin/subjects" element={<AdminSubjects />} />
        <Route path="/admin/classes" element={<AdminClasses />} />
        <Route path="/admin/calendar" element={<AdminCalendar />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
      </Route>

      {/* Jika URL tidak terdaftar, kembalikan ke dashboard */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}