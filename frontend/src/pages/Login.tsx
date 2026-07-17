import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { LoginForm } from './LoginForm';
import { ArrowLeft } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();

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
      </div>
    </AuthLayout>
  );
};

