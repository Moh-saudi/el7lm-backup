#!/usr/bin/env node

/**
 * Script للتحقق من البيئة في production
 * يستخدم للتحقق من المتغيرات البيئية المطلوبة
 */

console.log('🔍 Checking production environment...\n');

// التحقق من المتغيرات البيئية الأساسية
const requiredEnvVars = [
  'NODE_ENV',
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

const optionalEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'BEON_SMS_TOKEN',
  'BEON_SENDER_NAME',
  'BEON_WHATSAPP_TOKEN',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

console.log('📋 Required Environment Variables:');
let allRequiredPresent = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: SET`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
    allRequiredPresent = false;
  }
});

console.log('\n📋 Optional Environment Variables:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: SET`);
  } else {
    console.log(`⚠️  ${varName}: NOT SET (optional)`);
  }
});

console.log('\n🔧 System Information:');
console.log(`Node.js Version: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`Architecture: ${process.arch}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);

// التحقق من Firebase Private Key
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
  console.log('\n🔐 Firebase Private Key Analysis:');
  console.log(`Length: ${privateKey.length} characters`);
  console.log(`Contains \\n: ${privateKey.includes('\\n')}`);
  console.log(`Contains actual newlines: ${privateKey.includes('\n')}`);
  console.log(`Starts with -----BEGIN: ${privateKey.includes('-----BEGIN PRIVATE KEY-----')}`);
  console.log(`Ends with -----END: ${privateKey.includes('-----END PRIVATE KEY-----')}`);
  
  if (!privateKey.includes('\\n') && !privateKey.includes('\n')) {
    console.log('⚠️  WARNING: Private key may need \\n formatting');
  }
}

// التحقق من Firebase Project ID
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
if (projectId) {
  console.log('\n🔥 Firebase Project Analysis:');
  console.log(`Project ID: ${projectId}`);
  console.log(`Length: ${projectId.length} characters`);
  console.log(`Contains special chars: ${/[^a-zA-Z0-9-]/.test(projectId)}`);
}

console.log('\n📊 Summary:');
if (allRequiredPresent) {
  console.log('✅ All required environment variables are set');
  console.log('🚀 Ready for production deployment');
} else {
  console.log('❌ Some required environment variables are missing');
  console.log('⚠️  Please set all required environment variables before deployment');
}

// التحقق من وجود ملفات مهمة
const fs = require('fs');
const path = require('path');

console.log('\n📁 File System Check:');
const importantFiles = [
  'next.config.js',
  'package.json',
  'Dockerfile',
  '.env.local',
  'src/lib/firebase/admin.ts'
];

importantFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}: EXISTS`);
  } else {
    console.log(`❌ ${file}: MISSING`);
  }
});

console.log('\n🎯 Deployment Recommendations:');
if (!allRequiredPresent) {
  console.log('1. Set all required environment variables in Coolify');
  console.log('2. Ensure Firebase service account key is properly formatted');
  console.log('3. Verify project ID matches your Firebase project');
} else {
  console.log('1. Environment looks good for deployment');
  console.log('2. Consider testing Firebase connection');
  console.log('3. Monitor logs after deployment');
}

console.log('\n✨ Environment check completed!'); 
