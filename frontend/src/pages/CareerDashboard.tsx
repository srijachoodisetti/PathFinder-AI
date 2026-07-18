import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuthStore, API_URL } from '../store/authStore';
import { ClayCard, ClayButton } from '../components/ui';
import {
  Upload, FileText, TrendingUp, Award, Target, Sparkles,
  CheckCircle2, AlertCircle, Clock, ChevronRight, Briefcase,
  Code, BookOpen, BarChart2, Mic, Loader2, History, ArrowUpRight,
  Download, ArrowRight, AlertTriangle, CheckSquare
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────
interface ATSResult {
  success: boolean;
  analysis_id: number;
  ats_score: number;
  resume_strength: string;
  ats_result: {
    strengths: string[];
    weaknesses: string[];
    missing_keywords: string[];
    formatting_issues: string[];
    grammar_score: number;
    keyword_match_percent: number;
    overall_feedback: string;
  };
  gemini_insights: {
    improvement_tips: string[];
    recommended_certs: string[];
    recommended_projects: string[];
  };
  improvement_from_last: number;
}

interface ImproveResult {
  summary: string;
  achievements: string[];
  projects: string[];
  skills: string[];
  experience: string[];
  grammar_fixes: string[];
  improved_resume_markdown: string;
}

interface GapResult {
  success: boolean;
  ats_score: number;
  resume_strength: string;
  strengths: string[];
  weaknesses: string[];
  missing_keywords: string[];
  formatting_issues: string[];
  grammar_score: number;
  keyword_match_percent: number;
  overall_feedback: string;
}

interface RoadmapResult {
  roadmap_text: string;
  recommended_skills: string[];
  recommended_projects: string[];
  recommended_certifications: string[];
  recommended_courses: string[];
}

interface InterviewQuestion {
  question: string;
  category: string;
  expected_answer: string;
  difficulty: string;
}

interface HistoryItem {
  id: number;
  file_name: string;
  ats_score: number;
  improvement: number;
  uploaded_at: string;
  analysis_id?: number;
}

// ── Circular Score Ring ───────────────────────────────────────────────
const ScoreRing: React.FC<{ score: number; size?: number; label?: string }> = ({ score, size = 140, label = "ATS Score" }) => {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#4f46e5'; // indigo
    if (score >= 40) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={getColor()} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-heading font-extrabold text-2xl" style={{ color: getColor() }}>{score.toFixed(0)}</span>
        <span className="text-[9px] font-bold text-slate-400 uppercase">{label}</span>
      </div>
    </div>
  );
};

// ── Skill Badge ───────────────────────────────────────────────────────
const SkillBadge: React.FC<{ label: string; variant?: 'missing' | 'cert' | 'project' | 'skill' | 'course' | 'success' }> = ({ label, variant = 'skill' }) => {
  const styles = {
    missing: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-400',
    cert: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400',
    project: 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/50 dark:text-indigo-400',
    skill: 'bg-primary/10 border-primary/20 text-primary dark:bg-primary/20 dark:border-primary/30 dark:text-primary-foreground',
    course: 'bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-950/20 dark:border-violet-900/50 dark:text-violet-400',
    success: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-900/50 dark:text-green-400'
  };
  return (
    <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full border ${styles[variant]}`}>
      {label}
    </span>
  );
};

// ── Main Component ────────────────────────────────────────────────────
export const CareerDashboard: React.FC = () => {
  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };

  const [activeTab, setActiveTab] = useState<'upload' | 'improve' | 'roadmap' | 'gap' | 'interview' | 'history'>('upload');

  // Global Resumes list loaded on mount
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);

  // Upload & ATS state
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resume Improvement state
  const [improving, setImproving] = useState(false);
  const [improveResult, setImproveResult] = useState<ImproveResult | null>(null);

  // Skill Gap Analysis state
  const [gapLoading, setGapLoading] = useState(false);
  const [gapResult, setGapResult] = useState<GapResult | null>(null);
  const [gapJobDesc, setGapJobDesc] = useState('');

  // Roadmap state
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [branch, setBranch] = useState('CSE');
  const [semester, setSemester] = useState(6);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapResult, setRoadmapResult] = useState<RoadmapResult | null>(null);

  // Interview state
  const [interviewRole, setInterviewRole] = useState('Software Engineer');
  const [interviewType, setInterviewType] = useState('technical');
  const [interviewDifficulty, setInterviewDifficulty] = useState('medium');
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  // ── History Loader ───────────────────────────────────────────────
  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await axios.get(`${API_URL}/career/history`, { headers });
      setHistory(res.data);
      if (res.data.length > 0 && !selectedResumeId) {
        setSelectedResumeId(res.data[0].analysis_id || res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load resume history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') loadHistory();
  }, [activeTab]);

  // ── Upload Handler ────────────────────────────────────────────────
  const handleFile = (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF or DOCX file.');
      return;
    }
    setSelectedFile(file);
    setAtsResult(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('job_description', jobDesc);

      const res = await axios.post(`${API_URL}/career/upload-resume`, formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' }
      });
      setAtsResult(res.data);
      // Automatically refresh history to populate dropdown lists
      loadHistory();
    } catch (err: any) {
      console.error(err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // ── Resume Improvement Handler ────────────────────────────────────
  const handleImproveResume = async () => {
    const targetId = selectedResumeId || (history.length > 0 ? (history[0].analysis_id || history[0].id) : null);
    if (!targetId) {
      alert('Please upload or select a resume first.');
      return;
    }
    setImproving(true);
    setImproveResult(null);
    try {
      const res = await axios.post(`${API_URL}/career/improve`, {
        resume_id: targetId
      }, { headers });
      setImproveResult(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to generate resume improvements.');
    } finally {
      setImproving(false);
    }
  };

  const handleDownloadImproved = () => {
    if (!improveResult) return;
    const blob = new Blob([improveResult.improved_resume_markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'improved_resume.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Skill Gap Handler ─────────────────────────────────────────────
  const handleGapAnalysis = async () => {
    const targetId = selectedResumeId || (history.length > 0 ? (history[0].analysis_id || history[0].id) : null);
    if (!targetId) {
      alert('Please upload or select a resume first.');
      return;
    }
    setGapLoading(true);
    setGapResult(null);
    try {
      const res = await axios.post(`${API_URL}/career/analyze`, {
        resume_id: targetId,
        job_description: gapJobDesc || 'General Software Engineering Role'
      }, { headers });
      setGapResult(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to generate Skill Gap analysis.');
    } finally {
      setGapLoading(false);
    }
  };

  // ── Roadmap Handler ───────────────────────────────────────────────
  const handleGenerateRoadmap = async () => {
    setRoadmapLoading(true);
    try {
      const res = await axios.post(`${API_URL}/career/generate-roadmap`, {
        target_role: targetRole,
        branch,
        semester,
        career_goal: 'placement'
      }, { headers });
      setRoadmapResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setRoadmapLoading(false);
    }
  };

  // ── Interview Handler ────────────────────────────────────────────
  const handleGenerateInterview = async () => {
    setInterviewLoading(true);
    setQuestions([]);
    try {
      const res = await axios.post(`${API_URL}/career/interview-preparation`, {
        target_role: interviewRole,
        interview_type: interviewType,
        difficulty: interviewDifficulty
      }, { headers });
      setQuestions(res.data.questions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setInterviewLoading(false);
    }
  };

  const strengthColors: Record<string, string> = {
    Weak: 'text-red-500 bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400',
    Average: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-400',
    Strong: 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/50 dark:text-indigo-400',
    Excellent: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400',
  };

  const tabs = [
    { id: 'upload', label: 'ATS Resume Check', icon: Upload },
    { id: 'improve', label: 'Resume Improvement', icon: Sparkles },
    { id: 'roadmap', label: 'Career Roadmap', icon: TrendingUp },
    { id: 'gap', label: 'Skill Gap Analysis', icon: Target },
    { id: 'interview', label: 'Interview Prep', icon: Mic },
    { id: 'history', label: 'Resume History', icon: History },
  ] as const;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4 font-body text-slate-800 dark:text-slate-100">
      {/* Hero Banner */}
      <div className="p-8 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-[28px] border border-white/60 dark:border-slate-700/60 shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] dark:shadow-[8px_8px_16px_#111827,-8px_-8px_16px_#374151] text-left">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="font-heading font-extrabold text-3xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Briefcase className="text-primary" size={32} />
              <span>Resume & Career Intelligence</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-2 max-w-xl">
              Elevate your career credentials. Evaluate ATS compatibility against SkillBridge AI metrics, rewrite using Gemini models, run skill gap reviews, and build interactive prep modules.
            </p>
          </div>
          <div className="flex gap-3">
            {['SkillBridge AI', 'Gemini AI'].map(badge => (
              <span key={badge} className="text-[10px] font-extrabold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Sparkles size={10} /> {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm self-start flex-wrap">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`py-2 px-4 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === id ? 'bg-primary text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* Resume Dropdown Selector (shows for Improve and Gap tabs if history exists) */}
      {(activeTab === 'improve' || activeTab === 'gap') && history.length > 0 && (
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-left">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-primary" />
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Select Resume Version:</label>
          </div>
          <select
            value={selectedResumeId || ''}
            onChange={(e) => setSelectedResumeId(Number(e.target.value))}
            className="py-1.5 px-3 outline-none border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-300"
          >
            {history.map((item, idx) => (
              <option key={item.id} value={item.analysis_id || item.id}>
                {item.file_name} - Score: {item.ats_score.toFixed(0)} ({new Date(item.uploaded_at).toLocaleDateString('en-IN')})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ── TAB: ATS Resume Upload ─────────────────────────────────── */}
      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
          {/* Upload Column */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Drag & Drop Zone */}
            <ClayCard className="flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Upload size={16} className="text-primary" /> Upload Resume
              </h3>
              <div
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all text-center flex flex-col items-center gap-3 ${
                  dragOver ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <FileText size={22} className="text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                    {selectedFile ? selectedFile.name : 'Drag & drop your resume'}
                  </p>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">PDF or DOCX • Max 10MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
              </div>

              {/* Optional Job Description */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 pl-1">Target Job Description <span className="text-slate-400 font-normal">(Optional — improves ATS accuracy)</span></label>
                <textarea
                  placeholder="Paste job description here..."
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  className="clay-input text-xs font-semibold h-24"
                />
              </div>

              <ClayButton
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className={`py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  selectedFile && !uploading ? 'bg-primary text-white hover:bg-secondary' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                {uploading ? <><Loader2 size={15} className="animate-spin" /> Analyzing with SkillBridge AI...</> : <><Sparkles size={14} /> Check ATS Score</>}
              </ClayButton>
            </ClayCard>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {!atsResult ? (
              <ClayCard className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                  <FileText size={28} className="text-slate-300" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-600 dark:text-slate-400">Upload your resume to begin</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Your ATS score, keyword analysis, and AI suggestions will appear here.</p>
                </div>
              </ClayCard>
            ) : (
              <>
                {/* ATS Score Header */}
                <ClayCard className="p-6">
                  <div className="flex items-center gap-6 flex-wrap">
                    <ScoreRing score={atsResult.ats_score} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${strengthColors[atsResult.resume_strength] || 'text-slate-600 bg-slate-50 border-slate-200'}`}>
                          {atsResult.resume_strength}
                        </span>
                        {atsResult.improvement_from_last !== 0 && (
                          <span className={`text-xs font-bold flex items-center gap-0.5 ${atsResult.improvement_from_last > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            <ArrowUpRight size={12} />
                            {atsResult.improvement_from_last > 0 ? '+' : ''}{atsResult.improvement_from_last.toFixed(1)} from last upload
                          </span>
                        )}
                      </div>
                      <h2 className="font-heading font-extrabold text-xl text-slate-850 dark:text-slate-100">{atsResult.ats_result.overall_feedback}</h2>
                      <div className="flex gap-4 mt-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Keyword Match</span>
                          <span className="font-extrabold text-base text-primary">{atsResult.ats_result.keyword_match_percent?.toFixed(0)}%</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Grammar</span>
                          <span className="font-extrabold text-base text-emerald-500">{atsResult.ats_result.grammar_score?.toFixed(0)}/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ClayCard>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ClayCard className="p-5 flex flex-col gap-3">
                    <h4 className="font-bold text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1 uppercase">
                      <CheckCircle2 size={13} /> Strengths
                    </h4>
                    <div className="flex flex-col gap-2">
                      {atsResult.ats_result.strengths?.map((s, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                          <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </ClayCard>
                  <ClayCard className="p-5 flex flex-col gap-3">
                    <h4 className="font-bold text-xs text-red-600 dark:text-red-400 flex items-center gap-1 uppercase">
                      <AlertCircle size={13} /> Weaknesses
                    </h4>
                    <div className="flex flex-col gap-2">
                      {atsResult.ats_result.weaknesses?.map((w, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                          <AlertCircle size={12} className="text-red-400 mt-0.5 flex-shrink-0" />
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  </ClayCard>
                </div>

                {/* Missing Keywords */}
                <ClayCard className="p-5 flex flex-col gap-3">
                  <h4 className="font-bold text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1 uppercase">
                    <Target size={13} /> Missing Industry Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {atsResult.ats_result.missing_keywords?.map((kw, i) => (
                      <SkillBadge key={i} label={kw} variant="missing" />
                    ))}
                  </div>
                </ClayCard>

                {/* AI Improvement Tips */}
                <ClayCard className="p-5 flex flex-col gap-3">
                  <h4 className="font-bold text-xs text-primary flex items-center gap-1 uppercase">
                    <Sparkles size={13} className="animate-pulse" /> Gemini AI Resume Improvement Tips
                  </h4>
                  <ol className="flex flex-col gap-2">
                    {atsResult.gemini_insights.improvement_tips?.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-extrabold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ol>
                </ClayCard>

                {/* Recommended Certifications & Projects */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ClayCard className="p-5 flex flex-col gap-3">
                    <h4 className="font-bold text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1 uppercase">
                      <Award size={13} /> Recommended Certifications
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {atsResult.gemini_insights.recommended_certs?.map((cert, i) => (
                        <SkillBadge key={i} label={cert} variant="cert" />
                      ))}
                    </div>
                  </ClayCard>
                  <ClayCard className="p-5 flex flex-col gap-3">
                    <h4 className="font-bold text-xs text-indigo-700 dark:text-indigo-400 flex items-center gap-1 uppercase">
                      <Code size={13} /> Recommended Projects
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {atsResult.gemini_insights.recommended_projects?.map((proj, i) => (
                        <SkillBadge key={i} label={proj} variant="project" />
                      ))}
                    </div>
                  </ClayCard>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: Resume Improvement ────────────────────────────────── */}
      {activeTab === 'improve' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
          {/* Action Trigger Card */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <ClayCard className="flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Sparkles size={16} className="text-primary" /> Gemini AI Resume Improvement
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Rewrite resume sections with strong action verbs, insert metrics, correct grammar errors, and generate a redesigned Markdown format ready to download.
              </p>
              <ClayButton
                onClick={handleImproveResume}
                disabled={improving}
                className="bg-primary text-white hover:bg-secondary py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-2"
              >
                {improving ? <><Loader2 size={14} className="animate-spin" /> Rewriting Resume...</> : <><Sparkles size={14} /> Improve My Resume</>}
              </ClayButton>

              {improveResult && (
                <ClayButton
                  onClick={handleDownloadImproved}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Download size={13} /> Download Improved Resume (.md)
                </ClayButton>
              )}
            </ClayCard>
          </div>

          {/* Results panel */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {!improveResult ? (
              <ClayCard className="text-center py-32 text-slate-400 flex flex-col items-center gap-3">
                <Sparkles size={36} className="text-slate-200 animate-pulse" />
                <p className="font-semibold text-sm">Select a resume version and click Improve My Resume to generate redesigned components.</p>
              </ClayCard>
            ) : (
              <>
                {/* Summary & Skills */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ClayCard className="p-5 flex flex-col gap-3">
                    <h4 className="font-bold text-xs text-primary uppercase flex items-center gap-1"><FileText size={12} /> Redesigned Professional Summary</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">{improveResult.summary}</p>
                  </ClayCard>
                  <ClayCard className="p-5 flex flex-col gap-3">
                    <h4 className="font-bold text-xs text-indigo-700 dark:text-indigo-400 uppercase flex items-center gap-1"><Award size={12} /> Refined Keywords & Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {improveResult.skills?.map((s, i) => (
                        <SkillBadge key={i} label={s} variant="success" />
                      ))}
                    </div>
                  </ClayCard>
                </div>

                {/* Achievements & Grammar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ClayCard className="p-5 flex flex-col gap-3">
                    <h4 className="font-bold text-xs text-emerald-700 dark:text-emerald-400 uppercase flex items-center gap-1"><TrendingUp size={12} /> Quantified Achievements</h4>
                    <ul className="flex flex-col gap-2">
                      {improveResult.achievements?.map((a, i) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-slate-400 font-semibold flex items-start gap-2">
                          <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </ClayCard>
                  <ClayCard className="p-5 flex flex-col gap-3">
                    <h4 className="font-bold text-xs text-amber-700 dark:text-amber-400 uppercase flex items-center gap-1"><AlertTriangle size={12} /> Phrasing & Grammar Fixes</h4>
                    <ul className="flex flex-col gap-2">
                      {improveResult.grammar_fixes?.map((gf, i) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-slate-400 font-semibold flex items-start gap-2">
                          <AlertCircle size={12} className="text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>{gf}</span>
                        </li>
                      ))}
                    </ul>
                  </ClayCard>
                </div>

                {/* Experience & Projects */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ClayCard className="p-5 flex flex-col gap-3">
                    <h4 className="font-bold text-xs text-indigo-700 dark:text-indigo-400 uppercase flex items-center gap-1"><Briefcase size={12} /> Experience Enhancements</h4>
                    <ul className="flex flex-col gap-2">
                      {improveResult.experience?.map((e, i) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-slate-400 font-semibold flex items-start gap-2">
                          <CheckSquare size={12} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  </ClayCard>
                  <ClayCard className="p-5 flex flex-col gap-3">
                    <h4 className="font-bold text-xs text-purple-700 dark:text-purple-400 uppercase flex items-center gap-1"><Code size={12} /> Project Bullet Improvements</h4>
                    <ul className="flex flex-col gap-2">
                      {improveResult.projects?.map((p, i) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-slate-400 font-semibold flex items-start gap-2">
                          <Code size={12} className="text-purple-500 mt-0.5 flex-shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </ClayCard>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: Career Roadmap ───────────────────────────────────── */}
      {activeTab === 'roadmap' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
          <div className="lg:col-span-4 flex flex-col gap-4">
            <ClayCard className="flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <TrendingUp size={16} className="text-primary" /> Roadmap Parameters
              </h3>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 pl-1">Target Role</label>
                <select value={targetRole} onChange={e => setTargetRole(e.target.value)} className="py-2.5 px-4 outline-none border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-300">
                  {['Full Stack Developer', 'AI/ML Engineer', 'DevOps Engineer', 'Data Scientist', 'Embedded Systems Engineer', 'Cybersecurity Analyst', 'Product Manager'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 pl-1">Branch</label>
                <select value={branch} onChange={e => setBranch(e.target.value)} className="py-2.5 px-4 outline-none border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-300">
                  {['CSE', 'AI & DS', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil'].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 pl-1">Current Semester</label>
                <select value={semester} onChange={e => setSemester(Number(e.target.value))} className="py-2.5 px-4 outline-none border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-300">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
              <ClayButton
                onClick={handleGenerateRoadmap}
                disabled={roadmapLoading}
                className="bg-primary text-white hover:bg-secondary py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-2"
              >
                {roadmapLoading ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><Sparkles size={14} /> Generate Roadmap</>}
              </ClayButton>
            </ClayCard>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-4">
            {roadmapResult ? (
              <>
                {/* Roadmap Timeline */}
                <ClayCard className="p-6">
                  <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 mb-4">{targetRole} — Semester-Wise Roadmap</h3>
                  <div className="prose prose-sm max-w-none text-slate-600 dark:text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                    {roadmapResult.roadmap_text}
                  </div>
                </ClayCard>

                {/* Skills, Certs, Projects, Courses grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ClayCard className="p-5 flex flex-col gap-3">
                    <h4 className="font-bold text-xs text-primary uppercase flex items-center gap-1"><BookOpen size={12} /> Key Skills to Acquire</h4>
                    <div className="flex flex-wrap gap-2">{roadmapResult.recommended_skills?.map((s, i) => <SkillBadge key={i} label={s} variant="skill" />)}</div>
                  </ClayCard>
                  <ClayCard className="p-5 flex flex-col gap-3">
                    <h4 className="font-bold text-xs text-emerald-700 dark:text-emerald-400 uppercase flex items-center gap-1"><Award size={12} /> Certifications</h4>
                    <div className="flex flex-wrap gap-2">{roadmapResult.recommended_certifications?.map((c, i) => <SkillBadge key={i} label={c} variant="cert" />)}</div>
                  </ClayCard>
                  <ClayCard className="p-5 flex flex-col gap-3">
                    <h4 className="font-bold text-xs text-indigo-700 dark:text-indigo-400 uppercase flex items-center gap-1"><Code size={12} /> Build These Projects</h4>
                    <div className="flex flex-wrap gap-2">{roadmapResult.recommended_projects?.map((p, i) => <SkillBadge key={i} label={p} variant="project" />)}</div>
                  </ClayCard>
                  <ClayCard className="p-5 flex flex-col gap-3">
                    <h4 className="font-bold text-xs text-violet-700 dark:text-violet-400 uppercase flex items-center gap-1"><BookOpen size={12} /> Recommended Courses</h4>
                    <div className="flex flex-wrap gap-2">{roadmapResult.recommended_courses?.map((c, i) => <SkillBadge key={i} label={c} variant="course" />)}</div>
                  </ClayCard>
                </div>
              </>
            ) : (
              <ClayCard className="text-center py-32 text-slate-400 flex flex-col items-center gap-3">
                <TrendingUp size={36} className="text-slate-200" />
                <p className="font-semibold text-sm">Set your parameters and click Generate to create a personalized career roadmap.</p>
              </ClayCard>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: Skill Gap Analysis ────────────────────────────────── */}
      {activeTab === 'gap' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
          {/* JD Input panel */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <ClayCard className="flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Target size={16} className="text-primary" /> Skill Gap Reviewer
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Compare your selected resume version directly against your target job profile's description.
              </p>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 pl-1">Target Job Description</label>
                <textarea
                  placeholder="Paste the target job description or requirements list here..."
                  value={gapJobDesc}
                  onChange={(e) => setGapJobDesc(e.target.value)}
                  className="clay-input text-xs font-semibold h-36"
                />
              </div>
              <ClayButton
                onClick={handleGapAnalysis}
                disabled={gapLoading}
                className="bg-primary text-white hover:bg-secondary py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-2"
              >
                {gapLoading ? <><Loader2 size={14} className="animate-spin" /> Matching Skills...</> : <><Target size={14} /> Analyze Skill Gap</>}
              </ClayButton>
            </ClayCard>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {!gapResult ? (
              <ClayCard className="text-center py-32 text-slate-400 flex flex-col items-center gap-3">
                <Target size={36} className="text-slate-200" />
                <p className="font-semibold text-sm">Enter a target Job Description and trigger analysis to view your matching dashboard.</p>
              </ClayCard>
            ) : (
              <>
                {/* Score & Verdict */}
                <ClayCard className="p-6">
                  <div className="flex items-center gap-6 flex-wrap">
                    <ScoreRing score={gapResult.ats_score} label="Skill Match" />
                    <div className="flex-1">
                      <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${strengthColors[gapResult.resume_strength] || 'text-slate-600 bg-slate-50 border-slate-200'}`}>
                        {gapResult.resume_strength} Match
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 font-semibold leading-relaxed">
                        {gapResult.overall_feedback}
                      </p>
                    </div>
                  </div>
                </ClayCard>

                {/* Missing Skills and Keywords */}
                <ClayCard className="p-5 flex flex-col gap-3">
                  <h4 className="font-bold text-xs text-red-600 dark:text-red-400 flex items-center gap-1 uppercase">
                    <AlertTriangle size={13} /> Gaps: Missing Skills & Tech Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {gapResult.missing_keywords && gapResult.missing_keywords.length > 0 ? (
                      gapResult.missing_keywords.map((kw, i) => (
                        <SkillBadge key={i} label={kw} variant="missing" />
                      ))
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">No major tech stack gaps detected! Excellent job.</span>
                    )}
                  </div>
                </ClayCard>

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ClayCard className="p-5 flex flex-col gap-3">
                    <h4 className="font-bold text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1 uppercase">
                      <CheckCircle2 size={13} /> Matched Criteria
                    </h4>
                    <ul className="flex flex-col gap-2">
                      {gapResult.strengths?.map((s, i) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-slate-400 font-semibold flex items-start gap-2">
                          <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </ClayCard>
                  <ClayCard className="p-5 flex flex-col gap-3">
                    <h4 className="font-bold text-xs text-indigo-700 dark:text-indigo-400 flex items-center gap-1 uppercase">
                      <ArrowRight size={13} /> Recommended Action Items
                    </h4>
                    <ul className="flex flex-col gap-2">
                      {gapResult.weaknesses?.map((w, i) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-slate-400 font-semibold flex items-start gap-2">
                          <ArrowRight size={12} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </ClayCard>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: Interview Preparation ─────────────────────────────── */}
      {activeTab === 'interview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
          <div className="lg:col-span-4 flex flex-col gap-4">
            <ClayCard className="flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Mic size={16} className="text-primary" /> Interview Setup
              </h3>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 pl-1">Target Role</label>
                <input type="text" value={interviewRole} onChange={e => setInterviewRole(e.target.value)} className="clay-input text-xs font-semibold" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 pl-1">Interview Type</label>
                <select value={interviewType} onChange={e => setInterviewType(e.target.value)} className="py-2.5 px-4 outline-none border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <option value="technical">Technical Interview</option>
                  <option value="hr">HR Behavioral Interview</option>
                  <option value="coding">Coding / DSA Interview</option>
                  <option value="mock">Mock (Mixed) Interview</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 pl-1">Difficulty Level</label>
                <div className="flex gap-2">
                  {['easy', 'medium', 'hard'].map(d => (
                    <button key={d} onClick={() => setInterviewDifficulty(d)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl capitalize transition-all ${interviewDifficulty === d ? 'bg-primary text-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-slate-800 hover:bg-slate-105'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <ClayButton
                onClick={handleGenerateInterview}
                disabled={interviewLoading}
                className="bg-primary text-white hover:bg-secondary py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-2"
              >
                {interviewLoading ? <><Loader2 size={14} className="animate-spin" /> Generating Questions...</> : <><Sparkles size={14} /> Generate Questions</>}
              </ClayButton>
            </ClayCard>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-3">
            {questions.length === 0 && !interviewLoading ? (
              <ClayCard className="text-center py-32 text-slate-400 flex flex-col items-center gap-3">
                <Mic size={36} className="text-slate-200" />
                <p className="font-semibold text-sm">Configure your interview parameters and generate AI-powered questions.</p>
              </ClayCard>
            ) : (
              questions.map((q, i) => {
                const diffColors: Record<string, string> = { Easy: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400', Medium: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-400', Hard: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400' };
                const isExpanded = expandedQ === i;
                return (
                  <div key={i} className="p-4 bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col gap-2 cursor-pointer hover:border-primary/30 transition-all text-left"
                    onClick={() => setExpandedQ(isExpanded ? null : i)}>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2 items-center">
                        <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-extrabold text-[10px] flex items-center justify-center">{i + 1}</span>
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase">{q.category}</span>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${diffColors[q.difficulty] || 'text-slate-500 bg-slate-50 border-slate-200'}`}>{q.difficulty}</span>
                      </div>
                      <ChevronRight size={14} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200 leading-snug">{q.question}</p>
                    {isExpanded && (
                      <div className="mt-2 p-3 bg-primary/5 border border-primary/10 rounded-xl text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                        <span className="text-[9px] font-extrabold text-primary uppercase block mb-1">Model Answer / Key Points</span>
                        {q.expected_answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── TAB: Resume History ─────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="flex flex-col gap-4 text-left">
          <h3 className="font-bold text-base text-slate-755 dark:text-slate-300 pl-1">Resume Submission History</h3>
          {historyLoading ? (
            <ClayCard className="text-center py-16"><Loader2 size={24} className="animate-spin text-primary mx-auto" /></ClayCard>
          ) : history.length === 0 ? (
            <ClayCard className="text-center py-24 text-slate-400">
              <History size={36} className="text-slate-200 mx-auto mb-3" />
              <p className="font-semibold text-sm">No resume uploads yet. Upload your first resume to begin tracking your improvement.</p>
            </ClayCard>
          ) : (
            <div className="flex flex-col gap-3">
              {history.map((item, idx) => (
                <div key={item.id} className="p-5 bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex justify-between items-center hover:scale-[1.005] transition-transform">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <FileText size={18} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{item.file_name}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">{new Date(item.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">ATS Score</span>
                      <span className="font-extrabold text-lg text-primary">{item.ats_score.toFixed(0)}</span>
                    </div>
                    {item.improvement !== 0 && (
                      <div className="text-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Improvement</span>
                        <span className={`font-extrabold text-sm flex items-center gap-0.5 ${item.improvement > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          <ArrowUpRight size={13} />{item.improvement > 0 ? '+' : ''}{item.improvement.toFixed(1)}
                        </span>
                      </div>
                    )}
                    <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full border ${idx === 0 ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                      {idx === 0 ? 'Latest' : `v${history.length - idx}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
