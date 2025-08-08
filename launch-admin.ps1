# AI Blog Admin Portal Launcher
Write-Host "🚀 Starting AI Blog Admin Portal..." -ForegroundColor Green

# Change to project directory
Set-Location "d:\ai-blog-website"

# Check if server is already running
$process = Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*npm*" -or $_.CommandLine -like "*next*" }

if ($process) {
    Write-Host "✅ Server appears to be running already" -ForegroundColor Yellow
} else {
    Write-Host "🔄 Starting development server..." -ForegroundColor Blue
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\ai-blog-website'; npm run dev" -WindowStyle Minimized
    
    # Wait a moment for server to start
    Start-Sleep -Seconds 5
}

# Open admin portal in browser
Write-Host "🌐 Opening admin portal in browser..." -ForegroundColor Green
Start-Process "http://localhost:3001/admin"

Write-Host "✅ Admin portal should be opening in your browser!" -ForegroundColor Green
Write-Host "📍 URL: http://localhost:3001/admin" -ForegroundColor Cyan

# Keep script window open
Read-Host "Press Enter to exit"
