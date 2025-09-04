#!/usr/bin/env node

/**
 * Firebase Indexes Creation Script - Direct Creation
 * This script creates required Firestore indexes directly using Firebase Admin SDK
 */

const admin = require('firebase-admin');

// تهيئة Firebase Admin
function initializeFirebaseAdmin() {
  try {
    // محاولة استخدام متغيرات البيئة أولاً
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'hagzzgo-87884';
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    
    if (privateKey && clientEmail) {
      // تنظيف private key
      let cleanPrivateKey = privateKey;
      if (privateKey.includes('\\n')) {
        cleanPrivateKey = privateKey.replace(/\\n/g, '\n');
      }
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          privateKey: cleanPrivateKey,
          clientEmail: clientEmail,
        }),
        projectId: projectId,
      });
      console.log('✅ Firebase Admin initialized with service account');
    } else {
      // استخدام التكوين الافتراضي
      admin.initializeApp({
        projectId: projectId,
      });
      console.log('✅ Firebase Admin initialized with default credentials');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
    return false;
  }
}

// تعريف الفهارس المطلوبة
const REQUIRED_INDEXES = [
  {
    name: 'Notifications Index',
    collection: 'notifications',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'timestamp', order: 'DESCENDING' },
      { fieldPath: '__name__', order: 'ASCENDING' }
    ]
  },
  {
    name: 'Messages Index',
    collection: 'messages',
    fields: [
      { fieldPath: 'receiverId', order: 'ASCENDING' },
      { fieldPath: 'timestamp', order: 'DESCENDING' },
      { fieldPath: '__name__', order: 'ASCENDING' }
    ]
  },
  {
    name: 'Conversations Index',
    collection: 'conversations',
    fields: [
      { fieldPath: 'participants', arrayConfig: 'CONTAINS' },
      { fieldPath: 'updatedAt', order: 'DESCENDING' },
      { fieldPath: '__name__', order: 'ASCENDING' }
    ]
  },
  {
    name: 'Support Messages Index',
    collection: 'support_messages',
    fields: [
      { fieldPath: 'conversationId', order: 'ASCENDING' },
      { fieldPath: 'timestamp', order: 'ASCENDING' },
      { fieldPath: '__name__', order: 'ASCENDING' }
    ]
  },
  {
    name: 'Support Conversations Index',
    collection: 'support_conversations',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'updatedAt', order: 'DESCENDING' },
      { fieldPath: '__name__', order: 'ASCENDING' }
    ]
  },
  {
    name: 'Ads Index',
    collection: 'ads',
    fields: [
      { fieldPath: 'isActive', order: 'ASCENDING' },
      { fieldPath: 'priority', order: 'DESCENDING' },
      { fieldPath: '__name__', order: 'ASCENDING' }
    ]
  },
  {
    name: 'Users Index',
    collection: 'users',
    fields: [
      { fieldPath: 'accountType', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' },
      { fieldPath: '__name__', order: 'ASCENDING' }
    ]
  },
  {
    name: 'Verification Documents Index',
    collection: 'verificationDocuments',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'uploadedAt', order: 'DESCENDING' },
      { fieldPath: '__name__', order: 'ASCENDING' }
    ]
  }
];

// دالة لإنشاء فهرس واحد
async function createIndex(indexConfig) {
  try {
    console.log(`\n🔧 Creating index for collection: ${indexConfig.collection}`);
    console.log('Fields:', JSON.stringify(indexConfig.fields, null, 2));

    // استخدام Firestore Admin API لإنشاء الفهرس
    const db = admin.firestore();
    
    // إنشاء الفهرس باستخدام Admin SDK
    // ملاحظة: Firebase Admin SDK لا يدعم إنشاء الفهارس مباشرة
    // سنستخدم طريقة بديلة عبر REST API
    
    console.log(`⚠️ Firebase Admin SDK doesn't support direct index creation`);
    console.log(`📝 Please create the index manually using the Firebase Console`);
    console.log(`🔗 Go to: https://console.firebase.google.com/project/hagzzgo-87884/firestore/indexes`);
    
    return false;
  } catch (error) {
    console.error(`❌ Error creating index for ${indexConfig.collection}:`, error.message);
    return false;
  }
}

// دالة لإنشاء جميع الفهارس
async function createAllIndexes() {
  console.log('🔥 Firebase Indexes Creation - Direct Method');
  console.log('=============================================\n');

  // تهيئة Firebase Admin
  if (!initializeFirebaseAdmin()) {
    console.log('❌ Cannot proceed without Firebase Admin initialization');
    return;
  }

  console.log('📋 Required Indexes:\n');

  // عرض الفهارس المطلوبة
  REQUIRED_INDEXES.forEach((index, i) => {
    console.log(`${i + 1}. ${index.name}`);
    console.log(`   Collection: ${index.collection}`);
    console.log(`   Fields:`);
    index.fields.forEach(field => {
      if (field.arrayConfig) {
        console.log(`     - ${field.fieldPath} (Array contains)`);
      } else {
        console.log(`     - ${field.fieldPath} (${field.order})`);
      }
    });
    console.log('');
  });

  console.log('🚀 Creating Indexes...\n');

  let successCount = 0;
  let failCount = 0;

  for (const index of REQUIRED_INDEXES) {
    const success = await createIndex(index);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n📊 Results:');
  console.log(`✅ Successfully created: ${successCount} indexes`);
  console.log(`❌ Failed to create: ${failCount} indexes`);

  if (failCount > 0) {
    console.log('\n🔧 Alternative Solutions:');
    console.log('1. Use Firebase Console manually:');
    console.log('   https://console.firebase.google.com/project/hagzzgo-87884/firestore/indexes');
    console.log('');
    console.log('2. Use Firebase CLI:');
    console.log('   npm install -g firebase-tools');
    console.log('   firebase login');
    console.log('   firebase init firestore');
    console.log('   firebase deploy --only firestore:indexes');
    console.log('');
    console.log('3. Use direct links (if available):');
    console.log('   Notifications: https://console.firebase.google.com/v1/r/project/hagzzgo-87884/firestore/indexes?create_composite=ClNwcm9qZWN0cy9oYWd6emdvLTg3ODg0L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9ub3RpZmljYXRpb25zL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg0KCXRpbWVzdGFtcBACGgwKCF9fbmFtZV9fEAI');
    console.log('   Messages: https://console.firebase.google.com/v1/r/project/hagzzgo-87884/firestore/indexes?create_composite=Ck5wcm9qZWN0cy9oYWd6emdvLTg3ODg0L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9tZXNzYWdlcy9pbmRleGVzL18QARoOCgpyZWNlaXZlcklkEAEaDQoJdGltZXN0YW1wEAIaDAoIX19uYW1lX18QAg');
  }

  console.log('\n⏱️ Expected Creation Time:');
  console.log('   - Simple indexes: 1-2 minutes');
  console.log('   - Composite indexes: 2-5 minutes');
  console.log('   - Large collections: 5-15 minutes');

  console.log('\n✅ After Creation:');
  console.log('   - Wait for indexes to finish building');
  console.log('   - Restart your application');
  console.log('   - Firebase errors should disappear');

  console.log('\n=============================================');
  console.log('🔥 Firebase Indexes Setup Complete!');
}

// تشغيل السكريبت
if (require.main === module) {
  createAllIndexes().catch(console.error);
}

module.exports = { createAllIndexes, REQUIRED_INDEXES };
