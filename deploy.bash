#!/bin/bash

# Build the client
cd client
npm i
npm run build

# Copy over to web root + restart the nginx service
rm -rf /var/www/dist/
cp -r dist/ /var/www/
service nginx restart

# Build the server
cd ../server
npm run build

# Copy over the server source
cd ../
rm -rf /var/server/
cp -r server/ /var/

# Restart the server process
cd /var/server
pm2 start avalon
