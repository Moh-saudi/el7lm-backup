// سكريبت تشخيص البيئة
const fs = require('fs');
const path = require('path');

console.log('🔍 فحص البيئة...');

// فحص وجود ملف .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ ملف .env.local موجود');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // فحص المتغيرات المهمة
  const vars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];
  
  console.log('\n📋 فحص المتغيرات:');
  vars.forEach(varName => {
    const hasVar = envContent.includes(varName + '=');
    console.log(`${varName}: ${hasVar ? '✅' : '❌'}`);
  });
  
} else {
  console.log('❌ ملف .env.local غير موجود');
}

console.log('\n✅ انتهى الفحص'); 
