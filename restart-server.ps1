Write-Host "=== HAGZZ GO Server Restart Script ===" -ForegroundColor Green

Write-Host "Step 1: Stopping all Node.js processes..." -ForegroundColor Yellow
try {
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✓ Node.js processes stopped" -ForegroundColor Green
} catch {
    Write-Host "⚠ No Node.js processes found or already stopped" -ForegroundColor Yellow
}

Write-Host "Step 2: Waiting for cleanup..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "Step 3: Cleaning .next folder..." -ForegroundColor Yellow
try {
    if (Test-Path ".next") {
        Remove-Item -Recurse -Force ".next"
        Write-Host "✓ .next folder cleaned" -ForegroundColor Green
    } else {
        Write-Host "ℹ .next folder not found" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠ Could not clean .next folder: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Step 4: Starting development server..." -ForegroundColor Yellow
npm run dev 