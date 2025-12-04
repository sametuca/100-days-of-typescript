#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: npm run migration:create <migration_name>"
  exit 1
fi

MIGRATION_NAME=$1
TIMESTAMP=$(date +%s)
MIGRATION_ID=$(printf "%03d" $(ls src/database/migrations/*.sql 2>/dev/null | wc -l | xargs expr 1 +))
FILENAME="${MIGRATION_ID}_${MIGRATION_NAME}.sql"
FILEPATH="src/database/migrations/${FILENAME}"

cat > "$FILEPATH" << EOF
-- Migration: ${MIGRATION_ID}_${MIGRATION_NAME}
-- Description: ${MIGRATION_NAME}

-- Add your SQL statements here

EOF

echo "Migration created: $FILEPATH"