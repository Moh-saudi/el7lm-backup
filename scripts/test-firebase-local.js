#!/usr/bin/env node

/**
 * Script لاختبار Firebase محلياً
 * يستخدم للتحقق من اتصال Firebase قبل النشر
 */

require('dotenv').config({ path: '.env.local' });

console.log('🧪 Testing Firebase connection locally...\n');

// محاكاة بيئة production
process.env.NODE_ENV = 'production';

try {
  // استيراد Firebase Admin
  const { initializeFirebaseAdmin, getAdminDb, isFirebaseAdminAvailable } = require('../src/lib/firebase/admin-safe');
  
  console.log('🔧 Initializing Firebase Admin...');
  
  // محاولة تهيئة Firebase Admin
  const success = initializeFirebaseAdmin();
  
  if (success) {
    console.log('✅ Firebase Admin initialized successfully');
    
    // التحقق من الاتصال
    if (isFirebaseAdminAvailable()) {
      console.log('✅ Firebase Admin is available');
      
      try {
        // محاولة الوصول إلى Firestore
        const db = getAdminDb();
        console.log('✅ Firestore connection successful');
        
        // اختبار بسيط للقراءة
        console.log('📖 Testing Firestore read operation...');
        const testDoc = await db.collection('test').doc('connection-test').get();
        console.log('✅ Firestore read test completed');
        
      } catch (error) {
        console.log('⚠️  Firestore connection test failed:', error.message);
        console.log('This might be normal if the test collection does not exist');
      }
      
    } else {
      console.log('❌ Firebase Admin is not available');
    }
    
  } else {
    console.log('❌ Firebase Admin initialization failed');
  }
  
  // عرض حالة Firebase Admin
  const status = require('../src/lib/firebase/admin-safe').getFirebaseAdminStatus();
  console.log('\n📊 Firebase Admin Status:');
  console.log('Is Initialized:', status.isInitialized);
  console.log('Has App:', status.hasApp);
  console.log('Has Firestore:', status.hasFirestore);
  console.log('Error:', status.error || 'None');
  console.log('Environment Variables:');
  console.log('  Project ID:', status.environmentVariables.projectId ? '✅ Set' : '❌ Missing');
  console.log('  Private Key:', status.environmentVariables.privateKey ? '✅ Set' : '❌ Missing');
  console.log('  Client Email:', status.environmentVariables.clientEmail ? '✅ Set' : '❌ Missing');
  
} catch (error) {
  console.error('❌ Error during Firebase test:', error.message);
  console.error('Stack:', error.stack);
}

console.log('\n✨ Firebase test completed!'); 
