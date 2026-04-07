@echo off
cd /d "%~dp0"
echo Installing dependencies...
npm install
echo.
echo Starting server on port 3001...
npm start
echo.
echo Press any key to exit...
pause >nul

