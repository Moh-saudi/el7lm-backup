// ============================================
// سكريبت إصلاح نوع الحساب وتحديث البيانات
// ============================================

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, updateDoc, setDoc } = require('firebase/firestore');

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

async function fixAccountType(userId) {
  console.log('🔧 بدء إصلاح نوع الحساب للمستخدم:', userId);
  
  try {
    // 1. فحص البيانات الحالية
    console.log('\n1️⃣ فحص البيانات الحالية...');
    
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.log('❌ المستخدم غير موجود في مجموعة users');
      return;
    }
    
    const userData = userDoc.data();
    console.log('📊 البيانات الحالية:');
    console.log(`   - البريد الإلكتروني: ${userData.email}`);
    console.log(`   - الاسم: ${userData.name || userData.displayName}`);
    console.log(`   - نوع الحساب الحالي: ${userData.accountType}`);
    console.log(`   - نوع الباقة: ${userData.selectedPackage}`);
    console.log(`   - حالة الاشتراك: ${userData.subscriptionStatus}`);
    
    // 2. فحص البيانات في مجموعة players
    console.log('\n2️⃣ فحص بيانات اللاعب...');
    const playerRef = doc(db, 'players', userId);
    const playerDoc = await getDoc(playerRef);
    
    if (playerDoc.exists()) {
      const playerData = playerDoc.data();
      console.log('📊 بيانات اللاعب:');
      console.log(`   - المركز: ${playerData.position}`);
      console.log(`   - العمر: ${playerData.age}`);
      console.log(`   - الطول: ${playerData.height}`);
      console.log(`   - الوزن: ${playerData.weight}`);
      console.log(`   - رقم الهاتف: ${playerData.phone}`);
    } else {
      console.log('❌ المستخدم غير موجود في مجموعة players');
    }
    
    // 3. تحليل المشكلة
    console.log('\n3️⃣ تحليل المشكلة...');
    
    const currentAccountType = userData.accountType;
    const hasPlayerData = playerDoc.exists();
    const hasSubscription = userData.subscriptionStatus === 'active';
    const selectedPackage = userData.selectedPackage;
    
    console.log('🔍 تحليل البيانات:');
    console.log(`   - نوع الحساب الحالي: ${currentAccountType}`);
    console.log(`   - لديه بيانات لاعب: ${hasPlayerData ? '✅' : '❌'}`);
    console.log(`   - لديه اشتراك نشط: ${hasSubscription ? '✅' : '❌'}`);
    console.log(`   - الباقة المختارة: ${selectedPackage}`);
    
    // 4. تحديد نوع الحساب الصحيح
    console.log('\n4️⃣ تحديد نوع الحساب الصحيح...');
    
    let correctAccountType = 'player'; // افتراضي
    
    // إذا كان لديه بيانات لاعب، فهو لاعب
    if (hasPlayerData) {
      correctAccountType = 'player';
      console.log('✅ تم تحديد النوع: لاعب (player)');
    }
    // إذا كان لديه اشتراك نشط وباقة لاعب، فهو لاعب
    else if (hasSubscription && selectedPackage && selectedPackage.includes('subscription')) {
      correctAccountType = 'player';
      console.log('✅ تم تحديد النوع: لاعب (player) - بناءً على الباقة');
    }
    // إذا كان نوع الحساب الحالي صحيح، نستخدمه
    else if (['player', 'club', 'agent', 'academy', 'trainer', 'admin', 'marketer', 'parent'].includes(currentAccountType)) {
      correctAccountType = currentAccountType;
      console.log(`✅ نوع الحساب الحالي صحيح: ${currentAccountType}`);
    }
    
    console.log(`🎯 النوع الصحيح: ${correctAccountType}`);
    
    // 5. إصلاح البيانات إذا لزم الأمر
    if (currentAccountType !== correctAccountType) {
      console.log('\n5️⃣ إصلاح نوع الحساب...');
      
      try {
        // تحديث نوع الحساب في مجموعة users
        await updateDoc(userRef, {
          accountType: correctAccountType,
          updatedAt: new Date()
        });
        
        console.log(`✅ تم تحديث نوع الحساب من "${currentAccountType}" إلى "${correctAccountType}"`);
        
        // إذا كان اللاعب غير موجود في مجموعة players، إنشاؤه
        if (correctAccountType === 'player' && !hasPlayerData) {
          console.log('\n6️⃣ إنشاء بيانات اللاعب...');
          
          const playerData = {
            email: userData.email,
            phone: userData.phone || '',
            name: userData.name || userData.displayName || 'لاعب',
            accountType: 'player',
            subscriptionStatus: userData.subscriptionStatus || 'inactive',
            subscriptionEndDate: userData.subscriptionEndDate,
            lastPaymentDate: userData.lastPaymentDate,
            lastPaymentAmount: userData.lastPaymentAmount,
            lastPaymentMethod: userData.lastPaymentMethod,
            selectedPackage: userData.selectedPackage,
            createdAt: userData.createdAt || new Date(),
            updatedAt: new Date()
          };
          
          await setDoc(playerRef, playerData);
          console.log('✅ تم إنشاء بيانات اللاعب');
        }
        
      } catch (error) {
        console.error('❌ خطأ في إصلاح البيانات:', error);
        return;
      }
    } else {
      console.log('✅ نوع الحساب صحيح، لا حاجة للإصلاح');
    }
    
    // 6. التحقق من النتيجة
    console.log('\n7️⃣ التحقق من النتيجة...');
    
    const updatedUserDoc = await getDoc(userRef);
    const updatedUserData = updatedUserDoc.data();
    
    console.log('📊 البيانات المحدثة:');
    console.log(`   - نوع الحساب: ${updatedUserData.accountType}`);
    console.log(`   - البريد الإلكتروني: ${updatedUserData.email}`);
    console.log(`   - الاسم: ${updatedUserData.name || updatedUserData.displayName}`);
    console.log(`   - حالة الاشتراك: ${updatedUserData.subscriptionStatus}`);
    
    // فحص بيانات اللاعب المحدثة
    const updatedPlayerDoc = await getDoc(playerRef);
    if (updatedPlayerDoc.exists()) {
      const updatedPlayerData = updatedPlayerDoc.data();
      console.log('📊 بيانات اللاعب المحدثة:');
      console.log(`   - نوع الحساب: ${updatedPlayerData.accountType}`);
      console.log(`   - الاسم: ${updatedPlayerData.name}`);
      console.log(`   - البريد الإلكتروني: ${updatedPlayerData.email}`);
    }
    
    console.log('\n🎉 تم إصلاح نوع الحساب بنجاح!');
    console.log(`📱 يمكن للمستخدم الآن الوصول إلى لوحة تحكم ${correctAccountType === 'player' ? 'اللاعب' : correctAccountType}`);
    
  } catch (error) {
    console.error('❌ خطأ في إصلاح نوع الحساب:', error);
  }
}

// تشغيل الإصلاح
if (process.argv.length < 3) {
  console.log('استخدام: node scripts/fix-account-type.js <user_id>');
  console.log('مثال: node scripts/fix-account-type.js TnSvLJgehmftXNY024Y0cjib6NI3');
  process.exit(1);
}

const userId = process.argv[2];
fixAccountType(userId).then(() => {
  console.log('\n✅ انتهى إصلاح نوع الحساب');
  process.exit(0);
}).catch(error => {
  console.error('❌ خطأ في تشغيل السكريبت:', error);
  process.exit(1);
}); 
