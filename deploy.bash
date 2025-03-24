#!/bin/bash

# Build the client
cd client
npm i
npm run build

# Copy over to web root + restart the nginx service
cp -r dist/ /var/www/
service nginx restart
