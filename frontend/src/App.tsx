import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { StudentDashboard } from './pages/StudentDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { ParentDashboard } from './pages/ParentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AITutorPage } from './pages/AITutorPage';
import { CoursesPage } from './pages/CoursesPage';
import { QuizPage } from './pages/QuizPage';

// Protectors
const ProtectedLayout: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

const DashboardRedirector: React.FC = () => {
  const { user } = useAuthStore();
  
  if (user?.role === 'student') return <StudentDashboard />;
  if (user?.role === 'teacher') return <TeacherDashboard />;
  if (user?.role === 'parent') return <ParentDashboard />;
  if (user?.role === 'admin') return <AdminDashboard />;
  
  return <Navigate to="/login" replace />;
};

const TeacherRoute: React.FC = () => {
  const { user } = useAuthStore();
  if (user?.role !== 'teacher' && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

const AdminRoute: React.FC = () => {
  const { user } = useAuthStore();
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

function App() {
  const { refreshMe } = useAuthStore();

  useEffect(() => {
    // Refresh user profile details at startup to keep session active
    refreshMe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Guarded Routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardRedirector />} />
          <Route path="/ai-tutor" element={<AITutorPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/quizzes" element={<QuizPage />} />
          
          {/* Teacher Specific */}
          <Route element={<TeacherRoute />}>
            <Route path="/lesson-plans" element={<TeacherDashboard />} />
          </Route>

          {/* Admin Specific */}
          <Route element={<AdminRoute />}>
            <Route path="/users" element={<AdminDashboard />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
