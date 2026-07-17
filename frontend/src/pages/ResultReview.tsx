import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore, API_URL } from '../store/authStore';
import { ClayCard, ClayButton } from '../components/ui';
import { Award, CheckCircle2, TrendingUp, Sparkles, FileDown, BookOpen } from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';

export const ResultReview: React.FC = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState<any>(null);
  const [certLoading, setCertLoading] = useState(false);

  useEffect(() => {
    fetchResultDetails();
  }, [resultId]);

  const fetchResultDetails = async () => {
    try {
      const res = await axios.get(`${API_URL}/assessment/results/${resultId}`, { headers });
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCertificate = async () => {
    setCertLoading(true);
    try {
      const res = await axios.post(`${API_URL}/ai/generate-certificate`, {
        student_name: user?.full_name || "Student",
        contest_name: "Mock Assessment Exam",
        score: result?.total_score || 80.0
      }, { headers });
      setCertificate(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCertLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4 text-left">
        <h3 className="text-slate-400">Loading exam feedback...</h3>
      </div>
    );
  }

  const analysisData = [
    { name: 'DBMS Basics', score: result?.percentage || 85 },
    { name: 'SQL Queries', score: 90 },
    { name: 'Normal Forms', score: 65 }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4 text-left font-body">
      {/* Banner */}
      <div className="p-8 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-[28px] border border-white/60 shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] flex justify-between items-center">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-slate-800 flex items-center gap-2">
            <CheckCircle2 className="text-emerald-500" size={32} />
            <span>Exam Result Review</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-2">
            View detailed AI scores, topic analytics, and downloadable achievement certificates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Score & Charts */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <ClayCard className="p-6 text-center bg-slate-900 text-white rounded-3xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Final Score</span>
              <span className="text-4xl font-extrabold text-emerald-400 mt-2 block">{result?.total_score} Marks</span>
            </ClayCard>
            <ClayCard className="p-6 text-center bg-white border border-slate-100 rounded-3xl shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Percentage</span>
              <span className="text-4xl font-extrabold text-primary mt-2 block">{result?.percentage}%</span>
            </ClayCard>
          </div>

          <ClayCard className="p-6 flex flex-col gap-4">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
              <TrendingUp size={18} className="text-primary" /> Topic Performance breakdown
            </h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysisData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ClayCard>
        </div>

        {/* Right Side: AI Feedback & Certificate Generator */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <ClayCard className="p-5 flex flex-col gap-3">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
              <Sparkles size={16} className="text-primary" /> AI Evaluation Feedback
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 border border-slate-100 rounded-2xl">
              {result?.ai_feedback}
            </p>
          </ClayCard>

          <ClayCard className="p-5 flex flex-col gap-3">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
              <Award size={16} className="text-primary" /> Completion Certificate
            </h3>
            {certificate ? (
              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex flex-col gap-2">
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Certificate Issued!</span>
                <h4 className="font-bold text-xs text-slate-700">{certificate.contest_name}</h4>
                <p className="text-[10px] text-slate-400">ID: {certificate.certificate_id} | Issued: {certificate.date_issued}</p>
                <ClayButton className="bg-emerald-500 text-white hover:bg-emerald-600 text-xs font-bold py-2 rounded-xl mt-2 flex items-center justify-center gap-1">
                  <FileDown size={14} /> Download Certificate
                </ClayButton>
              </div>
            ) : (
              <ClayButton
                onClick={handleGenerateCertificate}
                disabled={certLoading}
                className="bg-primary text-white hover:bg-secondary text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-1.5"
              >
                <Sparkles size={14} /> {certLoading ? 'Generating Certificate...' : 'Claim Completion Certificate'}
              </ClayButton>
            )}
          </ClayCard>
        </div>
      </div>
    </div>
  );
};
