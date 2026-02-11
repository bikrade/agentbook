#!/bin/sh
set -eu

# If DATABASE_URL points to a file and it does not exist yet (fresh Azure Files mount),
# hydrate it from the image-seeded SQLite DB once.
case "${DATABASE_URL:-}" in
  file:*)
    DB_PATH="${DATABASE_URL#file:}"
    DB_DIR="$(dirname "$DB_PATH")"
    if [ ! -f "$DB_PATH" ]; then
      if mkdir -p "$DB_DIR" 2>/dev/null && cp /app/prisma/dev.db "$DB_PATH" 2>/dev/null; then
        chmod 664 "$DB_PATH" || true
        echo "Initialized SQLite database at $DB_PATH from /app/prisma/dev.db"
      else
        # Keep the app available even if the mounted directory is not writable yet.
        FALLBACK_DB_PATH="/tmp/dev.db"
        cp /app/prisma/dev.db "$FALLBACK_DB_PATH"
        export DATABASE_URL="file:$FALLBACK_DB_PATH"
        echo "Warning: could not initialize $DB_PATH; using fallback $FALLBACK_DB_PATH"
      fi
    fi
    ;;
  *)
    echo "DATABASE_URL is not a file URL; skipping SQLite bootstrap."
    ;;
esac

exec node server.js
