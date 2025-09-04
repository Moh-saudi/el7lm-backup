// Font Optimizer for El7lm Platform
class FontOptimizer {
  constructor() {
    this.fontsLoaded = false;
    this.fallbackApplied = false;
    this.loadedFonts = new Set();
    this.init();
  }

  init() {
    // تحميل الخطوط الأساسية
    this.loadCriticalFonts();
    
    // مراقبة حالة التحميل
    this.monitorFontLoading();
    
    // إعداد البدائل
    this.setupFallbacks();
  }

  loadCriticalFonts() {
    const criticalFonts = [
      {
        url: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;800&display=swap',
        family: 'Cairo',
        weights: [400, 600, 800]
      },
      {
        url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap',
        family: 'Inter',
        weights: [400, 600]
      }
    ];

    criticalFonts.forEach(font => {
      this.loadFont(font);
    });
  }

  loadFont(fontConfig) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = fontConfig.url;
    link.as = 'style';
    link.crossOrigin = 'anonymous';
    
    // معالج النجاح
    link.onload = () => {
      link.rel = 'stylesheet';
      console.log(`Font loaded successfully: ${fontConfig.family}`);
      this.loadedFonts.add(fontConfig.family);
      this.checkAllFontsLoaded();
    };
    
    // معالج الخطأ
    link.onerror = () => {
      console.warn(`Failed to load font: ${fontConfig.family}`);
      this.applyFallback(fontConfig.family);
    };
    
    document.head.appendChild(link);
  }

  checkAllFontsLoaded() {
    // فحص إذا كانت جميع الخطوط محملة باستخدام طريقة آمنة
    const expectedFonts = ['Cairo', 'Inter'];
    const allLoaded = expectedFonts.every(font => this.loadedFonts.has(font));
    
    if (allLoaded && !this.fontsLoaded) {
      this.fontsLoaded = true;
      this.onFontsLoaded();
    }
  }

  onFontsLoaded() {
    // تطبيق الخطوط عند اكتمال التحميل
    if (typeof document !== 'undefined') {
      document.body.classList.add('fonts-loaded');
      
      // إزالة مؤشر التحميل إذا كان موجوداً
      const loadingIndicator = document.querySelector('.font-loading-indicator');
      if (loadingIndicator) {
        loadingIndicator.remove();
      }
    }
  }

  applyFallback(fontFamily) {
    if (this.fallbackApplied) return;
    
    this.fallbackApplied = true;
    
    const fallbackStyles = `
      body {
        font-family: '${fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
        'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
        'Helvetica Neue', sans-serif !important;
      }
      
      * {
        font-family: '${fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
        'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
        'Helvetica Neue', sans-serif !important;
      }
    `;
    
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = fallbackStyles;
      document.head.appendChild(style);
    }
    
    console.log(`Fallback fonts applied for: ${fontFamily}`);
  }

  monitorFontLoading() {
    // مراقبة تحميل الخطوط
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => {
        console.log('All fonts loaded successfully');
        this.fontsLoaded = true;
        this.onFontsLoaded();
      }).catch(() => {
        console.warn('Font loading failed, using fallbacks');
        this.applyFallback('Cairo');
      });
    }
  }

  setupFallbacks() {
    // إعداد خطوط النظام كبديل
    const systemFonts = [
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      'Fira Sans',
      'Droid Sans',
      'Helvetica Neue',
      'sans-serif'
    ];
    
    // إضافة خطوط النظام للـ CSS
    const systemFontsCSS = `
      .font-fallback {
        font-family: ${systemFonts.join(', ')} !important;
      }
    `;
    
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = systemFontsCSS;
      document.head.appendChild(style);
    }
  }

  // API عامة
  isFontLoaded(fontFamily) {
    if (typeof document !== 'undefined' && 'fonts' in document) {
      return document.fonts.check(`12px ${fontFamily}`);
    }
    return false;
  }

  forceReloadFonts() {
    // إعادة تحميل الخطوط
    if (typeof document !== 'undefined') {
      const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
      fontLinks.forEach(link => {
        link.remove();
      });
    }
    
    this.fontsLoaded = false;
    this.fallbackApplied = false;
    this.loadedFonts.clear();
    this.init();
  }
}

// تشغيل محسن الخطوط
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.fontOptimizer = new FontOptimizer();
    });
  } else {
    window.fontOptimizer = new FontOptimizer();
  }
}

// إتاحة عامة
if (typeof window !== 'undefined') {
  window.FontOptimizer = FontOptimizer;
}
