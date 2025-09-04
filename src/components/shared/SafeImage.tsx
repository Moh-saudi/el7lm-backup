'use client';

import Image from 'next/image';
import { useState } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  quality?: number;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
}

export default function SafeImage({
  src,
  alt,
  width,
  height,
  className = '',
  fallbackSrc = '/images/default-avatar.png',
  quality = 75,
  priority = false,
  fill = false,
  sizes,
  style,
  ...props
}: SafeImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // فحص إذا كان الرابط مكسور أو وهمي
  const isBrokenUrl = (url: string) => {
    if (!url || typeof url !== 'string') return true;
    
    // فحص الروابط الوهمية
    const invalidUrls = ['test-url.com', 'example.com', 'placeholder.com'];
    if (invalidUrls.some(invalid => url.includes(invalid))) {
      return true;
    }
    
    // فحص الروابط الفارغة أو المكسورة
    if (url.trim() === '' || url === 'undefined' || url === 'null' || url === '[object Object]') {
      return true;
    }
    
    // فحص روابط Supabase المكسورة
    if (url.includes('supabase.co') && url.includes('/storage/')) {
      if (url.includes('/undefined/') || 
          url.includes('/null/') ||
          url.includes('profile.undefined') ||
          url.includes('profile.null')) {
        return true;
      }
    }
    
    return false;
  };

  // التعامل مع أخطاء تحميل الصورة
  const handleError = () => {
    if (!imageError && imageSrc !== fallbackSrc) {
      console.warn(`فشل تحميل الصورة: ${imageSrc}`);
      setImageError(true);
      setImageSrc(fallbackSrc);
    }
    setIsLoading(false);
  };

  // التعامل مع نجاح تحميل الصورة
  const handleLoad = () => {
    setIsLoading(false);
  };

  // استخدام fallback مباشرة للروابط المكسورة
  const finalSrc = isBrokenUrl(imageSrc) ? fallbackSrc : imageSrc;

  // خصائص الصورة المشتركة
  const imageProps = {
    src: finalSrc,
    alt,
    onError: handleError,
    onLoad: handleLoad,
    quality,
    priority,
    className: `${className} ${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`,
    style,
    ...props
  };

  // إذا كانت fill true
  if (fill) {
    return (
      <div className="relative w-full h-full">
        <Image
          {...imageProps}
          fill
          sizes={sizes || '100vw'}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
        )}
      </div>
    );
  }

  // إذا كانت أبعاد محددة
  if (width && height) {
    return (
      <div className="relative" style={{ width, height }}>
        <Image
          {...imageProps}
          width={width}
          height={height}
        />
        {isLoading && (
          <div 
            className="absolute inset-0 bg-gray-200 animate-pulse rounded"
            style={{ width, height }}
          />
        )}
      </div>
    );
  }

  // افتراضي
  return (
    <div className="relative">
      <Image
        {...imageProps}
        width={width || 200}
        height={height || 200}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
    </div>
  );
} 
