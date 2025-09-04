#!/usr/bin/env node

/**
 * Firebase Indexes Deployment Script
 * This script deploys Firestore indexes using Firebase CLI
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// التحقق من وجود Firebase CLI
function checkFirebaseCLI() {
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// تثبيت Firebase CLI
function installFirebaseCLI() {
  console.log('📦 Installing Firebase CLI...');
  try {
    execSync('npm install -g firebase-tools', { stdio: 'inherit' });
    console.log('✅ Firebase CLI installed successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to install Firebase CLI:', error.message);
    return false;
  }
}

// تسجيل الدخول إلى Firebase
function loginToFirebase() {
  console.log('🔐 Logging in to Firebase...');
  try {
    execSync('firebase login', { stdio: 'inherit' });
    console.log('✅ Firebase login successful');
    return true;
  } catch (error) {
    console.error('❌ Firebase login failed:', error.message);
    return false;
  }
}

// تهيئة Firebase في المشروع
function initializeFirebase() {
  console.log('🔧 Initializing Firebase project...');
  try {
    // التحقق من وجود firebase.json
    if (!fs.existsSync('firebase.json')) {
      execSync('firebase init firestore --project hagzzgo-87884 --yes', { stdio: 'inherit' });
    }
    console.log('✅ Firebase project initialized');
    return true;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    return false;
  }
}

// نشر الفهارس
function deployIndexes() {
  console.log('🚀 Deploying Firestore indexes...');
  try {
    execSync('firebase deploy --only firestore:indexes', { stdio: 'inherit' });
    console.log('✅ Indexes deployed successfully');
    return true;
  } catch (error) {
    console.error('❌ Index deployment failed:', error.message);
    return false;
  }
}

// الدالة الرئيسية
async function deployFirebaseIndexes() {
  console.log('🔥 Firebase Indexes Deployment');
  console.log('================================\n');

  // التحقق من وجود Firebase CLI
  if (!checkFirebaseCLI()) {
    console.log('⚠️ Firebase CLI not found');
    const install = await askQuestion('Do you want to install Firebase CLI? (y/n): ');
    if (install.toLowerCase() === 'y') {
      if (!installFirebaseCLI()) {
        console.log('❌ Cannot proceed without Firebase CLI');
        return;
      }
    } else {
      console.log('❌ Cannot proceed without Firebase CLI');
      return;
    }
  }

  // تسجيل الدخول إلى Firebase
  if (!loginToFirebase()) {
    console.log('❌ Cannot proceed without Firebase login');
    return;
  }

  // تهيئة Firebase
  if (!initializeFirebase()) {
    console.log('❌ Cannot proceed without Firebase initialization');
    return;
  }

  // نشر الفهارس
  if (deployIndexes()) {
    console.log('\n🎉 All indexes deployed successfully!');
    console.log('\n⏱️ Expected Creation Time:');
    console.log('   - Simple indexes: 1-2 minutes');
    console.log('   - Composite indexes: 2-5 minutes');
    console.log('   - Large collections: 5-15 minutes');
    
    console.log('\n✅ After Deployment:');
    console.log('   - Wait for indexes to finish building');
    console.log('   - Restart your application');
    console.log('   - Firebase errors should disappear');
    
    console.log('\n🔗 Check progress at:');
    console.log('   https://console.firebase.google.com/project/hagzzgo-87884/firestore/indexes');
  } else {
    console.log('\n❌ Index deployment failed');
    console.log('\n🔧 Alternative Solutions:');
    console.log('1. Create indexes manually:');
    console.log('   https://console.firebase.google.com/project/hagzzgo-87884/firestore/indexes');
    console.log('');
    console.log('2. Use direct links:');
    console.log('   Notifications: https://console.firebase.google.com/v1/r/project/hagzzgo-87884/firestore/indexes?create_composite=ClNwcm9qZWN0cy9oYWd6emdvLTg3ODg0L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9ub3RpZmljYXRpb25zL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg0KCXRpbWVzdGFtcBACGgwKCF9fbmFtZV9fEAI');
    console.log('   Messages: https://console.firebase.google.com/v1/r/project/hagzzgo-87884/firestore/indexes?create_composite=Ck5wcm9qZWN0cy9oYWd6emdvLTg3ODg0L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9tZXNzYWdlcy9pbmRleGVzL18QARoOCgpyZWNlaXZlcklkEAEaDQoJdGltZXN0YW1wEAIaDAoIX19uYW1lX18QAg');
  }
}

// دالة مساعدة لطرح الأسئلة
function askQuestion(question) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// تشغيل السكريبت
if (require.main === module) {
  deployFirebaseIndexes().catch(console.error);
}

module.exports = { deployFirebaseIndexes };
