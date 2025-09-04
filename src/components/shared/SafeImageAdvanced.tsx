'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
  onError?: () => void;
  fallbackSrc?: string;
}

// معرفة الروابط المكسورة المعروفة
const isBrokenImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return true;
  
  // التحقق من الروابط الوهمية
  if (url.includes('test-url.com') || 
      url.includes('example.com') || 
      url.includes('placeholder.com') ||
      url.includes('fake-image') ||
      url.includes('dummy-image')) {
    return true;
  }
  
  // التحقق من روابط Supabase المكسورة
  if (url.includes('supabase.co') && url.includes('/storage/v1/object/public/')) {
    const brokenPatterns = [
      '/avatars/undefined/',
      '/avatars/null/',
      '/avatars//',
      '/profile.png',
      '/profile.jpg',
      '/avatar.png',
      '/avatar.jpg',
    ];
    
    return brokenPatterns.some(pattern => url.includes(pattern));
  }
  
  if (url.length < 10 || !url.startsWith('http')) {
    return true;
  }
  
  return false;
};

// معرفة ما إذا كان الرابط خارجي (Supabase)
const isExternalUrl = (url: string): boolean => {
  return url.includes('supabase.co') || url.includes('firebasestorage.googleapis.com') || url.startsWith('http');
};

export default function SafeImageAdvanced({
  src,
  alt,
  width = 100,
  height = 100,
  className = '',
  fill = false,
  priority = false,
  sizes,
  style,
  onError,
  fallbackSrc = '/images/default-avatar.png'
}: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [useNextImage, setUseNextImage] = useState(false);

  useEffect(() => {
    // إعادة تعيين الحالة عند تغيير المصدر
    setHasError(false);
    
    // فحص إذا كان الرابط مكسور
    if (isBrokenImageUrl(src)) {
      setCurrentSrc(fallbackSrc);
      setHasError(true);
      setUseNextImage(false); // استخدم img عادي للصور الافتراضية
      return;
    }
    
    setCurrentSrc(src);
    
    // قرار استخدام Next.js Image أم img عادي
    // استخدم img عادي للروابط الخارجية (Supabase) لتجنب مشكلة الـ loader
    setUseNextImage(!isExternalUrl(src));
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!hasError && currentSrc !== fallbackSrc) {
      console.log(`🔧 SafeImageAdvanced: Error loading ${currentSrc}, switching to fallback`);
      setCurrentSrc(fallbackSrc);
      setHasError(true);
      setUseNextImage(false); // استخدم img عادي للصورة الافتراضية
      onError?.();
    }
  };

  // إذا كان يجب استخدام Next.js Image للصور المحلية
  if (useNextImage && !hasError) {
    return (
      <Image
        src={currentSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        sizes={sizes}
        className={className}
        style={style}
        onError={handleError}
        unoptimized={false} // تحسين للصور المحلية
      />
    );
  }

  // استخدام img عادي للروابط الخارجية والصور المكسورة
  return (
    <img
      src={currentSrc}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={className}
      style={fill ? { ...style, width: '100%', height: '100%', objectFit: 'cover' } : style}
      onError={handleError}
      loading={priority ? 'eager' : 'lazy'}
    />
  );
} 
