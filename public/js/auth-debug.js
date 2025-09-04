// El7lm Firebase Auth Debug Tool (v2)
// Modernized for Firebase v9+ and React

console.log('🔐 تحميل أداة تشخيص المصادقة المحدثة...');

// أدوات التشخيص الحديثة لـ Firebase Auth
window.authDebug = {
  // فحص حالة المصادقة الحالية
  checkFirebaseAuth: function() {
    console.log('🔍 فحص حالة Firebase Auth...');
    
    try {
      // التحقق من localStorage لـ Firebase
      const firebaseKeys = Object.keys(localStorage).filter(key => 
        key.includes('firebase') || key.includes('authUser')
      );
      
      console.log('📊 مفاتيح Firebase في localStorage:', firebaseKeys);
      
      if (firebaseKeys.length > 0) {
        firebaseKeys.forEach(key => {
          try {
            const data = localStorage.getItem(key);
            if (data && data !== 'null') {
              const parsedData = JSON.parse(data);
              console.log(`✅ ${key}:`, {
                uid: parsedData.uid,
                email: parsedData.email,
                displayName: parsedData.displayName
              });
            }
          } catch (e) {
            console.log(`⚠️ لا يمكن قراءة ${key}`);
          }
        });
      } else {
        console.log('❌ لا توجد بيانات Firebase Auth في localStorage');
      }
      
      return firebaseKeys.length > 0;
    } catch (error) {
      console.error('❌ خطأ في فحص Firebase Auth:', error);
      return false;
    }
  },
  
  // فحص بيانات المستخدم في Firestore
  checkUserDocument: function() {
    console.log('🔍 فحص مستند المستخدم في Firestore...');
    console.log('💡 هذا يتطلب وصول مباشر لـ Firebase في الكونسول');
    console.log('📝 استخدم React DevTools للوصول للـ AuthProvider state');
  },
  
  // إعطاء اقتراحات للحلول
  suggestSolutions: function() {
    console.log('💡 اقتراحات حل مشاكل المصادقة:');
    console.log('');
    console.log('1️⃣ إذا كان التحميل معلق:');
    console.log('   👉 تحديث الصفحة (F5)');
    console.log('   👉 authDebugger.forceStopLoading()');
    console.log('   👉 مسح localStorage.clear()');
    console.log('');
    console.log('2️⃣ إذا لم تظهر البيانات:');
    console.log('   👉 تحقق من Firebase Console');
    console.log('   👉 تحقق من Network tab للأخطاء');
    console.log('   👉 تحقق من قواعد Firestore');
    console.log('');
    console.log('3️⃣ للتشخيص المتقدم:');
    console.log('   👉 React DevTools → AuthProvider');
    console.log('   👉 فحص Firebase Auth في Console');
    console.log('   👉 فحص رسائل الكونسول للأخطاء');
  },
  
  // مسح البيانات المحفوظة
  clearAuthData: function() {
    console.log('🧹 مسح بيانات المصادقة...');
    
    // مسح localStorage
    const firebaseKeys = Object.keys(localStorage).filter(key => 
      key.includes('firebase') || key.includes('auth')
    );
    
    firebaseKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🗑️ تم حذف ${key}`);
    });
    
    console.log('✅ تم مسح بيانات المصادقة');
    console.log('🔄 سيتم إعادة تحميل الصفحة في 2 ثانية...');
    
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }
};

// دوال مساعدة سريعة للكونسول
window.authDebugger = {
  forceStopLoading: () => {
    console.log('🔧 محاولة إيقاف شاشات التحميل بالقوة...');
    
    // إخفاء عناصر التحميل
    const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="animate-spin"]');
    loadingElements.forEach(el => {
      el.style.display = 'none';
      console.log('🚫 تم إخفاء عنصر التحميل:', el.className);
    });
    
    // محاولة إزالة overlay التحميل
    const overlays = document.querySelectorAll('[class*="min-h-screen"], [class*="fixed"], [class*="absolute"]');
    overlays.forEach(el => {
      if (el.innerText.includes('جاري تحميل') || el.innerText.includes('الرجاء الانتظار')) {
        el.style.display = 'none';
        console.log('🚫 تم إخفاء شاشة التحميل');
      }
    });
    
    console.log('⚠️ إذا استمرت المشكلة، استخدم: location.reload()');
  },
  
  goToLogin: () => {
    console.log('🔑 الانتقال لصفحة تسجيل الدخول...');
    window.location.href = '/auth/login';
  },
  
  clearAndReload: () => {
    console.log('🧹 مسح البيانات وإعادة التحميل...');
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  },
  
  checkReactState: () => {
    console.log('⚛️ للوصول لحالة React:');
    console.log('1. افتح React DevTools');
    console.log('2. ابحث عن AuthProvider');
    console.log('3. فحص props: user, userData, loading, error');
    console.log('💡 أو استخدم: $r في الكونسول بعد تحديد المكون');
  }
};

// فحص سريع تلقائي
setTimeout(() => {
  console.log('🔍 فحص تلقائي سريع...');
  
  const hasFirebaseAuth = window.authDebug.checkFirebaseAuth();
  const hasLoadingElements = document.querySelectorAll('[class*="loading"], [class*="animate-spin"]').length > 0;
  const hasArabicLoading = document.body.innerText.includes('جاري تحميل');
  
  if (!hasFirebaseAuth && !hasLoadingElements && !hasArabicLoading) {
    console.log('❌ لا يوجد مصادقة - قد تحتاج لتسجيل الدخول');
    console.log('💡 استخدم: authDebugger.goToLogin()');
  } else if (hasLoadingElements || hasArabicLoading) {
    console.log('⏳ شاشة تحميل مكتشفة - انتظار أو استخدم authDebugger.forceStopLoading()');
  } else {
    console.log('✅ المصادقة تبدو طبيعية');
  }
}, 3000);

console.log('✅ أداة تشخيص المصادقة المحدثة جاهزة');
console.log('💡 الأوامر المتاحة:');
console.log('   - authDebug.checkFirebaseAuth()');
console.log('   - authDebug.suggestSolutions()');
console.log('   - authDebugger.forceStopLoading()');
console.log('   - authDebugger.clearAndReload()');

// Usage information
console.log(`
=== El7lm Auth Debug Tool ===
Available commands:

1. Check your current session:
   authDebug.checkSession()

2. Try logging in with test account:
   authDebug.tryTestLogin()

3. Check if your user data exists:
   authDebug.checkUserData()

4. Create/update test user data:
   authDebug.createTestUserData()

5. Reset test account password:
   authDebug.resetTestPassword()
`); 
