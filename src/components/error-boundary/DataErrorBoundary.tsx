'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '@/lib/utils/production-logger';

interface Props {
  children: ReactNode;
  dataType: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  retryFunction?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  retryCount: number;
}

export class DataErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError('DataErrorBoundary', `Error loading ${this.props.dataType}`, error);
    
    this.setState(prev => ({
      hasError: true,
      error,
      retryCount: prev.retryCount + 1
    }));

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    if (this.props.retryFunction) {
      this.props.retryFunction();
    }
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
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
                فشل في تحميل {this.props.dataType}. 
                {this.state.retryCount > 0 && ` (محاولة ${this.state.retryCount})`}
              </p>
              
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={this.handleRetry}
                  className="text-sm text-orange-600 hover:text-orange-800 font-medium"
                >
                  إعادة المحاولة
                </button>
                
                {this.state.retryCount >= 3 && (
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
    }

    return this.props.children;
  }
}

// Hook للاستخدام في data fetching
export const useDataError = (dataType: string) => {
  const [error, setError] = React.useState<Error | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
    setRetryCount(prev => prev + 1);
    logError('useDataError', `Error loading ${dataType}`, error);
  }, [dataType]);

  const resetError = React.useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  return { error, retryCount, handleError, resetError };
};

// HOC لتحويل أي component إلى data error boundary
export const withDataErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  dataType: string,
  fallback?: ReactNode,
  retryFunction?: () => void
) => {
  return React.forwardRef<any, P>((props, ref) => (
    <DataErrorBoundary 
      dataType={dataType} 
      fallback={fallback}
      retryFunction={retryFunction}
    >
      <Component {...props} ref={ref} />
    </DataErrorBoundary>
  ));
}; 
