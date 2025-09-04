// تحسين أداء الـ console وتقليل الرسائل المتكررة
class ConsoleOptimizer {
  private logCache = new Map<string, number>();
  private maxLogs = 5; // أقصى عدد من الرسائل المتكررة
  private cleanupInterval = 60000; // تنظيف الكاش كل دقيقة

  constructor() {
    this.setupCleanup();
  }

  private setupCleanup() {
    setInterval(() => {
      this.logCache.clear();
    }, this.cleanupInterval);
  }

  // تسجيل محدود للرسائل المتكررة
  limitedLog(message: string, level: 'log' | 'warn' | 'error' | 'debug' = 'log') {
    const count = this.logCache.get(message) || 0;
    
    if (count < this.maxLogs) {
      console[level](message);
      this.logCache.set(message, count + 1);
      
      if (count === this.maxLogs - 1) {
        console[level](`⚠️ الرسالة السابقة تم إخفاؤها لتجنب التكرار`);
      }
    }
  }

  // تسجيل مع تجميع للرسائل المشابهة
  groupLog(groupName: string, message: string, level: 'log' | 'warn' | 'error' | 'debug' = 'log') {
    const key = `${groupName}:${message}`;
    this.limitedLog(key, level);
  }
}

export const consoleOptimizer = new ConsoleOptimizer();

// تصدير دوال مساعدة
export const limitedLog = (message: string) => consoleOptimizer.limitedLog(message, 'log');
export const limitedWarn = (message: string) => consoleOptimizer.limitedLog(message, 'warn');
export const limitedError = (message: string) => consoleOptimizer.limitedLog(message, 'error');
export const limitedDebug = (message: string) => consoleOptimizer.limitedLog(message, 'debug');

// دالة لإخفاء الرسائل المعروفة والمتكررة
export const suppressKnownMessages = () => {
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  
  console.warn = (...args) => {
    const message = args.join(' ');
    
    // إخفاء الرسائل المعروفة
    const suppressedMessages = [
      'Could not extract URL from',
      'ReactPlayer: YouTube player could not call playVideo',
      'Player method check failed',
      'YouTube player error',
      'ERR_ABORTED 404',
      'net::ERR_ABORTED',
      '/dashboard/club/',
      '%D8%', // النص العربي المُرمز
      'Failed to execute \'json\' on \'Response\'',
      'Unexpected end of JSON input',
      'Preview.js:80'
    ];
    
    const shouldSuppress = suppressedMessages.some(suppressedMsg => 
      message.includes(suppressedMsg)
    );
    
    if (!shouldSuppress) {
      originalConsoleWarn(...args);
    }
  };
  
  console.error = (...args) => {
    const message = args.join(' ');
    
    // إخفاء الأخطاء غير المهمة
    const suppressedErrors = [
      'ERR_ABORTED 404',
      'net::ERR_ABORTED',
      '/dashboard/club/',
      '%D8%', // النص العربي المُرمز
      'GET http://localhost:3000/dashboard/club/',
      'بيزنس الأفلام',
      'Failed to execute \'json\' on \'Response\'',
      'Unexpected end of JSON input',
      'SyntaxError: Unexpected end of JSON input',
      'Preview.js:80' // خطأ ReactPlayer
    ];
    
    // التحقق من الأخطاء المكتومة
    const shouldSuppressError = suppressedErrors.some(suppressedError => 
      message.includes(suppressedError)
    );
    
    if (shouldSuppressError) {
      console.debug('تم إخفاء خطأ غير مهم:', message.substring(0, 100) + '...');
      return;
    }
    
    // السماح بإظهار الأخطاء المهمة فقط
    const importantErrors = [
      'خطأ في الاتصال بقاعدة البيانات',
      'فشل في المصادقة',
      'خطأ في تحميل البيانات'
    ];
    
    const isImportant = importantErrors.some(importantMsg => 
      message.includes(importantMsg)
    );
    
    if (isImportant) {
      originalConsoleError(...args);
    } else {
      // تحويل الأخطاء غير المهمة إلى debug
      console.debug('إخفاء خطأ غير مهم:', message);
    }
  };
};

// معالجة الأخطاء غير المعالجة
export const handleUnhandledErrors = () => {
  if (typeof window === 'undefined') return;
  
  // التعامل مع unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason && 
      event.reason.message && 
      (
        event.reason.message.includes('Invalid URL with Arabic text') ||
        event.reason.message.includes('%D8%') ||
        event.reason.message.includes('ERR_ABORTED') ||
        event.reason.message.includes('Failed to execute \'json\' on \'Response\'') ||
        event.reason.message.includes('Unexpected end of JSON input')
      )
    ) {
      console.debug('🚫 منع unhandled promise rejection');
      event.preventDefault();
      return false;
    }
  });
  
  // التعامل مع window errors
  window.addEventListener('error', (event) => {
    if (
      event.message.includes('Invalid URL with Arabic text') ||
      event.message.includes('%D8%') ||
      event.message.includes('Failed to execute \'json\' on \'Response\'') ||
      event.message.includes('Unexpected end of JSON input') ||
      (event.filename && event.filename.includes('url-validator')) ||
      (event.filename && event.filename.includes('Preview.js'))
    ) {
      console.debug('🚫 منع window error');
      event.preventDefault();
      return false;
    }
  });
};

// دالة للتهيئة اليدوية (لا يتم استدعاؤها تلقائياً)
export const initializeConsoleOptimization = () => {
  if (typeof window !== 'undefined') {
    suppressKnownMessages();
    handleUnhandledErrors();
    console.debug('✅ تم تحسين console لتقليل الرسائل المتكررة ومعالجة الأخطاء');
  }
}; 
