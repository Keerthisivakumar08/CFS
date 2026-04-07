Write-Host "Starting Client Feedback Management System..." -ForegroundColor Green

# Kill anything on port 5000
$proc = netstat -ano | findstr :5000
if ($proc) {
    $procId = ($proc -split '\s+')[-1]
    taskkill /F /PID $procId 2>$null
    Write-Host "Cleared port 5000" -ForegroundColor Yellow
}

# Start Backend
Write-Host "Starting Backend on http://localhost:5000 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm start"

Start-Sleep -Seconds 4

# Start Frontend
Write-Host "Starting Frontend on http://localhost:3000 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm start"

Write-Host "Both servers started! Opening browser in 35 seconds..." -ForegroundColor Green
Start-Sleep -Seconds 35
Start-Process "http://localhost:3000"
