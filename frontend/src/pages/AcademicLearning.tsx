import React, { useState, useMemo } from 'react';
import { BookOpen, Sparkles, Video, FileText, GraduationCap, ChevronRight, Activity, Cpu, Download, PlayCircle, Book, ClipboardList } from 'lucide-react';
import { ClayCard, ClayButton } from '../components/ui';

// ── Static data ──────────────────────────────────────────────────────────────

const BRANCHES = [
  { id: 'cse', label: 'Computer Science Engineering' },
  { id: 'ds', label: 'Data Science' },
  { id: 'ai', label: 'Artificial Intelligence' },
  { id: 'it', label: 'Information Technology' },
  { id: 'ece', label: 'Electronics & Communication (ECE)' },
  { id: 'eee', label: 'Electrical & Electronics (EEE)' },
  { id: 'mech', label: 'Mechanical Engineering' },
  { id: 'civil', label: 'Civil Engineering' },
];

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

type SubjectMap = Record<string, Record<number, string[]>>;

const SUBJECTS_BY_BRANCH_SEM: SubjectMap = {
  cse: {
    1: ['Engineering Mathematics I', 'Engineering Physics', 'Programming in C', 'Engineering Drawing', 'Communication Skills'],
    2: ['Engineering Mathematics II', 'Engineering Chemistry', 'Data Structures', 'Digital Electronics', 'Environmental Science'],
    3: ['Discrete Mathematics', 'Object Oriented Programming', 'Computer Organization', 'Database Management Systems', 'Probability & Statistics'],
    4: ['Design & Analysis of Algorithms', 'Operating Systems', 'Computer Networks', 'Software Engineering', 'Theory of Computation'],
    5: ['Compiler Design', 'Artificial Intelligence', 'Machine Learning', 'Data Mining', 'Cloud Computing'],
    6: ['Deep Learning', 'Natural Language Processing', 'Cyber Security', 'Distributed Systems', 'Mobile Computing'],
    7: ['Big Data Analytics', 'Blockchain Technology', 'DevOps & CI/CD', 'Internet of Things', 'Project I'],
    8: ['Entrepreneurship', 'Research Methodology', 'Project II', 'Industry Elective I', 'Industry Elective II'],
  },
  ds: {
    1: ['Engineering Mathematics I', 'Statistics & Probability', 'Python Programming', 'Data Visualization Basics', 'Communication Skills'],
    2: ['Linear Algebra', 'Database Management', 'Data Structures in Python', 'Web Technologies', 'Analytical Reasoning'],
    3: ['Machine Learning I', 'Advanced SQL', 'R Programming', 'Data Warehousing', 'Business Intelligence'],
    4: ['Machine Learning II', 'Deep Learning', 'Big Data Technologies', 'Feature Engineering', 'Research Methods'],
    5: ['Natural Language Processing', 'Computer Vision', 'Time Series Analysis', 'Data Ethics', 'Cloud for Data Science'],
    6: ['Reinforcement Learning', 'Graph Analytics', 'MLOps', 'Advanced Deep Learning', 'Project Management'],
    7: ['Capstone Project I', 'Streaming Data Analytics', 'Domain Elective I', 'Domain Elective II', 'Internship'],
    8: ['Capstone Project II', 'Entrepreneurship', 'Domain Elective III', 'Research Paper Writing', 'Industry Seminar'],
  },
  ai: {
    1: ['Mathematics for AI', 'Programming Foundations', 'Logic & Reasoning', 'Engineering Physics', 'Communication Skills'],
    2: ['Probability & Bayesian Inference', 'Data Structures', 'Linear Algebra', 'Computational Thinking', 'Soft Skills'],
    3: ['Machine Learning', 'Knowledge Representation', 'Computer Vision Basics', 'NLP Fundamentals', 'Research Methodology'],
    4: ['Deep Learning', 'Robotics & Automation', 'Expert Systems', 'Advanced NLP', 'Optimization Methods'],
    5: ['Generative AI', 'Reinforcement Learning', 'Autonomous Systems', 'AI Ethics & Policy', 'Human-AI Interaction'],
    6: ['AI in Healthcare', 'Cognitive Computing', 'Multi-Agent Systems', 'Explainable AI', 'Quantum Computing Basics'],
    7: ['AI Research Project I', 'AI Product Development', 'Elective I', 'Elective II', 'Industry Seminar'],
    8: ['AI Research Project II', 'Startup Essentials', 'Elective III', 'Advanced Research', 'Industry Capstone'],
  },
  it: {
    1: ['Maths I', 'Programming in C', 'IT Fundamentals', 'Physics', 'English'],
    2: ['Maths II', 'OOP with Java', 'Data Structures', 'Computer Architecture', 'Chemistry'],
    3: ['DBMS', 'OS', 'Networking Basics', 'Web Development', 'Discrete Mathematics'],
    4: ['Software Engineering', 'Computer Networks', 'System Administration', 'Information Security', 'Statistics'],
    5: ['Cloud Computing', 'Cyber Security', 'DevOps', 'Mobile App Dev', 'Distributed Systems'],
    6: ['IT Project Management', 'Machine Learning', 'ERP Systems', 'AI Fundamentals', 'Entrepreneurship'],
    7: ['IT Audit', 'Blockchain', 'Digital Marketing', 'Capstone I', 'Technical Writing'],
    8: ['Capstone II', 'Research Paper', 'Industry Elective', 'IT Policy', 'Global IT Trends'],
  },
  ece: {
    1: ['Engineering Maths I', 'Engineering Physics', 'Basic Electrical', 'Workshop', 'English'],
    2: ['Engineering Maths II', 'Electronic Devices', 'Programming Basics', 'Engineering Drawing', 'Chemistry'],
    3: ['Signals & Systems', 'Analog Circuits', 'Digital Logic Design', 'Network Analysis', 'Electromagnetic Theory'],
    4: ['Communication Theory', 'Microprocessors', 'Control Systems', 'DSP', 'VLSI Design'],
    5: ['Wireless Communication', 'Embedded Systems', 'Antenna Design', 'RF Engineering', 'Advanced DSP'],
    6: ['Optical Communication', 'IoT Systems', 'Radar Systems', 'Satellite Communication', '5G Networks'],
    7: ['Image Processing', 'MEMS Technology', 'Capstone Project I', 'Technical Elective I', 'Seminar'],
    8: ['Capstone Project II', 'Research Paper', 'Elective II', 'Elective III', 'Industry Preparation'],
  },
  eee: {
    1: ['Engineering Maths I', 'Basic Electrical', 'Physics', 'Workshop Practice', 'English'],
    2: ['Engineering Maths II', 'Circuit Theory', 'Electrical Machines I', 'Engineering Drawing', 'Chemistry'],
    3: ['Electrical Machines II', 'Measurements & Instrumentation', 'Power Systems I', 'Electromagnetism', 'Digital Logic'],
    4: ['Power Electronics', 'Control Systems', 'Power Systems II', 'Microcontrollers', 'Industrial Automation'],
    5: ['High Voltage Engg', 'Smart Grid', 'Electric Drives', 'Renewable Energy', 'Power Quality'],
    6: ['Protection & Switchgear', 'PLC & SCADA', 'Flexible AC Transmission', 'Energy Management', 'Power System Planning'],
    7: ['Research Project I', 'EV Technology', 'Elective I', 'Elective II', 'Technical Seminar'],
    8: ['Research Project II', 'Entrepreneurship', 'Elective III', 'Industrial Training', 'Paper Presentation'],
  },
  mech: {
    1: ['Engineering Maths I', 'Physics', 'Workshop Technology', 'Engineering Drawing', 'English'],
    2: ['Engineering Maths II', 'Thermodynamics I', 'Mechanics of Solids', 'Fluid Mechanics', 'Chemistry'],
    3: ['Thermodynamics II', 'Manufacturing Processes', 'Kinematics', 'Material Science', 'Statistics'],
    4: ['Machine Design', 'Heat Transfer', 'Dynamics of Machinery', 'Metrology & QC', 'IC Engines'],
    5: ['FEM', 'Refrigeration & AC', 'CNC Technology', 'Tribology', 'Industrial Engineering'],
    6: ['CAD/CAM', 'Operations Research', 'Non-Destructive Testing', 'Product Design', 'Automation'],
    7: ['Capstone I', 'Additive Manufacturing', 'Elective I', 'Robotics', 'Technical Seminar'],
    8: ['Capstone II', 'Composite Materials', 'Elective II', 'Research Paper', 'Industry Internship'],
  },
  civil: {
    1: ['Engineering Maths I', 'Engineering Geology', 'Surveying I', 'Engineering Drawing', 'Chemistry'],
    2: ['Engineering Maths II', 'Surveying II', 'Fluid Mechanics', 'Construction Materials', 'Mechanics'],
    3: ['Structural Analysis I', 'Soil Mechanics', 'Transportation Engineering', 'Hydraulics', 'Environmental Engineering'],
    4: ['Structural Analysis II', 'Foundation Engineering', 'Water Supply Engineering', 'Construction Management', 'Highways'],
    5: ['Design of Structures', 'Waste Water Treatment', 'Quantity Surveying', 'Remote Sensing', 'Bridge Engineering'],
    6: ['Advanced Foundation', 'GIS Applications', 'Pavement Design', 'Urban Planning', 'Earthquake Engg'],
    7: ['Capstone I', 'Project Management', 'Elective I', 'Disaster Management', 'Technical Seminar'],
    8: ['Capstone II', 'BIM Technology', 'Elective II', 'Research', 'Industry Internship'],
  },
};

type ResourceSet = {
  notes: string[];
  keyTopics: string[];
  pdfLinks: { title: string; url: string }[];
  videoLinks: { title: string; channel: string; url: string }[];
  assignments: string[];
  referenceBooks: string[];
};

const generateSubjectResources = (subject: string, branch: string, sem: number): ResourceSet => ({
  notes: [
    `**Introduction to ${subject}** — This unit covers foundational concepts including core definitions, theoretical underpinnings, and real-world engineering applications. Topics span the primary frameworks used in industry and academia.`,
    `**Key Concepts & Algorithms** — Understand the major algorithms, models, and design patterns in ${subject}. Each concept is explained from first principles with worked examples.`,
    `**Advanced Topics & Case Studies** — Industry-level case studies showcasing how ${subject} is applied in modern ${branch} engineering environments including optimization, deployment, and troubleshooting.`,
    `**Summary & Exam Revision** — Concise quick-reference summaries covering all exam-relevant material, common MCQs, and short-answer preparation with memory-aid formulas.`,
  ],
  keyTopics: [
    `Fundamentals of ${subject}`,
    `Design & Analysis Techniques`,
    `Implementation Best Practices`,
    `Performance Optimization`,
    `Real-World Applications`,
    `Common Pitfalls & Debugging`,
    `Recent Advances & Trends`,
  ],
  pdfLinks: [
    { title: `${subject} — NPTEL Lecture Notes (PDF)`, url: 'https://nptel.ac.in' },
    { title: `${subject} — MIT OpenCourseWare Materials`, url: 'https://ocw.mit.edu' },
    { title: `${subject} — Gate Academy Reference`, url: 'https://gateacademy.co.in' },
    { title: `${subject} — Anna University Question Bank`, url: '#' },
  ],
  videoLinks: [
    { title: `${subject} Full Course`, channel: 'NPTEL', url: 'https://nptel.ac.in' },
    { title: `${subject} Crash Course`, channel: 'MIT OpenCourseWare', url: 'https://ocw.mit.edu' },
    { title: `${subject} for ${branch} Engineers`, channel: 'Gate Smashers', url: 'https://youtube.com' },
    { title: `${subject} — Placement Preparation`, channel: 'CodeHelp by Babbar', url: 'https://youtube.com' },
  ],
  assignments: [
    `Assignment 1: Write a 500-word analysis of a real-world ${subject} use case in ${branch} industry.`,
    `Assignment 2: Implement a basic project demonstrating core ${subject} concepts with documentation.`,
    `Assignment 3: Compare two methodologies in ${subject} with a performance benchmark report.`,
    `Assignment 4: Present on the latest developments in ${subject} (2024/25) with 10 slides.`,
    `Assignment 5: Prepare a lab exercise report solving 5 problems from past GATE/University papers.`,
  ],
  referenceBooks: [
    `"${subject}: Concepts and Applications" — Standard Textbook, 4th Edition`,
    `"Engineering ${subject} — A Practical Approach" — Oxford University Press`,
    `"${subject} Fundamentals" — Pearson Education`,
    `"Advanced ${subject} for ${branch}" — Springer`,
    `"Problems in ${subject} with Solutions" — PHI Learning`,
  ],
});

// ── Component ─────────────────────────────────────────────────────────────────

export const AcademicLearning: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState('cse');
  const [selectedSem, setSelectedSem] = useState(5);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [activeTab, setActiveTab] = useState<'notes' | 'videos' | 'assignments' | 'books'>('notes');

  const subjects = useMemo(() => {
    const branch = selectedBranch as keyof typeof SUBJECTS_BY_BRANCH_SEM;
    return (SUBJECTS_BY_BRANCH_SEM[branch]?.[selectedSem]) || [];
  }, [selectedBranch, selectedSem]);

  const currentSubject = selectedSubject || subjects[0] || '';

  const resources = useMemo(
    () => generateSubjectResources(currentSubject, selectedBranch, selectedSem),
    [currentSubject, selectedBranch, selectedSem]
  );

  const tabs = [
    { id: 'notes', label: 'Syllabus Notes', icon: BookOpen },
    { id: 'videos', label: 'Video Lectures', icon: PlayCircle },
    { id: 'assignments', label: 'Assignments', icon: ClipboardList },
    { id: 'books', label: 'Reference Books', icon: Book },
  ] as const;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4 font-body">
      {/* Top Banner */}
      <div className="p-8 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-[28px] border border-white/60 shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-slate-800 flex items-center gap-2">
            <BookOpen className="text-primary" size={32} />
            <span>Academic Curriculum Hub</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-2 max-w-xl">
            Explore branches, download resources, watch free NPTEL / MIT lectures, and leverage AI notes compilers for all 8 semesters.
          </p>
        </div>
        <span className="text-[11px] font-extrabold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 whitespace-nowrap">
          <Sparkles size={11} /> AI-Powered Syllabus
        </span>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-white rounded-3xl border border-white/70 shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff]">
        {/* Branch */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-extrabold text-slate-600 pl-1">Branch</label>
          <select
            value={selectedBranch}
            onChange={(e) => { setSelectedBranch(e.target.value); setSelectedSubject(''); }}
            className="py-2.5 px-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white outline-none focus:border-primary transition-colors"
          >
            {BRANCHES.map(b => (
              <option key={b.id} value={b.id}>{b.label}</option>
            ))}
          </select>
        </div>

        {/* Semester */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-extrabold text-slate-600 pl-1">Semester</label>
          <select
            value={selectedSem}
            onChange={(e) => { setSelectedSem(Number(e.target.value)); setSelectedSubject(''); }}
            className="py-2.5 px-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white outline-none focus:border-primary transition-colors"
          >
            {SEMESTERS.map(s => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-extrabold text-slate-600 pl-1">Subject</label>
          <select
            value={currentSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="py-2.5 px-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white outline-none focus:border-primary transition-colors"
          >
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel — Subject List */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <h3 className="font-bold text-lg text-slate-700 text-left pl-1">
            Semester {selectedSem} — Subjects
          </h3>
          <div className="flex flex-col gap-2">
            {subjects.map((sub, idx) => (
              <button
                key={sub}
                onClick={() => { setSelectedSubject(sub); setActiveTab('notes'); }}
                className={`w-full text-left p-4 rounded-2xl border transition-all select-none cursor-pointer flex justify-between items-center ${
                  currentSubject === sub
                    ? 'bg-primary/5 border-primary/40 shadow-[inset_2px_2px_4px_rgba(79,70,229,0.05)]'
                    : 'bg-white hover:bg-slate-50 border-slate-100 shadow-sm'
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">Unit {idx + 1}</span>
                  <h4 className="font-bold text-sm text-slate-700 mt-0.5">{sub}</h4>
                </div>
                <ChevronRight size={16} className={currentSubject === sub ? 'text-primary' : 'text-slate-300'} />
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel — Resources */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          <ClayCard className="text-left flex flex-col gap-5 min-h-[500px]">
            {/* Subject header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {BRANCHES.find(b => b.id === selectedBranch)?.label} · Semester {selectedSem}
                </span>
              </div>
              <h2 className="font-heading font-extrabold text-xl text-slate-800">{currentSubject}</h2>
              <div className="flex flex-wrap gap-2 mt-3">
                {resources.keyTopics.map(kt => (
                  <span key={kt} className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-full">
                    {kt}
                  </span>
                ))}
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex border-b border-slate-100 gap-1 overflow-x-auto">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`py-2.5 px-4 font-bold text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === id ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1">
              {/* Notes Tab */}
              {activeTab === 'notes' && (
                <div className="flex flex-col gap-4">
                  {resources.notes.map((note, idx) => (
                    <div key={idx} className="p-5 bg-slate-50/60 rounded-2xl border border-slate-100 flex flex-col gap-2">
                      <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">
                        Section {idx + 1}
                      </span>
                      <div className="text-sm text-slate-600 leading-relaxed">
                        {note.split('\n').map((line, i) => (
                          <p key={i} className={line.startsWith('**') ? 'font-bold text-slate-800' : ''}>{line.replace(/\*\*/g, '')}</p>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* PDF Downloads */}
                  <div className="mt-2">
                    <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2 pl-1">Downloadable PDFs</h4>
                    <div className="flex flex-col gap-2">
                      {resources.pdfLinks.map((pdf, idx) => (
                        <a
                          key={idx}
                          href={pdf.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-primary/30 hover:shadow-sm transition-all group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                              <FileText size={14} className="text-red-500" />
                            </div>
                            <span className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">{pdf.title}</span>
                          </div>
                          <Download size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Videos Tab */}
              {activeTab === 'videos' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources.videoLinks.map((vid, idx) => (
                    <div key={idx} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow">
                      <div className="w-full h-32 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center relative">
                        <PlayCircle size={40} className="text-primary/40" />
                        <span className="absolute top-2 right-2 text-[10px] font-extrabold text-primary bg-white px-2 py-0.5 rounded-full border border-primary/20">{vid.channel}</span>
                      </div>
                      <div className="p-4 flex flex-col gap-2 flex-1">
                        <h4 className="font-bold text-sm text-slate-700 line-clamp-2">{vid.title}</h4>
                        <p className="text-xs text-slate-400">via {vid.channel}</p>
                        <a
                          href={vid.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-auto"
                        >
                          <ClayButton className="w-full text-xs py-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-xl flex items-center justify-center gap-1.5 font-bold">
                            <PlayCircle size={12} /> Watch Now
                          </ClayButton>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Assignments Tab */}
              {activeTab === 'assignments' && (
                <div className="flex flex-col gap-3">
                  {resources.assignments.map((assign, idx) => (
                    <div key={idx} className="p-4 bg-amber-50/40 border border-amber-100 rounded-2xl flex gap-3 items-start">
                      <div className="w-7 h-7 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center font-extrabold text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{assign}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reference Books Tab */}
              {activeTab === 'books' && (
                <div className="flex flex-col gap-3">
                  {resources.referenceBooks.map((book, idx) => (
                    <div key={idx} className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl flex gap-3 items-start">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                        <Book size={15} className="text-emerald-700" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-700 font-semibold leading-relaxed">{book}</p>
                        <span className="text-[11px] text-slate-400">Reference {idx + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ClayCard>
        </div>
      </div>
    </div>
  );
};
