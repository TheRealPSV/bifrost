#!/bin/sh

#copy customization to frontend
cp -rf /customization/* /frontend/src/

#put backend into serve
cp -r /backend/ /serve/

#build frontend with custom files
cd /frontend

#frontend args
echo "VITE_SEARCH_BASE_URL=$VITE_SEARCH_BASE_URL" >> .env.production
echo "VITE_SEARCH_QUERY_PATH=$VITE_SEARCH_QUERY_PATH" >> .env.production
echo "VITE_TITLE_TEXT=$VITE_TITLE_TEXT" >> .env.production
echo "VITE_HEADER_TEXT=$VITE_HEADER_TEXT" >> .env.production

npm i --include=dev #we need the dev dependencies to compile our customizations on run
npm run build

#install backend deps
cd /serve/backend

#backend args
echo "BASE_DOMAIN=$BASE_DOMAIN" >> .env.production
echo "NGINXPM_URL=$NGINXPM_URL" >> .env.production
echo "NGINXPM_USER=$NGINXPM_USER" >> .env.production
echo "NGINXPM_PASS=$NGINXPM_PASS" >> .env.production

npm i

#put frontend build into backend public folder
rm -rf public/
cp -r /frontend/dist ./
mv dist/ public/

#run app
npm run start