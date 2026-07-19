import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F4F7FC] flex items-center justify-center p-6">
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] max-w-lg w-full p-8 text-center flex flex-col items-center gap-4">
        <div className="text-6xl font-extrabold text-primary/20 font-heading">404</div>
        <h2 className="font-heading font-extrabold text-2xl text-slate-800">Page Not Found</h2>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2.5 bg-primary text-white rounded-full font-bold text-sm shadow-[4px_4px_8px_rgba(79,70,229,0.2)] hover:bg-primary/90 transition-all mt-2"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};
