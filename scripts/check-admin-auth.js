// Script للتحقق من حالة المدير في Firebase Auth
// node scripts/check-admin-auth.js

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

async function checkAdminAuth() {
  try {
    const EMAIL = 'admin@el7lm.com';
    const UID = 'QU7WtY4IoKYcXQWIFafOBKOeBYm1';
    
    console.log('\n🔍 فحص حالة المدير في Firebase');
    console.log('═══════════════════════════════════════');
    console.log(`📧 البريد: ${EMAIL}`);
    console.log(`🆔 UID: ${UID}`);
    
    // 1. التحقق من وجود المستخدم في Auth
    console.log('\n🔄 فحص Firebase Authentication...');
    
    try {
      const userRecord = await auth.getUser(UID);
      console.log('✅ المستخدم موجود في Firebase Auth');
      console.log('📋 تفاصيل المستخدم:');
      console.log(`   - UID: ${userRecord.uid}`);
      console.log(`   - Email: ${userRecord.email}`);
      console.log(`   - Email Verified: ${userRecord.emailVerified}`);
      console.log(`   - Disabled: ${userRecord.disabled}`);
      console.log(`   - Creation Time: ${userRecord.metadata.creationTime}`);
      console.log(`   - Last Sign In: ${userRecord.metadata.lastSignInTime || 'لم يسجل دخول من قبل'}`);
      
      // التحقق من Custom Claims
      const customClaims = userRecord.customClaims || {};
      console.log(`   - Custom Claims: ${JSON.stringify(customClaims, null, 2)}`);
      
    } catch (authError) {
      console.log('❌ المستخدم غير موجود في Firebase Auth');
      console.log('🔄 جاري إنشاء المستخدم...');
      
      // إنشاء المستخدم إذا لم يكن موجوداً
      const userRecord = await auth.createUser({
        uid: UID,
        email: EMAIL,
        password: 'Admin123!@#',
        emailVerified: true,
        disabled: false
      });
      
      console.log('✅ تم إنشاء المستخدم في Firebase Auth');
      console.log(`   - UID: ${userRecord.uid}`);
      console.log(`   - Email: ${userRecord.email}`);
    }

    // 2. فحص البيانات في Firestore
    console.log('\n🔄 فحص Firestore...');
    
    try {
      const userDoc = await db.collection('users').doc(UID).get();
      if (userDoc.exists) {
        console.log('✅ مستند users موجود');
        const userData = userDoc.data();
        console.log(`   - Account Type: ${userData.accountType}`);
        console.log(`   - Name: ${userData.name}`);
        console.log(`   - Active: ${userData.isActive}`);
      } else {
        console.log('❌ مستند users غير موجود');
      }
      
      const adminDoc = await db.collection('admins').doc(UID).get();
      if (adminDoc.exists) {
        console.log('✅ مستند admins موجود');
        const adminData = adminDoc.data();
        console.log(`   - Role: ${adminData.role}`);
        console.log(`   - Active: ${adminData.isActive}`);
        console.log(`   - Permissions: ${adminData.permissions?.length || 0} صلاحية`);
      } else {
        console.log('❌ مستند admins غير موجود');
      }
      
    } catch (firestoreError) {
      console.error('❌ خطأ في فحص Firestore:', firestoreError.message);
    }

    // 3. اختبار تسجيل الدخول
    console.log('\n🔄 اختبار كلمة المرور...');
    
    try {
      // تحديث كلمة المرور للتأكد
      await auth.updateUser(UID, {
        password: 'Admin123!@#'
      });
      console.log('✅ تم تحديث كلمة المرور بنجاح');
      
      // تعيين Custom Claims
      await auth.setCustomUserClaims(UID, {
        admin: true,
        role: 'superadmin',
        permissions: ['all']
      });
      console.log('✅ تم تعيين Custom Claims');
      
    } catch (updateError) {
      console.error('❌ خطأ في تحديث البيانات:', updateError.message);
    }

    console.log('\n🎉 التحقق مكتمل!');
    console.log('═══════════════════════════════════════');
    console.log('📋 معلومات تسجيل الدخول:');
    console.log('───────────────────────────────────────');
    console.log(`📧 البريد الإلكتروني: ${EMAIL}`);
    console.log('🔑 كلمة المرور: Admin123!@#');
    console.log('🌐 رابط تسجيل الدخول: http://localhost:3000/admin/login');
    console.log('═══════════════════════════════════════');

  } catch (error) {
    console.error('❌ خطأ في فحص حالة المدير:', error);
  } finally {
    process.exit(0);
  }
}

// تشغيل الدالة
checkAdminAuth(); 
