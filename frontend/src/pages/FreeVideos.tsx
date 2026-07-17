import React, { useState } from 'react';
import { ClayCard, ClayButton, ClayInput, ClaySelect } from '../components/ui';
import { Video, Search, Filter, BookOpen, Clock, User, Award } from 'lucide-react';

const mockVideoLibrary = [
  {
    id: 1,
    course_title: "Introduction to Database Systems",
    instructor: "Prof. S. Srinath",
    platform: "NPTEL",
    duration: "45 mins",
    difficulty: "Beginner",
    thumbnail: "https://img.youtube.com/vi/3EJlovevfcA/0.jpg",
    video_url: "https://www.youtube.com/embed/3EJlovevfcA",
    description: "Covers database architecture, conceptual schemas, logical data independence, and relational algebra equivalents."
  },
  {
    id: 2,
    course_title: "Introduction to Computer Science (CS50)",
    instructor: "Prof. David J. Malan",
    platform: "Harvard CS50",
    duration: "2 hours",
    difficulty: "Beginner",
    thumbnail: "https://img.youtube.com/vi/8mAITcNt7c0/0.jpg",
    video_url: "https://www.youtube.com/embed/8mAITcNt7c0",
    description: "An introduction to the intellectual enterprises of computer science and the art of programming."
  },
  {
    id: 3,
    course_title: "MIT 6.006 Introduction to Algorithms",
    instructor: "Prof. Erik Demaine",
    platform: "MIT OpenCourseWare",
    duration: "1 hour 20 mins",
    difficulty: "Intermediate",
    thumbnail: "https://img.youtube.com/vi/HtSuA80QTyo/0.jpg",
    video_url: "https://www.youtube.com/embed/HtSuA80QTyo",
    description: "Mathematical analysis of algorithms, sorting, binary search trees, and dynamic programming."
  },
  {
    id: 4,
    course_title: "Data Structures & Algorithms Course",
    instructor: "Shaun Halverson",
    platform: "freeCodeCamp",
    duration: "5 hours",
    difficulty: "Intermediate",
    thumbnail: "https://img.youtube.com/vi/8hly31xKjhc/0.jpg",
    video_url: "https://www.youtube.com/embed/8hly31xKjhc",
    description: "Learn arrays, linked lists, stacks, queues, hash tables, trees, and graph algorithms in detail."
  },
  {
    id: 5,
    course_title: "AWS Cloud Practitioner Certification Course",
    instructor: "Andrew Brown",
    platform: "AWS Skill Builder",
    duration: "4 hours",
    difficulty: "Beginner",
    thumbnail: "https://img.youtube.com/vi/SOTamWGuqXs/0.jpg",
    video_url: "https://www.youtube.com/embed/SOTamWGuqXs",
    description: "Learn cloud concepts, security, IAM roles, EC2 instances, S3 buckets, and basic cloud pricing structures."
  },
  {
    id: 6,
    course_title: "Google TensorFlow Certification Tutorial",
    instructor: "Daniel Bourke",
    platform: "Google Developers",
    duration: "3 hours",
    difficulty: "Advanced",
    thumbnail: "https://img.youtube.com/vi/tpCFfeUEGs8/0.jpg",
    video_url: "https://www.youtube.com/embed/tpCFfeUEGs8",
    description: "Get started with Deep Learning, Neural Networks, tensor manipulation, and predictive models."
  }
];

export const FreeVideos: React.FC = () => {
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [activeVideo, setActiveVideo] = useState<any | null>(null);

  const filteredVideos = mockVideoLibrary.filter((vid) => {
    const matchesSearch = vid.course_title.toLowerCase().includes(search.toLowerCase()) || 
                          vid.description.toLowerCase().includes(search.toLowerCase());
    const matchesPlatform = platformFilter === 'All' || vid.platform === platformFilter;
    const matchesDifficulty = difficultyFilter === 'All' || vid.difficulty === difficultyFilter;
    return matchesSearch && matchesPlatform && matchesDifficulty;
  });

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4">
      {/* Banner */}
      <div className="p-8 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 rounded-[28px] border border-white/60 shadow-[12px_12px_24px_#d1d9e6,-12px_-12px_24px_#ffffff] text-left flex justify-between items-center">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-slate-800 flex items-center gap-2">
            <Video className="text-emerald-500" size={32} />
            <span>Free Video Lecture Library</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-2">
            Curated high-quality, completely free resources from NPTEL, MIT OCW, Harvard CS50, freeCodeCamp, AWS, and Google.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-white rounded-3xl border border-white/70 shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff]">
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search lectures or concepts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="clay-input pl-11 w-full"
          />
        </div>

        <ClaySelect
          options={[
            { value: 'All', label: 'All Platforms' },
            { value: 'NPTEL', label: 'NPTEL' },
            { value: 'Harvard CS50', label: 'Harvard CS50' },
            { value: 'MIT OpenCourseWare', label: 'MIT OpenCourseWare' },
            { value: 'freeCodeCamp', label: 'freeCodeCamp' },
            { value: 'AWS Skill Builder', label: 'AWS Skill Builder' },
            { value: 'Google Developers', label: 'Google Developers' }
          ]}
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
        />

        <ClaySelect
          options={[
            { value: 'All', label: 'All Difficulty Levels' },
            { value: 'Beginner', label: 'Beginner' },
            { value: 'Intermediate', label: 'Intermediate' },
            { value: 'Advanced', label: 'Advanced' }
          ]}
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
        />
      </div>

      {/* Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <ClayCard className="max-w-4xl w-full flex flex-col gap-4 relative">
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full font-bold text-sm text-slate-600 transition-all select-none cursor-pointer"
            >
              ✕ Close
            </button>
            <h3 className="font-heading font-bold text-xl text-slate-800 text-left pr-12">{activeVideo.course_title}</h3>
            <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-inner border border-slate-100 bg-slate-900">
              <iframe
                src={activeVideo.video_url}
                title={activeVideo.course_title}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
            <div className="text-left flex flex-col gap-2">
              <div className="flex gap-3 flex-wrap">
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{activeVideo.platform}</span>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{activeVideo.difficulty}</span>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">{activeVideo.duration}</span>
              </div>
              <p className="text-xs font-bold text-slate-400 mt-1">Instructor: {activeVideo.instructor}</p>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">{activeVideo.description}</p>
            </div>
          </ClayCard>
        </div>
      )}

      {/* Video Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((vid) => (
          <div
            key={vid.id}
            className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-transform"
          >
            <div className="relative">
              <img src={vid.thumbnail} alt={vid.course_title} className="w-full h-44 object-cover" />
              <span className="absolute bottom-3 right-3 bg-black/70 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                {vid.duration}
              </span>
            </div>
            <div className="p-5 flex flex-col gap-2 flex-1 text-left">
              <span className="text-xs font-extrabold text-emerald-500 bg-emerald-50 self-start px-2 py-0.5 rounded-full">
                {vid.platform}
              </span>
              <h3 className="font-bold text-base text-slate-700 line-clamp-1">{vid.course_title}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <User size={12} /> {vid.instructor}
              </p>
              <p className="text-xs text-slate-500 line-clamp-3 mt-1 leading-relaxed">{vid.description}</p>
            </div>
            <div className="p-5 pt-0">
              <ClayButton
                onClick={() => setActiveVideo(vid)}
                className="w-full text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl"
              >
                Watch Lecture
              </ClayButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
