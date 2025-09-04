#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting build process..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf out

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🔨 Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"
echo "📁 Build output location: .next/standalone/"

# List the standalone directory contents
echo "📋 Standalone directory contents:"
ls -la .next/standalone/ || echo "No standalone directory found"

echo "🎉 Build process completed!" 