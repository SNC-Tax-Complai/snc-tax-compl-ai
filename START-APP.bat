@echo off
title SNC-TAX Compl-Ai - Launch
color 0E
echo ========================================
echo   SNC-TAX Compl-Ai - LAUNCH
echo ========================================
echo.

set node_path=C:\Program Files\nodejs
set ngrok_path=%LOCALAPPDATA%\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe
set APP_DIR=%~dp0
set PATH=%node_path%;%ngrok_path%;%PATH%

:: Ensure logs directory exists
if not exist "%APP_DIR%snc-tax-backend\logs" mkdir "%APP_DIR%snc-tax-backend\logs"

:: Check that frontend is built
if not exist "%APP_DIR%snc-tax-frontend\dist\index.html" (
  echo WARNING: Frontend not built yet. Running BUILD-APP.bat first...
  echo.
  call "%APP_DIR%BUILD-APP.bat"
)

echo [1/2] Starting backend server on port 5000...
start "SNC-TAX Backend" cmd /k "color 0A && title SNC-TAX Backend && cd /d "%APP_DIR%snc-tax-backend" && set PATH=C:\Program Files\nodejs;%%PATH%% && node src/server.js"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo [2/2] Starting ngrok tunnel (permanent domain)...
start "SNC-TAX Public URL" cmd /k "color 0B && title SNC-TAX ngrok && "%ngrok_path%\ngrok.exe" http 5000 --domain=purist-snowcap-spoken.ngrok-free.dev"

echo.
echo ========================================
echo   All services launched!
echo.
echo   LOCAL:   http://localhost:5000
echo   PUBLIC:  https://purist-snowcap-spoken.ngrok-free.dev
echo   DASHBOARD: http://localhost:4040
echo ========================================
echo.
pause
