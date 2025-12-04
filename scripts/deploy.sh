#!/bin/bash

set -e

ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}

echo "Deploying DevTracker to $ENVIRONMENT environment..."

# Build and tag Docker image
docker build -t devtracker:$VERSION .

# Tag for registry
docker tag devtracker:$VERSION registry.example.com/devtracker:$VERSION

# Push to registry
docker push registry.example.com/devtracker:$VERSION

# Deploy based on environment
case $ENVIRONMENT in
  "staging")
    echo "Deploying to staging..."
    kubectl set image deployment/devtracker-staging devtracker=registry.example.com/devtracker:$VERSION -n staging
    ;;
  "production")
    echo "Deploying to production..."
    kubectl set image deployment/devtracker-prod devtracker=registry.example.com/devtracker:$VERSION -n production
    ;;
  *)
    echo "Unknown environment: $ENVIRONMENT"
    exit 1
    ;;
esac

# Wait for rollout to complete
kubectl rollout status deployment/devtracker-$ENVIRONMENT -n $ENVIRONMENT

echo "Deployment completed successfully!"