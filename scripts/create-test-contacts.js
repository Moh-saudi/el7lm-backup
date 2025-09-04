const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');

// تهيئة Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// بيانات تجريبية لجهات الاتصال
const testContacts = {
  clubs: [
    {
      name: 'نادي الهلال',
      clubName: 'نادي الهلال',
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
      clubName: 'نادي النصر',
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
    },
    {
      name: 'نادي الاتحاد',
      clubName: 'نادي الاتحاد',
      organizationName: 'نادي الاتحاد الرياضي',
      isOnline: false,
      isActive: true,
      country: 'السعودية',
      city: 'جدة',
      phone: '+966501234569',
      email: 'info@alittihad.com',
      description: 'نادي الاتحاد السعودي - النمور',
      founded: '1927',
      type: 'احترافي',
      manager: 'سعد العتيبي',
      address: 'جدة، المملكة العربية السعودية',
      website: 'https://alittihad.com',
      facebook: 'https://facebook.com/alittihad',
      twitter: 'https://twitter.com/alittihad',
      instagram: 'https://instagram.com/alittihad',
      stats: {
        players: 26,
        contracts: 18,
        trophies: 8,
        staff: 40
      }
    }
  ],
  academies: [
    {
      name: 'أكاديمية النصر للشباب',
      academyName: 'أكاديمية النصر للشباب',
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
    },
    {
      name: 'أكاديمية الهلال للشباب',
      academyName: 'أكاديمية الهلال للشباب',
      organizationName: 'أكاديمية الهلال للشباب',
      isOnline: true,
      isActive: true,
      country: 'السعودية',
      city: 'الرياض',
      phone: '+966501234571',
      email: 'info@alhilal-academy.com',
      description: 'أكاديمية الهلال لتدريب الشباب',
      founding_year: '2008',
      academy_type: 'شباب',
      is_federation_approved: true,
      license_number: 'AC002',
      registration_date: '2008-01-01',
      address: 'الرياض، المملكة العربية السعودية',
      website: 'https://alhilal-academy.com',
      age_groups: ['U10', 'U12', 'U14', 'U16', 'U18'],
      sports_facilities: ['ملعب عشب طبيعي', 'ملعب عشب صناعي', 'صالة تدريب', 'مسبح'],
      number_of_coaches: 15,
      training_programs: 'برامج تدريبية شاملة',
      achievements: 'بطولات وطنية ودولية'
    }
  ],
  agents: [
    {
      name: 'وكالة النجوم الرياضية',
      agentName: 'وكالة النجوم الرياضية',
      organizationName: 'وكالة النجوم الرياضية',
      isOnline: true,
      isActive: true,
      country: 'السعودية',
      city: 'الرياض',
      phone: '+966501234572',
      email: 'info@stars-agency.com',
      description: 'وكالة رائدة في مجال التمثيل الرياضي',
      agency_name: 'وكالة النجوم الرياضية',
      license_number: 'AG001',
      experience_years: '15',
      specializations: ['لاعبين محترفين', 'مدربين', 'أندية'],
      achievements: 'تمثيل أكثر من 100 لاعب ومدرب'
    },
    {
      name: 'وكالة النخبة الرياضية',
      agentName: 'وكالة النخبة الرياضية',
      organizationName: 'وكالة النخبة الرياضية',
      isOnline: false,
      isActive: true,
      country: 'السعودية',
      city: 'جدة',
      phone: '+966501234573',
      email: 'info@elite-agency.com',
      description: 'وكالة متخصصة في التمثيل الرياضي',
      agency_name: 'وكالة النخبة الرياضية',
      license_number: 'AG002',
      experience_years: '12',
      specializations: ['لاعبين شباب', 'أكاديميات', 'أندية'],
      achievements: 'تمثيل أكثر من 50 لاعب ومدرب'
    }
  ],
  trainers: [
    {
      name: 'أحمد المدرب',
      trainerName: 'أحمد المدرب',
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
    },
    {
      name: 'محمد المدرب',
      trainerName: 'محمد المدرب',
      isOnline: false,
      isActive: true,
      country: 'السعودية',
      city: 'جدة',
      phone: '+966501234575',
      email: 'mohammed@trainer.com',
      description: 'مدرب متخصص في تدريب الحراس',
      specialization: 'تدريب الحراس',
      license: 'TR002',
      experience: '8 سنوات',
      certifications: ['UEFA B', 'Goalkeeper Specialist'],
      achievements: 'تدريب أكثر من 50 حارس'
    }
  ],
  players: [
    {
      name: 'علي محمد',
      playerName: 'علي محمد',
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
      achievements: ['بطولة الدوري السعودي', 'كأس الملك']
    },
    {
      name: 'أحمد خالد',
      playerName: 'أحمد خالد',
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
      achievements: ['بطولة الدوري السعودي', 'كأس الاتحاد الآسيوي']
    }
  ],
  admins: [
    {
      name: 'مدير النظام',
      adminName: 'مدير النظام',
      isOnline: true,
      isActive: true,
      country: 'السعودية',
      city: 'الرياض',
      phone: '+966501234578',
      email: 'admin@system.com',
      description: 'مدير النظام الرئيسي',
      role: 'مدير عام',
      permissions: ['إدارة المستخدمين', 'إدارة المحتوى', 'إدارة النظام'],
      access_level: 'super_admin'
    },
    {
      name: 'مدير المحتوى',
      adminName: 'مدير المحتوى',
      isOnline: false,
      isActive: true,
      country: 'السعودية',
      city: 'الرياض',
      phone: '+966501234579',
      email: 'content@admin.com',
      description: 'مدير المحتوى والبيانات',
      role: 'مدير محتوى',
      permissions: ['إدارة المحتوى', 'إدارة البيانات'],
      access_level: 'content_admin'
    }
  ]
};

async function createTestContacts() {
  console.log('🔄 بدء إنشاء بيانات تجريبية لجهات الاتصال...\n');

  try {
    let totalCreated = 0;

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
            full_name: contact.name,
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

          console.log(`   ✅ تم إنشاء: ${contact.name}`);
          totalCreated++;
        } catch (error) {
          console.log(`   ❌ خطأ في إنشاء ${contact.name}:`, error.message);
        }
      }
      console.log('');
    }

    console.log(`🎉 تم إنشاء ${totalCreated} جهة اتصال بنجاح!`);
    console.log('');
    console.log('📋 ملخص البيانات المنشأة:');
    for (const [collectionName, contacts] of Object.entries(testContacts)) {
      console.log(`   - ${collectionName}: ${contacts.length} جهة اتصال`);
    }
    console.log('');
    console.log('🔄 يمكنك الآن اختبار مركز الرسائل وستجد جهات الاتصال متاحة');

  } catch (error) {
    console.error('❌ خطأ في إنشاء البيانات التجريبية:', error);
  }
}

// تشغيل إنشاء البيانات التجريبية
createTestContacts()
  .then(() => {
    console.log('✅ انتهى إنشاء البيانات التجريبية');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ خطأ:', error);
    process.exit(1);
  });
