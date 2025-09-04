// Script لإنشاء حسابات حقيقية لاختبار الإشعارات
// node scripts/create-test-accounts.js

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

async function createTestAccounts() {
  try {
    console.log('\n🔧 إنشاء حسابات حقيقية لاختبار الإشعارات');
    console.log('═══════════════════════════════════════');
    
    const testAccounts = [
      {
        email: 'marwan.fedail@el7lm.com',
        password: 'Marwan123!@#',
        name: 'مروان فضيل',
        accountType: 'player',
        phone: '+966501234567',
        country: 'Saudi Arabia',
        city: 'Riyadh',
        position: 'مهاجم صريح'
      },
      {
        email: 'ahmed.player@el7lm.com',
        password: 'Ahmed123!@#',
        name: 'أحمد اللاعب',
        accountType: 'player',
        phone: '+966502345678',
        country: 'Saudi Arabia',
        city: 'Jeddah',
        position: 'وسط دفاعي'
      },
      {
        email: 'mohammed.club@el7lm.com',
        password: 'Mohammed123!@#',
        name: 'محمد النادي',
        accountType: 'club',
        phone: '+966503456789',
        country: 'Saudi Arabia',
        city: 'Dammam',
        clubName: 'نادي النصر'
      },
      {
        email: 'sara.academy@el7lm.com',
        password: 'Sara123!@#',
        name: 'سارة الأكاديمية',
        accountType: 'academy',
        phone: '+966504567890',
        country: 'Saudi Arabia',
        city: 'Riyadh',
        academyName: 'أكاديمية النجوم'
      },
      {
        email: 'ali.agent@el7lm.com',
        password: 'Ali123!@#',
        name: 'علي الوكيل',
        accountType: 'agent',
        phone: '+966505678901',
        country: 'Saudi Arabia',
        city: 'Jeddah',
        agencyName: 'وكالة النجوم الرياضية'
      },
      {
        email: 'fatima.trainer@el7lm.com',
        password: 'Fatima123!@#',
        name: 'فاطمة المدرب',
        accountType: 'trainer',
        phone: '+966506789012',
        country: 'Saudi Arabia',
        city: 'Riyadh',
        specialization: 'تدريب بدني'
      }
    ];

    const createdAccounts = [];

    for (const account of testAccounts) {
      try {
        console.log(`\n🔄 إنشاء حساب: ${account.name} (${account.email})`);
        
        // إنشاء المستخدم في Firebase Auth
        const userRecord = await auth.createUser({
          email: account.email,
          password: account.password,
          displayName: account.name,
          emailVerified: true,
          disabled: false
        });

        console.log(`✅ تم إنشاء المستخدم: ${userRecord.uid}`);

        // إنشاء بيانات المستخدم في Firestore
        const userData = {
          uid: userRecord.uid,
          email: account.email,
          name: account.name,
          full_name: account.name,
          phone: account.phone,
          accountType: account.accountType,
          country: account.country,
          city: account.city,
          isActive: true,
          verified: true,
          profileCompleted: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        // إضافة بيانات خاصة حسب نوع الحساب
        if (account.accountType === 'player') {
          userData.primary_position = account.position;
          userData.nationality = 'Saudi';
        } else if (account.accountType === 'club') {
          userData.club_name = account.clubName;
        } else if (account.accountType === 'academy') {
          userData.academy_name = account.academyName;
        } else if (account.accountType === 'agent') {
          userData.agency_name = account.agencyName;
        } else if (account.accountType === 'trainer') {
          userData.specialization = account.specialization;
        }

        // حفظ في مجموعة users
        await db.collection('users').doc(userRecord.uid).set(userData);
        console.log(`✅ تم حفظ بيانات المستخدم في Firestore`);

        // حفظ في مجموعة خاصة حسب نوع الحساب
        const collectionName = account.accountType === 'player' ? 'players' : 
                             account.accountType === 'club' ? 'clubs' :
                             account.accountType === 'academy' ? 'academies' :
                             account.accountType === 'agent' ? 'agents' :
                             account.accountType === 'trainer' ? 'trainers' : 'users';

        await db.collection(collectionName).doc(userRecord.uid).set(userData);
        console.log(`✅ تم حفظ البيانات في مجموعة ${collectionName}`);

        createdAccounts.push({
          ...account,
          uid: userRecord.uid
        });

      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`⚠️ الحساب موجود بالفعل: ${account.email}`);
          
          // محاولة تحديث البيانات الموجودة
          try {
            const existingUser = await auth.getUserByEmail(account.email);
            console.log(`✅ تم العثور على المستخدم الموجود: ${existingUser.uid}`);
            
            createdAccounts.push({
              ...account,
              uid: existingUser.uid
            });
          } catch (getUserError) {
            console.log(`❌ خطأ في جلب المستخدم الموجود: ${getUserError.message}`);
          }
        } else {
          console.error(`❌ خطأ في إنشاء حساب ${account.name}:`, error.message);
        }
      }
    }

    console.log('\n🎉 تم إنشاء الحسابات بنجاح!');
    console.log('═══════════════════════════════════════');
    console.log('📋 بيانات تسجيل الدخول:');
    console.log('═══════════════════════════════════════');
    
    createdAccounts.forEach((account, index) => {
      console.log(`\n${index + 1}. ${account.name}`);
      console.log(`   📧 البريد: ${account.email}`);
      console.log(`   🔑 كلمة المرور: ${account.password}`);
      console.log(`   👤 نوع الحساب: ${account.accountType}`);
      console.log(`   🆔 UID: ${account.uid}`);
    });

    console.log('\n🧪 لاختبار الإشعارات:');
    console.log('1. سجل دخول بحساب واحد (مثل مروان اللاعب)');
    console.log('2. اذهب لصفحة البحث عن اللاعبين');
    console.log('3. ابحث عن لاعب آخر وافتح ملفه الشخصي');
    console.log('4. ستصل إشعارات للاعب الذي تم فتح ملفه');
    console.log('\n🌐 رابط تسجيل الدخول: http://localhost:3001/auth/login');

  } catch (error) {
    console.error('❌ خطأ في إنشاء الحسابات:', error);
  } finally {
    process.exit(0);
  }
}

createTestAccounts(); 
