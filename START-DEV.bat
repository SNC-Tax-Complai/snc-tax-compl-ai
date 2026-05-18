@echo off
title SNC-TAX Vite Dev Server
color 0D
echo ========================================
echo   SNC-TAX Compl-Ai  -  Vite Dev Server
echo ========================================
echo.

set PATH=C:\Users\yello\nodejs;%PATH%
cd /d "C:\Users\yello\Documents\Claude\Projects\SNC-TAX Compl-Ai™\snc-tax-frontend"

echo Starting Vite dev server on http://localhost:5173 ...
echo Press Ctrl+C to stop.
echo.

node node_modules/vite/bin/vite.js

pause
