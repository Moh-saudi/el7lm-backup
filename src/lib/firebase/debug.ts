// ملف تشخيص Firebase - نسخة محسّنة
export function debugFirebaseConfig() {
  // فحص صامت - رسالة مختصرة فقط في وضع التطوير
  if (process.env.NODE_ENV === 'development') {
    // فحص سريع للخدمات الأساسية
    const hasApiKey = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const hasProjectId = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    
    if (!hasApiKey || !hasProjectId) {
      console.error('❌ Firebase configuration incomplete');
      return;
    }
    
    try {
      const { auth, db } = require('./config');
      const authReady = !!auth;
      const dbReady = !!db;
      
      console.log(`🔥 Firebase: Auth ${authReady ? '✅' : '❌'} | DB ${dbReady ? '✅' : '❌'} | Ready`);
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

// دالة لفحص الاتصال بـ Firebase
export async function testFirebaseConnection() {
  try {
    const { auth, db } = require('./config');
    
    console.log('Testing Firebase connection...');
    
    // اختبار Auth
    if (auth) {
      console.log('✅ Auth service is available');
    } else {
      console.log('❌ Auth service failed');
    }
    
    // اختبار Firestore
    if (db) {
      console.log('✅ Firestore service is available');
      
      // محاولة قراءة من Firestore
      try {
        const testDoc = await db.collection('test').doc('test').get();
        console.log('✅ Firestore read test passed');
      } catch (error) {
        console.log('⚠️ Firestore read test failed (this might be normal):', error instanceof Error ? error.message : 'Unknown error');
      }
    } else {
      console.log('❌ Firestore service failed');
    }
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
  }
} 
