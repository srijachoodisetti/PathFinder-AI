import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Sparkles, Languages, CloudOff } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F4F7FC] flex items-center justify-center p-4 md:p-10 font-body relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#4F46E5]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#3B82F6]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Split-Screen Container */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white/40 backdrop-blur-md border border-white/50 rounded-[32px] p-4 md:p-8 shadow-[24px_24px_48px_rgba(0,0,0,0.03),-24px_-24px_48px_#ffffff] z-10">
        
        {/* Left Column (Desktop Illustration & Branding) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center p-8 h-full relative select-none">
          <div className="flex items-center gap-2.5 mb-6">
            <span className="p-2 bg-[#4F46E5]/10 rounded-2xl text-[#4F46E5] font-extrabold text-xl">
              🌱
            </span>
            <span className="font-heading font-extrabold text-2xl tracking-tight text-[#4F46E5]">
              PathFinder <span className="text-[#3B82F6]">AI</span>
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-3 text-left"
          >
            <h1 className="font-heading font-extrabold text-4xl leading-tight text-slate-800">
              Personalized Learning <br />
              <span className="bg-gradient-to-r from-[#4F46E5] to-[#3B82F6] bg-clip-text text-transparent">
                for Every Child
              </span>
            </h1>
            <p className="text-slate-600 font-medium max-w-md leading-relaxed mt-2">
              Empowering students, teachers, and parents with an adaptive AI tutor, offline study modes, and smart curriculum tracking.
            </p>
          </motion.div>

          {/* Floating Feature Cards Grid */}
          <div className="grid grid-cols-2 gap-4 mt-10">
            {/* AI Tutor Card */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="bg-white/80 p-4 rounded-2xl border border-white/60 shadow-[6px_6px_12px_rgba(0,0,0,0.02)] flex items-center gap-3"
            >
              <div className="p-2.5 bg-[#4F46E5]/10 rounded-xl text-[#4F46E5]">
                <BrainCircuit size={20} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-xs text-slate-800">AI Tutor</h4>
                <p className="text-[10px] text-slate-500 font-medium">24/7 adaptive help</p>
              </div>
            </motion.div>

            {/* Smart Learning Card */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
              className="bg-white/80 p-4 rounded-2xl border border-white/60 shadow-[6px_6px_12px_rgba(0,0,0,0.02)] flex items-center gap-3"
            >
              <div className="p-2.5 bg-[#3B82F6]/10 rounded-xl text-[#3B82F6]">
                <Sparkles size={20} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-xs text-slate-800">Smart Progress</h4>
                <p className="text-[10px] text-slate-500 font-medium">XP rewards & badges</p>
              </div>
            </motion.div>

            {/* Multilingual Card */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.2 }}
              className="bg-white/80 p-4 rounded-2xl border border-white/60 shadow-[6px_6px_12px_rgba(0,0,0,0.02)] flex items-center gap-3"
            >
              <div className="p-2.5 bg-indigo-50 rounded-xl text-[#4F46E5]">
                <Languages size={20} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-xs text-slate-800">Local Language</h4>
                <p className="text-[10px] text-slate-500 font-medium">Regional translations</p>
              </div>
            </motion.div>

            {/* Offline Sync Card */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut", delay: 0.7 }}
              className="bg-white/80 p-4 rounded-2xl border border-white/60 shadow-[6px_6px_12px_rgba(0,0,0,0.02)] flex items-center gap-3"
            >
              <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                <CloudOff size={20} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-xs text-slate-800">Offline Sync</h4>
                <p className="text-[10px] text-slate-500 font-medium">Automatic cloud upload</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Column (Form wrapper with Claymorphism) */}
        <div className="col-span-1 lg:col-span-6 w-full flex justify-center items-center py-4">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
};
