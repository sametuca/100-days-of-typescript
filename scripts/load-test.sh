#!/bin/bash

TEST_TYPE=${1:-basic}
BASE_URL=${2:-http://localhost:3000}

echo "Running load test: $TEST_TYPE against $BASE_URL"

case $TEST_TYPE in
  "basic")
    echo "Running basic load test..."
    k6 run --env BASE_URL=$BASE_URL load-tests/k6-basic.js
    ;;
  "stress")
    echo "Running stress test..."
    k6 run --env BASE_URL=$BASE_URL load-tests/k6-stress.js
    ;;
  *)
    echo "Unknown test type: $TEST_TYPE"
    echo "Available types: basic, stress"
    exit 1
    ;;
esac

echo "Load test completed!"