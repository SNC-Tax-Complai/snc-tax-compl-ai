@echo off
title SNC-TAX Backend Server
color 0A
echo ========================================
echo   SNC-TAX Compl-Ai  -  Backend Server
echo ========================================
echo.

set PATH=C:\Users\yello\nodejs;%PATH%
cd /d "C:\Users\yello\Documents\Claude\Projects\SNC-TAX Compl-Ai™\snc-tax-backend"

echo Starting backend on http://localhost:5000 ...
echo Press Ctrl+C to stop.
echo.

node src/server.js

pause
