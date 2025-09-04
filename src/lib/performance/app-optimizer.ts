// محسن أداء التطبيق الشامل
export class AppPerformanceOptimizer {
  private static isInitialized = false;
  private static performanceMetrics: Map<string, number> = new Map();

  // تهيئة محسن الأداء
  static initialize() {
    if (this.isInitialized) return;
    
    console.log('🚀 Initializing App Performance Optimizer');
    
    // تحسين تحميل الصور
    this.optimizeImageLoading();
    
    // تحسين التخزين المؤقت
    this.optimizeCaching();
    
    // تحسين استهلاك الذاكرة
    this.optimizeMemoryUsage();
    
    // تحسين أداء الشبكة
    this.optimizeNetworkPerformance();
    
    this.isInitialized = true;
    console.log('✅ App Performance Optimizer initialized');
  }

  // تحسين تحميل الصور
  private static optimizeImageLoading() {
    if (typeof window === 'undefined') return;

    // إضافة lazy loading للصور
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));

    // تحسين أحجام الصور
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach(entry => {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.sizes) {
          img.sizes = img.dataset.sizes;
        }
      });
    });

    document.querySelectorAll('img').forEach(img => resizeObserver.observe(img));
  }

  // تحسين التخزين المؤقت
  private static optimizeCaching() {
    if (typeof window === 'undefined') return;

    // تنظيف التخزين المؤقت القديم
    const cleanupCache = () => {
      const cacheKeys = Object.keys(localStorage);
      const now = Date.now();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // أسبوع واحد

      cacheKeys.forEach(key => {
        if (key.startsWith('cache_')) {
          try {
            const item = JSON.parse(localStorage.getItem(key) || '{}');
            if (now - item.timestamp > maxAge) {
              localStorage.removeItem(key);
            }
          } catch (error) {
            localStorage.removeItem(key);
          }
        }
      });
    };

    // تنظيف التخزين المؤقت كل ساعة
    setInterval(cleanupCache, 60 * 60 * 1000);
    cleanupCache(); // تنظيف فوري
  }

  // تحسين استهلاك الذاكرة
  private static optimizeMemoryUsage() {
    if (typeof window === 'undefined') return;

    // مراقبة استهلاك الذاكرة
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      
      setInterval(() => {
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        const totalMB = memory.totalJSHeapSize / 1024 / 1024;
        
        if (usedMB > totalMB * 0.8) {
          console.warn('⚠️ High memory usage detected:', usedMB.toFixed(2), 'MB');
          this.cleanupMemory();
        }
      }, 30000); // كل 30 ثانية
    }

    // تنظيف الذاكرة
    this.cleanupMemory();
  }

  // تنظيف الذاكرة
  private static cleanupMemory() {
    // إزالة المراقبين غير المستخدمين
    if (typeof window !== 'undefined') {
      // تنظيف event listeners
      const cleanupEventListeners = () => {
        // يمكن إضافة منطق لتنظيف event listeners هنا
      };

      // تنظيف intervals و timeouts
      const cleanupTimers = () => {
        // يمكن إضافة منطق لتنظيف timers هنا
      };

      cleanupEventListeners();
      cleanupTimers();
    }
  }

  // تحسين أداء الشبكة
  private static optimizeNetworkPerformance() {
    if (typeof window === 'undefined') return;

    // تحسين طلبات الشبكة
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      const startTime = performance.now();
      
      try {
        const response = await originalFetch(input, init);
        const endTime = performance.now();
        
        // تسجيل وقت الاستجابة
        this.recordMetric('fetch_time', endTime - startTime);
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        this.recordMetric('fetch_error_time', endTime - startTime);
        throw error;
      }
    };

    // تحسين طلبات XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      this._startTime = performance.now();
      return originalXHROpen.call(this, method, url, async, user, password);
    };

    const originalXHRSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(data) {
      this.addEventListener('loadend', () => {
        const endTime = performance.now();
        const duration = endTime - this._startTime;
        AppPerformanceOptimizer.recordMetric('xhr_time', duration);
      });
      
      return originalXHRSend.call(this, data);
    };
  }

  // تسجيل مقاييس الأداء
  static recordMetric(name: string, value: number) {
    this.performanceMetrics.set(name, value);
    
    // إرسال المقاييس إلى خدمة المراقبة إذا كانت متاحة
    if (process.env.NODE_ENV === 'production') {
      // يمكن إرسال المقاييس إلى خدمة مراقبة الأداء هنا
    }
  }

  // الحصول على مقاييس الأداء
  static getMetrics() {
    return Object.fromEntries(this.performanceMetrics);
  }

  // تحسين تحميل المكونات
  static optimizeComponentLoading(componentName: string) {
    const startTime = performance.now();
    
    return {
      end: () => {
        const endTime = performance.now();
        this.recordMetric(`${componentName}_load_time`, endTime - startTime);
      }
    };
  }

  // تحسين عمليات قاعدة البيانات
  static optimizeDatabaseOperations(operation: string) {
    const startTime = performance.now();
    
    return {
      end: () => {
        const endTime = performance.now();
        this.recordMetric(`db_${operation}_time`, endTime - startTime);
      }
    };
  }

  // تحسين عمليات التخزين
  static optimizeStorageOperations(operation: string) {
    const startTime = performance.now();
    
    return {
      end: () => {
        const endTime = performance.now();
        this.recordMetric(`storage_${operation}_time`, endTime - startTime);
      }
    };
  }

  // تنظيف الموارد
  static cleanup() {
    this.performanceMetrics.clear();
    this.cleanupMemory();
    console.log('🧹 App Performance Optimizer cleanup completed');
  }

  // الحصول على تقرير الأداء
  static getPerformanceReport() {
    const metrics = this.getMetrics();
    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      summary: {
        averageFetchTime: this.calculateAverage(Object.values(metrics).filter(v => v > 0)),
        totalOperations: Object.keys(metrics).length,
        memoryUsage: typeof performance !== 'undefined' && 'memory' in performance 
          ? (performance as any).memory.usedJSHeapSize / 1024 / 1024 
          : 0
      }
    };

    return report;
  }

  // حساب المتوسط
  private static calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }
}

// تهيئة محسن الأداء
if (typeof window !== 'undefined') {
  AppPerformanceOptimizer.initialize();
}

export default AppPerformanceOptimizer; 
