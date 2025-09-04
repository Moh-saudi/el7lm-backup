'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '@/lib/utils/production-logger';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  pageName: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class PageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError('PageErrorBoundary', `Error in page: ${this.props.pageName}`, error);
    
    this.setState({
      hasError: true,
      error,
      errorInfo
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-lg w-full bg-white shadow-xl rounded-lg p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              خطأ في الصفحة
            </h2>
            
            <p className="text-gray-600 mb-6">
              حدث خطأ في صفحة <strong>{this.props.pageName}</strong>. 
              يرجى المحاولة مرة أخرى أو العودة للصفحة السابقة.
            </p>

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                إعادة تحميل الصفحة
              </button>
              
              <Link
                href="/dashboard"
                className="block w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                العودة للوحة التحكم
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="w-full bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                العودة للصفحة السابقة
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 font-medium">
                  تفاصيل الخطأ (للمطورين)
                </summary>
                <div className="mt-3 p-4 bg-gray-100 rounded-lg text-xs font-mono overflow-auto max-h-64">
                  <div className="mb-3">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-2 text-xs">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook للاستخدام في صفحات
export const usePageError = (pageName: string) => {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
    logError('usePageError', `Error in page: ${pageName}`, error);
  }, [pageName]);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, resetError };
};

// HOC لتحويل أي page إلى error boundary
export const withPageErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  pageName: string,
  fallback?: ReactNode
) => {
  return React.forwardRef<any, P>((props, ref) => (
    <PageErrorBoundary pageName={pageName} fallback={fallback}>
      <Component {...props} ref={ref} />
    </PageErrorBoundary>
  ));
}; 
