import { db } from './config';

// Define required indexes
export const REQUIRED_INDEXES = [
  {
    collectionGroup: 'subscriptions',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ]
  },
  {
    collectionGroup: 'users',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'accountType', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ]
  },
  {
    collectionGroup: 'users',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'accountType', order: 'ASCENDING' },
      { fieldPath: 'academyId', order: 'ASCENDING' }
    ]
  },
  {
    collectionGroup: 'ratings',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'targetId', order: 'ASCENDING' },
      { fieldPath: 'targetType', order: 'ASCENDING' }
    ]
  },
  {
    collectionGroup: 'verificationDocuments',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'uploadedAt', order: 'DESCENDING' }
    ]
  }
];

// Function to check and create missing indexes
export const ensureIndexes = async () => {
  try {
    // Note: This is just a placeholder. In a real implementation,
    // you would need to use the Firebase Admin SDK or Cloud Functions
    // to create indexes programmatically.
    console.log('Required indexes:', REQUIRED_INDEXES);
    console.log('Please ensure these indexes are created in the Firebase Console');
  } catch (error) {
    console.error('Error checking indexes:', error);
  }
};

// Function to get index creation URLs
export const getIndexCreationUrls = () => {
  const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'hagzzgo-87884';
  
  return {
    subscriptions: `https://console.firebase.google.com/v1/r/project/${PROJECT_ID}/firestore/indexes?create_composite=ClNwcm9qZWN0cy9oYWd6emdvLTg3ODg0L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9zdWJzY3JpcHRpb25zL2luZGV4ZXMvXxABGgoKBnN0YXR1cxABGgoKBnVzZXJJZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI`,
    users: `https://console.firebase.google.com/v1/r/project/${PROJECT_ID}/firestore/indexes?create_composite=Cktwcm9qZWN0cy9oYWd6emdvLTg3ODg0L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy91c2Vycy9pbmRleGVzL18QARoPCgthY2NvdW50VHlwZRABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI`,
    ratings: `https://console.firebase.google.com/v1/r/project/${PROJECT_ID}/firestore/indexes?create_composite=Ck1wcm9qZWN0cy9oYWd6emdvLTg3ODg0L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9yYXRpbmdzL2luZGV4ZXMvXxABGggKBHR5cGUQARoICgR1c2VyEAE`
  };
}; 
