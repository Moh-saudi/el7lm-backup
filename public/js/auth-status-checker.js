// أداة فحص حالة المصادقة - للتطوير فقط
(function() {
  'use strict';
  
  // فحص ما إذا كنا في بيئة تطوير
  const isDevelopment = window.location.hostname.includes('localhost') || 
                       window.location.hostname.includes('127.0.0.1') ||
                       window.location.hostname.includes('192.168.') ||
                       window.location.hostname.endsWith('.local');
  
  if (!isDevelopment) {
    console.log('🔒 Auth Status Checker disabled in production');
    return;
  }
  
  console.log('🔧 Auth Status Checker loaded (Development Mode) - Simplified version');
  
  // فحص سريع واحد فقط
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    performQuickCheck();
  } else {
    document.addEventListener('DOMContentLoaded', performQuickCheck);
  }
  
  function performQuickCheck() {
    console.log('🔍 Quick Auth Check:');
    
    // فحص إذا كان هناك شاشة تحميل مستمرة
    const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="animate-spin"]');
    const arabicLoadingText = document.body.innerText.includes('جاري تحميل');
    
    if (loadingElements.length > 0 || arabicLoadingText) {
      console.log('⏳ Loading detected, will check again in 8 seconds');
      setTimeout(() => {
        const stillLoading = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="animate-spin"]').length > 0;
        if (stillLoading) {
          console.log('🚨 Loading appears stuck - consider refreshing page');
          console.log('💡 Use authDebugger.forceStopLoading() if needed');
        } else {
          console.log('✅ Loading completed normally');
        }
      }, 8000);
    } else {
      console.log('✅ No loading state detected - app appears ready');
    }
  }
  
  // إنهاء الفحص المتكرر المزعج
  return;

// فحص حالة المصادقة كل 5 ثوان (أقل تطفلاً)
let authCheckCount = 0;
const maxChecks = 3; // فحص لمدة 15 ثانية فقط

function checkAuthStatus() {
  authCheckCount++;
  
  console.log(`\n🔍 Auth Status Check #${authCheckCount}:`);
  console.log('⏰ Timestamp:', new Date().toISOString());
  
  // فحص المتغيرات الأساسية
  console.log('🌐 Window exists:', typeof window !== 'undefined');
  // فحص Firebase v9+ (مجرد فحص أساسي)
  const hasFirebaseScript = Array.from(document.scripts).some(script => 
    script.src.includes('firebase') || script.textContent.includes('firebase')
  );
  console.log('🔥 Firebase scripts loaded:', hasFirebaseScript);
  
  // فحص إذا كان هناك auth context في React
  const reactElement = document.querySelector('#__next, [data-reactroot]');
  console.log('⚛️ React app element found:', !!reactElement);
  
  // فحص عناصر DOM
  const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="animate-spin"]');
  console.log('⏳ Loading elements found:', loadingElements.length);
  
  const errorElements = document.querySelectorAll('[class*="error"], [class*="text-red"]');
  console.log('❌ Error elements found:', errorElements.length);
  
  // فحص النصوص العربية
  const arabicLoadingText = document.body.innerText.includes('جاري تحميل') || 
                            document.body.innerText.includes('جاري تحصيل') ||
                            document.body.innerText.includes('الرجاء الانتظار');
  console.log('📝 Arabic loading text found:', arabicLoadingText);
  
  // فحص الـ URL الحالي
  console.log('🌍 Current URL:', window.location.href);
  console.log('📍 Current pathname:', window.location.pathname);
  
  // فحص Local Storage
  try {
    const firebaseKeys = Object.keys(localStorage).filter(key => key.includes('firebase'));
    console.log('💾 Firebase localStorage keys:', firebaseKeys.length);
  } catch (e) {
    console.log('💾 localStorage access failed:', e.message);
  }
  
  // إذا وجدنا نص التحميل العربي، نعطي تفاصيل أكثر
  if (arabicLoadingText) {
    console.log('🚨 Arabic loading text detected!');
    const loadingContainer = document.querySelector('[class*="min-h-screen"]');
    if (loadingContainer) {
      console.log('📦 Loading container HTML:', loadingContainer.outerHTML.substring(0, 200) + '...');
    }
  }
  
  // التوقف المبكر إذا كان كل شيء يعمل بشكل طبيعي
  if (authCheckCount >= 2 && !arabicLoadingText && loadingElements.length === 0) {
    console.log('✅ Auth status appears normal - stopping early checks');
    return;
  }
  
  // التوقف بعد عدد معين من الفحوصات
  if (authCheckCount >= maxChecks) {
    console.log('⏹️ Auth status checker stopped after', maxChecks, 'checks');
    return;
  }
  
  // جدولة الفحص التالي (كل 5 ثوان)
  setTimeout(checkAuthStatus, 5000);
}

// بدء الفحص بعد 3 ثوان لإعطاء وقت للتحميل
setTimeout(checkAuthStatus, 3000);

// إضافة دوال مساعدة للكونسول
window.authDebugger = {
  forceStopLoading: () => {
    console.log('🔧 Attempting to force stop loading...');
    // محاولة إيقاف شاشات التحميل
    const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="animate-spin"]');
    loadingElements.forEach(el => {
      el.style.display = 'none';
      console.log('🚫 Hidden loading element:', el.className);
    });
    
    // إعادة تحديث الصفحة بعد 3 ثوان
    setTimeout(() => {
      console.log('🔄 Reloading page...');
      window.location.reload();
    }, 3000);
  },
  
  goToLogin: () => {
    console.log('🔑 Redirecting to login...');
    window.location.href = '/auth/login';
  },
  
  goToHome: () => {
    console.log('🏠 Redirecting to home...');
    window.location.href = '/';
  },
  
  clearStorage: () => {
    console.log('🧹 Clearing localStorage...');
    localStorage.clear();
    console.log('✅ localStorage cleared');
  }
};

console.log('💡 Available commands:');
console.log('   authDebugger.forceStopLoading() - إيقاف شاشات التحميل بالقوة');
console.log('   authDebugger.goToLogin() - الذهاب لصفحة تسجيل الدخول');
console.log('   authDebugger.goToHome() - الذهاب للصفحة الرئيسية');
console.log('   authDebugger.clearStorage() - مسح البيانات المحفوظة');

})(); // إنهاء الدالة الرئيسية 
