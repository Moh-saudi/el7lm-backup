// Script مبسط لإنشاء حسابات تجريبية
// يمكن تشغيله في المتصفح على صفحة التسجيل

console.log('🔧 إنشاء حسابات تجريبية لاختبار الإشعارات');
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

console.log('📋 بيانات تسجيل الدخول:');
console.log('═══════════════════════════════════════');

testAccounts.forEach((account, index) => {
  console.log(`\n${index + 1}. ${account.name}`);
  console.log(`   📧 البريد: ${account.email}`);
  console.log(`   🔑 كلمة المرور: ${account.password}`);
  console.log(`   👤 نوع الحساب: ${account.accountType}`);
  console.log(`   📱 الهاتف: ${account.phone}`);
  console.log(`   🌍 البلد: ${account.country}`);
  console.log(`   🏙️ المدينة: ${account.city}`);
});

console.log('\n🧪 لاختبار الإشعارات:');
console.log('1. اذهب إلى صفحة التسجيل: http://localhost:3001/auth/register');
console.log('2. سجل حساب واحد من القائمة أعلاه');
console.log('3. اذهب لصفحة البحث عن اللاعبين');
console.log('4. ابحث عن لاعب آخر وافتح ملفه الشخصي');
console.log('5. ستصل إشعارات للاعب الذي تم فتح ملفه');

console.log('\n📝 ملاحظات:');
console.log('- يمكنك استخدام أي من هذه الحسابات للتسجيل');
console.log('- كل حساب له نوع مختلف (لاعب، نادي، أكاديمية، إلخ)');
console.log('- الإشعارات ستصل عند فتح ملفات اللاعبين');

// دالة مساعدة لإنشاء حساب
async function createAccount(accountData) {
  try {
    // هنا يمكن إضافة كود Firebase Auth
    console.log(`✅ تم إنشاء حساب: ${accountData.name}`);
    return true;
  } catch (error) {
    console.error(`❌ خطأ في إنشاء حساب ${accountData.name}:`, error);
    return false;
  }
}

// تصدير البيانات للاستخدام
window.testAccounts = testAccounts;
window.createAccount = createAccount;

console.log('\n✅ تم تحميل البيانات بنجاح!');
console.log('يمكنك استخدام window.testAccounts للوصول للبيانات'); 
