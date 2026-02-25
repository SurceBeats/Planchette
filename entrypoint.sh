#!/bin/sh
set -e

echo "Cleaning /app except planchette.ini, ./ssl, and ./__planchette_model__..."
find /app -mindepth 1 ! -name 'planchette.ini' ! -path '/app/ssl' ! -path '/app/ssl/*' ! -path '/app/__planchette_model__' ! -path '/app/__planchette_model__/*' -exec rm -rf {} +

echo "Copying fresh contents from /app_defaults..."
cp -r /app_defaults/* /app/

echo "Ensuring __planchette_model__ directory exists with proper permissions..."
mkdir -p /app/__planchette_model__
chown -R $(id -u):$(id -g) /app/__planchette_model__

find /app -mindepth 1 ! -path '/app/ssl' ! -path '/app/ssl/*' ! -path '/app/__planchette_model__' ! -path '/app/__planchette_model__/*' -exec chown $(id -u):$(id -g) {} +

exec "$@"
