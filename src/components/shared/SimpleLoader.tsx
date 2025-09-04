'use client';

import React from 'react';

interface SimpleLoaderProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export default function SimpleLoader({ 
  size = 'medium',
  color = 'blue'
}: SimpleLoaderProps) {
  
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'w-16 h-16',
          ball: 'w-2 h-2'
        };
      case 'large':
        return {
          container: 'w-24 h-24',
          ball: 'w-4 h-4'
        };
      default:
        return {
          container: 'w-20 h-20',
          ball: 'w-3 h-3'
        };
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'purple':
        return 'bg-purple-500';
      case 'green':
        return 'bg-green-500';
      case 'red':
        return 'bg-red-500';
      case 'orange':
        return 'bg-orange-500';
      default:
        return 'bg-blue-500';
    }
  };

  const sizes = getSizeClasses();
  const colorClass = getColorClasses();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className={`relative ${sizes.container}`}>
        {/* الكرة الأولى */}
        <div 
          className={`absolute ${sizes.ball} ${colorClass} rounded-full animate-orbit-1`}
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        
        {/* الكرة الثانية */}
        <div 
          className={`absolute ${sizes.ball} ${colorClass} rounded-full animate-orbit-2 opacity-75`}
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        
        {/* الكرة الثالثة */}
        <div 
          className={`absolute ${sizes.ball} ${colorClass} rounded-full animate-orbit-3 opacity-50`}
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>
    </div>
  );
}

// تصدير الـ CSS للاستخدام في globals.css
export const SimpleLoaderStyles = `
  @keyframes orbit-1 {
    0% { transform: translate(-50%, -50%) rotate(0deg) translateX(30px) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg) translateX(30px) rotate(-360deg); }
  }
  
  @keyframes orbit-2 {
    0% { transform: translate(-50%, -50%) rotate(120deg) translateX(25px) rotate(-120deg); }
    100% { transform: translate(-50%, -50%) rotate(480deg) translateX(25px) rotate(-480deg); }
  }
  
  @keyframes orbit-3 {
    0% { transform: translate(-50%, -50%) rotate(240deg) translateX(20px) rotate(-240deg); }
    100% { transform: translate(-50%, -50%) rotate(600deg) translateX(20px) rotate(-600deg); }
  }
  
  .animate-orbit-1 {
    animation: orbit-1 2s linear infinite;
  }
  
  .animate-orbit-2 {
    animation: orbit-2 2s linear infinite;
  }
  
  .animate-orbit-3 {
    animation: orbit-3 2s linear infinite;
  }
`; 
