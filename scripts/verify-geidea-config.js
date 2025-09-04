#!/usr/bin/env node

/**
 * Geidea Configuration Verification Script
 * سكريبت التحقق من إعدادات Geidea
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Geidea Configuration Checker');
console.log('================================\n');

// Geidea environment variables
const geideaVars = {
  'GEIDEA_MERCHANT_PUBLIC_KEY': process.env.GEIDEA_MERCHANT_PUBLIC_KEY,
  'GEIDEA_API_PASSWORD': process.env.GEIDEA_API_PASSWORD,
  'GEIDEA_WEBHOOK_SECRET': process.env.GEIDEA_WEBHOOK_SECRET,
  'GEIDEA_BASE_URL': process.env.GEIDEA_BASE_URL,
  'NEXT_PUBLIC_GEIDEA_ENVIRONMENT': process.env.NEXT_PUBLIC_GEIDEA_ENVIRONMENT
};

console.log('📋 Checking Geidea Configuration:\n');

let allValid = true;
const placeholderPatterns = [
  'your_merchant_public_key_here',
  'your_api_password_here',
  'your_webhook_secret_here',
  'your_merchant_public_key',
  'your_api_password',
  'your_webhook_secret'
];

// Check each variable
Object.entries(geideaVars).forEach(([key, value]) => {
  const isPlaceholder = placeholderPatterns.some(pattern => 
    value && value.includes(pattern.replace('_here', ''))
  );
  
  if (!value) {
    console.log(`❌ ${key}: Missing`);
    allValid = false;
  } else if (isPlaceholder) {
    console.log(`⚠️  ${key}: Set (placeholder value)`);
    console.log(`   Value: ${value.substring(0, 20)}...`);
    allValid = false;
  } else {
    console.log(`✅ ${key}: Set`);
    console.log(`   Value: ${value.substring(0, 20)}...`);
  }
  console.log('');
});

// Summary
console.log('📊 Summary:');
if (allValid) {
  console.log('✅ All Geidea variables are properly configured!');
  console.log('✅ Geidea configuration is ready for production');
} else {
  console.log('❌ Geidea configuration issues found:');
  console.log('\n⚠️  To fix this:');
  console.log('1. Go to: https://merchant.geidea.net/');
  console.log('2. Get your production credentials');
  console.log('3. Update .env.local with real values');
  console.log('4. Set up webhook URL in Geidea dashboard');
}

console.log('\n🔧 Environment:', process.env.NEXT_PUBLIC_GEIDEA_ENVIRONMENT || 'test');
console.log('🌐 Base URL:', process.env.GEIDEA_BASE_URL || 'https://api-test.merchant.geidea.net');
console.log('🧪 Mode: Test Environment (No real payments)');

console.log('\n📖 For detailed setup instructions, see: GEIDEA_PRODUCTION_SETUP.md'); 
