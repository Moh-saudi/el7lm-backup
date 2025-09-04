#!/bin/bash

# Script للبناء والاختبار المحلي
# يستخدم للتحقق من أن التطبيق يعمل قبل النشر

set -e

echo "🚀 Starting build and test process..."

# التحقق من وجود الملفات المطلوبة
echo "📁 Checking required files..."
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found"
    exit 1
fi

if [ ! -f "next.config.js" ]; then
    echo "❌ next.config.js not found"
    exit 1
fi

if [ ! -f "Dockerfile" ]; then
    echo "❌ Dockerfile not found"
    exit 1
fi

echo "✅ Required files found"

# تنظيف البناء السابق
echo "🧹 Cleaning previous build..."
rm -rf .next
rm -rf out
rm -rf dist

# تثبيت التبعيات
echo "📦 Installing dependencies..."
npm ci

# التحقق من البيئة
echo "🔍 Checking environment..."
node scripts/check-environment-production.js

# بناء التطبيق
echo "🔨 Building application..."
npm run build

# التحقق من وجود ملفات البناء
echo "📋 Checking build output..."
if [ -d ".next/standalone" ]; then
    echo "✅ Standalone build created"
    ls -la .next/standalone/
else
    echo "❌ Standalone build not found"
    exit 1
fi

# اختبار Firebase محلياً
echo "🧪 Testing Firebase connection..."
node scripts/test-firebase-local.js

# بناء Docker image محلياً
echo "🐳 Building Docker image..."
docker build -t el7lm-test .

# اختبار Docker container
echo "🧪 Testing Docker container..."
docker run --rm -d --name el7lm-test-container -p 3001:3000 \
    -e NODE_ENV=production \
    -e FIREBASE_PROJECT_ID="$FIREBASE_PROJECT_ID" \
    -e FIREBASE_PRIVATE_KEY="$FIREBASE_PRIVATE_KEY" \
    -e FIREBASE_CLIENT_EMAIL="$FIREBASE_CLIENT_EMAIL" \
    el7lm-test

# انتظار بدء التطبيق
echo "⏳ Waiting for application to start..."
sleep 10

# اختبار الاتصال
echo "🌐 Testing application connection..."
if curl -f http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ Application is responding"
else
    echo "❌ Application is not responding"
    docker logs el7lm-test-container
    docker stop el7lm-test-container
    exit 1
fi

# اختبار Firebase status endpoint
echo "🔥 Testing Firebase status endpoint..."
if curl -f http://localhost:3001/api/firebase-status > /dev/null 2>&1; then
    echo "✅ Firebase status endpoint is working"
else
    echo "⚠️  Firebase status endpoint not responding"
fi

# إيقاف container
echo "🛑 Stopping test container..."
docker stop el7lm-test-container

echo "✨ Build and test completed successfully!"
echo "🎉 Ready for deployment to Coolify" 