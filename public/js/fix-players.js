// أداة إصلاح انتماء اللاعبين
console.log('🔧 تحميل أداة إصلاح انتماء اللاعبين...');

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

// دالة فحص لاعب محدد
async function checkPlayerOrganization(playerId) {
    console.log(`🔍 فحص اللاعب: ${playerId}`);
    
    try {
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase غير متاح');
        }

        const db = firebase.firestore();
        const playerDoc = await db.collection('players').doc(playerId).get();
        
        if (!playerDoc.exists) {
            console.error('❌ اللاعب غير موجود');
            return null;
        }
        
        const playerData = playerDoc.data();
        console.log('📋 بيانات اللاعب:', {
            name: playerData.full_name,
            club_id: playerData.club_id,
            clubId: playerData.clubId,
            academy_id: playerData.academy_id,
            academyId: playerData.academyId,
            trainer_id: playerData.trainer_id,
            trainerId: playerData.trainerId,
            agent_id: playerData.agent_id,
            agentId: playerData.agentId
        });
        
        // فحص الانتماء الحالي
        const organizationFields = [
            { field: 'club_id', alt: 'clubId', collection: 'clubs', type: 'نادي' },
            { field: 'academy_id', alt: 'academyId', collection: 'academies', type: 'أكاديمية' },
            { field: 'trainer_id', alt: 'trainerId', collection: 'trainers', type: 'مدرب' },
            { field: 'agent_id', alt: 'agentId', collection: 'agents', type: 'وكيل' }
        ];
        
        let currentOrg = null;
        
        for (const org of organizationFields) {
            const orgId = playerData[org.field] || playerData[org.alt];
            if (orgId) {
                try {
                    const orgDoc = await db.collection(org.collection).doc(orgId).get();
                    if (orgDoc.exists()) {
                        currentOrg = {
                            id: orgId,
                            type: org.type,
                            collection: org.collection,
                            data: orgDoc.data()
                        };
                        console.log(`✅ لديه انتماء: ${org.type} - ${orgDoc.data().name || orgDoc.data().full_name}`);
                        break;
                    }
                } catch (error) {
                    console.error(`❌ خطأ في فحص ${org.type}:`, error);
                }
            }
        }
        
        if (!currentOrg) {
            console.log('⚠️ اللاعب مستقل حالياً');
        }
        
        return {
            player: playerData,
            currentOrganization: currentOrg
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

// دالة فحص جميع اللاعبين المشكوك فيهم
async function checkAllProblematicPlayers() {
    console.log('🧪 فحص جميع اللاعبين المشكوك في انتمائهم...\n');
    
    const results = [];
    
    for (const player of problematicPlayers) {
        console.log(`\n🔍 فحص ${player.name} (${player.id}):`);
        console.log('='.repeat(50));
        
        const playerInfo = await checkPlayerOrganization(player.id);
        if (!playerInfo) {
            results.push({ ...player, status: 'error', message: 'فشل في جلب البيانات' });
            continue;
        }
        
        if (playerInfo.currentOrganization) {
            results.push({ 
                ...player, 
                status: 'has_org', 
                message: `لديه انتماء: ${playerInfo.currentOrganization.type}`,
                currentOrg: playerInfo.currentOrganization
            });
        } else if (player.expectedOrgId) {
            console.log(`⚠️ يجب أن يكون تابع لـ ${player.expectedOrg}`);
            console.log(`💡 هل تريد إضافة الانتماء؟`);
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
    
    const needsFixing = results.filter(r => r.needsFix);
    if (needsFixing.length > 0) {
        console.log('\n🔧 اللاعبين الذين يحتاجون إصلاح:');
        needsFixing.forEach(player => {
            console.log(`  addPlayerOrganization('${player.id}', '${player.expectedOrgId}', '${player.orgType}')`);
        });
    }
    
    return results;
}

// تسجيل الدوال في النطاق العام
window.checkPlayerOrganization = checkPlayerOrganization;
window.addPlayerOrganization = addPlayerOrganization;
window.checkAllProblematicPlayers = checkAllProblematicPlayers;

console.log('✅ تم تحميل أداة إصلاح انتماء اللاعبين');
console.log('📞 استخدم: checkAllProblematicPlayers() للفحص الشامل'); 
