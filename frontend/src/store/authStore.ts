import { create } from 'zustand';
import axios from 'axios';
import { auth, db } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export const API_URL = import.meta.env.VITE_API_URL || "/api/v1";

export interface UserProfile {
  id: number;
  uid: string;
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  year?: string;
  student_profile?: {
    id: number;
    year: string;
    learning_goals: string;
    xp_points: number;
    streak: number;
    weak_topics: string;
    language_preference: string;
  };
  teacher_profile?: {
    id: number;
    subject_specialization: string;
    years_managed: string;
  };
  parent_profile?: {
    id: number;
    child_email: string;
  };
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
  clearError: () => void;
  setInitializing: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      let errorMsg = 'Login failed. Please check your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMsg = 'Incorrect email or password.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      set({ error: errorMsg, isLoading: false });
      throw new Error(errorMsg);
    }
  },

  signup: async (userData) => {
    set({ isLoading: true, error: null });
    const { email, password, full_name, role, year, subject_specialization, child_email } = userData;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const docRef = doc(db, 'users', firebaseUser.uid);
      const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
      const profileData: any = {
        uid: firebaseUser.uid,
        name: full_name,
        email: email,
        role: capitalizedRole,
        year: year || '1st Year',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      };

      if (role === 'teacher') {
        profileData.specialization = subject_specialization || '';
      } else if (role === 'parent') {
        profileData.childEmail = child_email || '';
      }

      await setDoc(docRef, profileData);
    } catch (err: any) {
      let errorMsg = 'Registration failed.';
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'The email address is already in use by another account.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      set({ error: errorMsg, isLoading: false });
      throw new Error(errorMsg);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await signOut(auth);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    set({ user });
  },

  clearError: () => set({ error: null }),
  setInitializing: (value: boolean) => set({ isInitializing: value }),
}));

// Setup active Firebase Auth listener immediately
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    try {
      const idToken = await firebaseUser.getIdToken();
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;
      localStorage.setItem('token', idToken);
      
      let firestoreProfile: any = null;
      try {
        if (db && typeof db.app === 'object') {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            firestoreProfile = docSnap.data();
          }
        }
      } catch (dbErr) {
        console.warn("Could not retrieve Firestore user profile, falling back to basic authentication state:", dbErr);
      }
      
      if (firestoreProfile) {
        const role = (firestoreProfile.role || 'student').toLowerCase();
        
        const userObj: UserProfile = {
          id: 1,
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          full_name: firestoreProfile.name || 'User',
          role: role as any,
          year: firestoreProfile.year || '2nd Year',
        };

        if (role === 'student') {
          userObj.student_profile = {
            id: 1,
            year: firestoreProfile.year || '2nd Year',
            learning_goals: firestoreProfile.learningGoals || 'My learning goals',
            xp_points: firestoreProfile.xp_points || 0,
            streak: firestoreProfile.streak || 1,
            weak_topics: firestoreProfile.weak_topics || '',
            language_preference: firestoreProfile.language_preference || 'English',
          };
        } else if (role === 'teacher') {
          userObj.teacher_profile = {
            id: 1,
            subject_specialization: firestoreProfile.specialization || '',
            years_managed: firestoreProfile.year || '2nd Year',
          };
        }
        
        try {
          await axios.get(`${API_URL}/student/notifications`);
        } catch (syncErr) {
          console.warn("Backend user sync warning:", syncErr);
        }

        useAuthStore.setState({
          token: idToken,
          user: userObj,
          isAuthenticated: true,
          isInitializing: false,
          isLoading: false,
        });
      } else {
        const userObj: UserProfile = {
          id: 1,
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          full_name: firebaseUser.displayName || 'User',
          role: 'student',
          year: '2nd Year',
        };
        
        useAuthStore.setState({
          token: idToken,
          user: userObj,
          isAuthenticated: true,
          isInitializing: false,
          isLoading: false,
        });
      }
    } catch (e) {
      console.error("Firebase auth state change handling error:", e);
      useAuthStore.setState({
        token: null,
        user: null,
        isAuthenticated: false,
        isInitializing: false,
        isLoading: false,
      });
    }
  } else {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
      isInitializing: false,
      isLoading: false,
    });
  }
});
