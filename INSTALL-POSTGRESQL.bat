@echo off
:: Request admin elevation
net session >nul 2>&1
if %errorlevel% neq 0 (
  echo Requesting administrator rights...
  powershell -Command "Start-Process '%~f0' -Verb RunAs"
  exit
)

title PostgreSQL 17 - Silent Install
color 0B
echo ========================================
echo   Installing PostgreSQL 17 (Silent)
echo ========================================
echo.
echo Password will be set to: SncTax2024!
echo Port: 5432
echo.

winget install PostgreSQL.PostgreSQL.17 --override "--mode unattended --superpassword SncTax2024! --servicename postgresql-17 --serverport 5432 --datadir C:\PostgreSQL\17\data" --accept-package-agreements --accept-source-agreements

if %errorlevel%==0 (
  echo.
  echo ========================================
  echo   PostgreSQL installed successfully!
  echo   Service: postgresql-17
  echo   Password: SncTax2024!
  echo   Port: 5432
  echo ========================================
) else (
  echo.
  echo ========================================
  echo   Installation issue (code %errorlevel%)
  echo   Try running manually:
  echo   winget install PostgreSQL.PostgreSQL.17
  echo ========================================
)
echo.
pause
