// ============================================
// سكريبت فحص جميع المدفوعات في النظام
// ============================================

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, getDocs, doc, getDoc } = require('firebase/firestore');

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

async function checkAllPayments() {
  console.log('🔍 بدء فحص جميع المدفوعات في النظام...\n');
  
  try {
    // 1. فحص مدفوعات جيديا (bulkPayments)
    console.log('1️⃣ فحص مدفوعات جيديا (bulkPayments)...');
    const bulkPaymentsRef = collection(db, 'bulkPayments');
    const bulkPaymentsSnapshot = await getDocs(bulkPaymentsRef);
    
    if (!bulkPaymentsSnapshot.empty) {
      console.log(`✅ تم العثور على ${bulkPaymentsSnapshot.docs.length} مدفوعة من جيديا`);
      
      const completedPayments = bulkPaymentsSnapshot.docs.filter(doc => 
        doc.data().status === 'completed'
      );
      const pendingPayments = bulkPaymentsSnapshot.docs.filter(doc => 
        doc.data().status === 'pending'
      );
      const failedPayments = bulkPaymentsSnapshot.docs.filter(doc => 
        doc.data().status === 'failed'
      );
      
      console.log(`📊 إحصائيات المدفوعات:`);
      console.log(`   - مكتملة: ${completedPayments.length}`);
      console.log(`   - في الانتظار: ${pendingPayments.length}`);
      console.log(`   - فاشلة: ${failedPayments.length}`);
      
      // عرض تفاصيل المدفوعات المكتملة
      if (completedPayments.length > 0) {
        console.log('\n📋 تفاصيل المدفوعات المكتملة:');
        completedPayments.forEach((doc, index) => {
          const data = doc.data();
          console.log(`\n   ${index + 1}. معرف المستخدم: ${data.userId}`);
          console.log(`      - المبلغ: ${data.amount} ${data.currency}`);
          console.log(`      - طريقة الدفع: ${data.paymentMethod}`);
          console.log(`      - معرف الجلسة: ${data.sessionId}`);
          console.log(`      - تاريخ الدفع: ${data.createdAt?.toDate?.() || data.createdAt}`);
          console.log(`      - معرف التاجر: ${data.merchantReferenceId}`);
        });
      }
    } else {
      console.log('❌ لم يتم العثور على مدفوعات في bulkPayments');
    }

    // 2. فحص سجلات الاشتراكات
    console.log('\n2️⃣ فحص سجلات الاشتراكات (subscriptions)...');
    const subscriptionsRef = collection(db, 'subscriptions');
    const subscriptionsSnapshot = await getDocs(subscriptionsRef);
    
    if (!subscriptionsSnapshot.empty) {
      console.log(`✅ تم العثور على ${subscriptionsSnapshot.docs.length} سجل اشتراك`);
      
      const activeSubscriptions = subscriptionsSnapshot.docs.filter(doc => 
        doc.data().status === 'active'
      );
      const expiredSubscriptions = subscriptionsSnapshot.docs.filter(doc => 
        doc.data().status === 'expired'
      );
      
      console.log(`📊 إحصائيات الاشتراكات:`);
      console.log(`   - نشطة: ${activeSubscriptions.length}`);
      console.log(`   - منتهية: ${expiredSubscriptions.length}`);
      
      // عرض تفاصيل الاشتراكات النشطة
      if (activeSubscriptions.length > 0) {
        console.log('\n📋 تفاصيل الاشتراكات النشطة:');
        activeSubscriptions.forEach((doc, index) => {
          const data = doc.data();
          console.log(`\n   ${index + 1}. معرف المستخدم: ${data.userId}`);
          console.log(`      - الحالة: ${data.status}`);
          console.log(`      - المبلغ: ${data.amount} ${data.currency}`);
          console.log(`      - طريقة الدفع: ${data.paymentMethod}`);
          console.log(`      - تاريخ البداية: ${data.startDate?.toDate?.() || data.startDate}`);
          console.log(`      - تاريخ الانتهاء: ${data.endDate?.toDate?.() || data.endDate}`);
          console.log(`      - معرف المعاملة: ${data.transactionId}`);
        });
      }
    } else {
      console.log('❌ لم يتم العثور على سجلات اشتراك');
    }

    // 3. فحص بيانات المستخدمين مع اشتراكات نشطة
    console.log('\n3️⃣ فحص بيانات المستخدمين مع اشتراكات نشطة...');
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    if (!usersSnapshot.empty) {
      const usersWithActiveSubscriptions = usersSnapshot.docs.filter(doc => 
        doc.data().subscriptionStatus === 'active'
      );
      
      console.log(`✅ تم العثور على ${usersWithActiveSubscriptions.length} مستخدم مع اشتراك نشط`);
      
      if (usersWithActiveSubscriptions.length > 0) {
        console.log('\n📋 تفاصيل المستخدمين مع اشتراكات نشطة:');
        usersWithActiveSubscriptions.forEach((doc, index) => {
          const data = doc.data();
          console.log(`\n   ${index + 1}. معرف المستخدم: ${doc.id}`);
          console.log(`      - البريد الإلكتروني: ${data.email}`);
          console.log(`      - حالة الاشتراك: ${data.subscriptionStatus}`);
          console.log(`      - تاريخ انتهاء الاشتراك: ${data.subscriptionEndDate?.toDate?.() || data.subscriptionEndDate}`);
          console.log(`      - آخر دفع: ${data.lastPaymentDate?.toDate?.() || data.lastPaymentDate}`);
          console.log(`      - مبلغ آخر دفع: ${data.lastPaymentAmount}`);
          console.log(`      - طريقة آخر دفع: ${data.lastPaymentMethod}`);
          console.log(`      - الباقة المختارة: ${data.selectedPackage}`);
        });
      }
    } else {
      console.log('❌ لم يتم العثور على مستخدمين');
    }

    // 4. التحقق من تطابق البيانات
    console.log('\n4️⃣ التحقق من تطابق البيانات...');
    
    const completedPayments = bulkPaymentsSnapshot.docs.filter(doc => 
      doc.data().status === 'completed'
    );
    const activeSubscriptions = subscriptionsSnapshot.docs.filter(doc => 
      doc.data().status === 'active'
    );
    const usersWithActiveSubscriptions = usersSnapshot.docs.filter(doc => 
      doc.data().subscriptionStatus === 'active'
    );
    
    console.log('📊 مقارنة البيانات:');
    console.log(`   - مدفوعات مكتملة من جيديا: ${completedPayments.length}`);
    console.log(`   - اشتراكات نشطة: ${activeSubscriptions.length}`);
    console.log(`   - مستخدمين مع اشتراكات نشطة: ${usersWithActiveSubscriptions.length}`);
    
    // التحقق من تطابق معرفات المستخدمين
    const paymentUserIds = completedPayments.map(doc => doc.data().userId);
    const subscriptionUserIds = activeSubscriptions.map(doc => doc.data().userId);
    const userUserIds = usersWithActiveSubscriptions.map(doc => doc.id);
    
    const allUserIds = new Set([...paymentUserIds, ...subscriptionUserIds, ...userUserIds]);
    console.log(`\n📋 إجمالي المستخدمين الفريدين: ${allUserIds.size}`);
    
    // فحص المستخدمين الذين لديهم بيانات في جميع المجموعات
    const fullySyncedUsers = Array.from(allUserIds).filter(userId => 
      paymentUserIds.includes(userId) && 
      subscriptionUserIds.includes(userId) && 
      userUserIds.includes(userId)
    );
    
    console.log(`✅ المستخدمين المزامنين بالكامل: ${fullySyncedUsers.length}`);
    
    if (fullySyncedUsers.length > 0) {
      console.log('\n📋 قائمة المستخدمين المزامنين:');
      fullySyncedUsers.forEach((userId, index) => {
        console.log(`   ${index + 1}. ${userId}`);
      });
    }
    
    // فحص المستخدمين الذين لديهم بيانات مفقودة
    const usersWithMissingData = Array.from(allUserIds).filter(userId => {
      const hasPayment = paymentUserIds.includes(userId);
      const hasSubscription = subscriptionUserIds.includes(userId);
      const hasUserData = userUserIds.includes(userId);
      
      return !(hasPayment && hasSubscription && hasUserData);
    });
    
    if (usersWithMissingData.length > 0) {
      console.log(`\n⚠️ المستخدمين الذين لديهم بيانات مفقودة: ${usersWithMissingData.length}`);
      usersWithMissingData.forEach((userId, index) => {
        const hasPayment = paymentUserIds.includes(userId);
        const hasSubscription = subscriptionUserIds.includes(userId);
        const hasUserData = userUserIds.includes(userId);
        
        console.log(`   ${index + 1}. ${userId}:`);
        console.log(`      - مدفوعات جيديا: ${hasPayment ? '✅' : '❌'}`);
        console.log(`      - سجل اشتراك: ${hasSubscription ? '✅' : '❌'}`);
        console.log(`      - بيانات مستخدم: ${hasUserData ? '✅' : '❌'}`);
      });
    }

  } catch (error) {
    console.error('❌ خطأ في فحص المدفوعات:', error);
  }
}

// تشغيل الفحص
checkAllPayments().then(() => {
  console.log('\n✅ انتهى فحص جميع المدفوعات');
  process.exit(0);
}).catch(error => {
  console.error('❌ خطأ في تشغيل السكريبت:', error);
  process.exit(1);
}); 
