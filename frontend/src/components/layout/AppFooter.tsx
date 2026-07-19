import React from 'react';
import { Mail, User } from 'lucide-react';

export const AppFooter: React.FC = () => (
  <footer className="w-full border-t border-slate-200/60 bg-white/80 backdrop-blur-md py-6 mt-auto">
    <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center gap-4 text-center">
      {/* Developer credit & Email */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-slate-600 font-medium">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-primary/10 text-primary rounded-lg">
            <User size={13} />
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-1 text-left sm:text-center">
            <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold block sm:hidden">Developed by</span>
            <span className="hidden sm:inline text-slate-500">Developed by</span>
            <span className="font-bold text-slate-800">Srija Chodisetti</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-primary/10 text-primary rounded-lg">
            <Mail size={13} />
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-1 text-left sm:text-center">
            <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold block sm:hidden">Email</span>
            <span className="hidden sm:inline text-slate-500">Email:</span>
            <a href="mailto:srijachoodisetti@gmail.com" className="text-primary hover:underline font-bold">
              srijachoodisetti@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="flex flex-col items-center justify-center text-[10px] sm:text-xs text-slate-400 font-semibold leading-tight">
        <span>Copyright © 2026 PathFinder AI</span>
        <span>All Rights Reserved.</span>
      </div>
    </div>
  </footer>
);

