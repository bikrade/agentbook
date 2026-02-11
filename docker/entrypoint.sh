#!/bin/sh
set -eu

# If DATABASE_URL points to a file and it does not exist yet (fresh Azure Files mount),
# hydrate it from the image-seeded SQLite DB once.
case "${DATABASE_URL:-}" in
  file:*)
    DB_PATH="${DATABASE_URL#file:}"
    DB_DIR="$(dirname "$DB_PATH")"
    if [ ! -f "$DB_PATH" ]; then
      mkdir -p "$DB_DIR"
      cp /app/prisma/dev.db "$DB_PATH"
      chmod 664 "$DB_PATH" || true
      echo "Initialized SQLite database at $DB_PATH from /app/prisma/dev.db"
    fi
    ;;
  *)
    echo "DATABASE_URL is not a file URL; skipping SQLite bootstrap."
    ;;
esac

exec node server.js
