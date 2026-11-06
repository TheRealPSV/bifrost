#!/bin/sh

set -e

FRONTEND_DIR="${FRONTEND_DIR:-/frontend}"
FRONTEND_SRC="${FRONTEND_SRC:-$FRONTEND_DIR/src}"
FRONTEND_SRC_PRISTINE="${FRONTEND_SRC_PRISTINE:-$FRONTEND_DIR/src.pristine}"
CUSTOMIZATION_DIR="${CUSTOMIZATION_DIR:-/customization}"
BACKEND_DIR="${BACKEND_DIR:-/serve/backend}"
WATCH_CUSTOMIZATION="${WATCH_CUSTOMIZATION:-true}"

export FRONTEND_DIR FRONTEND_SRC FRONTEND_SRC_PRISTINE CUSTOMIZATION_DIR BACKEND_DIR

# Keep an untouched copy of the image's frontend source so later customization
# edits (including deletions) can be applied cleanly on top of defaults.
if [ ! -d "$FRONTEND_SRC_PRISTINE" ]; then
  cp -a "$FRONTEND_SRC" "$FRONTEND_SRC_PRISTINE"
fi

# Put backend into serve
cp -r /backend/ /serve/

# Frontend env (written once; rebuilds reuse these values)
cd "$FRONTEND_DIR"
echo "VITE_SEARCH_BASE_URL=$VITE_SEARCH_BASE_URL" >> .env.production
echo "VITE_SEARCH_QUERY_PATH=$VITE_SEARCH_QUERY_PATH" >> .env.production
echo "VITE_TITLE_TEXT=$VITE_TITLE_TEXT" >> .env.production
echo "VITE_HEADER_TEXT=$VITE_HEADER_TEXT" >> .env.production
echo "VITE_BYPASS_FORCE_DARK=$VITE_BYPASS_FORCE_DARK" >> .env.production

# We need the dev dependencies to compile customizations on run
npm i --include=dev

# Install backend deps and write backend env once
cd "$BACKEND_DIR"
echo "BASE_DOMAIN=$BASE_DOMAIN" >> .env.production
echo "NGINXPM_URL=$NGINXPM_URL" >> .env.production
echo "NGINXPM_USER=$NGINXPM_USER" >> .env.production
echo "NGINXPM_PASS=$NGINXPM_PASS" >> .env.production
npm i

# Initial customization apply + build
/serve/rebuild-frontend.sh

# Watch customization folder and rebuild when it changes (disable with WATCH_CUSTOMIZATION=false)
if [ "$WATCH_CUSTOMIZATION" = "true" ] || [ "$WATCH_CUSTOMIZATION" = "1" ]; then
  node /serve/watch-customization.mjs &
  WATCH_PID=$!
  echo "Customization watcher started (pid $WATCH_PID)"
else
  echo "Customization watcher disabled (WATCH_CUSTOMIZATION=$WATCH_CUSTOMIZATION)"
fi

# Run app in the foreground so the container tracks the server lifecycle
cd "$BACKEND_DIR"
npm run start
