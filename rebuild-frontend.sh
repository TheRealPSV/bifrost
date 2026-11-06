#!/bin/sh
# Apply /customization onto a pristine frontend/src copy, rebuild, and swap
# the backend public folder so the running server picks up the new assets.

set -e

FRONTEND_DIR="${FRONTEND_DIR:-/frontend}"
FRONTEND_SRC="${FRONTEND_SRC:-$FRONTEND_DIR/src}"
FRONTEND_SRC_PRISTINE="${FRONTEND_SRC_PRISTINE:-$FRONTEND_DIR/src.pristine}"
CUSTOMIZATION_DIR="${CUSTOMIZATION_DIR:-/customization}"
BACKEND_DIR="${BACKEND_DIR:-/serve/backend}"

apply_customization() {
  if [ ! -d "$FRONTEND_SRC_PRISTINE" ]; then
    echo "Missing pristine frontend source at $FRONTEND_SRC_PRISTINE" >&2
    exit 1
  fi

  echo "Applying customization from $CUSTOMIZATION_DIR..."
  rm -rf "$FRONTEND_SRC"
  cp -a "$FRONTEND_SRC_PRISTINE" "$FRONTEND_SRC"

  if [ -d "$CUSTOMIZATION_DIR" ]; then
    # Trailing /. copies contents (including hidden files) and is a no-op when empty.
    cp -rf "$CUSTOMIZATION_DIR"/. "$FRONTEND_SRC"/
  else
    echo "No customization directory found; using default frontend source."
  fi
}

build_and_swap() {
  echo "Building frontend..."
  cd "$FRONTEND_DIR"
  npm run build

  echo "Swapping served frontend assets..."
  rm -rf "$BACKEND_DIR/public.next"
  cp -r "$FRONTEND_DIR/dist" "$BACKEND_DIR/public.next"

  # Replace public/ with a directory rename so in-flight requests mostly see
  # either the old or new tree rather than a half-copied folder.
  rm -rf "$BACKEND_DIR/public.prev"
  if [ -d "$BACKEND_DIR/public" ]; then
    mv "$BACKEND_DIR/public" "$BACKEND_DIR/public.prev"
  fi
  mv "$BACKEND_DIR/public.next" "$BACKEND_DIR/public"
  rm -rf "$BACKEND_DIR/public.prev"
  echo "Frontend reload complete."
}

apply_customization
build_and_swap
