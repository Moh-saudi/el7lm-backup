import React from 'react';

// تصدير جميع Error Boundaries
export { ErrorBoundary, useErrorHandler, withErrorBoundary } from './ErrorBoundary';
export { ComponentErrorBoundary, useComponentError, withComponentErrorBoundary } from './ComponentErrorBoundary';
export { PageErrorBoundary, usePageError, withPageErrorBoundary } from './PageErrorBoundary';
export { DataErrorBoundary, useDataError, withDataErrorBoundary } from './DataErrorBoundary';

// تصدير أنواع مشتركة
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

// دالة مساعدة لإنشاء fallback مخصص
export const createCustomFallback = (
  title: string,
  message: string,
  onRetry?: () => void,
  onGoHome?: () => void
) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
      <div className="mb-4">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-gray-500 mb-4">
        {message}
      </p>

      <div className="space-y-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        )}
        
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            العودة للصفحة الرئيسية
          </button>
        )}
      </div>
    </div>
  </div>
);

// دالة مساعدة لإنشاء fallback للمكونات
export const createComponentFallback = (
  componentName: string,
  onRetry?: () => void
) => (
  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      
      <div className="flex-1">
        <h4 className="text-sm font-medium text-red-800">
          خطأ في {componentName}
        </h4>
        <p className="text-sm text-red-600 mt-1">
          حدث خطأ في هذا المكون
        </p>
      </div>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-red-600 hover:text-red-800 font-medium"
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  </div>
);

// دالة مساعدة لإنشاء fallback للبيانات
export const createDataFallback = (
  dataType: string,
  retryCount: number = 0,
  onRetry?: () => void
) => (
  <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      
      <div className="flex-1">
        <h4 className="text-sm font-medium text-orange-800">
          خطأ في تحميل البيانات
        </h4>
        <p className="text-sm text-orange-600 mt-1">
          فشل في تحميل {dataType}. 
          {retryCount > 0 && ` (محاولة ${retryCount})`}
        </p>
        
        <div className="mt-3 flex space-x-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm text-orange-600 hover:text-orange-800 font-medium"
            >
              إعادة المحاولة
            </button>
          )}
          
          {retryCount >= 3 && (
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              إعادة تحميل الصفحة
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);



