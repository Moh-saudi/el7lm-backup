/**
 * ضغط الصور تلقائياً قبل الرفع
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
}

/**
 * ضغط صورة إلى حجم أصغر
 */
export function compressImage(
  file: File, 
  options: CompressionOptions = {}
): Promise<File> {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 800,
      maxHeight = 800,
      quality = 0.8,
      maxSizeMB = 5
    } = options;

    // التحقق من أن الملف صورة
    if (!file.type.startsWith('image/')) {
      resolve(file); // إرجاع الملف كما هو إذا لم يكن صورة
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // حساب الأبعاد الجديدة مع الحفاظ على النسبة
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      // إعداد Canvas
      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error('فشل في إنشاء canvas context'));
        return;
      }

      // رسم الصورة المضغوطة
      ctx.drawImage(img, 0, 0, width, height);

      // تحويل إلى Blob مع ضغط الجودة
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('فشل في ضغط الصورة'));
            return;
          }

          // إنشاء ملف جديد مضغوط
          const compressedFile = new File(
            [blob], 
            file.name.replace(/\.[^/.]+$/, '.jpg'), // تحويل إلى JPG للضغط الأفضل
            {
              type: 'image/jpeg',
              lastModified: Date.now()
            }
          );

          console.log(`📦 ضغط الصورة:
          📊 الحجم الأصلي: ${(file.size / 1024 / 1024).toFixed(2)} MB
          📉 الحجم المضغوط: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB
          🎯 نسبة الضغط: ${((1 - compressedFile.size / file.size) * 100).toFixed(1)}%
          📐 الأبعاد: ${width}x${height}`);

          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('فشل في قراءة الصورة'));
    };

    // بدء قراءة الصورة
    img.src = URL.createObjectURL(file);
  });
}

/**
 * ضغط تلقائي ذكي حسب حجم الملف
 */
export async function smartCompress(file: File): Promise<File> {
  const fileSizeMB = file.size / 1024 / 1024;

  console.log(`🔍 فحص الصورة: ${file.name} (${fileSizeMB.toFixed(2)} MB)`);

  // إذا كان الملف صغير، لا نحتاج لضغط
  if (fileSizeMB <= 1) {
    console.log('✅ الصورة صغيرة، لا تحتاج ضغط');
    return file;
  }

  // خيارات الضغط حسب حجم الملف
  let compressionOptions: CompressionOptions;

  if (fileSizeMB <= 8) {
    // ضغط متوسط للملفات الكبيرة
    compressionOptions = {
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.75
    };
  } else {
    // ضغط قوي للملفات الكبيرة جداً
    compressionOptions = {
      maxWidth: 600,
      maxHeight: 600,
      quality: 0.6
    };
  }

  try {
    const compressedFile = await compressImage(file, compressionOptions);
    
    // إذا كان الملف المضغوط لا يزال كبيراً، جرب ضغط أقوى
    if (compressedFile.size > 5 * 1024 * 1024) {
      console.log('⚠️ الصورة لا تزال كبيرة، جاري ضغط إضافي...');
      
      return await compressImage(file, {
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.5
      });
    }

    return compressedFile;
  } catch (error) {
    console.error('❌ فشل في ضغط الصورة:', error);
    return file; // إرجاع الملف الأصلي في حالة فشل الضغط
  }
}

/**
 * معاينة سريعة للصورة قبل الضغط
 */
export function getImageDimensions(file: File): Promise<{width: number; height: number}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    
    img.onerror = () => {
      reject(new Error('فشل في قراءة أبعاد الصورة'));
    };
    
    img.src = URL.createObjectURL(file);
  });
} 
