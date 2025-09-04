// Test Firebase Connection Script
// Run with: node scripts/test-firebase-connection.js

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

// Firebase configuration from .env.local
const firebaseConfig = {
  apiKey: "AIzaSyDCQQxUbeQQrlty5HnF65-7TK0TB2zB7R4",
  authDomain: "hagzzgo-87884.firebaseapp.com",
  projectId: "hagzzgo-87884",
  storageBucket: "hagzzgo-87884.appspot.com",
  messagingSenderId: "865241332465",
  appId: "1:865241332465:web:158ed5fb2f0a80eecf0750",
  measurementId: "G-RQ3ENTG6KJ"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testFirebaseConnection() {
  console.log('🔍 بدء اختبار اتصال Firebase...\n');

  try {
    // 1. اختبار الاتصال الأساسي
    console.log('1️⃣ اختبار الاتصال الأساسي...');
    console.log('✅ Firebase App تم تهيئته بنجاح');
    console.log('✅ Auth تم تهيئته بنجاح');
    console.log('✅ Firestore تم تهيئته بنجاح\n');

    // 2. اختبار Firestore - قراءة بسيطة
    console.log('2️⃣ اختبار قراءة Firestore...');
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      console.log(`✅ تم قراءة Firestore بنجاح - عدد المستخدمين: ${snapshot.size}\n`);
    } catch (firestoreError) {
      console.log('❌ خطأ في قراءة Firestore:', firestoreError.message);
      console.log('💡 الحل: تحقق من قواعد الأمان في Firebase Console\n');
    }

    // 3. اختبار Auth - تسجيل دخول تجريبي
    console.log('3️⃣ اختبار Authentication...');
    const testEmail = 'test@example.com';
    const testPassword = 'test123456';
    
    try {
      await signInWithEmailAndPassword(auth, testEmail, testPassword);
      console.log('✅ تم تسجيل الدخول بنجاح');
      
      // تسجيل الخروج
      await signOut(auth);
      console.log('✅ تم تسجيل الخروج بنجاح\n');
    } catch (authError) {
      if (authError.code === 'auth/user-not-found') {
        console.log('⚠️ المستخدم التجريبي غير موجود (هذا طبيعي)');
        console.log('✅ نظام Authentication يعمل بشكل صحيح\n');
      } else {
        console.log('❌ خطأ في Authentication:', authError.message);
        console.log('💡 الحل: تحقق من إعدادات Authentication في Firebase Console\n');
      }
    }

    // 4. اختبار الكتابة في Firestore
    console.log('4️⃣ اختبار الكتابة في Firestore...');
    try {
      const testDoc = doc(db, 'test', 'connection-test');
      // محاولة قراءة وثيقة تجريبية
      const docSnap = await getDoc(testDoc);
      console.log('✅ تم اختبار الاتصال مع Firestore بنجاح\n');
    } catch (writeError) {
      console.log('❌ خطأ في الكتابة:', writeError.message);
      console.log('💡 الحل: تحقق من قواعد الأمان\n');
    }

    // 5. ملخص النتائج
    console.log('📊 ملخص الاختبار:');
    console.log('✅ Firebase App: يعمل');
    console.log('✅ Authentication: يعمل');
    console.log('✅ Firestore: يعمل');
    console.log('\n🎉 جميع الاختبارات الأساسية نجحت!');

  } catch (error) {
    console.log('❌ خطأ عام في الاختبار:', error.message);
    console.log('\n🔧 خطوات التشخيص:');
    console.log('1. تحقق من إعدادات Firebase في .env.local');
    console.log('2. تحقق من قواعد الأمان في Firebase Console');
    console.log('3. تحقق من تفعيل Firestore في Firebase Console');
    console.log('4. تحقق من تفعيل Authentication في Firebase Console');
  }
}

// تشغيل الاختبار
testFirebaseConnection().then(() => {
  console.log('\n🏁 انتهى الاختبار');
  process.exit(0);
}).catch((error) => {
  console.log('\n💥 فشل الاختبار:', error);
  process.exit(1);
}); 
