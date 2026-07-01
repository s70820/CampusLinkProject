@echo off
setlocal
cd /d "%~dp0"
if not exist "src\main\resources\cursor-deploy.properties" (
  echo ERROR: cursor-deploy.properties not found.
  echo.
  echo Manual Task 2: copy src\main\resources\cursor-deploy.properties.example
  echo to cursor-deploy.properties and set your MySQL password first.
  exit /b 1
)
echo Building s70820.war with embedded React frontend...
call mvn clean package -Pwith-frontend -DskipTests
if errorlevel 1 (
  echo Build failed.
  exit /b 1
)
echo.
echo Success: target\s70820.war
echo Upload this file to CURSOR File Manager (home root /) as described in DeployingAppsOnCursor.pdf
endlocal
