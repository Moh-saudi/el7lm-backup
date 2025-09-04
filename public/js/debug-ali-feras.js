// تشخيص مباشر للاعب علي فراس
console.log('🚨 بدء تشخيص مباشر للاعب علي فراس...');

// معلومات اللاعب
const PLAYER_ID = 'hChYVnu04cXe3KK8JJQu';

// دالة تشخيص شاملة
async function debugAliFeras() {
    console.log('🔍 بدء التشخيص الشامل...');
    
    try {
        // 1. جلب بيانات اللاعب
        console.log('📊 جلب بيانات اللاعب...');
        const playerDoc = await firebase.firestore().collection('players').doc(PLAYER_ID).get();
        
        if (!playerDoc.exists) {
            console.error('❌ اللاعب غير موجود!');
            return;
        }
        
        const playerData = playerDoc.data();
        console.log('✅ بيانات اللاعب الكاملة:', playerData);
        
        // 2. فحص تاريخ الميلاد
        console.log('\n📅 فحص تاريخ الميلاد:');
        console.log('birth_date raw:', playerData.birth_date);
        console.log('birth_date type:', typeof playerData.birth_date);
        
        if (playerData.birth_date) {
            if (playerData.birth_date.toDate && typeof playerData.birth_date.toDate === 'function') {
                const birthDate = playerData.birth_date.toDate();
                console.log('✅ تاريخ الميلاد محول:', birthDate);
                console.log('✅ تاريخ الميلاد مُنسق:', birthDate.toLocaleDateString('ar-SA'));
            } else if (playerData.birth_date instanceof Date) {
                console.log('✅ تاريخ الميلاد (Date object):', playerData.birth_date);
            } else {
                console.log('⚠️ تاريخ الميلاد غير قابل للتحويل');
                try {
                    const date = new Date(playerData.birth_date);
                    console.log('✅ تاريخ الميلاد بعد التحويل:', date);
                } catch (error) {
                    console.error('❌ خطأ في تحويل التاريخ:', error);
                }
            }
        } else {
            console.log('❌ لا يوجد تاريخ ميلاد');
        }
        
        // 3. فحص حقول المنظمة
        console.log('\n🏢 فحص حقول المنظمة:');
        const orgFields = ['club_id', 'clubId', 'academy_id', 'academyId', 'trainer_id', 'trainerId', 'agent_id', 'agentId'];
        
        for (const field of orgFields) {
            const value = playerData[field];
            console.log(`${field}:`, value);
        }
        
        // 4. اختبار البحث في النادي المحدد
        const clubId = playerData.club_id || playerData.clubId;
        if (clubId) {
            console.log(`\n🏟️ البحث عن النادي بـ ID: ${clubId}`);
            
            try {
                const clubDoc = await firebase.firestore().collection('clubs').doc(clubId).get();
                if (clubDoc.exists) {
                    const clubData = clubDoc.data();
                    console.log('✅ تم العثور على النادي:', clubData);
                    
                    // اختبار الحقول المطلوبة
                    console.log('📋 معلومات النادي:');
                    console.log('  - الاسم:', clubData.name || clubData.full_name);
                    console.log('  - المدينة:', clubData.city);
                    console.log('  - الدولة:', clubData.country);
                    console.log('  - الهاتف:', clubData.phone);
                    console.log('  - الإيميل:', clubData.email);
                    
                } else {
                    console.log('❌ النادي غير موجود في قاعدة البيانات');
                }
            } catch (error) {
                console.error('💥 خطأ في البحث عن النادي:', error);
            }
        } else {
            console.log('❌ لا يوجد ID نادي في بيانات اللاعب');
        }
        
        // 5. فحص المجموعات المتاحة
        console.log('\n🗂️ فحص المجموعات المتاحة:');
        const collections = ['clubs', 'academies', 'trainers', 'agents'];
        
        for (const collection of collections) {
            try {
                const snapshot = await firebase.firestore().collection(collection).limit(1).get();
                console.log(`✅ ${collection}: ${snapshot.size} مستند متاح`);
            } catch (error) {
                console.error(`❌ خطأ في الوصول للمجموعة ${collection}:`, error);
            }
        }
        
        // 6. محاولة إصلاح البيانات
        console.log('\n🔧 محاولة إصلاح البيانات...');
        
        // إصلاح تاريخ الميلاد
        if (playerData.birth_date && typeof playerData.birth_date === 'string') {
            console.log('🔧 محاولة إصلاح تاريخ الميلاد...');
            const fixedDate = new Date(playerData.birth_date);
            if (!isNaN(fixedDate.getTime())) {
                console.log('✅ تاريخ الميلاد مُصحح:', fixedDate);
                
                // تحديث البيانات
                try {
                    await firebase.firestore().collection('players').doc(PLAYER_ID).update({
                        birth_date: firebase.firestore.Timestamp.fromDate(fixedDate)
                    });
                    console.log('✅ تم تحديث تاريخ الميلاد في قاعدة البيانات');
                } catch (error) {
                    console.error('❌ خطأ في تحديث تاريخ الميلاد:', error);
                }
            }
        }
        
        return {
            player: playerData,
            hasClub: !!(playerData.club_id || playerData.clubId),
            clubId: playerData.club_id || playerData.clubId,
            birthDate: playerData.birth_date
        };
        
    } catch (error) {
        console.error('💥 خطأ في التشخيص:', error);
    }
}

// دالة لإصلاح البيانات
async function fixPlayerData() {
    console.log('🔧 بدء إصلاح بيانات اللاعب...');
    
    try {
        const result = await debugAliFeras();
        
        if (result && result.hasClub) {
            console.log('✅ اللاعب منتمي لنادي، المشكلة في العرض');
            
            // إعادة تحميل الصفحة
            console.log('🔄 إعادة تحميل الصفحة...');
            window.location.reload();
            
        } else {
            console.log('❌ اللاعب غير منتمي لنادي أو هناك مشكلة في البيانات');
        }
        
    } catch (error) {
        console.error('💥 خطأ في الإصلاح:', error);
    }
}

// دالة لاختبار Firebase
async function testFirebase() {
    console.log('🔥 اختبار Firebase...');
    
    try {
        // اختبار الاتصال
        const testQuery = await firebase.firestore().collection('players').limit(1).get();
        console.log('✅ Firebase يعمل بشكل صحيح');
        
        // اختبار الصلاحيات
        const playerDoc = await firebase.firestore().collection('players').doc(PLAYER_ID).get();
        console.log('✅ يمكن الوصول لبيانات اللاعب');
        
        return true;
    } catch (error) {
        console.error('❌ مشكلة في Firebase:', error);
        return false;
    }
}

// تسجيل الدوال
window.debugAliFeras = debugAliFeras;
window.fixPlayerData = fixPlayerData;
window.testFirebase = testFirebase;

console.log('✅ تم تحميل أدوات التشخيص');
console.log('📞 الأوامر المتاحة:');
console.log('  - debugAliFeras() - تشخيص شامل');
console.log('  - fixPlayerData() - إصلاح البيانات');
console.log('  - testFirebase() - اختبار Firebase');

// تشغيل التشخيص تلقائياً
debugAliFeras(); 
