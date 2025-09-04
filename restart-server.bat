@echo off
echo "=== Stopping all Node.js processes ==="
taskkill /f /im node.exe >nul 2>&1

echo "=== Waiting for processes to stop ==="
timeout /t 3 /nobreak >nul

echo "=== Cleaning .next folder ==="
if exist ".next" rmdir /s /q ".next"

echo "=== Starting development server ==="
npm run dev 