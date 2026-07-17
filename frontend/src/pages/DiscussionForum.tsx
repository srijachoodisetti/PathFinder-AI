import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore, API_URL } from '../store/authStore';
import { ClayCard, ClayButton, ClayInput } from '../components/ui';
import { MessageSquare, Sparkles, Pin, CheckCircle2, ArrowUp, ArrowDown, Share2 } from 'lucide-react';

export const DiscussionForum: React.FC = () => {
  const { token, user } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };

  const [discussions, setDiscussions] = useState<any[]>([]);
  const [selectedDisc, setSelectedDisc] = useState<any | null>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New post states
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  // Reply states
  const [replyText, setReplyText] = useState('');

  // Ask AI solver states
  const [aiDoubt, setAiDoubt] = useState('');
  const [aiExplanation, setAiExplanation] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/community/discussions`, { headers });
      setDiscussions(res.data);
      if (res.data.length > 0) {
        handleSelectDiscussion(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDiscussion = async (disc: any) => {
    setSelectedDisc(disc);
    try {
      const res = await axios.get(`${API_URL}/community/discussions/${disc.id}/replies`, { headers });
      setReplies(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePost = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    try {
      // Moderate content first
      const modRes = await axios.post(`${API_URL}/ai/moderate-post`, {
        title: newTitle,
        content: newContent
      }, { headers });

      if (modRes.data.is_flagged) {
        alert("Your post contains flagged keywords and cannot be submitted.");
        return;
      }

      const res = await axios.post(`${API_URL}/community/discussions`, {
        title: modRes.data.suggested_title || newTitle,
        content: newContent,
        subject_id: 1,
        topic_id: 1
      }, { headers });

      setDiscussions([res.data, ...discussions]);
      handleSelectDiscussion(res.data);
      setNewTitle('');
      setNewContent('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateReply = async () => {
    if (!replyText.trim() || !selectedDisc) return;
    try {
      const res = await axios.post(`${API_URL}/community/discussions/${selectedDisc.id}/reply`, {
        content: replyText
      }, { headers });
      setReplies([...replies, res.data]);
      setReplyText('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAskAI = async () => {
    if (!aiDoubt.trim()) return;
    setAiLoading(true);
    setAiExplanation('');
    try {
      const res = await axios.post(`${API_URL}/ai/explain-doubt`, {
        subject: "Database Management Systems",
        topic: "Database Schemas",
        doubt_text: aiDoubt
      }, { headers });
      setAiExplanation(res.data.explanation);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4 text-left">
        <h3 className="text-slate-400">Loading discussion board...</h3>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4 font-body">
      {/* Banner */}
      <div className="p-8 bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 rounded-[28px] border border-white/60 shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] text-left flex justify-between items-center">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-slate-800 flex items-center gap-2">
            <MessageSquare className="text-primary" size={32} />
            <span>Campus Discussion Forums</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-2">
            Ask curriculum questions, debate answers, and get direct assistance from teachers and AI solvers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
        {/* Forum List (Left panel) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <h3 className="font-bold text-base text-slate-700 pl-1">Forum Topics</h3>
          <ClayCard className="flex flex-col gap-3 max-h-[500px] overflow-y-auto">
            {discussions.map((d) => (
              <button
                key={d.id}
                onClick={() => handleSelectDiscussion(d)}
                className={`p-4 border rounded-2xl text-left transition-all ${
                  selectedDisc?.id === d.id ? 'bg-primary/5 border-primary' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-primary">DBMS Normalization</span>
                  {d.is_pinned && <Pin size={12} className="text-primary fill-current" />}
                </div>
                <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{d.title}</h4>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{d.content}</p>
              </button>
            ))}
          </ClayCard>

          {/* New Post Panel */}
          <ClayCard className="flex flex-col gap-3">
            <h4 className="font-bold text-xs text-slate-700 pl-1">Start New Thread</h4>
            <ClayInput placeholder="Topic summary title..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <textarea
              placeholder="Ask your doubt details..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="clay-input text-xs font-semibold h-24"
            />
            <ClayButton onClick={handleCreatePost} className="bg-primary text-white hover:bg-secondary py-2.5 font-bold text-xs">
              Post Thread
            </ClayButton>
          </ClayCard>
        </div>

        {/* Selected Discussion & Replies (Middle panel) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {selectedDisc ? (
            <>
              <ClayCard className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="font-heading font-extrabold text-base text-slate-800 leading-tight">{selectedDisc.title}</h2>
                  <div className="flex gap-2">
                    <button className="p-1.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 hover:text-primary"><ArrowUp size={14} /></button>
                    <button className="p-1.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 hover:text-red-500"><ArrowDown size={14} /></button>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mt-4 bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">{selectedDisc.content}</p>
              </ClayCard>

              {/* Replies */}
              <h3 className="font-bold text-base text-slate-700 pl-1">Answers & Replies</h3>
              <div className="flex flex-col gap-3">
                {replies.map((rep) => (
                  <div key={rep.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400">User ID: {rep.user_id}</span>
                      {rep.is_best_answer && (
                        <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-100">
                          <CheckCircle2 size={10} /> Pinned Answer
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rep.content}</p>
                  </div>
                ))}
              </div>

              {/* Create Reply */}
              <ClayCard className="flex gap-2 p-3">
                <input
                  type="text"
                  placeholder="Post an answer..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="clay-input text-xs font-semibold flex-1 outline-none border-none bg-slate-50 py-2 px-4 rounded-xl"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateReply()}
                />
                <ClayButton onClick={handleCreateReply} className="bg-primary text-white hover:bg-secondary px-5 py-2 font-bold text-xs">
                  Reply
                </ClayButton>
              </ClayCard>
            </>
          ) : (
            <ClayCard className="text-center text-slate-400 py-32">Select a discussion thread from the left list directory.</ClayCard>
          )}
        </div>

        {/* AI Doubt solver Ask Box (Right panel) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <h3 className="font-bold text-base text-slate-700 pl-1">AI Doubt Solver</h3>
          <ClayCard className="flex flex-col gap-4">
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-2">
              <Sparkles size={16} className="text-primary animate-pulse" />
              <span className="text-[10px] font-bold text-primary uppercase">Ask AI Tutor Panel</span>
            </div>
            <textarea
              placeholder="Paste doubt or concept to solve..."
              value={aiDoubt}
              onChange={(e) => setAiDoubt(e.target.value)}
              className="clay-input text-xs font-semibold h-32"
            />
            <ClayButton onClick={handleAskAI} disabled={aiLoading} className="bg-primary text-white hover:bg-secondary py-3 font-bold text-xs flex items-center justify-center gap-1">
              <Sparkles size={12} /> {aiLoading ? 'Explaining...' : 'Explain Doubt'}
            </ClayButton>

            {aiExplanation && (
              <div className="p-4 bg-slate-900 border border-slate-950 rounded-2xl text-xs font-mono text-emerald-400 leading-relaxed max-h-[300px] overflow-y-auto mt-2">
                {aiExplanation}
              </div>
            )}
          </ClayCard>
        </div>
      </div>
    </div>
  );
};
