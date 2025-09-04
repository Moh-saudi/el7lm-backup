// جميع دوال الصور معطلة نهائياً ولا تعتمد على أي خدمة خارجية

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB for videos
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

export interface UploadResponse {
  url: string;
  error?: string;
}

export const uploadProfileImage = async (): Promise<UploadResponse> => ({
  url: '',
  error: 'خدمة رفع الصور معطلة حالياً'
});

export const uploadAdditionalImage = async (): Promise<UploadResponse> => ({
  url: '',
  error: 'خدمة رفع الصور معطلة حالياً'
});

export const deleteImage = async (_path: string): Promise<{ error: string }> => ({
  error: 'خدمة حذف الصور معطلة حالياً'
});
