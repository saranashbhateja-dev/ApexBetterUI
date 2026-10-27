@echo off
setlocal EnableExtensions
cd /d "%~dp0"
set "PORT=8765"
set "BUILD_ID=2026-10-24-ui-fix"
set "APP_URL=http://127.0.0.1:%PORT%/index.html"

rem Do not silently reuse a server from an older extracted folder.
powershell -NoProfile -ExecutionPolicy Bypass -Command "if (Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>nul
if %errorlevel%==0 goto check_existing

goto start_server

:check_existing
set "RUNNING_BUILD="
for /f "usebackq delims=" %%B in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "$v = try { (Invoke-RestMethod -Uri 'http://127.0.0.1:%PORT%/__apex_version' -TimeoutSec 2).build } catch { '' }; Write-Output $v"`) do set "RUNNING_BUILD=%%B"
if "%RUNNING_BUILD%"=="%BUILD_ID%" goto launch_existing

echo.
echo ERROR: Port %PORT% is already in use by an older Apex OS copy or another server.
echo The launcher stopped so it would not accidentally open the wrong app version.
echo.
echo Close the earlier Apex OS Local Server window, then run this BAT file again.
echo Your browser data is not changed by this message. Do not clear browser site data.
echo.
pause
exit /b 2

:launch_existing
start "" "%APP_URL%"
echo Apex OS %BUILD_ID% is already running. Opened the current app.
endlocal
exit /b 0

:start_server
where node >nul 2>nul
if %errorlevel%==0 goto node_server
where py >nul 2>nul
if %errorlevel%==0 goto python_launcher
where python >nul 2>nul
if %errorlevel%==0 goto python_plain
 echo Apex OS needs Node.js or Python to launch locally.
 echo Install Python 3 or Node.js, then double-click this file again.
 pause
 exit /b 1

:node_server
start "Apex OS Local Server" /min cmd /c "cd /d ""%~dp0"" && set PORT=%PORT% && node server.cjs"
goto launch

:python_launcher
start "Apex OS Local Server" /min cmd /c "cd /d ""%~dp0"" && set PORT=%PORT% && py -3 server.py"
goto launch

:python_plain
start "Apex OS Local Server" /min cmd /c "cd /d ""%~dp0"" && set PORT=%PORT% && python server.py"

:launch
timeout /t 2 /nobreak >nul
start "" "%APP_URL%"
echo Apex OS is opening in your browser.
echo Build: %BUILD_ID%
echo Keep the local server window open while using the PC app.
endlocal
