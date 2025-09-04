const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');

// تهيئة Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function debugMessageCenter() {
  console.log('🔍 بدء فحص مركز الرسائل...\n');

  try {
    // فحص المجموعات المختلفة
    const collections = ['users', 'clubs', 'academies', 'agents', 'trainers', 'players', 'admins'];
    
    for (const collectionName of collections) {
      console.log(`📋 فحص مجموعة ${collectionName}...`);
      
      try {
        const snapshot = await db.collection(collectionName).limit(5).get();
        console.log(`✅ ${collectionName}: ${snapshot.docs.length} مستند`);
        
        if (snapshot.docs.length > 0) {
          const sampleDoc = snapshot.docs[0].data();
          console.log(`   📄 عينة من البيانات:`, {
            id: snapshot.docs[0].id,
            name: sampleDoc.name || sampleDoc.full_name || sampleDoc.displayName || 'غير محدد',
            accountType: sampleDoc.accountType || 'غير محدد',
            isActive: sampleDoc.isActive !== undefined ? sampleDoc.isActive : 'غير محدد'
          });
        }
      } catch (error) {
        console.log(`❌ خطأ في فحص ${collectionName}:`, error.message);
      }
      console.log('');
    }

    // فحص المستخدمين حسب نوع الحساب
    console.log('👥 فحص المستخدمين حسب نوع الحساب...');
    const accountTypes = ['player', 'club', 'academy', 'agent', 'trainer', 'admin'];
    
    for (const accountType of accountTypes) {
      try {
        const usersSnapshot = await db.collection('users')
          .where('accountType', '==', accountType)
          .limit(5)
          .get();
        
        console.log(`✅ ${accountType}: ${usersSnapshot.docs.length} مستخدم`);
        
        if (usersSnapshot.docs.length > 0) {
          const sampleUser = usersSnapshot.docs[0].data();
          console.log(`   👤 عينة: ${sampleUser.name || sampleUser.full_name || sampleUser.displayName || 'غير محدد'}`);
        }
      } catch (error) {
        console.log(`❌ خطأ في فحص ${accountType}:`, error.message);
      }
    }
    console.log('');

    // فحص المحادثات
    console.log('💬 فحص المحادثات...');
    try {
      const conversationsSnapshot = await db.collection('conversations').limit(5).get();
      console.log(`✅ المحادثات: ${conversationsSnapshot.docs.length} محادثة`);
      
      if (conversationsSnapshot.docs.length > 0) {
        const sampleConversation = conversationsSnapshot.docs[0].data();
        console.log(`   📝 عينة محادثة:`, {
          id: conversationsSnapshot.docs[0].id,
          participants: sampleConversation.participants || [],
          participantNames: sampleConversation.participantNames || {},
          lastMessage: sampleConversation.lastMessage || 'لا توجد رسائل'
        });
      }
    } catch (error) {
      console.log(`❌ خطأ في فحص المحادثات:`, error.message);
    }
    console.log('');

    // فحص الرسائل
    console.log('📨 فحص الرسائل...');
    try {
      const messagesSnapshot = await db.collection('messages').limit(5).get();
      console.log(`✅ الرسائل: ${messagesSnapshot.docs.length} رسالة`);
      
      if (messagesSnapshot.docs.length > 0) {
        const sampleMessage = messagesSnapshot.docs[0].data();
        console.log(`   💬 عينة رسالة:`, {
          id: messagesSnapshot.docs[0].id,
          senderId: sampleMessage.senderId || 'غير محدد',
          message: sampleMessage.message || 'لا توجد رسالة',
          timestamp: sampleMessage.timestamp || 'غير محدد'
        });
      }
    } catch (error) {
      console.log(`❌ خطأ في فحص الرسائل:`, error.message);
    }
    console.log('');

    // فحص الفهارس المطلوبة
    console.log('🔍 فحص الفهارس المطلوبة...');
    const requiredIndexes = [
      {
        collectionGroup: 'conversations',
        fields: [
          { fieldPath: 'participants', arrayConfig: 'CONTAINS' },
          { fieldPath: 'updatedAt', order: 'DESCENDING' }
        ]
      },
      {
        collectionGroup: 'messages',
        fields: [
          { fieldPath: 'conversationId', order: 'ASCENDING' },
          { fieldPath: 'timestamp', order: 'ASCENDING' }
        ]
      },
      {
        collectionGroup: 'users',
        fields: [
          { fieldPath: 'accountType', order: 'ASCENDING' },
          { fieldPath: 'createdAt', order: 'DESCENDING' }
        ]
      }
    ];

    console.log('📋 الفهارس المطلوبة:');
    requiredIndexes.forEach((index, i) => {
      console.log(`   ${i + 1}. ${index.collectionGroup}: ${index.fields.map(f => f.fieldPath).join(', ')}`);
    });
    console.log('');

    // توصيات الإصلاح
    console.log('🛠️ توصيات الإصلاح:');
    console.log('1. تأكد من وجود بيانات في المجموعات التالية:');
    console.log('   - users (مع accountType صحيح)');
    console.log('   - clubs, academies, agents, trainers, players, admins');
    console.log('');
    console.log('2. تأكد من إنشاء الفهارس المطلوبة في Firestore');
    console.log('');
    console.log('3. تحقق من قواعد الأمان في Firestore');
    console.log('');
    console.log('4. تأكد من أن المستخدمين لديهم accountType صحيح');

  } catch (error) {
    console.error('❌ خطأ في فحص قاعدة البيانات:', error);
  }
}

// تشغيل الفحص
debugMessageCenter()
  .then(() => {
    console.log('✅ انتهى فحص قاعدة البيانات');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ خطأ:', error);
    process.exit(1);
  });
