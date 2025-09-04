import { supabase } from './config';
import { STORAGE_BUCKETS } from './config';

export interface VideoUploadOptions {
  maxSize?: number; // بالبايت
  allowedTypes?: string[];
  onProgress?: (progress: number) => void;
}

export interface VideoUploadResult {
  url: string;
  name: string;
  size: number;
  type: string;
  path: string;
}

/**
 * رفع فيديو إلى Supabase Storage
 * @param file - ملف الفيديو
 * @param userId - معرف المستخدم
 * @param options - خيارات الرفع
 * @returns Promise<VideoUploadResult>
 */
export const uploadVideoToSupabase = async (
  file: File,
  userId: string,
  options: VideoUploadOptions = {}
): Promise<VideoUploadResult> => {
  const {
    maxSize = 100 * 1024 * 1024, // 100MB
    allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'],
    onProgress
  } = options;

  // التحقق من صحة الملف
  if (!file) {
    throw new Error('ملف الفيديو مطلوب');
  }

  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    throw new Error(`حجم الملف كبير جداً. الحد الأقصى: ${maxSizeMB}MB`);
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`نوع الملف غير مدعوم. الأنواع المدعومة: ${allowedTypes.join(', ')}`);
  }

  try {
    // إنشاء اسم فريد للملف
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = file.name.split('.').slice(0, -1).join('.');
    const filePath = `videos/${userId}/${timestamp}_${fileName.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;

    console.log('🚀 بدء رفع الفيديو:', {
      bucket: STORAGE_BUCKETS.VIDEOS,
      filePath,
      fileSize: file.size,
      fileType: file.type
    });

    // رفع الملف إلى Supabase
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.VIDEOS)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      console.error('❌ خطأ في رفع الفيديو:', error);
      throw new Error(`فشل في رفع الفيديو: ${error.message}`);
    }

    // الحصول على الرابط العام
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.VIDEOS)
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('فشل في الحصول على رابط الفيديو');
    }

    console.log('✅ تم رفع الفيديو بنجاح:', urlData.publicUrl);

    const result: VideoUploadResult = {
      url: urlData.publicUrl,
      name: fileName,
      size: file.size,
      type: file.type,
      path: filePath
    };

    return result;

  } catch (error) {
    console.error('❌ خطأ في رفع الفيديو:', error);
    throw error;
  }
};

/**
 * حذف فيديو من Supabase Storage
 * @param videoUrl - رابط الفيديو المراد حذفه
 * @returns Promise<void>
 */
export const deleteVideoFromSupabase = async (videoUrl: string): Promise<void> => {
  try {
    // استخراج المسار من الرابط
    const urlParts = videoUrl.split('/storage/v1/object/public/');
    if (urlParts.length < 2) {
      throw new Error('رابط الفيديو غير صالح');
    }

    const filePath = urlParts[1];
    const bucket = STORAGE_BUCKETS.VIDEOS;

    console.log('🗑️ حذف الفيديو:', { bucket, filePath });

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('❌ خطأ في حذف الفيديو:', error);
      throw new Error(`فشل في حذف الفيديو: ${error.message}`);
    }

    console.log('✅ تم حذف الفيديو بنجاح');

  } catch (error) {
    console.error('❌ خطأ في حذف الفيديو:', error);
    throw error;
  }
};

/**
 * التحقق من صحة ملف الفيديو
 * @param file - ملف الفيديو
 * @param options - خيارات التحقق
 * @returns { isValid: boolean; errors: string[] }
 */
export const validateVideoFile = (
  file: File,
  options: VideoUploadOptions = {}
): { isValid: boolean; errors: string[] } => {
  const {
    maxSize = 100 * 1024 * 1024, // 100MB
    allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov']
  } = options;

  const errors: string[] = [];

  // التحقق من وجود الملف
  if (!file) {
    errors.push('ملف الفيديو مطلوب');
    return { isValid: false, errors };
  }

  // التحقق من نوع الملف
  if (!allowedTypes.includes(file.type)) {
    errors.push(`نوع الملف غير مدعوم. الأنواع المدعومة: ${allowedTypes.join(', ')}`);
  }

  // التحقق من حجم الملف
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    errors.push(`حجم الملف كبير جداً. الحد الأقصى: ${maxSizeMB}MB`);
  }

  // التحقق من اسم الملف
  if (file.name.length > 100) {
    errors.push('اسم الملف طويل جداً');
  }

  // التحقق من أن الملف ليس فارغاً
  if (file.size === 0) {
    errors.push('الملف فارغ');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * الحصول على معلومات الفيديو
 * @param file - ملف الفيديو
 * @returns Promise<VideoInfo>
 */
export const getVideoInfo = (file: File): Promise<{
  duration: number;
  width: number;
  height: number;
  size: number;
  type: string;
  name: string;
  aspectRatio: number;
}> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');

    video.addEventListener('loadedmetadata', () => {
      const info = {
        duration: video.duration, // بالثواني
        width: video.videoWidth,
        height: video.videoHeight,
        size: file.size,
        type: file.type,
        name: file.name,
        aspectRatio: video.videoWidth / video.videoHeight
      };
      resolve(info);
    });

    video.addEventListener('error', (error) => {
      reject(error);
    });

    video.src = URL.createObjectURL(file);
    video.load();
  });
};

/**
 * إنشاء معاينة مصغرة للفيديو
 * @param file - ملف الفيديو
 * @returns Promise<string> - رابط الصورة المصغرة
 */
export const generateVideoThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('فشل في إنشاء canvas context'));
      return;
    }

    video.addEventListener('loadedmetadata', () => {
      // تعيين أبعاد الكانفس
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // الانتقال إلى الثانية الأولى من الفيديو
      video.currentTime = 1;
    });

    video.addEventListener('seeked', () => {
      // رسم الإطار على الكانفس
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // تحويل الكانفس إلى صورة
      canvas.toBlob((blob) => {
        if (blob) {
          const thumbnailUrl = URL.createObjectURL(blob);
          resolve(thumbnailUrl);
        } else {
          reject(new Error('فشل في إنشاء الصورة المصغرة'));
        }
      }, 'image/jpeg', 0.8);
    });

    video.addEventListener('error', (error) => {
      reject(error);
    });

    // تحميل الفيديو
    video.src = URL.createObjectURL(file);
    video.load();
  });
};

export default {
  uploadVideoToSupabase,
  deleteVideoFromSupabase,
  validateVideoFile,
  getVideoInfo,
  generateVideoThumbnail
}; 
