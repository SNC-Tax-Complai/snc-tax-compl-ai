@echo off
title SNC-TAX - First Time Setup
color 0F
echo ========================================
echo   SNC-TAX Compl-Ai - First Time Setup
echo ========================================
echo.
echo Steps:
echo   1. Create database
echo   2. Install backend dependencies
echo   3. Build frontend
echo.
echo NOTE: PostgreSQL must already be installed
echo       and running (via winget or manual install).
echo.
echo PostgreSQL password configured: SncTax2024!
echo (Change DATABASE_PASSWORD in snc-tax-backend\.env
echo  if you used a different password)
echo.
pause

set node_path=C:\Program Files\nodejs
set PATH=%node_path%;%PATH%

echo.
echo [Step 1/3] Creating database...
set PGPASSWORD=SncTax2024!
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE DATABASE snc_tax_db;" 2>&1

echo.
echo [Step 2/3] Installing backend dependencies...
cd /d "%~dp0snc-tax-backend"
call npm install
if %errorlevel% neq 0 ( echo ERROR in backend install & pause & exit /b 1 )

echo.
echo [Step 3/3] Building frontend...
cd /d "%~dp0snc-tax-frontend"
call npm install
if %errorlevel% neq 0 ( echo ERROR in frontend install & pause & exit /b 1 )
call npm run build
if %errorlevel% neq 0 ( echo ERROR in frontend build & pause & exit /b 1 )

echo.
echo ========================================
echo   SETUP COMPLETE!
echo.
echo   Run START-APP.bat to launch
echo ========================================
echo.
pause
