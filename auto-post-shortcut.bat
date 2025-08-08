@echo off
cd /d "D:\ai-blog-website"
echo ========================================
echo AI Blog Auto-Post Workflow
echo ========================================
echo.

echo Checking Ollama status...
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I /N "ollama.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] Ollama is running
) else (
    echo [INFO] Ollama is not running. Starting Ollama...
    echo Setting OLLAMA_MODELS to D:\ollama-models
    set OLLAMA_MODELS=D:\ollama-models
    echo Starting Ollama service...
    start /MIN ollama serve
    echo Waiting for Ollama to start...
    timeout /t 5 /nobreak >nul
    echo [OK] Ollama started
)

echo.
echo Checking if ai-blog-writer-1b model is available...
set OLLAMA_MODELS=D:\ollama-models
ollama list | find "ai-blog-writer-1b" >NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] ai-blog-writer-1b model is available
    echo.
    echo Starting AI Blog Auto-Post...
    echo.
    npm run auto-post
) else (
    echo [ERROR] ai-blog-writer-1b model not found!
    echo.
    echo Available models:
    ollama list
    echo.
    echo Please ensure the ai-blog-writer-1b model is properly installed.
    goto :end
)

echo.
echo Workflow completed!
goto :end

:end
echo.
echo Press any key to close...
pause >nul
