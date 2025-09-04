// ملف اختبار شامل للتحقق من حالة اللاعب "علي فراس" والجهة التابع لها
// Test Organization Live - الاختبار المباشر للمنظمة

console.log('🚀 تحميل ملف الاختبار المباشر للمنظمة...');

// اختبار اللاعب "علي فراس" في الوقت الفعلي
async function testAliFerasLive() {
  console.log('🔍 بدء اختبار اللاعب "علي فراس" في الوقت الفعلي...');
  
  const playerId = 'hChYVnu04cXe3KK8JJQu'; // ID اللاعب علي فراس
  
  try {
    // جلب بيانات اللاعب
    console.log('📊 جلب بيانات اللاعب من Firebase...');
    const playerDoc = await firebase.firestore().collection('players').doc(playerId).get();
    
    if (!playerDoc.exists) {
      console.error('❌ اللاعب غير موجود!');
      return;
    }
    
    const playerData = playerDoc.data();
    console.log('✅ بيانات اللاعب:', playerData);
    
    // فحص جميع الحقول المتعلقة بالمنظمة
    console.log('\n🏢 فحص حقول المنظمة:');
    console.log('club_id:', playerData.club_id);
    console.log('clubId:', playerData.clubId);
    console.log('academy_id:', playerData.academy_id);  
    console.log('academyId:', playerData.academyId);
    console.log('trainer_id:', playerData.trainer_id);
    console.log('trainerId:', playerData.trainerId);
    console.log('agent_id:', playerData.agent_id);
    console.log('agentId:', playerData.agentId);
    
    // اختبار البحث في المنظمات
    const organizationFields = [
      { field: 'club_id', alt: 'clubId', collection: 'clubs', type: 'نادي' },
      { field: 'academy_id', alt: 'academyId', collection: 'academies', type: 'أكاديمية' },
      { field: 'trainer_id', alt: 'trainerId', collection: 'trainers', type: 'مدرب' },
      { field: 'agent_id', alt: 'agentId', collection: 'agents', type: 'وكيل' }
    ];
    
    let foundOrganization = null;
    
    for (const org of organizationFields) {
      const orgId = playerData[org.field] || playerData[org.alt];
      
      if (orgId) {
        console.log(`\n🔍 تم العثور على ${org.type} بـ ID: ${orgId}`);
        console.log(`🏢 البحث في مجموعة: ${org.collection}`);
        
        try {
          const orgDoc = await firebase.firestore().collection(org.collection).doc(orgId).get();
          
          if (orgDoc.exists) {
            const orgData = orgDoc.data();
            console.log(`✅ تم العثور على ${org.type}:`, orgData);
            foundOrganization = {
              ...orgData,
              id: orgDoc.id,
              type: org.type
            };
            break;
          } else {
            console.log(`❌ ${org.type} بـ ID ${orgId} غير موجود في قاعدة البيانات`);
          }
        } catch (error) {
          console.error(`💥 خطأ في البحث عن ${org.type}:`, error);
        }
      }
    }
    
    // النتيجة النهائية
    console.log('\n🎯 النتيجة النهائية:');
    if (foundOrganization) {
      console.log('✅ اللاعب منتمي إلى:', foundOrganization.type);
      console.log('📋 اسم الجهة:', foundOrganization.name || foundOrganization.full_name);
      console.log('🏢 معلومات الجهة:', foundOrganization);
    } else {
      console.log('⚪ اللاعب مستقل - غير منتمي لأي جهة');
    }
    
    return foundOrganization;
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

// اختبار التحقق من وجود المجموعات
async function testCollectionsExist() {
  console.log('\n🗂️ التحقق من وجود المجموعات في Firebase...');
  
  const collections = ['clubs', 'academies', 'trainers', 'agents'];
  
  for (const collection of collections) {
    try {
      const snapshot = await firebase.firestore().collection(collection).limit(1).get();
      console.log(`✅ ${collection}: ${snapshot.size} مستند(ات) موجودة`);
    } catch (error) {
      console.error(`❌ خطأ في الوصول لمجموعة ${collection}:`, error);
    }
  }
}

// اختبار شامل للبحث في النادي المحدد
async function testSpecificClub() {
  console.log('\n🏟️ اختبار النادي المحدد...');
  
  const clubId = 'Nwr78w2YdYQhsKqHzPlCPGwGN2B3'; // من بيانات اللاعب
  
  try {
    const clubDoc = await firebase.firestore().collection('clubs').doc(clubId).get();
    
    if (clubDoc.exists) {
      const clubData = clubDoc.data();
      console.log('✅ تم العثور على النادي:', clubData);
      return clubData;
    } else {
      console.log('❌ النادي غير موجود في قاعدة البيانات');
      
      // محاولة البحث في مجموعات أخرى
      console.log('🔍 البحث في مجموعات أخرى...');
      
      const otherCollections = ['academies', 'trainers', 'agents'];
      
      for (const collection of otherCollections) {
        try {
          const doc = await firebase.firestore().collection(collection).doc(clubId).get();
          if (doc.exists) {
            console.log(`✅ تم العثور على المؤسسة في ${collection}:`, doc.data());
            return doc.data();
          }
        } catch (error) {
          console.log(`❌ خطأ في البحث في ${collection}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('❌ خطأ في اختبار النادي:', error);
  }
  
  return null;
}

// تشخيص شامل 
async function fullDiagnosis() {
  console.log('🚨 بدء التشخيص الشامل...\n');
  
  // 1. اختبار الاتصال بـ Firebase
  console.log('1️⃣ اختبار الاتصال بـ Firebase...');
  try {
    const testDoc = await firebase.firestore().collection('test').limit(1).get();
    console.log('✅ الاتصال بـ Firebase يعمل بشكل صحيح');
  } catch (error) {
    console.error('❌ خطأ في الاتصال بـ Firebase:', error);
    return;
  }
  
  // 2. التحقق من وجود المجموعات
  await testCollectionsExist();
  
  // 3. اختبار اللاعب "علي فراس"
  const organization = await testAliFerasLive();
  
  // 4. اختبار النادي المحدد
  await testSpecificClub();
  
  // 5. تقرير نهائي
  console.log('\n📊 التقرير النهائي:');
  console.log('=====================================');
  if (organization) {
    console.log('✅ حالة اللاعب: منتمي');
    console.log('🏢 نوع الجهة:', organization.type);
    console.log('📋 اسم الجهة:', organization.name || organization.full_name);
  } else {
    console.log('⚪ حالة اللاعب: مستقل');
    console.log('💡 الحل المقترح: التحقق من بيانات المنظمة في قاعدة البيانات');
  }
  console.log('=====================================');
}

// تسجيل الدوال في النطاق العام
window.testAliFerasLive = testAliFerasLive;
window.testCollectionsExist = testCollectionsExist; 
window.testSpecificClub = testSpecificClub;
window.fullDiagnosis = fullDiagnosis;

console.log('✅ تم تحميل جميع دوال الاختبار بنجاح!');
console.log('📞 يمكنك الآن استخدام:');
console.log('   - testAliFerasLive() لاختبار اللاعب');
console.log('   - testSpecificClub() لاختبار النادي المحدد');
console.log('   - fullDiagnosis() للتشخيص الشامل'); 
