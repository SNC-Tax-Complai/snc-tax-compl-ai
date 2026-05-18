@echo off
title SNC-TAX Frontend Build
color 0C
echo ========================================
echo   SNC-TAX Compl-Ai  -  Frontend Build
echo ========================================
echo.

set PATH=C:\Users\yello\nodejs;%PATH%
set VITE_API_URL=/api
cd /d "C:\Users\yello\Documents\Claude\Projects\SNC-TAX Compl-Ai™\snc-tax-frontend"

echo Building frontend for production...
echo (API URL set to /api for same-origin serving)
echo.

node node_modules/vite/bin/vite.js build

echo.
echo ========================================
echo   Build complete!
echo   Restart the backend to serve updates.
echo ========================================

pause
