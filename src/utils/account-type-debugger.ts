// أداة تشخيص نوع الحساب
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { AccountType } from '../types/common';

export interface AccountDebugInfo {
  uid: string;
  email: string;
  foundInUsers: boolean;
  usersData?: DocumentData;
  foundInCollections: string[];
  collectionsData: Record<string, DocumentData>;
  detectedAccountType?: AccountType;
  recommendedAction: string;
}

export async function debugAccountType(uid: string, email: string): Promise<AccountDebugInfo> {
  const debugInfo: AccountDebugInfo = {
    uid,
    email,
    foundInUsers: false,
    foundInCollections: [],
    collectionsData: {},
    recommendedAction: ''
  };

  try {
    // فحص users collection
    console.log('🔍 Checking users collection...');
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      debugInfo.foundInUsers = true;
      debugInfo.usersData = userDoc.data();
      debugInfo.detectedAccountType = debugInfo.usersData.accountType as AccountType;
      console.log('✅ Found in users collection:', debugInfo.usersData);
    } else {
      console.log('❌ Not found in users collection');
    }

    // فحص role-specific collections
    const collections: Array<{ name: string; accountType: AccountType }> = [
      { name: 'clubs', accountType: 'club' },
      { name: 'academies', accountType: 'academy' },
      { name: 'trainers', accountType: 'trainer' },
      { name: 'agents', accountType: 'agent' },
      { name: 'players', accountType: 'player' }
    ];
    
    for (const collection of collections) {
      console.log(`🔍 Checking ${collection.name} collection...`);
      const roleRef = doc(db, collection.name, uid);
      const roleDoc = await getDoc(roleRef);
      
      if (roleDoc.exists()) {
        const data = roleDoc.data();
        debugInfo.foundInCollections.push(collection.name);
        debugInfo.collectionsData[collection.name] = data;
        
        // تحديد نوع الحساب من اسم المجموعة
        if (!debugInfo.detectedAccountType) {
          debugInfo.detectedAccountType = collection.accountType;
        }
        
        console.log(`✅ Found in ${collection.name}:`, data);
      } else {
        console.log(`❌ Not found in ${collection.name}`);
      }
    }

    // تحديد الإجراء المقترح
    if (debugInfo.foundInUsers && debugInfo.foundInCollections.length > 0) {
      debugInfo.recommendedAction = 'Account properly configured';
    } else if (!debugInfo.foundInUsers && debugInfo.foundInCollections.length > 0) {
      debugInfo.recommendedAction = `Create users document with accountType: ${debugInfo.detectedAccountType}`;
    } else if (debugInfo.foundInUsers && debugInfo.foundInCollections.length === 0) {
      debugInfo.recommendedAction = `Create role document in ${debugInfo.detectedAccountType}s collection`;
    } else {
      debugInfo.recommendedAction = 'Account needs complete setup';
    }

    return debugInfo;

  } catch (error) {
    console.error('Error debugging account type:', error);
    debugInfo.recommendedAction = `Error occurred: ${error instanceof Error ? error.message : String(error)}`;
    return debugInfo;
  }
}

// دالة للتحقق من المستخدم الحالي
export async function debugCurrentUser(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  // استيراد auth بشكل ديناميكي لتجنب مشاكل SSR
  const { auth } = await import('@/lib/firebase/config');
  const { onAuthStateChanged } = await import('firebase/auth');
  
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log('🔍 === Account Type Debug Info ===');
      const debugInfo = await debugAccountType(user.uid, user.email || '');
      console.table(debugInfo);
      console.log('📋 Recommended Action:', debugInfo.recommendedAction);
      console.log('=================================');
      
      // إضافة للـ window للوصول من console
      (window as Window & { accountDebugInfo?: AccountDebugInfo }).accountDebugInfo = debugInfo;
      console.log('💡 Access debug info via: window.accountDebugInfo');
    }
  });
}

// تفعيل التشخيص في بيئة التطوير
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as Window & { 
    debugAccountType?: typeof debugAccountType;
    debugCurrentUser?: typeof debugCurrentUser;
  }).debugAccountType = debugAccountType;
  (window as Window & { 
    debugAccountType?: typeof debugAccountType;
    debugCurrentUser?: typeof debugCurrentUser;
  }).debugCurrentUser = debugCurrentUser;
  
  console.log('🛠️ Account debugging tools available:');
  console.log('   window.debugAccountType(uid, email)');
  console.log('   window.debugCurrentUser()');
} 
