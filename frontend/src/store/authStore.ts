import { create } from 'zustand';
import axios from 'axios';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, analytics } from '../lib/firebase';
import { logEvent } from 'firebase/analytics';
import { firestoreService } from '../services/firestoreService';

export const API_URL = import.meta.env.VITE_API_URL || "/api/v1";

// Set up Axios default authorization from localStorage if exists
const savedToken = localStorage.getItem('token');
if (savedToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  is_active: boolean;
  student_profile?: {
    id: number;
    grade: string;
    learning_goals: string;
    xp_points: number;
    streak: number;
    weak_topics: string;
    language_preference: string;
  };
  teacher_profile?: {
    id: number;
    subject_specialization: string;
    classes_managed: string;
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
  isInitializing: boolean;  // true while validating session on first load
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<UserProfile>;
  signup: (userData: any) => Promise<UserProfile>;
  loginWithGoogle: () => Promise<UserProfile>;
  logout: () => void;
  setUser: (user: UserProfile) => void;
  clearError: () => void;
  refreshMe: () => Promise<UserProfile | null>;
  setInitializing: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: savedToken,
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  isAuthenticated: !!savedToken,
  isInitializing: !!savedToken, // start initializing if we have a stored token to validate
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Authenticate with local SQLite/PostgreSQL backend via API first
      const response = await axios.post(`${API_URL}/auth/login-json`, {
        username: email,
        password: password,
      });

      const { access_token, user } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      // 2. Perform Firebase Auth and sync to Firestore in a non-blocking, self-healing try-catch block
      try {
        const firebaseAuthPromise = (async () => {
          try {
            await signInWithEmailAndPassword(auth, email, password);
          } catch (fbErr: any) {
            // Self-healing: If user is not in Firebase Auth, but exists in local SQLite backend,
            // register them on-the-fly in Firebase Auth to keep mock logins working.
            if (fbErr.code === 'auth/user-not-found' || fbErr.code === 'auth/invalid-credential') {
              await createUserWithEmailAndPassword(auth, email, password);
              await signInWithEmailAndPassword(auth, email, password);
            } else {
              throw fbErr;
            }
          }

          // Sync user profile to Firestore
          const firestoreProfile: any = {
            full_name: user.full_name,
            role: user.role,
          };
          if (user.role === 'student' && user.student_profile) {
            firestoreProfile.grade = user.student_profile.grade;
            firestoreProfile.xp_points = user.student_profile.xp_points;
            firestoreProfile.streak = user.student_profile.streak;
            await firestoreService.updateLeaderboardScore(email, user.full_name, user.student_profile.xp_points);
          } else if (user.role === 'teacher' && user.teacher_profile) {
            firestoreProfile.subject_specialization = user.teacher_profile.subject_specialization;
            firestoreProfile.classes_managed = user.teacher_profile.classes_managed;
          } else if (user.role === 'parent' && user.parent_profile) {
            firestoreProfile.child_email = user.parent_profile.child_email;
          }
          await firestoreService.syncUserProfile(email, firestoreProfile);

          if (analytics) {
            logEvent(analytics, 'login', { method: 'email' });
          }
        })();

        // Race the Firebase auth flow with a 3-second timeout so it never hangs the login flow
        await Promise.race([
          firebaseAuthPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error("Firebase auth timeout")), 3000))
        ]);
      } catch (fbError) {
        console.warn("[PathFinder AI] Firebase authentication or sync bypassed / failed:", fbError);
      }

      set({
        token: access_token,
        user: user,
        isAuthenticated: true,
        isLoading: false,
      });

      return user;
    } catch (err: any) {
      let errorMsg = 'Login failed. Please check credentials.';
      if (err.message === 'Network Error' || !err.response) {
        errorMsg = 'Backend server is unreachable. Please check your network connection or ensure the API service is running.';
      } else {
        errorMsg = err.response?.data?.detail || err.message || errorMsg;
      }
      set({ error: errorMsg, isLoading: false });
      throw new Error(errorMsg);
    }
  },

  signup: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Create profile in the local backend database first
      const response = await axios.post(`${API_URL}/auth/signup`, userData);

      // 2. Asynchronously create user in Firebase and sync profile to Firestore
      try {
        const firebaseSignupPromise = (async () => {
          const firebaseUserCredential = await createUserWithEmailAndPassword(
            auth, 
            userData.email, 
            userData.password
          );
          
          try {
            await sendEmailVerification(firebaseUserCredential.user);
          } catch (e) {
            console.warn("Email verification send failed:", e);
          }

          const firestoreProfile: any = {
            full_name: userData.full_name,
            role: userData.role,
          };
          if (userData.role === 'student') {
            firestoreProfile.grade = userData.grade;
            firestoreProfile.xp_points = 0;
            firestoreProfile.streak = 0;
          } else if (userData.role === 'teacher') {
            firestoreProfile.subject_specialization = userData.subject_specialization;
            firestoreProfile.classes_managed = userData.classes_managed;
          } else if (userData.role === 'parent') {
            firestoreProfile.child_email = userData.child_email;
          }
          await firestoreService.syncUserProfile(userData.email, firestoreProfile);

          if (analytics) {
            logEvent(analytics, 'sign_up', { method: 'email', role: userData.role });
          }
        })();

        // Race the Firebase signup flow with a 3-second timeout
        await Promise.race([
          firebaseSignupPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error("Firebase signup timeout")), 3000))
        ]);
      } catch (fbError) {
        console.warn("[PathFinder AI] Firebase signup bypassed / failed:", fbError);
      }

      set({ isLoading: false });
      return response.data;
    } catch (err: any) {
      let errorMsg = 'Registration failed.';
      if (err.message === 'Network Error' || !err.response) {
        errorMsg = 'Backend server is unreachable. Please check your network connection or ensure the API service is running.';
      } else {
        errorMsg = err.response?.data?.detail || err.message || errorMsg;
      }
      set({ error: errorMsg, isLoading: false });
      throw new Error(errorMsg);
    }
  },

  logout: () => {
    // Sign out of Firebase Auth
    signOut(auth).catch(err => console.error('Error signing out of Firebase:', err));

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  clearError: () => set({ error: null }),

  setInitializing: (value: boolean) => set({ isInitializing: value }),

  refreshMe: async () => {
    const { token } = get();
    if (!token) {
      // No token — not initializing, not authenticated
      set({ isInitializing: false, isAuthenticated: false });
      return null;
    }
    
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      localStorage.setItem('user', JSON.stringify(response.data));
      set({ user: response.data, isAuthenticated: true, isInitializing: false });
      return response.data;
    } catch (err) {
      // Token expired or invalid — clear session
      get().logout();
      set({ isInitializing: false });
      return null;
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const provider = new GoogleAuthProvider();
      const firebaseUserCredential = await signInWithPopup(auth, provider);
      const firebaseUser = firebaseUserCredential.user;
      const email = firebaseUser.email;
      if (!email) throw new Error("Google login did not return an email.");

      // Check if user exists in local backend, if not, sign them up
      let localUser;
      try {
        const dummyPassword = `GoogleAuthSecurePassword_${firebaseUser.uid}`;
        const loginResponse = await axios.post(`${API_URL}/auth/login-json`, {
          username: email,
          password: dummyPassword,
        });
        localUser = loginResponse.data.user;
        localStorage.setItem('token', loginResponse.data.access_token);
        localStorage.setItem('user', JSON.stringify(localUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.data.access_token}`;
      } catch (err) {
        // If login fails, user might not exist in backend, so we perform signup
        const dummyPassword = `GoogleAuthSecurePassword_${firebaseUser.uid}`;
        const signupPayload = {
          email: email,
          password: dummyPassword,
          full_name: firebaseUser.displayName || 'Google User',
          role: 'student', // default role for Google signup
          grade: 'Grade 6', // default grade
        };
        await axios.post(`${API_URL}/auth/signup`, signupPayload);
        
        // Now login
        const loginResponse = await axios.post(`${API_URL}/auth/login-json`, {
          username: email,
          password: dummyPassword,
        });
        localUser = loginResponse.data.user;
        localStorage.setItem('token', loginResponse.data.access_token);
        localStorage.setItem('user', JSON.stringify(localUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.data.access_token}`;
      }

      // Sync user profile to Firestore
      const firestoreProfile: any = {
        full_name: localUser.full_name,
        role: localUser.role,
      };
      if (localUser.role === 'student' && localUser.student_profile) {
        firestoreProfile.grade = localUser.student_profile.grade;
        firestoreProfile.xp_points = localUser.student_profile.xp_points;
        firestoreProfile.streak = localUser.student_profile.streak;
        await firestoreService.updateLeaderboardScore(email, localUser.full_name, localUser.student_profile.xp_points);
      }
      await firestoreService.syncUserProfile(email, firestoreProfile);

      // Log event to Firebase Analytics
      if (analytics) {
        logEvent(analytics, 'login', { method: 'google' });
      }

      set({
        token: localStorage.getItem('token'),
        user: localUser,
        isAuthenticated: true,
        isLoading: false,
      });

      return localUser;
    } catch (err: any) {
      let errorMsg = 'Google Sign-In failed.';
      if (err.code) {
        errorMsg = err.message;
      } else if (err.message === 'Network Error' || !err.response) {
        errorMsg = 'Backend server is unreachable. Please check your network connection or ensure the API service is running.';
      } else {
        errorMsg = err.response?.data?.detail || err.message || errorMsg;
      }
      set({ error: errorMsg, isLoading: false });
      throw new Error(errorMsg);
    }
  }
}));
