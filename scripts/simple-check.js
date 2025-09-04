// سكريبت تشخيص بسيط للبيئة
const fs = require('fs');
const path = require('path');

console.log('🔍 فحص إعدادات البيئة...\n');

// فحص وجود ملف .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ ملف .env.local موجود');
  
  // قراءة محتوى الملف
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // فحص المتغيرات المهمة
  const requiredVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  ];
  
  console.log('\n📋 فحص المتغيرات المطلوبة:');
  requiredVars.forEach(varName => {
    const hasVar = envContent.includes(varName + '=');
    console.log(`${varName}: ${hasVar ? '✅ موجود' : '❌ مفقود'}`);
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
  
} else {
  console.log('❌ ملف .env.local غير موجود');
}

console.log('\n🔍 انتهى فحص البيئة!'); 
