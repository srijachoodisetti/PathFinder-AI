import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore, API_URL } from '../store/authStore';
import { ClayCard, ClayButton } from '../components/ui';
import { Award, Clock, ArrowRight, ShieldAlert, CheckCircle } from 'lucide-react';

export const ExamCenter: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };

  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await axios.get(`${API_URL}/assessment/exams`, { headers });
      setExams(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async (examId: number) => {
    try {
      await axios.post(`${API_URL}/assessment/exams/${examId}/start`, {}, { headers });
      navigate(`/exam/${examId}`);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4 text-left">
        <h3 className="text-slate-400">Loading active exams...</h3>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4">
      {/* Banner */}
      <div className="p-8 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 rounded-[28px] border border-white/60 shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] text-left flex justify-between items-center">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-slate-800 flex items-center gap-2">
            <Award className="text-primary" size={32} />
            <span>Assessment & Examination Center</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-2">
            Take practice, internal, semester, or mock placement exams, and check detailed AI evaluation reviews.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        {exams.length > 0 ? (
          exams.map((ex) => (
            <div key={ex.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:scale-[1.01] transition-all">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full uppercase">
                    {ex.exam_type} Exam
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock size={12} /> {ex.time_limit_minutes} Mins
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-800 leading-snug mt-2">{ex.title}</h3>
                <span className="text-xs text-slate-400 font-semibold block mt-1">Negative Marking: {ex.negative_marking} / wrong answer</span>
              </div>
              <div className="pt-6">
                <ClayButton
                  onClick={() => handleStartExam(ex.id)}
                  className="w-full bg-primary text-white hover:bg-secondary rounded-xl py-2.5 font-bold text-xs flex items-center justify-center gap-1"
                >
                  Start Exam <ArrowRight size={14} />
                </ClayButton>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 bg-slate-50 border border-slate-100 rounded-3xl text-center text-slate-400 font-semibold">
            No exams currently assigned to you.
          </div>
        )}
      </div>
    </div>
  );
};
