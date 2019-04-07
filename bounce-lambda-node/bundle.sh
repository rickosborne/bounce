#!/usr/bin/env bash

BOUNCE_VERSION=`npm run --silent version`
BOUNCE_ZIP="bounce-lambda-node-${BOUNCE_VERSION}.zip"

# Always start clean
[[ -d dist ]] && rm -rf dist
[[ -f "${BOUNCE_ZIP}" ]] && rm "${BOUNCE_ZIP}"
mkdir -p dist

# Exclude is busted, so just assume this has been done in dev
#node ./node_modules/.bin/tslint -c tslint.json --project tsconfig.json --type-check

# Compile *.ts to dist/*.js
node ./node_modules/.bin/tsc

# We want to `npm install` to get a clean prod node_modules
cp package.json dist/package.json

# `dist` is the root of the packaged zip
pushd dist

# Only include modules needed at runtime
npm install --production

# We do this from within dist to eliminate an extra top-level directory
zip "../${BOUNCE_ZIP}" -r .

# Back ..
popd

# Clean up after
# rm -rf dist

echo "Version: '${BOUNCE_VERSION}'"
echo "Zip: '${BOUNCE_ZIP}'"
