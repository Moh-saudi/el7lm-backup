// 🔍 سكريبت فحص اللاعبين وتصنيفهم
console.log('🔍 تحميل أداة تحليل اللاعبين...');

window.analyzeAllPlayers = async () => {
  try {
    console.log('📊 بدء تحليل جميع اللاعبين...');
    
    // استيراد Firestore
    const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js');
    const { db } = await import('/src/lib/firebase/config.ts');
    
    // جلب جميع اللاعبين
    const playersSnapshot = await getDocs(collection(db, 'players'));
    const players = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`📈 إجمالي اللاعبين: ${players.length}`);
    
    // تصنيف اللاعبين
    const categories = {
      club: [],
      academy: [],
      trainer: [],
      agent: [],
      independent: []
    };
    
    players.forEach(player => {
      if (player.club_id || player.clubId) {
        categories.club.push({
          name: player.full_name || player.name,
          id: player.id,
          orgId: player.club_id || player.clubId
        });
      } else if (player.academy_id || player.academyId) {
        categories.academy.push({
          name: player.full_name || player.name,
          id: player.id,
          orgId: player.academy_id || player.academyId
        });
      } else if (player.trainer_id || player.trainerId) {
        categories.trainer.push({
          name: player.full_name || player.name,
          id: player.id,
          orgId: player.trainer_id || player.trainerId
        });
      } else if (player.agent_id || player.agentId) {
        categories.agent.push({
          name: player.full_name || player.name,
          id: player.id,
          orgId: player.agent_id || player.agentId
        });
      } else {
        categories.independent.push({
          name: player.full_name || player.name,
          id: player.id,
          createdAt: player.created_at || player.createdAt,
          email: player.email
        });
      }
    });
    
    // عرض النتائج
    console.log('📊 نتائج التصنيف:');
    console.log(`🏢 أندية: ${categories.club.length} لاعب`);
    console.log(`🏆 أكاديميات: ${categories.academy.length} لاعب`);
    console.log(`👨‍🏫 مدربين: ${categories.trainer.length} لاعب`);
    console.log(`💼 وكلاء: ${categories.agent.length} لاعب`);
    console.log(`🔥 مستقلين: ${categories.independent.length} لاعب`);
    
    console.log('\n🔍 تفاصيل اللاعبين المستقلين:');
    categories.independent.forEach((player, index) => {
      console.log(`${index + 1}. ${player.name} (${player.id})`);
      console.log(`   📧 ${player.email}`);
      console.log(`   📅 ${player.createdAt ? new Date(player.createdAt.seconds * 1000).toLocaleDateString('ar-SA') : 'غير محدد'}`);
    });
    
    return categories;
    
  } catch (error) {
    console.error('❌ خطأ في تحليل اللاعبين:', error);
    return null;
  }
};

// دالة فحص لاعب محدد
window.checkPlayerDetails = async (playerId) => {
  try {
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js');
    const { db } = await import('/src/lib/firebase/config.ts');
    
    const playerDoc = await getDoc(doc(db, 'players', playerId));
    
    if (playerDoc.exists()) {
      const data = playerDoc.data();
      console.log('🔍 بيانات اللاعب الكاملة:', data);
      
      // فحص حقول الربط
      console.log('\n🔗 حقول الربط:');
      console.log(`   club_id: ${data.club_id || 'غير موجود'}`);
      console.log(`   clubId: ${data.clubId || 'غير موجود'}`);
      console.log(`   academy_id: ${data.academy_id || 'غير موجود'}`);
      console.log(`   academyId: ${data.academyId || 'غير موجود'}`);
      console.log(`   trainer_id: ${data.trainer_id || 'غير موجود'}`);
      console.log(`   trainerId: ${data.trainerId || 'غير موجود'}`);
      console.log(`   agent_id: ${data.agent_id || 'غير موجود'}`);
      console.log(`   agentId: ${data.agentId || 'غير موجود'}`);
      
      return data;
    } else {
      console.log('❌ اللاعب غير موجود');
      return null;
    }
  } catch (error) {
    console.error('❌ خطأ في فحص اللاعب:', error);
    return null;
  }
};

console.log('✅ أداة تحليل اللاعبين جاهزة');
console.log('💡 الأوامر المتاحة:');
console.log('   - window.analyzeAllPlayers() // تحليل جميع اللاعبين');
console.log('   - window.checkPlayerDetails("PLAYER_ID") // فحص لاعب محدد');
console.log('\n🎯 مثال:');
console.log('   window.checkPlayerDetails("3dOQ70vLVVSdDiEmpcMtgCcGAiO2") // محمد جلال'); 
