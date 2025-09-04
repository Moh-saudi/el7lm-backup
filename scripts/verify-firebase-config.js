#!/usr/bin/env node

/**
 * Firebase Configuration Verification Script
 * سكريبت التحقق من إعدادات Firebase
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Firebase Configuration Checker');
console.log('================================\n');

// Firebase environment variables
const firebaseVars = {
  'NEXT_PUBLIC_FIREBASE_API_KEY': process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  'NEXT_PUBLIC_FIREBASE_APP_ID': process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID': process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Check each variable
let allValid = true;
const missingVars = [];
const placeholderVars = [];

console.log('📋 Checking Firebase Configuration:\n');

Object.entries(firebaseVars).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  const statusText = value ? 'Set' : 'Missing';
  
  if (!value) {
    missingVars.push(key);
    allValid = false;
  } else if (value.includes('your_') || value.includes('placeholder')) {
    placeholderVars.push(key);
    allValid = false;
  }
  
  console.log(`${status} ${key}: ${statusText}`);
  if (value && value.length > 20) {
    console.log(`   Value: ${value.substring(0, 20)}...`);
  } else if (value) {
    console.log(`   Value: ${value}`);
  }
});

console.log('\n📊 Summary:');

if (allValid) {
  console.log('✅ All Firebase variables are properly configured!');
  console.log('🚀 Your Firebase setup is ready to use.');
} else {
  console.log('❌ Firebase configuration issues found:');
  
  if (missingVars.length > 0) {
    console.log(`\n📝 Missing variables (${missingVars.length}):`);
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
  }
  
  if (placeholderVars.length > 0) {
    console.log(`\n⚠️  Placeholder variables (${placeholderVars.length}):`);
    placeholderVars.forEach(varName => {
      console.log(`   - ${varName} (still using placeholder value)`);
    });
  }
  
  console.log('\n🔧 To fix these issues:');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
  console.log('2. Create a new project or select existing one');
  console.log('3. Add a web app to your project');
  console.log('4. Copy the configuration values');
  console.log('5. Update your .env.local file with real values');
  console.log('\n📖 See FIREBASE_SETUP.md for detailed instructions');
}

// Check if .env.local exists
const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envLocalPath)) {
  console.log('\n⚠️  Warning: .env.local file not found!');
  console.log('   Create .env.local file in your project root');
} else {
  console.log('\n✅ .env.local file found');
}

console.log('\n🔗 Useful Links:');
console.log('- Firebase Console: https://console.firebase.google.com/');
console.log('- Firebase Setup Guide: FIREBASE_SETUP.md');
console.log('- Next.js Environment Variables: https://nextjs.org/docs/basic-features/environment-variables');

if (!allValid) {
  console.log('\n💡 Quick Fix:');
  console.log('1. Copy the example from .env.example');
  console.log('2. Replace placeholder values with real Firebase config');
  console.log('3. Restart your development server');
  
  process.exit(1);
} else {
  console.log('\n🎉 Firebase configuration is ready!');
  process.exit(0);
} 
