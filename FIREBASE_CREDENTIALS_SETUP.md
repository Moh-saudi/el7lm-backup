# 🔥 Firebase Credentials Setup Guide

## 🚨 URGENT: Your Firebase configuration is using placeholder values!

The error you're seeing is because your `.env.local` file contains placeholder values instead of real Firebase credentials.

## 📋 Step-by-Step Solution

### Step 1: Get Your Firebase Credentials

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project** (or create a new one if you don't have one)
3. **Go to Project Settings**:
   - Click the gear icon ⚙️ next to "Project Overview"
   - Select "Project settings"

### Step 2: Get Web App Configuration

1. **In Project Settings, go to "General" tab**
2. **Scroll down to "Your apps" section**
3. **If you don't have a web app, click "Add app" and select the web icon `</>`**
4. **Register your app** with a name like "el7lm25-web"
5. **Copy the configuration object** that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC-example-key-here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

### Step 3: Update Your .env.local File

Replace the placeholder values in your `.env.local` file with the real values from your Firebase config:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC-example-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Step 4: Optional - Firebase Admin SDK (for server-side operations)

If you need server-side Firebase operations:

1. **In Project Settings, go to "Service accounts" tab**
2. **Click "Generate new private key"**
3. **Download the JSON file**
4. **Extract the values and add them to .env.local**:

```env
# Firebase Admin SDK
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour actual private key here\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PROJECT_ID=your-project-id
```

### Step 5: Restart Your Development Server

After updating `.env.local`:

```bash
# Stop your current server (Ctrl+C)
# Then restart it:
npm run dev
# or
yarn dev
```

## 🔍 Verification

After updating the credentials, run this command to verify:

```bash
node scripts/verify-firebase-config.js
```

You should see:
```
✅ All Firebase variables are properly configured!
✅ Firebase configuration is valid
```

## 🚨 Important Notes

1. **Never commit real credentials to Git** - `.env.local` should be in your `.gitignore`
2. **Keep your Firebase credentials secure**
3. **For production, use environment variables on your hosting platform**

## 📞 Need Help?

If you don't have a Firebase project yet:

1. **Create a new project** at https://console.firebase.google.com/
2. **Enable Authentication** (if needed)
3. **Enable Firestore Database** (if needed)
4. **Follow the steps above**

## 🎯 Expected Result

After completing these steps, the error should disappear and your application should load properly without the 500 Internal Server Error. 
