// تشخيص مشكلة عدم ظهور بيانات النادي في صفحة تقارير اللاعب
console.log('🔍 تحميل أدوات تشخيص صفحة تقارير اللاعب...');

// معرف اللاعب علي فراس
const ALI_FERAS_ID = 'hChYVnu04cXe3KK8JJQu';

// دالة لفحص بيانات اللاعب من قاعدة البيانات مباشرة
async function debugPlayerFromDatabase() {
    console.log('🔍 فحص بيانات اللاعب من قاعدة البيانات...');
    
    try {
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase غير متاح');
        }

        const db = firebase.firestore();
        const playerDoc = await db.collection('players').doc(ALI_FERAS_ID).get();
        
        if (!playerDoc.exists) {
            console.error('❌ اللاعب غير موجود في قاعدة البيانات');
            return null;
        }
        
        const playerData = playerDoc.data();
        console.log('📋 بيانات اللاعب الكاملة من قاعدة البيانات:', playerData);
        
        // فحص جميع الحقول المحتملة للانتماء
        const organizationFields = [
            'club_id', 'clubId', 'academy_id', 'academyId',
            'trainer_id', 'trainerId', 'agent_id', 'agentId'
        ];
        
        console.log('🔎 فحص حقول الانتماء:');
        organizationFields.forEach(field => {
            const value = playerData[field];
            console.log(`  ${field}: ${value || 'غير موجود'}`);
        });
        
        return playerData;
        
    } catch (error) {
        console.error('❌ خطأ في جلب بيانات اللاعب:', error);
        return null;
    }
}

// دالة لفحص بيانات النادي إذا وُجد معرف النادي
async function debugClubData(clubId) {
    if (!clubId) {
        console.log('⚠️ لا يوجد معرف نادي للفحص');
        return null;
    }
    
    console.log(`🏢 فحص بيانات النادي بـ ID: ${clubId}`);
    
    try {
        const db = firebase.firestore();
        const clubDoc = await db.collection('clubs').doc(clubId).get();
        
        if (!clubDoc.exists) {
            console.error(`❌ النادي بـ ID ${clubId} غير موجود في قاعدة البيانات`);
            return null;
        }
        
        const clubData = clubDoc.data();
        console.log('🏢 بيانات النادي من قاعدة البيانات:', clubData);
        
        // فحص اللوجو
        if (clubData.logo) {
            console.log('🎨 لوجو النادي:', clubData.logo);
            
            // تجربة تحويل المسار إلى رابط Supabase
            if (typeof supabase !== 'undefined') {
                const { data: { publicUrl } } = supabase.storage
                    .from('clubavatar')
                    .getPublicUrl(clubData.logo);
                console.log('🎨 رابط اللوجو المحول:', publicUrl);
            } else {
                console.log('⚠️ Supabase غير متاح لتحويل مسار اللوجو');
            }
        } else {
            console.log('⚠️ لا يوجد لوجو محدد للنادي');
        }
        
        return clubData;
        
    } catch (error) {
        console.error('❌ خطأ في جلب بيانات النادي:', error);
        return null;
    }
}

// دالة لفحص حالة الصفحة الحالية
async function debugCurrentPageState() {
    console.log('📊 فحص حالة الصفحة الحالية...');
    
    // التحقق من URL
    const currentUrl = window.location.href;
    console.log('🌐 الرابط الحالي:', currentUrl);
    
    // التحقق من معامل view
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    console.log('👁️ معامل view:', viewParam);
    
    // التحقق من عناصر الصفحة
    const organizationSection = document.querySelector('[class*="الجهة التابع لها"]') || 
                               document.querySelector('h3:contains("الجهة التابع لها")') ||
                               document.evaluate("//h3[contains(text(), 'الجهة التابع لها')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    
    if (organizationSection) {
        console.log('✅ تم العثور على قسم "الجهة التابع لها"');
        console.log('📋 محتوى القسم:', organizationSection.parentElement?.textContent);
    } else {
        console.log('❌ لم يتم العثور على قسم "الجهة التابع لها"');
    }
    
    // البحث عن رسائل "لاعب مستقل"
    const independentMessages = document.evaluate("//text()[contains(., 'لاعب مستقل')]", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    console.log(`🔍 عدد رسائل "لاعب مستقل" الموجودة: ${independentMessages.snapshotLength}`);
    
    for (let i = 0; i < independentMessages.snapshotLength; i++) {
        const node = independentMessages.snapshotItem(i);
        console.log(`  ${i + 1}. نص: "${node.textContent.trim()}" في العنصر:`, node.parentElement);
    }
    
    // البحث عن رسائل التحميل
    const loadingMessages = document.evaluate("//text()[contains(., 'جاري البحث')]", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    console.log(`⏳ عدد رسائل التحميل: ${loadingMessages.snapshotLength}`);
}

// دالة لمراقبة تحديثات DOM
function watchDOMChanges() {
    console.log('👁️ بدء مراقبة تحديثات DOM...');
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node;
                        
                        // مراقبة ظهور معلومات النادي
                        if (element.textContent?.includes('نادي') || element.textContent?.includes('أكاديمية')) {
                            console.log('🔄 تم اكتشاف تحديث يحتوي على معلومات منظمة:', element.textContent);
                        }
                        
                        // مراقبة رسائل الأخطاء أو التحميل
                        if (element.textContent?.includes('لاعب مستقل') || 
                            element.textContent?.includes('غير مرتبط') ||
                            element.textContent?.includes('جاري البحث')) {
                            console.log('⚠️ تم اكتشاف رسالة حالة:', element.textContent);
                        }
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    return observer;
}

// دالة التشخيص الشامل
async function fullPlayerOrganizationDiagnosis() {
    console.log('🔍 بدء التشخيص الشامل لمشكلة عرض بيانات النادي...\n');
    
    const results = [];
    
    // 1. فحص بيانات اللاعب
    console.log('1️⃣ فحص بيانات اللاعب...');
    const playerData = await debugPlayerFromDatabase();
    results.push(`بيانات اللاعب: ${playerData ? '✅' : '❌'}`);
    
    if (!playerData) {
        console.log('\n❌ فشل جلب بيانات اللاعب - توقف التشخيص');
        return results;
    }
    
    // 2. تحديد معرف النادي
    console.log('\n2️⃣ البحث عن معرف النادي...');
    const clubId = playerData.club_id || playerData.clubId;
    if (clubId) {
        console.log(`✅ تم العثور على معرف النادي: ${clubId}`);
        results.push(`معرف النادي: ✅ ${clubId}`);
    } else {
        console.log('❌ لم يتم العثور على معرف النادي في بيانات اللاعب');
        results.push('معرف النادي: ❌ غير موجود');
    }
    
    // 3. فحص بيانات النادي
    let clubData = null;
    if (clubId) {
        console.log('\n3️⃣ فحص بيانات النادي...');
        clubData = await debugClubData(clubId);
        results.push(`بيانات النادي: ${clubData ? '✅' : '❌'}`);
    }
    
    // 4. فحص حالة الصفحة
    console.log('\n4️⃣ فحص حالة الصفحة...');
    await debugCurrentPageState();
    
    // 5. ملخص النتائج
    console.log('\n📊 ملخص التشخيص:');
    console.log('===================');
    results.forEach(result => console.log(result));
    
    // 6. تحليل المشكلة
    console.log('\n🎯 تحليل المشكلة:');
    if (playerData && clubId && clubData) {
        console.log('✅ جميع البيانات موجودة في قاعدة البيانات');
        console.log('🔍 المشكلة محتملة في:');
        console.log('  - عدم تحديث state في React');
        console.log('  - خطأ في دالة fetchPlayerOrganization');
        console.log('  - مشكلة في معالجة اللوجو');
        console.log('  - تحديث غير مكتمل للـ DOM');
    } else if (playerData && clubId && !clubData) {
        console.log('⚠️ اللاعب مرتبط بنادي غير موجود');
        console.log('💡 الحل: تنظيف معرف النادي أو إنشاء النادي المفقود');
    } else if (playerData && !clubId) {
        console.log('ℹ️ اللاعب فعلاً مستقل (لا يوجد معرف نادي)');
        console.log('💡 هذا طبيعي إذا كان اللاعب غير منتسب لأي جهة');
    } else {
        console.log('❌ مشكلة في جلب بيانات اللاعب نفسها');
    }
    
    return results;
}

// دالة لإصلاح البيانات إذا أمكن
async function fixPlayerOrganizationData() {
    console.log('🔧 محاولة إصلاح بيانات النادي...');
    
    try {
        const playerData = await debugPlayerFromDatabase();
        if (!playerData) {
            throw new Error('لا يمكن جلب بيانات اللاعب');
        }
        
        // البحث عن أي معرف نادي في الحقول المختلفة
        const clubId = playerData.club_id || playerData.clubId;
        
        if (!clubId) {
            console.log('ℹ️ لا يوجد معرف نادي للإصلاح');
            return false;
        }
        
        // التحقق من وجود النادي
        const clubData = await debugClubData(clubId);
        if (!clubData) {
            console.log('❌ النادي المرتبط غير موجود - لا يمكن الإصلاح');
            return false;
        }
        
        // إصلاح تنسيق البيانات إذا لزم الأمر
        const db = firebase.firestore();
        const updateData = {};
        
        // توحيد تنسيق معرف النادي
        if (playerData.club_id && !playerData.clubId) {
            updateData.clubId = playerData.club_id;
            console.log('🔧 إضافة clubId للتوافق مع النظام الجديد');
        } else if (playerData.clubId && !playerData.club_id) {
            updateData.club_id = playerData.clubId;
            console.log('🔧 إضافة club_id للتوافق مع النظام القديم');
        }
        
        if (Object.keys(updateData).length > 0) {
            await db.collection('players').doc(ALI_FERAS_ID).update(updateData);
            console.log('✅ تم تحديث بيانات اللاعب:', updateData);
            return true;
        } else {
            console.log('ℹ️ البيانات صحيحة، لا تحتاج إصلاح');
            return true;
        }
        
    } catch (error) {
        console.error('❌ خطأ في إصلاح البيانات:', error);
        return false;
    }
}

// تسجيل الدوال في النطاق العام
window.debugPlayerFromDatabase = debugPlayerFromDatabase;
window.debugClubData = debugClubData;
window.debugCurrentPageState = debugCurrentPageState;
window.fullPlayerOrganizationDiagnosis = fullPlayerOrganizationDiagnosis;
window.fixPlayerOrganizationData = fixPlayerOrganizationData;
window.watchDOMChanges = watchDOMChanges;

console.log('✅ تم تحميل أدوات تشخيص صفحة تقارير اللاعب');
console.log('📞 الأوامر المتاحة:');
console.log('  - debugPlayerFromDatabase() - فحص بيانات اللاعب');
console.log('  - debugClubData(clubId) - فحص بيانات النادي');
console.log('  - debugCurrentPageState() - فحص حالة الصفحة');
console.log('  - fullPlayerOrganizationDiagnosis() - تشخيص شامل');
console.log('  - fixPlayerOrganizationData() - إصلاح البيانات');
console.log('  - watchDOMChanges() - مراقبة تحديثات الصفحة');

// بدء المراقبة التلقائية
console.log('\n🚀 بدء المراقبة التلقائية...');
const domObserver = watchDOMChanges();

// تشغيل التشخيص التلقائي بعد ثانيتين
setTimeout(() => {
    console.log('\n🔍 تشغيل التشخيص التلقائي...');
    fullPlayerOrganizationDiagnosis();
}, 2000); 
