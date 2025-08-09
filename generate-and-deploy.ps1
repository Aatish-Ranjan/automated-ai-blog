#!/usr/bin/env pwsh
# Generate AI blog post and deploy to GitHub

# Set Ollama models directory to D drive
$env:OLLAMA_MODELS = "D:\ollama-models"
Write-Host "Set OLLAMA_MODELS to: $env:OLLAMA_MODELS" -ForegroundColor Blue

Write-Host "Generating AI blog post..." -ForegroundColor Cyan
npm run generate-post-local

# Check if the command succeeded or if blog post was generated
$blogPostGenerated = Get-ChildItem "src\content" -Name "*$(Get-Date -Format 'yyyy-MM-dd')*" -ErrorAction SilentlyContinue

if ($blogPostGenerated) {
    Write-Host "Blog post generated successfully: $blogPostGenerated" -ForegroundColor Green
    
    Write-Host "Committing changes..." -ForegroundColor Yellow
    git add .
    git commit -m "Add new AI-generated blog post - $(Get-Date -Format 'yyyy-MM-dd')"
    
    Write-Host "Pushing to GitHub (will trigger deployment)..." -ForegroundColor Magenta
    git push origin main
    
    Write-Host "Done! Your blog post will be live shortly on GitHub Pages." -ForegroundColor Green
    Write-Host "Check deployment status at: https://github.com/Aatish-Ranjan/automated-ai-blog/actions" -ForegroundColor Blue
} else {
    Write-Host "No blog post was generated today!" -ForegroundColor Red
}
