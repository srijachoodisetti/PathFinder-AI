import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

export const storageService = {
  // Common upload helper
  async uploadFile(path: string, file: File | Blob): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error(`Error uploading file to ${path}:`, error);
      throw error;
    }
  },

  // Profile Picture Upload
  async uploadProfilePicture(email: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `profiles/${email}/avatar.${ext}`;
    return this.uploadFile(path, file);
  },

  // Assignment Upload
  async uploadAssignment(email: string, assignmentId: string, file: File): Promise<string> {
    const path = `assignments/${email}/${assignmentId}_${Date.now()}_${file.name}`;
    return this.uploadFile(path, file);
  },

  // Homework Image Upload
  async uploadHomeworkImage(email: string, file: File): Promise<string> {
    const path = `homework/${email}/${Date.now()}_${file.name}`;
    return this.uploadFile(path, file);
  },

  // OCR Image Upload
  async uploadOcrImage(email: string, file: File | Blob): Promise<string> {
    const filename = file instanceof File ? file.name : `scan_${Date.now()}.png`;
    const path = `ocr/${email}/${Date.now()}_${filename}`;
    return this.uploadFile(path, file);
  },

  // Certificate Upload
  async uploadCertificate(email: string, courseId: string, file: File): Promise<string> {
    const path = `certificates/${email}/${courseId}_${Date.now()}_${file.name}`;
    return this.uploadFile(path, file);
  }
};
