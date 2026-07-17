import React, { useState } from 'react';
import { ClayCard, ClayButton } from '../components/ui';
import { Award, BookOpen, Target, ExternalLink } from 'lucide-react';

const mockCertifications = [
  {
    id: 1,
    title: "Google Data Analytics Professional Certificate",
    issuer: "Google",
    platform: "Coursera (Audit)",
    difficulty: "Beginner",
    link: "https://www.coursera.org/professional-certificates/google-data-analytics"
  },
  {
    id: 2,
    title: "AWS Cloud Practitioner Essentials",
    issuer: "AWS",
    platform: "AWS Skill Builder",
    difficulty: "Beginner",
    link: "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/"
  },
  {
    id: 3,
    title: "Microsoft Certified: Azure Fundamentals (AZ-900)",
    issuer: "Microsoft",
    platform: "Microsoft Learn",
    difficulty: "Beginner",
    link: "https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/"
  },
  {
    id: 4,
    title: "Cisco Skills For All: JavaScript Essentials",
    issuer: "Cisco",
    platform: "Cisco Networking Academy",
    difficulty: "Intermediate",
    link: "https://skillsforall.com/course/javascript-essentials-1"
  },
  {
    id: 5,
    title: "NPTEL: Database Management Systems",
    issuer: "NPTEL",
    platform: "SWAYAM",
    difficulty: "Intermediate",
    link: "https://onlinecourses.nptel.ac.in/"
  }
];

export const CertificationsPage: React.FC = () => {
  const [completedList, setCompletedList] = useState<number[]>([]);

  const toggleComplete = (id: number) => {
    if (completedList.includes(id)) {
      setCompletedList(completedList.filter(item => item !== id));
    } else {
      setCompletedList([...completedList, id]);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4">
      {/* Banner */}
      <div className="p-8 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-[28px] border border-white/60 shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] text-left flex justify-between items-center">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-slate-800 flex items-center gap-2">
            <Award className="text-primary" size={32} />
            <span>Recommended Certifications</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-2">
            Enhance your credentials with industry-recognized free courses and certifications from Google, Microsoft, AWS, Cisco, and NPTEL.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        {mockCertifications.map((cert) => {
          const isCompleted = completedList.includes(cert.id);
          return (
            <div key={cert.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:scale-[1.01] transition-transform">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full uppercase">
                    {cert.issuer}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {cert.difficulty}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-800 leading-tight mt-1">{cert.title}</h3>
                <span className="text-xs text-slate-500 font-semibold mt-2 block">Platform: {cert.platform}</span>
              </div>
              <div className="flex flex-col gap-2 pt-6">
                <ClayButton
                  onClick={() => window.open(cert.link, '_blank')}
                  className="w-full text-xs font-bold py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center gap-1"
                >
                  <ExternalLink size={12} /> Go to Course
                </ClayButton>
                <ClayButton
                  onClick={() => toggleComplete(cert.id)}
                  className={`w-full text-xs font-bold py-2 rounded-xl border ${
                    isCompleted ? 'bg-primary text-white hover:bg-secondary' : 'bg-white hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {isCompleted ? '✓ Completed' : 'Mark as Completed'}
                </ClayButton>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
