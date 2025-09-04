const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// تهيئة Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkAccountDuplicates() {
  console.log('🔍 بدء فحص التكرارات بين المجموعات...\n');

  const collections = ['users', 'players', 'clubs', 'academies', 'agents', 'trainers'];
  const allAccounts = {};
  const duplicates = [];
  const emailMap = {};
  const phoneMap = {};

  try {
    // 1. جمع جميع الحسابات من جميع المجموعات
    console.log('📊 جلب البيانات من جميع المجموعات...');
    
    for (const collectionName of collections) {
      console.log(`\n🔍 فحص مجموعة: ${collectionName}`);
      
      try {
        const snapshot = await db.collection(collectionName).get();
        console.log(`✅ تم جلب ${snapshot.size} حساب من ${collectionName}`);
        
        snapshot.forEach(doc => {
          const data = doc.data();
          const accountId = doc.id;
          
          // حفظ البيانات مع معرف المجموعة
          allAccounts[accountId] = {
            ...data,
            collection: collectionName,
            documentId: accountId
          };

          // فحص التكرار بالبريد الإلكتروني
          if (data.email) {
            if (!emailMap[data.email]) {
              emailMap[data.email] = [];
            }
            emailMap[data.email].push({
              accountId,
              collection: collectionName,
              name: data.full_name || data.name || 'غير محدد'
            });
          }

          // فحص التكرار برقم الهاتف
          if (data.phone) {
            if (!phoneMap[data.phone]) {
              phoneMap[data.phone] = [];
            }
            phoneMap[data.phone].push({
              accountId,
              collection: collectionName,
              name: data.full_name || data.name || 'غير محدد',
              email: data.email || 'غير محدد'
            });
          }
        });
      } catch (error) {
        console.error(`❌ خطأ في جلب مجموعة ${collectionName}:`, error.message);
      }
    }

    // 2. فحص التكرارات بالبريد الإلكتروني
    console.log('\n📧 فحص التكرارات بالبريد الإلكتروني...');
    let emailDuplicates = 0;
    
    for (const [email, accounts] of Object.entries(emailMap)) {
      if (accounts.length > 1) {
        emailDuplicates++;
        console.log(`\n⚠️ تكرار بالبريد الإلكتروني: ${email}`);
        accounts.forEach(account => {
          console.log(`   - ${account.name} (${account.collection})`);
        });
        
        duplicates.push({
          type: 'email',
          value: email,
          accounts: accounts
        });
      }
    }

    // 3. فحص التكرارات برقم الهاتف
    console.log('\n📱 فحص التكرارات برقم الهاتف...');
    let phoneDuplicates = 0;
    
    for (const [phone, accounts] of Object.entries(phoneMap)) {
      if (accounts.length > 1) {
        phoneDuplicates++;
        console.log(`\n⚠️ تكرار برقم الهاتف: ${phone}`);
        accounts.forEach(account => {
          console.log(`   - ${account.name} (${account.collection}) - ${account.email}`);
        });
        
        duplicates.push({
          type: 'phone',
          value: phone,
          accounts: accounts
        });
      }
    }

    // 4. فحص التكرارات بنفس المعرف
    console.log('\n🆔 فحص التكرارات بنفس المعرف...');
    let idDuplicates = 0;
    const idMap = {};
    
    for (const [accountId, accountData] of Object.entries(allAccounts)) {
      if (!idMap[accountId]) {
        idMap[accountId] = [];
      }
      idMap[accountId].push({
        collection: accountData.collection,
        name: accountData.full_name || accountData.name || 'غير محدد',
        email: accountData.email || 'غير محدد'
      });
    }
    
    for (const [accountId, accounts] of Object.entries(idMap)) {
      if (accounts.length > 1) {
        idDuplicates++;
        console.log(`\n⚠️ تكرار بنفس المعرف: ${accountId}`);
        accounts.forEach(account => {
          console.log(`   - ${account.name} (${account.collection}) - ${account.email}`);
        });
        
        duplicates.push({
          type: 'id',
          value: accountId,
          accounts: accounts
        });
      }
    }

    // 5. إحصائيات شاملة
    console.log('\n📊 إحصائيات شاملة:');
    console.log('═══════════════════════════════════════');
    
    for (const collectionName of collections) {
      const collectionAccounts = Object.values(allAccounts).filter(
        account => account.collection === collectionName
      );
      console.log(`${collectionName}: ${collectionAccounts.length} حساب`);
    }
    
    console.log('\n📈 إحصائيات التكرارات:');
    console.log('═══════════════════════════════════════');
    console.log(`تكرارات البريد الإلكتروني: ${emailDuplicates}`);
    console.log(`تكرارات رقم الهاتف: ${phoneDuplicates}`);
    console.log(`تكرارات المعرف: ${idDuplicates}`);
    console.log(`إجمالي التكرارات: ${duplicates.length}`);

    // 6. تحليل أنواع الحسابات
    console.log('\n🎯 تحليل أنواع الحسابات:');
    console.log('═══════════════════════════════════════');
    
    const accountTypes = {};
    for (const account of Object.values(allAccounts)) {
      const type = account.accountType || 'غير محدد';
      accountTypes[type] = (accountTypes[type] || 0) + 1;
    }
    
    for (const [type, count] of Object.entries(accountTypes)) {
      console.log(`${type}: ${count} حساب`);
    }

    // 7. فحص الحسابات النشطة
    console.log('\n✅ فحص الحسابات النشطة:');
    console.log('═══════════════════════════════════════');
    
    const activeAccounts = Object.values(allAccounts).filter(
      account => account.isActive !== false && account.verified !== false
    );
    console.log(`الحسابات النشطة: ${activeAccounts.length}`);
    
    const inactiveAccounts = Object.values(allAccounts).filter(
      account => account.isActive === false || account.verified === false
    );
    console.log(`الحسابات غير النشطة: ${inactiveAccounts.length}`);

    // 8. توصيات
    console.log('\n💡 التوصيات:');
    console.log('═══════════════════════════════════════');
    
    if (duplicates.length === 0) {
      console.log('✅ لا توجد تكرارات - النظام يعمل بشكل مثالي!');
    } else {
      console.log('⚠️ تم العثور على تكرارات:');
      console.log('1. راجع التكرارات المذكورة أعلاه');
      console.log('2. حدد الحساب الصحيح واحذف التكرارات');
      console.log('3. تأكد من تحديث جميع المراجع');
    }

    // 9. حفظ التقرير
    const report = {
      timestamp: new Date().toISOString(),
      totalAccounts: Object.keys(allAccounts).length,
      duplicates: duplicates,
      statistics: {
        emailDuplicates,
        phoneDuplicates,
        idDuplicates,
        totalDuplicates: duplicates.length
      },
      accountTypes,
      activeAccounts: activeAccounts.length,
      inactiveAccounts: inactiveAccounts.length
    };

    console.log('\n💾 حفظ التقرير...');
    await db.collection('system_reports').doc('account_duplicates_check').set(report);
    console.log('✅ تم حفظ التقرير في قاعدة البيانات');

    return report;

  } catch (error) {
    console.error('❌ خطأ في فحص التكرارات:', error);
    throw error;
  }
}

// تشغيل الفحص
if (require.main === module) {
  checkAccountDuplicates()
    .then(report => {
      console.log('\n🎉 تم إكمال فحص التكرارات بنجاح!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ فشل في فحص التكرارات:', error);
      process.exit(1);
    });
}

module.exports = { checkAccountDuplicates }; 
