// El7lm - Smart Script Loader
// تحميل ذكي للسكريبتات حسب الحاجة فقط

console.log('🚀 تحميل أداة التحميل الذكي...');

class SmartScriptLoader {
  constructor() {
    this.loadedScripts = new Set();
    this.loadingScripts = new Map();
    this.scriptDependencies = {
      'firestore-fix': [],
      'auth-debug': []
    };
    this.init();
  }

  init() {
    // انتظار جاهزية Firebase قبل بدء التحميل
    this.waitForFirebase().then(() => {
      this.detectPageNeeds();
      this.setupConditionalLoading();
      console.log('✅ أداة التحميل الذكي جاهزة');
    });
  }

  waitForFirebase() {
    return new Promise((resolve) => {
      const checkFirebase = () => {
        // التحقق من وجود Firebase في الـ global scope أو من خلال مؤشرات أخرى
        if (typeof window !== 'undefined' && 
            (window.firebase || 
             document.querySelector('script[src*="firebase"]') ||
             localStorage.getItem('firebase:authUser:AIzaSyDCQQxUbeQQrlty5HnF65-7TK0TB2zB7R4:[DEFAULT]') !== null)) {
          console.log('🔥 Firebase متاح - بدء تحميل السكريبتات');
          resolve();
        } else {
          // إعادة المحاولة كل 500ms
          setTimeout(checkFirebase, 500);
        }
      };
      
      // بدء الفحص بعد ثانية لإعطاء وقت للتحميل
      setTimeout(checkFirebase, 1000);
      
      // timeout نهائي بعد 10 ثوان
      setTimeout(() => {
        console.log('⚠️ انتهت مهلة انتظار Firebase - المتابعة بدونه');
        resolve();
      }, 10000);
    });
  }

  detectPageNeeds() {
    const path = window.location.pathname;
    const scripts = [];
    
    // تحديد السكريبتات المطلوبة حسب الصفحة
    if (path.includes('/dashboard/')) {
      // تحميل firestore-fix لجميع صفحات الـ dashboard
      scripts.push('firestore-fix');
    } else if (path.includes('/auth/') || path === '/') {
      // تحميل firestore-fix للصفحات الأساسية أيضاً
      scripts.push('firestore-fix');
    }
    
    // تحميل السكريبتات المطلوبة مع تأخير لضمان جاهزية Firebase
    setTimeout(() => {
      scripts.forEach(script => {
        this.loadScriptWhenNeeded(script);
      });
    }, 500); // تقليل التأخير لتحسين الأداء
  }

  setupConditionalLoading() {
    // مراقبة التفاعلات للتحميل عند الحاجة
    document.addEventListener('click', (e) => {
      // تحميل سكريبتات الدفع عند النقر على أزرار الدفع
      if (e.target.matches('[data-payment], .payment-button, [href*="payment"]')) {
        this.loadScriptWhenNeeded('payment-fix');
      }
      
      // تحميل سكريبتات الصور عند التفاعل مع الصور
      if (e.target.matches('img, [data-image-upload]')) {
        this.loadScriptWhenNeeded('image-fix');
      }
    });

    // مراقبة أخطاء Firebase لتحميل أدوات التشخيص
    window.addEventListener('error', (e) => {
      if (e.message.includes('firestore') || e.message.includes('firebase')) {
        this.loadScriptWhenNeeded('firebase-debug');
      }
    });
  }

  async loadScriptWhenNeeded(scriptName) {
    if (this.loadedScripts.has(scriptName)) {
      return Promise.resolve();
    }

    if (this.loadingScripts.has(scriptName)) {
      return this.loadingScripts.get(scriptName);
    }

    const promise = this.loadScript(scriptName);
    this.loadingScripts.set(scriptName, promise);
    
    try {
      await promise;
      this.loadedScripts.add(scriptName);
      this.loadingScripts.delete(scriptName);
    } catch (error) {
      this.loadingScripts.delete(scriptName);
      console.warn(`⚠️ فشل تحميل ${scriptName}:`, error);
      // لا نرمي الخطأ لتجنب كسر التطبيق
    }

    return Promise.resolve(); // دائماً نرجع promise محلول
  }

  loadScript(scriptName) {
    return new Promise((resolve, reject) => {
      // تحميل التبعيات أولاً
      const dependencies = this.scriptDependencies[scriptName] || [];
      const dependencyPromises = dependencies.map(dep => this.loadScriptWhenNeeded(dep));

      Promise.all(dependencyPromises).then(() => {
        // التحقق من وجود السكريبت في الصفحة بالفعل
        const existingScript = document.querySelector(`script[src="${this.getScriptPath(scriptName)}"]`);
        if (existingScript) {
          console.log(`✅ السكريبت ${scriptName} محمل بالفعل`);
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = this.getScriptPath(scriptName);
        script.async = true;
        
        script.onload = () => {
          console.log(`✅ تم تحميل ${scriptName} بنجاح`);
          resolve();
        };
        
        script.onerror = (error) => {
          console.warn(`⚠️ فشل تحميل ${scriptName}:`, error);
          // لا نرفض Promise لتجنب كسر التطبيق
          resolve(); // نستمر حتى لو فشل تحميل سكريبت واحد
        };
        
        // تأخير قصير لتجنب حظر الـ UI
        setTimeout(() => {
          document.head.appendChild(script);
        }, 100);
      }).catch((error) => {
        console.warn(`⚠️ فشل في تحميل التبعيات لـ ${scriptName}:`, error);
        resolve(); // نستمر حتى لو فشلت التبعيات
      });
    });
  }

  getScriptPath(scriptName) {
    const scriptPaths = {
      'firestore-fix': '/js/firestore-fix.js',
      'firebase-debug': '/js/firebase-debug.js',
      'auth-debug': '/js/auth-debug.js',
      'payment-fix': '/js/payment-fix.js',
      'image-fix': '/js/global-image-monitor.js',
      'performance-optimizer': '/js/performance-optimizer.js'
    };
    
    return scriptPaths[scriptName] || `/js/${scriptName}.js`;
  }

  // API عامة للاستخدام الخارجي
  loadDebugScripts() {
    const debugScripts = ['firebase-debug', 'auth-debug'];
    return Promise.all(debugScripts.map(script => this.loadScriptWhenNeeded(script)));
  }

  loadPerformanceScripts() {
    return this.loadScriptWhenNeeded('performance-optimizer');
  }

  getLoadedScripts() {
    return Array.from(this.loadedScripts);
  }

  preloadForNextPage(path) {
    console.log(`🔮 تحضير سكريبتات للصفحة التالية: ${path}`);
    
    if (path.includes('/payment')) {
      this.loadScriptWhenNeeded('payment-fix');
    }
  }
}

// تشغيل أداة التحميل الذكي
const smartLoader = new SmartScriptLoader();

// إتاحة عامة للاستخدام
window.smartLoader = smartLoader;
window.loadDebugScripts = () => smartLoader.loadDebugScripts();
window.loadPerformanceScripts = () => smartLoader.loadPerformanceScripts();

// تحميل تلقائي للسكريبتات عند تغيير الصفحة (للـ SPA)
let lastPath = window.location.pathname;
const checkPathChange = () => {
  const currentPath = window.location.pathname;
  if (currentPath !== lastPath) {
    smartLoader.detectPageNeeds();
    lastPath = currentPath;
  }
};

// مراقبة تغيير الصفحة
setInterval(checkPathChange, 1000);

console.log('💡 الأوامر المتاحة:');
console.log('   - loadDebugScripts() - تحميل أدوات التشخيص');
console.log('   - loadPerformanceScripts() - تحميل أدوات الأداء');
console.log('   - smartLoader.getLoadedScripts() - عرض السكريبتات المحملة');
console.log('   - smartLoader.preloadForNextPage(path) - تحضير للصفحة التالية'); 
