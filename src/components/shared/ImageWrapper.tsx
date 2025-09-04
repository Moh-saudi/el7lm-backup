'use client';

import React from 'react';
import Image from 'next/image';

interface ImageWrapperProps {
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

/**
 * مكون صورة ذكي يختار تلقائياً بين Next.js Image و img عادي
 * لتجنب مشاكل الـ loader مع الروابط الخارجية
 */
export default function ImageWrapper({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  priority = false,
  sizes,
  style,
  onError,
  fallbackSrc = '/images/default-avatar.png'
}: ImageWrapperProps) {
  // التحقق من نوع الرابط
  const isExternalUrl = (url: string): boolean => {
    return url.includes('supabase.co') || 
           url.includes('firebasestorage.googleapis.com') || 
           url.includes('cloudinary.com') ||
           (url.startsWith('http') && !url.includes(typeof window !== 'undefined' ? window.location.hostname : ''));
  };

  // التحقق من الروابط المكسورة
  const isBrokenUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string') return true;
    
    const brokenPatterns = [
      'test-url.com',
      'example.com', 
      'placeholder.com',
      'fake-image',
      'dummy-image',
      '/undefined/',
      '/null/',
      '//',
    ];
    
    return brokenPatterns.some(pattern => url.includes(pattern)) ||
           url.length < 10 ||
           (!url.startsWith('http') && !url.startsWith('/'));
  };

  // إذا كان الرابط مكسور، استخدم الصورة الافتراضية
  const finalSrc = isBrokenUrl(src) ? fallbackSrc : src;
  
  // معالج الأخطاء
  const handleError = (e: any) => {
    if (e.target && e.target.src !== fallbackSrc) {
      e.target.src = fallbackSrc;
    }
    onError?.();
  };

  // للروابط الخارجية، استخدم img عادي لتجنب مشكلة الـ loader
  if (isExternalUrl(finalSrc)) {
    return (
      <img
        src={finalSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={className}
        style={fill ? { 
          ...style, 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover' as const
        } : style}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
      />
    );
  }

  // للروابط المحلية، استخدم Next.js Image
  return (
    <Image
      src={finalSrc}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      priority={priority}
      sizes={sizes}
      className={className}
      style={style}
      onError={handleError}
      unoptimized={false}
    />
  );
} 
