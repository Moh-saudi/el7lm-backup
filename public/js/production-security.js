// حماية إضافية للإنتاج
(function() {
  'use strict';
  
  // فحص ما إذا كنا في بيئة إنتاج
  const isProduction = !window.location.hostname.includes('localhost') && 
                      !window.location.hostname.includes('127.0.0.1') &&
                      !window.location.hostname.includes('192.168.') &&
                      !window.location.hostname.endsWith('.local');
  
  if (isProduction) {
    console.log('🛡️ تم تفعيل الحماية المتقدمة');
    
    // حماية من DevTools (اختيارية - قد تؤثر على تجربة المطور)
    /*
    let devtools = false;
    setInterval(function() {
      if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
        if (!devtools) {
          devtools = true;
          console.clear();
          console.log('%c🔒 Developer Tools Detected', 'color: red; font-size: 30px');
        }
      } else {
        devtools = false;
      }
    }, 500);
    */
    
    // حماية من Right Click (اختيارية)
    /*
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      return false;
    });
    */
    
    // حماية من F12
    /*
    document.addEventListener('keydown', function(e) {
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.shiftKey && e.key === 'C') ||
          (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
        return false;
      }
    });
    */
    
    // إخفاء معلومات حساسة من DOM
    function cleanSensitiveData() {
      // إزالة أي بيانات حساسة من data attributes
      const elements = document.querySelectorAll('[data-user-id], [data-email], [data-uid]');
      elements.forEach(el => {
        el.removeAttribute('data-user-id');
        el.removeAttribute('data-email');
        el.removeAttribute('data-uid');
      });
      
      // إزالة أي comments HTML التي قد تحتوي على معلومات حساسة
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_COMMENT,
        null,
        false
      );
      
      const comments = [];
      let node;
      while (node = walker.nextNode()) {
        comments.push(node);
      }
      
      comments.forEach(comment => {
        if (comment.textContent.includes('uid') || 
            comment.textContent.includes('email') ||
            comment.textContent.includes('password')) {
          comment.remove();
        }
      });
    }
    
    // تنظيف البيانات الحساسة كل 5 ثوان
    setInterval(cleanSensitiveData, 5000);
    
    // حماية محسنة من console commands الخطيرة
    const originalEval = window.eval;
    const originalFunction = window.Function;
    
    // منع eval بطريقة آمنة
    Object.defineProperty(window, 'eval', {
      value: function() {
        console.error('🚨 SECURITY: eval() محظور في الإنتاج لأسباب أمنية');
        throw new Error('eval() is not allowed for security reasons');
      },
      writable: false,
      configurable: false
    });
    
    // منع Function constructor أيضاً
    Object.defineProperty(window, 'Function', {
      value: function() {
        console.error('🚨 SECURITY: Function constructor محظور في الإنتاج');
        throw new Error('Function constructor is not allowed for security reasons');
      },
      writable: false,
      configurable: false
    });
    
    // حماية localStorage من الوصول غير المصرح به
    const originalSetItem = localStorage.setItem;
    const originalGetItem = localStorage.getItem;
    
    localStorage.setItem = function(key, value) {
      // السماح فقط بمفاتيح معينة
      const allowedKeys = ['theme', 'language', 'preferences'];
      if (allowedKeys.some(allowed => key.includes(allowed))) {
        return originalSetItem.call(this, key, value);
      }
      console.warn('🚫 محاولة كتابة غير مصرح بها في localStorage:', key);
    };
    
    // إضافة watermark للحماية من copyright
    function addWatermark() {
      const watermark = document.createElement('div');
      watermark.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 999999;
        font-size: 10px;
        color: rgba(0,0,0,0.1);
        pointer-events: none;
        user-select: none;
      `;
      watermark.textContent = '© El7lm 2024';
      document.body.appendChild(watermark);
    }
    
    // إضافة watermark بعد تحميل الصفحة
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', addWatermark);
    } else {
      addWatermark();
    }
    
    console.log('✅ تم تطبيق جميع إجراءات الحماية');
  } else {
    console.log('🔧 وضع التطوير - تم تعطيل الحماية المتقدمة');
  }
})(); 
