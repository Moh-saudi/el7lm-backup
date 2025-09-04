// src/lib/utils/file.ts

// Supabase functions disabled
export const allowedFileTypes = {
  videos: ['video/mp4', 'video/webm']
};

export const maxFileSize = {
  video: 100 * 1024 * 1024 // 100MB
};

export const validateFile = (file: File, type: 'videos'): boolean => {
  if (!file) return false;
  if (!allowedFileTypes[type].includes(file.type)) {
    console.error('❌ نوع الملف غير مسموح به');
    return false;
  }
  const maxSize = maxFileSize.video;
  if (file.size > maxSize) {
    console.error('❌ حجم الملف كبير جداً');
    return false;
  }
  return true;
};

export const handleFileUpload = async (
  file: File,
  type: 'videos'
): Promise<string | null> => {
  if (!validateFile(file, type)) return null;
  throw new Error('رفع الملفات معطل حالياً');
};

export const uploadFile = async () => {
  throw new Error('رفع الملفات معطل حالياً');
};

export async function uploadFileToAzure(): Promise<string> {
  throw new Error('Azure Storage is disabled');
}
