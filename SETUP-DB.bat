@echo off
title SNC-TAX - Database Setup
color 0B
echo ========================================
echo   SNC-TAX - Create Database
echo ========================================
echo.
echo This creates the PostgreSQL database.
echo Migrations run automatically when the server starts.
echo.

set PGPATH=C:\Program Files\PostgreSQL\17\bin
set PGPASSWORD=SncTax2024!

echo Creating database snc_tax_db...
"%PGPATH%\psql.exe" -U postgres -c "CREATE DATABASE snc_tax_db;" 2>&1
if %errorlevel%==0 (
  echo.
  echo SUCCESS: Database snc_tax_db created.
) else (
  echo.
  echo NOTE: Database may already exist - that is OK.
)

echo.
echo ========================================
echo   Done! Now run START-APP.bat
echo ========================================
echo.
pause
