@echo off
title SNC-TAX - Stop All Services
color 0C
echo ========================================
echo   SNC-TAX Compl-Ai  -  STOP ALL
echo ========================================
echo.

set PATH=C:\Users\yello\nodejs;%PATH%

echo Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo Stopping ngrok...
taskkill /F /IM ngrok.exe >nul 2>&1

echo.
echo All services stopped.
pause
