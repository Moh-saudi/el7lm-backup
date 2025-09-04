const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

// تكوين Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugUserData(userEmail) {
  console.log('🔍 فحص بيانات المستخدم:', userEmail);
  console.log('='.repeat(60));

  try {
    // البحث عن المستخدم في جميع المجموعات
    const collections = ['users', 'clubs', 'players', 'academies', 'agents', 'trainers', 'admins', 'marketers', 'parents'];
    
    for (const collectionName of collections) {
      console.log(`\n📋 البحث في مجموعة: ${collectionName}`);
      
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, where('email', '==', userEmail));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        console.log(`✅ تم العثور على ${querySnapshot.size} مستخدم في ${collectionName}`);
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log(`\n👤 بيانات المستخدم (ID: ${doc.id}):`);
          console.log(`   - البريد الإلكتروني: ${data.email}`);
          console.log(`   - الاسم: ${data.name || data.displayName || 'غير محدد'}`);
          console.log(`   - نوع الحساب: ${data.accountType || 'غير محدد'}`);
          console.log(`   - رقم الهاتف: ${data.phone || 'غير محدد'}`);
          console.log(`   - حالة الاشتراك: ${data.subscriptionStatus || 'غير محدد'}`);
          console.log(`   - نوع الاشتراك: ${data.subscriptionType || 'غير محدد'}`);
          console.log(`   - تاريخ بداية الاشتراك: ${data.subscriptionStartDate || 'غير محدد'}`);
          console.log(`   - تاريخ نهاية الاشتراك: ${data.subscriptionEndDate || 'غير محدد'}`);
          
          // البحث عن المدفوعات لهذا المستخدم
          searchUserPayments(doc.id, data.email);
        });
      } else {
        console.log(`❌ لم يتم العثور على مستخدمين في ${collectionName}`);
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ في فحص بيانات المستخدم:', error);
  }
}

async function searchUserPayments(userId, userEmail) {
  console.log(`\n💰 البحث عن مدفوعات المستخدم (ID: ${userId})`);
  console.log('-'.repeat(40));
  
  try {
    // البحث في مجموعة bulk_payments
    console.log('\n📊 البحث في مجموعة bulk_payments:');
    const bulkPaymentsRef = collection(db, 'bulk_payments');
    const q1 = query(bulkPaymentsRef, where('userId', '==', userId));
    const snapshot1 = await getDocs(q1);
    
    if (!snapshot1.empty) {
      console.log(`✅ تم العثور على ${snapshot1.size} عملية دفع في bulk_payments`);
      snapshot1.forEach((doc) => {
        const data = doc.data();
        console.log(`\n   💳 عملية دفع (ID: ${doc.id}):`);
        console.log(`      - رقم الطلب: ${data.orderId || data.merchantReferenceId || 'غير محدد'}`);
        console.log(`      - المبلغ: ${data.amount || data.totalAmount || 0} ${data.currency || 'EGP'}`);
        console.log(`      - الحالة: ${data.paymentStatus || data.status || 'غير محدد'}`);
        console.log(`      - تاريخ الدفع: ${data.createdAt || 'غير محدد'}`);
        console.log(`      - عدد اللاعبين: ${data.players?.length || data.selectedPlayerIds?.length || 0}`);
        console.log(`      - نوع الباقة: ${data.subscriptionType || data.selectedPackage || 'غير محدد'}`);
      });
    } else {
      console.log('❌ لم يتم العثور على مدفوعات في bulk_payments');
    }
    
    // البحث في مجموعة bulkPayments
    console.log('\n📊 البحث في مجموعة bulkPayments:');
    const bulkPaymentsRef2 = collection(db, 'bulkPayments');
    const q2 = query(bulkPaymentsRef2, where('userId', '==', userId));
    const snapshot2 = await getDocs(q2);
    
    if (!snapshot2.empty) {
      console.log(`✅ تم العثور على ${snapshot2.size} عملية دفع في bulkPayments`);
      snapshot2.forEach((doc) => {
        const data = doc.data();
        console.log(`\n   💳 عملية دفع (ID: ${doc.id}):`);
        console.log(`      - رقم الطلب: ${data.orderId || data.merchantReferenceId || 'غير محدد'}`);
        console.log(`      - المبلغ: ${data.amount || data.totalAmount || 0} ${data.currency || 'EGP'}`);
        console.log(`      - الحالة: ${data.paymentStatus || data.status || 'غير محدد'}`);
        console.log(`      - تاريخ الدفع: ${data.createdAt || 'غير محدد'}`);
        console.log(`      - عدد اللاعبين: ${data.players?.length || data.selectedPlayerIds?.length || 0}`);
        console.log(`      - نوع الباقة: ${data.subscriptionType || data.selectedPackage || 'غير محدد'}`);
      });
    } else {
      console.log('❌ لم يتم العثور على مدفوعات في bulkPayments');
    }
    
    // البحث بالبريد الإلكتروني أيضاً
    console.log('\n📊 البحث بالبريد الإلكتروني في bulk_payments:');
    const q3 = query(bulkPaymentsRef, where('customerEmail', '==', userEmail));
    const snapshot3 = await getDocs(q3);
    
    if (!snapshot3.empty) {
      console.log(`✅ تم العثور على ${snapshot3.size} عملية دفع بالبريد الإلكتروني في bulk_payments`);
      snapshot3.forEach((doc) => {
        const data = doc.data();
        console.log(`\n   💳 عملية دفع (ID: ${doc.id}):`);
        console.log(`      - رقم الطلب: ${data.orderId || data.merchantReferenceId || 'غير محدد'}`);
        console.log(`      - المبلغ: ${data.amount || data.totalAmount || 0} ${data.currency || 'EGP'}`);
        console.log(`      - الحالة: ${data.paymentStatus || data.status || 'غير محدد'}`);
        console.log(`      - تاريخ الدفع: ${data.createdAt || 'غير محدد'}`);
        console.log(`      - عدد اللاعبين: ${data.players?.length || data.selectedPlayerIds?.length || 0}`);
        console.log(`      - نوع الباقة: ${data.subscriptionType || data.selectedPackage || 'غير محدد'}`);
      });
    } else {
      console.log('❌ لم يتم العثور على مدفوعات بالبريد الإلكتروني في bulk_payments');
    }
    
  } catch (error) {
    console.error('❌ خطأ في البحث عن المدفوعات:', error);
  }
}

// تشغيل الفحص
debugUserData('0333333333@hagzzgo.com');
