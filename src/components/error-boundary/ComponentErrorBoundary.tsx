'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '@/lib/utils/production-logger';

interface Props {
  children: ReactNode;
  componentName: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError('ComponentErrorBoundary', `Error in component: ${this.props.componentName}`, error);
    
    this.setState({
      hasError: true,
      error
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800">
                خطأ في {this.props.componentName}
              </h4>
              <p className="text-sm text-red-600 mt-1">
                حدث خطأ في هذا المكون
              </p>
            </div>
            
            <button
              onClick={this.handleRetry}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook للاستخدام في functional components
export const useComponentError = (componentName: string) => {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
    logError('useComponentError', `Error in ${componentName}`, error);
  }, [componentName]);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, resetError };
};

// HOC لتحويل أي component إلى error boundary
export const withComponentErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string,
  fallback?: ReactNode
) => {
  return React.forwardRef<any, P>((props, ref) => (
    <ComponentErrorBoundary componentName={componentName} fallback={fallback}>
      <Component {...props} ref={ref} />
    </ComponentErrorBoundary>
  ));
}; 
