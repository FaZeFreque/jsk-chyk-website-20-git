@echo off
setlocal
cd /d "%~dp0"
title CHYK - Build Hosting Package

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install it from https://nodejs.org and run this file again.
  pause
  exit /b 1
)

echo Building the hosting package...
node "%~dp0tools\make-dist.js"
if not errorlevel 1 start "" explorer "%~dp0dist"
echo.
echo Upload the CONTENTS of the "dist" folder to your web host.
pause
