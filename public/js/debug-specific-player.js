// تشخيص مشكلة لاعب محدد وفحص انتمائه
console.log('🔍 تحميل أدوات تشخيص اللاعب المحدد...');

// قائمة اللاعبين المشكوك في انتمائهم
const problematicPlayers = [
    {
        id: 'hChYVnu04cXe3KK8JJQu',
        name: 'علي فراس',
        expectedOrg: 'نادي أسوان العام',
        expectedOrgId: 'Nwr78w2YdYQhsKqHzPlCPGwGN2B3',
        orgType: 'clubs'
    },
    {
        id: 'c9F975YF3XWBssiXaaZItbBVM2Q2',
        name: 'علاء محمد عمر',
        expectedOrg: null, // هذا اللاعب فعلاً مستقل
        expectedOrgId: null,
        orgType: null
    }
];

// دالة لفحص أي لاعب بـ ID محدد
async function debugPlayerById(playerId) {
    console.log(`🔍 فحص اللاعب بـ ID: ${playerId}`);
    
    try {
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase غير متاح');
        }

        const db = firebase.firestore();
        const playerDoc = await db.collection('players').doc(playerId).get();
        
        if (!playerDoc.exists) {
            console.error('❌ اللاعب غير موجود في قاعدة البيانات');
            return null;
        }
        
        const playerData = playerDoc.data();
        console.log('📋 بيانات اللاعب الكاملة:', playerData);
        
        // فحص جميع حقول الانتماء المحتملة
        const organizationFields = [
            { field: 'club_id', alt: 'clubId', type: 'clubs', name: 'نادي' },
            { field: 'academy_id', alt: 'academyId', type: 'academies', name: 'أكاديمية' },
            { field: 'trainer_id', alt: 'trainerId', type: 'trainers', name: 'مدرب' },
            { field: 'agent_id', alt: 'agentId', type: 'agents', name: 'وكيل' }
        ];
        
        console.log('🔎 فحص حقول الانتماء:');
        
        let foundOrganization = null;
        
        for (const org of organizationFields) {
            const value1 = playerData[org.field];
            const value2 = playerData[org.alt];
            
            console.log(`  ${org.field}: ${value1 || 'غير موجود'}`);
            console.log(`  ${org.alt}: ${value2 || 'غير موجود'}`);
            
            const orgId = value1 || value2;
            if (orgId) {
                console.log(`✅ تم العثور على ${org.name} بـ ID: ${orgId}`);
                
                // فحص وجود المنظمة في قاعدة البيانات
                try {
                    const orgDoc = await db.collection(org.type).doc(orgId).get();
                    if (orgDoc.exists()) {
                        const orgData = orgDoc.data();
                        foundOrganization = {
                            id: orgId,
                            type: org.name,
                            collection: org.type,
                            data: orgData
                        };
                        console.log(`✅ ${org.name} موجود في قاعدة البيانات:`, orgData);
                        break;
                    } else {
                        console.log(`❌ ${org.name} بـ ID ${orgId} غير موجود في collection ${org.type}`);
                    }
                } catch (orgError) {
                    console.error(`❌ خطأ في فحص ${org.name}:`, orgError);
                }
            }
        }
        
        if (!foundOrganization) {
            console.log('⚠️ لم يتم العثور على أي انتماء للاعب');
        }
        
        return {
            player: playerData,
            organization: foundOrganization
        };
        
    } catch (error) {
        console.error('❌ خطأ في فحص اللاعب:', error);
        return null;
    }
}

// دالة إضافة انتماء للاعب
async function addPlayerOrganization(playerId, orgId, orgType) {
    console.log(`🔗 إضافة انتماء للاعب ${playerId} إلى ${orgType}: ${orgId}`);
    
    try {
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase غير متاح');
        }

        const db = firebase.firestore();
        
        // تحديد الحقل المناسب
        const fieldMapping = {
            'clubs': 'club_id',
            'academies': 'academy_id', 
            'trainers': 'trainer_id',
            'agents': 'agent_id'
        };
        
        const field = fieldMapping[orgType];
        if (!field) {
            throw new Error(`نوع منظمة غير مدعوم: ${orgType}`);
        }
        
        // فحص وجود المنظمة
        const orgDoc = await db.collection(orgType).doc(orgId).get();
        if (!orgDoc.exists) {
            throw new Error(`المنظمة غير موجودة في ${orgType}: ${orgId}`);
        }
        
        // تحديث بيانات اللاعب
        await db.collection('players').doc(playerId).update({
            [field]: orgId,
            updated_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`✅ تم إضافة الانتماء بنجاح`);
        console.log(`📝 تم تحديث ${field} = ${orgId}`);
        
        const orgData = orgDoc.data();
        console.log(`🏢 المنظمة: ${orgData.name || orgData.full_name}`);
        
        return true;
        
    } catch (error) {
        console.error('❌ خطأ في إضافة الانتماء:', error);
        return false;
    }
}

// دالة إصلاح سريع لعلي فراس
async function fixAliFeras() {
    console.log('🔧 إصلاح سريع لعلي فراس...');
    const success = await addPlayerOrganization(
        'hChYVnu04cXe3KK8JJQu', 
        'Nwr78w2YdYQhsKqHzPlCPGwGN2B3', 
        'clubs'
    );
    
    if (success) {
        console.log('✅ تم إصلاح علي فراس - أعد تحميل الصفحة لرؤية التغيير');
        setTimeout(() => window.location.reload(), 2000);
    }
}

// دالة فحص جميع اللاعبين المشكوك فيهم
async function checkAllProblematicPlayers() {
    console.log('🧪 فحص جميع اللاعبين المشكوك في انتمائهم...\n');
    
    const results = [];
    
    for (const player of problematicPlayers) {
        console.log(`\n🔍 فحص ${player.name} (${player.id}):`);
        console.log('='.repeat(50));
        
        const playerInfo = await debugPlayerById(player.id);
        if (!playerInfo) {
            results.push({ ...player, status: 'error', message: 'فشل في جلب البيانات' });
            continue;
        }
        
        if (playerInfo.organization) {
            results.push({ 
                ...player, 
                status: 'has_org', 
                message: `لديه انتماء: ${playerInfo.organization.type}`,
                currentOrg: playerInfo.organization
            });
        } else if (player.expectedOrgId) {
            console.log(`⚠️ يجب أن يكون تابع لـ ${player.expectedOrg}`);
            console.log(`💡 شغل: fixAliFeras() لإضافة الانتماء`);
            results.push({ 
                ...player, 
                status: 'missing_org', 
                message: `مستقل ولكن يجب أن يكون تابع لـ ${player.expectedOrg}`,
                needsFix: true
            });
        } else {
            results.push({ 
                ...player, 
                status: 'independent', 
                message: 'مستقل بشكل صحيح'
            });
        }
    }
    
    console.log('\n📊 ملخص النتائج:');
    console.log('================');
    
    results.forEach(result => {
        const statusIcon = result.status === 'has_org' ? '✅' : 
                          result.status === 'missing_org' ? '⚠️' : 
                          result.status === 'independent' ? 'ℹ️' : '❌';
        console.log(`${statusIcon} ${result.name}: ${result.message}`);
    });
    
    return results;
}

// دالة لفحص Supabase وأيقونات المنظمات
async function debugSupabaseLogos(orgData, orgType) {
    console.log(`🎨 فحص لوجو ${orgType}...`);
    
    if (!orgData.logo) {
        console.log('⚠️ لا يوجد لوجو محدد في بيانات المنظمة');
        return null;
    }
    
    console.log(`📁 مسار اللوجو الأصلي: ${orgData.logo}`);
    
    try {
        if (typeof supabase === 'undefined') {
            console.log('❌ Supabase غير متاح - لا يمكن معالجة اللوجو');
            return null;
        }
        
        // تحديد البوكتات المناسبة حسب نوع المنظمة
        const bucketMapping = {
            'نادي': ['clubavatar', 'club-logos'],
            'أكاديمية': ['academyavatar', 'academy-logos', 'clubavatar'],
            'مدرب': ['traineravatar', 'trainer-logos', 'clubavatar'],
            'وكيل': ['agentavatar', 'agent-logos', 'clubavatar']
        };
        
        const buckets = bucketMapping[orgType] || ['clubavatar', 'academyavatar', 'traineravatar', 'agentavatar'];
        
        console.log(`🗂️ البوكتات المحتملة لـ ${orgType}:`, buckets);
        
        // اختبار البوكتات المختلفة
        for (const bucket of buckets) {
            try {
                console.log(`🧪 اختبار البوكت: ${bucket}`);
                const { data: { publicUrl }, error } = supabase.storage
                    .from(bucket)
                    .getPublicUrl(orgData.logo);
                
                if (!error && publicUrl) {
                    console.log(`✅ تم إنشاء رابط من البوكت ${bucket}: ${publicUrl}`);
                    
                    // اختبار إمكانية الوصول للملف
                    try {
                        const response = await fetch(publicUrl, { method: 'HEAD' });
                        if (response.ok) {
                            console.log(`✅ الملف متاح في البوكت ${bucket} (${response.status})`);
                            return { bucket, url: publicUrl, status: 'success' };
                        } else {
                            console.log(`⚠️ الملف غير متاح في البوكت ${bucket} (${response.status})`);
                        }
                    } catch (fetchError) {
                        console.log(`❌ خطأ في الوصول للملف في البوكت ${bucket}:`, fetchError);
                    }
                } else {
                    console.log(`❌ خطأ في إنشاء رابط من البوكت ${bucket}:`, error);
                }
            } catch (bucketError) {
                console.log(`❌ خطأ في البوكت ${bucket}:`, bucketError);
            }
        }
        
        console.log('❌ لم يتم العثور على اللوجو في أي من البوكتات');
        return null;
        
    } catch (error) {
        console.error('❌ خطأ عام في فحص اللوجو:', error);
        return null;
    }
}

// دالة لفحص حالة صفحة التقارير الحالية
function debugCurrentReportsPage() {
    console.log('📊 فحص حالة صفحة التقارير...');
    
    // استخراج معرف اللاعب من URL
    const urlParams = new URLSearchParams(window.location.search);
    const viewPlayerId = urlParams.get('view');
    
    console.log(`👁️ معرف اللاعب من URL: ${viewPlayerId}`);
    
    // فحص عناصر الصفحة
    const playerNameElement = document.querySelector('h1');
    const playerName = playerNameElement ? playerNameElement.textContent : 'غير محدد';
    console.log(`👤 اسم اللاعب في الصفحة: ${playerName}`);
    
    // فحص قسم الجهة التابع لها
    const orgSection = document.evaluate(
        "//h3[contains(text(), 'الجهة التابع لها')]", 
        document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
    ).singleNodeValue;
    
    if (orgSection) {
        const orgContent = orgSection.parentElement.textContent;
        console.log('📋 محتوى قسم الجهة التابع لها:', orgContent);
        
        if (orgContent.includes('لاعب مستقل')) {
            console.log('⚠️ يعرض "لاعب مستقل"');
        } else if (orgContent.includes('جاري البحث')) {
            console.log('⏳ لا يزال في حالة تحميل');
        } else {
            console.log('ℹ️ يعرض معلومات منظمة');
        }
    } else {
        console.log('❌ لم يتم العثور على قسم "الجهة التابع لها"');
    }
    
    // فحص لوجو بجوار صورة اللاعب
    const playerImageContainer = document.querySelector('div[class*="relative"] img[alt*="الاسم"]')?.parentElement;
    if (playerImageContainer) {
        const logoButton = playerImageContainer.querySelector('button[class*="absolute"]');
        if (logoButton) {
            console.log('✅ تم العثور على منطقة اللوجو بجوار صورة اللاعب');
            const logoImg = logoButton.querySelector('img');
            if (logoImg) {
                console.log(`🎨 لوجو موجود: ${logoImg.src}`);
            } else {
                console.log('⚠️ لا يوجد لوجو - يعرض أيقونة افتراضية');
            }
        } else {
            console.log('❌ لا توجد منطقة لوجو بجوار صورة اللاعب');
        }
    } else {
        console.log('❌ لم يتم العثور على صورة اللاعب');
    }
    
    return viewPlayerId;
}

// دالة التشخيص الشامل للاعب محدد
async function fullPlayerDiagnosis(playerId) {
    console.log(`🔍 بدء التشخيص الشامل للاعب ${playerId}...\n`);
    
    const results = [];
    
    try {
        // 1. فحص البيانات من قاعدة البيانات
        console.log('1️⃣ فحص بيانات اللاعب...');
        const playerInfo = await debugPlayerById(playerId);
        
        if (!playerInfo) {
            results.push('❌ فشل جلب بيانات اللاعب');
            console.log('\n📊 ملخص النتائج:');
            results.forEach(r => console.log(r));
            return results;
        }
        
        results.push(`✅ اللاعب: ${playerInfo.player.full_name}`);
        
        // 2. فحص الانتماء
        console.log('\n2️⃣ فحص الانتماء...');
        if (playerInfo.organization) {
            results.push(`✅ ${playerInfo.organization.type}: ${playerInfo.organization.data.name || playerInfo.organization.data.full_name}`);
            
            // 3. فحص اللوجو
            console.log('\n3️⃣ فحص اللوجو...');
            const logoInfo = await debugSupabaseLogos(playerInfo.organization.data, playerInfo.organization.type);
            if (logoInfo) {
                results.push(`✅ لوجو متاح: ${logoInfo.bucket}`);
            } else {
                results.push('❌ لوجو غير متاح');
            }
        } else {
            results.push('⚠️ اللاعب مستقل - لا يوجد انتماء');
        }
        
        // 4. فحص حالة الصفحة
        console.log('\n4️⃣ فحص حالة الصفحة...');
        const pagePlayerId = debugCurrentReportsPage();
        if (pagePlayerId === playerId) {
            results.push('✅ أنت في الصفحة الصحيحة');
        } else {
            results.push(`⚠️ أنت في صفحة لاعب مختلف: ${pagePlayerId}`);
        }
        
        // 5. ملخص وتحليل
        console.log('\n📊 ملخص النتائج:');
        console.log('===================');
        results.forEach(result => console.log(result));
        
        console.log('\n🎯 التحليل:');
        if (playerInfo.organization) {
            console.log('✅ البيانات موجودة في قاعدة البيانات');
            console.log(`📋 نوع المنظمة: ${playerInfo.organization.type}`);
            console.log(`🆔 معرف المنظمة: ${playerInfo.organization.id}`);
            console.log('💡 إذا كانت الصفحة لا تعرض الانتماء، فالمشكلة في:');
            console.log('  - دالة fetchPlayerOrganization لا تعمل بشكل صحيح');
            console.log('  - مشكلة في React state updates');
            console.log('  - خطأ في معالجة نوع المنظمة');
            console.log('  - مشكلة في البوكت المستخدم للوجو');
        } else {
            console.log('ℹ️ اللاعب فعلاً مستقل');
        }
        
    } catch (error) {
        console.error('❌ خطأ في التشخيص:', error);
        results.push(`❌ خطأ: ${error.message}`);
    }
    
    return results;
}

// دالة لاختبار اللاعبين المحددين
async function testSpecificPlayers() {
    console.log('🧪 اختبار اللاعبين المحددين...\n');
    
    const players = [
        { id: 'hChYVnu04cXe3KK8JJQu', name: 'علي فراس' },
        { id: 'c9F975YF3XWBssiXaaZItbBVM2Q2', name: 'اللاعب الثاني' }
    ];
    
    for (const player of players) {
        console.log(`\n🔍 فحص ${player.name} (${player.id}):`);
        console.log('='.repeat(50));
        await fullPlayerDiagnosis(player.id);
        console.log('\n');
    }
}

// دالة للانتقال لصفحة لاعب محدد
function goToPlayerReports(playerId) {
    const url = `/dashboard/player/reports?view=${playerId}`;
    console.log(`🌐 الانتقال إلى: ${url}`);
    window.location.href = url;
}

// دالة لإصلاح مشكلة عرض المنظمة في الصفحة الحالية
async function fixCurrentPageOrganization() {
    console.log('🔧 محاولة إصلاح عرض المنظمة في الصفحة الحالية...');
    
    const urlParams = new URLSearchParams(window.location.search);
    const viewPlayerId = urlParams.get('view');
    
    if (!viewPlayerId) {
        console.log('❌ لا يوجد معرف لاعب في URL');
        return;
    }
    
    const playerInfo = await debugPlayerById(viewPlayerId);
    if (!playerInfo || !playerInfo.organization) {
        console.log('❌ لا يوجد انتماء للاعب');
        return;
    }
    
    console.log('🔧 محاولة تحديث عرض المنظمة...');
    
    // البحث عن قسم الجهة التابع لها وتحديثه
    const orgSection = document.evaluate(
        "//h3[contains(text(), 'الجهة التابع لها')]", 
        document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
    ).singleNodeValue;
    
    if (orgSection && orgSection.parentElement) {
        const orgContainer = orgSection.parentElement;
        const orgName = playerInfo.organization.data.name || playerInfo.organization.data.full_name;
        
        // تحديث المحتوى
        const newContent = `
            <div class="flex items-center space-x-3 space-x-reverse">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span class="text-white text-xs font-bold">${playerInfo.organization.type.charAt(0)}</span>
                    </div>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-1">الجهة التابع لها</h3>
                    <p class="text-blue-600 font-medium">${orgName}</p>
                    <p class="text-sm text-gray-500">نوع الحساب: ${playerInfo.organization.type}</p>
                </div>
            </div>
        `;
        
        orgContainer.innerHTML = newContent;
        console.log('✅ تم تحديث عرض المنظمة بنجاح');
    }
}

// تسجيل الدوال في النطاق العام
window.debugPlayerById = debugPlayerById;
window.debugSupabaseLogos = debugSupabaseLogos;
window.debugCurrentReportsPage = debugCurrentReportsPage;
window.fullPlayerDiagnosis = fullPlayerDiagnosis;
window.testSpecificPlayers = testSpecificPlayers;
window.goToPlayerReports = goToPlayerReports;
window.fixCurrentPageOrganization = fixCurrentPageOrganization;

console.log('✅ تم تحميل أدوات تشخيص اللاعب المحدد');
console.log('📞 الأوامر المتاحة:');
console.log('  - debugPlayerById("PLAYER_ID") - فحص لاعب محدد');
console.log('  - fullPlayerDiagnosis("PLAYER_ID") - تشخيص شامل');
console.log('  - testSpecificPlayers() - اختبار اللاعبين المشكوك فيهم');
console.log('  - debugCurrentReportsPage() - فحص الصفحة الحالية');
console.log('  - goToPlayerReports("PLAYER_ID") - الانتقال لصفحة لاعب');
console.log('  - fixCurrentPageOrganization() - إصلاح عرض المنظمة في الصفحة الحالية');

// تشغيل اختبار تلقائي للاعب المحدد في URL
console.log('\n🚀 بدء الاختبار التلقائي...');
setTimeout(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewPlayerId = urlParams.get('view');
    
    if (viewPlayerId) {
        console.log(`🎯 فحص اللاعب الحالي: ${viewPlayerId}`);
        fullPlayerDiagnosis(viewPlayerId);
    } else {
        console.log('ℹ️ لا يوجد معرف لاعب في URL - تشغيل الاختبار العام');
        testSpecificPlayers();
    }
}, 1000); 
