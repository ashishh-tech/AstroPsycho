@echo off
set PORT=8000
set PROJECT_DIR=%~dp0

cd /d "%PROJECT_DIR%"

echo Checking if server is running on port %PORT%...
netstat -ano | findstr :%PORT% > nul
if %errorlevel% equ 0 (
    echo Server is already running.
) else (
    echo Starting Python server on port %PORT%...
    start /min "Astro Psycho Server" python -m http.server %PORT%
    timeout /t 2 /nobreak > nul
)

echo Opening Astro Psycho...
start http://localhost:%PORT%
exit
