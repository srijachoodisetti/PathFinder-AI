import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore, API_URL } from '../store/authStore';
import { ClayCard, ClayButton, ClayInput, ClaySelect } from '../components/ui';
import { Landmark, Calendar, FileText, Briefcase, Share2, Search, CheckCircle, Upload, Sparkles } from 'lucide-react';

export const CampusHub: React.FC = () => {
  const { token, user } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };

  const [activeTab, setActiveTab] = useState<'events' | 'resources' | 'interviews'>('events');

  // Events & Announcements
  const [events, setEvents] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<number[]>([]);

  // Resource sharing states
  const [resources, setResources] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [resTitle, setResTitle] = useState('');
  const [resType, setResType] = useState('pdf');
  const [resLink, setResLink] = useState('');

  // Interview Experiences states
  const [interviews, setInterviews] = useState<any[]>([]);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [rounds, setRounds] = useState('');
  const [tips, setTips] = useState('');

  useEffect(() => {
    fetchEvents();
    fetchAnnouncements();
    fetchResources();
    fetchInterviews();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_URL}/community/events`, { headers });
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get(`${API_URL}/community/announcements`, { headers });
      setAnnouncements(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchResources = async () => {
    try {
      const res = await axios.get(`${API_URL}/community/resources`, { headers });
      setResources(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInterviews = async () => {
    try {
      const res = await axios.get(`${API_URL}/community/interviews`, { headers });
      setInterviews(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterEvent = async (id: number) => {
    try {
      const res = await axios.post(`${API_URL}/community/events/${id}/register`, {}, { headers });
      setEvents(events.map(e => e.id === id ? res.data : e));
      setRegisteredEvents([...registeredEvents, id]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadResource = async () => {
    if (!resTitle.trim() || !resLink.trim()) return;
    try {
      const res = await axios.post(`${API_URL}/community/resources`, {
        title: resTitle,
        resource_type: resType,
        file_url: resLink,
        subject_id: 1
      }, { headers });
      setResources([...resources, res.data]);
      setResTitle('');
      setResLink('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleShareInterview = async () => {
    if (!company.trim() || !role.trim() || !rounds.trim()) return;
    try {
      const res = await axios.post(`${API_URL}/community/interviews`, {
        company,
        role,
        rounds_description: rounds,
        preparation_tips: tips
      }, { headers });
      setInterviews([res.data, ...interviews]);
      setCompany('');
      setRole('');
      setRounds('');
      setTips('');
    } catch (err) {
      console.error(err);
    }
  };

  const filteredResources = resources.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.resource_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4 font-body">
      {/* Banner */}
      <div className="p-8 bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 rounded-[28px] border border-white/60 shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] text-left flex justify-between items-center">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-slate-800 flex items-center gap-2">
            <Landmark className="text-primary" size={32} />
            <span>Campus Community & Resources Hub</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-2">
            Participate in upcoming campus hackathons, read interview preparation experiences, and download exam materials.
          </p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-4 p-2 bg-white rounded-2xl border border-slate-100 shadow-sm self-start">
        <button
          onClick={() => setActiveTab('events')}
          className={`py-2 px-5 font-bold text-sm rounded-xl transition-all cursor-pointer ${
            activeTab === 'events' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Events & Notices
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`py-2 px-5 font-bold text-sm rounded-xl transition-all cursor-pointer ${
            activeTab === 'resources' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Resource Library
        </button>
        <button
          onClick={() => setActiveTab('interviews')}
          className={`py-2 px-5 font-bold text-sm rounded-xl transition-all cursor-pointer ${
            activeTab === 'interviews' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Interview Experiences
        </button>
      </div>

      <div className="w-full">
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-start">
            {/* Left: Events */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-700 pl-1">Campus Events Registry</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((e) => {
                  const isReg = registeredEvents.includes(e.id);
                  return (
                    <div key={e.id} className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col justify-between hover:scale-[1.01] transition-transform">
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">{e.event_type}</span>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Calendar size={12} /> {new Date(e.event_date).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-800 mt-3">{e.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">{e.description}</p>
                      </div>
                      <div className="mt-6 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400">{e.registration_count} registered</span>
                        <ClayButton
                          onClick={() => handleRegisterEvent(e.id)}
                          className={`text-[10px] font-extrabold py-2 px-4 rounded-xl flex items-center gap-1 ${
                            isReg ? 'bg-slate-50 text-slate-400 border border-slate-200' : 'bg-primary text-white hover:bg-secondary'
                          }`}
                        >
                          {isReg ? <CheckCircle size={12} /> : null}
                          {isReg ? 'Registered' : 'Register Now'}
                        </ClayButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Notices */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-700 pl-1">Campus Notices</h3>
              <div className="flex flex-col gap-3">
                {announcements.map((a) => (
                  <div key={a.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase">{a.announcement_type} notice</span>
                      <span className="text-[9px] font-bold text-slate-400">{new Date(a.created_at).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-800 mt-2">{a.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{a.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-start">
            {/* Upload form */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-700 pl-1">Share Resource</h3>
              <ClayCard className="flex flex-col gap-4">
                <ClayInput label="Document Title" value={resTitle} onChange={(e) => setResTitle(e.target.value)} />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 pl-1">Resource Type</label>
                  <select
                    value={resType}
                    onChange={(e) => setResType(e.target.value)}
                    className="py-2.5 px-4 outline-none border border-slate-100 rounded-xl bg-slate-50 focus:bg-white text-xs font-bold text-slate-600"
                  >
                    <option value="pdf">Lecture PDF Notes</option>
                    <option value="ppt">Slides Presentation (PPT)</option>
                    <option value="lab_code">Lab Code program</option>
                    <option value="research">Research Publication</option>
                  </select>
                </div>
                <ClayInput label="Document URL Link" value={resLink} onChange={(e) => setResLink(e.target.value)} placeholder="e.g. https://files.edu/normal-forms.pdf" />
                <ClayButton onClick={handleUploadResource} className="bg-primary text-white hover:bg-secondary rounded-xl py-3 font-bold text-xs flex items-center justify-center gap-1.5 mt-2">
                  <Upload size={14} /> Upload Material
                </ClayButton>
              </ClayCard>
            </div>

            {/* List */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-700 pl-1">Materials directory</h3>
              <ClayCard className="flex flex-col gap-4">
                <div className="relative flex items-center">
                  <Search size={14} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="clay-input pl-11 w-full text-xs font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-3 mt-2">
                  {filteredResources.map((res) => (
                    <div key={res.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center text-xs font-semibold text-slate-700">
                      <div>
                        <span className="text-[9px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">{res.resource_type}</span>
                        <h4 className="font-bold text-sm text-slate-800 mt-1">{res.title}</h4>
                      </div>
                      <a href={res.file_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-primary hover:underline">
                        Download Link
                      </a>
                    </div>
                  ))}
                </div>
              </ClayCard>
            </div>
          </div>
        )}

        {activeTab === 'interviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-start">
            {/* Share Form */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-700 pl-1">Share Experience</h3>
              <ClayCard className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <ClayInput label="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
                  <ClayInput label="Role" value={role} onChange={(e) => setRole(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 pl-1">Rounds & Questions Faced</label>
                  <textarea value={rounds} onChange={(e) => setRounds(e.target.value)} className="clay-input text-xs font-semibold h-24" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 pl-1">Preparation Tips</label>
                  <textarea value={tips} onChange={(e) => setTips(e.target.value)} className="clay-input text-xs font-semibold h-20" />
                </div>
                <ClayButton onClick={handleShareInterview} className="bg-primary text-white hover:bg-secondary rounded-xl py-3 font-bold text-xs mt-2">
                  Post Experience
                </ClayButton>
              </ClayCard>
            </div>

            {/* Experiences list */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <h3 className="font-bold text-base text-slate-700 pl-1">Interview Reviews</h3>
              <div className="flex flex-col gap-4">
                {interviews.map((exp) => (
                  <div key={exp.id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                      <div>
                        <h4 className="font-bold text-base text-slate-800 leading-tight">{exp.company}</h4>
                        <span className="text-xs text-slate-400 font-semibold">{exp.role}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">{new Date(exp.created_at).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Rounds Faced:</span>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">{exp.rounds_description}</p>
                    </div>
                    {exp.preparation_tips && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Preparation Tips:</span>
                        <p className="text-xs text-slate-600 leading-relaxed mt-1">{exp.preparation_tips}</p>
                      </div>
                    )}
                    {exp.ai_summary && (
                      <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex flex-col gap-1.5 mt-2">
                        <span className="text-[10px] font-extrabold text-primary uppercase flex items-center gap-1">
                          <Sparkles size={12} className="animate-pulse" /> AI Synthesis Summary
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed">{exp.ai_summary}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
