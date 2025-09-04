const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// تهيئة Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function systemHealthCheck() {
  console.log('🏥 بدء فحص صحة النظام الشامل...\n');

  const healthReport = {
    timestamp: new Date().toISOString(),
    overallStatus: 'unknown',
    components: {},
    issues: [],
    recommendations: []
  };

  try {
    // 1. فحص اتصال Firebase
    console.log('🔗 فحص اتصال Firebase...');
    try {
      await db.collection('users').limit(1).get();
      healthReport.components.firebase = { status: 'healthy', message: 'اتصال Firebase يعمل بشكل صحيح' };
      console.log('✅ اتصال Firebase يعمل بشكل صحيح');
    } catch (error) {
      healthReport.components.firebase = { status: 'error', message: error.message };
      healthReport.issues.push('Firebase connection failed');
      console.log('❌ خطأ في اتصال Firebase:', error.message);
    }

    // 2. فحص المجموعات الرئيسية
    console.log('\n📊 فحص المجموعات الرئيسية...');
    const collections = ['users', 'players', 'clubs', 'academies', 'agents', 'trainers', 'bulkPayments', 'subscriptions'];
    
    for (const collectionName of collections) {
      try {
        const snapshot = await db.collection(collectionName).limit(1).get();
        healthReport.components[collectionName] = {
          status: 'healthy',
          count: snapshot.size,
          message: `مجموعة ${collectionName} متاحة`
        };
        console.log(`✅ مجموعة ${collectionName}: متاحة`);
      } catch (error) {
        healthReport.components[collectionName] = {
          status: 'error',
          message: error.message
        };
        healthReport.issues.push(`${collectionName} collection error`);
        console.log(`❌ خطأ في مجموعة ${collectionName}:`, error.message);
      }
    }

    // 3. فحص الحسابات النشطة
    console.log('\n👥 فحص الحسابات النشطة...');
    try {
      const usersSnapshot = await db.collection('users').where('isActive', '==', true).get();
      const activeUsers = usersSnapshot.size;
      
      const playersSnapshot = await db.collection('players').get();
      const totalPlayers = playersSnapshot.size;
      
      healthReport.components.activeAccounts = {
        status: 'healthy',
        activeUsers,
        totalPlayers,
        message: `${activeUsers} مستخدم نشط، ${totalPlayers} لاعب`
      };
      console.log(`✅ ${activeUsers} مستخدم نشط، ${totalPlayers} لاعب`);
    } catch (error) {
      healthReport.components.activeAccounts = {
        status: 'error',
        message: error.message
      };
      healthReport.issues.push('Active accounts check failed');
      console.log('❌ خطأ في فحص الحسابات النشطة:', error.message);
    }

    // 4. فحص المدفوعات
    console.log('\n💳 فحص المدفوعات...');
    try {
      const paymentsSnapshot = await db.collection('bulkPayments').get();
      const totalPayments = paymentsSnapshot.size;
      
      const completedPayments = paymentsSnapshot.docs.filter(doc => 
        doc.data().status === 'completed'
      ).length;
      
      healthReport.components.payments = {
        status: 'healthy',
        totalPayments,
        completedPayments,
        message: `${totalPayments} مدفوعات، ${completedPayments} مكتملة`
      };
      console.log(`✅ ${totalPayments} مدفوعات، ${completedPayments} مكتملة`);
    } catch (error) {
      healthReport.components.payments = {
        status: 'error',
        message: error.message
      };
      healthReport.issues.push('Payments check failed');
      console.log('❌ خطأ في فحص المدفوعات:', error.message);
    }

    // 5. فحص الاشتراكات
    console.log('\n📋 فحص الاشتراكات...');
    try {
      const subscriptionsSnapshot = await db.collection('subscriptions').get();
      const totalSubscriptions = subscriptionsSnapshot.size;
      
      const activeSubscriptions = subscriptionsSnapshot.docs.filter(doc => 
        doc.data().status === 'active'
      ).length;
      
      healthReport.components.subscriptions = {
        status: 'healthy',
        totalSubscriptions,
        activeSubscriptions,
        message: `${totalSubscriptions} اشتراك، ${activeSubscriptions} نشط`
      };
      console.log(`✅ ${totalSubscriptions} اشتراك، ${activeSubscriptions} نشط`);
    } catch (error) {
      healthReport.components.subscriptions = {
        status: 'error',
        message: error.message
      };
      healthReport.issues.push('Subscriptions check failed');
      console.log('❌ خطأ في فحص الاشتراكات:', error.message);
    }

    // 6. فحص التكرارات
    console.log('\n🔍 فحص التكرارات...');
    try {
      const emailDuplicates = await checkEmailDuplicates();
      const phoneDuplicates = await checkPhoneDuplicates();
      
      if (emailDuplicates.length === 0 && phoneDuplicates.length === 0) {
        healthReport.components.duplicates = {
          status: 'healthy',
          message: 'لا توجد تكرارات'
        };
        console.log('✅ لا توجد تكرارات');
      } else {
        healthReport.components.duplicates = {
          status: 'warning',
          emailDuplicates: emailDuplicates.length,
          phoneDuplicates: phoneDuplicates.length,
          message: `${emailDuplicates.length} تكرار بالبريد، ${phoneDuplicates.length} تكرار بالهاتف`
        };
        healthReport.issues.push('Duplicate accounts found');
        console.log(`⚠️ ${emailDuplicates.length} تكرار بالبريد، ${phoneDuplicates.length} تكرار بالهاتف`);
      }
    } catch (error) {
      healthReport.components.duplicates = {
        status: 'error',
        message: error.message
      };
      healthReport.issues.push('Duplicates check failed');
      console.log('❌ خطأ في فحص التكرارات:', error.message);
    }

    // 7. فحص البيانات المفقودة
    console.log('\n🔍 فحص البيانات المفقودة...');
    try {
      const missingData = await checkMissingData();
      
      if (missingData.length === 0) {
        healthReport.components.missingData = {
          status: 'healthy',
          message: 'جميع البيانات مكتملة'
        };
        console.log('✅ جميع البيانات مكتملة');
      } else {
        healthReport.components.missingData = {
          status: 'warning',
          count: missingData.length,
          message: `${missingData.length} حساب يحتاج بيانات إضافية`
        };
        healthReport.issues.push('Missing data found');
        console.log(`⚠️ ${missingData.length} حساب يحتاج بيانات إضافية`);
      }
    } catch (error) {
      healthReport.components.missingData = {
        status: 'error',
        message: error.message
      };
      healthReport.issues.push('Missing data check failed');
      console.log('❌ خطأ في فحص البيانات المفقودة:', error.message);
    }

    // 8. تحديد الحالة العامة
    const errorComponents = Object.values(healthReport.components).filter(
      comp => comp.status === 'error'
    ).length;
    
    const warningComponents = Object.values(healthReport.components).filter(
      comp => comp.status === 'warning'
    ).length;

    if (errorComponents > 0) {
      healthReport.overallStatus = 'critical';
      healthReport.recommendations.push('إصلاح الأخطاء الحرجة أولاً');
    } else if (warningComponents > 0) {
      healthReport.overallStatus = 'warning';
      healthReport.recommendations.push('معالجة التحذيرات لتحسين الأداء');
    } else {
      healthReport.overallStatus = 'healthy';
      healthReport.recommendations.push('النظام يعمل بشكل مثالي');
    }

    // 9. إحصائيات نهائية
    console.log('\n📊 إحصائيات نهائية:');
    console.log('═══════════════════════════════════════');
    console.log(`الحالة العامة: ${healthReport.overallStatus}`);
    console.log(`المكونات الصحية: ${Object.values(healthReport.components).filter(c => c.status === 'healthy').length}`);
    console.log(`التحذيرات: ${warningComponents}`);
    console.log(`الأخطاء: ${errorComponents}`);
    console.log(`المشاكل المكتشفة: ${healthReport.issues.length}`);

    // 10. التوصيات
    console.log('\n💡 التوصيات:');
    console.log('═══════════════════════════════════════');
    healthReport.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });

    // 11. حفظ التقرير
    console.log('\n💾 حفظ تقرير صحة النظام...');
    await db.collection('system_reports').doc('system_health_check').set(healthReport);
    console.log('✅ تم حفظ تقرير صحة النظام');

    return healthReport;

  } catch (error) {
    console.error('❌ خطأ في فحص صحة النظام:', error);
    healthReport.overallStatus = 'error';
    healthReport.issues.push(error.message);
    throw error;
  }
}

// دالة فحص التكرارات بالبريد الإلكتروني
async function checkEmailDuplicates() {
  const emailMap = {};
  const collections = ['users', 'players', 'clubs', 'academies', 'agents', 'trainers'];
  
  for (const collectionName of collections) {
    try {
      const snapshot = await db.collection(collectionName).get();
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.email) {
          if (!emailMap[data.email]) {
            emailMap[data.email] = [];
          }
          emailMap[data.email].push({
            accountId: doc.id,
            collection: collectionName,
            name: data.full_name || data.name || 'غير محدد'
          });
        }
      });
    } catch (error) {
      console.error(`خطأ في فحص ${collectionName}:`, error.message);
    }
  }
  
  return Object.values(emailMap).filter(accounts => accounts.length > 1);
}

// دالة فحص التكرارات برقم الهاتف
async function checkPhoneDuplicates() {
  const phoneMap = {};
  const collections = ['users', 'players', 'clubs', 'academies', 'agents', 'trainers'];
  
  for (const collectionName of collections) {
    try {
      const snapshot = await db.collection(collectionName).get();
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.phone) {
          if (!phoneMap[data.phone]) {
            phoneMap[data.phone] = [];
          }
          phoneMap[data.phone].push({
            accountId: doc.id,
            collection: collectionName,
            name: data.full_name || data.name || 'غير محدد',
            email: data.email || 'غير محدد'
          });
        }
      });
    } catch (error) {
      console.error(`خطأ في فحص ${collectionName}:`, error.message);
    }
  }
  
  return Object.values(phoneMap).filter(accounts => accounts.length > 1);
}

// دالة فحص البيانات المفقودة
async function checkMissingData() {
  const missingData = [];
  const collections = ['users', 'players', 'clubs', 'academies', 'agents', 'trainers'];
  
  for (const collectionName of collections) {
    try {
      const snapshot = await db.collection(collectionName).get();
      snapshot.forEach(doc => {
        const data = doc.data();
        const missing = [];
        
        // فحص البيانات الأساسية المفقودة
        if (!data.email) missing.push('email');
        if (!data.full_name && !data.name) missing.push('name');
        if (!data.phone) missing.push('phone');
        
        if (missing.length > 0) {
          missingData.push({
            accountId: doc.id,
            collection: collectionName,
            missing: missing,
            name: data.full_name || data.name || 'غير محدد'
          });
        }
      });
    } catch (error) {
      console.error(`خطأ في فحص ${collectionName}:`, error.message);
    }
  }
  
  return missingData;
}

// تشغيل الفحص
if (require.main === module) {
  systemHealthCheck()
    .then(report => {
      console.log('\n🎉 تم إكمال فحص صحة النظام بنجاح!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ فشل في فحص صحة النظام:', error);
      process.exit(1);
    });
}

module.exports = { systemHealthCheck }; 
