import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from './config';

const storage = getStorage(app);

/**
 * رفع فيديو إلى Firebase Storage
 * @param {File} file - ملف الفيديو
 * @param {string} userId - معرف المستخدم
 * @param {Function} onProgress - دالة لتتبع تقدم الرفع
 * @returns {Promise<string>} رابط الفيديو المرفوع
 */
export const uploadVideo = async (file, userId, onProgress = null) => {
  try {
    // إنشاء مرجع للملف
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const videoRef = ref(storage, `videos/${userId}/${fileName}`);

    // إنشاء مهمة الرفع
    const uploadTask = uploadBytesResumable(videoRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // تتبع تقدم الرفع
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          // التعامل مع الأخطاء
          console.error('خطأ في رفع الفيديو:', error);
          reject(error);
        },
        async () => {
          // عند اكتمال الرفع بنجاح
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            console.error('خطأ في الحصول على رابط التحميل:', error);
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('خطأ في إعداد رفع الفيديو:', error);
    throw error;
  }
};

/**
 * حذف فيديو من Firebase Storage
 * @param {string} videoUrl - رابط الفيديو المراد حذفه
 * @returns {Promise<void>}
 */
export const deleteVideo = async (videoUrl) => {
  try {
    // استخراج المسار من الرابط
    const url = new URL(videoUrl);
    const pathname = decodeURIComponent(url.pathname);
    const pathMatch = pathname.match(/\/o\/(.+)$/);
    
    if (!pathMatch) {
      throw new Error('رابط الفيديو غير صالح');
    }

    const filePath = pathMatch[1];
    const videoRef = ref(storage, filePath);
    
    await deleteObject(videoRef);
    console.log('تم حذف الفيديو بنجاح');
  } catch (error) {
    console.error('خطأ في حذف الفيديو:', error);
    throw error;
  }
};

/**
 * التحقق من صحة ملف الفيديو
 * @param {File} file - ملف الفيديو
 * @param {Object} options - خيارات التحقق
 * @returns {Object} نتيجة التحقق
 */
export const validateVideoFile = (file, options = {}) => {
  const {
    maxSize = 100 * 1024 * 1024, // 100MB
    allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'],
    maxDuration = null // بالثواني
  } = options;

  const errors = [];

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

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * الحصول على معاينة مصغرة للفيديو
 * @param {File} file - ملف الفيديو
 * @returns {Promise<string>} رابط الصورة المصغرة
 */
export const generateVideoThumbnail = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

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

/**
 * الحصول على معلومات الفيديو
 * @param {File} file - ملف الفيديو
 * @returns {Promise<Object>} معلومات الفيديو
 */
export const getVideoInfo = (file) => {
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

export default {
  uploadVideo,
  deleteVideo,
  validateVideoFile,
  generateVideoThumbnail,
  getVideoInfo
}; 
