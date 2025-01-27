#!/bin/bash
mkdir -p ./dist/public
APP_API_SERVER_URL=/api npm run build --workspace=web -- --emptyOutDir --outDir=../../dist/public --base=/app
cp -r ./server/lib \
  ./server/certs \
  ./server/db \
  ./server/scripts/run-exec.sh \
  ./server/package.json \
  ./server/.env ./dist/
# Remove seeds and migrations
rm -rf ./dist/server/db/seeds
rm -rf ./dist/server/db/migrations
echo "Running api server build..."
NODE_ENV=production npm install --omit=dev --prefix ./dist

