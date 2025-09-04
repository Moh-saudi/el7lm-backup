const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json');

// تهيئة Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// تعريف الفهارس المطلوبة
const REQUIRED_INDEXES = [
  // فهرس المحادثات
  {
    collectionId: 'conversations',
    fields: [
      { fieldPath: 'participants', arrayConfig: 'CONTAINS' },
      { fieldPath: 'updatedAt', order: 'DESCENDING' },
      { fieldPath: '__name__', order: 'ASCENDING' }
    ]
  },
  // فهرس الرسائل
  {
    collectionId: 'messages',
    fields: [
      { fieldPath: 'conversationId', order: 'ASCENDING' },
      { fieldPath: 'timestamp', order: 'ASCENDING' },
      { fieldPath: '__name__', order: 'ASCENDING' }
    ]
  },
  // فهرس اللاعبين
  {
    collectionId: 'players',
    fields: [
      { fieldPath: 'isActive', order: 'ASCENDING' },
      { fieldPath: 'organizationId', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'ASCENDING' },
      { fieldPath: '__name__', order: 'ASCENDING' }
    ]
  },
  // فهرس الأندية
  {
    collectionId: 'clubs',
    fields: [
      { fieldPath: 'isActive', order: 'ASCENDING' },
      { fieldPath: 'name', order: 'ASCENDING' },
      { fieldPath: '__name__', order: 'ASCENDING' }
    ]
  },
  // فهرس الأكاديميات
  {
    collectionId: 'academies',
    fields: [
      { fieldPath: 'isActive', order: 'ASCENDING' },
      { fieldPath: 'name', order: 'ASCENDING' },
      { fieldPath: '__name__', order: 'ASCENDING' }
    ]
  },
  // فهرس الوكلاء
  {
    collectionId: 'agents',
    fields: [
      { fieldPath: 'isActive', order: 'ASCENDING' },
      { fieldPath: 'name', order: 'ASCENDING' },
      { fieldPath: '__name__', order: 'ASCENDING' }
    ]
  },
  // فهرس المدربين
  {
    collectionId: 'trainers',
    fields: [
      { fieldPath: 'isActive', order: 'ASCENDING' },
      { fieldPath: 'name', order: 'ASCENDING' },
      { fieldPath: '__name__', order: 'ASCENDING' }
    ]
  },
  // فهرس المشرفين
  {
    collectionId: 'admins',
    fields: [
      { fieldPath: 'isActive', order: 'ASCENDING' },
      { fieldPath: 'name', order: 'ASCENDING' },
      { fieldPath: '__name__', order: 'ASCENDING' }
    ]
  },
  // فهرس المستخدمين
  {
    collectionId: 'users',
    fields: [
      { fieldPath: 'accountType', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'ASCENDING' },
      { fieldPath: '__name__', order: 'ASCENDING' }
    ]
  },
  // فهرس محادثات الدعم
  {
    collectionId: 'support_conversations',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'updatedAt', order: 'DESCENDING' },
      { fieldPath: '__name__', order: 'ASCENDING' }
    ]
  },
  // فهرس رسائل الدعم
  {
    collectionId: 'support_messages',
    fields: [
      { fieldPath: 'conversationId', order: 'ASCENDING' },
      { fieldPath: 'timestamp', order: 'ASCENDING' },
      { fieldPath: '__name__', order: 'ASCENDING' }
    ]
  }
];

// دالة لإنشاء فهرس واحد
async function createIndex(indexConfig) {
  try {
    console.log(`\nجاري إنشاء فهرس لمجموعة ${indexConfig.collectionId}...`);
    console.log('الحقول:', JSON.stringify(indexConfig.fields, null, 2));

    const collection = db.collection(indexConfig.collectionId);
    await collection.createIndex(indexConfig.fields);

    console.log(`✅ تم إنشاء الفهرس بنجاح لمجموعة ${indexConfig.collectionId}`);
  } catch (error) {
    console.error(`❌ خطأ في إنشاء الفهرس لمجموعة ${indexConfig.collectionId}:`, error);
    throw error;
  }
}

// دالة لإنشاء جميع الفهارس
async function createAllIndexes() {
  console.log('=== بدء إنشاء الفهارس ===');
  
  try {
    for (const indexConfig of REQUIRED_INDEXES) {
      await createIndex(indexConfig);
    }

    console.log('\n✨ تم إنشاء جميع الفهارس بنجاح!');
  } catch (error) {
    console.error('\n❌ حدث خطأ أثناء إنشاء الفهارس:', error);
    process.exit(1);
  }
}

// تشغيل السكريبت
createAllIndexes().then(() => {
  console.log('\n🔄 جاري إغلاق الاتصال...');
  admin.app().delete();
  process.exit(0);
}); 
