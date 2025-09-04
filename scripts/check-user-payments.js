// scripts/check-user-payments.js
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, getDoc } = require('firebase/firestore');

// تكوين Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkUserPayments(userEmail) {
  console.log(`🔍 فحص مدفوعات المستخدم: ${userEmail}`);
  console.log('=====================================\n');

  try {
    // البحث عن المستخدم بالبريد الإلكتروني
    console.log('1️⃣ البحث عن المستخدم في قاعدة البيانات...');
    
    // البحث في مجموعة users
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('email', '==', userEmail));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      console.log('❌ لم يتم العثور على المستخدم في مجموعة users');
      return;
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    console.log('✅ تم العثور على المستخدم:');
    console.log(`   - ID: ${userId}`);
    console.log(`   - الاسم: ${userData.displayName || 'غير محدد'}`);
    console.log(`   - البريد الإلكتروني: ${userData.email}`);
    console.log(`   - نوع الحساب: ${userData.accountType || 'غير محدد'}`);
    console.log(`   - حالة الاشتراك: ${userData.subscriptionStatus || 'غير محدد'}`);
    console.log(`   - تاريخ انتهاء الاشتراك: ${userData.subscriptionEndDate || 'غير محدد'}`);
    console.log(`   - آخر دفع: ${userData.lastPaymentDate || 'غير محدد'}`);
    console.log(`   - مبلغ آخر دفع: ${userData.lastPaymentAmount || 'غير محدد'}`);
    console.log(`   - طريقة آخر دفع: ${userData.lastPaymentMethod || 'غير محدد'}`);

    // البحث في مجموعة bulkPayments
    console.log('\n2️⃣ البحث في مجموعة bulkPayments...');
    const bulkPaymentsRef = collection(db, 'bulkPayments');
    const paymentsQuery = query(bulkPaymentsRef, where('userId', '==', userId));
    const paymentsSnapshot = await getDocs(paymentsQuery);

    if (paymentsSnapshot.empty) {
      console.log('❌ لم يتم العثور على مدفوعات في مجموعة bulkPayments');
    } else {
      console.log(`✅ تم العثور على ${paymentsSnapshot.docs.length} مدفوعات:`);
      paymentsSnapshot.docs.forEach((doc, index) => {
        const payment = doc.data();
        console.log(`\n   المدفوعة ${index + 1}:`);
        console.log(`   - ID: ${doc.id}`);
        console.log(`   - Session ID: ${payment.sessionId}`);
        console.log(`   - Merchant Reference: ${payment.merchantReferenceId}`);
        console.log(`   - الحالة: ${payment.status}`);
        console.log(`   - المبلغ: ${payment.amount} ${payment.currency}`);
        console.log(`   - طريقة الدفع: ${payment.paymentMethod}`);
        console.log(`   - الباقة المختارة: ${payment.selectedPackage}`);
        console.log(`   - تاريخ الإنشاء: ${payment.createdAt?.toDate?.() || payment.createdAt}`);
        console.log(`   - تاريخ الإكمال: ${payment.completedAt?.toDate?.() || payment.completedAt}`);
      });
    }

    // البحث في مجموعة subscriptions
    console.log('\n3️⃣ البحث في مجموعة subscriptions...');
    const subscriptionRef = doc(db, 'subscriptions', userId);
    const subscriptionDoc = await getDoc(subscriptionRef);

    if (!subscriptionDoc.exists()) {
      console.log('❌ لم يتم العثور على بيانات اشتراك في مجموعة subscriptions');
    } else {
      const subscription = subscriptionDoc.data();
      console.log('✅ تم العثور على بيانات اشتراك:');
      console.log(`   - الحالة: ${subscription.status}`);
      console.log(`   - تاريخ البداية: ${subscription.startDate?.toDate?.() || subscription.startDate}`);
      console.log(`   - تاريخ الانتهاء: ${subscription.endDate?.toDate?.() || subscription.endDate}`);
      console.log(`   - طريقة الدفع: ${subscription.paymentMethod}`);
      console.log(`   - المبلغ: ${subscription.amount} ${subscription.currency}`);
      console.log(`   - معرف المعاملة: ${subscription.transactionId}`);
    }

    // البحث في مجموعة bulk_payments (Supabase fallback)
    console.log('\n4️⃣ البحث في مجموعة bulk_payments...');
    const bulkPaymentsRef2 = collection(db, 'bulk_payments');
    const paymentsQuery2 = query(bulkPaymentsRef2, where('user_id', '==', userId));
    const paymentsSnapshot2 = await getDocs(paymentsQuery2);

    if (paymentsSnapshot2.empty) {
      console.log('❌ لم يتم العثور على مدفوعات في مجموعة bulk_payments');
    } else {
      console.log(`✅ تم العثور على ${paymentsSnapshot2.docs.length} مدفوعات في bulk_payments:`);
      paymentsSnapshot2.docs.forEach((doc, index) => {
        const payment = doc.data();
        console.log(`\n   المدفوعة ${index + 1}:`);
        console.log(`   - ID: ${doc.id}`);
        console.log(`   - الحالة: ${payment.status}`);
        console.log(`   - المبلغ: ${payment.amount} ${payment.currency}`);
        console.log(`   - طريقة الدفع: ${payment.paymentMethod}`);
        console.log(`   - الباقة المختارة: ${payment.selectedPackage}`);
        console.log(`   - تاريخ الدفع: ${payment.paymentDate}`);
      });
    }

    console.log('\n📊 ملخص الحالة:');
    console.log('================');
    
    const hasPayments = !paymentsSnapshot.empty || !paymentsSnapshot2.empty;
    const hasSubscription = subscriptionDoc.exists();
    const userHasSubscriptionStatus = userData.subscriptionStatus === 'active';

    console.log(`   - يوجد مدفوعات: ${hasPayments ? '✅ نعم' : '❌ لا'}`);
    console.log(`   - يوجد بيانات اشتراك: ${hasSubscription ? '✅ نعم' : '❌ لا'}`);
    console.log(`   - حالة الاشتراك في الملف الشخصي: ${userHasSubscriptionStatus ? '✅ نشط' : '❌ غير نشط'}`);

    if (hasPayments && !hasSubscription) {
      console.log('\n⚠️ المشكلة: يوجد مدفوعات ولكن لا توجد بيانات اشتراك');
      console.log('   الحل: يجب تحديث معالج الـ callback لإنشاء بيانات الاشتراك');
    }

    if (hasPayments && !userHasSubscriptionStatus) {
      console.log('\n⚠️ المشكلة: يوجد مدفوعات ولكن حالة الاشتراك غير محدثة في الملف الشخصي');
      console.log('   الحل: يجب تحديث بيانات المستخدم مع معلومات الاشتراك');
    }

  } catch (error) {
    console.error('❌ خطأ في فحص مدفوعات المستخدم:', error);
  }
}

// تشغيل الفحص
const userEmail = '0555555555@hagzzgo.com';
checkUserPayments(userEmail); 
