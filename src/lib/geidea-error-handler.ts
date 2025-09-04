// معالج أخطاء جيديا المحسن
// =============================

export interface GeideaError {
  message: string;
  code: string;
  isRecoverable: boolean;
  category: 'network' | 'authentication' | 'validation' | 'payment' | 'unknown';
}

// تحليل أخطاء جيديا
export function analyzeGeideaError(error: any): GeideaError {
  const errorMessage = error?.message || error?.toString() || 'خطأ غير معروف';
  
  // أخطاء الشبكة
  if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('CORS')) {
    return {
      message: 'مشكلة في الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.',
      code: 'NETWORK_ERROR',
      isRecoverable: true,
      category: 'network'
    };
  }
  
  // أخطاء المصادقة
  if (errorMessage.includes('authentication') || errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
    return {
      message: 'مشكلة في إعدادات المصادقة. يرجى التحقق من مفاتيح جيديا.',
      code: 'AUTH_ERROR',
      isRecoverable: false,
      category: 'authentication'
    };
  }
  
  // أخطاء التحقق من صحة البيانات
  if (errorMessage.includes('validation') || errorMessage.includes('invalid') || errorMessage.includes('110')) {
    return {
      message: 'بيانات الدفع غير صحيحة. يرجى التحقق من المبلغ والعملة.',
      code: 'VALIDATION_ERROR',
      isRecoverable: true,
      category: 'validation'
    };
  }
  
  // أخطاء الدفع
  if (errorMessage.includes('payment') || errorMessage.includes('transaction') || errorMessage.includes('declined')) {
    return {
      message: 'فشلت عملية الدفع. يرجى التحقق من بيانات البطاقة والمحاولة مرة أخرى.',
      code: 'PAYMENT_ERROR',
      isRecoverable: true,
      category: 'payment'
    };
  }
  
  // أخطاء CORS
  if (errorMessage.includes('CORS') || errorMessage.includes('cross-origin')) {
    return {
      message: 'مشكلة في إعدادات الأمان. يرجى المحاولة مرة أخرى.',
      code: 'CORS_ERROR',
      isRecoverable: true,
      category: 'network'
    };
  }
  
  // أخطاء JSON
  if (errorMessage.includes('JSON') || errorMessage.includes('Unexpected token')) {
    return {
      message: 'مشكلة في معالجة البيانات. يرجى المحاولة مرة أخرى.',
      code: 'JSON_ERROR',
      isRecoverable: true,
      category: 'unknown'
    };
  }
  
  // أخطاء عامة
  return {
    message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
    code: 'UNKNOWN_ERROR',
    isRecoverable: true,
    category: 'unknown'
  };
}

// معالجة أخطاء جيديا
export function handleGeideaError(error: any, context: string = 'unknown') {
  const analyzedError = analyzeGeideaError(error);
  
  console.error(`❌ [Geidea Error] ${context}:`, {
    originalError: error,
    analyzedError: analyzedError,
    timestamp: new Date().toISOString(),
    context: context
  });
  
  // تسجيل الخطأ في localStorage للتتبع
  try {
    const errorLog = {
      timestamp: new Date().toISOString(),
      context: context,
      error: analyzedError,
      originalError: error?.message || error?.toString()
    };
    
    const existingLogs = JSON.parse(localStorage.getItem('geidea_error_logs') || '[]');
    existingLogs.push(errorLog);
    
    // الاحتفاظ بآخر 10 أخطاء فقط
    if (existingLogs.length > 10) {
      existingLogs.splice(0, existingLogs.length - 10);
    }
    
    localStorage.setItem('geidea_error_logs', JSON.stringify(existingLogs));
  } catch (logError) {
    console.error('❌ Failed to log Geidea error:', logError);
  }
  
  return analyzedError;
}

// الحصول على سجل الأخطاء
export function getGeideaErrorLogs(): any[] {
  try {
    return JSON.parse(localStorage.getItem('geidea_error_logs') || '[]');
  } catch {
    return [];
  }
}

// مسح سجل الأخطاء
export function clearGeideaErrorLogs(): void {
  try {
    localStorage.removeItem('geidea_error_logs');
  } catch {
    // تجاهل الأخطاء
  }
}

// التحقق من وجود أخطاء حديثة
export function hasRecentGeideaErrors(minutes: number = 5): boolean {
  const logs = getGeideaErrorLogs();
  const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
  
  return logs.some(log => {
    const logTime = new Date(log.timestamp);
    return logTime > cutoffTime;
  });
}

// الحصول على إحصائيات الأخطاء
export function getGeideaErrorStats(): {
  total: number;
  byCategory: Record<string, number>;
  byCode: Record<string, number>;
  recentErrors: number;
} {
  const logs = getGeideaErrorLogs();
  const stats = {
    total: logs.length,
    byCategory: {} as Record<string, number>,
    byCode: {} as Record<string, number>,
    recentErrors: 0
  };
  
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  logs.forEach(log => {
    // إحصائيات الفئات
    const category = log.error.category;
    stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    
    // إحصائيات الأكواد
    const code = log.error.code;
    stats.byCode[code] = (stats.byCode[code] || 0) + 1;
    
    // الأخطاء الحديثة
    const logTime = new Date(log.timestamp);
    if (logTime > oneHourAgo) {
      stats.recentErrors++;
    }
  });
  
  return stats;
} 
