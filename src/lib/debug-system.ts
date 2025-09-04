// ملف تشخيص شامل للنظام - نسخة محسّنة وهادئة
export function debugSystem() {
  // عرض رسالة مختصرة فقط في وضع التطوير
  if (process.env.NODE_ENV === 'development') {
    // فحص سريع للخدمات الأساسية
    const firebaseReady = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const devMode = process.env.NODE_ENV === 'development';
    
    // رسالة موجزة ومفيدة
    console.log(`🔧 System: Firebase ${firebaseReady ? '✅' : '⚠️'} | Dev Mode ✅ | Ready!`);
  }
}

// دالة لفحص الأخطاء الشائعة - نسخة محسّنة وهادئة
export function checkCommonIssues() {
  // فحص صامت - يظهر الأخطاء فقط إذا وُجدت
  const issues = [];
  
  // فحص متغيرات Firebase
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    issues.push('❌ Firebase API Key missing');
  }
  
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    issues.push('❌ Firebase Project ID missing');
  }
  
  // فحص البيئة
  if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'production') {
    issues.push('⚠️ NODE_ENV not properly set');
  }
  
  // عرض النتيجة فقط إذا وُجدت مشاكل أو في وضع التطوير مع أخطاء
  if (issues.length > 0) {
    console.warn('⚠️ Issues found:', issues);
  } else if (process.env.NODE_ENV === 'development') {
    // رسالة مختصرة في وضع التطوير فقط
    console.log('✅ System check: All good');
  }
}

// دالة مبسطة لفحص Firebase
function checkFirebaseConfig() {
  if (process.env.NODE_ENV !== 'development') return { isValid: true, missingFields: [] };
  
  const requiredFields = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  ];
  
  const missingFields = requiredFields.filter(field => !process.env[field]);
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

// دالة مبسطة لفحص Geidea
async function checkGeideaConfig() {
  if (typeof window !== 'undefined') return;
  
  const hasConfig = !!(process.env.GEIDEA_MERCHANT_PUBLIC_KEY && 
                       process.env.GEIDEA_API_PASSWORD);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`💳 Geidea: ${hasConfig ? '✅ Configured' : '⚠️ Test mode'}`);
  }
}

// دالة فحص سريع للمتصفح
function checkBrowserEnvironment() {
  if (typeof window === 'undefined') return;
  
  const checks = {
    localStorage: !!window.localStorage,
    sessionStorage: !!window.sessionStorage,
    fetch: !!window.fetch,
    crypto: !!window.crypto
  };
  
  const failed = Object.entries(checks).filter(([key, value]) => !value);
  
  if (failed.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn('🌐 Browser support issues:', failed.map(([key]) => key));
  }
}

// دالة فحص مبسطة للأداء
function checkPerformance() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;
  
  // فحص بسيط للأداء
  if (performance.now() > 5000) {
    console.warn('⏱️ Slow page load detected');
  }
}

// دالة فحص شامل مبسطة
export async function fullSystemCheck() {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.log('🔍 === Quick System Check ===');
  
  // فحص Firebase
  const firebaseCheck = checkFirebaseConfig();
  if (!firebaseCheck.isValid) {
    console.warn('🔥 Firebase issues:', firebaseCheck.missingFields);
  }
  
  // فحص Geidea
  await checkGeideaConfig();
  
  // فحص المتصفح
  checkBrowserEnvironment();
  
  // فحص الأداء
  checkPerformance();
  
  console.log('🔍 === Check Complete ===');
}

// تصدير دالة مبسطة للتحقق السريع
export function quickHealthCheck() {
  if (process.env.NODE_ENV !== 'development') return;
  
  const firebase = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const browser = typeof window !== 'undefined';
  
  console.log(`🏥 Health: Firebase ${firebase ? '✅' : '❌'} | Browser ${browser ? '✅' : '❌'}`);
}

// فحص اتصال Firebase/Firestore
export async function checkFirestoreConnection() {
  if (typeof window === 'undefined') return false;
  
  try {
    const { db } = await import('./firebase/config');
    const { auth } = await import('./firebase/config');
    
    // فحص بسيط للتأكد من أن Firestore متاح
    if (db && auth) {
      console.log('🔥 Firestore connection: ✅ Connected');
      return true;
    } else {
      console.warn('🔥 Firestore connection: ⚠️ Not initialized');
      return false;
    }
  } catch (error) {
    console.error('🔥 Firestore connection: ❌ Failed', error);
    return false;
  }
}

// فحص محدد لبيانات المستخدم
export async function checkUserDataAccess(userId: string) {
  if (!userId || typeof window === 'undefined') return false;
  
  try {
    const { db } = await import('./firebase/config');
    const { doc, getDoc } = await import('firebase/firestore');
    
    const userDoc = doc(db, 'users', userId);
    const snapshot = await getDoc(userDoc);
    
    if (snapshot.exists()) {
      console.log('👤 User data: ✅ Found', { hasData: true, id: userId });
      return true;
    } else {
      console.warn('👤 User data: ⚠️ Not found', { hasData: false, id: userId });
      return false;
    }
  } catch (error) {
    console.error('👤 User data access: ❌ Error', error);
    return false;
  }
}

// دالة شاملة لتشخيص مشاكل المصادقة
export async function diagnoseAuthIssues(user: any, userData: any, loading: boolean) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔍 === Auth Diagnosis ===');
    console.log('User:', user ? { uid: user.uid, email: user.email } : 'None');
    console.log('UserData:', userData ? { accountType: userData.accountType, name: userData.name } : 'None');
    console.log('Loading:', loading);
    
    if (user && !userData && !loading) {
      console.warn('⚠️ Issue detected: User authenticated but no user data found');
      console.log('🔧 Possible solutions:');
      console.log('1. Check Firestore rules');
      console.log('2. Verify user document exists in /users/{uid}');
      console.log('3. Check network connection');
      
      // فحص الوصول لبيانات المستخدم
      await checkUserDataAccess(user.uid);
    }
    
    console.log('🔍 === Diagnosis Complete ===');
  }
} 
