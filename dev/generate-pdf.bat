@echo off
set NODE_PATH=c:\Users\name\Desktop\PROJECTS\ASTRO PSYCO\node_modules
for /f "delims=" %%i in ('dir /s /b "c:\Users\name\Desktop\PROJECTS\ASTRO PSYCO\chrome\chrome.exe"') do set PUPPETEER_EXECUTABLE_PATH=%%i
echo Using Chrome at %PUPPETEER_EXECUTABLE_PATH%
node export-pdf.js
node check-pages.js
