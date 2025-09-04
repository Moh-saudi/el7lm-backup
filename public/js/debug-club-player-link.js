// أداة تشخيص الربط بين النادي واللاعبين
console.log('🔧 بدء تشخيص الربط بين النادي واللاعبين...');

// دالة التشخيص الرئيسية
window.diagnoseClubPlayerLink = async function() {
  console.log('🎯='.repeat(50));
  console.log('🔍 تشخيص شامل لربط النادي باللاعبين');
  console.log('🎯='.repeat(50));
  
  try {
    // 1. فحص النادي الحالي المصادق
    console.log('\n📋 الخطوة 1: فحص النادي المصادق');
    console.log('='.repeat(40));
    
    // محاولة الحصول على معرف المستخدم الحالي من الصفحة
    let currentUserId = null;
    
    // طريقة 1: من localStorage
    try {
      const authData = localStorage.getItem('authUser');
      if (authData) {
        const parsed = JSON.parse(authData);
        currentUserId = parsed.uid;
        console.log('✅ تم العثور على معرف النادي من localStorage:', currentUserId);
      }
    } catch (e) {
      console.log('⚠️ لم يتم العثور على بيانات المصادقة في localStorage');
    }
    
    // طريقة 2: من URL الحالي
    if (!currentUserId) {
      const currentUrl = window.location.href;
      console.log('🔍 URL الحالي:', currentUrl);
      
      if (currentUrl.includes('/dashboard/club/')) {
        console.log('✅ أنت في dashboard النادي');
        // يمكننا معرفة أن هذا نادي من المسار
      }
    }
    
    // طريقة 3: فحص عناصر الصفحة
    const pageText = document.body.innerText;
    if (pageText.includes('إدارة اللاعبين') || pageText.includes('dashboard/club')) {
      console.log('✅ تأكيد: أنت في حساب نادي');
    }
    
    // 2. فحص بيانات اللاعب علي فراس
    console.log('\n🎯 الخطوة 2: فحص بيانات اللاعب علي فراس');
    console.log('='.repeat(40));
    
    const playerId = 'hChYVnu04cXe3KK8JJQu';
    console.log('🔍 معرف اللاعب:', playerId);
    
    // محاولة جلب البيانات من الصفحة إذا كانت متاحة
    try {
      // البحث عن بيانات اللاعب في الصفحة
      const scripts = document.querySelectorAll('script');
      let playerData = null;
      
      scripts.forEach(script => {
        if (script.textContent.includes(playerId)) {
          console.log('🔍 تم العثور على معرف اللاعب في الصفحة');
        }
      });
      
      // فحص console للبحث عن رسائل Firebase
      console.log('🔍 ابحث في console عن رسائل تحتوي على:');
      console.log('- "بيانات اللاعب الكاملة"');
      console.log('- "club_id" أو "clubId"');
      console.log('- معرف النادي');
      
    } catch (e) {
      console.log('⚠️ لم يتم العثور على بيانات اللاعب في الصفحة');
    }
    
    // 3. التحقق من الارتباط
    console.log('\n🔗 الخطوة 3: التحقق من الارتباط');
    console.log('='.repeat(40));
    
    console.log('💡 للتحقق من الارتباط الصحيح:');
    console.log('1. اذهب إلى صفحة إدارة اللاعبين: http://localhost:3000/dashboard/club/players');
    console.log('2. افتح Developer Tools → Console');
    console.log('3. ابحث عن رسائل تبدأ بـ "🔍 محاولة جلب اللاعبين للنادي"');
    console.log('4. تحقق من معرف النادي المعروض');
    console.log('5. اذهب إلى صفحة التقارير وقارن معرف النادي في بيانات اللاعب');
    
    // 4. الحلول المقترحة
    console.log('\n🔧 الخطوة 4: الحلول المقترحة');
    console.log('='.repeat(40));
    
    console.log('🎯 إذا كان معرف النادي لا يطابق:');
    console.log('- تحقق من طريقة إضافة اللاعبين للنادي');
    console.log('- تأكد من حفظ club_id أو clubId بشكل صحيح');
    console.log('- راجع كود إضافة اللاعبين في صفحة /dashboard/club/players/add');
    
    console.log('\n🎯 إذا كان البحث لا يعمل:');
    console.log('- تحقق من دالة fetchPlayerOrganization');
    console.log('- تأكد من البحث في المجموعة الصحيحة (clubs)');
    console.log('- راجع معالجة الأخطاء في Firebase');
    
  } catch (error) {
    console.error('💥 خطأ في التشخيص:', error);
  }
  
  console.log('\n🎯='.repeat(50));
  console.log('✅ انتهاء التشخيص الشامل');
  console.log('🎯='.repeat(50));
};

// دالة فحص سريع للصفحة الحالية
window.quickPageCheck = function() {
  console.log('🔍 فحص سريع للصفحة الحالية:');
  console.log('='.repeat(30));
  
  const url = window.location.href;
  console.log('📍 URL:', url);
  
  if (url.includes('/dashboard/club/players')) {
    console.log('✅ أنت في صفحة إدارة اللاعبين');
    console.log('🔍 ابحث في console عن:');
    console.log('- "محاولة جلب اللاعبين للنادي"');
    console.log('- معرف النادي');
    console.log('- عدد اللاعبين المجلبين');
  } else if (url.includes('/dashboard/player/reports')) {
    console.log('✅ أنت في صفحة التقارير');
    console.log('🔍 ابحث في console عن:');
    console.log('- "بدء البحث عن الجهة التابع لها"');
    console.log('- "club_id" أو "clubId"');
    console.log('- حالة المنظمة');
  } else if (url.includes('/dashboard/club/profile')) {
    console.log('✅ أنت في صفحة الملف الشخصي للنادي');
    console.log('🔍 ابحث في console عن:');
    console.log('- بيانات النادي');
    console.log('- معرف النادي');
  } else {
    console.log('📍 صفحة أخرى');
  }
  
  // فحص النصوص المعروضة
  const bodyText = document.body.innerText;
  if (bodyText.includes('تابع لجهة')) {
    console.log('✅ الصفحة تعرض "تابع لجهة"');
  } else if (bodyText.includes('لاعب مستقل')) {
    console.log('🔸 الصفحة تعرض "لاعب مستقل"');
  } else if (bodyText.includes('جاري البحث')) {
    console.log('⏳ الصفحة تعرض "جاري البحث"');
  }
};

// تشغيل الفحص السريع تلقائياً
console.log('✅ أداة تشخيص الربط جاهزة!');
console.log('');
console.log('🎮 الأوامر المتاحة:');
console.log('diagnoseClubPlayerLink() - تشخيص شامل');
console.log('quickPageCheck() - فحص سريع للصفحة');
console.log('');

// تشغيل تلقائي
setTimeout(() => {
  quickPageCheck();
}, 1000); 
