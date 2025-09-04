/**
 * أداة فحص وتنظيف روابط الصور
 * Image URL Validator and Sanitizer
 */

import { Player } from '../types/player';

// قائمة النطاقات المحظورة أو الوهمية
const INVALID_DOMAINS = [
  'test-url.com',
  'example.com', 
  'placeholder.com',
  'dummy-url.com',
  'fake-image.com',
  'localhost:3000', // تجنب localhost في الإنتاج
];

// قائمة امتدادات الصور المقبولة
const VALID_IMAGE_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg', '.bmp', '.ico'
];

/**
 * فحص صحة رابط الصورة
 * @param url - رابط الصورة
 * @returns boolean - true إذا كان الرابط صحيح
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  // تنظيف الرابط
  const cleanUrl = url.trim();
  
  // فحص إذا كان فارغ أو نصوص خاطئة
  if (cleanUrl === '' || cleanUrl === 'undefined' || cleanUrl === 'null' || cleanUrl === '[object Object]') {
    return false;
  }
  
  // فحص النطاقات المحظورة
  if (INVALID_DOMAINS.some(domain => cleanUrl.includes(domain))) {
    return false;
  }
  
  // فحص إذا كان يبدأ بـ http أو data أو /
  if (!cleanUrl.startsWith('http') && !cleanUrl.startsWith('data:') && !cleanUrl.startsWith('/')) {
    return false;
  }
  
  return true;
}

/**
 * تنظيف وتصحيح رابط الصورة
 * @param url - رابط الصورة الأصلي
 * @param fallback - الرابط البديل (افتراضي: /images/default-avatar.png)
 * @returns string - الرابط المنظف أو البديل
 */
export function sanitizeImageUrl(url: string, fallback: string = '/images/default-avatar.png'): string {
  if (!isValidImageUrl(url)) {
    console.warn(`رابط صورة غير صحيح تم استبداله: ${url}`);
    return fallback;
  }
  
  return url.trim();
}

/**
 * فحص إضافي لروابط Supabase المكسورة
 * @param url - رابط Supabase
 * @returns boolean - true إذا كان الرابط يبدو مكسور
 */
export function isLikelyBrokenSupabaseUrl(url: string): boolean {
  if (!url.includes('supabase.co')) return false;
  
  // أنماط شائعة للروابط المكسورة
  const brokenPatterns = [
    '/storage/v1/object/public/avatars/undefined/',
    '/storage/v1/object/public/avatars/null/',
    'profile.undefined',
    'profile.null',
    // إضافة أنماط أخرى حسب الحاجة
  ];
  
  return brokenPatterns.some(pattern => url.includes(pattern));
}

/**
 * تنظيف شامل لمصفوفة من روابط الصور
 * @param urls - مصفوفة من روابط الصور
 * @param fallback - الرابط البديل
 * @returns string[] - مصفوفة من الروابط المنظفة
 */
export function sanitizeImageUrls(urls: string[], fallback: string = '/images/default-avatar.png'): string[] {
  return urls.map(url => sanitizeImageUrl(url, fallback));
}

/**
 * فحص صحة رابط الصورة بشكل مباشر (async)
 * @param url - رابط الصورة
 * @returns Promise<boolean> - true إذا كان الرابط يعمل
 */
export async function validateImageUrlAsync(url: string): Promise<boolean> {
  if (!isValidImageUrl(url)) return false;
  
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      cache: 'no-cache'
    });
    return response.ok;
  } catch (error) {
    console.warn(`فشل في فحص رابط الصورة: ${url}`, error);
    return false;
  }
}

/**
 * استخراج معلومات الصورة من الرابط
 * @param url - رابط الصورة
 * @returns object - معلومات الصورة
 */
export function getImageInfo(url: string) {
  const cleanUrl = sanitizeImageUrl(url);
  
  return {
    url: cleanUrl,
    isValid: isValidImageUrl(url),
    isSupabase: cleanUrl.includes('supabase.co'),
    isFirebase: cleanUrl.includes('firebasestorage.googleapis.com'),
    isLocal: cleanUrl.startsWith('/'),
    isDataUrl: cleanUrl.startsWith('data:'),
    extension: getImageExtension(cleanUrl),
    domain: extractDomain(cleanUrl)
  };
}

/**
 * استخراج امتداد الصورة من الرابط
 * @param url - رابط الصورة
 * @returns string - امتداد الصورة أو فارغ
 */
function getImageExtension(url: string): string {
  const extension = VALID_IMAGE_EXTENSIONS.find(ext => url.toLowerCase().includes(ext));
  return extension || '';
}

/**
 * استخراج النطاق من الرابط
 * @param url - الرابط
 * @returns string - النطاق أو فارغ
 */
function extractDomain(url: string): string {
  try {
    if (url.startsWith('/') || url.startsWith('data:')) return 'local';
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
}

/**
 * تنظيف بيانات اللاعب من الصور المكسورة
 * @param playerData - بيانات اللاعب
 * @returns بيانات اللاعب منظفة
 */
export function sanitizePlayerImages(playerData: Partial<Player>): Partial<Player> {
  if (!playerData) return playerData;
  
  const sanitized: Partial<Player> = { ...playerData };
  
  // تنظيف صورة الملف الشخصي
  if (sanitized.profile_image_url) {
    sanitized.profile_image_url = sanitizeImageUrl(sanitized.profile_image_url);
  }
  
  if (sanitized.profile_image) {
    sanitized.profile_image = sanitizeImageUrl(sanitized.profile_image);
  }
  
  // تنظيف صور إضافية إذا وجدت
  if ('avatar_url' in sanitized && sanitized.avatar_url) {
    (sanitized as Record<string, unknown>).avatar_url = sanitizeImageUrl(sanitized.avatar_url as string);
  }
  
  if (sanitized.additional_images && Array.isArray(sanitized.additional_images)) {
    sanitized.additional_images = sanitized.additional_images.map(img => ({
      ...img,
      url: sanitizeImageUrl(img.url)
    }));
  }
  
  return sanitized;
} 
