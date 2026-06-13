@echo off
setlocal
cd /d "%~dp0"
title CHYK Website Assistant

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install it from https://nodejs.org and run this file again.
  pause
  exit /b 1
)

:menu
cls
echo  ==============================================
echo    CHYK WEBSITE - DAILY UPDATE ASSISTANT
echo  ==============================================
echo.
echo    [1] Open Content Manager   (edit articles, events, images...)
echo    [2] Open VISUAL EDITOR     (click the website to edit it)
echo    [3] Preview the website    (see the site as visitors will)
echo    [4] Check content for errors
echo    [5] Build hosting package  (creates the "dist" folder to upload)
echo    [6] Open the content guide (how-to document)
echo    [7] Exit
echo.
set "choice=1"
set /p choice="   Press a number then Enter (just Enter = 1): "

if "%choice%"=="1" goto manager
if "%choice%"=="2" goto visual
if "%choice%"=="3" goto preview
if "%choice%"=="4" goto check
if "%choice%"=="5" goto dist
if "%choice%"=="6" goto guide
if "%choice%"=="7" exit /b 0
goto menu

:visual
call :startserver
start "" "http://127.0.0.1:4173/visual-editor/?fresh=1"
echo.
echo    Visual Editor opened. Click any text, image or card to edit it.
echo.
pause
goto menu

:startserver
rem Start the local server only if it is not already running
powershell -NoProfile -Command "try { (Invoke-WebRequest -UseBasicParsing -TimeoutSec 1 'http://127.0.0.1:4173/content-manager/' ) | Out-Null; exit 0 } catch { exit 1 }" >nul 2>nul
if errorlevel 1 (
  start "CHYK Content Manager Server" /min node "%~dp0content-manager\server.js"
  timeout /t 2 /nobreak >nul
)
exit /b 0

:manager
call :startserver
start "" "http://127.0.0.1:4173/content-manager/"
echo.
echo    Content Manager opened in your browser.
echo    Every change is saved with an automatic backup (content-manager\backups).
echo.
pause
goto menu

:preview
call :startserver
start "" "http://127.0.0.1:4173/index.html"
echo.
echo    Website preview opened in your browser.
echo    Tip: press Ctrl+F5 in the browser to see your newest changes.
echo.
pause
goto menu

:check
node "%~dp0tools\check-content.js"
pause
goto menu

:dist
echo.
echo    Building the hosting package (this can take a minute)...
node "%~dp0tools\make-dist.js"
if not errorlevel 1 start "" explorer "%~dp0dist"
echo.
echo    Upload the CONTENTS of the "dist" folder to your web host.
echo.
pause
goto menu

:guide
start "" "%~dp0CONTENT-GUIDE.md"
goto menu
