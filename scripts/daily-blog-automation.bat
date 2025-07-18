@echo off
REM Automated Blog Post Generation Script
REM Run this daily to generate and publish new blog posts

echo Starting automated blog post generation...
echo Timestamp: %date% %time%

REM Navigate to your blog directory
cd /d D:\ai-blog-website

REM Check if Ollama is running
curl -s http://localhost:11434/api/version > nul
if %errorlevel% neq 0 (
    echo Ollama is not running. Starting Ollama...
    start /B ollama serve
    timeout /t 10 /nobreak > nul
)

REM Generate blog post using local model
echo Generating blog post...
node scripts/automated-blog-generator.js

REM Log the result
if %errorlevel% equ 0 (
    echo SUCCESS: Blog post generated and pushed at %date% %time% >> logs\automation.log
) else (
    echo ERROR: Failed to generate blog post at %date% %time% >> logs\automation.log
)

echo Done!
pause
