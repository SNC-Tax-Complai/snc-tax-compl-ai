@echo off
title SNC-TAX - Stop All Services
color 0C
echo ========================================
echo   SNC-TAX - Stopping All Services
echo ========================================
echo.

echo Stopping backend server (node)...
taskkill /F /FI "WINDOWTITLE eq SNC-TAX Backend" /T >nul 2>&1
taskkill /F /IM node.exe /T >nul 2>&1

echo Stopping ngrok...
taskkill /F /FI "WINDOWTITLE eq SNC-TAX Public URL" /T >nul 2>&1
taskkill /F /IM ngrok.exe /T >nul 2>&1

echo.
echo All services stopped.
echo.
pause
