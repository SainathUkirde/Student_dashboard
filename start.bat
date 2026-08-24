@echo off
echo Starting Student Dashboard...
echo.

REM Start backend in a new window
start "Backend - API Server (port 5000)" cmd /k "cd /d "%~dp0backend" && npm run dev"

REM Wait 2 seconds then start frontend
timeout /t 2 /nobreak >nul

REM Start frontend in a new window
start "Frontend - Vite Dev Server (port 5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Both servers are starting in separate windows.
echo Open http://localhost:5173 in your browser.
echo.
pause
