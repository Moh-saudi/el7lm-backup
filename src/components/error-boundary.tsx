'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // تحقق من أخطاء URLs العربية و JSON parsing
    if (
      error.message.includes('Invalid URL with Arabic text') ||
      error.message.includes('%D8%') ||
      error.message.includes('Failed to execute \'json\' on \'Response\'') ||
      error.message.includes('Unexpected end of JSON input') ||
      error.stack?.includes('url-validator') ||
      error.stack?.includes('Preview.js') ||
      error.message.includes('Invalid or unexpected token') ||
      error.message.includes('SyntaxError')
    ) {
      console.debug('🚫 تم التعامل مع خطأ في Error Boundary:', error.message);
      // لا نعتبر هذا خطأ حقيقي، فقط نتجاهله
      return { hasError: false };
    }

    // للأخطاء الأخرى
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // تسجيل الأخطاء المهمة فقط
    if (
      !error.message.includes('Invalid URL with Arabic text') &&
      !error.message.includes('%D8%') &&
      !error.message.includes('Failed to execute \'json\' on \'Response\'') &&
      !error.message.includes('Unexpected end of JSON input') &&
      !error.stack?.includes('url-validator') &&
      !error.stack?.includes('Preview.js') &&
      !error.message.includes('Invalid or unexpected token') &&
      !error.message.includes('SyntaxError')
    ) {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // يمكنك تخصيص UI للأخطاء هنا
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-red-600 mb-4">حدث خطأ غير متوقع</h2>
              <p className="text-gray-600 mb-4">نعتذر، حدث خطأ في التطبيق</p>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.reload();
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                إعادة تحميل الصفحة
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Hook version للـ functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    // تجاهل أخطاء URLs العربية و JSON parsing
    if (
      error.message.includes('Invalid URL with Arabic text') ||
      error.message.includes('%D8%') ||
      error.message.includes('Failed to execute \'json\' on \'Response\'') ||
      error.message.includes('Unexpected end of JSON input') ||
      error.message.includes('Invalid or unexpected token') ||
      error.message.includes('SyntaxError')
    ) {
      console.debug('🚫 تم تجاهل خطأ في useErrorHandler:', error.message);
      return;
    }

    // تسجيل الأخطاء المهمة
    console.error('Error handled:', error, errorInfo);
  };
} 
