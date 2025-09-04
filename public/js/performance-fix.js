/**
 * 🚀 El7lm - نظام تحسين الأداء الشامل
 * حل مشكلة التحميل البطيء وتحسين تجربة المستخدم
 */

// 🚀 نظام تحسين الأداء الشامل (بدون console logs مزعجة)

// Performance Optimizer for El7lm Platform
class PerformanceOptimizer {
  constructor() {
    this.init();
  }

  init() {
    // تحسين تحميل الخطوط
    this.optimizeFontLoading();
    
    // تحسين تحميل الصور
    this.optimizeImageLoading();
    
    // تحسين الأداء العام
    this.optimizeGeneralPerformance();
    
    // معالجة الأخطاء
    this.handleErrors();
  }

  optimizeFontLoading() {
    // تحميل مسبق للخطوط الأساسية فقط
    const criticalFonts = [
      'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;800&display=swap'
    ];
    
    criticalFonts.forEach(fontUrl => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = fontUrl;
      link.as = 'style';
      link.crossOrigin = 'anonymous';
      link.onload = () => {
        link.rel = 'stylesheet';
        console.log('Critical font loaded:', fontUrl);
      };
      link.onerror = () => {
        console.warn('Failed to load critical font:', fontUrl);
        // استخدام خطوط النظام كبديل
        this.fallbackToSystemFonts();
      };
      document.head.appendChild(link);
    });
  }

  fallbackToSystemFonts() {
    // إضافة خطوط النظام كبديل
    const systemFonts = `
      font-family: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
      'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
      'Helvetica Neue', sans-serif;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      body { ${systemFonts} }
      * { ${systemFonts} }
    `;
    document.head.appendChild(style);
  }

  optimizeImageLoading() {
    // تحسين تحميل الصور
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              observer.unobserve(img);
            }
          }
        });
      });

      // مراقبة جميع الصور
      if (typeof document !== 'undefined') {
        document.querySelectorAll('img[data-src]').forEach(img => {
          imageObserver.observe(img);
        });
      }
    }
  }

  optimizeGeneralPerformance() {
    // تحسين الأداء العام
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // تحسين العناصر غير الحرجة
        this.optimizeNonCriticalElements();
      });
    }
  }

  optimizeNonCriticalElements() {
    // تحسين العناصر غير الحرجة
    if (typeof document !== 'undefined') {
      // تحسين الروابط
      document.querySelectorAll('a[href]').forEach(link => {
        link.addEventListener('mouseenter', () => {
          link.rel = 'prefetch';
        });
      });
    }
  }

  handleErrors() {
    // معالجة الأخطاء العامة
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        // تجاهل أخطاء الخطوط والصور غير الحرجة
        if (event.target && (event.target.tagName === 'LINK' || event.target.tagName === 'IMG')) {
          event.preventDefault();
          return;
        }
      });

      // معالجة أخطاء Promise
      window.addEventListener('unhandledrejection', (event) => {
        console.warn('Unhandled promise rejection:', event.reason);
        event.preventDefault();
      });
    }
  }
}

// تشغيل محسن الأداء
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.performanceOptimizer = new PerformanceOptimizer();
    });
  } else {
    window.performanceOptimizer = new PerformanceOptimizer();
  }
}

// إتاحة عامة
if (typeof window !== 'undefined') {
  window.PerformanceOptimizer = PerformanceOptimizer;
} 
