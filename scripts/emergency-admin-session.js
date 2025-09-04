// Script طوارئ لإنشاء admin session مباشرة
// node scripts/emergency-admin-session.js

const admin = require('firebase-admin');

// تكوين Firebase Admin
try {
  const serviceAccount = require('../el7lm-87884-cfa610cfcb73.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'el7lm-87884'
  });
  console.log('✅ تم تهيئة Firebase Admin للطوارئ');
} catch (error) {
  console.error('❌ فشل في تهيئة Firebase Admin:', error.message);
  process.exit(1);
}

const auth = admin.auth();
const db = admin.firestore();

async function createEmergencyAdminSession() {
  try {
    const EMAIL = 'admin@el7lm.com';
    
    console.log('\n🚨 إنشاء جلسة طوارئ للأدمن');
    console.log('═══════════════════════════════════════');
    
    // 1. البحث عن المستخدم
    console.log('🔍 البحث عن المستخدم...');
    let userRecord;
    
    try {
      userRecord = await auth.getUserByEmail(EMAIL);
      console.log(`✅ تم العثور على المستخدم: ${userRecord.uid}`);
    } catch (notFound) {
      console.log('❌ المستخدم غير موجود، سيتم إنشاؤه...');
      
      userRecord = await auth.createUser({
        email: EMAIL,
        password: 'Admin123!@#',
        emailVerified: true,
        disabled: false
      });
      console.log(`✅ تم إنشاء المستخدم: ${userRecord.uid}`);
    }

    // 2. إنشاء Custom Token للوصول المباشر
    console.log('\n🔑 إنشاء Custom Token...');
    
    const customClaims = {
      admin: true,
      role: 'superadmin',
      permissions: ['all'],
      emergency: true,
      timestamp: Date.now()
    };
    
    // تعيين Custom Claims
    await auth.setCustomUserClaims(userRecord.uid, customClaims);
    console.log('✅ تم تعيين Custom Claims');
    
    // إنشاء Custom Token
    const customToken = await auth.createCustomToken(userRecord.uid, customClaims);
    console.log('✅ تم إنشاء Custom Token للطوارئ');

    // 3. إنشاء/تحديث بيانات Firestore
    console.log('\n💾 تحديث بيانات Firestore...');
    
    const userData = {
      uid: userRecord.uid,
      email: EMAIL,
      name: 'مدير النظام - وصول طوارئ',
      phone: '+966500000000',
      accountType: 'admin',
      verified: true,
      profileCompleted: true,
      isActive: true,
      emergencyAccess: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastEmergencyAccess: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(userRecord.uid).set(userData, { merge: true });
    console.log('✅ تم تحديث users collection');

    const adminData = {
      name: 'مدير النظام - وصول طوارئ',
      email: EMAIL,
      role: 'superadmin',
      permissions: ['all'],
      isActive: true,
      emergencyAccess: true,
      lastEmergencyLogin: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('admins').doc(userRecord.uid).set(adminData, { merge: true });
    console.log('✅ تم تحديث admins collection');

    // 4. تسجيل العملية
    await db.collection('adminLogs').add({
      adminId: userRecord.uid,
      action: 'emergency_access_created',
      description: 'تم إنشاء وصول طوارئ للأدمن',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        email: EMAIL,
        method: 'emergency_script',
        customToken: true
      }
    });
    console.log('✅ تم تسجيل العملية في adminLogs');

    // 5. إنشاء رابط مباشر
    const directLink = `http://localhost:3000/admin/emergency-login?token=${encodeURIComponent(customToken)}`;

    console.log('\n🎉 تم إنشاء وصول الطوارئ بنجاح!');
    console.log('═══════════════════════════════════════');
    console.log('📋 طرق الوصول المتاحة:');
    console.log('───────────────────────────────────────');
    console.log('🔐 الطريقة العادية:');
    console.log(`   📧 البريد: ${EMAIL}`);
    console.log('   🗝️ كلمة المرور: Admin123!@#');
    console.log('   🌐 الرابط: http://localhost:3000/admin/login');
    console.log('');
    console.log('🔐 الطريقة المتقدمة مع التشخيص:');
    console.log('   🌐 الرابط: http://localhost:3000/admin/login-advanced');
    console.log('');
    console.log('🚨 وصول الطوارئ المباشر:');
    console.log('   🌐 الرابط: http://localhost:3000/dashboard/admin');
    console.log('');
    console.log('🔑 Custom Token (للتطوير):');
    console.log(`   Token: ${customToken.substring(0, 50)}...`);
    console.log('═══════════════════════════════════════');
    console.log('\n💡 إذا فشلت الطرق العادية، استخدم الوصول المباشر!');

  } catch (error) {
    console.error('❌ خطأ في إنشاء وصول الطوارئ:', error);
  } finally {
    process.exit(0);
  }
}

// تشغيل الدالة
createEmergencyAdminSession(); 
