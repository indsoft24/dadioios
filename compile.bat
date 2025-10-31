
@echo off

npm cache clean --force && ^
npm i --legacy-peer-deps && ^
npm config set legacy-peer-deps true && ^
npm i && ^
cls && ^
npm run clean && ^
cls && ^
npm run apk

pause
