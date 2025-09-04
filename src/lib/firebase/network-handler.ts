// معالج أخطاء الشبكة المتقدمة
export class FirebaseNetworkHandler {
  private static connectionRetries = 0;
  private static maxRetries = 5;
  private static retryDelay = 1000;

  // معالجة أخطاء الشبكة المتقدمة
  static handleNetworkError(error: any, context: string = 'Network operation') {
    console.error(`🌐 [${context}] Network Error:`, error);

    // معالجة أخطاء QUIC Protocol
    if (error.message?.includes('ERR_QUIC_PROTOCOL_ERROR') || 
        error.message?.includes('quic')) {
      console.warn('🔄 QUIC Protocol Error detected - switching to TCP fallback');
      return {
        type: 'quic_error',
        message: 'مشكلة في بروتوكول الاتصال، جاري إعادة المحاولة',
        code: 'QUIC_ERROR',
        shouldRetry: true,
        fallback: 'tcp'
      };
    }

    // معالجة أخطاء DNS
    if (error.message?.includes('ERR_NAME_NOT_RESOLVED') || 
        error.message?.includes('dns')) {
      console.warn('🔍 DNS Resolution Error - checking network connectivity');
      return {
        type: 'dns_error',
        message: 'مشكلة في حل أسماء النطاقات، تحقق من اتصالك بالإنترنت',
        code: 'DNS_ERROR',
        shouldRetry: true,
        fallback: 'offline'
      };
    }

    // معالجة أخطاء CORS
    if (error.message?.includes('CORS') || 
        error.message?.includes('cross-origin')) {
      console.warn('🚫 CORS Error detected');
      return {
        type: 'cors_error',
        message: 'مشكلة في إعدادات الأمان',
        code: 'CORS_ERROR',
        shouldRetry: false
      };
    }

    // معالجة أخطاء Timeout
    if (error.message?.includes('timeout') || 
        error.message?.includes('deadline')) {
      console.warn('⏰ Timeout Error detected');
      return {
        type: 'timeout_error',
        message: 'انتهت مهلة الاتصال، جاري إعادة المحاولة',
        code: 'TIMEOUT_ERROR',
        shouldRetry: true
      };
    }

    // معالجة أخطاء Connection Refused
    if (error.message?.includes('ECONNREFUSED') || 
        error.message?.includes('connection refused')) {
      console.warn('🚫 Connection Refused Error');
      return {
        type: 'connection_refused',
        message: 'تم رفض الاتصال بالخادم',
        code: 'CONNECTION_REFUSED',
        shouldRetry: true
      };
    }

    // معالجة أخطاء Network Unavailable
    if (error.message?.includes('ERR_NETWORK') || 
        error.message?.includes('network unavailable')) {
      console.warn('📡 Network Unavailable Error');
      return {
        type: 'network_unavailable',
        message: 'الشبكة غير متاحة حالياً',
        code: 'NETWORK_UNAVAILABLE',
        shouldRetry: true,
        fallback: 'offline'
      };
    }

    // معالجة أخطاء عامة
    return {
      type: 'general_network_error',
      message: 'مشكلة في الاتصال بالشبكة',
      code: 'GENERAL_NETWORK_ERROR',
      shouldRetry: true
    };
  }

  // دالة لإعادة المحاولة مع تأخير متزايد
  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.maxRetries,
    baseDelay: number = this.retryDelay
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        const errorInfo = this.handleNetworkError(error);
        
        console.warn(`⚠️ Attempt ${attempt}/${maxRetries} failed:`, errorInfo.message);

        // إذا كان الخطأ لا يحتاج إعادة محاولة
        if (!errorInfo.shouldRetry) {
          throw error;
        }

        // إذا كانت المحاولة الأخيرة
        if (attempt === maxRetries) {
          console.error('❌ Max retries reached');
          throw error;
        }

        // حساب التأخير مع التزايد
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  // دالة لفحص حالة الشبكة
  static async checkNetworkStatus(): Promise<{
    isOnline: boolean;
    latency: number;
    connectionType: string;
  }> {
    const startTime = Date.now();
    
    try {
      // فحص الاتصال بـ Google DNS
      const response = await fetch('https://8.8.8.8/resolve?name=google.com', {
        method: 'GET',
        mode: 'no-cors'
      });
      
      const latency = Date.now() - startTime;
      
      return {
        isOnline: true,
        latency,
        connectionType: 'online'
      };
    } catch (error) {
      return {
        isOnline: false,
        latency: 0,
        connectionType: 'offline'
      };
    }
  }

  // دالة لتفعيل وضع عدم الاتصال عند الحاجة
  static async enableOfflineMode() {
    try {
      // يمكن إضافة منطق لتفعيل وضع عدم الاتصال هنا
      console.log('📱 Enabling offline mode');
      return true;
    } catch (error) {
      console.error('❌ Failed to enable offline mode:', error);
      return false;
    }
  }

  // دالة لإعادة تفعيل الاتصال
  static async enableOnlineMode() {
    try {
      // يمكن إضافة منطق لإعادة تفعيل الاتصال هنا
      console.log('🌐 Enabling online mode');
      return true;
    } catch (error) {
      console.error('❌ Failed to enable online mode:', error);
      return false;
    }
  }

  // دالة لمراقبة حالة الشبكة
  static startNetworkMonitoring() {
    if (typeof window !== 'undefined') {
      // مراقبة تغييرات حالة الشبكة
      window.addEventListener('online', () => {
        console.log('🌐 Network is online');
        this.enableOnlineMode();
      });

      window.addEventListener('offline', () => {
        console.log('📱 Network is offline');
        this.enableOfflineMode();
      });

      // مراقبة تغييرات نوع الاتصال
      if ('connection' in navigator) {
        (navigator as any).connection?.addEventListener('change', () => {
          const connection = (navigator as any).connection;
          console.log('📡 Connection type changed:', connection?.effectiveType);
        });
      }
    }
  }

  // دالة لتنظيف الموارد
  static cleanup() {
    this.connectionRetries = 0;
    console.log('🧹 Network handler cleanup completed');
  }
}

// تهيئة مراقبة الشبكة
if (typeof window !== 'undefined') {
  FirebaseNetworkHandler.startNetworkMonitoring();
}

export default FirebaseNetworkHandler; 
