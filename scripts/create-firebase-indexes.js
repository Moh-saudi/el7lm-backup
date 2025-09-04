#!/usr/bin/env node

/**
 * Firebase Indexes Creation Script
 * This script provides instructions and direct links to create required Firestore indexes
 */

const PROJECT_ID = 'hagzzgo-87884';

const REQUIRED_INDEXES = [
  {
    name: 'Notifications Index',
    collection: 'notifications',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'timestamp', order: 'DESCENDING' },
      { fieldPath: '__name__', order: 'ASCENDING' }
    ],
    directLink: `https://console.firebase.google.com/v1/r/project/${PROJECT_ID}/firestore/indexes?create_composite=ClNwcm9qZWN0cy9oYWd6emdvLTg3ODg0L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9ub3RpZmljYXRpb25zL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg0KCXRpbWVzdGFtcBACGgwKCF9fbmFtZV9fEAI`
  },
  {
    name: 'Messages Index',
    collection: 'messages',
    fields: [
      { fieldPath: 'receiverId', order: 'ASCENDING' },
      { fieldPath: 'timestamp', order: 'DESCENDING' },
      { fieldPath: '__name__', order: 'ASCENDING' }
    ],
    directLink: `https://console.firebase.google.com/v1/r/project/${PROJECT_ID}/firestore/indexes?create_composite=Ck5wcm9qZWN0cy9oYWd6emdvLTg3ODg0L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9tZXNzYWdlcy9pbmRleGVzL18QARoOCgpyZWNlaXZlcklkEAEaDQoJdGltZXN0YW1wEAIaDAoIX19uYW1lX18QAg`
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

console.log('🔥 Firebase Indexes Creation Guide');
console.log('=====================================\n');

console.log('📋 Required Indexes:\n');

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
  
  if (index.directLink) {
    console.log(`   🔗 Direct Link: ${index.directLink}`);
  }
  console.log('');
});

console.log('🚀 Quick Setup Instructions:\n');

console.log('1. 🔗 Use Direct Links (if available):');
REQUIRED_INDEXES.filter(index => index.directLink).forEach((index, i) => {
  console.log(`   ${i + 1}. ${index.name}: ${index.directLink}`);
});

console.log('\n2. 📝 Manual Setup:');
console.log('   - Go to Firebase Console: https://console.firebase.google.com');
console.log(`   - Select project: ${PROJECT_ID}`);
console.log('   - Navigate to Firestore Database > Indexes');
console.log('   - Click "Create Index" for each collection above');

console.log('\n3. ⏱️ Expected Creation Time:');
console.log('   - Simple indexes: 1-2 minutes');
console.log('   - Composite indexes: 2-5 minutes');
console.log('   - Large collections: 5-15 minutes');

console.log('\n4. ✅ After Creation:');
console.log('   - Wait for indexes to finish building');
console.log('   - Restart your application');
console.log('   - Firebase errors should disappear');

console.log('\n🔧 Alternative: Use Firebase CLI');
console.log('```bash');
console.log('# Install Firebase CLI');
console.log('npm install -g firebase-tools');
console.log('');
console.log('# Login to Firebase');
console.log('firebase login');
console.log('');
console.log('# Initialize project');
console.log('firebase init firestore');
console.log('');
console.log('# Deploy indexes');
console.log('firebase deploy --only firestore:indexes');
console.log('```');

console.log('\n📞 Need Help?');
console.log('- Check Firebase documentation: https://firebase.google.com/docs/firestore/query-data/indexing');
console.log('- Ensure you have proper permissions');
console.log('- Wait sufficient time for index building');

console.log('\n🎯 Expected Result:');
console.log('✅ Firebase index errors resolved');
console.log('✅ Improved query performance');
console.log('✅ All features working properly');

console.log('\n=====================================');
console.log('🔥 Firebase Indexes Setup Complete!');
