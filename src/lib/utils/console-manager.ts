/**
 * نظام إدارة رسائل الكونسول
 * يتيح التحكم في عرض رسائل التشخيص بناءً على البيئة والإعدادات
 */

interface ConsoleConfig {
  enableInDevelopment: boolean;
  enableInProduction: boolean;
  enableFirebase: boolean;
  enableAuth: boolean;
  enableDebug: boolean;
  enableDataFetch: boolean;
  enableMedia: boolean;
  enablePayment: boolean;
  enableSecurity: boolean;
}

interface LogData {
  [key: string]: unknown;
}

// مدير موحد للـ console - لتجنب التكرار
class ConsoleManager {
  private static instance: ConsoleManager;
  private logCache = new Map<string, number>();
  private maxLogs = 3; // أقصى عدد من الرسائل المتكررة
  private cleanupInterval = 300000; // تنظيف الكاش كل 5 دقائق
  private enabledCategories = new Set<string>();

  private constructor() {
    this.setupCleanup();
    this.setupGlobalConsole();
  }

  static getInstance(): ConsoleManager {
    if (!ConsoleManager.instance) {
      ConsoleManager.instance = new ConsoleManager();
    }
    return ConsoleManager.instance;
  }

  private setupCleanup() {
    setInterval(() => {
      this.logCache.clear();
    }, this.cleanupInterval);
  }

  private setupGlobalConsole() {
    if (typeof window !== 'undefined') {
      // حفظ الـ console الأصلي
      const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        debug: console.debug
      };

      // استبدال console.log
      console.log = (...args: any[]) => {
        this.processLog('log', args, originalConsole.log);
      };

      // استبدال console.warn
      console.warn = (...args: any[]) => {
        this.processLog('warn', args, originalConsole.warn);
      };

      // استبدال console.error
      console.error = (...args: any[]) => {
        this.processLog('error', args, originalConsole.error);
      };

      // استبدال console.debug
      console.debug = (...args: any[]) => {
        this.processLog('debug', args, originalConsole.debug);
      };
    }
  }

  private processLog(level: 'log' | 'warn' | 'error' | 'debug', args: any[], originalMethod: Function) {
    const message = args.join(' ');
    const category = this.getCategory(message);
    
    // التحقق من الفئة المفعلة
    if (this.enabledCategories.size > 0 && !this.enabledCategories.has(category)) {
      return;
    }

    // التحقق من التكرار
    const count = this.logCache.get(message) || 0;
    
    if (count < this.maxLogs) {
      originalMethod(...args);
      this.logCache.set(message, count + 1);
      
      if (count === this.maxLogs - 1) {
        originalMethod(`⚠️ الرسالة السابقة تم إخفاؤها لتجنب التكرار (${this.maxLogs} مرات)`);
      }
    }
  }

  private getCategory(message: string): string {
    if (message.includes('Firebase')) return 'firebase';
    if (message.includes('Auth')) return 'auth';
    if (message.includes('Network')) return 'network';
    if (message.includes('Error')) return 'error';
    if (message.includes('Loading')) return 'loading';
    if (message.includes('Success')) return 'success';
    if (message.includes('Warning')) return 'warning';
    return 'general';
  }

  // تفعيل/إلغاء تفعيل فئات معينة
  enableCategory(category: string) {
    this.enabledCategories.add(category);
  }

  disableCategory(category: string) {
    this.enabledCategories.delete(category);
  }

  // تفعيل جميع الفئات
  enableAllCategories() {
    this.enabledCategories.clear();
  }

  // إلغاء تفعيل جميع الفئات
  disableAllCategories() {
    this.enabledCategories.clear();
    this.enabledCategories.add('none');
  }

  // تسجيل محدود
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

  // تسجيل مع تجميع
  groupLog(groupName: string, message: string, level: 'log' | 'warn' | 'error' | 'debug' = 'log') {
    const key = `${groupName}:${message}`;
    this.limitedLog(key, level);
  }

  // تنظيف الكاش
  clearCache() {
    this.logCache.clear();
  }

  // الحصول على إحصائيات
  getStats() {
    return {
      totalLogs: this.logCache.size,
      enabledCategories: Array.from(this.enabledCategories),
      maxLogs: this.maxLogs
    };
  }
}

// تصدير المثيل الوحيد
export const consoleManager = ConsoleManager.getInstance();

// دوال مساعدة للاستخدام المباشر
export const limitedLog = (message: string, level: 'log' | 'warn' | 'error' | 'debug' = 'log') => {
  consoleManager.limitedLog(message, level);
};

export const groupLog = (groupName: string, message: string, level: 'log' | 'warn' | 'error' | 'debug' = 'log') => {
  consoleManager.groupLog(groupName, message, level);
};

export const enableCategory = (category: string) => {
  consoleManager.enableCategory(category);
};

export const disableCategory = (category: string) => {
  consoleManager.disableCategory(category);
};

export default consoleManager;

// تفعيل الإلغاء عند التحميل
if (typeof window !== 'undefined') {
  // إلغاء فوري لجميع الرسائل
  consoleManager.disableAllCategories(); // تفعيل جميع الفئات لتجنب التكرار
  
  // إلغاء رسائل أخرى محتملة
  window.addEventListener('error', (e) => {
    e.preventDefault();
    return false;
  });

  window.addEventListener('unhandledrejection', (e) => {
    e.preventDefault();
    return false;
  });
}

// مدير الكونسول المحسن
export const debugConsole = {
  playerReport: {
    start: (playerId: string, viewMode: boolean) => {
      console.log('📊 تشخيص صفحة تقارير اللاعب');
      console.log('معلومات الطلب:', {
        playerId,
        mode: viewMode ? 'عرض لاعب آخر' : 'عرض الملف الشخصي',
        timestamp: new Date().toISOString()
      });
    },

    playerData: (data: any) => {
      console.log('👤 بيانات اللاعب');
      console.log('المعلومات الأساسية:', {
        name: data?.full_name,
        birthDate: data?.birth_date,
        nationality: data?.nationality,
        position: data?.primary_position
      });
      console.log('المهارات:', {
        technical: Object.keys(data?.technical_skills || {}).length,
        physical: Object.keys(data?.physical_skills || {}).length,
        social: Object.keys(data?.social_skills || {}).length
      });
      console.log('الوسائط:', {
        hasProfileImage: !!data?.profile_image,
        additionalImages: (data?.additional_images || []).length,
        videos: (data?.videos || []).length,
        documents: (data?.documents || []).length
      });
    },

    images: (data: any) => {
      console.log('🖼️ معالجة الصور');
      console.log('الصورة الشخصية:', {
        url: data?.profile_image_url || data?.profile_image?.url,
        type: typeof data?.profile_image
      });
      console.log('الصور الإضافية:', {
        count: (data?.additional_images || []).length,
        urls: data?.additional_images?.map((img: any) => img.url)
      });
    },

    organization: (data: any) => {
      console.log('🏢 معلومات المنظمة');
      console.log('المعرفات:', {
        clubId: data?.club_id,
        academyId: data?.academy_id,
        trainerId: data?.trainer_id,
        agentId: data?.agent_id
      });
      console.log('معلومات إضافية:', {
        type: data?.organizationType,
        name: data?.organizationName,
        hasLogo: !!data?.organizationLogo
      });
    },

    error: (error: any, context: string) => {
      console.log('❌ خطأ في التقرير');
      console.error(`خطأ في ${context}:`, error);
      console.trace('تتبع الخطأ:');
    },

    end: () => {
      console.log('✅ انتهى تشخيص صفحة تقارير اللاعب');
    }
  }
}; 
