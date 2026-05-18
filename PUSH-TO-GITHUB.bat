@echo off
echo ============================================
echo   SNC-TAX Compl-Ai - Push to GitHub
echo ============================================
echo.
echo This will push your code to GitHub.
echo A login window will appear - sign in with your
echo wernerbotha199-cmyk GitHub account.
echo.
pause

cd /d "%~dp0"
git remote set-url origin https://github.com/wernerbotha199-cmyk/snc-tax-compl-ai.git
git push -u origin master

echo.
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS! Code pushed to GitHub.
    echo https://github.com/wernerbotha199-cmyk/snc-tax-compl-ai
) else (
    echo Push failed. Try running: gh auth login
    echo Then run this script again.
)
echo.
pause
