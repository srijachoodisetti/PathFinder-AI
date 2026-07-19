import React, { useState } from 'react';
import { ClayCard, ClayButton, ClayInput } from '../components/ui';
import { Briefcase, MapPin, Building, Calendar, DollarSign, Search, CheckCircle } from 'lucide-react';

const mockInternships = [
  {
    id: 1,
    company: "Google India",
    role: "Software Engineering Intern",
    location: "Bangalore (Hybrid)",
    duration: "2 Months",
    stipend: "₹80,000 / month",
    applied: true,
    status: "applied"
  },
  {
    id: 2,
    company: "AWS Cloud Solutions",
    role: "Cloud Support Associate Intern",
    location: "Hyderabad (Remote)",
    duration: "3 Months",
    stipend: "₹50,000 / month",
    applied: false,
    status: "recommended"
  },
  {
    id: 3,
    company: "Cisco Systems",
    role: "Network Security Intern",
    location: "Pune (In-office)",
    duration: "6 Months",
    stipend: "₹45,000 / month",
    applied: false,
    status: "recommended"
  }
];

export const InternshipHub: React.FC = () => {
  const [internships, setInternships] = useState(mockInternships);
  const [search, setSearch] = useState('');

  const toggleApply = (id: number) => {
    setInternships(internships.map(i => {
      if (i.id === id) {
        return { ...i, applied: !i.applied, status: i.applied ? 'recommended' : 'applied' };
      }
      return i;
    }));
  };

  const filtered = internships.filter(i => 
    i.company.toLowerCase().includes(search.toLowerCase()) || 
    i.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4">
      {/* Banner */}
      <div className="p-8 bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 rounded-[28px] border border-white/60 shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] text-left flex justify-between items-center">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-slate-800 flex items-center gap-2">
            <Briefcase className="text-emerald-500" size={32} />
            <span>Engineering Internship Hub</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-2">
            Explore curated internship recommendations and track your active application status.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-5 bg-white rounded-3xl border border-white/70 shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] text-left">
        <div className="relative flex items-center max-w-md">
          <Search size={16} className="absolute left-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="clay-input pl-11 w-full"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:scale-[1.01] transition-transform">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Building size={14} /> {item.company}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.applied ? 'bg-primary/10 text-primary' : 'bg-amber-50 text-amber-600'
                }`}>
                  {item.status.toUpperCase()}
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-800 leading-tight mt-1">{item.role}</h3>
              <div className="flex flex-col gap-1.5 mt-3 text-xs text-slate-500 font-semibold">
                <div className="flex items-center gap-1.5"><MapPin size={13} /> {item.location}</div>
                <div className="flex items-center gap-1.5"><Calendar size={13} /> Duration: {item.duration}</div>
                <div className="flex items-center gap-1.5"><DollarSign size={13} /> Stipend: {item.stipend}</div>
              </div>
            </div>
            <div className="pt-6">
              <ClayButton
                onClick={() => toggleApply(item.id)}
                className={`w-full text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1 ${
                  item.applied ? 'bg-slate-50 text-slate-400 hover:bg-slate-100' : 'bg-primary text-white hover:bg-secondary'
                }`}
              >
                {item.applied ? <CheckCircle size={14} /> : null}
                {item.applied ? 'Applied' : 'Apply Now'}
              </ClayButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
