/**
 * نظام إدارة الكونسول للمطورين
 * يمكن تفعيله يدوياً عند الحاجة للتشخيص
 */

declare global {
  interface Window {
    enableDevConsole: () => void;
    disableDevConsole: () => void;
    toggleConsole: (category?: string) => void;
    restoreConsole: () => void;
    devHelp?: () => void;
  }
}

interface ConsoleMethods {
  log: typeof console.log;
  warn: typeof console.warn;
  error: typeof console.error;
  info: typeof console.info;
  debug: typeof console.debug;
  group: typeof console.group;
  groupEnd: typeof console.groupEnd;
  table: typeof console.table;
  trace: typeof console.trace;
  time: typeof console.time;
  timeEnd: typeof console.timeEnd;
}

class DevConsole {
  private originalConsole: ConsoleMethods;
  private isEnabled = false;

  constructor() {
    this.saveOriginalConsole();
    this.setupGlobalMethods();
  }

  private saveOriginalConsole(): void {
    this.originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug,
      group: console.group,
      groupEnd: console.groupEnd,
      table: console.table,
      trace: console.trace,
      time: console.time,
      timeEnd: console.timeEnd
    };
  }

  public enable(): void {
    console.log = this.originalConsole.log;
    console.warn = this.originalConsole.warn;
    console.error = this.originalConsole.error;
    console.info = this.originalConsole.info;
    console.debug = this.originalConsole.debug;
    console.group = this.originalConsole.group;
    console.groupEnd = this.originalConsole.groupEnd;
    console.table = this.originalConsole.table;
    console.trace = this.originalConsole.trace;
    console.time = this.originalConsole.time;
    console.timeEnd = this.originalConsole.timeEnd;
    
    this.isEnabled = true;
    console.log('🔧 Dev Console: تم تفعيل الكونسول للتطوير');
    console.log('📘 للمساعدة: اكتب toggleConsole() للتحكم في الفئات');
  }

  public disable(): void {
    const originalError = console.error;
    
    console.log = () => {};
    console.warn = () => {};
    console.info = () => {};
    console.debug = () => {};
    console.group = () => {};
    console.groupEnd = () => {};
    console.table = () => {};
    console.trace = () => {};
    console.time = () => {};
    console.timeEnd = () => {};
    
    // السماح بالأخطاء الحرجة فقط
    console.error = (...args: unknown[]) => {
      const message = args.join(' ').toLowerCase();
      if (message.includes('critical') || message.includes('fatal')) {
        originalError.apply(console, args);
      }
    };
    
    this.isEnabled = false;
  }

  public toggleCategory(category?: string): void {
    if (!this.isEnabled) {
      this.enable();
      return;
    }

    console.log(`🎛️ Console Categories Available:`);
    console.log(`- firebase: Firebase related logs`);
    console.log(`- auth: Authentication logs`);
    console.log(`- data: Data fetching logs`);
    console.log(`- media: Media/Image logs`);
    console.log(`- all: Enable all categories`);
    console.log(`- none: Disable all categories`);
    console.log(`\nUsage: toggleConsole('firebase')`);
  }

  private setupGlobalMethods(): void {
    if (typeof window !== 'undefined') {
      window.enableDevConsole = () => this.enable();
      window.disableDevConsole = () => this.disable();
      window.toggleConsole = (category?: string) => this.toggleCategory(category);
      window.restoreConsole = () => this.enable();
    }
  }

  public showHelp(): void {
    if (!this.isEnabled) {
      this.enable();
    }
    
    console.log(`
🔧 Dev Console Commands:
========================

enableDevConsole()  - تفعيل جميع رسائل الكونسول
disableDevConsole() - إلغاء جميع رسائل الكونسول  
toggleConsole()     - التبديل بين التفعيل والإلغاء
restoreConsole()    - استعادة الكونسول الأصلي

💡 Tips:
- تم إلغاء جميع رسائل التشخيص افتراضياً
- استخدم enableDevConsole() عند الحاجة للتشخيص
- للعودة للوضع الصامت: disableDevConsole()
    `);
  }
}

// إنشاء المثيل
const devConsole = new DevConsole();

// تصدير للاستخدام
export { devConsole };

// إضافة دالة مساعدة global
if (typeof window !== 'undefined') {
  window.devHelp = () => devConsole.showHelp();
} 
