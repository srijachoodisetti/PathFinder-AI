import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuthStore, API_URL } from '../store/authStore';
import { ClayCard, ClayButton, ClayAlert, SkeletonLoader } from '../components/ui';
import { OCRScanner } from '../components/ai/OCRScanner';
import { VoiceTutorController } from '../components/ai/VoiceTutorController';
import {
  Send,
  BrainCircuit,
  Languages,
  BookMarked,
  Sparkles,
  HelpCircle,
  FileText,
  Volume2,
  Calendar,
  Layers,
  Map,
  Repeat
} from 'lucide-react';

export const AITutorPage: React.FC = () => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(user?.student_profile?.language_preference || 'English');
  const [voiceActive, setVoiceActive] = useState(false);
  const [ocrActive, setOcrActive] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<'chat' | 'flashcards' | 'mindmap' | 'study_plan'>('chat');

  // Flashcards state
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [currentFlashIndex, setCurrentFlashIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Mind map state
  const [mindmap, setMindmap] = useState<any | null>(null);
  const [loadingMindmap, setLoadingMindmap] = useState(false);

  // Study plan state
  const [studyPlan, setStudyPlan] = useState<string | null>(null);
  const [loadingStudyPlan, setLoadingStudyPlan] = useState(false);

  // Bookmarks state
  const [bookmarkedList, setBookmarkedList] = useState<any[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory();
    fetchBookmarks();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/tutor/history`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const res = await axios.get(`${API_URL}/tutor/bookmarks`);
      setBookmarkedList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (textToSend: string, imageBase64?: string) => {
    if (!textToSend.trim() && !imageBase64) return;
    
    setLoading(true);
    setInputVal('');
    setOcrActive(false);

    const userMsg = {
      id: Date.now(),
      content: textToSend || "Uploaded image homework question",
      is_from_user: true,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await axios.post(`${API_URL}/tutor/chat`, {
        prompt: textToSend || "Explain the uploaded handwriting question",
        language: language,
        voice_output_requested: voiceActive,
        image_base64: imageBase64 || null
      });

      const aiMsg = {
        id: Date.now() + 1,
        content: response.data.response_text,
        translated_content: response.data.translated_text,
        audio_url: response.data.audio_url,
        is_from_user: false,
        created_at: new Date().toISOString(),
        is_bookmarked: false
      };
      setMessages(prev => [...prev, aiMsg]);

      if (voiceActive && response.data.audio_url) {
        const audio = new Audio(response.data.audio_url);
        audio.play();
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // AI Flashcards Fetcher
  const fetchFlashcards = async () => {
    setLoadingFlashcards(true);
    setFlipped(false);
    setCurrentFlashIndex(0);
    try {
      const res = await axios.post(`${API_URL}/tutor/flashcards`, {
        subject: "Science",
        topic: "Solar Panel Energy"
      });
      setFlashcards(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFlashcards(false);
    }
  };

  // AI Mindmap Fetcher
  const fetchMindmap = async () => {
    setLoadingMindmap(true);
    try {
      const res = await axios.post(`${API_URL}/tutor/mindmap`, {
        subject: "Science",
        topic: "Solar Power Cycles"
      });
      setMindmap(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMindmap(false);
    }
  };

  // AI Revision Plan Fetcher
  const fetchStudyPlan = async () => {
    setLoadingStudyPlan(true);
    try {
      const res = await axios.post(`${API_URL}/tutor/study-plan`, {
        grade: user?.student_profile?.grade || "Grade 6",
        subject: "Science",
        topic: "Solar Energy"
      });
      setStudyPlan(res.data.plan);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStudyPlan(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'flashcards' && flashcards.length === 0) fetchFlashcards();
    if (activeTab === 'mindmap' && !mindmap) fetchMindmap();
    if (activeTab === 'study_plan' && !studyPlan) fetchStudyPlan();
  }, [activeTab]);

  const handleSpeechInput = (transcribedText: string) => {
    setInputVal(transcribedText);
    handleSend(transcribedText);
  };

  const handleImageParsed = (base64: string, detectedText: string) => {
    handleSend(`Solve this math homework: ${detectedText}`, base64);
  };

  const toggleBookmark = async (msgId: number) => {
    try {
      const res = await axios.post(`${API_URL}/tutor/bookmark/${msgId}`);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, is_bookmarked: res.data.is_bookmarked } : m));
      fetchBookmarks();
    } catch (err) {
      console.error(err);
    }
  };

  // Recursive Mindmap node renderer
  const renderMindmapNode = (node: any, idx: number) => {
    return (
      <div key={idx} className="flex flex-col gap-3 pl-4 border-l border-primary/20 text-left">
        <div className="clay-card-flat py-2.5 px-4 bg-white border border-slate-100 shadow-sm text-xs font-bold text-text max-w-xs">
          💡 {node.name}
        </div>
        {node.children && node.children.length > 0 && (
          <div className="flex flex-col gap-2.5 ml-2.5">
            {node.children.map((child: any, cidx: number) => renderMindmapNode(child, cidx))}
          </div>
        )}
      </div>
    );
  };

  const samplePrompts = [
    { title: "Divide 3/4 by 1/2", q: "Show me step-by-step how to divide 3/4 by 1/2" },
    { title: "What is Solar Energy?", q: "What is Solar Energy and list 3 environmental benefits" }
  ];

  const languages = ['English', 'Hindi', 'Telugu', 'Tamil', 'Kannada', 'Malayalam', 'Marathi', 'Bengali'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-125px)] text-left">
      
      {/* Sidebar Controls */}
      <div className="lg:col-span-1 flex flex-col gap-4 max-h-full overflow-y-auto">
        <ClayCard className="p-4 flex flex-col gap-3">
          <h4 className="font-heading font-bold text-xs text-text/50 uppercase tracking-wider">
            Tutor Setup
          </h4>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text/80 flex items-center gap-1">
              <Languages size={14} className="text-primary" />
              Language Choice
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="clay-input !py-2 !px-3 bg-slate-50 cursor-pointer text-xs font-semibold"
            >
              {languages.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </ClayCard>

        <VoiceTutorController
          onSpeechTranscribed={handleSpeechInput}
          lastTutorResponse={messages.filter(m => !m.is_from_user).slice(-1)[0]?.translated_content || messages.filter(m => !m.is_from_user).slice(-1)[0]?.content}
          voiceActive={voiceActive}
          setVoiceActive={setVoiceActive}
        />

        <ClayButton
          onClick={() => setOcrActive(!ocrActive)}
          className={`flex items-center justify-center gap-2 py-3 border ${ocrActive ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white border-slate-200 text-text/75'}`}
        >
          📷 {ocrActive ? 'Close Scanner' : 'Scan Written Homework'}
        </ClayButton>

        {ocrActive && <OCRScanner onImageParsed={handleImageParsed} />}

        {/* Bookmarked Answers List */}
        <ClayCard className="p-4 flex flex-col gap-3">
          <h4 className="font-heading font-bold text-xs text-text/50 uppercase tracking-wider flex items-center gap-1.5">
            <BookMarked size={14} className="text-primary" />
            Bookmarked Answers
          </h4>
          
          <div className="flex flex-col gap-2">
            {bookmarkedList.length > 0 ? (
              bookmarkedList.map((bm, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 rounded-xl text-[10px] border border-slate-100 flex flex-col text-left">
                  <p className="font-bold text-text truncate mb-1">{bm.content.slice(0, 45)}...</p>
                  <span className="text-text/40">{new Date(bm.created_at).toLocaleDateString()}</span>
                </div>
              ))
            ) : (
              <span className="text-[10px] text-text/40 font-semibold py-1">
                No bookmarked answers.
              </span>
            )}
          </div>
        </ClayCard>
      </div>

      {/* Main Study Canvas */}
      <div className="lg:col-span-3 flex flex-col bg-white border border-slate-100 rounded-[28px] shadow-sm overflow-hidden h-full">
        {/* Tab Selector top bar */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-2.5 flex justify-between items-center flex-wrap gap-2">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-2 px-4 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${activeTab === 'chat' ? 'bg-primary text-white shadow-sm' : 'text-text/50 hover:bg-slate-100'}`}
            >
              <BrainCircuit size={14} />
              AI Chat Tutor
            </button>
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`py-2 px-4 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${activeTab === 'flashcards' ? 'bg-primary text-white shadow-sm' : 'text-text/50 hover:bg-slate-100'}`}
            >
              <Layers size={14} />
              AI Flashcards
            </button>
            <button
              onClick={() => setActiveTab('mindmap')}
              className={`py-2 px-4 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${activeTab === 'mindmap' ? 'bg-primary text-white shadow-sm' : 'text-text/50 hover:bg-slate-100'}`}
            >
              <Map size={14} />
              AI Mind Map
            </button>
            <button
              onClick={() => setActiveTab('study_plan')}
              className={`py-2 px-4 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${activeTab === 'study_plan' ? 'bg-primary text-white shadow-sm' : 'text-text/50 hover:bg-slate-100'}`}
            >
              <Calendar size={14} />
              Weekly Study Plan
            </button>
          </div>
          
          <span className="text-[10px] text-success font-extrabold bg-success/15 px-2.5 py-1 rounded-full">
            ● Gemini 1.5 Flash
          </span>
        </div>

        {/* Tab Canvas panels */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'chat' && (
            <div className="h-full flex flex-col">
              <div className="flex-1 flex flex-col gap-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-12 max-w-md mx-auto">
                    <span className="text-4xl">🤖</span>
                    <h3 className="font-heading font-extrabold text-xl">Ask your questions!</h3>
                    <p className="text-xs text-text/60 leading-relaxed">
                      I can help explain complex math equations, science concepts, or read summaries to you. Try clicking one of these presets:
                    </p>
                    
                    <div className="flex flex-col gap-2 w-full mt-2">
                      {samplePrompts.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(p.q)}
                          className="p-3 bg-slate-50 hover:bg-slate-100 border text-xs font-semibold text-text rounded-xl text-left shadow-sm transition-all"
                        >
                          💡 {p.title}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col gap-1.5 max-w-[80%] ${m.is_from_user ? 'self-end items-end' : 'self-start items-start'}`}
                    >
                      <div
                        className={`p-4 rounded-3xl text-sm leading-relaxed border ${
                          m.is_from_user
                            ? 'bg-primary text-white border-primary/20 shadow-md rounded-tr-none'
                            : 'bg-slate-50 text-text border-slate-100 shadow-[2px_2px_10px_rgba(0,0,0,0.02)] rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-line font-medium">
                          {m.is_from_user ? m.content : (m.translated_content || m.content)}
                        </p>
                      </div>
                      
                      {!m.is_from_user && (
                        <div className="flex gap-2.5 px-2 text-[10px] font-bold text-text/40 select-none">
                          <button
                            onClick={() => toggleBookmark(m.id)}
                            className={`hover:text-primary ${m.is_bookmarked ? 'text-primary' : ''}`}
                          >
                            {m.is_bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
                          </button>
                          {m.audio_url && (
                            <button
                              onClick={() => {
                                const audio = new Audio(m.audio_url);
                                audio.play();
                              }}
                              className="hover:text-primary flex items-center gap-0.5"
                            >
                              <Volume2 size={12} /> Play Voice
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}

                {loading && (
                  <div className="self-start max-w-[60%] flex flex-col gap-1 bg-slate-50 p-4 border rounded-3xl rounded-tl-none">
                    <SkeletonLoader lines={2} />
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="border-t border-slate-100 pt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Type your study question here..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend(inputVal)}
                  className="flex-1 clay-input bg-slate-50 focus:bg-white"
                  disabled={loading}
                />
                <ClayButton
                  onClick={() => handleSend(inputVal)}
                  variant="primary"
                  className="flex items-center justify-center p-3 rounded-2xl w-12 h-12 shadow-md active:scale-95"
                  disabled={loading}
                >
                  <Send size={18} />
                </ClayButton>
              </div>
            </div>
          )}

          {activeTab === 'flashcards' && (
            <div className="flex flex-col items-center justify-center h-full gap-6 max-w-md mx-auto py-6">
              {loadingFlashcards ? (
                <SkeletonLoader lines={3} className="w-full" />
              ) : flashcards.length > 0 ? (
                <div className="flex flex-col gap-6 w-full items-center">
                  <span className="text-xs font-bold text-text/40">
                    Card {currentFlashIndex + 1} of {flashcards.length}
                  </span>

                  {/* Flippable card body */}
                  <div
                    onClick={() => setFlipped(!flipped)}
                    className="w-full h-56 rounded-[32px] clay-card p-6 flex flex-col items-center justify-center text-center cursor-pointer select-none bg-white hover:scale-[1.02] active:scale-95 transition-all shadow-lg border border-slate-100"
                  >
                    {!flipped ? (
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-xs font-extrabold text-primary tracking-widest uppercase">Question</span>
                        <p className="font-heading font-extrabold text-sm text-text leading-snug">
                          {flashcards[currentFlashIndex].front}
                        </p>
                        <span className="text-[10px] text-text/40 font-semibold flex items-center gap-1 mt-4">
                          <Repeat size={12} /> Click card to flip
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-xs font-extrabold text-success tracking-widest uppercase">Answer</span>
                        <p className="text-xs text-text/80 font-medium leading-relaxed max-w-xs">
                          {flashcards[currentFlashIndex].back}
                        </p>
                        <span className="text-[10px] text-text/40 font-semibold flex items-center gap-1 mt-4">
                          <Repeat size={12} /> Click to show question
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Flashcards controls */}
                  <div className="flex gap-3 mt-2 w-full">
                    <ClayButton
                      onClick={() => {
                        setFlipped(false);
                        setCurrentFlashIndex(prev => Math.max(0, prev - 1));
                      }}
                      disabled={currentFlashIndex === 0}
                      className="flex-1 !py-2 text-xs"
                    >
                      Previous
                    </ClayButton>
                    <ClayButton
                      onClick={() => {
                        setFlipped(false);
                        setCurrentFlashIndex(prev => Math.min(flashcards.length - 1, prev + 1));
                      }}
                      disabled={currentFlashIndex === flashcards.length - 1}
                      className="flex-1 !py-2 text-xs"
                    >
                      Next
                    </ClayButton>
                  </div>
                </div>
              ) : (
                <div className="text-center text-text/40 flex flex-col gap-2">
                  <Layers size={36} />
                  <span className="text-xs font-semibold">No flashcards loaded.</span>
                  <ClayButton onClick={fetchFlashcards} variant="primary" className="!py-2 px-6 text-xs mt-2">
                    Generate Flashcards
                  </ClayButton>
                </div>
              )}
            </div>
          )}

          {activeTab === 'mindmap' && (
            <div className="flex flex-col gap-4 max-h-[450px] overflow-y-auto p-2">
              {loadingMindmap ? (
                <SkeletonLoader lines={4} />
              ) : mindmap ? (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b pb-2 mb-2">
                    <h3 className="font-heading font-extrabold text-sm">Conceptual Tree Map</h3>
                    <ClayButton onClick={fetchMindmap} className="!py-1.5 px-3 text-[10px] font-bold">
                      Rebuild Map
                    </ClayButton>
                  </div>
                  <div className="flex flex-col gap-4 pl-2">
                    {renderMindmapNode(mindmap, 0)}
                  </div>
                </div>
              ) : (
                <div className="text-center text-text/40 flex flex-col items-center gap-2 py-12">
                  <Map size={36} />
                  <span className="text-xs font-semibold">No mind map generated yet.</span>
                  <ClayButton onClick={fetchMindmap} variant="primary" className="!py-2 px-6 text-xs mt-2">
                    Generate Mind Map
                  </ClayButton>
                </div>
              )}
            </div>
          )}

          {activeTab === 'study_plan' && (
            <div className="flex flex-col gap-4 text-left">
              {loadingStudyPlan ? (
                <SkeletonLoader lines={4} />
              ) : studyPlan ? (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b pb-2 mb-2">
                    <h3 className="font-heading font-extrabold text-sm">7-Day Study Revision Table</h3>
                    <ClayButton onClick={fetchStudyPlan} className="!py-1.5 px-3 text-[10px] font-bold">
                      Refresh Planner
                    </ClayButton>
                  </div>
                  <div className="whitespace-pre-line text-xs leading-relaxed text-slate-800 font-medium">
                    {studyPlan}
                  </div>
                </div>
              ) : (
                <div className="text-center text-text/40 flex flex-col items-center gap-2 py-12">
                  <Calendar size={36} />
                  <span className="text-xs font-semibold">No study revision plan created.</span>
                  <ClayButton onClick={fetchStudyPlan} variant="primary" className="!py-2 px-6 text-xs mt-2">
                    Create Revision Planner
                  </ClayButton>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
