const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function testFirestoreConnection() {
  console.log('🔧 اختبار الاتصال بـ Firestore...');

  // التحقق من متغيرات البيئة
  console.log('\n📋 فحص متغيرات البيئة:');
  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL'
  ];

  let allEnvVarsSet = true;
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${varName.includes('KEY') ? '✅ Set' : value}`);
    } else {
      console.log(`❌ ${varName}: غير محدد`);
      allEnvVarsSet = false;
    }
  });

  if (!allEnvVarsSet) {
    console.error('\n❌ متغيرات البيئة غير مكتملة');
    process.exit(1);
  }

  // تهيئة Firebase Admin
  try {
    console.log('\n🔧 تهيئة Firebase Admin SDK...');
    
    // إزالة أي تهيئة سابقة
    if (admin.apps.length > 0) {
      admin.apps.forEach(app => app.delete());
    }
    
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    
    console.log('✅ تم تهيئة Firebase Admin SDK');
    
    // اختبار الاتصال بـ Firestore
    console.log('\n🔍 اختبار الاتصال بـ Firestore...');
    const db = admin.firestore();
    
    // محاولة قراءة من مجموعة test
    const testDoc = await db.collection('test').doc('connection-test').get();
    console.log('✅ الاتصال بـ Firestore يعمل بشكل صحيح');
    
    // اختبار الكتابة
    console.log('\n✍️ اختبار الكتابة إلى Firestore...');
    await db.collection('test').doc('connection-test').set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      test: true,
      message: 'Connection test successful'
    });
    console.log('✅ الكتابة إلى Firestore تعمل بشكل صحيح');
    
    // اختبار القراءة من مجموعة users
    console.log('\n👥 اختبار قراءة مجموعة users...');
    const usersSnapshot = await db.collection('users').limit(1).get();
    console.log(`✅ قراءة مجموعة users تعمل (${usersSnapshot.size} مستخدم)`);
    
    // اختبار البحث بالهاتف
    console.log('\n📱 اختبار البحث بالهاتف...');
    const phoneQuery = await db.collection('users')
      .where('phone', '==', '201017799580')
      .limit(1)
      .get();
    
    if (!phoneQuery.empty) {
      const userDoc = phoneQuery.docs[0];
      console.log('✅ البحث بالهاتف يعمل:', {
        userId: userDoc.id,
        phone: userDoc.data().phone,
        accountType: userDoc.data().accountType
      });
    } else {
      console.log('ℹ️ لم يتم العثور على مستخدم بهذا الهاتف');
    }
    
    console.log('\n🎉 جميع اختبارات Firestore نجحت!');
    
  } catch (error) {
    console.error('\n❌ خطأ في اختبار Firestore:', error.message);
    
    if (error.code === 'permission-denied') {
      console.log('\n💡 الحلول المقترحة:');
      console.log('1. تأكد من تطبيق قواعد Firestore الصحيحة');
      console.log('2. تحقق من صلاحيات Service Account');
      console.log('3. تأكد من تفعيل Firestore في المشروع');
    }
    
    process.exit(1);
  }
}

// تشغيل الاختبار
testFirestoreConnection().catch(error => {
  console.error('❌ خطأ في تشغيل الاختبار:', error);
  process.exit(1);
}); 
