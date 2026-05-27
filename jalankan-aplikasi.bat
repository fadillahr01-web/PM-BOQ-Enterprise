@echo off
title PM-BOQ Enterprise Launcher
color 0B
echo =======================================================================
echo                 PM-BOQ ENTERPRISE - AUTOMATIC LAUNCHER
echo =======================================================================
echo.
echo  Penyedia Sistem: Antigravity AI
echo  OS Terdeteksi: Windows
echo.
echo  Batch script ini akan membuka 2 terminal baru untuk menjalankan:
echo  1. Server Backend (Express API) - Port 5000
echo  2. Server Frontend (Next.js Web App) - Port 3000
echo.
echo =======================================================================
echo.

echo [1/2] Membuka server Backend di terminal baru...
start "PM-BOQ Backend Server" cmd /k "if exist ^"%~dp0Backend^" (
  cd /d ^"%~dp0Backend^" && echo Menginstal dependensi Backend (jika ada)... && npm install && echo Memulai server Backend... && npm run dev
) else (
  echo ERROR: Folder Backend tidak ditemukan di "%~dp0Backend"
  pause
)"

echo.
echo [2/2] Membuka server Frontend di terminal baru...
start "PM-BOQ Frontend Server" cmd /k "if exist ^"%~dp0Frontend^" (
  cd /d ^"%~dp0Frontend^" && echo Menginstal dependensi Frontend (jika ada)... && npm install && echo Memulai server Frontend... && npm run dev
) else (
  echo ERROR: Folder Frontend tidak ditemukan di "%~dp0Frontend"
  pause
)"

echo.
echo =======================================================================
echo  BERHASIL DIJALANKAN!
echo  ---------------------------------------------------------------------
echo  - Frontend Web App : http://localhost:3000
echo  - Backend API Gateway: http://localhost:5000
echo.
echo  Silakan tunggu beberapa detik hingga server terkompilasi,
echo  lalu buka browser Anda dan navigasikan ke: http://localhost:3000
echo =======================================================================
echo.
pause
