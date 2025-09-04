// Script لإعداد المدير في Firebase
// يجب أن يكون لديك Firebase Admin SDK مُثبت
// node scripts/setup-admin-firebase.js

const admin = require('firebase-admin');

// تكوين Firebase Admin باستخدام ملف المفتاح الموجود
try {
  const serviceAccount = require('../el7lm-87884-cfa610cfcb73.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'el7lm-87884'
  });
  console.log('✅ تم تهيئة Firebase Admin بنجاح باستخدام Service Account');
} catch (error) {
  console.error('❌ فشل في تهيئة Firebase Admin:', error.message);
  process.exit(1);
}

const db = admin.firestore();

async function setupAdminUser() {
  try {
    const UID = 'QU7WtY4IoKYcXQWIFafOBKOeBYm1';
    
    console.log('\n🔧 إعداد حساب المدير في Firebase');
    console.log('──────────────────────────────────────');
    console.log(`📝 استخدام UID: ${UID}`);
    
    console.log('\n🔄 جاري إعداد بيانات المدير...');

    // إنشاء مستند في users collection
    const userData = {
      uid: UID,
      email: 'admin@el7lm.com',
      name: 'مدير النظام',
      phone: '+966500000000',
      accountType: 'admin',
      verified: true,
      profileCompleted: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(UID).set(userData);
    console.log('✅ تم إنشاء مستند في users collection');

    // إنشاء مستند في admins collection
    const adminData = {
      name: 'مدير النظام',
      email: 'admin@el7lm.com',
      phone: '+966500000000',
      role: 'superadmin',
      permissions: ['all'],
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: null
    };

    await db.collection('admins').doc(UID).set(adminData);
    console.log('✅ تم إنشاء مستند في admins collection');

    // تسجيل العملية في adminLogs
    await db.collection('adminLogs').add({
      adminId: UID,
      action: 'admin_setup',
      description: 'تم إعداد حساب مدير جديد عبر setup script',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        email: 'admin@el7lm.com',
        role: 'superadmin'
      }
    });

    console.log('✅ تم تسجيل العملية في adminLogs');
    console.log('\n🎉 تم إعداد حساب المدير بنجاح!');
    console.log('──────────────────────────────────────');
    console.log('📧 البريد الإلكتروني: admin@el7lm.com');
    console.log('🔑 كلمة المرور: Admin123!@#');
    console.log('🌐 رابط تسجيل الدخول: http://localhost:3003/admin/login');
    console.log('──────────────────────────────────────');
    console.log('\n📋 الخطوات التالية:');
    console.log('1. حدث Firestore Rules من ملف: firestore-admin-rules.txt');
    console.log('2. ادخل للأدمن بانل على الرابط أعلاه');
    console.log('3. استمتع بالنظام الإداري الشامل! 🚀');

  } catch (error) {
    console.error('❌ خطأ في إعداد المدير:', error);
    process.exit(1);
  }
}

// تشغيل الدالة
setupAdminUser(); 
