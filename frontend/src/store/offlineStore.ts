import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from './authStore';

interface OfflineLesson {
  id: number;
  course_id: number;
  course_title: string;
  title: string;
  content_markdown: string;
  video_url?: string;
  subject: string;
}

interface OfflineNote {
  id: string;
  lesson_id: number;
  note_text: string;
  timestamp: string;
}

interface QueuedQuiz {
  quiz_id: number;
  score: number;
  answers: Record<string, string>;
  timestamp: string;
}

interface OfflineState {
  isOnline: boolean;
  downloadedLessons: OfflineLesson[];
  offlineNotes: OfflineNote[];
  queuedQuizzes: QueuedQuiz[];
  
  setOnlineStatus: (status: boolean) => void;
  downloadLessonForOffline: (lesson: OfflineLesson) => void;
  removeDownloadedLesson: (lessonId: number) => void;
  saveOfflineNote: (lessonId: number, noteText: string) => void;
  queueQuizAttempt: (quizId: number, score: number, answers: Record<string, string>) => void;
  syncPendingData: () => Promise<void>;
}

// Load starting states from LocalStorage
const loadLocal = <T>(key: string, def: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : def;
};

export const useOfflineStore = create<OfflineState>((set, get) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  downloadedLessons: loadLocal<OfflineLesson[]>('offline_lessons', []),
  offlineNotes: loadLocal<OfflineNote[]>('offline_notes', []),
  queuedQuizzes: loadLocal<QueuedQuiz[]>('queued_quizzes', []),

  setOnlineStatus: (status) => {
    set({ isOnline: status });
    if (status) {
      // Trigger sync immediately upon coming online
      get().syncPendingData();
    }
  },

  downloadLessonForOffline: (lesson) => {
    const list = get().downloadedLessons;
    if (list.some(l => l.id === lesson.id)) return;
    const updated = [...list, lesson];
    localStorage.setItem('offline_lessons', JSON.stringify(updated));
    set({ downloadedLessons: updated });
  },

  removeDownloadedLesson: (lessonId) => {
    const updated = get().downloadedLessons.filter(l => l.id !== lessonId);
    localStorage.setItem('offline_lessons', JSON.stringify(updated));
    set({ downloadedLessons: updated });
  },

  saveOfflineNote: (lessonId, noteText) => {
    const note: OfflineNote = {
      id: Math.random().toString(36).substring(2, 9),
      lesson_id: lessonId,
      note_text: noteText,
      timestamp: new Date().toISOString()
    };
    const updated = [...get().offlineNotes, note];
    localStorage.setItem('offline_notes', JSON.stringify(updated));
    set({ offlineNotes: updated });
  },

  queueQuizAttempt: (quizId, score, answers) => {
    const attempt: QueuedQuiz = {
      quiz_id: quizId,
      score,
      answers,
      timestamp: new Date().toISOString()
    };
    const updated = [...get().queuedQuizzes, attempt];
    localStorage.setItem('queued_quizzes', JSON.stringify(updated));
    set({ queuedQuizzes: updated });
  },

  syncPendingData: async () => {
    const { queuedQuizzes, isOnline } = get();
    if (!isOnline || queuedQuizzes.length === 0) return;

    console.log(`Syncing ${queuedQuizzes.length} queued offline quiz attempts...`);
    
    // Process items sequentially
    const remaining = [...queuedQuizzes];
    for (const attempt of queuedQuizzes) {
      try {
        await axios.post(`${API_URL}/quizzes/${attempt.quiz_id}/submit`, {
          quiz_id: attempt.quiz_id,
          score: attempt.score,
          answers: attempt.answers
        });
        
        // Remove from list if successful
        const idx = remaining.findIndex(q => q.quiz_id === attempt.quiz_id && q.timestamp === attempt.timestamp);
        if (idx > -1) remaining.splice(idx, 1);
        
      } catch (err) {
        console.error("Failed to sync attempt for quiz", attempt.quiz_id, err);
        // Stop process, keep remaining in queue
        break;
      }
    }

    localStorage.setItem('queued_quizzes', JSON.stringify(remaining));
    set({ queuedQuizzes: remaining });
  }
}));

// Initialize window online/offline event listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => useOfflineStore.getState().setOnlineStatus(true));
  window.addEventListener('offline', () => useOfflineStore.getState().setOnlineStatus(false));
}
