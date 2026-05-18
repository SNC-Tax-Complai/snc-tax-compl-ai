@echo off
title SNC-TAX Compl-Ai - Full Stack Launch
color 0E
echo ========================================
echo   SNC-TAX Compl-Ai  -  FULL LAUNCH
echo ========================================
echo.
echo This will start:
echo   1. PostgreSQL Database
echo   2. Backend Server  (port 5000)
echo   3. ngrok Tunnel    (public URL)
echo.

set PATH=C:\Users\yello\nodejs;%PATH%

echo [1/3] Starting PostgreSQL...
"C:\Users\yello\pgsql\bin\pg_ctl.exe" -D "C:\Users\yello\pgdata" -l "C:\Users\yello\pgdata\postgresql.log" start
timeout /t 3 /nobreak >nul

echo [2/3] Starting Backend Server...
start "SNC-TAX Backend" cmd /c "color 0A && cd /d "C:\Users\yello\Documents\Claude\Projects\SNC-TAX Compl-Ai™\snc-tax-backend" && set PATH=C:\Users\yello\nodejs;%%PATH%% && node src/server.js && pause"

echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak >nul

echo [3/3] Starting ngrok Tunnel...
start "SNC-TAX ngrok" cmd /c "color 0B && C:\Users\yello\ngrok\ngrok.exe http 5000 && pause"

echo.
echo ========================================
echo   All services launched!
echo.
echo   Local:     http://localhost:5000
echo   ngrok:     Check the ngrok window
echo   Inspector: http://localhost:4040
echo ========================================
echo.
echo You can close this window.
timeout /t 10
