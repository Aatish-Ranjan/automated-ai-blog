@echo off
REM Set Ollama models directory to D drive permanently
echo Setting OLLAMA_MODELS environment variable to D:\ollama-models...
setx OLLAMA_MODELS "D:\ollama-models"
echo.
echo OLLAMA_MODELS environment variable has been set to D:\ollama-models
echo This will take effect in new command prompt sessions.
echo.
echo Current session environment variable:
set OLLAMA_MODELS=D:\ollama-models
echo OLLAMA_MODELS=%OLLAMA_MODELS%
echo.
pause
