import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore, API_URL } from '../store/authStore';
import { ClayCard, ClayButton, ClayAlert, SkeletonLoader } from '../components/ui';
import {
  HeartHandshake,
  TrendingUp,
  Award,
  Globe,
  Volume2,
  Calendar,
  Sparkles,
  Info,
  Mail,
  UserCheck,
  CheckCircle
} from 'lucide-react';

export const ParentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [childData, setChildData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Voice Memo state
  const [language, setLanguage] = useState('Hindi');
  const [voiceReportText, setVoiceReportText] = useState<string | null>(null);
  const [generatingVoice, setGeneratingVoice] = useState(false);
  const [audioObject, setAudioObject] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchChildProgress();
  }, []);

  const fetchChildProgress = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/parent/child-progress`);
      setChildData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVoiceMemo = async () => {
    setGeneratingVoice(true);
    setVoiceReportText(null);
    if (audioObject) {
      audioObject.pause();
    }
    
    try {
      const res = await axios.post(`${API_URL}/parent/voice-report`, {
        language: language
      });
      setVoiceReportText(res.data.report_text);
      if (res.data.audio_url) {
        const audio = new Audio(res.data.audio_url);
        setAudioObject(audio);
        audio.play();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingVoice(false);
    }
  };

  const languages = ['Hindi', 'Telugu', 'Tamil', 'Kannada', 'Malayalam', 'Marathi', 'Bengali', 'English'];

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <SkeletonLoader lines={4} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full text-left font-body">
      {/* Top Banner */}
      <ClayCard className="p-6 bg-gradient-to-r from-primary/10 via-pink-500/5 to-white flex justify-between items-center">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-text">Parent Portal 👨‍👩‍👦</h2>
          <p className="text-sm text-text/60">
            Monitoring learning progress for: <strong>{user?.parent_profile?.child_email || 'student@pathfinder.com'}</strong>
          </p>
        </div>
      </ClayCard>

      {!childData || !childData.linked ? (
        <div className="max-w-md mx-auto w-full">
          <ClayCard className="p-6 text-center flex flex-col items-center gap-3">
            <span className="text-4xl">⚠️</span>
            <h3 className="font-heading font-bold text-lg">No Student Connected</h3>
            <p className="text-xs text-text/60 leading-normal">
              No registered student was found for email: <strong>{user?.parent_profile?.child_email}</strong>.
            </p>
          </ClayCard>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main metrics & attempts list */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Child Telemetry counters */}
            <div className="grid grid-cols-3 gap-4">
              <ClayCard flat className="p-4 flex flex-col gap-1 text-center bg-white">
                <span className="text-[10px] text-text/50 font-bold uppercase">Learning Points</span>
                <span className="text-xl font-extrabold text-success">{childData.xp_points} XP</span>
              </ClayCard>
              <ClayCard flat className="p-4 flex flex-col gap-1 text-center bg-white">
                <span className="text-[10px] text-text/50 font-bold uppercase">Study Streak</span>
                <span className="text-xl font-extrabold text-danger">{childData.streak} Days</span>
              </ClayCard>
              <ClayCard flat className="p-4 flex flex-col gap-1 text-center bg-white">
                <span className="text-[10px] text-text/50 font-bold uppercase">Avg Quiz Score</span>
                <span className="text-xl font-extrabold text-secondary">{childData.average_score}%</span>
              </ClayCard>
            </div>

            {/* Child Quiz Attempts */}
            <ClayCard className="p-4 flex flex-col gap-3">
              <h3 className="font-heading font-extrabold text-sm border-b pb-2">
                Recent Quiz Attempts
              </h3>
              
              <div className="flex flex-col gap-2.5">
                {childData.recent_attempts.length > 0 ? (
                  childData.recent_attempts.map((att: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-text/80">{att.quiz_title}</span>
                        <span className="text-[9px] text-text/40">{new Date(att.completed_at).toLocaleDateString()}</span>
                      </div>
                      <span className={`font-bold ${att.score >= 50 ? 'text-success' : 'text-danger'}`}>{att.score}%</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-text/40 font-semibold py-4 text-center">No quiz attempts submitted yet.</span>
                )}
              </div>
            </ClayCard>

            {/* Weekly Report Email Previewer */}
            <ClayCard className="p-4 flex flex-col gap-3 bg-slate-50 border-none">
              <h4 className="font-heading font-bold text-sm text-text/80 flex items-center gap-1.5 border-b pb-2">
                <Mail size={16} className="text-primary" />
                Weekly Progress Email Digest (Mock Preview)
              </h4>
              
              <div className="p-4 bg-white border border-slate-200 rounded-2xl text-xs text-left leading-relaxed flex flex-col gap-2 shadow-sm font-medium">
                <div>
                  <strong>To:</strong> parent@pathfinder.com <br />
                  <strong>Subject:</strong> PathFinder AI Weekly Digest: {childData.child_name}'s Progress
                </div>
                <div className="h-px bg-slate-100 my-1" />
                <p>Hello Parent,</p>
                <p>
                  Here is the summary of {childData.child_name}'s learning activities this week:
                </p>
                <ul className="list-disc pl-5 flex flex-col gap-0.5 text-text/75">
                  <li>Total study streak maintained: <strong>{childData.streak} days</strong>.</li>
                  <li>Fractions Challenge Score: <strong>{childData.average_score}% average accuracy</strong>.</li>
                  <li>AI confidence Index: <strong>85 / 100</strong>.</li>
                </ul>
                <p>Regards,<br />PathFinder AI Team</p>
              </div>
            </ClayCard>
          </div>

          {/* Right Column: Voice synthesizer, Behavior check */}
          <div className="flex flex-col gap-6">
            
            {/* Vernacular speech report generator */}
            <ClayCard className="p-5 flex flex-col gap-4 bg-gradient-to-br from-pink-50/20 to-white shadow-md">
              <h4 className="font-heading font-extrabold text-sm flex items-center gap-1.5 border-b pb-2">
                <Volume2 size={16} className="text-primary animate-pulse" />
                Vocal Progress Report
              </h4>
              
              <p className="text-xs text-text/60 leading-relaxed">
                Hear progress spoken in your local preferred language:
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-text/50 uppercase tracking-wide">Language Choice</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="clay-input text-xs font-semibold !py-2 bg-slate-50 cursor-pointer"
                >
                  {languages.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <ClayButton
                onClick={handleGenerateVoiceMemo}
                variant="primary"
                className="flex items-center justify-center gap-2 !py-2.5 mt-1 shadow-md"
                disabled={generatingVoice}
              >
                <Volume2 size={16} />
                <span>{generatingVoice ? 'Translating Report...' : 'Hear Progress Memo'}</span>
              </ClayButton>

              {voiceReportText && (
                <div className="p-3.5 bg-slate-50 border rounded-2xl text-xs leading-relaxed text-slate-800 text-left font-medium">
                  <span className="text-[9px] font-bold text-primary block uppercase tracking-wider mb-1">✓ Translated text memo:</span>
                  <p>{voiceReportText}</p>
                </div>
              )}
            </ClayCard>

            {/* Behavioral analysis card */}
            <ClayCard className="p-4 flex flex-col gap-3">
              <h4 className="font-heading font-bold text-sm text-text/80 flex items-center gap-1.5 border-b pb-2">
                <UserCheck size={16} className="text-success" />
                Learning Habits & Behavior
              </h4>

              <div className="flex flex-col gap-2.5 text-xs text-left font-medium text-text/75">
                <div className="flex items-center gap-2">
                  <span className="text-success">✓</span>
                  <span>Regular daily activity (streak maintained)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-success">✓</span>
                  <span>Good participation in AI tutoring sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-warning">⚠️</span>
                  <span>Takes longer on coding exercises</span>
                </div>
              </div>
            </ClayCard>
          </div>
        </div>
      )}
    </div>
  );
};
