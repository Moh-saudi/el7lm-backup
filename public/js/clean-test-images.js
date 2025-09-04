// 🧹 أداة تنظيف الصور الوهمية
// Clean Test Images Tool

console.log('🧹 تحميل أداة تنظيف الصور الوهمية...');

// دالة فحص البيانات الوهمية
window.checkTestImages = async () => {
    try {
        console.log('🔍 البحث عن الصور الوهمية...');
        
        // استيراد Firebase
        const { getDocs, collection } = await import('/node_modules/firebase/firestore/dist/index.esm.js');
        const { db } = await import('/src/lib/firebase/config.js');
        
        const snapshot = await getDocs(collection(db, 'players'));
        const testImages = [];
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const hasTestUrl = data.profile_image_url?.includes('test-url.com') || 
                             data.profile_image?.includes('test-url.com');
            
            if (hasTestUrl) {
                testImages.push({
                    id: doc.id,
                    name: data.full_name || 'لاعب مجهول',
                    image_url: data.profile_image_url || data.profile_image
                });
            }
        });
        
        console.log(`🔍 تم العثور على ${testImages.length} صورة وهمية:`, testImages);
        
        if (testImages.length === 0) {
            console.log('✅ لا توجد صور وهمية في قاعدة البيانات');
        } else {
            console.log('💡 استخدم window.cleanTestImages() لتنظيف هذه الصور');
        }
        
        return testImages;
        
    } catch (error) {
        console.error('❌ خطأ في فحص الصور:', error);
        return [];
    }
};

// دالة تنظيف البيانات الوهمية
window.cleanTestImages = async () => {
    try {
        console.log('🧹 بدء عملية التنظيف...');
        
        // استيراد Firebase
        const { updateDoc, doc } = await import('/node_modules/firebase/firestore/dist/index.esm.js');
        const { db } = await import('/src/lib/firebase/config.js');
        
        const testImages = await window.checkTestImages();
        
        if (testImages.length === 0) {
            console.log('✅ لا توجد صور تحتاج تنظيف');
            return;
        }
        
        console.log(`🧹 تنظيف ${testImages.length} صورة وهمية...`);
        
        let cleaned = 0;
        for (let item of testImages) {
            try {
                await updateDoc(doc(db, 'players', item.id), {
                    profile_image_url: '/images/default-avatar.png'
                });
                cleaned++;
                console.log(`✅ تم تنظيف: ${item.name}`);
            } catch (error) {
                console.error(`❌ فشل في تنظيف ${item.name}:`, error);
            }
        }
        
        console.log(`🎉 تم تنظيف ${cleaned} من ${testImages.length} صورة بنجاح!`);
        
        if (cleaned === testImages.length) {
            console.log('💡 يمكنك الآن إزالة test-url.com من next.config.js');
        }
        
    } catch (error) {
        console.error('❌ خطأ في عملية التنظيف:', error);
    }
};

// دالة تنظيف شاملة
window.fullImageCleanup = async () => {
    console.log('🚀 بدء التنظيف الشامل...');
    
    await window.checkTestImages();
    await window.cleanTestImages();
    
    console.log('✅ تم إنهاء التنظيف الشامل!');
};

console.log('✅ أداة تنظيف الصور الوهمية جاهزة!');
console.log('💡 الأوامر المتاحة:');
console.log('   - window.checkTestImages() - فحص الصور الوهمية');
console.log('   - window.cleanTestImages() - تنظيف الصور الوهمية');
console.log('   - window.fullImageCleanup() - تنظيف شامل'); 
