const admin = require('firebase-admin');

// تهيئة Firebase Admin
const serviceAccount = require('./el7lm-87884-cfa610cfcb73.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkUserAvatar() {
  try {
    console.log('🔍 فحص بيانات المستخدم...');
    
    // البحث عن المستخدم بالبريد الإلكتروني
    const userEmail = '0555555555@hagzzgo.com';
    
    // البحث في مجموعة users
    const usersRef = db.collection('users');
    const userQuery = await usersRef.where('email', '==', userEmail).get();
    
    if (!userQuery.empty) {
      const userDoc = userQuery.docs[0];
      const userData = userDoc.data();
      
      console.log('✅ تم العثور على المستخدم:', userDoc.id);
      console.log('📊 بيانات المستخدم:', JSON.stringify(userData, null, 2));
      
      // فحص الحقول المتعلقة بالصورة
      console.log('\n🔍 فحص الحقول المتعلقة بالصورة:');
      console.log('profile_image_url:', userData.profile_image_url);
      console.log('profile_image:', userData.profile_image);
      console.log('avatar:', userData.avatar);
      console.log('photoURL:', userData.photoURL);
      console.log('profilePicture:', userData.profilePicture);
      console.log('image:', userData.image);
      
      // فحص نوع البيانات
      if (userData.profile_image) {
        console.log('نوع profile_image:', typeof userData.profile_image);
        if (typeof userData.profile_image === 'object') {
          console.log('محتوى profile_image:', JSON.stringify(userData.profile_image, null, 2));
        }
      }
      
    } else {
      console.log('❌ لم يتم العثور على المستخدم');
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    process.exit(0);
  }
}

checkUserAvatar(); 
