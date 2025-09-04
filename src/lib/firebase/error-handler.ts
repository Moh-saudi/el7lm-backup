// Firebase Error Handler
// معالجة محسنة لأخطاء Firebase

export interface FirebaseErrorInfo {
  code: string;
  message: string;
  isDevelopment: boolean;
}

export function handleFirebaseError(error: any): FirebaseErrorInfo {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // تحليل نوع الخطأ
  if (error?.code === 'auth/invalid-api-key') {
    return {
      code: 'INVALID_API_KEY',
      message: isDevelopment ? '⚠️ Firebase API key is invalid (development mode)' : 'Firebase configuration error',
      isDevelopment
    };
  }
  
  if (error?.code === 'auth/network-request-failed') {
    return {
      code: 'NETWORK_ERROR',
      message: isDevelopment ? '⚠️ Network error (development mode)' : 'Network connection failed',
      isDevelopment
    };
  }
  
  if (error?.message?.includes('API key not valid')) {
    return {
      code: 'API_KEY_INVALID',
      message: isDevelopment ? '⚠️ API key validation failed (development mode)' : 'Authentication failed',
      isDevelopment
    };
  }
  
  if (error?.message?.includes('Installations: Create Installation request failed')) {
    return {
      code: 'INSTALLATION_FAILED',
      message: isDevelopment ? '⚠️ Firebase installation failed (development mode)' : 'Service initialization failed',
      isDevelopment
    };
  }
  
  if (error?.message?.includes('Failed to fetch this Firebase app')) {
    return {
      code: 'CONFIG_FETCH_FAILED',
      message: isDevelopment ? '⚠️ Firebase config fetch failed (development mode)' : 'Configuration error',
      isDevelopment
    };
  }
  
  // خطأ عام
  return {
    code: 'UNKNOWN_ERROR',
    message: isDevelopment ? '⚠️ Firebase error (development mode)' : 'An error occurred',
    isDevelopment
  };
}

export function logFirebaseError(error: any, context?: string) {
  const errorInfo = handleFirebaseError(error);
  
  if (errorInfo.isDevelopment) {
    // في وضع التطوير، نعرض رسالة مبسطة
    console.warn(`${errorInfo.message}${context ? ` - ${context}` : ''}`);
  } else {
    // في الإنتاج، نعرض التفاصيل الكاملة
    console.error('Firebase Error:', {
      code: errorInfo.code,
      message: errorInfo.message,
      originalError: error,
      context
    });
  }
}

export function shouldSuppressFirebaseError(error: any): boolean {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!isDevelopment) {
    return false; // لا نخفي الأخطاء في الإنتاج
  }
  
  const errorMessage = error?.message || '';
  const errorCode = error?.code || '';
  
  // قائمة بالأخطاء التي يجب إخفاؤها في التطوير
  const suppressibleErrors = [
    'API key not valid',
    'Installations: Create Installation request failed',
    'Failed to fetch this Firebase app',
    'Dynamic config fetch failed',
    'auth/invalid-api-key',
    'auth/network-request-failed'
  ];
  
  return suppressibleErrors.some(suppressibleError => 
    errorMessage.includes(suppressibleError) || 
    errorCode.includes(suppressibleError)
  );
}

export function createFirebaseErrorBoundary() {
  return {
    onError: (error: any, context?: string) => {
      if (shouldSuppressFirebaseError(error)) {
        logFirebaseError(error, context);
        return; // لا نرمي الخطأ مرة أخرى
      }
      
      // للأخطاء المهمة، نرميها مرة أخرى
      throw error;
    }
  };
} 
