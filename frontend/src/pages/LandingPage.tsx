import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  ArrowRight,
  BookOpen,
  Award,
  Shield,
  Volume2,
  Users,
  Smile,
  Globe,
  Sparkles,
  Leaf
} from 'lucide-react';
import { ClayCard, ClayButton } from '../components/ui';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const faqs = [
    {
      q: "How does PathFinder AI support offline learning in rural areas?",
      a: "Students can download course materials, textbook notes, and gamified quizzes while connected to a school or community center internet. Once downloaded, these assets work entirely offline without requiring network data. Answers submitted offline are queued locally and automatically synchronized when the device returns to an online zone."
    },
    {
      q: "What role do parents play in the platform?",
      a: "Parents receive a dedicated dashboard showing weekly progress. For parents who cannot read English, PathFinder AI translates reports and offers synthesized local language voice memos (Hindi, Telugu, Tamil, etc.) explaining their child's highlights."
    },
    {
      q: "How does the AI Recommendation engine work?",
      a: "Our backend monitors quiz scores and identifies specific weak topics (e.g., Fraction Division). The recommendation engine then curates lesson recommendations and custom flashcards to help the student master these topics step-by-step."
    }
  ];

  const languages = ['English', 'Hindi', 'Telugu', 'Tamil', 'Kannada', 'Malayalam', 'Marathi', 'Bengali'];

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-text flex flex-col font-body">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center shadow-[0_4px_25px_-10px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-primary/10 rounded-2xl text-primary font-bold text-xl select-none">🌱</span>
          <span className="font-heading font-extrabold text-2xl tracking-tight text-primary">
            PathFinder <span className="text-secondary">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 py-1.5 px-3 rounded-full text-xs font-semibold shadow-sm">
            <Globe size={14} className="text-primary" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="outline-none bg-transparent cursor-pointer font-medium"
            >
              {languages.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <ClayButton
            onClick={() => navigate('/login')}
            className="hidden sm:inline-block !py-2 !px-5 text-xs text-primary font-bold hover:bg-slate-50 border-slate-200"
          >
            Sign In
          </ClayButton>
          <ClayButton
            onClick={() => navigate('/signup')}
            variant="primary"
            className="!py-2 !px-5 text-xs text-white"
          >
            Get Started
          </ClayButton>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-16 md:py-24 text-center flex flex-col items-center gap-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-4 py-2 rounded-full shadow-sm animate-pulse-soft">
            <Leaf size={14} />
            <span>Theme: Sustainability & Social Impact</span>
          </div>

          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl text-text leading-[1.15] max-w-4xl">
            Personalized Learning <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              For Every Child, Everywhere
            </span>
          </h1>
          <p className="text-text/70 text-lg md:text-xl max-w-2xl font-medium mt-2">
            Empowering children in rural and underserved communities with AI-driven tutoring, multilingual speech interaction, and offline study tools.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <ClayButton
            onClick={() => navigate('/signup')}
            variant="primary"
            className="flex items-center gap-2 !py-4 !px-8 text-base shadow-lg"
          >
            <span>Create Student Account</span>
            <ArrowRight size={18} />
          </ClayButton>
          
          <ClayButton
            onClick={() => navigate('/login')}
            className="!py-4 !px-8 text-base bg-white border border-slate-200 shadow-md hover:bg-slate-50"
          >
            Teacher Login
          </ClayButton>
        </motion.div>

        {/* Hero Claymorphic Dashboard Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="w-full mt-6"
        >
          <ClayCard className="p-4 md:p-6 shadow-2xl relative overflow-hidden border border-slate-100 max-w-4xl mx-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-red-400" />
                <span className="w-3.5 h-3.5 rounded-full bg-yellow-400" />
                <span className="w-3.5 h-3.5 rounded-full bg-green-400" />
              </div>
              <span className="text-xs font-semibold bg-slate-100 px-3 py-1.5 rounded-full text-text/60">
                🚀 PathFinder AI Learning Dashboard
              </span>
            </div>

            {/* Simulated UI layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 flex flex-col gap-4 text-left">
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                  <h4 className="font-bold text-sm text-primary mb-1">Hi Rajesh! Continue Learning 📖</h4>
                  <p className="text-xs text-text/70">Subject: Science - Solar Power & Energy</p>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-primary h-full w-[70%] rounded-full" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3">
                    <span className="text-xl">🔥</span>
                    <div>
                      <h5 className="font-bold text-xs text-green-800 leading-none">4 Days</h5>
                      <span className="text-[10px] text-green-700">Study Streak</span>
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-xl flex items-center gap-3">
                    <span className="text-xl">⭐</span>
                    <div>
                      <h5 className="font-bold text-xs text-yellow-800 leading-none">240 XP</h5>
                      <span className="text-[10px] text-yellow-700">Experience Points</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left flex flex-col gap-2.5">
                <h4 className="font-bold text-xs text-text/80 flex items-center gap-1">
                  <Sparkles size={14} className="text-primary" />
                  AI Tutor Recommendation
                </h4>
                <p className="text-[10px] text-text/70">Based on your last quiz, let's practice:</p>
                <div className="p-2 bg-white rounded-lg border border-slate-100 text-xs font-semibold text-primary cursor-pointer hover:underline">
                  🔍 Divide Fractions Practice
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-100 text-xs font-semibold text-primary cursor-pointer hover:underline">
                  ☀️ Solar Heat Flow Note
                </div>
              </div>
            </div>
          </ClayCard>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16 px-6 border-y border-slate-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col gap-2">
            <h3 className="font-heading font-extrabold text-4xl md:text-5xl text-primary">15,000+</h3>
            <span className="text-sm font-semibold text-text/60">Students Reached in Rural Districts</span>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-heading font-extrabold text-4xl md:text-5xl text-secondary">92%</h3>
            <span className="text-sm font-semibold text-text/60">Average Score Improvement</span>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-heading font-extrabold text-4xl md:text-5xl text-accent">100%</h3>
            <span className="text-sm font-semibold text-text/60">Offline-Capable Study Syncing</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 max-w-6xl mx-auto flex flex-col gap-12">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-text">
            Everything Needed to Empower Learners
          </h2>
          <p className="text-sm text-text/60 font-medium">
            PathFinder AI provides deep personalization, helping educators support kids with diverse needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ClayCard className="flex flex-col gap-4 text-left hover:scale-[1.02]">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Sparkles size={24} />
            </div>
            <h3 className="font-bold text-lg">AI Conversational Tutor</h3>
            <p className="text-sm text-text/60 leading-relaxed">
              Students ask questions through chat, upload worksheets for OCR handwriting decoding, or trigger voice commands.
            </p>
          </ClayCard>

          <ClayCard className="flex flex-col gap-4 text-left hover:scale-[1.02]">
            <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary">
              <Volume2 size={24} />
            </div>
            <h3 className="font-bold text-lg">Multilingual Audio Reports</h3>
            <p className="text-sm text-text/60 leading-relaxed">
              Provides translation in Hindi, Telugu, Tamil, Marathi, and more. Bridges local dialects so no student or parent gets left behind.
            </p>
          </ClayCard>

          <ClayCard className="flex flex-col gap-4 text-left hover:scale-[1.02]">
            <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
              <Award size={24} />
            </div>
            <h3 className="font-bold text-lg">Offline-First Synchronizer</h3>
            <p className="text-sm text-text/60 leading-relaxed">
              Save lesson notes, flashcards, and quizzes offline. Keep progress safe and auto-upload records when network joins.
            </p>
          </ClayCard>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-slate-50 py-20 px-6 border-t border-slate-100">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          <h2 className="font-heading font-bold text-3xl text-center text-text mb-4">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <ClayCard
                key={i}
                className="p-4 cursor-pointer select-none transition-all duration-200"
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-text/80">{faq.q}</h4>
                  <span className="text-primary font-bold">{activeFaq === i ? '−' : '+'}</span>
                </div>
                {activeFaq === i && (
                  <p className="text-xs text-text/60 leading-relaxed mt-3 border-t pt-3">
                    {faq.a}
                  </p>
                )}
              </ClayCard>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 px-6 border-t border-slate-100 text-center text-text/40 text-xs flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-primary/10 rounded-xl text-primary font-bold text-sm">🌱</span>
          <span className="font-heading font-bold text-sm text-primary">PathFinder AI</span>
        </div>
        <p>© 2026 PathFinder AI. All rights reserved. Supporting rural education under Sustainable Development Goals (SDG 4).</p>
      </footer>
    </div>
  );
};
