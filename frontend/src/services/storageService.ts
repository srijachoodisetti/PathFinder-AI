// Firebase Storage has been removed from this project.
// File uploads should be handled by the FastAPI backend.
// This is a no-op stub to prevent import errors.

export const storageService = {
  async uploadFile(_path: string, _file: File | Blob): Promise<string> {
    console.warn('storageService: Firebase Storage has been removed. Implement backend upload instead.');
    return '';
  },
  async uploadProfilePicture(_email: string, _file: File): Promise<string> { return ''; },
  async uploadAssignment(_email: string, _assignmentId: string, _file: File): Promise<string> { return ''; },
  async uploadHomeworkImage(_email: string, _file: File): Promise<string> { return ''; },
  async uploadOcrImage(_email: string, _file: File | Blob): Promise<string> { return ''; },
  async uploadCertificate(_email: string, _courseId: string, _file: File): Promise<string> { return ''; },
};
