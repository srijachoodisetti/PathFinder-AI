import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { AuthLayout } from '../components/layout/AuthLayout';
import { LoginForm } from './LoginForm';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, clearError } = useAuthStore();

  // Helper function to quick-fill credentials for hackathon testers
  const fillRole = async (role: 'student' | 'teacher' | 'parent' | 'admin') => {
    clearError();
    let email = '';
    let password = '';
    if (role === 'student') {
      email = 'student@pathfinder.com';
      password = 'student123';
    } else if (role === 'teacher') {
      email = 'teacher@pathfinder.com';
      password = 'teacher123';
    } else if (role === 'parent') {
      email = 'parent@pathfinder.com';
      password = 'parent123';
    } else if (role === 'admin') {
      email = 'admin@pathfinder.com';
      password = 'admin123';
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Quick fill login error:', err);
    }
  };

  return (
    <AuthLayout>
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-white py-2.5 px-4 rounded-full shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] border border-white/60 transition-all select-none hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
      >
        <ArrowLeft size={14} />
        <span>Back to Home</span>
      </button>

      <div className="flex flex-col gap-6 w-full">
        {/* Render Form */}
        <LoginForm />

        {/* Quick-Fill Switcher with premium style */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="p-5 bg-white/70 rounded-[20px] border border-white/80 shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] flex flex-col gap-3 text-left"
        >
          <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
            ⚡ Quick-Fill Mock Accounts
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => fillRole('student')}
              className="py-2.5 px-3 bg-white border border-slate-100 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 select-none cursor-pointer"
            >
              👦 Rajesh (Student)
            </button>
            <button
              onClick={() => fillRole('teacher')}
              className="py-2.5 px-3 bg-white border border-slate-100 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 select-none cursor-pointer"
            >
              👩 Savitri (Teacher)
            </button>
            <button
              onClick={() => fillRole('parent')}
              className="py-2.5 px-3 bg-white border border-slate-100 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 select-none cursor-pointer"
            >
              👨 Ramesh (Parent)
            </button>
            <button
              onClick={() => fillRole('admin')}
              className="py-2.5 px-3 bg-white border border-slate-100 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 select-none cursor-pointer"
            >
              🛠️ Admin
            </button>
          </div>
        </motion.div>
      </div>
    </AuthLayout>
  );
};
