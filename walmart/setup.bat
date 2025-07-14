@echo off
echo ========================================
echo Walmart Aisle Report App Setup
echo ========================================
echo.

echo Setting up backend dependencies...
cd backend
npm install
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Set up Google Cloud Vision API credentials
echo 2. Place your credentials file in the backend folder
echo 3. Run: npm start
echo 4. Open index.html in your browser
echo.
pause 