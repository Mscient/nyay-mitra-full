@echo off
:: ============================================================
:: MySQL Password Reset Script (Requires Admin)
:: ============================================================

:: 1. Request Admin Privileges automatically
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo Requesting administrative privileges to restart MySQL service...
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    exit /B
)
if exist "%temp%\getadmin.vbs" ( del "%temp%\getadmin.vbs" )
CD /D "%~dp0"

echo ============================================================
echo   RESETTING MYSQL ROOT PASSWORD TO: prash1234
echo ============================================================
echo.

echo [1/4] Stopping MySQL80 Service...
net stop MySQL80
if %ERRORLEVEL% NEQ 0 (
    echo Notice: Service might already be stopped. Proceeding...
)

echo [2/4] Preparing reset file...
echo ALTER USER 'root'@'localhost' IDENTIFIED BY 'prash1234'; > "C:\mysql-reset.txt"

echo [3/4] Running mysqld with reset file...
start "Resetting MySQL" /MIN "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --defaults-file="C:\ProgramData\MySQL\MySQL Server 8.0\my.ini" --init-file="C:\mysql-reset.txt"

echo Waiting 15 seconds for the password update to complete...
timeout /T 15 /NOBREAK > nul

echo [4/4] Cleaning up and restarting service...
taskkill /F /IM mysqld.exe > nul
del "C:\mysql-reset.txt"
net start MySQL80

echo.
echo ============================================================
echo DONE! Your local MySQL root password is now: prash1234
echo.
echo Now creating the Nyay Mitra database automatically...
echo ============================================================
call setup-db.bat prash1234

pause
