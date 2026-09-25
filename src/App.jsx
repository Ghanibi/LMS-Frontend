import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './components/AdminLayout';
import DashboardHome from './pages/DashboardHome';
import AdminStudents from './pages/AdminStudents';
import AdminTeachers from './pages/AdminTeachers';
import AdminSubjects from './pages/AdminSubjects';
import AdminClasses from './pages/AdminClasses';
import AdminCalendar from './pages/AdminCalendar';
import AdminAnnouncements from './pages/AdminAnnounchements'; // Sesuai nama file asli Anda

// Komponen pembatas untuk mengecek token secara dinamis saat rute diakses
function ProtectedLayout() {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <AdminLayout />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Semua rute admin di bawah ini otomatis dilindungi oleh ProtectedLayout */}
      <Route element={<ProtectedLayout />}>
        <Route path="/admin/dashboard" element={<DashboardHome />} />
        <Route path="/admin/students" element={<AdminStudents />} />
        <Route path="/admin/teachers" element={<AdminTeachers />} />
        <Route path="/admin/subjects" element={<AdminSubjects />} />
        <Route path="/admin/classes" element={<AdminClasses />} />
        <Route path="/admin/calendar" element={<AdminCalendar />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
      </Route>

      {/* Redirect default */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}s