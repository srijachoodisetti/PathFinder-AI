import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { firestore } from '../lib/firebase';

export interface UserProfileFirestore {
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  grade?: string;
  specialization?: string;
  childEmail?: string;
  xp_points?: number;
  streak?: number;
  updatedAt?: any;
}

export const firestoreService = {
  // Sync user profile (User Profiles, Student Data, Teacher Data, Parent Data)
  async syncUserProfile(email: string, profileData: any): Promise<void> {
    try {
      const userRef = doc(firestore, 'users', email);
      await setDoc(userRef, {
        ...profileData,
        email,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error syncing user profile to Firestore:', error);
      throw error;
    }
  },

  // Get user profile
  async getUserProfile(email: string): Promise<any> {
    try {
      const userRef = doc(firestore, 'users', email);
      const userSnap = await getDoc(userRef);
      return userSnap.exists() ? userSnap.data() : null;
    } catch (error) {
      console.error('Error fetching user profile from Firestore:', error);
      throw error;
    }
  },

  // Save/Get achievements
  async saveAchievement(email: string, achievement: { title: string; description: string; xp: number }) {
    try {
      const achRef = collection(firestore, 'achievements');
      await addDoc(achRef, {
        userEmail: email,
        ...achievement,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving achievement to Firestore:', error);
      throw error;
    }
  },

  async getAchievements(email: string): Promise<any[]> {
    try {
      const achRef = collection(firestore, 'achievements');
      const q = query(achRef, where('userEmail', '==', email), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      return list;
    } catch (error) {
      console.error('Error fetching achievements from Firestore:', error);
      return [];
    }
  },

  // Leaderboard
  async updateLeaderboardScore(email: string, fullName: string, xpPoints: number) {
    try {
      const leadRef = doc(firestore, 'leaderboard', email);
      await setDoc(leadRef, {
        email,
        full_name: fullName,
        xp_points: xpPoints,
        timestamp: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating leaderboard score in Firestore:', error);
      throw error;
    }
  },

  async getLeaderboard(limitCount = 10): Promise<any[]> {
    try {
      const leadRef = collection(firestore, 'leaderboard');
      const q = query(leadRef, orderBy('xp_points', 'desc'), limit(limitCount));
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((doc) => {
        list.push(doc.data());
      });
      return list;
    } catch (error) {
      console.error('Error fetching leaderboard from Firestore:', error);
      return [];
    }
  },

  // Notifications
  async saveNotification(recipientEmail: string, notification: { title: string; message: string; type: string }) {
    try {
      const notifRef = collection(firestore, 'notifications');
      await addDoc(notifRef, {
        recipientEmail,
        ...notification,
        isRead: false,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving notification to Firestore:', error);
      throw error;
    }
  },

  async getNotifications(email: string): Promise<any[]> {
    try {
      const notifRef = collection(firestore, 'notifications');
      const q = query(notifRef, where('recipientEmail', '==', email), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      return list;
    } catch (error) {
      console.error('Error fetching notifications from Firestore:', error);
      return [];
    }
  },

  // Messages (AI Tutor Chat message sync)
  async saveChatMessage(email: string, message: { content: string; is_from_user: boolean; audio_url?: string | null }) {
    try {
      const msgRef = collection(firestore, 'messages');
      await addDoc(msgRef, {
        userEmail: email,
        ...message,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving message to Firestore:', error);
      throw error;
    }
  },

  async getChatMessages(email: string, limitCount = 50): Promise<any[]> {
    try {
      const msgRef = collection(firestore, 'messages');
      const q = query(msgRef, where('userEmail', '==', email), orderBy('timestamp', 'asc'), limit(limitCount));
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      return list;
    } catch (error) {
      console.error('Error fetching messages from Firestore:', error);
      return [];
    }
  }
};
