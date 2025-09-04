// Script لإصلاح صلاحيات الأدمن في قاعدة البيانات
// node scripts/fix-admin-permissions.js

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

async function fixAdminPermissions() {
  try {
    console.log('\n🔧 إصلاح صلاحيات الأدمن');
    console.log('═══════════════════════════════════════');
    
    // قائمة بالإيميلات المحتملة للأدمن
    const possibleAdminEmails = [
      'admin@el7lm.com',
      'admin@peachscore.com',
      'el7lm@gmail.com';
      'admin@gmail.com'
    ];
    
    // البحث عن المستخدمين الموجودين
    console.log('🔍 البحث عن المستخدمين الموجودين...');
    
    for (const email of possibleAdminEmails) {
      try {
        const userRecord = await auth.getUserByEmail(email);
        console.log(`\n✅ تم العثور على مستخدم: ${email}`);
        console.log(`   UID: ${userRecord.uid}`);
        
        // إضافة/تحديث بيانات في users collection
        await db.collection('users').doc(userRecord.uid).set({
          uid: userRecord.uid,
          email: email,
          name: 'مدير النظام الرئيسي',
          phone: '+966500000000',
          accountType: 'admin',
          role: 'admin',
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
        }, { merge: true });
        
        console.log('✅ تم تحديث مجموعة users');
        
        // إضافة/تحديث بيانات في admins collection
        await db.collection('admins').doc(userRecord.uid).set({
          name: 'مدير النظام الرئيسي',
          email: email,
          phone: '+966500000000',
          role: 'superadmin',
          permissions: [
            'users:read', 'users:write', 'users:delete',
            'admins:read', 'admins:write', 'admins:delete',
            'payments:read', 'payments:write',
            'reports:read', 'reports:export',
            'system:read', 'system:write',
            'settings:read', 'settings:write',
            'all'
          ],
          isActive: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastLogin: null,
          loginCount: 0
        }, { merge: true });
        
        console.log('✅ تم تحديث مجموعة admins');
        
        // تعيين Custom Claims
        try {
          await auth.setCustomUserClaims(userRecord.uid, {
            admin: true,
            role: 'superadmin',
            permissions: ['all']
          });
          console.log('✅ تم تعيين Custom Claims');
        } catch (claimsError) {
          console.log('⚠️ خطأ في تعيين Custom Claims:', claimsError.message);
        }
        
        // تسجيل العملية
        await db.collection('adminLogs').add({
          adminId: userRecord.uid,
          action: 'admin_permissions_fixed',
          description: `تم إصلاح صلاحيات المدير ${email}`,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          metadata: {
            email: email,
            role: 'superadmin',
            method: 'fix_script'
          }
        });
        
        console.log('\n🎉 تم إصلاح الصلاحيات بنجاح!');
        console.log('══════════════════════════════════════');
        console.log(`📧 البريد الإلكتروني: ${email}`);
        console.log(`🆔 UID: ${userRecord.uid}`);
        console.log('🔑 كلمة المرور: Admin123!@# (إذا كانت كما تم إنشاؤها)');
        console.log('🌐 رابط تسجيل الدخول: http://localhost:3000/admin/login');
        console.log('══════════════════════════════════════');
        
      } catch (userError) {
        if (userError.code === 'auth/user-not-found') {
          console.log(`❌ لم يتم العثور على: ${email}`);
        } else {
          console.error(`❌ خطأ في معالجة ${email}:`, userError.message);
        }
      }
    }
    
    // إنشاء مستخدم جديد إذا لم يوجد أي مستخدم
    console.log('\n🔄 إنشاء مستخدم أدمن احتياطي...');
    
    const adminEmail = 'admin@el7lm.com';
    const adminPassword = 'Admin123!@#';
    
    try {
      // تحقق من عدم وجود المستخدم
      await auth.getUserByEmail(adminEmail);
      console.log('⚠️ المستخدم الأساسي موجود بالفعل');
    } catch (notFoundError) {
      if (notFoundError.code === 'auth/user-not-found') {
        // إنشاء مستخدم جديد
        const newUser = await auth.createUser({
          email: adminEmail,
          password: adminPassword,
          emailVerified: true,
          disabled: false,
          displayName: 'مدير النظام الرئيسي'
        });
        
        console.log(`✅ تم إنشاء مستخدم جديد: ${newUser.uid}`);
        
        // إضافة البيانات في Firestore
        await db.collection('users').doc(newUser.uid).set({
          uid: newUser.uid,
          email: adminEmail,
          name: 'مدير النظام الرئيسي',
          phone: '+966500000000',
          accountType: 'admin',
          role: 'admin',
          verified: true,
          profileCompleted: true,
          isActive: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        await db.collection('admins').doc(newUser.uid).set({
          name: 'مدير النظام الرئيسي',
          email: adminEmail,
          role: 'superadmin',
          permissions: ['all'],
          isActive: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        await auth.setCustomUserClaims(newUser.uid, {
          admin: true,
          role: 'superadmin',
          permissions: ['all']
        });
        
        console.log('\n🎉 تم إنشاء مستخدم أدمن جديد!');
        console.log('══════════════════════════════════════');
        console.log(`📧 البريد: ${adminEmail}`);
                    console.log('🔑 تم إنشاء كلمة مرور جديدة بنجاح');
        console.log(`🆔 UID: ${newUser.uid}`);
        console.log('══════════════════════════════════════');
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ عام:', error);
  } finally {
    process.exit(0);
  }
}

// تشغيل الدالة
fixAdminPermissions(); 
