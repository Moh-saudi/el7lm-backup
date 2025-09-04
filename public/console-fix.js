// 🚀 إصلاح فوري للصور - انسخ والصق في Console
// نسخ واحدة للتشغيل المباشر

(async function immediateImageFix() {
    console.log('🚀 بدء الإصلاح الفوري...');
    
    try {
        // إعداد Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyDGpAHia_wEmrhnmYjrPf1n1TrAzwEMiAI",
            authDomain: "hagz-85b65.firebaseapp.com",
            projectId: "hagz-85b65",
            storageBucket: "hagz-85b65.appspot.com",
            messagingSenderId: "692767777581",
            appId: "1:692767777581:web:5b998ed1c834bc35b78b5f"
        };

        // استيراد Firebase
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js');
        const { getFirestore, collection, getDocs, doc, updateDoc, writeBatch } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
        
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        console.log('🔍 فحص قاعدة البيانات...');
        
        const playersSnapshot = await getDocs(collection(db, 'players'));
        console.log(`📊 تم العثور على ${playersSnapshot.size} لاعب`);

        let fixed = 0;
        const batch = writeBatch(db);
        let batchCount = 0;

        for (const docSnapshot of playersSnapshot.docs) {
            const data = docSnapshot.data();
            let needsUpdate = false;
            const updates = {};

            // فحص وإصلاح profile_image_url
            if (data.profile_image_url) {
                const url = data.profile_image_url;
                if (url.includes('test-url.com') || 
                    (url.includes('supabase.co') && (url.includes('undefined') || url.includes('null')))) {
                    updates.profile_image_url = '/images/default-avatar.png';
                    needsUpdate = true;
                }
            }

            // فحص وإصلاح profile_image
            if (data.profile_image) {
                const url = data.profile_image;
                if (url.includes('test-url.com') || 
                    (url.includes('supabase.co') && (url.includes('undefined') || url.includes('null')))) {
                    updates.profile_image = '/images/default-avatar.png';
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                batch.update(doc(db, 'players', docSnapshot.id), updates);
                fixed++;
                batchCount++;
                console.log(`🔧 إصلاح: ${data.full_name || docSnapshot.id}`);

                if (batchCount >= 400) {
                    await batch.commit();
                    console.log(`✅ تم حفظ ${batchCount} تحديث...`);
                    batchCount = 0;
                }
            }
        }

        if (batchCount > 0) {
            await batch.commit();
            console.log(`✅ تم حفظ ${batchCount} تحديث أخير...`);
        }

        console.log(`🎉 تم إصلاح ${fixed} صورة!`);
        console.log('💡 أعد تشغيل الخادم الآن: npm run dev');
        
        if (fixed > 0) {
            console.log('🔄 جاري إعادة تحميل الصفحة...');
            setTimeout(() => window.location.reload(), 3000);
        }

        return { success: true, fixed };
        
    } catch (error) {
        console.error('❌ خطأ:', error);
        return { success: false, error: error.message };
    }
})(); 
