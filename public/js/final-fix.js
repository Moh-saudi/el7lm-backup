console.log('🔧 أداة الإصلاح النهائية جاهزة!');

// دالة الإصلاح النهائي لعلي فراس
window.fixAliFeras = async function() {
    console.log('🔧 إصلاح علي فراس...');
    
    try {
        const db = firebase.firestore();
        
        // إضافة الانتماء لنادي أسوان العام
        await db.collection('players').doc('hChYVnu04cXe3KK8JJQu').update({
            club_id: 'Nwr78w2YdYQhsKqHzPlCPGwGN2B3',
            clubId: 'Nwr78w2YdYQhsKqHzPlCPGwGN2B3',
            updated_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ تم إصلاح علي فراس بنجاح');
        console.log('🔄 إعادة تحميل الصفحة لرؤية التغيير...');
        
        setTimeout(() => {
            window.location.reload();
        }, 2000);
        
    } catch(error) {
        console.error('❌ خطأ في إصلاح علي فراس:', error);
    }
};

// دالة توضيح الفرق
window.explainDifference = function() {
    console.log('📋 توضيح الفرق:');
    console.log('');
    console.log('🔹 أعلى الصفحة (Header):');
    console.log('   يعرض معلومات الحساب المصادق حالياً');
    console.log('   (الشخص الذي يتصفح الصفحة)');
    console.log('');
    console.log('🔹 قسم "الجهة التابع لها":');
    console.log('   يعرض الانتماء الحقيقي للاعب');
    console.log('   (من بيانات اللاعب نفسه)');
    console.log('');
    console.log('🎯 النتيجة:');
    console.log('   - إذا كان النادي يتصفح صفحة لاعب مستقل');
    console.log('   - سيظهر اسم النادي في الأعلى');
    console.log('   - وسيظهر "مستقل" في قسم الانتماء');
    console.log('   - وهذا طبيعي وصحيح!');
};

// فحص اللاعب الحالي
window.checkCurrentPlayer = async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const playerId = urlParams.get('view');
    
    if (!playerId) {
        console.log('❌ لا يوجد معرف لاعب في URL');
        return;
    }
    
    console.log(`🔍 فحص اللاعب: ${playerId}`);
    
    try {
        const db = firebase.firestore();
        const playerDoc = await db.collection('players').doc(playerId).get();
        
        if (!playerDoc.exists) {
            console.log('❌ اللاعب غير موجود');
            return;
        }
        
        const data = playerDoc.data();
        console.log('👤 اسم اللاعب:', data.full_name);
        
        // فحص جميع حقول الانتماء
        const orgFields = [
            { field: 'club_id', alt: 'clubId', type: 'نادي' },
            { field: 'academy_id', alt: 'academyId', type: 'أكاديمية' },
            { field: 'trainer_id', alt: 'trainerId', type: 'مدرب' },
            { field: 'agent_id', alt: 'agentId', type: 'وكيل' }
        ];
        
        let hasOrg = false;
        for (const org of orgFields) {
            const id = data[org.field] || data[org.alt];
            if (id) {
                console.log(`✅ تابع لـ ${org.type}: ${id}`);
                hasOrg = true;
                break;
            }
        }
        
        if (!hasOrg) {
            console.log('⚠️ اللاعب مستقل (لا يوجد انتماء)');
            if (playerId === 'hChYVnu04cXe3KK8JJQu') {
                console.log('💡 هذا علي فراس - شغل fixAliFeras() لإضافة الانتماء');
            } else {
                console.log('💡 هذا اللاعب مستقل بشكل صحيح');
            }
        }
        
    } catch (error) {
        console.error('❌ خطأ في الفحص:', error);
    }
};

console.log('✅ الأوامر المتاحة:');
console.log('  - fixAliFeras() - إصلاح علي فراس');
console.log('  - checkCurrentPlayer() - فحص اللاعب الحالي');
console.log('  - explainDifference() - توضيح الفرق');

// تشغيل تلقائي
setTimeout(() => {
    console.log('\n🚀 فحص تلقائي...');
    checkCurrentPlayer();
    setTimeout(() => {
        explainDifference();
    }, 2000);
}, 1000); 
