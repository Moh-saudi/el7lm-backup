// سكريبت لنشر قواعد Firestore
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 بدء تطبيق قواعد Firestore...');

// التحقق من وجود ملف القواعد
const rulesPath = path.join(__dirname, '..', 'firestore.rules');
if (!fs.existsSync(rulesPath)) {
  console.error('❌ ملف firestore.rules غير موجود');
  process.exit(1);
}

try {
  // تطبيق قواعد Firestore
  console.log('📋 تطبيق قواعد Firestore...');
  execSync('firebase deploy --only firestore:rules', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  console.log('✅ تم تطبيق قواعد Firestore بنجاح');
  
  // عرض القواعد المطبقة
  console.log('\n📋 قواعد Firestore المطبقة:');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');
  console.log(rulesContent);
  
} catch (error) {
  console.error('❌ خطأ في تطبيق قواعد Firestore:', error.message);
  
  // محاولة بديلة باستخدام gcloud
  console.log('\n🔄 محاولة بديلة باستخدام gcloud...');
  try {
    execSync('gcloud firestore rules deploy firestore.rules', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log('✅ تم تطبيق القواعد باستخدام gcloud');
  } catch (gcloudError) {
    console.error('❌ فشل في تطبيق القواعد:', gcloudError.message);
    console.log('\n📝 تعليمات يدوية:');
    console.log('1. تأكد من تسجيل الدخول إلى Firebase: firebase login');
    console.log('2. تطبيق القواعد: firebase deploy --only firestore:rules');
    console.log('3. أو استخدم gcloud: gcloud firestore rules deploy firestore.rules');
  }
}

console.log('\n🔧 للتحقق من حالة القواعد:');
console.log('firebase firestore:rules:get');
console.log('أو');
console.log('gcloud firestore rules describe'); 
