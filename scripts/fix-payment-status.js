const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

// تهيئة Firebase
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

async function fixPaymentStatus(userEmail) {
  console.log('🔧 إصلاح حالة المدفوعات للمستخدم:', userEmail);
  console.log('=====================================\n');

  try {
    // البحث عن المستخدم
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('email', '==', userEmail));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      console.log('❌ لم يتم العثور على المستخدم');
      return;
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    console.log('✅ تم العثور على المستخدم:', userId);

    // البحث عن المدفوعات في bulkPayments
    console.log('\n🔍 البحث عن المدفوعات في bulkPayments...');
    const bulkPaymentsRef = collection(db, 'bulkPayments');
    const paymentsQuery = query(bulkPaymentsRef, where('userId', '==', userId));
    const paymentsSnapshot = await getDocs(paymentsQuery);

    if (paymentsSnapshot.empty) {
      console.log('❌ لم يتم العثور على مدفوعات في bulkPayments');
      return;
    }

    console.log(`✅ تم العثور على ${paymentsSnapshot.size} مدفوعات`);

    // تحديث كل مدفوعة
    for (const paymentDoc of paymentsSnapshot.docs) {
      const payment = paymentDoc.data();
      console.log(`\n💰 معالجة المدفوعة: ${paymentDoc.id}`);
      console.log(`   - الحالة الحالية: ${payment.status}`);
      console.log(`   - المبلغ: ${payment.amount} ${payment.currency}`);
      console.log(`   - معرف الجلسة: ${payment.sessionId}`);

      // تحديث الحالة إلى completed إذا كانت pending
      if (payment.status === 'pending') {
        try {
          await updateDoc(paymentDoc.ref, {
            status: 'completed',
            completedAt: new Date(),
            updatedAt: new Date()
          });
          console.log('✅ تم تحديث حالة المدفوعة إلى completed');
        } catch (error) {
          console.log('❌ خطأ في تحديث المدفوعة:', error.message);
        }
      } else {
        console.log('ℹ️ المدفوعة بالفعل مكتملة أو فاشلة');
      }
    }

    // البحث عن المدفوعات في subscriptions
    console.log('\n🔍 البحث عن المدفوعات في subscriptions...');
    try {
      const subscriptionRef = doc(db, 'subscriptions', userId);
      const subscriptionDoc = await getDoc(subscriptionRef);

      if (subscriptionDoc.exists()) {
        const subscription = subscriptionDoc.data();
        console.log(`   - الحالة الحالية: ${subscription.status}`);

        if (subscription.status === 'pending') {
          try {
            await updateDoc(subscriptionRef, {
              status: 'active',
              updatedAt: new Date()
            });
            console.log('✅ تم تحديث حالة الاشتراك إلى active');
          } catch (error) {
            console.log('❌ خطأ في تحديث الاشتراك:', error.message);
          }
        } else {
          console.log('ℹ️ الاشتراك بالفعل نشط أو منتهي');
        }
      } else {
        console.log('❌ لم يتم العثور على بيانات اشتراك في subscriptions');
      }
    } catch (error) {
      console.log('⚠️ خطأ في البحث في subscriptions:', error.message);
    }

    console.log('\n✅ تم إكمال إصلاح حالة المدفوعات');

  } catch (error) {
    console.error('❌ خطأ في إصلاح حالة المدفوعات:', error);
  }
}

// تشغيل السكريبت
const userEmail = process.argv[2];
if (!userEmail) {
  console.log('❌ يرجى توفير البريد الإلكتروني للمستخدم');
  console.log('مثال: node scripts/fix-payment-status.js user@example.com');
  process.exit(1);
}

fixPaymentStatus(userEmail); 
