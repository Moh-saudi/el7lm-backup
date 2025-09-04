const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');

// تهيئة Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// بيانات تجريبية لجهات الاتصال مع معلومات التبعية
const testContacts = {
  clubs: [
    {
      name: 'نادي الهلال',
      club_name: 'نادي الهلال',
      organizationName: 'نادي الهلال الرياضي',
      isOnline: true,
      isActive: true,
      country: 'السعودية',
      city: 'الرياض',
      phone: '+966501234567',
      email: 'info@alhilal.com',
      description: 'نادي الهلال السعودي - أحد أكبر الأندية في المملكة',
      founded: '1957',
      type: 'احترافي',
      manager: 'أحمد العيسى',
      address: 'الرياض، المملكة العربية السعودية',
      website: 'https://alhilal.com',
      facebook: 'https://facebook.com/alhilal',
      twitter: 'https://twitter.com/alhilal',
      instagram: 'https://instagram.com/alhilal',
      stats: {
        players: 25,
        contracts: 15,
        trophies: 18,
        staff: 50
      }
    },
    {
      name: 'نادي النصر',
      club_name: 'نادي النصر',
      organizationName: 'نادي النصر الرياضي',
      isOnline: true,
      isActive: true,
      country: 'السعودية',
      city: 'الرياض',
      phone: '+966501234568',
      email: 'info@alnassr.com',
      description: 'نادي النصر السعودي - الفريق الأصفر',
      founded: '1955',
      type: 'احترافي',
      manager: 'محمد العلي',
      address: 'الرياض، المملكة العربية السعودية',
      website: 'https://alnassr.com',
      facebook: 'https://facebook.com/alnassr',
      twitter: 'https://twitter.com/alnassr',
      instagram: 'https://instagram.com/alnassr',
      stats: {
        players: 28,
        contracts: 20,
        trophies: 9,
        staff: 45
      }
    }
  ],
  academies: [
    {
      name: 'أكاديمية النصر للشباب',
      academy_name: 'أكاديمية النصر للشباب',
      organizationName: 'أكاديمية النصر للشباب',
      isOnline: true,
      isActive: true,
      country: 'السعودية',
      city: 'الرياض',
      phone: '+966501234570',
      email: 'info@alnassr-academy.com',
      description: 'أكاديمية النصر لتدريب الشباب',
      founding_year: '2010',
      academy_type: 'شباب',
      is_federation_approved: true,
      license_number: 'AC001',
      registration_date: '2010-01-01',
      address: 'الرياض، المملكة العربية السعودية',
      website: 'https://alnassr-academy.com',
      age_groups: ['U12', 'U14', 'U16', 'U18'],
      sports_facilities: ['ملعب عشب طبيعي', 'ملعب عشب صناعي', 'صالة تدريب'],
      number_of_coaches: 12,
      training_programs: 'برامج تدريبية متقدمة',
      achievements: 'بطولات محلية وإقليمية'
    }
  ],
  agents: [
    {
      name: 'وكالة النجوم الرياضية',
      agent_name: 'وكالة النجوم الرياضية',
      agency_name: 'وكالة النجوم الرياضية',
      organizationName: 'وكالة النجوم الرياضية',
      isOnline: true,
      isActive: true,
      country: 'السعودية',
      city: 'الرياض',
      phone: '+966501234572',
      email: 'info@stars-agency.com',
      description: 'وكالة رائدة في مجال التمثيل الرياضي',
      license_number: 'AG001',
      experience_years: '15',
      specializations: ['لاعبين محترفين', 'مدربين', 'أندية'],
      achievements: 'تمثيل أكثر من 100 لاعب ومدرب'
    }
  ],
  trainers: [
    {
      name: 'أحمد المدرب',
      trainer_name: 'أحمد المدرب',
      isOnline: true,
      isActive: true,
      country: 'السعودية',
      city: 'الرياض',
      phone: '+966501234574',
      email: 'ahmed@trainer.com',
      description: 'مدرب محترف مع خبرة 10 سنوات',
      specialization: 'تدريب الشباب',
      license: 'TR001',
      experience: '10 سنوات',
      certifications: ['UEFA A', 'FIFA Youth'],
      achievements: 'تدريب أكثر من 200 لاعب'
    }
  ],
  players: [
    {
      name: 'علي محمد',
      full_name: 'علي محمد',
      isOnline: true,
      isActive: true,
      country: 'السعودية',
      city: 'الرياض',
      phone: '+966501234576',
      email: 'ali@player.com',
      description: 'لاعب محترف في مركز الوسط',
      primary_position: 'وسط',
      secondary_position: 'هجوم',
      preferred_foot: 'يمين',
      nationality: 'سعودي',
      birth_date: '1995-03-15',
      height: '175',
      weight: '70',
      experience_years: '8',
      current_club: 'نادي الهلال',
      achievements: ['بطولة الدوري السعودي', 'كأس الملك'],
      // معلومات التبعية
      club_id: null, // سيتم تحديثه لاحقاً
      academy_id: null,
      trainer_id: null,
      agent_id: null
    },
    {
      name: 'أحمد خالد',
      full_name: 'أحمد خالد',
      isOnline: false,
      isActive: true,
      country: 'السعودية',
      city: 'جدة',
      phone: '+966501234577',
      email: 'ahmed@player.com',
      description: 'لاعب محترف في مركز الدفاع',
      primary_position: 'دفاع',
      secondary_position: 'وسط',
      preferred_foot: 'يسار',
      nationality: 'سعودي',
      birth_date: '1993-07-22',
      height: '180',
      weight: '75',
      experience_years: '10',
      current_club: 'نادي النصر',
      achievements: ['بطولة الدوري السعودي', 'كأس الاتحاد الآسيوي'],
      // معلومات التبعية
      club_id: null, // سيتم تحديثه لاحقاً
      academy_id: null,
      trainer_id: null,
      agent_id: null
    },
    {
      name: 'محمد عبدالله',
      full_name: 'محمد عبدالله',
      isOnline: true,
      isActive: true,
      country: 'السعودية',
      city: 'الرياض',
      phone: '+966501234578',
      email: 'mohammed@player.com',
      description: 'لاعب شاب في أكاديمية النصر',
      primary_position: 'هجوم',
      secondary_position: 'وسط',
      preferred_foot: 'يمين',
      nationality: 'سعودي',
      birth_date: '2005-08-10',
      height: '170',
      weight: '65',
      experience_years: '3',
      current_club: 'أكاديمية النصر للشباب',
      achievements: ['بطولة الشباب المحلية'],
      // معلومات التبعية - تابع لأكاديمية
      club_id: null,
      academy_id: null, // سيتم تحديثه لاحقاً
      trainer_id: null,
      agent_id: null
    },
    {
      name: 'خالد سعد',
      full_name: 'خالد سعد',
      isOnline: false,
      isActive: true,
      country: 'السعودية',
      city: 'الرياض',
      phone: '+966501234579',
      email: 'khalid@player.com',
      description: 'لاعب تحت إشراف وكالة النجوم',
      primary_position: 'وسط',
      secondary_position: 'دفاع',
      preferred_foot: 'يسار',
      nationality: 'سعودي',
      birth_date: '1998-12-05',
      height: '178',
      weight: '72',
      experience_years: '6',
      current_club: 'وكالة النجوم الرياضية',
      achievements: ['تمثيل محترف'],
      // معلومات التبعية - تابع لوكيل
      club_id: null,
      academy_id: null,
      trainer_id: null,
      agent_id: null // سيتم تحديثه لاحقاً
    }
  ],
  admins: [
    {
      name: 'مدير النظام',
      admin_name: 'مدير النظام',
      isOnline: true,
      isActive: true,
      country: 'السعودية',
      city: 'الرياض',
      phone: '+966501234580',
      email: 'admin@system.com',
      description: 'مدير النظام الرئيسي',
      role: 'مدير عام',
      permissions: ['إدارة المستخدمين', 'إدارة المحتوى', 'إدارة النظام'],
      access_level: 'super_admin'
    }
  ]
};

async function createTestContactsWithDependencies() {
  console.log('🔄 بدء إنشاء بيانات تجريبية مع معلومات التبعية...\n');

  try {
    let totalCreated = 0;
    const createdIds = {
      clubs: [],
      academies: [],
      agents: [],
      trainers: [],
      players: [],
      admins: []
    };

    // إنشاء بيانات لكل نوع من جهات الاتصال
    for (const [collectionName, contacts] of Object.entries(testContacts)) {
      console.log(`📋 إنشاء ${collectionName}...`);
      
      for (const contact of contacts) {
        try {
          // إنشاء معرف فريد
          const docId = `${collectionName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // إضافة بيانات إضافية
          const contactData = {
            ...contact,
            uid: docId,
            accountType: collectionName.slice(0, -1), // إزالة 's' من النهاية
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            isActive: true,
            verified: true
          };

          // حفظ في المجموعة المخصصة
          await db.collection(collectionName).doc(docId).set(contactData);
          
          // حفظ في مجموعة users أيضاً
          await db.collection('users').doc(docId).set({
            uid: docId,
            name: contact.name,
            full_name: contact.full_name || contact.name,
            displayName: contact.name,
            accountType: collectionName.slice(0, -1),
            email: contact.email,
            phone: contact.phone,
            country: contact.country,
            city: contact.city,
            isActive: true,
            verified: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // حفظ المعرف للاستخدام لاحقاً
          createdIds[collectionName].push(docId);

          console.log(`   ✅ تم إنشاء: ${contact.name}`);
          totalCreated++;
        } catch (error) {
          console.log(`   ❌ خطأ في إنشاء ${contact.name}:`, error.message);
        }
      }
      console.log('');
    }

    // تحديث معلومات التبعية للاعبين
    console.log('🔗 تحديث معلومات التبعية للاعبين...');
    
    if (createdIds.clubs.length > 0 && createdIds.players.length > 0) {
      // ربط اللاعب الأول بنادي الهلال
      const player1Id = createdIds.players[0];
      const club1Id = createdIds.clubs[0];
      
      await db.collection('players').doc(player1Id).update({
        club_id: club1Id,
        current_club: 'نادي الهلال'
      });
      
      console.log(`   ✅ ربط اللاعب الأول بنادي الهلال`);
    }
    
    if (createdIds.academies.length > 0 && createdIds.players.length > 1) {
      // ربط اللاعب الثاني بأكاديمية النصر
      const player2Id = createdIds.players[1];
      const academy1Id = createdIds.academies[0];
      
      await db.collection('players').doc(player2Id).update({
        academy_id: academy1Id,
        current_club: 'أكاديمية النصر للشباب'
      });
      
      console.log(`   ✅ ربط اللاعب الثاني بأكاديمية النصر`);
    }
    
    if (createdIds.agents.length > 0 && createdIds.players.length > 2) {
      // ربط اللاعب الثالث بوكالة النجوم
      const player3Id = createdIds.players[2];
      const agent1Id = createdIds.agents[0];
      
      await db.collection('players').doc(player3Id).update({
        agent_id: agent1Id,
        current_club: 'وكالة النجوم الرياضية'
      });
      
      console.log(`   ✅ ربط اللاعب الثالث بوكالة النجوم`);
    }
    
    if (createdIds.trainers.length > 0 && createdIds.players.length > 3) {
      // ربط اللاعب الرابع بمدرب
      const player4Id = createdIds.players[3];
      const trainer1Id = createdIds.trainers[0];
      
      await db.collection('players').doc(player4Id).update({
        trainer_id: trainer1Id,
        current_club: 'أحمد المدرب'
      });
      
      console.log(`   ✅ ربط اللاعب الرابع بمدرب`);
    }

    console.log(`🎉 تم إنشاء ${totalCreated} جهة اتصال بنجاح!`);
    console.log('');
    console.log('📋 ملخص البيانات المنشأة:');
    for (const [collectionName, contacts] of Object.entries(testContacts)) {
      console.log(`   - ${collectionName}: ${contacts.length} جهة اتصال`);
    }
    console.log('');
    console.log('🔗 معلومات التبعية:');
    console.log('   - لاعب تابع لنادي الهلال');
    console.log('   - لاعب تابع لأكاديمية النصر');
    console.log('   - لاعب تابع لوكالة النجوم');
    console.log('   - لاعب تابع لمدرب');
    console.log('');
    console.log('🔄 يمكنك الآن اختبار مركز الرسائل وستجد جهات الاتصال مع علامات التبعية');

  } catch (error) {
    console.error('❌ خطأ في إنشاء البيانات التجريبية:', error);
  }
}

// تشغيل إنشاء البيانات التجريبية
createTestContactsWithDependencies()
  .then(() => {
    console.log('✅ انتهى إنشاء البيانات التجريبية مع التبعية');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ خطأ:', error);
    process.exit(1);
  });
