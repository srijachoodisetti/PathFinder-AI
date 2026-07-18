import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Pages Lazy Load
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Signup = lazy(() => import('./pages/Signup').then(m => ({ default: m.Signup })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const FacultyDashboard = lazy(() => import('./pages/FacultyDashboard').then(m => ({ default: m.FacultyDashboard })));
const ParentDashboard = lazy(() => import('./pages/ParentDashboard').then(m => ({ default: m.ParentDashboard })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AITutorPage = lazy(() => import('./pages/AITutorPage').then(m => ({ default: m.AITutorPage })));
const AcademicLearning = lazy(() => import('./pages/AcademicLearning').then(m => ({ default: m.AcademicLearning })));
const FreeVideos = lazy(() => import('./pages/FreeVideos').then(m => ({ default: m.FreeVideos })));
const PlacementPrep = lazy(() => import('./pages/PlacementPrep').then(m => ({ default: m.PlacementPrep })));
const CodingHub = lazy(() => import('./pages/CodingHub').then(m => ({ default: m.CodingHub })));
const ProjectHub = lazy(() => import('./pages/ProjectHub').then(m => ({ default: m.ProjectHub })));
const CareerHub = lazy(() => import('./pages/CareerHub').then(m => ({ default: m.CareerHub })));
const InternshipHub = lazy(() => import('./pages/InternshipHub').then(m => ({ default: m.InternshipHub })));
const CertificationsPage = lazy(() => import('./pages/CertificationsPage').then(m => ({ default: m.CertificationsPage })));
const QuizPage = lazy(() => import('./pages/QuizPage').then(m => ({ default: m.QuizPage })));
const ExamCenter = lazy(() => import('./pages/ExamCenter').then(m => ({ default: m.ExamCenter })));
const OnlineExam = lazy(() => import('./pages/OnlineExam').then(m => ({ default: m.OnlineExam })));
const ResultReview = lazy(() => import('./pages/ResultReview').then(m => ({ default: m.ResultReview })));
const ExamBuilder = lazy(() => import('./pages/ExamBuilder').then(m => ({ default: m.ExamBuilder })));
const DiscussionForum = lazy(() => import('./pages/DiscussionForum').then(m => ({ default: m.DiscussionForum })));
const StudyGroups = lazy(() => import('./pages/StudyGroups').then(m => ({ default: m.StudyGroups })));
const CampusHub = lazy(() => import('./pages/CampusHub').then(m => ({ default: m.CampusHub })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const CareerDashboard = lazy(() => import('./pages/CareerDashboard').then(m => ({ default: m.CareerDashboard })));

// ── Full-screen auth loading spinner ─────────────────────────────────────────
const AuthLoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-[#F4F7FC] flex items-center justify-center flex-col gap-4">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    <p className="text-slate-500 font-semibold text-sm">Verifying your session...</p>
  </div>
);

// ── Root redirect — authenticated → /dashboard, unauthenticated → /login ─────
const RootRedirect: React.FC = () => {
  const { isAuthenticated, isInitializing } = useAuthStore();
  if (isInitializing) return <AuthLoadingScreen />;
  return isAuthenticated
    ? <Navigate to="/dashboard" replace />
    : <Navigate to="/login" replace />;
};

// ── Protected layout — blocks ALL private routes until auth is resolved ───────
const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, isInitializing } = useAuthStore();

  // While Firebase / backend token is being verified, show spinner
  if (isInitializing) return <AuthLoadingScreen />;

  // Not authenticated after init → redirect to login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

// ── Redirect authenticated users away from login/signup pages ────────────────
const PublicOnlyRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated, isInitializing } = useAuthStore();
  if (isInitializing) return <AuthLoadingScreen />;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : element;
};

// ── Role-based dashboard redirect ────────────────────────────────────────────
const DashboardRedirector: React.FC = () => {
  const { user } = useAuthStore();
  if (user?.role === 'student') return <StudentDashboard />;
  if (user?.role === 'teacher') return <FacultyDashboard />;
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
  const { refreshMe, setInitializing } = useAuthStore();

  useEffect(() => {
    // Kick off token validation. isInitializing stays true until this resolves,
    // preventing any protected (or public-only) page from rendering prematurely.
    refreshMe().finally(() => setInitializing(false));
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<AuthLoadingScreen />}>
        <Routes>
          {/* Root — smart redirect depending on auth state */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public Routes — redirect to dashboard if already logged in */}
          <Route path="/login" element={<PublicOnlyRoute element={<Login />} />} />
          <Route path="/signup" element={<PublicOnlyRoute element={<Signup />} />} />
          <Route path="/forgot-password" element={<PublicOnlyRoute element={<ForgotPassword />} />} />

          {/* Landing page (marketing) — always accessible */}
          <Route path="/welcome" element={<LandingPage />} />

          {/* Guarded Routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<DashboardRedirector />} />
            <Route path="/ai-tutor" element={<AITutorPage />} />
            <Route path="/academic" element={<AcademicLearning />} />
            <Route path="/videos" element={<FreeVideos />} />
            <Route path="/placement" element={<PlacementPrep />} />
            <Route path="/coding" element={<CodingHub />} />
            <Route path="/projects" element={<ProjectHub />} />
            <Route path="/career" element={<CareerHub />} />
            <Route path="/internships" element={<InternshipHub />} />
            <Route path="/certifications" element={<CertificationsPage />} />
            <Route path="/quizzes" element={<QuizPage />} />
            <Route path="/exams" element={<ExamCenter />} />
            <Route path="/exam/:examId" element={<OnlineExam />} />
            <Route path="/exam/result/:resultId" element={<ResultReview />} />
            <Route path="/forum" element={<DiscussionForum />} />
            <Route path="/groups" element={<StudyGroups />} />
            <Route path="/campus" element={<CampusHub />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/career-dashboard" element={<CareerDashboard />} />

            {/* Teacher/Faculty Specific */}
            <Route element={<TeacherRoute />}>
              <Route path="/faculty" element={<FacultyDashboard />} />
              <Route path="/exam-builder" element={<ExamBuilder />} />
            </Route>

            {/* Admin Specific */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Route>

          {/* Fallback — unknown routes redirect to root smart-redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
