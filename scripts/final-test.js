// سكريبت اختبار نهائي شامل للنظام
const fs = require('fs');
const path = require('path');

console.log('🎯 اختبار نهائي شامل للنظام...\n');

// فحص الملفات المطلوبة
const requiredFiles = [
  'src/lib/firebase/admin.ts',
  'src/lib/firebase/config.ts',
  'src/lib/firebase/auth-provider.tsx',
  'src/app/api/auth/check-user-exists/route.ts',
  'src/app/api/sms/send-otp/route.ts',
  'src/app/api/sms/verify-otp/route.ts',
  'src/app/api/sms/otp-storage.ts',
  'src/app/auth/register/page.tsx',
  'src/app/auth/login/page.tsx',
  'src/components/shared/UnifiedOTPVerification.tsx',
  'src/components/shared/SMSOTPVerification.tsx',
  'src/lib/beon/sms-service.ts',
  'firestore.rules',
  '.env.local'
];

console.log('📁 فحص الملفات المطلوبة:');
let allFilesExist = true;
requiredFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  const exists = fs.existsSync(fullPath);
  console.log(`${filePath}: ${exists ? '✅ موجود' : '❌ مفقود'}`);
  if (!exists) allFilesExist = false;
});

// فحص محتوى ملف .env.local
console.log('\n📋 فحص متغيرات البيئة:');
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  ];
  
  let allEnvVarsExist = true;
  requiredEnvVars.forEach(varName => {
    const hasVar = envContent.includes(varName + '=');
    console.log(`${varName}: ${hasVar ? '✅ موجود' : '❌ مفقود'}`);
    if (!hasVar) allEnvVarsExist = false;
  });
  
  // فحص صحة Private Key
  if (envContent.includes('FIREBASE_PRIVATE_KEY=')) {
    const privateKeyMatch = envContent.match(/FIREBASE_PRIVATE_KEY="([^"]+)"/);
    if (privateKeyMatch) {
      const privateKey = privateKeyMatch[1];
      const hasValidFormat = privateKey.includes('-----BEGIN PRIVATE KEY-----') && 
                            privateKey.includes('-----END PRIVATE KEY-----');
      console.log('FIREBASE_PRIVATE_KEY format:', hasValidFormat ? '✅ صحيح' : '❌ غير صحيح');
    }
  }
  
  console.log('\n📊 نتائج الاختبار النهائي:');
  console.log(`الملفات: ${allFilesExist ? '✅ جميع الملفات موجودة' : '❌ بعض الملفات مفقودة'}`);
  console.log(`متغيرات البيئة: ${allEnvVarsExist ? '✅ جميع المتغيرات موجودة' : '❌ بعض المتغيرات مفقودة'}`);
  
  if (allFilesExist && allEnvVarsExist) {
    console.log('\n🎉 النظام جاهز للاستخدام!');
    console.log('\n💡 الخطوات التالية:');
    console.log('1. تأكد من تحديث قيم Firebase Config الحقيقية في .env.local');
    console.log('2. قم بتشغيل الخادم: npm run dev');
    console.log('3. اختبر التسجيل والدخول');
    console.log('\n🔧 ملاحظات مهمة:');
    console.log('- تأكد من أن Firebase Project ID صحيح');
    console.log('- تأكد من أن Service Account Key صحيح');
    console.log('- تأكد من أن Firestore Rules تم نشرها');
    console.log('- تأكد من أن BeOn SMS Token صحيح');
  } else {
    console.log('\n⚠️ هناك مشاكل تحتاج إلى إصلاح:');
    if (!allFilesExist) console.log('- بعض الملفات مفقودة');
    if (!allEnvVarsExist) console.log('- بعض متغيرات البيئة مفقودة');
  }
} else {
  console.log('❌ ملف .env.local غير موجود');
}

console.log('\n🔍 انتهى الاختبار النهائي!'); 
