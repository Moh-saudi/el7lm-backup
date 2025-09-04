'use client';

import React from 'react';

interface ErrorScreenProps {
  title?: string;
  message?: string;
  onRefresh?: () => void;
  onReturnToLogin?: () => void;
  type?: 'error' | 'warning' | 'info';
}

export default function ErrorScreen({ 
  title = 'حدث خطأ',
  message = 'نعتذر، حدث خطأ غير متوقع',
  onRefresh = () => window.location.reload(),
  onReturnToLogin = () => window.location.href = '/auth/login',
  type = 'error'
}: ErrorScreenProps) {
  
  const getErrorIcon = () => {
    switch (type) {
      case 'warning':
        return (
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        );
      case 'info':
        return (
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        );
      default:
        return (
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 rounded-full animate-bounce"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        );
    }
  };

  const getBackgroundGradient = () => {
    switch (type) {
      case 'warning':
        return 'from-yellow-50 via-orange-50 to-red-50';
      case 'info':
        return 'from-blue-50 via-indigo-50 to-purple-50';
      default:
        return 'from-red-50 via-pink-50 to-red-50';
    }
  };

  const getGlowColor = () => {
    switch (type) {
      case 'warning':
        return 'from-yellow-400/20 via-orange-400/20 to-yellow-400/20';
      case 'info':
        return 'from-blue-400/20 via-purple-400/20 to-blue-400/20';
      default:
        return 'from-red-400/20 via-pink-400/20 to-red-400/20';
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${getBackgroundGradient()}`}>
      <div className="text-center p-8 max-w-md relative">
        {/* شعاع خلفي */}
        <div className={`absolute inset-0 bg-gradient-to-r ${getGlowColor()} blur-3xl opacity-30 animate-pulse`}></div>
        
        <div className="relative z-10">
          {getErrorIcon()}
          
          {/* العنوان */}
          <h2 className="text-3xl font-bold text-gray-800 mb-4 animate-fade-in">
            {title}
          </h2>
          
          {/* الرسالة */}
          <p className="text-gray-600 mb-8 leading-relaxed animate-fade-in animation-delay-200">
            {message}
          </p>
          
          {/* أزرار الإجراءات */}
          <div className="space-y-4 animate-fade-in animation-delay-400">
            <button
              onClick={onRefresh}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium"
            >
              إعادة تحديث الصفحة
            </button>
            
            <button
              onClick={onReturnToLogin}
              className="w-full px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium border border-gray-200"
            >
              العودة لتسجيل الدخول
            </button>
          </div>
          
          {/* معلومات إضافية */}
          <div className="mt-8 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20 animate-fade-in animation-delay-600">
            <p className="text-xs text-gray-500 mb-2">
              إذا استمرت المشكلة، يرجى:
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• التأكد من اتصال الإنترنت</li>
              <li>• مسح ذاكرة التخزين المؤقت للمتصفح</li>
              <li>• المحاولة من متصفح آخر</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 
