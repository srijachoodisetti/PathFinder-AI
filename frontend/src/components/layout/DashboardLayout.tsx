import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useOfflineStore } from '../../store/offlineStore';
import {
  Compass,
  Flame,
  BookOpen,
  MessageSquare,
  GraduationCap,
  Award,
  Users,
  Settings,
  LogOut,
  CloudOff,
  Menu,
  X,
  FileText,
  HeartHandshake,
  Video,
  Briefcase,
  Code,
  FolderGit2,
  Landmark,
  Info
} from 'lucide-react';
import { ClayCard, ClayButton } from '../ui';

interface LayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const { isOnline } = useOfflineStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAboutOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getLinks = () => {
    const role = user?.role || 'student';
    if (role === 'student') {
      return [
        { path: '/dashboard', label: 'Student Dashboard', icon: GraduationCap },
        { path: '/academic', label: 'Academic Learning', icon: BookOpen },
        { path: '/videos', label: 'Free Video Library', icon: Video },
        { path: '/placement', label: 'Placement Prep', icon: Award },
        { path: '/coding', label: 'Coding Hub', icon: Code },
        { path: '/projects', label: 'Project Hub', icon: FolderGit2 },
        { path: '/exams', label: 'Assessment Center', icon: Award },
        { path: '/forum', label: 'Campus Forum', icon: MessageSquare },
        { path: '/groups', label: 'Study Groups', icon: Users },
        { path: '/campus', label: 'Campus Hub', icon: Landmark },
        { path: '/career', label: 'AI Career Mentor', icon: Compass },
        { path: '/career-dashboard', label: 'Resume & Career Intelligence', icon: Briefcase },
        { path: '/internships', label: 'Internships Tracker', icon: Briefcase },
        { path: '/certifications', label: 'Certifications', icon: Award },
        { path: '/settings', label: 'Settings', icon: Settings },
      ];
    } else if (role === 'teacher') {
      return [
        { path: '/dashboard', label: 'Faculty Dashboard', icon: Users },
        { path: '/faculty', label: 'Manage & Generate', icon: FileText },
        { path: '/exam-builder', label: 'Exam Builder', icon: FileText },
        { path: '/forum', label: 'Moderate Forum', icon: MessageSquare },
        { path: '/campus', label: 'Campus Hub', icon: Landmark },
        { path: '/academic', label: 'Syllabus Review', icon: BookOpen },
        { path: '/settings', label: 'Settings', icon: Settings },
      ];
    } else if (role === 'parent') {
      return [
        { path: '/dashboard', label: 'Parent Portal', icon: HeartHandshake },
        { path: '/settings', label: 'Settings', icon: Settings },
      ];
    } else if (role === 'admin') {
      return [
        { path: '/dashboard', label: 'System Admin', icon: Settings },
        { path: '/admin', label: 'Curriculum & Users', icon: Users },
        { path: '/settings', label: 'Settings', icon: Settings },
      ];
    }
    return [];
  };

  const menuLinks = getLinks();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 text-text/80 hover:bg-slate-100 rounded-lg"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <span className="p-2 bg-primary/10 rounded-xl text-primary font-bold text-lg select-none">🌱</span>
            <span className="font-heading font-extrabold text-xl tracking-tight text-primary">
              PathFinder <span className="text-secondary">AI</span>
            </span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center relative max-w-xs w-full mx-4">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 text-xs font-semibold bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-primary transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                navigate('/academic');
              }
            }}
          />
          <Compass size={14} className="absolute left-3.5 text-slate-400 pointer-events-none" />
        </div>

        {/* User telemetry bar */}
        <div className="flex items-center gap-4">
          {/* Offline/Online indicator */}
          {!isOnline ? (
            <div className="flex items-center gap-1 bg-danger/10 text-danger text-xs font-semibold px-3 py-1.5 rounded-full">
              <CloudOff size={14} />
              <span>Offline Mode</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1 bg-success/15 text-success text-xs font-semibold px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span>Online</span>
            </div>
          )}

          {user?.student_profile && (
            <>
              {/* Streak */}
              <div className="clay-streak-badge">
                <Flame size={14} fill="currentColor" />
                <span>{user.student_profile.streak} Days</span>
              </div>
              {/* XP */}
              <div className="clay-xp-badge">
                <Compass size={14} />
                <span>{user.student_profile.xp_points} XP</span>
              </div>
            </>
          )}

          {/* User Profile */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm uppercase">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-text leading-none">{user?.full_name}</span>
              <span className="text-[10px] text-text/60 capitalize leading-tight">{user?.role}</span>
            </div>
          </div>

          <ClayButton
            onClick={() => setAboutOpen(true)}
            className="p-2 text-text/60 hover:text-primary hover:bg-indigo-50 !shadow-none !border-none !py-2 !px-3 rounded-full flex items-center gap-1.5"
            title="About PathFinder AI"
          >
            <Info size={16} />
            <span className="hidden sm:inline text-xs font-bold">About</span>
          </ClayButton>

          <ClayButton
            onClick={handleLogout}
            className="p-2 text-text/60 hover:text-danger hover:bg-red-50 !shadow-none !border-none !py-2 !px-3 rounded-full flex items-center gap-1.5"
            title="Log Out"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline text-xs">Log Out</span>
          </ClayButton>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <aside
          className={`
            fixed md:sticky top-[73px] bottom-0 left-0 z-30
            w-64 bg-white border-r border-slate-100 p-4
            flex flex-col gap-2 transform md:transform-none transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            h-[calc(100vh-73px)] overflow-y-auto
          `}
        >
          <div className="flex flex-col gap-1.5 flex-1">
            {menuLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => {
                    navigate(link.path);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold select-none
                    transition-all duration-200 text-left
                    ${isActive
                      ? 'bg-primary text-white shadow-[6px_6px_12px_rgba(79,70,229,0.25)] border-primary/10'
                      : 'text-text/70 hover:bg-slate-50 hover:text-text'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sidebar footer brand */}
          <div className="p-3 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-primary/10 text-[10px] text-text/50 mt-2">
            <p className="font-bold text-text/70 mb-0.5">🌱 PathFinder AI</p>
            <p>AI-powered career guidance for college students.</p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {aboutOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 transition-opacity duration-300"
          onClick={() => setAboutOpen(false)}
        >
          <div 
            className="bg-white/95 backdrop-blur-lg p-6 sm:p-8 rounded-[24px] border border-white/60 shadow-[12px_12px_24px_rgba(0,0,0,0.1),-12px_-12px_24px_#ffffff] max-w-md w-full text-left relative overflow-hidden transition-all transform scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-heading font-extrabold text-xl text-primary flex items-center gap-2">
                  <span>🌱</span> About PathFinder AI
                </h3>
                <button 
                  onClick={() => setAboutOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-lg"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                PathFinder AI is an AI-powered Engineering Student Platform designed to help students excel in academics, coding, placements, internships, project development, interview preparation, and career growth through intelligent learning tools.
              </p>
              
              <div className="flex flex-col gap-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-100/50 mt-2 text-xs font-semibold">
                <div className="flex justify-between">
                  <span className="text-slate-400">Version</span>
                  <span className="text-slate-800 font-bold">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Developer</span>
                  <span className="text-slate-800 font-bold">Srija Chodisetti</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email</span>
                  <a href="mailto:srijachoodisetti@gmail.com" className="text-primary hover:underline font-bold">
                    srijachoodisetti@gmail.com
                  </a>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setAboutOpen(false)}
                  className="px-5 py-2 bg-primary text-white font-bold text-sm rounded-full shadow-[4px_4px_8px_rgba(79,70,229,0.2),-4px_-4px_8px_#ffffff] transition-all hover:bg-primary/90 active:scale-95 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
