@echo off
echo ========================================
echo Deploying Backend to Vercel
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Adding changes...
git add .
echo.

echo Step 2: Committing...
git commit -m "Fix Vercel 404 error - Add proper entry points"
echo.

echo Step 3: Pushing to GitHub...
git push origin main
echo.

echo ========================================
echo Done! 
echo.
echo Now go to Vercel Dashboard and:
echo 1. Go to your project settings
echo 2. Redeploy the latest deployment
echo.
echo Or Vercel will auto-deploy from GitHub
echo ========================================
pause
