@echo off
title SNC-TAX - Setup ngrok
color 0B
echo ========================================
echo   SNC-TAX - Configure ngrok Tunnel
echo ========================================
echo.
echo ngrok makes your app publicly accessible.
echo.
echo STEP 1: Get your free authtoken
echo   1. Go to: https://dashboard.ngrok.com/signup
echo   2. Sign up (free)
echo   3. Copy your authtoken from:
echo      https://dashboard.ngrok.com/get-started/your-authtoken
echo.
set /p NGROK_TOKEN="STEP 2: Paste your authtoken here: "
echo.

set ngrok_path=%LOCALAPPDATA%\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe
"%ngrok_path%\ngrok.exe" config add-authtoken %NGROK_TOKEN%

echo.
if %errorlevel%==0 (
  echo SUCCESS: ngrok configured!
  echo You can now run START-APP.bat
) else (
  echo ERROR: Failed to configure ngrok.
  echo Make sure the token is correct.
)
echo.
pause
