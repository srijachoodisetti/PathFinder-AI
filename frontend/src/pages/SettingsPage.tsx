import React, { useState, useEffect } from 'react';
import { ClayCard, ClayButton, ClayInput } from '../components/ui';
import { Settings, Eye, Volume2, Shield, Bell, CheckCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [highContrast, setHighContrast] = useState(false);
  const [dyslexiaFont, setDyslexiaFont] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>('normal');
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [notifications, setNotifications] = useState({
    exams: true,
    assignments: true,
    placements: true,
    chat: false
  });

  useEffect(() => {
    // Accessibility triggers
    const body = document.body;
    
    if (highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }

    if (dyslexiaFont) {
      body.classList.add('dyslexia-font');
    } else {
      body.classList.remove('dyslexia-font');
    }

    body.classList.remove('text-base', 'text-lg', 'text-xl');
    if (fontSize === 'normal') body.classList.add('text-base');
    if (fontSize === 'large') body.classList.add('text-lg');
    if (fontSize === 'extra-large') body.classList.add('text-xl');
  }, [highContrast, dyslexiaFont, fontSize]);

  const handleToggleMfa = () => {
    setMfaEnabled(!mfaEnabled);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4 text-left font-body">
      {/* Banner */}
      <div className="p-8 bg-gradient-to-r from-slate-500/10 to-slate-700/10 rounded-[28px] border border-white/60 shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] flex justify-between items-center">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-slate-800 flex items-center gap-2">
            <Settings className="text-primary" size={32} />
            <span>Preferences & Settings</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-2">
            Configure system themes, accessibility parameters, notification preferences, and privacy keys.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Accessibility Options */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <ClayCard className="p-6 flex flex-col gap-4">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5 border-b pb-2">
              <Eye size={18} className="text-primary" /> Accessibility Settings
            </h3>
            
            {/* Contrast theme */}
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <div>
                <h4 className="font-bold text-sm text-slate-700">High Contrast Mode</h4>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Bolsters visibility for visually impaired users.</p>
              </div>
              <button
                onClick={() => setHighContrast(!highContrast)}
                className={`w-12 h-6 rounded-full p-1 transition-all ${highContrast ? 'bg-primary flex justify-end' : 'bg-slate-200 flex justify-start'}`}
              >
                <span className="w-4 h-4 bg-white rounded-full inline-block" />
              </button>
            </div>

            {/* Dyslexia Font */}
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <div>
                <h4 className="font-bold text-sm text-slate-700">Dyslexic-Friendly Font</h4>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Applies weighted font configurations to assist reading.</p>
              </div>
              <button
                onClick={() => setDyslexiaFont(!dyslexiaFont)}
                className={`w-12 h-6 rounded-full p-1 transition-all ${dyslexiaFont ? 'bg-primary flex justify-end' : 'bg-slate-200 flex justify-start'}`}
              >
                <span className="w-4 h-4 bg-white rounded-full inline-block" />
              </button>
            </div>

            {/* Font size adjustments */}
            <div className="flex flex-col gap-2 py-2">
              <div>
                <h4 className="font-bold text-sm text-slate-700">Adjustable Font Size</h4>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Scale interface text sizes globally.</p>
              </div>
              <div className="flex gap-3 mt-2">
                {['normal', 'large', 'extra-large'].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setFontSize(sz as any)}
                    className={`py-1.5 px-4 rounded-xl text-xs font-bold capitalize transition-all ${
                      fontSize === sz ? 'bg-primary text-white' : 'bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    {sz.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </ClayCard>

          {/* MFA / Security Card */}
          <ClayCard className="p-6 flex flex-col gap-4">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5 border-b pb-2">
              <Shield size={18} className="text-primary" /> Security & Session Privacy
            </h3>
            <div className="flex justify-between items-center py-2">
              <div>
                <h4 className="font-bold text-sm text-slate-700">Two-Factor Authentication (2FA)</h4>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Provides security triggers during login instances.</p>
              </div>
              <button
                onClick={handleToggleMfa}
                className={`w-12 h-6 rounded-full p-1 transition-all ${mfaEnabled ? 'bg-primary flex justify-end' : 'bg-slate-200 flex justify-start'}`}
              >
                <span className="w-4 h-4 bg-white rounded-full inline-block" />
              </button>
            </div>
          </ClayCard>
        </div>

        {/* Right Side: Notification Configurations */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <ClayCard className="p-6 flex flex-col gap-4">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5 border-b pb-2">
              <Bell size={18} className="text-primary" /> Notification Preferences
            </h3>
            {[
              { key: 'exams', title: 'Exam Alerts & Reminders' },
              { key: 'assignments', title: 'Assignment Due Reminders' },
              { key: 'placements', title: 'Placement Drive Announcements' },
              { key: 'chat', title: 'Study Group Messages Alerts' }
            ].map((n) => (
              <div key={n.key} className="flex justify-between items-center py-2.5 border-b border-slate-50">
                <h4 className="font-bold text-xs text-slate-700">{n.title}</h4>
                <button
                  onClick={() => setNotifications({ ...notifications, [n.key]: !((notifications as any)[n.key]) })}
                  className={`w-12 h-6 rounded-full p-1 transition-all ${
                    (notifications as any)[n.key] ? 'bg-primary flex justify-end' : 'bg-slate-200 flex justify-start'
                  }`}
                >
                  <span className="w-4 h-4 bg-white rounded-full inline-block" />
                </button>
              </div>
            ))}
          </ClayCard>
        </div>
      </div>
    </div>
  );
};
