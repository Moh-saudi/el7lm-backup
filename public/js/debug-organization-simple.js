// أداة تشخيص بسيطة لمشكلة الانتماء
console.log('🔧 أداة التشخيص البسيطة للانتماء');

// دالة فحص بيانات اللاعب مباشرة من console
window.debugPlayerOrganization = async function(playerId = 'hChYVnu04cXe3KK8JJQu') {
  console.log('🎯='.repeat(50));
  console.log('🔍 تشخيص تبعية اللاعب:', playerId);
  console.log('🎯='.repeat(50));
  
  try {
    // محاولة الوصول لـ Firebase من الصفحة
    if (typeof firebase === 'undefined') {
      console.error('❌ Firebase غير محمل! تأكد من أنك في صفحة التطبيق');
      return;
    }
    
    console.log('✅ Firebase متاح');
    
    // جلب بيانات اللاعب من API
    console.log('📡 جلب بيانات اللاعب من API...');
    
    const response = await fetch(`/api/player/${playerId}`);
    if (!response.ok) {
      console.error('❌ فشل في جلب بيانات اللاعب من API');
      return;
    }
    
    const playerData = await response.json();
    console.log('✅ بيانات اللاعب من API:', playerData);
    
    // فحص حقول الانتماء
    console.log('\n🔎 فحص حقول الانتماء:');
    console.log('='.repeat(40));
    
    const fields = [
      'club_id', 'clubId', 
      'academy_id', 'academyId',
      'trainer_id', 'trainerId',
      'agent_id', 'agentId'
    ];
    
    fields.forEach(field => {
      const value = playerData[field];
      console.log(`${field}: ${value || 'غير موجود'}`);
    });
    
    // تحديد النتيجة
    const hasClub = playerData.club_id || playerData.clubId;
    const hasAcademy = playerData.academy_id || playerData.academyId;
    const hasTrainer = playerData.trainer_id || playerData.trainerId;
    const hasAgent = playerData.agent_id || playerData.agentId;
    
    console.log('\n🎯 النتائج:');
    console.log('='.repeat(20));
    
    if (hasClub) {
      console.log(`✅ تابع لنادي: ${hasClub}`);
    } else if (hasAcademy) {
      console.log(`✅ تابع لأكاديمية: ${hasAcademy}`);
    } else if (hasTrainer) {
      console.log(`✅ تابع لمدرب: ${hasTrainer}`);
    } else if (hasAgent) {
      console.log(`✅ تابع لوكيل: ${hasAgent}`);
    } else {
      console.log('🔸 لاعب مستقل');
    }
    
  } catch (error) {
    console.error('💥 خطأ في التشخيص:', error);
  }
  
  console.log('\n🎯='.repeat(50));
};

// دالة فحص الواجهة الحالية
window.checkCurrentUI = function() {
  console.log('🖥️ فحص الواجهة الحالية:');
  console.log('='.repeat(30));
  
  // البحث عن النصوص في الصفحة
  const pageText = document.body.innerText;
  
  console.log('📋 فحص النصوص المعروضة:');
  
  if (pageText.includes('تابع لجهة')) {
    console.log('✅ يظهر "تابع لجهة"');
  } else if (pageText.includes('لاعب مستقل')) {
    console.log('🔸 يظهر "لاعب مستقل"');
  } else if (pageText.includes('جاري البحث')) {
    console.log('⏳ يظهر "جاري البحث"');
  } else {
    console.log('❓ حالة غير واضحة');
  }
  
  // فحص console للأخطاء
  console.log('\n🔍 تحقق من console للأخطاء:');
  console.log('ابحث عن رسائل تبدأ بـ:');
  console.log('- "🔍 بدء البحث عن الجهة"');
  console.log('- "✅ تم العثور على"');
  console.log('- "❌ خطأ في"');
};

// دالة إعادة تحميل البيانات
window.forceRefreshOrganization = function() {
  console.log('🔄 إعادة تحميل الصفحة لتحديث البيانات...');
  window.location.reload();
};

console.log('✅ أداة التشخيص البسيطة جاهزة!');
console.log('');
console.log('🎮 الأوامر المتاحة:');
console.log('debugPlayerOrganization("PLAYER_ID") - فحص لاعب محدد');
console.log('debugPlayerOrganization() - فحص علي فراس (افتراضي)');
console.log('checkCurrentUI() - فحص الواجهة الحالية');
console.log('forceRefreshOrganization() - إعادة تحميل الصفحة');
console.log('');

// تشغيل تلقائي للفحص
setTimeout(() => {
  console.log('🚀 تشغيل الفحص التلقائي...');
  checkCurrentUI();
}, 1000); 
