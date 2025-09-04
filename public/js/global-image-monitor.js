// 🌐 مراقب أخطاء الصور العالمي - El7lm
// يعمل تلقائياً عند تحميل أي صفحة

(function() {
  'use strict';
  
  console.log('🌐 تحميل مراقب أخطاء الصور العالمي...');
  
  // أنماط الروابط المكسورة
  const BROKEN_PATTERNS = [
    'test-url.com',
    'example.com',
    'placeholder.com',
    'fake-image',
    'dummy-image',
    'undefined',
    'null',
    '[object Object]',
    '/avatars/undefined/',
    '/avatars/null/',
    '/avatars//',
  ];
  
  // الصورة الافتراضية
  const DEFAULT_IMAGE = '/images/default-avatar.png';
  
  // إحصائيات الإصلاح
  let stats = {
    fixed: 0,
    checked: 0,
    errors: 0
  };
  
  // فحص إذا كان الرابط مكسور
  function isBrokenUrl(url) {
    if (!url || typeof url !== 'string') return true;
    return BROKEN_PATTERNS.some(pattern => url.includes(pattern)) ||
           url.length < 10 || !url.startsWith('http');
  }
  
  // إصلاح صورة واحدة
  function fixImage(img, reason = 'error') {
    if (img.src === DEFAULT_IMAGE) return false;
    
    const oldSrc = img.src;
    img.src = DEFAULT_IMAGE;
    img.onerror = null; // منع التكرار
    
    stats.fixed++;
    console.log(`🔧 [${reason}] إصلاح صورة: ${oldSrc} → ${DEFAULT_IMAGE}`);
    
    return true;
  }
  
  // فحص وإصلاح جميع الصور
  function scanAndFixImages() {
    const images = document.querySelectorAll('img');
    let fixedCount = 0;
    
    images.forEach(img => {
      stats.checked++;
      
      if (isBrokenUrl(img.src)) {
        if (fixImage(img, 'scan')) {
          fixedCount++;
        }
      }
    });
    
    if (fixedCount > 0) {
      console.log(`🎉 تم إصلاح ${fixedCount} صورة في الفحص`);
    }
    
    return fixedCount;
  }
  
  // معالج أخطاء الصور العالمي
  function setupGlobalErrorHandler() {
    // معالج الأخطاء العالمي
    window.addEventListener('error', function(e) {
      if (e.target && e.target.tagName === 'IMG') {
        stats.errors++;
        fixImage(e.target, 'error');
      }
    }, true);
    
    console.log('✅ تم تفعيل معالج أخطاء الصور العالمي');
  }
  
  // مراقب DOM للصور الجديدة
  function setupDOMObserver() {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            // فحص العنصر نفسه
            if (node.tagName === 'IMG' && isBrokenUrl(node.src)) {
              fixImage(node, 'dom');
            }
            
            // فحص الصور بداخل العنصر
            const imgs = node.querySelectorAll ? node.querySelectorAll('img') : [];
            imgs.forEach(img => {
              if (isBrokenUrl(img.src)) {
                fixImage(img, 'dom');
              }
            });
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log('✅ تم تفعيل مراقب DOM للصور الجديدة');
  }
  
  // فحص دوري
  function startPeriodicCheck() {
    setInterval(() => {
      const fixedCount = scanAndFixImages();
      if (fixedCount > 0) {
        console.log(`🔄 فحص دوري: تم إصلاح ${fixedCount} صورة`);
      }
    }, 5000); // كل 5 ثوان
    
    console.log('✅ تم تفعيل الفحص الدوري (كل 5 ثوان)');
  }
  
  // تقرير الإحصائيات
  function getStats() {
    console.log('📊 إحصائيات مراقب الصور العالمي:');
    console.log(`   🔍 تم فحص: ${stats.checked} صورة`);
    console.log(`   🔧 تم إصلاح: ${stats.fixed} صورة`);
    console.log(`   ❌ أخطاء: ${stats.errors} خطأ`);
    return stats;
  }
  
  // إضافة الدوال للـ window للوصول إليها
  window.globalImageMonitor = {
    scan: scanAndFixImages,
    stats: getStats,
    fix: fixImage,
    check: isBrokenUrl
  };
  
  // بدء التشغيل
  function init() {
    console.log('🚀 بدء تشغيل مراقب أخطاء الصور العالمي...');
    
    // إعداد المعالجات
    setupGlobalErrorHandler();
    setupDOMObserver();
    
    // فحص أولي بعد تحميل الصفحة
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          console.log('🔍 فحص أولي للصور...');
          scanAndFixImages();
          startPeriodicCheck();
        }, 1000);
      });
    } else {
      setTimeout(() => {
        console.log('🔍 فحص أولي للصور...');
        scanAndFixImages();
        startPeriodicCheck();
      }, 1000);
    }
    
    console.log('✅ مراقب أخطاء الصور العالمي جاهز!');
    console.log('💡 استخدم window.globalImageMonitor.stats() لعرض الإحصائيات');
  }
  
  // بدء التشغيل
  init();
  
})(); 
