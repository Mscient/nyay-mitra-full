@echo off
REM ============================================================
REM  Nyay Mitra — One-click Database Setup Script
REM  Run this ONCE to create the DB and push all tables.
REM  Usage: setup-db.bat YOUR_MYSQL_PASSWORD
REM ============================================================

IF "%1"=="" (
  echo ERROR: Please provide your MySQL root password.
  echo Usage: setup-db.bat YOUR_PASSWORD
  exit /b 1
)

SET MYSQL_PWD=%1
SET MYSQL_EXE=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe
SET DB_NAME=nyay_mitra

echo.
echo [1/4] Creating database '%DB_NAME%'...
"%MYSQL_EXE%" -u root "-p%MYSQL_PWD%" -e "CREATE DATABASE IF NOT EXISTS %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
IF %ERRORLEVEL% NEQ 0 (
  echo ERROR: Failed to connect to MySQL. Check your password.
  exit /b 1
)
echo    Done.

echo.
echo [2/4] Updating .env files with your password...
powershell -Command "(Get-Content '.env') -replace 'YOUR_PASSWORD', '%MYSQL_PWD%' | Set-Content '.env'"
powershell -Command "(Get-Content 'apps\identity-svc\.env') -replace 'YOUR_PASSWORD', '%MYSQL_PWD%' | Set-Content 'apps\identity-svc\.env'"
powershell -Command "(Get-Content 'apps\workspace-svc\.env') -replace 'YOUR_PASSWORD', '%MYSQL_PWD%' | Set-Content 'apps\workspace-svc\.env'"
powershell -Command "(Get-Content 'apps\docgen-svc\.env') -replace 'YOUR_PASSWORD', '%MYSQL_PWD%' | Set-Content 'apps\docgen-svc\.env'"
echo    Done.

echo.
echo [3/4] Installing dependencies...
call npm install
echo    Done.

echo.
echo [4/4] Pushing schema to MySQL (creating all tables)...
cd packages\database
SET DATABASE_URL=mysql://root:%MYSQL_PWD%@localhost:3306/%DB_NAME%
call npx drizzle-kit push:mysql --config=drizzle.config.ts
cd ..\..
echo    Done.

echo.
echo ============================================================
echo  SUCCESS! Database setup complete.
echo  All tables created in '%DB_NAME%'.
echo.  
echo  Now start the services:
echo    npm run dev
echo ============================================================
