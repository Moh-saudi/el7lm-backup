// ============================================
// سكريبت التحقق من صحة بيانات الاشتراك
// ============================================

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, getDoc } = require('firebase/firestore');

// إعداد Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDCQQxUbeQQrlty5HnF65-7TK0TB2zB7R4",
  authDomain: "hagzzgo-87884.firebaseapp.com",
  projectId: "hagzzgo-87884",
  storageBucket: "hagzzgo-87884.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function verifySubscriptionData(userId) {
  console.log('🔍 بدء التحقق من بيانات الاشتراك للمستخدم:', userId);
  
  try {
    // 1. البحث في bulkPayments (المدفوعات الحقيقية من جيديا)
    console.log('\n1️⃣ البحث في مجموعة bulkPayments...');
    const bulkPaymentsRef = collection(db, 'bulkPayments');
    const bulkPaymentsQuery = query(
      bulkPaymentsRef, 
      where('userId', '==', userId),
      where('status', '==', 'completed')
    );
    const bulkPaymentsSnapshot = await getDocs(bulkPaymentsQuery);
    
    if (!bulkPaymentsSnapshot.empty) {
      console.log('✅ تم العثور على مدفوعات حقيقية من جيديا');
      console.log('📊 عدد المدفوعات:', bulkPaymentsSnapshot.docs.length);
      
      bulkPaymentsSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n📋 المدفوعة ${index + 1}:`);
        console.log(`   - معرف الجلسة: ${data.sessionId}`);
        console.log(`   - المبلغ: ${data.amount} ${data.currency}`);
        console.log(`   - طريقة الدفع: ${data.paymentMethod}`);
        console.log(`   - تاريخ الدفع: ${data.createdAt?.toDate?.() || data.createdAt}`);
        console.log(`   - حالة الدفع: ${data.status}`);
        console.log(`   - معرف التاجر: ${data.merchantReferenceId}`);
      });
    } else {
      console.log('❌ لم يتم العثور على مدفوعات في bulkPayments');
    }

    // 2. البحث في subscriptions
    console.log('\n2️⃣ البحث في مجموعة subscriptions...');
    const subscriptionRef = doc(db, 'subscriptions', userId);
    const subscriptionDoc = await getDoc(subscriptionRef);
    
    if (subscriptionDoc.exists()) {
      console.log('✅ تم العثور على سجل اشتراك');
      const data = subscriptionDoc.data();
      console.log('📋 بيانات الاشتراك:');
      console.log(`   - الحالة: ${data.status}`);
      console.log(`   - تاريخ البداية: ${data.startDate?.toDate?.() || data.startDate}`);
      console.log(`   - تاريخ الانتهاء: ${data.endDate?.toDate?.() || data.endDate}`);
      console.log(`   - طريقة الدفع: ${data.paymentMethod}`);
      console.log(`   - المبلغ: ${data.amount} ${data.currency}`);
      console.log(`   - معرف المعاملة: ${data.transactionId}`);
    } else {
      console.log('❌ لم يتم العثور على سجل اشتراك');
    }

    // 3. البحث في بيانات المستخدم
    console.log('\n3️⃣ البحث في بيانات المستخدم...');
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      console.log('✅ تم العثور على بيانات المستخدم');
      const data = userDoc.data();
      console.log('📋 بيانات المستخدم:');
      console.log(`   - حالة الاشتراك: ${data.subscriptionStatus}`);
      console.log(`   - تاريخ انتهاء الاشتراك: ${data.subscriptionEndDate?.toDate?.() || data.subscriptionEndDate}`);
      console.log(`   - آخر دفع: ${data.lastPaymentDate?.toDate?.() || data.lastPaymentDate}`);
      console.log(`   - مبلغ آخر دفع: ${data.lastPaymentAmount}`);
      console.log(`   - طريقة آخر دفع: ${data.lastPaymentMethod}`);
      console.log(`   - الباقة المختارة: ${data.selectedPackage}`);
    } else {
      console.log('❌ لم يتم العثور على بيانات المستخدم');
    }

    // 4. التحقق من صحة الربط
    console.log('\n4️⃣ التحقق من صحة الربط...');
    
    const hasBulkPayments = !bulkPaymentsSnapshot.empty;
    const hasSubscription = subscriptionDoc.exists();
    const hasUserData = userDoc.exists();
    
    if (hasBulkPayments && hasSubscription && hasUserData) {
      console.log('✅ جميع البيانات متوفرة ومربوطة بشكل صحيح');
      
      // التحقق من تطابق البيانات
      const bulkPayment = bulkPaymentsSnapshot.docs[0].data();
      const subscription = subscriptionDoc.data();
      const user = userDoc.data();
      
      const amountMatch = bulkPayment.amount === subscription.amount;
      const methodMatch = bulkPayment.paymentMethod === subscription.paymentMethod;
      const statusMatch = subscription.status === 'active' && user.subscriptionStatus === 'active';
      
      console.log('📊 تطابق البيانات:');
      console.log(`   - تطابق المبلغ: ${amountMatch ? '✅' : '❌'}`);
      console.log(`   - تطابق طريقة الدفع: ${methodMatch ? '✅' : '❌'}`);
      console.log(`   - تطابق الحالة: ${statusMatch ? '✅' : '❌'}`);
      
      if (amountMatch && methodMatch && statusMatch) {
        console.log('🎉 جميع البيانات متطابقة ومربوطة بشكل صحيح!');
      } else {
        console.log('⚠️ هناك اختلافات في البيانات - يلزم المراجعة');
      }
    } else {
      console.log('⚠️ بعض البيانات مفقودة:');
      console.log(`   - مدفوعات جيديا: ${hasBulkPayments ? '✅' : '❌'}`);
      console.log(`   - سجل الاشتراك: ${hasSubscription ? '✅' : '❌'}`);
      console.log(`   - بيانات المستخدم: ${hasUserData ? '✅' : '❌'}`);
    }

  } catch (error) {
    console.error('❌ خطأ في التحقق من البيانات:', error);
  }
}

// تشغيل التحقق
if (process.argv.length < 3) {
  console.log('استخدام: node scripts/verify-subscription-data.js <user_id>');
  console.log('مثال: node scripts/verify-subscription-data.js abc123');
  process.exit(1);
}

const userId = process.argv[2];
verifySubscriptionData(userId).then(() => {
  console.log('\n✅ انتهى التحقق من البيانات');
  process.exit(0);
}).catch(error => {
  console.error('❌ خطأ في تشغيل السكريبت:', error);
  process.exit(1);
}); 
