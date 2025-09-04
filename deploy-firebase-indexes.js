#!/usr/bin/env node

/**
 * Firebase Indexes Deployment Script
 * This script deploys the required Firestore indexes to resolve index errors
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔥 Deploying Firebase Indexes...\n');

// Check if firebase-tools is installed
try {
  execSync('firebase --version', { stdio: 'pipe' });
} catch (error) {
  console.error('❌ Firebase CLI is not installed. Please install it first:');
  console.error('npm install -g firebase-tools');
  process.exit(1);
}

// Check if firebase.json exists
const firebaseJsonPath = path.join(process.cwd(), 'firebase.json');
if (!fs.existsSync(firebaseJsonPath)) {
  console.error('❌ firebase.json not found. Please initialize Firebase first:');
  console.error('firebase init');
  process.exit(1);
}

// Check if firestore.indexes.json exists
const indexesPath = path.join(process.cwd(), 'firestore.indexes.json');
if (!fs.existsSync(indexesPath)) {
  console.error('❌ firestore.indexes.json not found.');
  process.exit(1);
}

try {
  console.log('📋 Deploying Firestore indexes...');
  
  // Deploy only the indexes
  execSync('firebase deploy --only firestore:indexes', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('\n✅ Firebase indexes deployed successfully!');
  console.log('⏱️  Please wait 2-5 minutes for indexes to finish building.');
  console.log('🔄 After that, the index errors should disappear.');
  
} catch (error) {
  console.error('\n❌ Failed to deploy Firebase indexes:');
  console.error(error.message);
  
  console.log('\n🔧 Manual Steps:');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com');
  console.log('2. Select your project: hagzzgo-87884');
  console.log('3. Go to Firestore Database > Indexes');
  console.log('4. Create the following index manually:');
  console.log('   Collection: ads');
  console.log('   Fields: isActive (Ascending), priority (Descending)');
  
  process.exit(1);
}
