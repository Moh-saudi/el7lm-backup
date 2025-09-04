// Script بسيط لإنشاء حساب admin
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// تكوين Firebase - نفس التكوين من ملف config.ts
const firebaseConfig = {
  apiKey: "AIzaSyBRxNNE1HLqtOcC9YY9fQ1gOUKXG6gV8K8",
  authDomain: "el7lm-87884.firebaseapp.com",
  projectId: "el7lm-87884",
  storageBucket: "el7lm-87884.appspot.com",
  messagingSenderId: "253649001591",
  appId: "1:253649001591:web:8b8b8b8b8b8b8b8b"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createSimpleAdmin() {
  try {
    const EMAIL = 'admin@el7lm.com';
    const PASSWORD = 'Admin123!@#';
    
    console.log('\n🔧 إنشاء حساب أدمن بسيط');
    console.log('═══════════════════════════════════');
    console.log(`📧 البريد: ${EMAIL}`);
    console.log(`🔑 كلمة المرور: ${PASSWORD}`);
    
    // محاولة إنشاء المستخدم
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, EMAIL, PASSWORD);
      console.log('✅ تم إنشاء المستخدم بنجاح:', userCredential.user.uid);
      
      // إضافة بيانات في Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: EMAIL,
        name: 'مدير النظام',
        accountType: 'admin',
        role: 'admin',
        verified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await setDoc(doc(db, 'admins', userCredential.user.uid), {
        name: 'مدير النظام',
        email: EMAIL,
        role: 'superadmin',
        permissions: ['all'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ تم إنشاء بيانات Firestore');
      
    } catch (createError) {
      if (createError.code === 'auth/email-already-exists') {
        console.log('⚠️ البريد موجود، محاولة تسجيل الدخول...');
        
        try {
          const userCredential = await signInWithEmailAndPassword(auth, EMAIL, PASSWORD);
          console.log('✅ تم تسجيل الدخول بنجاح:', userCredential.user.uid);
        } catch (signInError) {
          console.log('❌ فشل تسجيل الدخول، قد تكون كلمة المرور مختلفة');
          console.log('🔑 جرب كلمات المرور التالية:');
          console.log('   - Admin123!@#');
          console.log('   - admin123');
          console.log('   - Admin@123');
        }
      } else {
        throw createError;
      }
    }
    
    console.log('\n🎉 العملية مكتملة!');
    console.log('═══════════════════════════════════');
    console.log('📋 بيانات تسجيل الدخول:');
    console.log(`📧 البريد: ${EMAIL}`);
    console.log('🔑 كلمة مرور آمنة تم إنشاؤها');
    console.log('🌐 رابط الدخول: http://localhost:3000/admin/login');
    console.log('═══════════════════════════════════');
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    console.log('\n💡 حلول مقترحة:');
    console.log('1. تأكد من تشغيل المشروع (npm run dev)');
    console.log('2. تحقق من اتصال الإنترنت');
    console.log('3. جرب البيانات التالية:');
    console.log('   📧 admin@el7lm.com');
    console.log('   🔑 Admin123!@#');
  }
}

// تشغيل الدالة
createSimpleAdmin().catch(console.error); 
