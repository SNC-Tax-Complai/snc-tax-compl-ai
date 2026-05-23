@echo off
title SNC-TAX - Build Frontend
color 0A
echo ========================================
echo   SNC-TAX - Build Frontend
echo ========================================
echo.

set node_path=C:\Program Files\nodejs
set PATH=%node_path%;%PATH%

cd /d "%~dp0snc-tax-frontend"

echo [1/2] Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
  echo ERROR: npm install failed
  pause
  exit /b 1
)

echo.
echo [2/2] Building frontend for production...
call npm run build
if %errorlevel% neq 0 (
  echo ERROR: Build failed
  pause
  exit /b 1
)

echo.
echo ========================================
echo   Frontend built successfully!
echo   Output: snc-tax-frontend\dist
echo   Now run START-APP.bat
echo ========================================
echo.
pause
