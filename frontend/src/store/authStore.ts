import { create } from 'zustand';
import axios from 'axios';

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
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<UserProfile>;
  signup: (userData: any) => Promise<UserProfile>;
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
  isInitializing: !!savedToken,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/login-json`, {
        username: email,
        password: password,
      });

      const { access_token, user } = response.data;

      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      set({
        token: access_token,
        user: user,
        isAuthenticated: true,
        isLoading: false,
      });

      return user;
    } catch (err: any) {
      let errorMsg = 'Login failed. Please check your credentials.';
      if (err.message === 'Network Error' || !err.response) {
        errorMsg = 'Backend server is unreachable. Please check your network connection.';
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
      const response = await axios.post(`${API_URL}/auth/signup`, userData);
      set({ isLoading: false });
      return response.data;
    } catch (err: any) {
      let errorMsg = 'Registration failed.';
      if (err.message === 'Network Error' || !err.response) {
        errorMsg = 'Backend server is unreachable. Please check your network connection.';
      } else {
        errorMsg = err.response?.data?.detail || err.message || errorMsg;
      }
      set({ error: errorMsg, isLoading: false });
      throw new Error(errorMsg);
    }
  },

  logout: () => {
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
}));
