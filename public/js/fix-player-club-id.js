// أداة إصلاح معرف النادي للاعب علي فراس
console.log('🔧 أداة إصلاح معرف النادي للاعب');

// دالة إصلاح اللاعب
window.fixPlayerClubId = async function() {
  console.log('🎯 بدء إصلاح معرف النادي للاعب علي فراس...');
  
  try {
    // 1. تحديد معرف اللاعب ومعرف النادي
    const playerId = 'hChYVnu04cXe3KK8JJQu';
    const clubId = 'Nwr78w2YdYQhsKqHzPlCPGwGN2B3'; // معرف نادي أسوان العام
    
    console.log('🎯 معرف اللاعب:', playerId);
    console.log('🏢 معرف النادي:', clubId);
    
    // 2. تأكيد العملية
    const confirmFix = confirm(
      '🔧 هل تريد إصلاح ربط اللاعب علي فراس بنادي أسوان العام؟\n\n' +
      `اللاعب: ${playerId}\n` +
      `النادي: ${clubId}\n\n` +
      'سيتم إضافة club_id و clubId للاعب.'
    );
    
    if (!confirmFix) {
      console.log('❌ تم إلغاء عملية الإصلاح');
      return;
    }
    
    // 3. إصلاح البيانات
    console.log('🔄 جاري إصلاح البيانات...');
    
    // محاولة استخدام Firebase المحمل في الصفحة
    if (typeof firebase === 'undefined' || !firebase.firestore) {
      console.error('❌ Firebase غير متاح. تأكد من أنك في صفحة التطبيق');
      alert('يجب تشغيل هذا الكود في صفحة التطبيق حيث Firebase محمل');
      return;
    }
    
    const db = firebase.firestore();
    const playerRef = db.collection('players').doc(playerId);
    
    // تحديث بيانات اللاعب
    await playerRef.update({
      club_id: clubId,
      clubId: clubId,
      updated_at: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      // إضافة معلومات الإصلاح
      fixed_club_link: true,
      fixed_at: new Date().toISOString(),
      fixed_by: 'manual_script'
    });
    
    console.log('✅ تم إصلاح البيانات بنجاح!');
    console.log('🔄 إعادة تحميل الصفحة لتطبيق التغييرات...');
    
    alert('✅ تم إصلاح ربط اللاعب بالنادي بنجاح!\n\nسيتم إعادة تحميل الصفحة الآن.');
    
    // إعادة تحميل الصفحة
    window.location.reload();
    
  } catch (error) {
    console.error('❌ خطأ في إصلاح البيانات:', error);
    alert('حدث خطأ في إصلاح البيانات: ' + error.message);
  }
};

// دالة التحقق من البيانات قبل الإصلاح
window.checkPlayerData = async function() {
  console.log('🔍 فحص بيانات اللاعب...');
  
  try {
    if (typeof firebase === 'undefined') {
      console.error('❌ Firebase غير متاح');
      return;
    }
    
    const db = firebase.firestore();
    const playerId = 'hChYVnu04cXe3KK8JJQu';
    
    const doc = await db.collection('players').doc(playerId).get();
    
    if (doc.exists) {
      const data = doc.data();
      console.log('📋 بيانات اللاعب الحالية:');
      console.log('- الاسم:', data.full_name);
      console.log('- club_id:', data.club_id || 'غير موجود');
      console.log('- clubId:', data.clubId || 'غير موجود');
      console.log('- academy_id:', data.academy_id || 'غير موجود');
      console.log('- trainer_id:', data.trainer_id || 'غير موجود');
      console.log('- agent_id:', data.agent_id || 'غير موجود');
      
      if (!data.club_id && !data.clubId) {
        console.log('⚠️ اللاعب يحتاج إلى إصلاح - لا يوجد معرف نادي');
        console.log('💡 استخدم fixPlayerClubId() لإصلاح المشكلة');
      } else {
        console.log('✅ اللاعب مرتبط بجهة بالفعل');
      }
    } else {
      console.log('❌ اللاعب غير موجود');
    }
    
  } catch (error) {
    console.error('❌ خطأ في فحص البيانات:', error);
  }
};

// تشغيل تلقائي للفحص
console.log('✅ أداة الإصلاح جاهزة!');
console.log('');
console.log('🎮 الأوامر المتاحة:');
console.log('checkPlayerData() - فحص بيانات اللاعب');
console.log('fixPlayerClubId() - إصلاح ربط اللاعب بالنادي');
console.log('');

// فحص تلقائي
setTimeout(() => {
  console.log('🚀 تشغيل الفحص التلقائي...');
  checkPlayerData();
}, 1000); 
