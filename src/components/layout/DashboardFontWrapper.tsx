'use client';

import React from 'react';

interface DashboardFontWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function DashboardFontWrapper({ children, className = '' }: DashboardFontWrapperProps) {
  const locale = 'ar';
  const isRTL = true;
  
  // تحديد الخط حسب اللغة
  const fontClass = locale === 'en' ? 'font-english' : 'font-arabic';
  
  return (
    <div className={`min-h-screen ${fontClass} ${className}`} style={{ direction: isRTL ? 'rtl' : 'ltr' }} lang={locale}>
      {children}
    </div>
  );
}

// مكون خاص للعناوين في لوحات التحكم
export function DashboardHeading({ 
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

// مكون خاص للنصوص في لوحات التحكم
export function DashboardText({ 
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

// مكون خاص للأزرار في لوحات التحكم
export function DashboardButton({ 
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

// مكون خاص لحقول الإدخال في لوحات التحكم
export function DashboardInput({ 
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

// مكون خاص للنصوص المختلطة في لوحات التحكم
export function DashboardMixedText({ 
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
