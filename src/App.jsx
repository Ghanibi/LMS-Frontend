import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.tsx';
import AdminLayout from './components/AdminLayout.jsx';
import TeacherLayout from './components/TeacherLayout.jsx';
import StudentLayout from './components/StudentLayout.jsx';
import DashboardHome from './pages/DashboardHome.tsx';
import AdminStudents from './pages/AdminStudents.tsx';
import AdminTeachers from './pages/AdminTeachers.tsx';
import AdminSubjects from './pages/AdminSubjects.tsx';
import AdminClasses from './pages/AdminClasses.tsx';
import AdminCalendar from './pages/AdminCalendar.tsx';
import AdminAnnouncements from './pages/AdminAnnounchements.tsx';
import AdminLeadershipAccounts from './pages/AdminLeadershipAccounts.tsx';
import TeacherDashboard from './pages/Teacher/TeacherDashboard.tsx';
import TeacherMaterials from './pages/Teacher/TeacherMaterials.tsx';
import TeacherAssignments from './pages/Teacher/TeacherAssignments.tsx';
import ClassroomPage from './pages/ClassroomPage.tsx';
import LandingPage from './pages/LandingPage.jsx';
import StudentDashboard from './pages/Student/StudentDashboard.tsx';
import StudentMaterials from './pages/Student/StudentMaterials.tsx';
import StudentAssignments from './pages/Student/StudentAssignments.tsx';
import StudentGrades from './pages/Student/StudentGrades.tsx';
import StudentTimetable from './pages/Student/StudentTimetable.tsx';
import LeadershipLayout from './components/LeadershipLayout.jsx';
import LeadershipDashboard from './pages/Leadership/LeadershipDashboard.tsx';
import CurriculumPlan from './pages/Leadership/CurriculumPlan.tsx';
import CurriculumLearning from './pages/Leadership/CurriculumLearning.tsx';
import LeadershipCalendar from './pages/Leadership/LeadershipCalendar.tsx';
import PrincipalClasses from './pages/Leadership/PrincipalClasses.tsx';
import AdminSuperAdminBootstrap from './pages/AdminSuperAdminBootstrap.tsx';
import SuperAdminAccounts from './pages/SuperAdminAccounts.tsx';

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
  if (!token || (role !== 'ADMIN' && role !== 'SUPER_ADMIN')) return <Navigate to="/login" replace />;
  return <AdminLayout />;
}

function AdminOnly({ children }) {
  const { role } = getSession();
  return role === 'ADMIN' ? children : <Navigate to="/super-admin/dashboard" replace />;
}

function SuperAdminOnly({ children }) {
  const { role } = getSession();
  return role === 'SUPER_ADMIN' ? children : <Navigate to="/admin/dashboard" replace />;
}

function ProtectedTeacherLayout() {
  const { token, role } = getSession();
  if (!token || role !== 'TEACHER') return <Navigate to="/login" replace />;
  return <TeacherLayout />;
}

function ProtectedStudentLayout() {
  const { token, role } = getSession();
  if (!token || (role !== 'STUDENT' && role !== 'SISWA')) return <Navigate to="/login" replace />;
  return <StudentLayout />;
}

function ProtectedLeadershipLayout() {
  const { token, role } = getSession();
  const curriculumRoles = ['CURRICULUM', 'KURIKULUM'];
  const principalRoles = ['PRINCIPAL', 'KEPSEK', 'KEPALA_SEKOLAH'];
  if (!token || (!curriculumRoles.includes(role) && !principalRoles.includes(role))) return <Navigate to="/login" replace />;
  return <LeadershipLayout />;
}

function DefaultRedirect() {
  const { token, role } = getSession();
  if (!token) return <Navigate to="/login" replace />;
  if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'SUPER_ADMIN') return <Navigate to="/super-admin/dashboard" replace />;
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

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedAdminLayout />}>
        <Route path="/admin/dashboard" element={<DashboardHome />} />
        <Route path="/admin/students" element={<AdminStudents />} />
        <Route path="/admin/teachers" element={<AdminTeachers />} />
        <Route path="/admin/leadership-accounts" element={<AdminLeadershipAccounts />} />
        <Route path="/admin/super-admin" element={<AdminOnly><AdminSuperAdminBootstrap /></AdminOnly>} />
        <Route path="/admin/subjects" element={<AdminSubjects />} />
        <Route path="/admin/classes" element={<AdminClasses />} />
        <Route path="/admin/calendar" element={<AdminCalendar />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
        <Route path="/super-admin/dashboard" element={<SuperAdminOnly><DashboardHome /></SuperAdminOnly>} />
        <Route path="/super-admin/accounts" element={<SuperAdminOnly><SuperAdminAccounts /></SuperAdminOnly>} />
      </Route>

      <Route element={<ProtectedTeacherLayout />}>
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/classroom" element={<ClassroomPage />} />
        <Route path="/teacher/materials" element={<TeacherMaterials />} />
        <Route path="/teacher/assignments" element={<TeacherAssignments />} />
      </Route>

      <Route element={<ProtectedStudentLayout />}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/materials" element={<StudentMaterials />} />
        <Route path="/student/assignments" element={<StudentAssignments />} />
        <Route path="/student/grades" element={<StudentGrades />} />
        <Route path="/student/timetable" element={<StudentTimetable />} />
        <Route path="/student/classroom" element={<ClassroomPage />} />
        <Route path="/student/*" element={<Navigate to="/student/dashboard" replace />} />
      </Route>
      <Route element={<ProtectedLeadershipLayout />}>
        <Route path="/curriculum/dashboard" element={<LeadershipDashboard mode="curriculum" />} />
        <Route path="/curriculum/plan" element={<CurriculumPlan />} />
        <Route path="/curriculum/learning" element={<CurriculumLearning />} />
        <Route path="/curriculum/calendar" element={<LeadershipCalendar mode="curriculum" />} />
        <Route path="/curriculum/*" element={<Navigate to="/curriculum/dashboard" replace />} />
        <Route path="/principal/dashboard" element={<LeadershipDashboard mode="principal" />} />
        <Route path="/principal/classes" element={<PrincipalClasses />} />
        <Route path="/principal/calendar" element={<LeadershipCalendar mode="principal" />} />
        <Route path="/principal/*" element={<Navigate to="/principal/dashboard" replace />} />
      </Route>

      <Route path="/" element={<HomeRoute />} />
      <Route path="*" element={<DefaultRedirect />} />
    </Routes>
  );
}
