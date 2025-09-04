// Console Performance Optimizer
// يخفي التحذيرات غير المهمة ويحسن أداء وحدة التحكم

export function optimizeConsole() {
  if (typeof window === 'undefined') return;

  // إخفاء تحذيرات الصور المحملة بشكل كسول
  const originalWarn = console.warn;
  console.warn = function(...args) {
    const message = args.join(' ');
    
    // تجاهل تحذيرات الصور المحملة بشكل كسول
    if (message.includes('Images loaded lazily') || 
        message.includes('Load events are deferred')) {
      return;
    }
    
    // تجاهل تحذيرات Geidea إذا كانت في وضع الاختبار
    if (message.includes('Geidea configuration incomplete') && 
        process.env.NODE_ENV === 'development') {
      return;
    }
    
    originalWarn.apply(console, args);
  };

  // إخفاء تحذيرات الخطوط وأخطاء Firebase
  const originalError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    
    // تجاهل أخطاء تحميل الخطوط
    if (message.includes('Refused to load the font') || 
        message.includes('Content Security Policy')) {
      return;
    }
    
    // تجاهل أخطاء Firebase في وضع التطوير
    if (process.env.NODE_ENV === 'development' && (
        message.includes('API key not valid') ||
        message.includes('FirebaseError') ||
        message.includes('Installations: Create Installation request failed') ||
        message.includes('Failed to fetch this Firebase app') ||
        message.includes('Dynamic config fetch failed')
    )) {
      return;
    }
    
    originalError.apply(console, args);
  };

  // تحسين أداء الصور
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    // مراقبة الصور المحملة بشكل كسول
    document.addEventListener('DOMContentLoaded', () => {
      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach(img => imageObserver.observe(img));
    });
  }
}

// تحسين تحميل الخطوط
export function optimizeFontLoading() {
  if (typeof window === 'undefined') return;

  // إضافة معالج للأخطاء للخطوط
  const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
  fontLinks.forEach(link => {
    link.addEventListener('error', () => {
      console.warn('Font loading failed, using fallback');
    });
  });
}

// تحسين تحميل الصور
export function optimizeImageLoading() {
  if (typeof window === 'undefined') return;

  // إضافة معالج للأخطاء للصور
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.addEventListener('error', () => {
      img.style.display = 'none';
      const fallback = document.createElement('div');
      fallback.className = 'image-fallback';
      fallback.textContent = 'فشل في تحميل الصورة';
      fallback.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f3f4f6;
        color: #6b7280;
        font-size: 0.875rem;
        padding: 1rem;
        border-radius: 0.375rem;
      `;
      img.parentNode?.insertBefore(fallback, img);
    });
  });
}

// تهيئة جميع التحسينات
export function initializePerformanceOptimizations() {
  optimizeConsole();
  optimizeFontLoading();
  optimizeImageLoading();
} 
