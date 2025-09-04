@echo off
echo 🚀 El7lm Quick Deploy Script for Windows
echo ==========================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

echo ✅ Starting deployment preparation...

REM Clean previous builds
echo 🧹 Cleaning previous builds...
call npm run clean

REM Install dependencies
echo 📦 Installing dependencies...
call npm ci

REM Build the application
echo 🔨 Building the application...
call npm run build

REM Check if build was successful
if not exist ".next\standalone\server.js" (
    echo ❌ Build failed! server.js not found in .next/standalone/
    echo ❌ Please check the build logs above.
    pause
    exit /b 1
)

echo ✅ Build completed successfully!

echo.
echo 📋 Build Information:
echo    - Standalone server: .next/standalone/server.js
echo    - Static files: .next/static/
echo    - Public files: public/

echo.
echo 📊 File Sizes:
dir .next\standalone\server.js
dir .next\standalone

echo.
echo ✅ Deployment preparation completed!
echo.
echo 📋 Next Steps:
echo 1. Commit your changes:
echo    git add .
echo    git commit -m "Fix deployment: standalone mode and proper Dockerfile"
echo    git push origin main
echo.
echo 2. In Coolify, ensure:
echo    - Build Command: npm run build
echo    - Start Command: node server.js
echo    - Health Check Path: /
echo    - Environment variables are set
echo.
echo 3. Deploy in Coolify
echo.
echo 📖 For detailed instructions, see: README-DEPLOYMENT.md
echo 📋 For checklist, see: deploy-checklist.md

pause 