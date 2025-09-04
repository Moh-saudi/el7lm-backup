const fs = require('fs');

console.log('🔍 التحقق من مفاتيح جيديا');
console.log('========================\n');

// قراءة ملف .env.local
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  console.log('✅ تم قراءة ملف .env.local');
  
  // التحقق من المفاتيح
  const hasMerchantKey = envContent.includes('GEIDEA_MERCHANT_PUBLIC_KEY=3448c010-87b1-41e7-9771-cac444268cfb');
  const hasApiPassword = envContent.includes('GEIDEA_API_PASSWORD=edfd5eee-fd1b-4932-9ee1-d6d9ba7599f0');
  const hasWebhookSecret = envContent.includes('GEIDEA_WEBHOOK_SECRET=geidea_webhook_secret_production_2024');
  const hasBaseUrl = envContent.includes('GEIDEA_BASE_URL=https://api.merchant.geidea.net');
  const hasEnvironment = envContent.includes('NEXT_PUBLIC_GEIDEA_ENVIRONMENT=production');
  
  console.log(`Merchant Key: ${hasMerchantKey ? '✅' : '❌'}`);
  console.log(`API Password: ${hasApiPassword ? '✅' : '❌'}`);
  console.log(`Webhook Secret: ${hasWebhookSecret ? '✅' : '❌'}`);
  console.log(`Base URL: ${hasBaseUrl ? '✅' : '❌'}`);
  console.log(`Environment: ${hasEnvironment ? '✅' : '❌'}`);
  
  if (hasMerchantKey && hasApiPassword && hasWebhookSecret && hasBaseUrl && hasEnvironment) {
    console.log('\n🎉 جميع المفاتيح محدثة بنجاح!');
  } else {
    console.log('\n⚠️ بعض المفاتيح تحتاج تحديث');
  }
  
} catch (error) {
  console.error('❌ خطأ في قراءة الملف:', error.message);
}
















