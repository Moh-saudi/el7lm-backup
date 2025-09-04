#!/bin/bash

# Quick Deploy Script for El7lm Application
# This script helps prepare and deploy the application

set -e

echo "🚀 El7lm Quick Deploy Script"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Starting deployment preparation..."

# Clean previous builds
print_status "Cleaning previous builds..."
npm run clean

# Install dependencies
print_status "Installing dependencies..."
npm ci

# Build the application
print_status "Building the application..."
npm run build

# Check if build was successful
if [ ! -f ".next/standalone/server.js" ]; then
    print_error "Build failed! server.js not found in .next/standalone/"
    print_error "Please check the build logs above."
    exit 1
fi

print_status "Build completed successfully!"

# Show build info
echo ""
echo "📋 Build Information:"
echo "   - Standalone server: .next/standalone/server.js"
echo "   - Static files: .next/static/"
echo "   - Public files: public/"

# Check file sizes
echo ""
echo "📊 File Sizes:"
ls -lh .next/standalone/server.js
du -sh .next/standalone/

# Test local build (optional)
read -p "🤔 Do you want to test the build locally? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Testing local build..."
    timeout 10s npm run start || print_warning "Local test timed out (this is normal)"
fi

echo ""
print_status "Deployment preparation completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Commit your changes:"
echo "   git add ."
echo "   git commit -m 'Fix deployment: standalone mode and proper Dockerfile'"
echo "   git push origin main"
echo ""
echo "2. In Coolify, ensure:"
echo "   - Build Command: npm run build"
echo "   - Start Command: node server.js"
echo "   - Health Check Path: /"
echo "   - Environment variables are set"
echo ""
echo "3. Deploy in Coolify"
echo ""
echo "📖 For detailed instructions, see: README-DEPLOYMENT.md"
echo "📋 For checklist, see: deploy-checklist.md" 