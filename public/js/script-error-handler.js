// El7lm - Script Error Handler
// معالج شامل لأخطاء السكريبتات مع إعادة المحاولة الذكية

console.log('🛡️ تحميل معالج أخطاء السكريبتات...');

class ScriptErrorHandler {
  constructor() {
    this.failedScripts = new Set();
    this.retryAttempts = new Map();
    this.maxRetries = 2;
    this.init();
  }

  init() {
    this.setupGlobalErrorHandler();
    this.setupScriptErrorHandling();
    this.setupUnhandledRejectionHandler();
    console.log('✅ معالج أخطاء السكريبتات جاهز');
  }

  setupGlobalErrorHandler() {
    // معالج الأخطاء العامة
    window.addEventListener('error', (event) => {
      const error = event.error;
      const filename = event.filename;
      
      // تجاهل أخطاء السكريبتات المفلترة
      if (this.isFilteredError(error?.message || event.message)) {
        return;
      }
      
      // معالجة خاصة لأخطاء تحميل السكريبتات
      if (filename && filename.includes('/js/')) {
        this.handleScriptLoadError(filename, error);
        event.preventDefault(); // منع عرض الخطأ في الكونسول
      }
    });
  }

  setupScriptErrorHandling() {
    // مراقبة إضافة سكريبتات جديدة للصفحة
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.tagName === 'SCRIPT' && node.src) {
            this.setupScriptErrorListener(node);
          }
        });
      });
    });

    observer.observe(document.head, { childList: true });
  }

  setupScriptErrorListener(script) {
    script.addEventListener('error', (event) => {
      const scriptSrc = script.src;
      console.warn(`⚠️ فشل تحميل السكريبت: ${scriptSrc}`);
      
      // محاولة إعادة التحميل إذا لم نحاول من قبل
      if (!this.failedScripts.has(scriptSrc)) {
        this.retryScriptLoad(scriptSrc);
      }
    });
  }

  setupUnhandledRejectionHandler() {
    // معالج Promise rejections غير المعالجة
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      
      // تجاهل أخطاء السكريبتات المفلترة
      if (this.isFilteredError(reason?.message || String(reason))) {
        event.preventDefault(); // منع عرض الخطأ
        return;
      }
      
      console.warn('⚠️ Promise rejection غير معالج:', reason);
    });
  }

  isFilteredError(message) {
    if (!message) return false;
    
    const filteredErrors = [
      'failed to load firebase',
      'script error',
      'non-existent',
      'network error',
      'loading chunk',
      'dynamically imported module'
    ];
    
    return filteredErrors.some(filter => 
      message.toLowerCase().includes(filter.toLowerCase())
    );
  }

  handleScriptLoadError(filename, error) {
    const scriptName = this.extractScriptName(filename);
    
    // محاولة تحميل بديل أو تجاهل
    if (this.hasAlternative(scriptName)) {
      this.loadAlternativeScript(scriptName);
    } else {
      console.log(`📝 تم تجاهل السكريبت غير المتاح: ${scriptName}`);
    }
  }

  retryScriptLoad(scriptSrc) {
    const attempts = this.retryAttempts.get(scriptSrc) || 0;
    
    if (attempts >= this.maxRetries) {
      this.failedScripts.add(scriptSrc);
      console.log(`❌ فشل تحميل ${scriptSrc} نهائياً بعد ${attempts} محاولات`);
      return;
    }

    this.retryAttempts.set(scriptSrc, attempts + 1);
    
    setTimeout(() => {
      console.log(`🔄 إعادة محاولة تحميل ${scriptSrc} (المحاولة ${attempts + 1})`);
      
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.async = true;
      
      script.onload = () => {
        console.log(`✅ نجح تحميل ${scriptSrc} في المحاولة ${attempts + 1}`);
        this.retryAttempts.delete(scriptSrc);
      };
      
      script.onerror = () => {
        this.retryScriptLoad(scriptSrc);
      };
      
      document.head.appendChild(script);
    }, 1000 * (attempts + 1)); // تأخير متدرج
  }

  extractScriptName(filename) {
    return filename.split('/').pop().replace('.js', '');
  }

  hasAlternative(scriptName) {
    const alternatives = {
      'firebase-debug': 'auth-debug',
      'performance-optimizer': 'performance-fix',
      'club-profile-fix': 'firestore-fix'
    };
    
    return alternatives.hasOwnProperty(scriptName);
  }

  loadAlternativeScript(scriptName) {
    const alternatives = {
      'firebase-debug': '/js/auth-debug.js',
      'performance-optimizer': '/js/performance-fix.js',
      'club-profile-fix': '/js/firestore-fix.js'
    };
    
    const altSrc = alternatives[scriptName];
    if (altSrc) {
      console.log(`🔄 تحميل البديل لـ ${scriptName}: ${altSrc}`);
      
      const script = document.createElement('script');
      script.src = altSrc;
      script.async = true;
      document.head.appendChild(script);
    }
  }

  // API عامة
  getFailedScripts() {
    return Array.from(this.failedScripts);
  }

  clearRetryAttempts() {
    this.retryAttempts.clear();
    this.failedScripts.clear();
    console.log('🧹 تم مسح سجل المحاولات الفاشلة');
  }

  retryAllFailed() {
    console.log('🔄 إعادة محاولة جميع السكريبتات الفاشلة...');
    const failed = Array.from(this.failedScripts);
    this.clearRetryAttempts();
    
    failed.forEach(src => {
      setTimeout(() => this.retryScriptLoad(src), Math.random() * 2000);
    });
  }
}

// تشغيل معالج الأخطاء
const scriptErrorHandler = new ScriptErrorHandler();

// إتاحة عامة للتحكم
window.scriptErrorHandler = scriptErrorHandler;
window.retryFailedScripts = () => scriptErrorHandler.retryAllFailed();
window.getFailedScripts = () => scriptErrorHandler.getFailedScripts();

console.log('💡 الأوامر المتاحة:');
console.log('   - retryFailedScripts() - إعادة محاولة السكريبتات الفاشلة');
console.log('   - getFailedScripts() - عرض السكريبتات الفاشلة');
console.log('   - scriptErrorHandler.clearRetryAttempts() - مسح السجل'); 
