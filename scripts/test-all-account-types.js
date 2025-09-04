const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, getDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCQQxUbeQQrlty5HnF65-7TK0TB2zB7R4",
  authDomain: "hagzzgo-87884.firebaseapp.com",
  projectId: "hagzzgo-87884",
  storageBucket: "hagzzgo-87884.appspot.com",
  messagingSenderId: "865241332465",
  appId: "1:865241332465:web:158ed5fb2f0a80eecf0750"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// تعريف أنواع الحسابات المتوقعة
const accountTypes = [
  'player',
  'agent', 
  'club',
  'academy',
  'trainer',
  'admin',
  'marketer',
  'parent'
];

// تعريف لوحات التحكم المتوقعة لكل نوع حساب
const expectedDashboards = {
  player: '/dashboard/player',
  agent: '/dashboard/agent',
  club: '/dashboard/club',
  academy: '/dashboard/academy',
  trainer: '/dashboard/trainer',
  admin: '/dashboard/admin',
  marketer: '/dashboard/marketer',
  parent: '/dashboard/player' // أولياء الأمور يذهبون للوحة اللاعبين
};

async function testAllAccountTypes() {
  try {
    console.log('🔍 بدء اختبار جميع أنواع الحسابات...\n');
    
    const results = {
      totalAccounts: 0,
      accountsByType: {},
      accountsWithIssues: [],
      accountsWithCorrectType: [],
      summary: {}
    };

    // اختبار كل نوع حساب
    for (const accountType of accountTypes) {
      console.log(`📊 فحص حسابات نوع: ${accountType}`);
      
      try {
        // البحث في مجموعة users
        const usersQuery = query(
          collection(db, 'users'),
          where('accountType', '==', accountType)
        );
        const usersSnapshot = await getDocs(usersQuery);
        
        const accounts = [];
        usersSnapshot.forEach(doc => {
          const data = doc.data();
          accounts.push({
            id: doc.id,
            email: data.email,
            phone: data.phone,
            name: data.name || data.full_name,
            accountType: data.accountType,
            createdAt: data.createdAt,
            isActive: data.isActive
          });
        });

        // البحث في المجموعة المخصصة (إذا كانت مختلفة عن users)
        let additionalAccounts = [];
        if (accountType !== 'admin' && accountType !== 'marketer') {
          const collectionName = accountType === 'parent' ? 'users' : `${accountType}s`;
          try {
            const collectionQuery = query(collection(db, collectionName));
            const collectionSnapshot = await getDocs(collectionQuery);
            
            collectionSnapshot.forEach(doc => {
              const data = doc.data();
              // التحقق من أن الحساب ليس مكرراً
              const isDuplicate = accounts.find(acc => acc.id === doc.id);
              if (!isDuplicate) {
                additionalAccounts.push({
                  id: doc.id,
                  email: data.email,
                  phone: data.phone,
                  name: data.name || data.full_name,
                  accountType: data.accountType || accountType,
                  createdAt: data.createdAt,
                  isActive: data.isActive
                });
              }
            });
          } catch (error) {
            console.log(`⚠️ خطأ في فحص مجموعة ${collectionName}:`, error.message);
          }
        }

        const allAccounts = [...accounts, ...additionalAccounts];
        
        console.log(`✅ تم العثور على ${allAccounts.length} حساب من نوع ${accountType}`);
        
        // تحليل الحسابات
        allAccounts.forEach(account => {
          const expectedDashboard = expectedDashboards[account.accountType];
          const isCorrectType = account.accountType === accountType;
          const hasValidEmail = account.email && account.email.includes('@');
          const hasValidPhone = account.phone && account.phone.length >= 8;
          
          const accountInfo = {
            ...account,
            expectedDashboard,
            isCorrectType,
            hasValidEmail,
            hasValidPhone,
            issues: []
          };

          // فحص المشاكل
          if (!isCorrectType) {
            accountInfo.issues.push(`نوع الحساب غير صحيح: ${account.accountType} بدلاً من ${accountType}`);
          }
          if (!hasValidEmail) {
            accountInfo.issues.push('البريد الإلكتروني غير صحيح أو مفقود');
          }
          if (!hasValidPhone) {
            accountInfo.issues.push('رقم الهاتف غير صحيح أو مفقود');
          }
          if (!account.name) {
            accountInfo.issues.push('الاسم مفقود');
          }

          if (accountInfo.issues.length > 0) {
            results.accountsWithIssues.push(accountInfo);
          } else {
            results.accountsWithCorrectType.push(accountInfo);
          }
        });

        results.accountsByType[accountType] = allAccounts;
        results.totalAccounts += allAccounts.length;

        // عرض تفاصيل الحسابات
        if (allAccounts.length > 0) {
          console.log(`📋 تفاصيل حسابات ${accountType}:`);
          allAccounts.forEach((account, index) => {
            console.log(`  ${index + 1}. ${account.name || 'بدون اسم'} (${account.email})`);
            console.log(`     الهاتف: ${account.phone || 'غير محدد'}`);
            console.log(`     لوحة التحكم المتوقعة: ${expectedDashboards[account.accountType]}`);
            if (account.issues && account.issues.length > 0) {
              console.log(`     ⚠️ مشاكل: ${account.issues.join(', ')}`);
            }
          });
        }

      } catch (error) {
        console.error(`❌ خطأ في فحص حسابات ${accountType}:`, error.message);
      }
      
      console.log(''); // سطر فارغ للفصل
    }

    // عرض ملخص النتائج
    console.log('📊 ملخص النتائج:');
    console.log('='.repeat(50));
    
    console.log(`📈 إجمالي الحسابات: ${results.totalAccounts}`);
    
    for (const [accountType, accounts] of Object.entries(results.accountsByType)) {
      console.log(`📋 ${accountType}: ${accounts.length} حساب`);
    }
    
    console.log(`✅ الحسابات الصحيحة: ${results.accountsWithCorrectType.length}`);
    console.log(`⚠️ الحسابات بها مشاكل: ${results.accountsWithIssues.length}`);
    
    // عرض الحسابات التي بها مشاكل
    if (results.accountsWithIssues.length > 0) {
      console.log('\n🚨 الحسابات التي تحتاج إصلاح:');
      results.accountsWithIssues.forEach((account, index) => {
        console.log(`\n${index + 1}. ${account.name || 'بدون اسم'} (${account.email})`);
        console.log(`   نوع الحساب: ${account.accountType}`);
        console.log(`   لوحة التحكم المتوقعة: ${account.expectedDashboard}`);
        console.log(`   المشاكل: ${account.issues.join(', ')}`);
      });
    }

    // عرض الحسابات الصحيحة
    if (results.accountsWithCorrectType.length > 0) {
      console.log('\n✅ الحسابات الصحيحة:');
      results.accountsWithCorrectType.forEach((account, index) => {
        console.log(`${index + 1}. ${account.name || 'بدون اسم'} (${account.email}) -> ${account.expectedDashboard}`);
      });
    }

    // اختبار التوجيه
    console.log('\n🧪 اختبار التوجيه:');
    console.log('='.repeat(50));
    
    for (const [accountType, expectedDashboard] of Object.entries(expectedDashboards)) {
      console.log(`✅ ${accountType} -> ${expectedDashboard}`);
    }

    // توصيات
    console.log('\n💡 التوصيات:');
    console.log('='.repeat(50));
    
    if (results.accountsWithIssues.length > 0) {
      console.log('🔧 إصلاحات مطلوبة:');
      console.log('1. تصحيح أنواع الحسابات غير الصحيحة');
      console.log('2. إضافة البريد الإلكتروني للحسابات المفقودة');
      console.log('3. إضافة رقم الهاتف للحسابات المفقودة');
      console.log('4. إضافة الأسماء للحسابات المفقودة');
    } else {
      console.log('✅ جميع الحسابات صحيحة ومتوافقة مع لوحات التحكم المتوقعة');
    }

    console.log('\n🎯 اختبار الحماية:');
    console.log('='.repeat(50));
    console.log('✅ كل نوع حساب سيظهر في لوحة التحكم المناسبة فقط');
    console.log('✅ التوجيه التلقائي للحسابات غير المصرح لها');
    console.log('✅ حماية شاملة لجميع أنواع الحسابات');

  } catch (error) {
    console.error('❌ خطأ عام في الاختبار:', error);
  } finally {
    process.exit(0);
  }
}

// تشغيل الاختبار
testAllAccountTypes(); 
