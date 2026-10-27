@echo off
setlocal
cd /d "%~dp0"
if not exist node_modules (
  echo Installing Apex OS Android wrapper dependencies...
  call npm install
  if errorlevel 1 exit /b 1
)
if not exist www mkdir www
copy /Y index.html www\index.html >nul
copy /Y styles.css www\styles.css >nul
copy /Y app.js www\app.js >nul
copy /Y sync-client.js www\sync-client.js >nul
copy /Y supabase-config.js www\supabase-config.js >nul
copy /Y source-project-details.js www\source-project-details.js >nul
copy /Y university-admissions-source-data.js www\university-admissions-source-data.js >nul
copy /Y manifest.webmanifest www\manifest.webmanifest >nul
echo Preparing Android project...
if not exist android (
  call npx cap add android
  if errorlevel 1 exit /b 1
)
call npx cap sync android
if errorlevel 1 exit /b 1
cd android
call gradlew.bat assembleDebug
if errorlevel 1 exit /b 1
cd ..
echo.
echo APK created at:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.
pause
endlocal
