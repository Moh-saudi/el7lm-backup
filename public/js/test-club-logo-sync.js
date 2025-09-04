// اختبار تحديث لوجو النادي في جميع المكونات
console.log('🎨 تحميل أدوات اختبار تحديث لوجو النادي...');

// دالة للعثور على جميع عناصر اللوجو في الصفحة
function findLogoElements() {
    const logos = [];
    
    // البحث عن جميع عناصر img التي قد تكون لوجو النادي
    const images = document.querySelectorAll('img');
    
    images.forEach((img, index) => {
        const alt = img.alt ? img.alt.toLowerCase() : '';
        const src = img.src ? img.src.toLowerCase() : '';
        const className = img.className ? img.className.toLowerCase() : '';
        
        // تحديد إذا كانت الصورة لوجو النادي
        if (alt.includes('شعار') || alt.includes('لوجو') || alt.includes('logo') ||
            src.includes('club-avatar') || src.includes('clubavatar') ||
            className.includes('logo') || 
            (img.parentElement && img.parentElement.textContent.includes('النادي'))) {
            
            logos.push({
                index,
                element: img,
                src: img.src,
                alt: img.alt,
                className: img.className,
                location: getElementLocation(img)
            });
        }
    });
    
    return logos;
}

// دالة لتحديد موقع العنصر في الصفحة
function getElementLocation(element) {
    const locations = [];
    
    // البحث في الهيدر
    if (element.closest('header')) {
        locations.push('Header');
    }
    
    // البحث في الـ Sidebar
    if (element.closest('aside') || element.closest('[class*="sidebar"]')) {
        locations.push('Sidebar');
    }
    
    // البحث في المحتوى الرئيسي
    if (element.closest('main')) {
        locations.push('Main Content');
    }
    
    // البحث في Modal أو Dialog
    if (element.closest('[role="dialog"]') || element.closest('.modal')) {
        locations.push('Modal/Dialog');
    }
    
    return locations.length > 0 ? locations.join(', ') : 'Unknown';
}

// دالة لاختبار تحديث اللوجو
async function testLogoUpdate() {
    console.log('🎨 بدء اختبار تحديث لوجو النادي...');
    
    try {
        // 1. العثور على عناصر اللوجو الحالية
        const initialLogos = findLogoElements();
        console.log(`🔍 تم العثور على ${initialLogos.length} عنصر لوجو:`, initialLogos);
        
        if (initialLogos.length === 0) {
            console.log('⚠️ لم يتم العثور على أي عناصر لوجو في الصفحة');
            return false;
        }
        
        // 2. التحقق من Firebase
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase غير متاح');
        }
        
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('المستخدم غير مسجل دخول');
        }
        
        console.log('✅ المستخدم مسجل دخول:', user.uid);
        
        // 3. جلب البيانات الحالية
        const clubRef = firebase.firestore().collection('clubs').doc(user.uid);
        const clubDoc = await clubRef.get();
        
        if (!clubDoc.exists) {
            throw new Error('وثيقة النادي غير موجودة');
        }
        
        const currentData = clubDoc.data();
        console.log('📊 البيانات الحالية:', { logo: currentData.logo });
        
        // 4. إنشاء لوجو تجريبي (صورة صغيرة ملونة)
        const testLogo = await createTestLogo();
        const testFileName = `test_logo_${Date.now()}.png`;
        const testPath = `${user.uid}/logo/${testFileName}`;
        
        console.log('🎨 إنشاء لوجو تجريبي...');
        
        // 5. رفع اللوجو التجريبي إلى Supabase
        if (typeof supabase === 'undefined') {
            throw new Error('Supabase غير متاح');
        }
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('clubavatar')
            .upload(testPath, testLogo, {
                cacheControl: '3600',
                upsert: true
            });
        
        if (uploadError) {
            throw new Error(`فشل رفع اللوجو: ${uploadError.message}`);
        }
        
        console.log('✅ تم رفع اللوجو التجريبي:', uploadData);
        
        // 6. تحديث بيانات النادي
        await clubRef.update({ logo: testPath });
        console.log('✅ تم تحديث بيانات النادي');
        
        // 7. انتظار لحظة للتحديث
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 8. فحص العناصر المحدثة
        const updatedLogos = findLogoElements();
        console.log(`🔄 فحص العناصر بعد التحديث: ${updatedLogos.length} عنصر`);
        
        let updatedCount = 0;
        updatedLogos.forEach((logo, index) => {
            if (logo.src.includes(testPath) || logo.src.includes(testFileName)) {
                updatedCount++;
                console.log(`✅ عنصر ${index + 1} تم تحديثه: ${logo.location}`);
            } else {
                console.log(`❌ عنصر ${index + 1} لم يتم تحديثه: ${logo.location} - ${logo.src}`);
            }
        });
        
        // 9. استعادة اللوجو الأصلي
        if (currentData.logo) {
            await clubRef.update({ logo: currentData.logo });
        } else {
            await clubRef.update({ logo: firebase.firestore.FieldValue.delete() });
        }
        
        // 10. حذف اللوجو التجريبي
        await supabase.storage.from('clubavatar').remove([testPath]);
        
        console.log('🧹 تم تنظيف الملفات التجريبية');
        
        // النتيجة النهائية
        const successRate = (updatedCount / updatedLogos.length) * 100;
        console.log(`🎯 النتيجة: ${updatedCount}/${updatedLogos.length} عناصر تم تحديثها (${successRate.toFixed(1)}%)`);
        
        return successRate === 100;
        
    } catch (error) {
        console.error('❌ خطأ في اختبار تحديث اللوجو:', error);
        return false;
    }
}

// دالة لإنشاء لوجو تجريبي
async function createTestLogo() {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // خلفية ملونة
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    ctx.fillStyle = randomColor;
    ctx.fillRect(0, 0, 200, 200);
    
    // نص تجريبي
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('TEST', 100, 90);
    ctx.fillText('LOGO', 100, 120);
    
    // الوقت للتمييز
    ctx.font = 'bold 16px Arial';
    ctx.fillText(new Date().toLocaleTimeString('ar-SA'), 100, 150);
    
    return new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png');
    });
}

// دالة لمراقبة تحديثات اللوجو المستمرة
function watchLogoUpdates() {
    console.log('👁️ بدء مراقبة تحديثات اللوجو...');
    
    let previousLogos = findLogoElements();
    console.log(`📊 العناصر الأولية: ${previousLogos.length}`);
    
    const observer = new MutationObserver((mutations) => {
        let logoChanged = false;
        
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                const element = mutation.target;
                if (element.tagName === 'IMG') {
                    const logos = findLogoElements();
                    if (logos.find(logo => logo.element === element)) {
                        console.log('🔄 تم تحديث لوجو:', {
                            location: getElementLocation(element),
                            newSrc: element.src,
                            oldSrc: mutation.oldValue
                        });
                        logoChanged = true;
                    }
                }
            }
        });
        
        if (logoChanged) {
            const currentLogos = findLogoElements();
            console.log(`📊 العناصر الحالية: ${currentLogos.length}`);
            previousLogos = currentLogos;
        }
    });
    
    observer.observe(document.body, {
        attributes: true,
        attributeOldValue: true,
        subtree: true,
        attributeFilter: ['src']
    });
    
    return observer;
}

// دالة لإيقاف المراقبة
let logoObserver = null;

function startLogoWatching() {
    if (logoObserver) {
        logoObserver.disconnect();
    }
    logoObserver = watchLogoUpdates();
    console.log('✅ تم بدء مراقبة اللوجو');
}

function stopLogoWatching() {
    if (logoObserver) {
        logoObserver.disconnect();
        logoObserver = null;
        console.log('⏹️ تم إيقاف مراقبة اللوجو');
    }
}

// دالة للحصول على تقرير شامل
function getLogoReport() {
    const logos = findLogoElements();
    
    console.log('📋 تقرير شامل عن عناصر اللوجو:');
    console.log('=====================================');
    
    if (logos.length === 0) {
        console.log('❌ لا توجد عناصر لوجو في الصفحة');
        return;
    }
    
    logos.forEach((logo, index) => {
        console.log(`\n${index + 1}. عنصر اللوجو:`);
        console.log(`   📍 الموقع: ${logo.location}`);
        console.log(`   🖼️ المصدر: ${logo.src}`);
        console.log(`   📝 النص البديل: ${logo.alt}`);
        console.log(`   🎨 الفئات: ${logo.className}`);
        
        // تحليل المصدر
        if (logo.src.includes('clubavatar')) {
            console.log(`   ✅ مصدر Supabase صحيح`);
        } else if (logo.src.includes('club-avatar.png')) {
            console.log(`   ⚠️ يستخدم الصورة الافتراضية`);
        } else if (logo.src.startsWith('data:')) {
            console.log(`   🔄 صورة مؤقتة أو محولة`);
        } else {
            console.log(`   ❓ مصدر غير معروف`);
        }
    });
    
    console.log(`\n🎯 الملخص: ${logos.length} عنصر لوجو موجود`);
}

// تسجيل الدوال في النطاق العام
window.testLogoUpdate = testLogoUpdate;
window.startLogoWatching = startLogoWatching;
window.stopLogoWatching = stopLogoWatching;
window.getLogoReport = getLogoReport;
window.findLogoElements = findLogoElements;

console.log('✅ تم تحميل أدوات اختبار لوجو النادي');
console.log('📞 الأوامر المتاحة:');
console.log('  - testLogoUpdate() - اختبار تحديث اللوجو');
console.log('  - startLogoWatching() - بدء مراقبة التحديثات');
console.log('  - stopLogoWatching() - إيقاف المراقبة');
console.log('  - getLogoReport() - تقرير شامل عن اللوجو');
console.log('  - findLogoElements() - العثور على عناصر اللوجو');

// بدء المراقبة تلقائياً
console.log('\n🚀 بدء المراقبة التلقائية...');
startLogoWatching(); 
