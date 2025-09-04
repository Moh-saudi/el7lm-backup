import { supabase } from './config';
import { STORAGE_BUCKETS } from './config';

export interface AdUploadResponse {
  url?: string;
  error?: string;
  path?: string;
  publicUrl?: string;
}

export interface AdFileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

/**
 * التحقق من وجود bucket الإعلانات وإنشاؤه إذا لم يكن موجوداً
 */
export async function ensureAdsBucketExists(): Promise<boolean> {
  try {
    console.log('Checking if ads bucket exists...');
    
    // محاولة الوصول إلى bucket
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.ADS)
      .list('', { 
        limit: 1
      });

    if (error) {
      console.error('Error checking ads bucket:', error);
      
      // إذا كان الخطأ يشير إلى أن bucket غير موجود
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        console.log('Ads bucket not found. Please create it manually in Supabase Dashboard.');
        console.log('Steps to create bucket:');
        console.log('1. Go to Supabase Dashboard');
        console.log('2. Navigate to Storage');
        console.log('3. Create a new bucket named "ads"');
        console.log('4. Set it to public');
        console.log('5. Run the SQL policies from supabase-ads-policies-simple.sql');
        return false;
      }
      
      return false;
    }

    console.log('Ads bucket exists and is accessible');
    return true;
  } catch (error) {
    console.error('Error checking ads bucket:', error);
    return false;
  }
}

/**
 * رفع ملف إعلان (صورة أو فيديو) إلى Supabase Storage
 */
export async function uploadAdFile(
  file: File,
  adId: string,
  fileType: 'image' | 'video'
): Promise<AdUploadResponse> {
  try {
    console.log('Starting file upload process...', { adId, fileType, fileName: file.name });

    // التحقق من وجود bucket أولاً
    const bucketExists = await ensureAdsBucketExists();
    if (!bucketExists) {
      return {
        error: 'bucket الإعلانات غير موجود. يرجى إنشاؤه في Supabase Dashboard أولاً.'
      };
    }

    // التحقق من نوع الملف
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
    
    const allowedTypes = fileType === 'image' ? allowedImageTypes : allowedVideoTypes;
    
    if (!allowedTypes.includes(file.type)) {
      return {
        error: `نوع الملف غير مدعوم. الأنواع المدعومة: ${allowedTypes.join(', ')}`
      };
    }

    // التحقق من حجم الملف (10MB للصور، 100MB للفيديوهات)
    const maxSize = fileType === 'image' ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        error: `حجم الملف كبير جداً. الحد الأقصى: ${fileType === 'image' ? '10MB' : '100MB'}`
      };
    }

    // إنشاء مسار فريد للملف
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${adId}_${timestamp}.${fileExtension}`;
    const filePath = `${fileType}s/${fileName}`;

    console.log('Uploading file to path:', filePath);

    // رفع الملف مباشرة إلى Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.ADS)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading ad file:', error);
      
      // رسائل خطأ أكثر تفصيلاً
      if (error.message.includes('not found')) {
        return {
          error: 'bucket الإعلانات غير موجود. يرجى إنشاؤه في Supabase Dashboard.'
        };
      } else if (error.message.includes('permission')) {
        return {
          error: 'لا توجد صلاحيات كافية لرفع الملف. يرجى التحقق من سياسات Storage.'
        };
      } else if (error.message.includes('already exists')) {
        return {
          error: 'الملف موجود بالفعل. يرجى اختيار ملف آخر.'
        };
      }
      
      return {
        error: `فشل في رفع الملف: ${error.message}`
      };
    }

    console.log('File uploaded successfully, getting public URL...');

    // الحصول على الرابط العام
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.ADS)
      .getPublicUrl(filePath);

    if (!urlData.publicUrl) {
      return {
        error: 'فشل في الحصول على الرابط العام للملف'
      };
    }

    console.log('Upload completed successfully:', urlData.publicUrl);

    return {
      url: urlData.publicUrl,
      path: filePath,
      publicUrl: urlData.publicUrl
    };

  } catch (error) {
    console.error('Error in uploadAdFile:', error);
    return {
      error: `خطأ غير متوقع: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
    };
  }
}

/**
 * حذف ملف إعلان من Supabase Storage
 */
export async function deleteAdFile(filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Deleting file:', filePath);
    
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.ADS)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting ad file:', error);
      return {
        success: false,
        error: `فشل في حذف الملف: ${error.message}`
      };
    }

    console.log('File deleted successfully');
    return { success: true };

  } catch (error) {
    console.error('Error in deleteAdFile:', error);
    return {
      success: false,
      error: `خطأ غير متوقع: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
    };
  }
}

/**
 * الحصول على قائمة ملفات إعلان معين
 */
export async function getAdFiles(adId: string): Promise<AdFileInfo[]> {
  try {
    console.log('Getting files for ad:', adId);
    
    // البحث في مجلد الصور
    const { data: images, error: imagesError } = await supabase.storage
      .from(STORAGE_BUCKETS.ADS)
      .list('images', {
        search: adId
      });

    // البحث في مجلد الفيديوهات
    const { data: videos, error: videosError } = await supabase.storage
      .from(STORAGE_BUCKETS.ADS)
      .list('videos', {
        search: adId
      });

    if (imagesError || videosError) {
      console.error('Error listing ad files:', imagesError || videosError);
      return [];
    }

    const files: AdFileInfo[] = [];

    // معالجة الصور
    if (images) {
      for (const image of images) {
        if (image.name && image.name.includes(adId)) {
          const { data: urlData } = supabase.storage
            .from(STORAGE_BUCKETS.ADS)
            .getPublicUrl(`images/${image.name}`);

          files.push({
            id: image.id || image.name,
            name: image.name,
            size: image.metadata?.size || 0,
            type: 'image',
            url: urlData.publicUrl,
            uploadedAt: new Date(image.updated_at || Date.now())
          });
        }
      }
    }

    // معالجة الفيديوهات
    if (videos) {
      for (const video of videos) {
        if (video.name && video.name.includes(adId)) {
          const { data: urlData } = supabase.storage
            .from(STORAGE_BUCKETS.ADS)
            .getPublicUrl(`videos/${video.name}`);

          files.push({
            id: video.id || video.name,
            name: video.name,
            size: video.metadata?.size || 0,
            type: 'video',
            url: urlData.publicUrl,
            uploadedAt: new Date(video.updated_at || Date.now())
          });
        }
      }
    }

    console.log('Found files:', files.length);
    return files.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

  } catch (error) {
    console.error('Error in getAdFiles:', error);
    return [];
  }
}

/**
 * الحصول على إحصائيات ملفات الإعلانات
 */
export async function getAdsStorageStats(): Promise<{
  totalFiles: number;
  totalSize: number;
  imagesCount: number;
  videosCount: number;
}> {
  try {
    console.log('Getting storage stats...');
    
    const { data: images } = await supabase.storage
      .from(STORAGE_BUCKETS.ADS)
      .list('images');

    const { data: videos } = await supabase.storage
      .from(STORAGE_BUCKETS.ADS)
      .list('videos');

    const imagesCount = images?.length || 0;
    const videosCount = videos?.length || 0;
    const totalFiles = imagesCount + videosCount;

    // حساب الحجم الإجمالي
    let totalSize = 0;
    
    if (images) {
      for (const image of images) {
        totalSize += image.metadata?.size || 0;
      }
    }
    
    if (videos) {
      for (const video of videos) {
        totalSize += video.metadata?.size || 0;
      }
    }

    console.log('Storage stats:', { totalFiles, totalSize, imagesCount, videosCount });

    return {
      totalFiles,
      totalSize,
      imagesCount,
      videosCount
    };

  } catch (error) {
    console.error('Error getting ads storage stats:', error);
    return {
      totalFiles: 0,
      totalSize: 0,
      imagesCount: 0,
      videosCount: 0
    };
  }
}
