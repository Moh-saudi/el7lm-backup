// تحميل المتغيرات البيئية من ملف .env.local
require('dotenv').config({ path: '.env.local' });

const admin = require('firebase-admin');

console.log('🔍 Firebase Admin SDK Debug Script');
console.log('=====================================');

// التحقق من المتغيرات البيئية
console.log('\n📋 Environment Variables Check:');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing');
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✅ Set' : '❌ Missing');
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✅ Set' : '❌ Missing');

// التحقق من تهيئة Firebase Admin
console.log('\n🔧 Firebase Admin Initialization Check:');
try {
  // التحقق من وجود تطبيق متهيأ
  const apps = admin.apps;
  console.log('Number of initialized apps:', apps.length);
  
  if (apps.length > 0) {
    console.log('✅ Firebase Admin is initialized');
    
    // محاولة الوصول إلى Firestore
    console.log('\n📊 Firestore Access Test:');
    const db = admin.firestore();
    console.log('✅ Firestore instance created');
    
    // محاولة قراءة مجموعة تجريبية
    console.log('\n🔍 Testing Firestore read access...');
    const testRef = db.collection('users');
    console.log('✅ Users collection reference created');
    
    // محاولة قراءة وثيقة واحدة
    testRef.limit(1).get()
      .then(snapshot => {
        console.log('✅ Firestore read successful');
        console.log('Documents found:', snapshot.size);
        console.log('Empty:', snapshot.empty);
      })
      .catch(error => {
        console.error('❌ Firestore read failed:');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        
        if (error.code === 'permission-denied') {
          console.log('\n💡 Permission denied - possible causes:');
          console.log('   1. Firestore Rules are too restrictive');
          console.log('   2. Admin SDK credentials are incorrect');
          console.log('   3. Project ID is wrong');
          console.log('   4. Service account lacks permissions');
        }
      });
    
  } else {
    console.log('❌ Firebase Admin is not initialized');
    console.log('💡 Check your Firebase Admin configuration');
  }
  
} catch (error) {
  console.error('❌ Firebase Admin initialization error:');
  console.error('Error code:', error.code);
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
}

// التحقق من إعدادات المشروع
console.log('\n🏗️ Project Configuration:');
console.log('Project ID:', process.env.FIREBASE_PROJECT_ID || 'Not set');
console.log('Database URL:', process.env.FIREBASE_DATABASE_URL || 'Not set');

// نصائح للتشخيص
console.log('\n💡 Troubleshooting Tips:');
console.log('1. Ensure FIREBASE_PROJECT_ID is set correctly');
console.log('2. Check FIREBASE_PRIVATE_KEY format (should include \\n)');
console.log('3. Verify FIREBASE_CLIENT_EMAIL is correct');
console.log('4. Deploy Firestore Rules: firebase deploy --only firestore:rules');
console.log('5. Check Firebase Console for service account permissions');
console.log('6. Verify project ID matches your Firebase project');

console.log('\n�� Debug complete!'); 
