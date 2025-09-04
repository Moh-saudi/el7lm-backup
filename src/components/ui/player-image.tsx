import React, { useState, useEffect } from 'react';

interface PlayerImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const PlayerImage: React.FC<PlayerImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  fallback = '/images/default-avatar.png',
  size = 'md'
}) => {
  const [imageSrc, setImageSrc] = useState<string>(fallback);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // تحديد أحجام الصور
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
    
    // معالجة مصدر الصورة
    const processImageSrc = (source: any): string => {
      if (!source) return fallback;
      
      if (typeof source === 'string') {
        const trimmed = source.trim();
        return trimmed || fallback;
      }
      
      if (typeof source === 'object' && source !== null) {
        // دالة مساعدة للبحث العميق في الكائن
        const deepExtractUrl = (obj: any, depth: number = 0): string | null => {
          if (depth > 3) return null; // تجنب البحث العميق جداً
          
          if (typeof obj === 'string' && obj.trim()) {
            return obj.trim();
          }
          
          if (typeof obj === 'object' && obj !== null) {
            // البحث في الخصائص المعروفة أولاً
            const knownKeys = ['url', 'downloadURL', 'src', 'path', 'href', 'link', 'uri'];
            for (const key of knownKeys) {
              if (obj[key]) {
                const result = deepExtractUrl(obj[key], depth + 1);
                if (result) return result;
              }
            }
            
            // البحث في جميع الخصائص إذا لم نجد شيئاً
            for (const [key, value] of Object.entries(obj)) {
              if (typeof value === 'string' && value.trim() && 
                  (value.startsWith('http') || value.startsWith('/') || value.startsWith('data:'))) {
                return value.trim();
              }
            }
          }
          
          return null;
        };

        // محاولة استخراج URL من كائن الصورة
        const extractedUrl = deepExtractUrl(source);
        if (extractedUrl) {
          return extractedUrl;
        }
        
        console.warn('Unknown image object structure, falling back to default. Object structure:', 
          Object.keys(source).join(', '));
        return fallback;
      }
      
      // إذا لم يكن string أو object صالح، استخدم الصورة الافتراضية
      console.warn('Invalid image source type:', typeof source, source);
      return fallback;
    };

    const processedSrc = processImageSrc(src);
    
    // التحقق من صحة المصدر النهائي
    if (!processedSrc || typeof processedSrc !== 'string' || processedSrc === fallback) {
      setImageSrc(fallback);
      setIsLoading(false);
      return;
    }

    // تحديد ما إذا كانت الصورة تحتاج للتحميل
    try {
      // اختبار تحميل الصورة قبل عرضها
      const img = new Image();
      img.onload = () => {
        setImageSrc(processedSrc);
        setIsLoading(false);
        setHasError(false);
      };
      img.onerror = () => {
        setImageSrc(fallback);
        setIsLoading(false);
        setHasError(true);
      };
      
      // التأكد من أن المصدر صالح قبل تعيينه
      if (processedSrc && typeof processedSrc === 'string') {
        img.src = processedSrc;
      } else {
        throw new Error('Invalid image source');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      setImageSrc(fallback);
      setIsLoading(false);
      setHasError(true);
    }
  }, [src, fallback]);

  const handleImageError = () => {
    if (imageSrc !== fallback) {
      setImageSrc(fallback);
      setHasError(true);
    }
  };

  const baseClasses = `
    object-cover rounded-full border-2 border-gray-300 
    transition-all duration-300 ease-in-out
    ${sizeClasses[size]}
    ${isLoading ? 'animate-pulse bg-gray-200' : ''}
    ${hasError ? 'opacity-75' : 'opacity-100'}
    ${className}
  `.trim();

  return (
    <div className="relative inline-block">
      <img
        src={imageSrc}
        alt={alt}
        className={baseClasses}
        onError={handleImageError}
        loading="lazy"
      />
      
      {isLoading && (
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-gray-200 animate-pulse`} />
      )}
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-full border-2 border-gray-300">
          <svg className="w-1/2 h-1/2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      )}
    </div>
  );
};

export default PlayerImage; 
