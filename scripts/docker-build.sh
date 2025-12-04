#!/bin/bash

echo "Building DevTracker Docker image..."

# Build the Docker image
docker build -t devtracker:latest .

echo "Docker image built successfully!"

# Optional: Tag for registry
# docker tag devtracker:latest your-registry/devtracker:latest

echo "To run the container:"
echo "docker run -p 3000:3000 devtracker:latest"