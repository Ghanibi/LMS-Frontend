import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.tsx';
import AdminLayout from './components/AdminLayout.jsx';
import TeacherLayout from './components/TeacherLayout.jsx';
import DashboardHome from './pages/DashboardHome.tsx';
import AdminStudents from './pages/AdminStudents.tsx';
import AdminTeachers from './pages/AdminTeachers.tsx';
import AdminSubjects from './pages/AdminSubjects.tsx';
import AdminClasses from './pages/AdminClasses.tsx';
import AdminCalendar from './pages/AdminCalendar.tsx';
import AdminAnnouncements from './pages/AdminAnnounchements.tsx';
import TeacherDashboard from './pages/Teacher/TeacherDashboard.tsx';
import TeacherMaterials from './pages/Teacher/TeacherMaterials.tsx';
import TeacherAssignments from './pages/Teacher/TeacherAssignments.tsx';
import ClassroomPage from './pages/ClassroomPage.tsx';
import LandingPage from './pages/LandingPage.jsx';

function getSession() {
  const token = localStorage.getItem('token');
  let role = null;

  try {
    role = JSON.parse(localStorage.getItem('user') || 'null')?.Role;
  } catch {
    role = null;
  }

  return { token, role };
}

function ProtectedAdminLayout() {
  const { token, role } = getSession();
  if (!token || role !== 'ADMIN') return <Navigate to="/login" replace />;
  return <AdminLayout />;
}

function ProtectedTeacherLayout() {
  const { token, role } = getSession();
  if (!token || role !== 'TEACHER') return <Navigate to="/login" replace />;
  return <TeacherLayout />;
}

function ProtectedStudentClassroom() {
  const { token, role } = getSession();
  if (!token || (role !== 'STUDENT' && role !== 'SISWA')) return <Navigate to="/login" replace />;
  return <ClassroomPage />;
}

function DefaultRedirect() {
  const { token, role } = getSession();
  if (!token) return <Navigate to="/login" replace />;
  if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />;
  if (role === 'STUDENT' || role === 'SISWA') return <Navigate to="/student/dashboard" replace />;
  if (role === 'CURRICULUM' || role === 'KURIKULUM') return <Navigate to="/curriculum/dashboard" replace />;
  if (role === 'PRINCIPAL' || role === 'KEPSEK' || role === 'KEPALA_SEKOLAH') {
    return <Navigate to="/principal/dashboard" replace />;
  }
  return <Navigate to="/login" replace />;
}

function HomeRoute() {
  const { token } = getSession();
  return token ? <DefaultRedirect /> : <LandingPage />;
}

function RolePortal({ roles, title, description }) {
  const { token, role } = getSession();
  if (!token || !roles.includes(role)) return <Navigate to="/login" replace />;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <section className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-indigo-600">LMS SMK</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-800">{title}</h1>
        <p className="mt-3 text-gray-600">{description}</p>
        <p className="mt-4 text-sm text-gray-500">Login sebagai: {role}</p>
        <button
          type="button"
          onClick={() => {
            localStorage.clear();
            window.location.assign('/login');
          }}
          className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Keluar
        </button>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedAdminLayout />}>
        <Route path="/admin/dashboard" element={<DashboardHome />} />
        <Route path="/admin/students" element={<AdminStudents />} />
        <Route path="/admin/teachers" element={<AdminTeachers />} />
        <Route path="/admin/subjects" element={<AdminSubjects />} />
        <Route path="/admin/classes" element={<AdminClasses />} />
        <Route path="/admin/calendar" element={<AdminCalendar />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
      </Route>

      <Route element={<ProtectedTeacherLayout />}>
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/classroom" element={<ClassroomPage />} />
        <Route path="/teacher/materials" element={<TeacherMaterials />} />
        <Route path="/teacher/assignments" element={<TeacherAssignments />} />
      </Route>

      <Route
        path="/student/dashboard"
        element={<ProtectedStudentClassroom />}
      />
      <Route
        path="/curriculum/dashboard"
        element={
          <RolePortal
            roles={['CURRICULUM', 'KURIKULUM']}
            title="Portal Kurikulum"
            description="Login kurikulum berhasil. Halaman fitur kurikulum belum tersedia."
          />
        }
      />
      <Route
        path="/principal/dashboard"
        element={
          <RolePortal
            roles={['PRINCIPAL', 'KEPSEK', 'KEPALA_SEKOLAH']}
            title="Portal Kepala Sekolah"
            description="Login kepala sekolah berhasil. Halaman fitur kepala sekolah belum tersedia."
          />
        }
      />

      <Route path="/" element={<HomeRoute />} />
      <Route path="*" element={<DefaultRedirect />} />
    </Routes>
  );
}
