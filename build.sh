#!/bin/bash

# Configuration
REGISTRY="cr.yandex/crpa3u3frrtfcv7iqaan"
IMAGE_NAME="prime-platform-image"
DOCKERFILE_PATH="deploy/Dockerfile"
DEPLOYMENT_NAME="prime-platform-deployment"

TAG=$(date +%Y%m%d-%H%M%S)

FULL_IMAGE_NAME="$REGISTRY/$IMAGE_NAME:$TAG"

echo "Building image with tag: $TAG"

# Build the Docker image
docker build -f $DOCKERFILE_PATH -t $FULL_IMAGE_NAME .

if [ $? -ne 0 ]; then
    echo "Docker build failed"
    return
fi

# Push the image to registry
echo "Pushing image to registry..."
docker push $FULL_IMAGE_NAME

if [ $? -ne 0 ]; then
    echo "Docker push failed"
    return
fi

# Update the deployment image using kubectl set
echo "Updating deployment image..."
kubectl set image deployment/$DEPLOYMENT_NAME prime-platform-container=$FULL_IMAGE_NAME

echo "Complete! New image tag: $TAG"