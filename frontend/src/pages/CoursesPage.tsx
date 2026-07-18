import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore, API_URL } from '../store/authStore';
import { useOfflineStore } from '../store/offlineStore';
import { ClayCard, ClayButton, ClayAlert, SkeletonLoader } from '../components/ui';
import {
  BookOpen,
  ArrowRight,
  Download,
  CheckCircle,
  FileText,
  FileCode,
  Network,
  Trash2
} from 'lucide-react';

export const CoursesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { isOnline, downloadedLessons, downloadLessonForOffline, removeDownloadedLesson, offlineNotes, saveOfflineNote } = useOfflineStore();

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Note taking state
  const [noteInput, setNoteInput] = useState('');
  const [notesList, setNotesList] = useState<any[]>([]);

  useEffect(() => {
    fetchCourses();
  }, [searchParams]);

  useEffect(() => {}, [selectedCourse]);

  const fetchCourses = async () => {
    setLoading(true);
    const subject = searchParams.get('subject') || undefined;
    const courseId = searchParams.get('course_id') || undefined;

    if (!isOnline) {
      // Offline mode: load from downloaded lessons representation
      const uniqueCourses: Record<number, any> = {};
      downloadedLessons.forEach((l) => {
        if (!uniqueCourses[l.course_id]) {
          uniqueCourses[l.course_id] = {
            id: l.course_id,
            title: l.course_title,
            subject: l.subject,
            grade: user?.student_profile?.grade || 'Grade 6',
            lessons: []
          };
        }
        uniqueCourses[l.course_id].lessons.push(l);
      });

      const coursesArray = Object.values(uniqueCourses);
      setCourses(coursesArray);
      if (coursesArray.length > 0) {
        setSelectedCourse(coursesArray[0]);
        if (coursesArray[0].lessons.length > 0) {
          setSelectedLesson(coursesArray[0].lessons[0]);
        }
      }
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/courses`, {
        params: { subject, grade: user?.student_profile?.grade }
      });
      setCourses(res.data);
      
      // Auto-select course if course_id parameter is present
      if (res.data.length > 0) {
        let defaultCourse = res.data[0];
        if (courseId) {
          const match = res.data.find((c: any) => c.id === parseInt(courseId));
          if (match) defaultCourse = match;
        }
        setSelectedCourse(defaultCourse);
        if (defaultCourse.lessons && defaultCourse.lessons.length > 0) {
          setSelectedLesson(defaultCourse.lessons[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonSelect = (lesson: any) => {
    setSelectedLesson(lesson);
    setNoteInput('');
    // Filter notes for this lesson
    const filteredNotes = offlineNotes.filter(n => n.lesson_id === lesson.id);
    setNotesList(filteredNotes);
  };

  const handleDownloadOffline = (lesson: any) => {
    downloadLessonForOffline({
      id: lesson.id,
      course_id: selectedCourse.id,
      course_title: selectedCourse.title,
      title: lesson.title,
      content_markdown: lesson.content_markdown,
      video_url: lesson.video_url,
      subject: selectedCourse.subject
    });
  };

  const handleDeleteOffline = (lessonId: number) => {
    removeDownloadedLesson(lessonId);
  };

  const handleSaveNote = () => {
    if (!noteInput.trim() || !selectedLesson) return;
    saveOfflineNote(selectedLesson.id, noteInput);
    
    // Refresh notes list locally
    const noteObj = {
      id: Math.random().toString(),
      lesson_id: selectedLesson.id,
      note_text: noteInput,
      timestamp: new Date().toISOString()
    };
    setNotesList(prev => [...prev, noteObj]);
    setNoteInput('');
  };

  const isDownloaded = (lessonId: number) => {
    return downloadedLessons.some(l => l.id === lessonId);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <SkeletonLoader lines={4} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left">
      
      {/* Course & Lesson sidebar list */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <ClayCard className="p-4 flex flex-col gap-3">
          <h4 className="font-heading font-bold text-xs text-text/50 uppercase tracking-wider">
            Available Courses
          </h4>
          
          <div className="flex flex-col gap-2.5">
            {courses.length > 0 ? (
              courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => {
                    setSelectedCourse(course);
                    if (course.lessons && course.lessons.length > 0) {
                      handleLessonSelect(course.lessons[0]);
                    } else {
                      setSelectedLesson(null);
                    }
                  }}
                  className={`w-full p-3 rounded-2xl border text-xs font-semibold text-left transition-all ${selectedCourse?.id === course.id ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white border-slate-200 text-text/80 hover:bg-slate-50'}`}
                >
                  <span className="block truncate font-bold">{course.title}</span>
                  <span className="text-[10px] text-text/50 capitalize font-medium">{course.subject} • {course.grade}</span>
                </button>
              ))
            ) : (
              <span className="text-xs text-text/40 font-semibold py-2">No courses found matching criteria.</span>
            )}
          </div>
        </ClayCard>

        {selectedCourse && (
          <ClayCard className="p-4 flex flex-col gap-3">
            <h4 className="font-heading font-bold text-xs text-text/50 uppercase tracking-wider">
              Lessons List
            </h4>
            
            <div className="flex flex-col gap-2">
              {selectedCourse.lessons && selectedCourse.lessons.length > 0 ? (
                selectedCourse.lessons.map((lesson: any) => (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonSelect(lesson)}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${selectedLesson?.id === lesson.id ? 'bg-secondary text-white border-secondary/20 shadow-sm' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}
                  >
                    <span className="truncate pr-1">{lesson.title}</span>
                    {isDownloaded(lesson.id) && (
                      <span className={`text-[8px] font-bold py-0.5 px-1.5 rounded-full ${selectedLesson?.id === lesson.id ? 'bg-white text-secondary' : 'bg-green-100 text-green-700'}`}>
                        Offline
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <span className="text-xs text-text/40 font-semibold">No lessons in this course.</span>
              )}
            </div>
          </ClayCard>
        )}
      </div>

      {/* Lesson View Panel & Note Taking */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        {selectedLesson ? (
          <>
            {/* Lesson Viewer */}
            <ClayCard className="flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-3">
                <div className="flex flex-col gap-0.5 text-left">
                  <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-text">
                    {selectedLesson.title}
                  </h2>
                  <span className="text-xs text-text/50 font-semibold capitalize">
                    Course: {selectedCourse?.title} • {selectedCourse?.subject}
                  </span>
                </div>

                {/* Offline action buttons */}
                <div className="flex gap-2">
                  {isDownloaded(selectedLesson.id) ? (
                    <ClayButton
                      onClick={() => handleDeleteOffline(selectedLesson.id)}
                      className="flex items-center gap-1.5 !py-2 px-4 text-xs font-bold text-danger border-red-200 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                      <span>Remove Offline</span>
                    </ClayButton>
                  ) : (
                    <ClayButton
                      onClick={() => handleDownloadOffline(selectedLesson)}
                      disabled={!isOnline}
                      variant="primary"
                      className="flex items-center gap-1.5 !py-2 px-4 text-xs font-bold shadow-sm"
                    >
                      <Download size={14} />
                      <span>Save Offline</span>
                    </ClayButton>
                  )}
                </div>
              </div>

              {/* Video Embed Simulation */}
              {selectedLesson.video_url && isOnline && (
                <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-slate-100 shadow-inner bg-black">
                  <iframe
                    className="w-full h-full"
                    src={selectedLesson.video_url}
                    title="Lesson video play"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Lesson Markdown Content */}
              <div className="text-left leading-relaxed text-sm text-text/80 space-y-4 max-w-none border-t pt-4">
                <div className="whitespace-pre-line font-medium text-slate-800">
                  {selectedLesson.content_markdown}
                </div>
              </div>
            </ClayCard>

            {/* Note Taking Widget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ClayCard className="flex flex-col gap-3">
                <h4 className="font-heading font-bold text-sm text-text/80 flex items-center gap-1.5 border-b pb-2">
                  <FileText size={16} className="text-primary" />
                  My Study Notes (Offline Saved)
                </h4>

                <div className="flex flex-col gap-2.5 flex-1 max-h-48 overflow-y-auto">
                  {notesList.length > 0 ? (
                    notesList.map((note) => (
                      <div key={note.id} className="p-3 bg-slate-50 border rounded-xl text-xs text-text/80 relative text-left">
                        <p className="font-medium">{note.note_text}</p>
                        <span className="text-[9px] text-text/40 block mt-1">
                          {new Date(note.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-text/40 font-semibold py-4 text-center">
                      No notes saved for this lesson yet. Write one below!
                    </span>
                  )}
                </div>
              </ClayCard>

              {/* Note Creator */}
              <ClayCard className="flex flex-col gap-3 justify-between">
                <div className="flex flex-col gap-1 w-full">
                  <h4 className="font-heading font-bold text-sm text-text/80">Add Note</h4>
                  <textarea
                    placeholder="Type key formulas or summaries here..."
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    className="clay-input w-full h-24 text-xs font-semibold py-2 bg-slate-50 focus:bg-white resize-none"
                  />
                </div>
                <ClayButton
                  onClick={handleSaveNote}
                  variant="accent"
                  className="w-full flex items-center justify-center gap-1.5 !py-2 text-xs font-bold shadow-sm"
                >
                  Save Note
                </ClayButton>
              </ClayCard>
            </div>
          </>
        ) : (
          <ClayCard className="p-8 text-center text-text/50 flex flex-col items-center gap-2">
            <span className="text-4xl">📚</span>
            <h3 className="font-heading font-bold text-lg">No Course Selected</h3>
            <p className="text-xs">Choose a course and lesson from the sidebar catalog to begin your learning path.</p>
          </ClayCard>
        )}
      </div>
    </div>
  );
};
