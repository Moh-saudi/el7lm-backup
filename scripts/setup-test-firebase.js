#!/usr/bin/env node

/**
 * Firebase Setup Helper Script
 * سكريبت مساعد لإعداد Firebase
 */

const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase Setup Helper');
console.log('========================\n');

const envLocalPath = path.join(process.cwd(), '.env.local');

// Check if .env.local exists
if (!fs.existsSync(envLocalPath)) {
  console.log('❌ .env.local file not found!');
  console.log('Creating .env.local file...');
  
  const templateContent = `# Firebase Configuration
# Replace these placeholder values with your actual Firebase credentials
# Get them from: https://console.firebase.google.com/ > Project Settings > General > Your apps

NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Geidea Payment Gateway Configuration
GEIDEA_MERCHANT_PUBLIC_KEY=your_merchant_public_key_here
GEIDEA_API_PASSWORD=your_api_password_here
GEIDEA_WEBHOOK_SECRET=your_webhook_secret_here
GEIDEA_BASE_URL=https://api.merchant.geidea.net
NEXT_PUBLIC_GEIDEA_ENVIRONMENT=production
NEXT_PUBLIC_BASE_URL=http://localhost:3000
`;

  fs.writeFileSync(envLocalPath, templateContent);
  console.log('✅ Created .env.local file with template');
}

// Read current .env.local
const currentContent = fs.readFileSync(envLocalPath, 'utf8');

// Check if Firebase config is using placeholders
const hasPlaceholders = currentContent.includes('your_firebase_api_key') || 
                       currentContent.includes('your_project.firebaseapp.com') ||
                       currentContent.includes('your_project_id');

if (hasPlaceholders) {
  console.log('❌ Firebase configuration is using placeholder values!');
  console.log('\n📋 To fix this, you need to:');
  console.log('\n1. Go to Firebase Console: https://console.firebase.google.com/');
  console.log('2. Create a new project or select existing one');
  console.log('3. Go to Project Settings > General');
  console.log('4. Add a web app (</> icon)');
  console.log('5. Copy the configuration object');
  console.log('6. Replace the placeholder values in .env.local');
  
  console.log('\n🔧 Example of real Firebase config:');
  console.log(`
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC-example-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-name.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-name
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-name.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
  `);
  
  console.log('\n🚨 After updating .env.local, restart your development server:');
  console.log('   npm run dev');
  
} else {
  console.log('✅ Firebase configuration looks good!');
  console.log('   All placeholder values have been replaced with real credentials.');
}

console.log('\n📖 For detailed instructions, see: FIREBASE_CREDENTIALS_SETUP.md'); 
