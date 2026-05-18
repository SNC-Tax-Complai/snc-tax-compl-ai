@echo off
title SNC-TAX ngrok Public Tunnel
color 0B
echo ========================================
echo   SNC-TAX Compl-Ai  -  ngrok Tunnel
echo ========================================
echo.

set PATH=C:\Users\yello\nodejs;%PATH%

echo Waiting 3 seconds for backend to be ready...
timeout /t 3 /nobreak >nul

echo Starting ngrok tunnel on port 5000...
echo Share the https:// URL shown below with anyone.
echo.
echo ngrok Inspector: http://localhost:4040
echo.

C:\Users\yello\ngrok\ngrok.exe http 5000

pause
