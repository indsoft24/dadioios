
@echo off

echo deleting node modules
rd /s /q node_modules

echo delete package-lock.json
del package-lock.json
npm cache clean --force && ^
npm i --legacy-peer-deps && ^
npm config set legacy-peer-deps true && ^
npm i && ^
npm run clean && ^
npm run apk

pause