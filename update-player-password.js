// تحديث كلمة مرور اللاعب للرقم الموحد
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, updateDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBJCqR1CzNVRNsAe1F-I6kqaAKfMGFNJXM",
  authDomain: "el7lm-go.firebaseapp.com",
  projectId: "el7lm-go",
  storageBucket: "el7lm-go.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// بيانات اللاعب المراد تحديثه
const playerData = {
  email: 'meskll@gmail.com',
  uid: 'F9UvdjTrtJbPvGf8F1ZzbFSKx6m1',
  oldPassword: 'DfQTmcZbaY72',
  newPassword: 'Player123!@#'  // الرقم الموحد
};

async function testAndUpdatePlayer() {
  console.log('🧪 اختبار وتحديث بيانات اللاعب المحول');
  console.log('=' .repeat(50));
  
  try {
    // 1. اختبار كلمة المرور الحالية
    console.log('🔐 اختبار كلمة المرور الحالية...');
    console.log('📧 البريد:', playerData.email);
    console.log('🔑 كلمة المرور القديمة:', playerData.oldPassword);
    
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        playerData.email, 
        playerData.oldPassword
      );
      
      console.log('✅ نجح تسجيل الدخول بكلمة المرور القديمة!');
      console.log('👤 UID:', userCredential.user.uid);
      
      // تسجيل خروج
      await auth.signOut();
      
      // 2. تحديث البيانات في Firestore للرقم الموحد
      console.log('\n🔄 تحديث البيانات في Firestore...');
      await updateDoc(doc(db, 'users', playerData.uid), {
        tempPassword: playerData.newPassword,
        unifiedPassword: true,
        needsPasswordChange: false, // لا يحتاج تغيير بعد الآن
        updatedAt: new Date()
      });
      
      console.log('✅ تم تحديث البيانات في Firestore');
      
      console.log('\n🎉 العملية مكتملة بنجاح!');
      console.log('📋 بيانات تسجيل الدخول الجديدة:');
      console.log(`📧 البريد: ${playerData.email}`);
      console.log(`🔐 كلمة المرور: ${playerData.oldPassword} (تعمل حالياً)`);
      console.log(`💡 أو استخدم: ${playerData.newPassword} (للتوحيد)`);
      
    } catch (loginError) {
      console.log('❌ فشل تسجيل الدخول بكلمة المرور القديمة');
      console.log('🔄 محاولة استخدام الرقم الموحد...');
      
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth, 
          playerData.email, 
          playerData.newPassword
        );
        
        console.log('✅ نجح تسجيل الدخول بالرقم الموحد!');
        console.log('👤 UID:', userCredential.user.uid);
        
        await auth.signOut();
        
        console.log('\n📋 بيانات تسجيل الدخول:');
        console.log(`📧 البريد: ${playerData.email}`);
        console.log(`🔐 كلمة المرور: ${playerData.newPassword}`);
        
      } catch (unifiedError) {
        console.log('❌ فشل تسجيل الدخول بالرقم الموحد أيضاً');
        console.log('💡 الحل: استخدام إعادة تعيين كلمة المرور');
        
        console.log('\n📋 معلومات اللاعب:');
        console.log(`📧 البريد: ${playerData.email}`);
        console.log(`🆔 UID: ${playerData.uid}`);
        console.log(`🔐 كلمة المرور المتوقعة: ${playerData.oldPassword}`);
        console.log(`🔐 الرقم الموحد المطلوب: ${playerData.newPassword}`);
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ عام:', error);
  }
}

// 3. اختبار الإشعارات للاعب المحول
async function testNotificationForPlayer() {
  console.log('\n🔔 اختبار إشعار للاعب المحول');
  console.log('=' .repeat(30));
  
  try {
    // إشعار تجريبي
    const notificationData = {
      type: 'profile_view',
      profileOwnerId: playerData.uid,
      viewerId: 'test-viewer-123',
      viewerName: 'مستخدم تجريبي',
      viewerType: 'academy',
      viewerAccountType: 'academy',
      profileType: 'player'
    };
    
    console.log('📢 إرسال إشعار تجريبي...');
    console.log('📦 بيانات الإشعار:', notificationData);
    
    const response = await fetch('http://localhost:3001/api/notifications/interaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ تم إرسال الإشعار بنجاح:', result);
    } else {
      console.log('❌ فشل إرسال الإشعار:', response.status);
    }
    
  } catch (error) {
    console.log('⚠️ خطأ في اختبار الإشعار (طبيعي إذا كان المشروع مغلق):', error.message);
  }
}

async function main() {
  console.log('🚀 فحص بيانات اللاعب المحول "بلدية"');
  console.log('🎯 الهدف: التأكد من إمكانية تسجيل الدخول واستقبال الإشعارات\n');
  
  await testAndUpdatePlayer();
  await testNotificationForPlayer();
  
  console.log('\n🎯 الخطوات التالية:');
  console.log('1. جرب تسجيل الدخول في الموقع');
  console.log('2. جرب صفحة التشخيص: http://localhost:3001/test-notifications-debug');
  console.log('3. اختبر إرسال إشعار لهذا اللاعب');
}

main(); 
