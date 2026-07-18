// Firebase/Firestore has been removed from this project.
// All chat/achievement/leaderboard data is stored in the FastAPI backend.
// This service is a no-op stub to prevent import errors in components
// that used Firestore. All methods silently succeed without doing anything.

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
  async syncUserProfile(_email: string, _profileData: any): Promise<void> {},
  async getUserProfile(_email: string): Promise<any> { return null; },
  async saveAchievement(_email: string, _achievement: { title: string; description: string; xp: number }) {},
  async getAchievements(_email: string): Promise<any[]> { return []; },
  async updateLeaderboardScore(_email: string, _fullName: string, _xpPoints: number) {},
  async getLeaderboard(_limitCount = 10): Promise<any[]> { return []; },
  async saveNotification(_recipientEmail: string, _notification: { title: string; message: string; type: string }) {},
  async getNotifications(_email: string): Promise<any[]> { return []; },
  async saveChatMessage(_email: string, _message: { content: string; is_from_user: boolean; audio_url?: string | null }) {},
  async getChatMessages(_email: string, _limitCount = 50): Promise<any[]> { return []; },
};
