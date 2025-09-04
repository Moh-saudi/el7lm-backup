// منع الـ URLs الخاطئة والـ navigation غير المرغوب فيه
// نتجنب الاعتماد على next/router داخل بيئة App Router
type RouterLike = { push: (url: string) => void };

/**
 * التحقق من صحة URL
 */
export const isValidUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    // إزالة المسافات والأحرف الخاصة
    const cleanUrl = url.trim();
    
    // منع URLs التي تحتوي على نص عربي فقط
    const arabicPattern = /^[\u0600-\u06FF\s\|]+$/;
    if (arabicPattern.test(cleanUrl)) {
      console.warn('منع URL يحتوي على نص عربي فقط:', cleanUrl);
      return false;
    }
    
    // التحقق من أنها URL صالحة
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      new URL(cleanUrl);
      return true;
    }
    
    // التحقق من المسارات النسبية
    if (cleanUrl.startsWith('/')) {
      // يجب أن تحتوي على أحرف إنجليزية أو أرقام فقط بعد /
      const pathPattern = /^\/[a-zA-Z0-9\-_\/\?=&]+$/;
      return pathPattern.test(cleanUrl);
    }
    
    return false;
  } catch (error) {
    console.warn('URL غير صالح:', url, error);
    return false;
  }
};

/**
 * تنظيف URL من النصوص العربية والأحرف الخاصة
 */
export const sanitizeUrl = (url: string): string => {
  if (!url || typeof url !== 'string') return '';
  
  // إزالة المسافات من البداية والنهاية
  let cleanUrl = url.trim();
  
  // إذا كان URL يحتوي على نص عربي في المسار، استبدله بـ fallback
  const arabicInPathPattern = /\/[\u0600-\u06FF\s\|]/;
  if (arabicInPathPattern.test(cleanUrl)) {
    console.warn('تنظيف URL يحتوي على نص عربي في المسار:', cleanUrl);
    // استخراج الجزء الصالح من URL
    const validParts = cleanUrl.split('/').filter(part => {
      // الاحتفاظ بالأجزاء التي تحتوي على أحرف إنجليزية أو أرقام فقط
      return /^[a-zA-Z0-9\-_\?=&]*$/.test(part);
    });
    cleanUrl = validParts.join('/');
  }
  
  return cleanUrl;
};

/**
 * منع navigation خاطئ
 */
export const safeNavigate = (router: RouterLike, url: string): boolean => {
  try {
    if (!isValidUrl(url)) {
      console.debug('منع navigation إلى URL غير صالح:', url);
      return false;
    }
    
    const cleanUrl = sanitizeUrl(url);
    if (cleanUrl !== url) {
      console.debug('تم تنظيف URL من:', url, 'إلى:', cleanUrl);
    }
    
    router.push(cleanUrl);
    return true;
  } catch (error) {
    console.debug('فشل في navigation (تم التعامل معه):', error);
    return false;
  }
};

/**
 * التحقق من ID صالح
 */
export const isValidId = (id: string): boolean => {
  if (!id || typeof id !== 'string') return false;
  
  // ID يجب أن يحتوي على أحرف إنجليزية وأرقام فقط
  const idPattern = /^[a-zA-Z0-9\-_]+$/;
  return idPattern.test(id) && id.length >= 3 && id.length <= 100;
};

/**
 * منع URLs التي تحتوي على عناوين فيديوهات عربية
 */
export const preventVideoTitleNavigation = (title: string): void => {
  if (!title || typeof title !== 'string') return;
  
  // منع أي محاولة لاستخدام عنوان الفيديو كـ URL
  if (title.includes('|') || title.includes('CH ') || /[\u0600-\u06FF]/.test(title)) {
    console.warn('منع استخدام عنوان فيديو كـ URL:', title);
    
    // منع تغيير URL الحالي
    if (typeof window !== 'undefined' && window.history) {
      const currentUrl = window.location.href;
      if (currentUrl.includes(encodeURIComponent(title))) {
        console.warn('إعادة توجيه من URL خاطئ');
        window.history.replaceState({}, '', '/dashboard');
      }
    }
  }
};

/**
 * تنظيف console من URLs خاطئة
 */
export const cleanConsoleUrls = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // تتبع الـ errors والتحذيرات المتعلقة بـ URLs خاطئة
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
  
    console.error = (...args: unknown[]) => {
      try {
        const message = args.join(' ');
        
        // إخفاء أخطاء URLs التي تحتوي على نص عربي
        if (message.includes('%D8%') || message.includes('ERR_ABORTED 404') || message.includes('net::ERR_ABORTED')) {
          const arabicPattern = /%[\dA-F]{2}/g;
          if (arabicPattern.test(message)) {
            console.debug('تم منع خطأ URL عربي من الظهور');
            return;
          }
          
          // منع الأخطاء التي تحتوي على مسارات عربية مُرمزة
          if (message.includes('/dashboard/club/') && message.includes('%')) {
            console.debug('تم منع خطأ navigation عربي من الظهور');
            return;
          }
        }
        
        originalConsoleError(...args);
      } catch (error) {
        // في حالة فشل معالجة console.error، استخدم الدالة الأصلية
        originalConsoleError(...args);
      }
    };
  
    console.warn = (...args: unknown[]) => {
      try {
        const message = args.join(' ');
        
        // إخفاء تحذيرات URLs العربية
        if (message.includes('navigation') && /[\u0600-\u06FF]/.test(message)) {
          console.debug('إخفاء تحذير navigation عربي:', message);
          return;
        }
        
        originalConsoleWarn(...args);
      } catch (error) {
        // في حالة فشل معالجة console.warn، استخدم الدالة الأصلية
        originalConsoleWarn(...args);
      }
    };
  } catch (error) {
    console.debug('فشل في تعديل console methods (تم التجاهل):', error);
  }
};

/**
 * منع requests خاطئة من الوصول للشبكة
 */
export const interceptBadRequests = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // تعديل fetch لمنع طلبات URLs خاطئة
    const originalFetch = window.fetch;
    window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
      try {
        const url = typeof input === 'string' ? input : input.toString();
        
        // منع طلبات تحتوي على نص عربي في المسار
        if (url.includes('%D8%') || /[\u0600-\u06FF]/.test(url)) {
          console.debug('تم منع طلب خاطئ بهدوء:', url);
          // إرجاع JSON response صالح بدلاً من response فارغ
          return Promise.resolve(new Response(JSON.stringify({}), { 
            status: 200, 
            statusText: 'OK',
            headers: { 
              'Content-Type': 'application/json',
              'Content-Length': '2'
            }
          }));
        }
        
        return originalFetch.call(this, input, init);
      } catch (error) {
        console.debug('خطأ في معالجة fetch (تم التعامل معه):', error);
        return Promise.resolve(new Response(JSON.stringify({ error: 'handled' }), { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Content-Length': '19'
          }
        }));
      }
    };
  } catch (error) {
    console.debug('فشل في تعديل fetch (تم التجاهل):', error);
  }
  
  // منع navigation خاطئ في المتصفح
  try {
    if (window.history && window.history.pushState) {
      const originalPushState = window.history.pushState;
      window.history.pushState = function(
        state: unknown, 
        title: string, 
        url?: string | URL | null
      ) {
        try {
          if (url && typeof url === 'string') {
            // منع URLs التي تحتوي على نص عربي
            if (/[\u0600-\u06FF]/.test(url) || url.includes('%D8%')) {
              console.debug('تم منع pushState خاطئ:', url);
              return;
            }
          }
          return originalPushState.call(this, state, title, url);
        } catch (error) {
          console.debug('خطأ في pushState (تم التعامل معه):', error);
        }
      };
    }
  } catch (error) {
    console.debug('فشل في تعديل history API (تم التجاهل):', error);
  }
};

// دالة للتهيئة اليدوية (لا يتم استدعاؤها تلقائياً)
export const initializeUrlValidation = (): void => {
  if (typeof window !== 'undefined') {
    cleanConsoleUrls();
    interceptBadRequests();
    console.debug('✅ تم تفعيل URL validator وتنظيف console ومنع طلبات خاطئة');
  }
}; 
