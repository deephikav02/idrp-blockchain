@echo off
echo ╔══════════════════════════════════════════╗
echo ║       IDRP Blockchain Application        ║
echo ║          Auto-Run Script by AI           ║
echo ╚══════════════════════════════════════════╝
echo.
echo Starting the application servers...
echo.

echo [1/2] Starting Backend Node.js Server (Port 3001)
start "IDRP Backend Server" cmd /k "npm run server"

echo [2/2] Starting Frontend React UI (Vite)
start "IDRP Frontend Server" cmd /k "npm run dev"

echo.
echo Done! Two new terminal windows have been opened.
echo Wait a few seconds for the frontend to build, then open your browser to:
echo http://localhost:5173
echo (Or whichever port Vite assigns, like 5174 or 5175)
echo.
pause
