// scripts/verify-geidea-production.js
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Geidea Production Configuration...\n');

// Read .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.error('❌ Could not read .env.local file:', error.message);
  process.exit(1);
}

// Parse environment variables
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#][^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

// Check Geidea configuration
const geideaConfig = {
  merchantPublicKey: envVars.GEIDEA_MERCHANT_PUBLIC_KEY,
  apiPassword: envVars.GEIDEA_API_PASSWORD,
  webhookSecret: envVars.GEIDEA_WEBHOOK_SECRET,
  baseUrl: envVars.GEIDEA_BASE_URL,
  environment: envVars.NEXT_PUBLIC_GEIDEA_ENVIRONMENT
};

console.log('📋 Geidea Configuration Check:');
console.log('================================');

// Check each configuration item
const checks = [
  {
    name: 'Merchant Public Key',
    value: geideaConfig.merchantPublicKey,
    isValid: (val) => val && !val.includes('your_') && val.length > 10,
    required: true
  },
  {
    name: 'API Password',
    value: geideaConfig.apiPassword,
    isValid: (val) => val && !val.includes('your_') && val.length > 10,
    required: true
  },
  {
    name: 'Webhook Secret',
    value: geideaConfig.webhookSecret,
    isValid: (val) => val && !val.includes('your_') && val.length > 10,
    required: true
  },
  {
    name: 'Base URL',
    value: geideaConfig.baseUrl,
    isValid: (val) => val && val.includes('api.merchant.geidea.net'),
    required: true
  },
  {
    name: 'Environment',
    value: geideaConfig.environment,
    isValid: (val) => val === 'production',
    required: true
  }
];

let allValid = true;
let missingRequired = [];

checks.forEach(check => {
  const isValid = check.isValid(check.value);
  const status = isValid ? '✅' : '❌';
  const value = check.value ? `${check.value.substring(0, 20)}...` : 'NOT SET';
  
  console.log(`${status} ${check.name}: ${value}`);
  
  if (!isValid && check.required) {
    missingRequired.push(check.name);
    allValid = false;
  }
});

console.log('\n📊 Summary:');
console.log('============');

if (allValid) {
  console.log('✅ All Geidea configuration is valid for production!');
  console.log('🚀 Ready to process real payments');
  
  // Additional production warnings
  console.log('\n⚠️  Production Warnings:');
  console.log('========================');
  console.log('• All payments will be REAL transactions');
  console.log('• Make sure your webhook URL is properly configured');
  console.log('• Ensure your return URL is HTTPS and registered with Geidea');
  console.log('• Test with small amounts first');
  
} else {
  console.log('❌ Geidea configuration has issues:');
  missingRequired.forEach(item => {
    console.log(`   • ${item} is missing or invalid`);
  });
  console.log('\n🔧 Please fix the above issues before proceeding');
}

// Check for localhost in production
if (geideaConfig.environment === 'production') {
  console.log('\n🌐 Production Environment Check:');
  console.log('================================');
  
  const baseUrl = envVars.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  if (baseUrl.includes('localhost')) {
    console.log('⚠️  Warning: Running production Geidea on localhost');
    console.log('   • This may cause "Invalid return url" errors');
    console.log('   • Consider using a proper HTTPS domain for testing');
    console.log('   • The system will use webhook.site as fallback');
  } else {
    console.log('✅ Using proper HTTPS domain for production');
  }
}

console.log('\n🎯 Next Steps:');
console.log('==============');
if (allValid) {
  console.log('1. Test a small payment to verify everything works');
  console.log('2. Monitor the webhook.site URL for payment notifications');
  console.log('3. Check the browser console for any remaining warnings');
  console.log('4. Verify payment data is being saved correctly');
} else {
  console.log('1. Fix the configuration issues listed above');
  console.log('2. Restart the development server');
  console.log('3. Run this verification script again');
}

console.log('\n✨ Verification complete!'); 
