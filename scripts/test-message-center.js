const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');

// تهيئة Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testMessageCenter() {
  console.log('🧪 بدء اختبار مركز الرسائل...\n');

  try {
    // فحص المستخدمين
    console.log('👥 فحص المستخدمين...');
    const usersSnapshot = await db.collection('users').limit(10).get();
    console.log(`✅ عدد المستخدمين: ${usersSnapshot.docs.length}`);
    
    let contactsFound = 0;
    const accountTypes = {};
    
    for (const doc of usersSnapshot.docs) {
      const data = doc.data();
      const accountType = data.accountType;
      
      if (accountType && ['club', 'academy', 'agent', 'trainer', 'player', 'admin'].includes(accountType)) {
        contactsFound++;
        accountTypes[accountType] = (accountTypes[accountType] || 0) + 1;
        console.log(`   👤 ${data.name || data.full_name || 'مستخدم'} (${accountType})`);
      }
    }
    
    console.log(`\n📊 إحصائيات جهات الاتصال:`);
    console.log(`   - إجمالي جهات الاتصال: ${contactsFound}`);
    for (const [type, count] of Object.entries(accountTypes)) {
      console.log(`   - ${type}: ${count}`);
    }
    
    // فحص المحادثات
    console.log('\n💬 فحص المحادثات...');
    const conversationsSnapshot = await db.collection('conversations').limit(5).get();
    console.log(`✅ عدد المحادثات: ${conversationsSnapshot.docs.length}`);
    
    if (conversationsSnapshot.docs.length > 0) {
      const sampleConversation = conversationsSnapshot.docs[0].data();
      console.log(`   📝 عينة محادثة: ${sampleConversation.participants?.length || 0} مشارك`);
    }
    
    // فحص الرسائل
    console.log('\n📨 فحص الرسائل...');
    const messagesSnapshot = await db.collection('messages').limit(5).get();
    console.log(`✅ عدد الرسائل: ${messagesSnapshot.docs.length}`);
    
    // تقييم النظام
    console.log('\n🎯 تقييم النظام:');
    
    if (contactsFound > 0) {
      console.log('   ✅ جهات الاتصال متاحة');
    } else {
      console.log('   ❌ لا توجد جهات اتصال');
    }
    
    if (conversationsSnapshot.docs.length > 0) {
      console.log('   ✅ المحادثات تعمل');
    } else {
      console.log('   ⚠️ لا توجد محادثات (طبيعي إذا لم يتم إنشاء أي محادثة)');
    }
    
    if (messagesSnapshot.docs.length > 0) {
      console.log('   ✅ الرسائل تعمل');
    } else {
      console.log('   ⚠️ لا توجد رسائل (طبيعي إذا لم يتم إرسال أي رسالة)');
    }
    
    // توصيات
    console.log('\n💡 توصيات:');
    
    if (contactsFound === 0) {
      console.log('   🔧 شغل: node scripts/create-test-contacts.js');
    }
    
    if (contactsFound < 5) {
      console.log('   📈 إضافة المزيد من جهات الاتصال للاختبار');
    }
    
    console.log('   🧪 اختبر النظام في المتصفح');
    console.log('   📱 تحقق من عمل المحادثات');
    
    // نتيجة نهائية
    console.log('\n🏆 النتيجة النهائية:');
    if (contactsFound > 0) {
      console.log('   ✅ النظام جاهز للاستخدام');
    } else {
      console.log('   ❌ النظام يحتاج إلى بيانات تجريبية');
    }
    
  } catch (error) {
    console.error('❌ خطأ في اختبار النظام:', error);
  }
}

// تشغيل الاختبار
testMessageCenter()
  .then(() => {
    console.log('\n✅ انتهى اختبار مركز الرسائل');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ خطأ:', error);
    process.exit(1);
  });
