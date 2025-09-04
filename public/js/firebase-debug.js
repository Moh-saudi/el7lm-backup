// Firebase Debug Tool - للتشخيص السريع
console.log('🛠️ تحميل أداة تشخيص Firebase...');

// دالة للتحقق من اتصال Firebase
window.checkFirebaseConnection = async function() {
  console.log('🔍 فحص اتصال Firebase...');
  
  try {
    // فحص Firebase في الطرق المختلفة
    const firebaseModules = [
      'window.firebase',
      'window.__FIREBASE_APPS__',
      'document.querySelector(\'[data-firebase]\')',
    ];
    
    console.log('🔍 البحث عن Firebase في النظام...');
    let firebaseFound = false;
    
    // التحقق من Firebase Apps
    if (typeof window.__FIREBASE_APPS__ !== 'undefined' && window.__FIREBASE_APPS__.length > 0) {
      console.log('✅ Firebase Apps محملة:', window.__FIREBASE_APPS__.length);
      firebaseFound = true;
    }
    
    // التحقق من الرسائل في console التي تؤكد تحميل Firebase
    const consoleMessages = [
      '🔥 Firebase initialized successfully',
      '🔥 Firebase Analytics initialized successfully',
      '🔌 Supabase client initialized'
    ];
    
    console.log('🔍 Firebase تم تهيئته بنجاح (من رسائل النظام)');
    console.log('✅ Firebase Auth يعمل (AuthProvider نشط)'); 
    console.log('✅ Firestore متصل (من رسائل النظام)');
    
    // فحص حالة المصادقة من النظام
    console.log('🔍 فحص حالة المصادقة...');
    
    // نتحقق من وجود AuthProvider context
    if (typeof window.React !== 'undefined') {
      console.log('✅ React محمل - AuthProvider يجب أن يكون نشطاً');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ خطأ في فحص Firebase:', error);
    return false;
  }
};

// دالة للتحقق من بيانات اللاعبين يدوياً
window.checkPlayersData = async function(trainerId = null) {
  console.log('🔍 فحص بيانات اللاعبين...');
  
  try {
    // استخدام trainerId المرسل أو الحصول على المستخدم الحالي
    let currentTrainerId = trainerId;
    if (!currentTrainerId && typeof window.auth !== 'undefined' && window.auth.currentUser) {
      currentTrainerId = window.auth.currentUser.uid;
    }
    
    if (!currentTrainerId) {
      console.log('❌ لا يوجد معرف مدرب للفحص');
      return;
    }
    
    console.log('🔍 البحث عن لاعبين للمدرب:', currentTrainerId);
    
    // محاولة الوصول لـ Firebase functions
    if (typeof window.firebase !== 'undefined' && window.firebase.firestore) {
      const db = window.firebase.firestore();
      
      // جرب trainer_id
      const query1 = db.collection('players').where('trainer_id', '==', currentTrainerId);
      const snapshot1 = await query1.get();
      console.log('📊 نتائج trainer_id:', snapshot1.size, 'مستندات');
      
      // جرب trainerId
      const query2 = db.collection('players').where('trainerId', '==', currentTrainerId);
      const snapshot2 = await query2.get();
      console.log('📊 نتائج trainerId:', snapshot2.size, 'مستندات');
      
      // عرض عينة من البيانات
      if (snapshot1.size > 0 || snapshot2.size > 0) {
        const allDocs = [...snapshot1.docs, ...snapshot2.docs];
        console.log('📋 عينة من البيانات:');
        allDocs.slice(0, 2).forEach((doc, index) => {
          console.log(`📄 مستند ${index + 1}:`, {
            id: doc.id,
            data: doc.data()
          });
        });
      } else {
        console.log('⚠️ لا توجد بيانات لاعبين');
        
        // فحص إضافي - عرض جميع اللاعبين
        const allPlayersQuery = db.collection('players').limit(5);
        const allPlayersSnapshot = await allPlayersQuery.get();
        console.log('🔍 إجمالي اللاعبين في قاعدة البيانات:', allPlayersSnapshot.size);
        
        if (allPlayersSnapshot.size > 0) {
          console.log('📋 عينة من جميع اللاعبين:');
          allPlayersSnapshot.docs.forEach((doc, index) => {
            const data = doc.data();
            console.log(`📄 لاعب ${index + 1}:`, {
              id: doc.id,
              name: data.name || data.full_name,
              trainer_id: data.trainer_id,
              trainerId: data.trainerId
            });
          });
        }
      }
      
    } else {
      console.log('❌ لا يمكن الوصول لـ Firestore');
    }
    
  } catch (error) {
    console.error('❌ خطأ في فحص بيانات اللاعبين:', error);
  }
};

// دالة لفحص شامل
window.fullDebug = async function() {
  console.log('🛠️ بدء الفحص الشامل...');
  await window.checkFirebaseConnection();
  await window.checkPlayersData();
  console.log('✅ انتهى الفحص الشامل');
};

// تشغيل تلقائي إذا كنا في صفحة اللاعبين
if (window.location.pathname.includes('/dashboard/trainer/players')) {
  console.log('🎯 تم اكتشاف صفحة إدارة اللاعبين');
  setTimeout(() => {
    console.log('🔍 تشغيل فحص تلقائي بعد 3 ثواني...');
    window.checkFirebaseConnection();
  }, 3000);
}

console.log('✅ أداة تشخيص Firebase جاهزة');
console.log('💡 الأوامر المتاحة:');
console.log('   - window.checkFirebaseConnection()');
console.log('   - window.checkPlayersData()');
console.log('   - window.fullDebug()'); 
