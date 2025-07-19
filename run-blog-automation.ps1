# PowerShell script to run blog automation
# Usage: .\run-blog-automation.ps1

Write-Host "🚀 Starting Automated Blog Generation..." -ForegroundColor Green

# Change to the blog directory
Set-Location "d:\ai-blog-website"

# Run the automation script
try {
    node scripts/automated-blog-generator.js
    Write-Host "✅ Blog generation completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error during blog generation: $_" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Automation complete! New content pushed to GitHub." -ForegroundColor Cyan
