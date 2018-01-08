#!/bin/sh
export AADClientId="b4fc7877-2b9e-4002-9354-926edc44b5f7"
export AADClientSecret="HkzxHHWg9yTuSuYg8fA1Siv8SsZQAc24lQWXQR9ec4Y="
cd server
node_modules/.bin/nodemon --config nodemon-unix.json &
gulp build-all &
cd ../AzureFunctions.AngularClient/
node_modules/.bin/ng build -w &
wait
