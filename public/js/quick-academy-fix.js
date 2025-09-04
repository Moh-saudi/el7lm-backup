// حل سريع لمشكلة بيانات الأكاديمية
// انسخ هذا الكود كاملاً وشغله في Console في صفحة الأكاديمية

console.log('🔧 إصلاح سريع لبيانات الأكاديمية');
console.log('📋 انسخ الكود التالي وشغله في Console:');

const quickFixCode = `
// إصلاح سريع - إنشاء بيانات الأكاديمية
(async function createAcademyData() {
  // استيراد Firebase
  const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js');
  const { auth } = window.firebase || await import('/path/to/firebase/config');
  
  // أو استخدام الطريقة المبسطة مع Firebase المحمل في الصفحة
  if (typeof firebase === 'undefined') {
    console.error('❌ Firebase غير محمل في الصفحة');
    return;
  }
  
  const db = firebase.firestore();
  const user = firebase.auth().currentUser;
  
  if (!user) {
    console.error('❌ المستخدم غير مسجل دخول');
    return;
  }
  
  console.log('👤 المستخدم الحالي:', user.uid);
  
  const academyData = {
    name: 'أكاديمية النجوم الرياضية',
    email: user.email,
    phone: '+966501234567',
    website: 'https://stars-academy.com',
    logo: '/images/club-avatar.png',
    location: {
      country: 'السعودية',
      city: 'الرياض',
      address: 'حي النرجس'
    },
    establishedYear: 2015,
    description: 'أكاديمية رياضية متخصصة',
    stats: {
      totalPlayers: 150,
      activePlayers: 120,
      championships: 12
    },
    isVerified: true,
    isPremium: true,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  try {
    await db.collection('academies').doc(user.uid).set(academyData);
    console.log('✅ تم إنشاء بيانات الأكاديمية بنجاح!');
    
    // إعادة تحميل الصفحة
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } catch (error) {
    console.error('❌ خطأ في الحفظ:', error);
  }
})();
`;

console.log('='.repeat(50));
console.log(quickFixCode);
console.log('='.repeat(50));

// سكريبت سريع لربط لاعب بجهة معينة
console.log('🔧 تحميل أداة ربط اللاعبين بالجهات...');

// دالة ربط لاعب بأكاديمية
window.linkPlayerToAcademy = async (playerId, academyId) => {
  try {
    const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js');
    const { db } = await import('/src/lib/firebase/config.ts');
    
    await updateDoc(doc(db, 'players', playerId), {
      academy_id: academyId,
      updated_at: new Date()
    });
    
    console.log(`✅ تم ربط اللاعب ${playerId} بالأكاديمية ${academyId}`);
    return true;
  } catch (error) {
    console.error('❌ خطأ في ربط اللاعب بالأكاديمية:', error);
    return false;
  }
};

// دالة ربط لاعب بمدرب
window.linkPlayerToTrainer = async (playerId, trainerId) => {
  try {
    const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js');
    const { db } = await import('/src/lib/firebase/config.ts');
    
    await updateDoc(doc(db, 'players', playerId), {
      trainer_id: trainerId,
      updated_at: new Date()
    });
    
    console.log(`✅ تم ربط اللاعب ${playerId} بالمدرب ${trainerId}`);
    return true;
  } catch (error) {
    console.error('❌ خطأ في ربط اللاعب بالمدرب:', error);
    return false;
  }
};

// دالة ربط لاعب بنادي
window.linkPlayerToClub = async (playerId, clubId) => {
  try {
    const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js');
    const { db } = await import('/src/lib/firebase/config.ts');
    
    await updateDoc(doc(db, 'players', playerId), {
      club_id: clubId,
      updated_at: new Date()
    });
    
    console.log(`✅ تم ربط اللاعب ${playerId} بالنادي ${clubId}`);
    return true;
  } catch (error) {
    console.error('❌ خطأ في ربط اللاعب بالنادي:', error);
    return false;
  }
};

// دالة البحث عن الجهات
window.findOrganizations = async () => {
  try {
    const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js');
    const { db } = await import('/src/lib/firebase/config.ts');
    
    console.log('🔍 البحث عن الجهات المتاحة...');
    
    // البحث عن الأندية
    const clubsSnapshot = await getDocs(collection(db, 'clubs'));
    const clubs = clubsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'نادي' }));
    console.log('🏢 الأندية:', clubs);
    
    // البحث عن الأكاديميات
    const academiesSnapshot = await getDocs(collection(db, 'academies'));
    const academies = academiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'أكاديمية' }));
    console.log('🏆 الأكاديميات:', academies);
    
    // البحث عن المدربين
    const trainersSnapshot = await getDocs(collection(db, 'trainers'));
    const trainers = trainersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'مدرب' }));
    console.log('👨‍🏫 المدربون:', trainers);
    
    return { clubs, academies, trainers };
  } catch (error) {
    console.error('❌ خطأ في البحث عن الجهات:', error);
    return null;
  }
};

console.log('✅ أداة ربط اللاعبين جاهزة');
console.log('💡 الأوامر المتاحة:');
console.log('   - window.findOrganizations() // البحث عن الجهات');
console.log('   - window.linkPlayerToAcademy("playerId", "academyId")');
console.log('   - window.linkPlayerToTrainer("playerId", "trainerId")');
console.log('   - window.linkPlayerToClub("playerId", "clubId")');

// مثال للاستخدام
console.log('');
console.log('🎯 مثال: ربط محمد جلال بأكاديمية');
console.log('   1. window.findOrganizations() // للعثور على ID الأكاديمية');
console.log('   2. window.linkPlayerToAcademy("3dOQ70vLVVSdDiEmpcMtgCcGAiO2", "ACADEMY_ID")'); 
