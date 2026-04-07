


start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 5 /nobreak >nul
echo.
echo Starting Frontend Server on port 3000...
start "Frontend Server" cmd /k "cd frontend && npm start"
echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
