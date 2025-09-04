// 🚀 إصلاح سريع لأخطاء الصور
// Quick Image Fix Script

console.log('🚀 بدء الإصلاح السريع لأخطاء الصور...');

// إعداد Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDGpAHia_wEmrhnmYjrPf1n1TrAzwEMiAI",
    authDomain: "hagz-85b65.firebaseapp.com",
    projectId: "hagz-85b65",
    storageBucket: "hagz-85b65.appspot.com",
    messagingSenderId: "692767777581",
    appId: "1:692767777581:web:5b998ed1c834bc35b78b5f"
};

// إصلاح سريع شامل
async function quickImageFix() {
    try {
        console.log('📱 تحميل Firebase...');
        
        // استيراد Firebase بشكل ديناميكي
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js');
        const { getFirestore, collection, getDocs, doc, updateDoc, writeBatch } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
        
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        
        console.log('🔍 فحص قاعدة البيانات...');
        
        // الحصول على جميع اللاعبين
        const playersSnapshot = await getDocs(collection(db, 'players'));
        console.log(`📊 تم العثور على ${playersSnapshot.size} لاعب`);
        
        // إحصائيات
        let testUrlCount = 0;
        let brokenSupabaseCount = 0;
        let totalFixed = 0;
        
        // استخدام batch للتحديث الجماعي
        const batch = writeBatch(db);
        let batchCount = 0;
        
        // فحص كل لاعب
        for (const docSnapshot of playersSnapshot.docs) {
            const data = docSnapshot.data();
            let needsUpdate = false;
            const updates = {};
            
            // فحص profile_image_url
            if (data.profile_image_url) {
                const imageUrl = data.profile_image_url;
                
                if (imageUrl.includes('test-url.com')) {
                    updates.profile_image_url = '/images/default-avatar.png';
                    testUrlCount++;
                    needsUpdate = true;
                }
                
                if (imageUrl.includes('supabase.co') && 
                    (imageUrl.includes('undefined') || imageUrl.includes('null') || !imageUrl.includes('default'))) {
                    updates.profile_image_url = '/images/default-avatar.png';
                    brokenSupabaseCount++;
                    needsUpdate = true;
                }
            }
            
            // فحص profile_image
            if (data.profile_image) {
                const imageUrl = data.profile_image;
                
                if (imageUrl.includes('test-url.com')) {
                    updates.profile_image = '/images/default-avatar.png';
                    needsUpdate = true;
                }
                
                if (imageUrl.includes('supabase.co') && 
                    (imageUrl.includes('undefined') || imageUrl.includes('null') || !imageUrl.includes('default'))) {
                    updates.profile_image = '/images/default-avatar.png';
                    needsUpdate = true;
                }
            }
            
            // إضافة للـ batch إذا احتاج تحديث
            if (needsUpdate) {
                batch.update(doc(db, 'players', docSnapshot.id), updates);
                totalFixed++;
                batchCount++;
                
                // تنفيذ batch كل 500 عملية لتجنب حدود Firestore
                if (batchCount >= 500) {
                    await batch.commit();
                    console.log(`✅ تم حفظ ${batchCount} تحديث...`);
                    batchCount = 0;
                }
                
                console.log(`🔧 إصلاح: ${data.full_name || docSnapshot.id}`);
            }
        }
        
        // تنفيذ أي تحديثات متبقية
        if (batchCount > 0) {
            await batch.commit();
            console.log(`✅ تم حفظ ${batchCount} تحديث أخير...`);
        }
        
        // تقرير النتائج
        console.log('\n🎉 تم إنهاء الإصلاح السريع!');
        console.log('📊 النتائج:');
        console.log(`   🔗 صور test-url تم إصلاحها: ${testUrlCount}`);
        console.log(`   💾 صور Supabase تم إصلاحها: ${brokenSupabaseCount}`);
        console.log(`   ✅ إجمالي الملفات المُحدثة: ${totalFixed}`);
        
        if (totalFixed > 0) {
            console.log('\n💡 أعد تشغيل خادم التطوير الآن لرؤية النتائج');
            console.log('💡 تشغيل: npm run dev');
        } else {
            console.log('\n✅ لا توجد مشاكل! جميع الصور سليمة');
        }
        
        return {
            testUrlCount,
            brokenSupabaseCount,
            totalFixed,
            success: true
        };
        
    } catch (error) {
        console.error('❌ خطأ في الإصلاح السريع:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// تشغيل الإصلاح السريع تلقائياً
quickImageFix().then(result => {
    if (result.success) {
        console.log('\n🚀 الإصلاح السريع مكتمل!');
        
        // إضافة نصائح للمطور
        if (result.totalFixed > 0) {
            console.log('\n📋 خطوات ما بعد الإصلاح:');
            console.log('1. أعد تشغيل خادم التطوير');
            console.log('2. امسح ذاكرة التخزين المؤقت للمتصفح');
            console.log('3. اختبر الصور في صفحات مختلفة');
            console.log('\n💡 نصيحة: استخدم SafeImage component للصور الجديدة');
        }
    }
});

// إضافة الدالة للنافذة العامة
window.quickImageFix = quickImageFix; 
