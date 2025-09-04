// سكريبت اختبار سريع للنظام
const fs = require('fs');
const path = require('path');

console.log('🧪 اختبار سريع للنظام...\n');

// فحص الملفات المهمة
const importantFiles = [
  'firestore.rules',
  'firebase.json',
  'firestore.indexes.json',
  '.env.local',
  'src/lib/firebase/admin.ts',
  'src/lib/firebase/config.ts',
  'src/app/api/auth/check-user-exists/route.ts'
];

console.log('📁 فحص الملفات المهمة:');
let allFilesExist = true;
importantFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  const exists = fs.existsSync(fullPath);
  console.log(`${filePath}: ${exists ? '✅' : '❌'}`);
  if (!exists) allFilesExist = false;
});

// فحص متغيرات البيئة
console.log('\n📋 فحص متغيرات البيئة:');
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const requiredVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  ];
  
  let allVarsExist = true;
  requiredVars.forEach(varName => {
    const hasVar = envContent.includes(varName + '=');
    console.log(`${varName}: ${hasVar ? '✅' : '❌'}`);
    if (!hasVar) allVarsExist = false;
  });
  
  console.log('\n📊 النتائج:');
  console.log(`الملفات: ${allFilesExist ? '✅ جميع الملفات موجودة' : '❌ بعض الملفات مفقودة'}`);
  console.log(`متغيرات البيئة: ${allVarsExist ? '✅ جميع المتغيرات موجودة' : '❌ بعض المتغيرات مفقودة'}`);
  
  if (allFilesExist && allVarsExist) {
    console.log('\n🎉 النظام جاهز للاختبار!');
    console.log('\n💡 الخطوات التالية:');
    console.log('1. تأكد من نشر قواعد Firestore');
    console.log('2. اختبر التسجيل: http://localhost:3000/auth/register');
    console.log('3. اختبر الدخول: http://localhost:3000/auth/login');
    console.log('4. اختبر النظام: http://localhost:3000/test-system');
  } else {
    console.log('\n⚠️ هناك مشاكل تحتاج إلى إصلاح');
  }
} else {
  console.log('❌ ملف .env.local غير موجود');
}

console.log('\n✅ انتهى الاختبار السريع'); 
