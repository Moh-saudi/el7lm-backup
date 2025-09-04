// Script لإنشاء حساب المدير الكامل في Firebase Auth + Firestore
// node scripts/create-admin-complete.js

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

async function createCompleteAdminUser() {
  try {
    const EMAIL = 'admin@el7lm.com';
    const PASSWORD = 'Admin123!@#';
    const UID = 'QU7WtY4IoKYcXQWIFafOBKOeBYm1';
    
    console.log('\n🔧 إنشاء حساب المدير الكامل');
    console.log('══════════════════════════════════════');
    console.log(`📧 البريد: ${EMAIL}`);
    console.log('🔐 تم إنشاء كلمة مرور آمنة');
    console.log(`🆔 UID: ${UID}`);
    
    // 1. إنشاء المستخدم في Firebase Auth
    console.log('\n🔄 إنشاء المستخدم في Firebase Authentication...');
    
    try {
      // تحقق من وجود المستخدم أولاً
      try {
        await auth.getUser(UID);
        console.log('⚠️ المستخدم موجود بالفعل، سيتم تحديث البيانات...');
        
        // تحديث بيانات المستخدم الموجود
        await auth.updateUser(UID, {
          email: EMAIL,
          password: PASSWORD,
          emailVerified: true,
          disabled: false
        });
        console.log('✅ تم تحديث بيانات المستخدم في Auth');
        
      } catch (userNotFoundError) {
        // إنشاء مستخدم جديد
        await auth.createUser({
          uid: UID,
          email: EMAIL,
          password: PASSWORD,
          emailVerified: true,
          disabled: false
        });
        console.log('✅ تم إنشاء المستخدم في Firebase Auth');
      }
      
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log('⚠️ البريد الإلكتروني مستخدم مسبقاً، سيتم تحديث كلمة المرور...');
        
        // الحصول على المستخدم بالإيميل وتحديث كلمة المرور
        const userRecord = await auth.getUserByEmail(EMAIL);
        await auth.updateUser(userRecord.uid, {
          password: PASSWORD
        });
        console.log('✅ تم تحديث كلمة المرور للمستخدم الموجود');
      } else {
        throw error;
      }
    }

    // 2. إنشاء/تحديث مستند في users collection
    console.log('\n🔄 إنشاء بيانات في Firestore...');
    
    const userData = {
      uid: UID,
      email: EMAIL,
      name: 'مدير النظام الرئيسي',
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

    await db.collection('users').doc(UID).set(userData, { merge: true });
    console.log('✅ تم إنشاء/تحديث مستند users');

    // 3. إنشاء/تحديث مستند في admins collection
    const adminData = {
      name: 'مدير النظام الرئيسي',
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

    await db.collection('admins').doc(UID).set(adminData, { merge: true });
    console.log('✅ تم إنشاء/تحديث مستند admins');

    // 4. تسجيل العملية في adminLogs
    await db.collection('adminLogs').add({
      adminId: UID,
      action: 'admin_account_created',
      description: 'تم إنشاء/تحديث حساب المدير الرئيسي',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        email: EMAIL,
        role: 'superadmin',
        method: 'admin_script'
      }
    });
    console.log('✅ تم تسجيل العملية في adminLogs');

    // 5. إنشاء Custom Claims للمستخدم
    await auth.setCustomUserClaims(UID, {
      admin: true,
      role: 'superadmin',
      permissions: ['all']
    });
    console.log('✅ تم تعيين Custom Claims للمستخدم');

    console.log('\n🎉 تم إنشاء حساب المدير بنجاح!');
    console.log('══════════════════════════════════════');
    console.log('📋 معلومات تسجيل الدخول:');
    console.log('──────────────────────────────────────');
    console.log(`📧 البريد الإلكتروني: ${EMAIL}`);
    console.log(`🔑 كلمة المرور: ${PASSWORD}`);
    console.log(`🆔 UID: ${UID}`);
    console.log('🌐 رابط تسجيل الدخول: http://localhost:3000/admin/login');
    console.log('══════════════════════════════════════');
    console.log('\n📝 الخطوات التالية:');
    console.log('1. ادخل للأدمن بانل باستخدام البيانات أعلاه');
    console.log('2. تحقق من صحة الصلاحيات');
    console.log('3. استمتع بالنظام الإداري! 🚀');

  } catch (error) {
    console.error('❌ خطأ في إنشاء حساب المدير:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// تشغيل الدالة
createCompleteAdminUser(); 
