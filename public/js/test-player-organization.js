// Test script for player organization detection
console.log('🔍 اختبار دوال تحديد انتماء اللاعبين...');

// دالة اختبار محاكاة لـ getPlayerOrganization
function testGetPlayerOrganization(playerData) {
  console.log('🔍 تحديد انتماء اللاعب:', {
    club_id: playerData?.club_id,
    clubId: playerData?.clubId,
    academy_id: playerData?.academy_id,
    academyId: playerData?.academyId,
    trainer_id: playerData?.trainer_id,
    trainerId: playerData?.trainerId,
    agent_id: playerData?.agent_id,
    agentId: playerData?.agentId,
  });

  // البحث عن النادي
  const clubId = playerData?.club_id || playerData?.clubId;
  if (clubId) {
    console.log('✅ اللاعب تابع لنادي:', clubId);
    return {
      type: 'club',
      id: clubId,
      typeArabic: 'نادي',
      emoji: '🏢'
    };
  }

  // البحث عن الأكاديمية
  const academyId = playerData?.academy_id || playerData?.academyId;
  if (academyId) {
    console.log('✅ اللاعب تابع لأكاديمية:', academyId);
    return {
      type: 'academy',
      id: academyId,
      typeArabic: 'أكاديمية',
      emoji: '🏆'
    };
  }

  // البحث عن المدرب
  const trainerId = playerData?.trainer_id || playerData?.trainerId;
  if (trainerId) {
    console.log('✅ اللاعب تابع لمدرب:', trainerId);
    return {
      type: 'trainer',
      id: trainerId,
      typeArabic: 'مدرب',
      emoji: '👨‍🏫'
    };
  }

  // البحث عن الوكيل
  const agentId = playerData?.agent_id || playerData?.agentId;
  if (agentId) {
    console.log('✅ اللاعب تابع لوكيل:', agentId);
    return {
      type: 'agent',
      id: agentId,
      typeArabic: 'وكيل لاعبين',
      emoji: '💼'
    };
  }

  console.log('⚠️ اللاعب مستقل - لا يتبع لأي جهة');
  return {
    type: 'independent',
    id: null,
    typeArabic: 'مستقل',
    emoji: '🔥'
  };
}

// اختبار اللاعب الحقيقي "علي فراس"
window.testAliPlayer = async () => {
  try {
    console.group('🧪 اختبار اللاعب علي فراس');
    
    // بيانات اللاعب من الـ logs السابقة
    const playerData = {
      full_name: 'علي فراس',
      clubId: 'Nwr78w2YdYQhsKqHzPlCPGwGN2B3', // هذا هو المشكلة - يجب أن يكون clubId
      nationality: 'مصري',
      city: 'القاهرة',
      country: 'مصري'
    };
    
    console.log('📋 بيانات اللاعب:', playerData);
    
    // اختبار النظام القديم (الخاطئ)
    console.log('\n❌ النظام القديم (البحث عن club_id فقط):');
    const oldResult = playerData.club_id ? 'نادي' : 'مستقل';
    console.log('النتيجة:', oldResult);
    
    // اختبار النظام الجديد (المحسن)
    console.log('\n✅ النظام الجديد (البحث عن clubId أيضاً):');
    const newResult = testGetPlayerOrganization(playerData);
    console.log('النتيجة:', newResult);
    
    console.groupEnd();
    return newResult;
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
    return null;
  }
};

// اختبار عدة حالات مختلفة
window.testAllCases = () => {
  console.group('🧪 اختبار جميع الحالات');
  
  const testCases = [
    {
      name: 'لاعب نادي (clubId)',
      data: { clubId: 'club123', full_name: 'لاعب نادي 1' }
    },
    {
      name: 'لاعب نادي (club_id)',
      data: { club_id: 'club456', full_name: 'لاعب نادي 2' }
    },
    {
      name: 'لاعب مدرب (trainerId)',
      data: { trainerId: 'trainer123', full_name: 'لاعب مدرب 1' }
    },
    {
      name: 'لاعب مدرب (trainer_id)',
      data: { trainer_id: 'trainer456', full_name: 'لاعب مدرب 2' }
    },
    {
      name: 'لاعب أكاديمية (academyId)',
      data: { academyId: 'academy123', full_name: 'لاعب أكاديمية 1' }
    },
    {
      name: 'لاعب وكيل (agentId)',
      data: { agentId: 'agent123', full_name: 'لاعب وكيل 1' }
    },
    {
      name: 'لاعب مستقل',
      data: { full_name: 'لاعب مستقل' }
    }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`\n${index + 1}. ${testCase.name}:`);
    const result = testGetPlayerOrganization(testCase.data);
    console.log(`   ${result.emoji} ${result.typeArabic}${result.id ? ` (${result.id})` : ''}`);
  });
  
  console.groupEnd();
};

// اختبار اللاعب الفعلي من قاعدة البيانات
window.testRealPlayer = async (playerId = 'hChYVnu04cXe3KK8JJQu') => {
  try {
    console.group(`🔍 اختبار اللاعب الفعلي: ${playerId}`);
    
    // جلب البيانات من Firebase
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js');
    const { db } = await import('/src/lib/firebase/config.ts');
    
    const playerDoc = await getDoc(doc(db, 'players', playerId));
    
    if (playerDoc.exists()) {
      const playerData = playerDoc.data();
      console.log('📋 بيانات اللاعب من Firebase:', playerData);
      
      // اختبار الدالة الجديدة
      const organization = testGetPlayerOrganization(playerData);
      console.log('🎯 النتيجة:', organization);
      
      // عرض التحليل المفصل
      console.log('\n📊 تحليل مفصل:');
      console.log('  الاسم:', playerData.full_name || playerData.name);
      console.log('  النوع:', organization.emoji, organization.typeArabic);
      if (organization.id) {
        console.log('  المعرف:', organization.id);
      }
      
      console.groupEnd();
      return organization;
    } else {
      console.log('❌ اللاعب غير موجود');
      console.groupEnd();
      return null;
    }
  } catch (error) {
    console.error('❌ خطأ في جلب بيانات اللاعب:', error);
    console.groupEnd();
    return null;
  }
};

// دالة إصلاح اللاعب (إضافة club_id إذا كان clubId موجود)
window.fixPlayerOrganization = async (playerId = 'hChYVnu04cXe3KK8JJQu') => {
  try {
    console.group(`🔧 إصلاح انتماء اللاعب: ${playerId}`);
    
    const { doc, getDoc, updateDoc } = await import('https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js');
    const { db } = await import('/src/lib/firebase/config.ts');
    
    const playerDoc = await getDoc(doc(db, 'players', playerId));
    
    if (playerDoc.exists()) {
      const playerData = playerDoc.data();
      const updates = {};
      
      // إضافة club_id إذا كان clubId موجود
      if (playerData.clubId && !playerData.club_id) {
        updates.club_id = playerData.clubId;
        console.log('✅ سيتم إضافة club_id:', playerData.clubId);
      }
      
      // إضافة academy_id إذا كان academyId موجود
      if (playerData.academyId && !playerData.academy_id) {
        updates.academy_id = playerData.academyId;
        console.log('✅ سيتم إضافة academy_id:', playerData.academyId);
      }
      
      // إضافة trainer_id إذا كان trainerId موجود
      if (playerData.trainerId && !playerData.trainer_id) {
        updates.trainer_id = playerData.trainerId;
        console.log('✅ سيتم إضافة trainer_id:', playerData.trainerId);
      }
      
      // إضافة agent_id إذا كان agentId موجود
      if (playerData.agentId && !playerData.agent_id) {
        updates.agent_id = playerData.agentId;
        console.log('✅ سيتم إضافة agent_id:', playerData.agentId);
      }
      
      if (Object.keys(updates).length > 0) {
        console.log('📝 التحديثات المطلوبة:', updates);
        
        // تطبيق التحديثات
        await updateDoc(doc(db, 'players', playerId), {
          ...updates,
          updated_at: new Date()
        });
        
        console.log('✅ تم إصلاح بيانات اللاعب بنجاح!');
        
        // اختبار النتيجة
        const updatedDoc = await getDoc(doc(db, 'players', playerId));
        const organization = testGetPlayerOrganization(updatedDoc.data());
        console.log('🎯 النتيجة بعد الإصلاح:', organization);
        
      } else {
        console.log('ℹ️ لا يحتاج اللاعب لإصلاح - البيانات صحيحة');
      }
      
      console.groupEnd();
      return true;
    } else {
      console.log('❌ اللاعب غير موجود');
      console.groupEnd();
      return false;
    }
  } catch (error) {
    console.error('❌ خطأ في إصلاح اللاعب:', error);
    console.groupEnd();
    return false;
  }
};

// تنفيذ الاختبارات
console.log('✅ أداة اختبار انتماء اللاعبين جاهزة');
console.log('💡 الأوامر المتاحة:');
console.log('   - window.testAliPlayer() // اختبار علي فراس');
console.log('   - window.testAllCases() // اختبار جميع الحالات');
console.log('   - window.testRealPlayer() // اختبار لاعب حقيقي');
console.log('   - window.fixPlayerOrganization() // إصلاح بيانات اللاعب');

// تشغيل اختبار سريع
window.testAliPlayer(); 
