@echo off
echo ========================================
echo Git Push Script for GenZ Chat
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Initializing Git...
git init
echo.

echo Step 2: Adding all files...
git add .
echo.

echo Step 3: Creating first commit...
git commit -m "first commit"
echo.

echo Step 4: Renaming branch to main...
git branch -M main
echo.

echo Step 5: Adding remote origin...
git remote add origin https://github.com/shafeeq-3/chat-app.git
echo.

echo Step 6: Pushing to GitHub...
git push -u origin main
echo.

echo ========================================
echo Done! Check the output above for any errors.
echo ========================================
pause
