@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1 || (echo Node.js is missing. Install Node.js 22 LTS from https://nodejs.org && pause && exit /b 1)
where npm >nul 2>&1 || (echo npm is missing. Repair Node.js installation. && pause && exit /b 1)
if not exist node_modules\ (echo Installing dependencies... && call npm install --no-audit --no-fund || (pause && exit /b 1))
echo Starting the McIver College Logo Experience Lab...
call npm run dev -- --open
pause
