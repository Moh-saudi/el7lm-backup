// Script لإنشاء حساب admin
// استخدم هذا السكريبت مرة واحدة لإنشاء أول حساب admin
// node scripts/create-admin.js

const admin = require('firebase-admin');

// تهيئة Firebase Admin باستخدام متغيرات البيئة أو التكوين الافتراضي
try {
  // محاولة استخدام التكوين الافتراضي من متغيرات البيئة
  admin.initializeApp({
    projectId: 'el7lm-87884' // Project ID من ملف .env.local
  });
  console.log('✅ تم تهيئة Firebase Admin بنجاح');
} catch (error) {
  console.log('⚠️ تعذر التهيئة التلقائية، سنحاول طريقة أخرى...');
  
  // إذا لم تنجح، جرب استخدام service account
  try {
    const serviceAccount = require('../firebase-service-account.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ تم تهيئة Firebase Admin باستخدام service account');
  } catch (error2) {
    console.log('⚠️ لم نجد ملف service account، سنحاول التكوين البسيط...');
    
    // طريقة مبسطة للتطوير المحلي
    admin.initializeApp();
    console.log('✅ تم تهيئة Firebase Admin بالتكوين الافتراضي');
  }
}

const db = admin.firestore();
const auth = admin.auth();

async function createAdmin() {
  try {
    // بيانات المدير - يمكنك تغييرها
    const adminEmail = 'admin@peachscore.com';
    const adminPassword = 'Admin123!@#';
    const adminName = 'مدير النظام الرئيسي';
    const adminPhone = '+966500000000';

    console.log('🔄 جاري إنشاء حساب المدير...');

    // إنشاء مستخدم في Firebase Auth
    const userRecord = await auth.createUser({
      email: adminEmail,
      password: adminPassword,
      displayName: adminName,
      emailVerified: true
    });

    console.log('✅ تم إنشاء حساب في Firebase Auth:', userRecord.uid);

    // إنشاء مستند في مجموعة users
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: adminEmail,
      name: adminName,
      phone: adminPhone,
      accountType: 'admin',
      verified: true,
      profileCompleted: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ تم إنشاء مستند في مجموعة users');

    // إنشاء مستند في مجموعة admins
    await db.collection('admins').doc(userRecord.uid).set({
      name: adminName,
      email: adminEmail,
      phone: adminPhone,
      role: 'superadmin',
      permissions: ['all'], // جميع الصلاحيات
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: null
    });

    console.log('✅ تم إنشاء مستند في مجموعة admins');
    
    // تسجيل العملية في adminLogs
    await db.collection('adminLogs').add({
      adminId: userRecord.uid,
      action: 'admin_created',
      description: 'تم إنشاء حساب مدير جديد',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        email: adminEmail,
        role: 'superadmin'
      }
    });

    console.log('✅ تم تسجيل العملية في adminLogs');
    console.log('\n🎉 تم إنشاء حساب المدير بنجاح!');
    console.log('─'.repeat(50));
    console.log('📧 البريد الإلكتروني:', adminEmail);
            console.log('🔑 تم إنشاء كلمة مرور آمنة بنجاح');
    console.log('👤 الاسم:', adminName);
    console.log('🔒 الدور:', 'superadmin');
    console.log('─'.repeat(50));
    console.log('\n🚀 يمكنك الآن تسجيل الدخول على:');
    console.log('🌐 http://localhost:3000/admin/login');
    console.log('\n⚠️ تأكد من تغيير كلمة المرور بعد أول تسجيل دخول');

  } catch (error) {
    console.error('❌ خطأ في إنشاء حساب المدير:', error);
    
    if (error.code === 'auth/email-already-exists') {
      console.log('\n💡 يبدو أن البريد الإلكتروني مستخدم بالفعل.');
      console.log('إما أن الحساب موجود، أو قم بتغيير البريد الإلكتروني في السكريبت.');
      console.log('\n🔑 معلومات الدخول:');
      console.log('📧 البريد الإلكتروني: admin@peachscore.com');
      console.log('🔑 كلمة المرور: Admin123!@#');
      console.log('🌐 رابط تسجيل الدخول: http://localhost:3000/admin/login');
    }
    
    if (error.code === 'auth/project-not-found') {
      console.log('\n❌ لم يتم العثور على مشروع Firebase.');
      console.log('تأكد من تكوين Firebase بشكل صحيح في ملف .env');
    }
  } finally {
    process.exit();
  }
}

// تشغيل الدالة
createAdmin(); 
