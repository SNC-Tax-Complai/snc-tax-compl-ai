@echo off
cd /d "C:\Users\yello\Documents\Claude\Projects\SNC-TAX Compl-Ai™"
echo Installing npm dependencies...
call npm install
echo.
echo Generating Annexure A document...
call node generate_annexure.js
echo.
echo Process complete. Check the directory for SNC_TAX_Annexure_A_COMPLETE.docx
pause
