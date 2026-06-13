@echo off
setlocal
cd /d "%~dp0"
title CHYK Visual Editor

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install it from https://nodejs.org and run this file again.
  pause
  exit /b 1
)

rem Start the local server only if it is not already running
powershell -NoProfile -Command "try { (Invoke-WebRequest -UseBasicParsing -TimeoutSec 1 'http://127.0.0.1:4173/content-manager/' ) | Out-Null; exit 0 } catch { exit 1 }" >nul 2>nul
if errorlevel 1 (
  start "CHYK Content Manager Server" /min node "%~dp0content-manager\server.js"
  timeout /t 2 /nobreak >nul
)

start "" "http://127.0.0.1:4173/visual-editor/?fresh=1"
echo.
echo  CHYK Visual Editor opened in your browser.
echo  - Password to unlock: jaigurudev
echo  - Click any text, image or card in the preview to edit it
echo  - Ctrl+S saves the current page (a backup is made first)
echo  - Use "Package" in the top bar when you are ready to publish
echo.
timeout /t 6 >nul
endlocal
