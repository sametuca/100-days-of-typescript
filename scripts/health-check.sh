#!/bin/bash

URL=${1:-http://localhost:3000}
MAX_ATTEMPTS=${2:-30}
SLEEP_TIME=${3:-5}

echo "Checking health of $URL..."

for i in $(seq 1 $MAX_ATTEMPTS); do
  echo "Attempt $i/$MAX_ATTEMPTS..."
  
  if curl -f -s "$URL/api/health" > /dev/null; then
    echo "✅ Service is healthy!"
    exit 0
  fi
  
  if [ $i -lt $MAX_ATTEMPTS ]; then
    echo "❌ Service not ready, waiting $SLEEP_TIME seconds..."
    sleep $SLEEP_TIME
  fi
done

echo "❌ Service failed to become healthy after $MAX_ATTEMPTS attempts"
exit 1