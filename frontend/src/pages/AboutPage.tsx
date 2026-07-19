import React from 'react';
import {
  BrainCircuit,
  FileText,
  Map,
  BookOpen,
  TrendingUp,
  Shield,
  Award,
  Target,
  BarChart2,
  User,
  Mail,
  Globe,
  Layers,
  Database,
  Code2,
  Cpu,
  Cloud
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const features = [
    { icon: BrainCircuit, label: 'AI Career Guidance', desc: 'Get personalized career path recommendations powered by Google Gemini AI.' },
    { icon: FileText, label: 'Resume Builder', desc: 'Build professional resumes with AI-assisted suggestions and templates.' },
    { icon: Target, label: 'ATS Resume Analysis', desc: 'Instantly check your resume score against real Applicant Tracking Systems.' },
    { icon: User, label: 'AI Interview Preparation', desc: 'Practice mock interviews with AI-generated domain-specific questions.' },
    { icon: BarChart2, label: 'Personalized Learning Dashboard', desc: 'Track XP, streaks, weak topics, and goals on a single dashboard.' },
    { icon: Award, label: 'Skill Assessment', desc: 'Evaluate technical and aptitude skills through adaptive quizzes.' },
    { icon: Map, label: 'Career Roadmaps', desc: 'Step-by-step roadmaps tailored to your target role and experience level.' },
    { icon: BookOpen, label: 'Learning Resources', desc: 'Curated video lectures, notes, and coding exercises across subjects.' },
    { icon: TrendingUp, label: 'Progress Tracking', desc: 'Visualize learning analytics with charts and weekly reports.' },
    { icon: Shield, label: 'Secure Student Authentication', desc: 'JWT-based authentication backed by a FastAPI + PostgreSQL backend.' },
  ];

  const techStack = [
    {
      category: 'Frontend',
      icon: Globe,
      color: 'from-blue-500 to-indigo-500',
      items: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
    },
    {
      category: 'Backend',
      icon: Database,
      color: 'from-emerald-500 to-teal-500',
      items: ['FastAPI', 'Python', 'PostgreSQL'],
    },
    {
      category: 'AI',
      icon: Cpu,
      color: 'from-purple-500 to-pink-500',
      items: ['Google Gemini API'],
    },
    {
      category: 'Deployment',
      icon: Cloud,
      color: 'from-orange-400 to-amber-500',
      items: ['Render'],
    },
  ];

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto w-full p-4 pb-16 font-body text-left">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-indigo-600 to-secondary p-8 md:p-12 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_white_0%,_transparent_70%)]" />
        <div className="relative z-10 flex flex-col gap-4">
          <span className="text-4xl">🌱</span>
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl leading-tight">
            About PathFinder AI
          </h1>
          <p className="text-base md:text-lg text-white/85 max-w-3xl font-medium leading-relaxed">
            PathFinder AI is an AI-powered career guidance and learning platform designed for college students. It helps students build resumes, prepare for interviews, receive personalized career recommendations, practice aptitude and technical questions, improve coding skills, and access AI-powered learning assistance—all from a single platform.
          </p>
        </div>
      </div>

      {/* ── Vision ── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col gap-3">
        <h2 className="font-heading font-extrabold text-xl text-slate-800 flex items-center gap-2">
          <span className="p-2 bg-primary/10 text-primary rounded-xl"><Target size={20} /></span>
          Our Vision
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          We believe every college student deserves access to smart, personalized tools that bridge
          the gap between academic learning and industry readiness. PathFinder AI empowers students
          to navigate their career paths with confidence — combining cutting-edge AI with a seamless
          learning experience that works for everyone, everywhere.
        </p>
      </div>

      {/* ── Key Features ── */}
      <div className="flex flex-col gap-5">
        <h2 className="font-heading font-extrabold text-xl text-slate-800 flex items-center gap-2">
          <span className="p-2 bg-secondary/10 text-secondary rounded-xl"><Layers size={20} /></span>
          Key Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="bg-white border border-slate-100 rounded-2xl p-5 flex gap-4 items-start shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200"
            >
              <div className="p-2.5 bg-primary/8 text-primary rounded-xl shrink-0">
                <Icon size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800 mb-0.5">{label}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tech Stack ── */}
      <div className="flex flex-col gap-5">
        <h2 className="font-heading font-extrabold text-xl text-slate-800 flex items-center gap-2">
          <span className="p-2 bg-accent/10 text-accent rounded-xl"><Code2 size={20} /></span>
          Technology Stack
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {techStack.map(({ category, icon: Icon, color, items }) => (
            <div key={category} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-sm`}>
                <Icon size={18} />
              </div>
              <h3 className="font-bold text-sm text-slate-800">{category}</h3>
              <ul className="flex flex-col gap-1">
                {items.map((item) => (
                  <li key={item} className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Developer Info ── */}
      <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-3xl p-8 shadow-sm flex flex-col gap-5">
        <h2 className="font-heading font-extrabold text-xl text-slate-800 flex items-center gap-2">
          <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><User size={20} /></span>
          Developer Information
        </h2>
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-heading font-extrabold text-2xl shadow-lg">
            S
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-heading font-extrabold text-lg text-slate-800">Srija Chodisetti</span>
            <a
              href="mailto:srijachoodisetti@gmail.com"
              className="flex items-center gap-2 text-sm text-primary font-semibold hover:underline"
            >
              <Mail size={14} />
              srijachoodisetti@gmail.com
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};
