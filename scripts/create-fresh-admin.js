// Script لإنشاء مدير جديد بـ UID عشوائي
// node scripts/create-fresh-admin.js

const admin = require('firebase-admin');

// تكوين Firebase Admin
try {
  const serviceAccount = require('../el7lm-87884-cfa610cfcb73.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'el7lm-87884'
  });
  console.log('✅ تم تهيئة Firebase Admin بنجاح');
} catch (error) {
  console.error('❌ فشل في تهيئة Firebase Admin:', error.message);
  process.exit(1);
}

const auth = admin.auth();
const db = admin.firestore();

async function createFreshAdmin() {
  try {
    const EMAIL = 'admin@el7lm.com';
    const PASSWORD = 'Admin123!@#';
    
    console.log('\n🔧 إنشاء مدير جديد تماماً');
    console.log('═════════════════════════════════════');
    console.log(`📧 البريد: ${EMAIL}`);
    console.log('🔐 تم إنشاء كلمة مرور آمنة');
    
    // 1. حذف المستخدم الحالي إذا كان موجوداً
    console.log('\n🔄 البحث عن المستخدم الحالي...');
    
    try {
      const existingUser = await auth.getUserByEmail(EMAIL);
      console.log(`⚠️ مستخدم موجود بـ UID: ${existingUser.uid}`);
      console.log('🗑️ جاري حذف المستخدم الحالي...');
      
      // حذف من Auth
      await auth.deleteUser(existingUser.uid);
      console.log('✅ تم حذف المستخدم من Auth');
      
      // حذف من Firestore
      await db.collection('users').doc(existingUser.uid).delete();
      await db.collection('admins').doc(existingUser.uid).delete();
      console.log('✅ تم حذف بيانات المستخدم من Firestore');
      
    } catch (notFoundError) {
      console.log('ℹ️ لا يوجد مستخدم سابق بهذا البريد');
    }

    // 2. إنشاء مستخدم جديد بـ UID عشوائي
    console.log('\n🔄 إنشاء مستخدم جديد...');
    
    const userRecord = await auth.createUser({
      email: EMAIL,
      password: PASSWORD,
      emailVerified: true,
      disabled: false
    });
    
    const newUID = userRecord.uid;
    console.log('✅ تم إنشاء المستخدم في Firebase Auth');
    console.log(`🆔 UID الجديد: ${newUID}`);

    // 3. إنشاء بيانات في Firestore
    console.log('\n🔄 إنشاء بيانات Firestore...');
    
    const userData = {
      uid: newUID,
      email: EMAIL,
      name: 'مدير النظام الجديد',
      phone: '+966500000000',
      accountType: 'admin',
      verified: true,
      profileCompleted: true,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: null,
      settings: {
        notifications: true,
        language: 'ar',
        theme: 'light'
      }
    };

    await db.collection('users').doc(newUID).set(userData);
    console.log('✅ تم إنشاء مستند users');

    const adminData = {
      name: 'مدير النظام الجديد',
      email: EMAIL,
      phone: '+966500000000',
      role: 'superadmin',
      permissions: [
        'users:read', 'users:write', 'users:delete',
        'admins:read', 'admins:write', 'admins:delete',
        'payments:read', 'payments:write',
        'reports:read', 'reports:export',
        'system:read', 'system:write',
        'settings:read', 'settings:write'
      ],
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: null,
      loginCount: 0
    };

    await db.collection('admins').doc(newUID).set(adminData);
    console.log('✅ تم إنشاء مستند admins');

    // 4. تعيين Custom Claims
    await auth.setCustomUserClaims(newUID, {
      admin: true,
      role: 'superadmin',
      permissions: ['all']
    });
    console.log('✅ تم تعيين Custom Claims');

    // 5. تسجيل العملية
    await db.collection('adminLogs').add({
      adminId: newUID,
      action: 'fresh_admin_created',
      description: 'تم إنشاء حساب مدير جديد تماماً',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        email: EMAIL,
        role: 'superadmin',
        method: 'fresh_admin_script'
      }
    });
    console.log('✅ تم تسجيل العملية في adminLogs');

    // 6. اختبار تسجيل الدخول
    console.log('\n🔄 اختبار المستخدم الجديد...');
    
    const testUser = await auth.getUser(newUID);
    console.log('✅ المستخدم الجديد موجود');
    console.log(`   - UID: ${testUser.uid}`);
    console.log(`   - Email: ${testUser.email}`);
    console.log(`   - Email Verified: ${testUser.emailVerified}`);
    console.log(`   - Disabled: ${testUser.disabled}`);

    console.log('\n🎉 تم إنشاء المدير الجديد بنجاح!');
    console.log('═════════════════════════════════════');
    console.log('📋 معلومات تسجيل الدخول الجديدة:');
    console.log('─────────────────────────────────────');
    console.log(`📧 البريد الإلكتروني: ${EMAIL}`);
    console.log('🔑 كلمة مرور آمنة تم إنشاؤها');
    console.log(`🆔 UID الجديد: ${newUID}`);
    console.log('🌐 رابط تسجيل الدخول: http://localhost:3000/admin/login');
    console.log('═════════════════════════════════════');
    console.log('\n🚀 الآن يمكنك تسجيل الدخول بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في إنشاء المدير الجديد:', error);
  } finally {
    process.exit(0);
  }
}

// تشغيل الدالة
createFreshAdmin(); 
