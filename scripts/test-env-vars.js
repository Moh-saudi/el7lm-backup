require('dotenv').config({ path: '.env.local' });

console.log('=== Environment Variables Test ===');
console.log('');

const envVars = {
  BEON_SMS_TOKEN: process.env.BEON_SMS_TOKEN,
  BEON_SMS_TOKEN_REGULAR: process.env.BEON_SMS_TOKEN_REGULAR,
  BEON_SMS_TOKEN_TEMPLATE: process.env.BEON_SMS_TOKEN_TEMPLATE,
  BEON_SMS_TOKEN_BULK: process.env.BEON_SMS_TOKEN_BULK,
  BEON_SENDER_NAME: process.env.BEON_SENDER_NAME,
  BEON_WHATSAPP_TOKEN: process.env.BEON_WHATSAPP_TOKEN
};

console.log('Environment Variables:');
Object.entries(envVars).forEach(([key, value]) => {
  const status = value ? '✅ Present' : '❌ Missing';
  const preview = value ? `${value.substring(0, 10)}...` : 'NOT_SET';
  console.log(`${key}: ${status} (${preview})`);
});

console.log('');
console.log('=== Testing SMS Service ===');

// Test SMS service configuration
const { default: beonSMSService } = require('../src/lib/beon/sms-service');

const testPhone = '+201234567890';
const testName = 'Test User';

console.log('Testing phone number formatting...');
const formattedPhone = beonSMSService.formatPhoneNumber(testPhone);
console.log(`Original: ${testPhone}`);
console.log(`Formatted: ${formattedPhone}`);

console.log('Testing phone validation...');
const isValid = beonSMSService.validatePhoneNumber(formattedPhone);
console.log(`Valid: ${isValid}`);

console.log('');
console.log('=== Configuration Status ===');
console.log('SMS Service configured:', beonSMSService.validateConfig ? 'Yes' : 'No');

console.log('');
console.log('To test OTP sending, visit: http://localhost:3000/test-otp-quick'); 
