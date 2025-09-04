'use client';

import React from 'react';

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
  type?: 'default' | 'pulse' | 'dots' | 'wave' | 'gradient';
}

export default function LoadingScreen({ 
  message = 'جاري تحميل بيانات المستخدم...', 
  subMessage = 'الرجاء الانتظار لحظات',
  type = 'gradient'
}: LoadingScreenProps) {
  
  const renderLoader = () => {
    switch (type) {
      case 'pulse':
        return (
          <div className="relative">
            <div className="w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-75"></div>
              <div className="absolute inset-2 bg-blue-500 rounded-full animate-ping animation-delay-200 opacity-75"></div>
              <div className="absolute inset-4 bg-blue-400 rounded-full animate-ping animation-delay-400 opacity-75"></div>
              <div className="absolute inset-6 bg-white rounded-full shadow-lg"></div>
            </div>
          </div>
        );

      case 'dots':
        return (
          <div className="flex justify-center items-center space-x-2 mb-6">
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-4 h-4 bg-blue-400 rounded-full animate-bounce animation-delay-400"></div>
          </div>
        );

      case 'wave':
        return (
          <div className="flex justify-center items-end space-x-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-2 bg-gradient-to-t from-blue-600 to-blue-400 rounded-full animate-pulse"
                style={{
                  height: `${20 + Math.sin(i) * 10}px`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        );

      case 'gradient':
        return (
          <div className="relative w-20 h-20 mx-auto mb-6">
            {/* الحلقة الخارجية */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-spin"></div>
            <div className="absolute inset-1 rounded-full bg-white"></div>
            
            {/* الحلقة الداخلية */}
            <div className="absolute inset-3 rounded-full bg-gradient-to-r from-blue-400 via-blue-600 to-purple-500 animate-spin animation-reverse"></div>
            <div className="absolute inset-4 rounded-full bg-white"></div>
            
            {/* النقطة المركزية */}
            <div className="absolute inset-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse"></div>
          </div>
        );

      default:
        return (
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="text-center p-8 max-w-md">
        {/* شعاع خلفي */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-400/20 blur-3xl opacity-30 animate-pulse"></div>
        
        <div className="relative z-10">
          {renderLoader()}
          
          {/* الرسالة الأساسية */}
          <h3 className="text-xl font-semibold text-gray-800 mb-3 animate-fade-in">
            {message}
          </h3>
          
          {/* الرسالة الثانوية */}
          <p className="text-gray-600 text-sm mb-6 animate-fade-in animation-delay-300">
            {subMessage}
          </p>
          
          {/* شريط التقدم الوهمي */}
          <div className="w-64 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-loading-bar"></div>
          </div>
          
          {/* زر إعادة المحاولة (يظهر بعد فترة) */}
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
            className="mt-8 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 opacity-0 animate-fade-in-delayed text-sm font-medium"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    </div>
  );
}

// إضافة الـ CSS animations إلى globals.css
export const LoadingScreenStyles = `
  @keyframes loading-bar {
    0% { transform: translateX(-100%); }
    50% { transform: translateX(0%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes fade-in-delayed {
    0%, 80% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  .animate-loading-bar {
    animation: loading-bar 2s ease-in-out infinite;
  }
  
  .animate-fade-in {
    animation: fade-in 0.6s ease-out forwards;
  }
  
  .animate-fade-in-delayed {
    animation: fade-in-delayed 8s ease-out forwards;
  }
  
  .animation-delay-200 {
    animation-delay: 0.2s;
  }
  
  .animation-delay-300 {
    animation-delay: 0.3s;
  }
  
  .animation-delay-400 {
    animation-delay: 0.4s;
  }
  
  .animation-reverse {
    animation-direction: reverse;
  }
`; 
