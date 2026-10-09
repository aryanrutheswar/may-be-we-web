@echo off
title Push MaybeWe to GitHub
echo ========================================================
echo   Pushing MaybeWe updates to GitHub repository...
echo ========================================================
echo.

cd /d "%~dp0"
echo Current directory: %CD%
echo.

echo 1. Checking git status...
git status
echo.

echo 2. Staging all changed files...
git add .
git status -s
echo.

echo 3. Committing updates...
git commit -m "feat: Darkroom Lenis smooth scroll recreation, editorial design, and fix destination card imagery"
echo.

echo 4. Pushing to origin main...
git push origin main
echo.

echo ========================================================
echo   Finished!
echo ========================================================
pause
