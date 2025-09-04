import { FirebaseError } from 'firebase/app';

export class FirebaseConnectionHandler {
  private static retryAttempts = 0;
  private static maxRetries = 3;
  private static retryDelay = 1000; // 1 ثانية

  static async handleFirebaseError(error: FirebaseError, operation: () => Promise<any>): Promise<any> {
    console.log('Firebase Error:', error.code, error.message);

    // التعامل مع أخطاء الاتصال
    if (this.isConnectionError(error)) {
      return this.handleConnectionError(error, operation);
    }

    // رفع الخطأ إذا لم يكن خطأ اتصال
    throw error;
  }

  private static isConnectionError(error: FirebaseError): boolean {
    const connectionErrors = [
      'unavailable',
      'failed-precondition',
      'deadline-exceeded',
      'cancelled',
      'unknown'
    ];

    return connectionErrors.includes(error.code) || 
           error.message.includes('offline') ||
           error.message.includes('network');
  }

  private static async handleConnectionError(error: FirebaseError, operation: () => Promise<any>): Promise<any> {
    if (this.retryAttempts >= this.maxRetries) {
      console.error('تم تجاوز محاولات إعادة المحاولة:', error.message);
      this.retryAttempts = 0;
      throw new Error('فشل الاتصال مع قاعدة البيانات. يرجى التحقق من اتصال الإنترنت.');
    }

    console.log(`إعادة المحاولة ${this.retryAttempts + 1} من ${this.maxRetries}...`);
    this.retryAttempts++;

    // انتظار قبل إعادة المحاولة
    await new Promise(resolve => setTimeout(resolve, this.retryDelay * this.retryAttempts));

    try {
      const result = await operation();
      this.retryAttempts = 0; // إعادة تعيين العداد عند النجاح
      return result;
    } catch (retryError) {
      if (retryError instanceof FirebaseError) {
        return this.handleFirebaseError(retryError, operation);
      }
      throw retryError;
    }
  }

  static resetRetryCounter() {
    this.retryAttempts = 0;
  }
}

// دالة مساعدة لتنفيذ العمليات مع معالجة الأخطاء
export async function executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof FirebaseError) {
      return FirebaseConnectionHandler.handleFirebaseError(error, operation);
    }
    throw error;
  }
} 
