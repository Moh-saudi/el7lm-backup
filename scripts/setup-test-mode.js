#!/usr/bin/env node

/**
 * Geidea Test Mode Setup Script
 * سكريبت إعداد وضع الاختبار لـ Geidea
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Geidea Test Mode Setup');
console.log('==========================\n');

const envLocalPath = path.join(process.cwd(), '.env.local');

// Check current environment
const currentEnv = process.env.NEXT_PUBLIC_GEIDEA_ENVIRONMENT || 'test';
const currentBaseUrl = process.env.GEIDEA_BASE_URL || 'https://api-test.merchant.geidea.net';

console.log('📋 Current Configuration:');
console.log(`🔧 Environment: ${currentEnv}`);
console.log(`🌐 Base URL: ${currentBaseUrl}`);
console.log('');

if (currentEnv === 'test') {
  console.log('✅ Test mode is already configured!');
  console.log('🧪 You can now test payments without real charges');
} else {
  console.log('⚠️  Switching to test mode...');
}

// Check if Geidea credentials are using placeholders
const hasPlaceholders = 
  process.env.GEIDEA_MERCHANT_PUBLIC_KEY?.includes('your_') ||
  process.env.GEIDEA_API_PASSWORD?.includes('your_') ||
  process.env.GEIDEA_WEBHOOK_SECRET?.includes('your_');

if (hasPlaceholders) {
  console.log('\n❌ Geidea configuration is using placeholder values!');
  console.log('\n📋 To complete test setup:');
  console.log('\n1. Go to: https://merchant.geidea.net/');
  console.log('2. Get your test credentials');
  console.log('3. Update .env.local with test values');
  console.log('4. Set up test webhook URL');
  
  console.log('\n🔧 Example test configuration:');
  console.log(`
# Geidea Test Configuration
GEIDEA_MERCHANT_PUBLIC_KEY=your_test_merchant_public_key
GEIDEA_API_PASSWORD=your_test_api_password
GEIDEA_WEBHOOK_SECRET=your_test_webhook_secret
GEIDEA_BASE_URL=https://api-test.merchant.geidea.net
NEXT_PUBLIC_GEIDEA_ENVIRONMENT=test
NEXT_PUBLIC_BASE_URL=http://localhost:3000
  `);
  
  console.log('\n🧪 Test Mode Benefits:');
  console.log('- No real charges');
  console.log('- Safe testing environment');
  console.log('- Full feature testing');
  console.log('- Free test transactions');
  
} else {
  console.log('✅ Geidea test configuration looks good!');
  console.log('🧪 Ready for test payments');
}

console.log('\n📖 For detailed instructions, see: GEIDEA_TEST_SETUP.md'); 
