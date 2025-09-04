// أداة تشخيص شاملة لمشكلة الانتماء - إصدار متصفح
console.log('🔧 تشغيل أداة التشخيص الشاملة للانتماء...');

// استخدام Firebase المُحمل مسبقاً من الصفحة
const { getFirestore, doc, getDoc, collection, query, where, getDocs } = window.firebase;
const db = getFirestore();

// دالة التشخيص الشامل
window.debugOrganizationDetailed = async function(playerId) {
  console.log('🎯='.repeat(50));
  console.log('🔍 بدء التشخيص الشامل للاعب:', playerId);
  console.log('🎯='.repeat(50));
  
  try {
    // جلب بيانات اللاعب
    console.log('📥 جلب بيانات اللاعب من Firebase...');
    const playerDoc = await getDoc(doc(db, 'players', playerId));
    
    if (!playerDoc.exists()) {
      console.error('❌ اللاعب غير موجود!');
      return;
    }
    
    const playerData = playerDoc.data();
    console.log('✅ بيانات اللاعب جُلبت بنجاح:', playerData);
    
    // فحص جميع الحقول المحتملة للانتماء
    console.log('\n🔎 فحص حقول الانتماء:');
    console.log('='.repeat(40));
    
    const organizationFields = [
      { field: 'club_id', alt: 'clubId', collection: 'clubs', type: 'نادي', icon: '🏢' },
      { field: 'academy_id', alt: 'academyId', collection: 'academies', type: 'أكاديمية', icon: '🏆' },
      { field: 'trainer_id', alt: 'trainerId', collection: 'trainers', type: 'مدرب', icon: '👨‍🏫' },
      { field: 'agent_id', alt: 'agentId', collection: 'agents', type: 'وكيل لاعبين', icon: '💼' }
    ];
    
    let foundOrganization = null;
    
    for (const orgField of organizationFields) {
      const primaryValue = playerData[orgField.field];
      const altValue = playerData[orgField.alt];
      const finalValue = primaryValue || altValue;
      
      console.log(`${orgField.icon} ${orgField.type}:`);
      console.log(`   ${orgField.field}: ${primaryValue || 'غير موجود'}`);
      console.log(`   ${orgField.alt}: ${altValue || 'غير موجود'}`);
      console.log(`   القيمة النهائية: ${finalValue || 'لا يوجد'}`);
      
      if (finalValue) {
        console.log(`   ✨ تم العثور على قيمة! البحث في collection: ${orgField.collection}`);
        
        try {
          const orgDoc = await getDoc(doc(db, orgField.collection, finalValue));
          
          if (orgDoc.exists()) {
            const orgData = orgDoc.data();
            foundOrganization = {
              id: orgDoc.id,
              type: orgField.type,
              icon: orgField.icon,
              data: orgData,
              collection: orgField.collection
            };
            
            console.log(`   ✅ تم العثور على ${orgField.type} في قاعدة البيانات!`);
            console.log(`   📋 البيانات:`, orgData);
            console.log(`   🏷️ الاسم: ${orgData.name || orgData.full_name || 'غير محدد'}`);
            console.log(`   🎨 اللوجو: ${orgData.logo || 'غير موجود'}`);
            
            break; // خروج من الحلقة
          } else {
            console.log(`   ❌ ${orgField.type} بـ ID ${finalValue} غير موجود في قاعدة البيانات`);
          }
        } catch (error) {
          console.error(`   💥 خطأ في البحث عن ${orgField.type}:`, error);
        }
      }
      
      console.log(''); // سطر فارغ
    }
    
    // النتيجة النهائية
    console.log('\n🎯 النتيجة النهائية:');
    console.log('='.repeat(40));
    
    if (foundOrganization) {
      console.log(`✅ اللاعب تابع لـ: ${foundOrganization.type}`);
      console.log(`📝 الاسم: ${foundOrganization.data.name || foundOrganization.data.full_name || 'غير محدد'}`);
      console.log(`🆔 ID: ${foundOrganization.id}`);
      console.log(`📊 Collection: ${foundOrganization.collection}`);
      console.log(`🎨 اللوجو: ${foundOrganization.data.logo || 'غير موجود'}`);
      
      // معلومات إضافية
      if (foundOrganization.data.email) console.log(`📧 البريد: ${foundOrganization.data.email}`);
      if (foundOrganization.data.phone) console.log(`📱 الهاتف: ${foundOrganization.data.phone}`);
      if (foundOrganization.data.city) console.log(`📍 المدينة: ${foundOrganization.data.city}`);
      
    } else {
      console.log('🔸 اللاعب مستقل - غير تابع لأي جهة');
      
      // اقتراحات للإصلاح
      console.log('\n💡 اقتراحات للإصلاح:');
      console.log('1. تحقق من أن بيانات الانتماء موجودة في قاعدة البيانات');
      console.log('2. تأكد من أن الـ ID صحيح ومطابق');
      console.log('3. تحقق من أن المنظمة موجودة في collection المناسب');
    }
    
    // فحص إضافي: البحث العكسي
    console.log('\n🔄 فحص إضافي: البحث العكسي...');
    console.log('='.repeat(40));
    
    for (const orgField of organizationFields) {
      try {
        console.log(`🔍 البحث في ${orgField.collection} عن اللاعب ${playerId}...`);
        
        // البحث بالحقل الأساسي
        const q1 = query(
          collection(db, orgField.collection), 
          where('players', 'array-contains', playerId)
        );
        
        const snapshot1 = await getDocs(q1);
        
        if (!snapshot1.empty) {
          snapshot1.forEach(doc => {
            console.log(`✅ تم العثور على اللاعب في ${orgField.type}: ${doc.id}`);
            console.log(`📋 بيانات المنظمة:`, doc.data());
          });
        } else {
          console.log(`⚪ لم يتم العثور على اللاعب في ${orgField.collection}`);
        }
        
      } catch (error) {
        console.log(`⚠️ خطأ في البحث العكسي في ${orgField.collection}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('💥 خطأ في التشخيص:', error);
  }
  
  console.log('\n🎯='.repeat(50));
  console.log('✅ انتهاء التشخيص الشامل');
  console.log('🎯='.repeat(50));
};

// دالة اختبار سريعة للاعبين المحددين
window.testSpecificPlayers = async function() {
  console.log('🧪 اختبار اللاعبين المحددين...');
  
  const players = [
    { id: 'hChYVnu04cXe3KK8JJQu', name: 'علي فراس', expected: 'نادي' },
    { id: 'c9F975YF3XWBssiXaaZItbBVM2Q2', name: 'لاعب آخر', expected: 'مستقل' }
  ];
  
  for (const player of players) {
    console.log(`\n🎯 اختبار ${player.name} (${player.id}):`);
    console.log(`متوقع: ${player.expected}`);
    console.log('-'.repeat(50));
    
    await debugOrganizationDetailed(player.id);
  }
};

// دالة فحص حالة الواجهة
window.checkUIState = function() {
  console.log('🖥️ فحص حالة الواجهة:');
  console.log('='.repeat(30));
  
  // فحص العناصر الموجودة في الصفحة
  const organizationSection = document.querySelector('[class*="الجهة التابع لها"]');
  const organizationLoading = document.querySelector('[class*="جاري البحث"]');
  const independentPlayer = document.querySelector('[class*="لاعب مستقل"]');
  
  console.log('📋 عناصر الواجهة:');
  console.log(`   قسم المنظمة: ${organizationSection ? '✅ موجود' : '❌ غير موجود'}`);
  console.log(`   مؤشر التحميل: ${organizationLoading ? '✅ موجود' : '❌ غير موجود'}`);
  console.log(`   نص "لاعب مستقل": ${independentPlayer ? '✅ موجود' : '❌ غير موجود'}`);
  
  // فحص الـ console للأخطاء
  console.log('\n🔍 فحص console للأخطاء JavaScript...');
  console.log('ابحث في console عن:');
  console.log('- أخطاء Firebase');
  console.log('- أخطاء في تحميل البيانات');
  console.log('- مشاكل في الشبكة');
};

// تشغيل تلقائي للتشخيص
console.log('✅ أداة التشخيص الشاملة جاهزة!');
console.log('');
console.log('🎮 الأوامر المتاحة:');
console.log('debugOrganizationDetailed("PLAYER_ID") - تشخيص لاعب محدد');
console.log('testSpecificPlayers() - اختبار اللاعبين المحددين');
console.log('checkUIState() - فحص حالة الواجهة');
console.log('');
console.log('🚀 تشغيل الاختبار التلقائي...');

// تشغيل تلقائي للاختبار
setTimeout(() => {
  testSpecificPlayers();
}, 1000); 
