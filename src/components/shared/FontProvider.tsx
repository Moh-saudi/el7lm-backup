'use client';

import React from 'react';

interface FontProviderProps {
  children: React.ReactNode;
  className?: string;
}

export default function FontProvider({ children, className = '' }: FontProviderProps) {
  const locale = 'ar';
  
  // تحديد الخط حسب اللغة
  const fontClass = locale === 'en' ? 'font-english' : 'font-arabic';
  
  return (
    <div className={`${fontClass} ${className}`} lang={locale}>
      {children}
    </div>
  );
}

// مكون للعناوين مع الخط المناسب
export function FontHeading({ 
  children, 
  level = 'h1', 
  className = '' 
}: { 
  children: React.ReactNode; 
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'; 
  className?: string;
}) {
  const locale = 'ar';
  const fontClass = locale === 'en' ? 'font-english' : 'font-arabic';
  
  const Tag = level as keyof JSX.IntrinsicElements;
  
  return (
    <Tag className={`${fontClass} ${className}`} lang={locale}>
      {children}
    </Tag>
  );
}

// مكون للنصوص مع الخط المناسب
export function FontText({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  const locale = 'ar';
  const fontClass = locale === 'en' ? 'font-english' : 'font-arabic';
  
  return (
    <span className={`${fontClass} ${className}`} lang={locale}>
      {children}
    </span>
  );
}

// مكون للأزرار مع الخط المناسب
export function FontButton({ 
  children, 
  className = '', 
  ...props 
}: { 
  children: React.ReactNode; 
  className?: string;
  [key: string]: any;
}) {
  const locale = 'ar';
  const fontClass = locale === 'en' ? 'font-english' : 'font-arabic';
  
  return (
    <button className={`${fontClass} ${className}`} lang={locale} {...props}>
      {children}
    </button>
  );
}

// مكون لحقول الإدخال مع الخط المناسب
export function FontInput({ 
  className = '', 
  ...props 
}: { 
  className?: string;
  [key: string]: any;
}) {
  const locale = 'ar';
  const fontClass = locale === 'en' ? 'font-english' : 'font-arabic';
  
  return (
    <input className={`${fontClass} ${className}`} lang={locale} {...props} />
  );
}

// مكون للنصوص المختلطة (عربي + إنجليزي)
export function MixedFontText({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <span className={`font-auto ${className}`}>
      {children}
    </span>
  );
} 
