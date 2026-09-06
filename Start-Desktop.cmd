@echo off
cd /d "%~dp0"
call npm start -- --no-build
if errorlevel 1 pause
