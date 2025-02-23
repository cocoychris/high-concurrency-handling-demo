#!/bin/bash
# Load the environment variables
source ./version.env

# Set the image tag
IMAGE_TAG=$APP_NAME:$APP_VERSION

# Build the Docker image
docker build -f ./dockerfile --tag $IMAGE_TAG ..

# Tag the Docker image for the registry
docker tag $IMAGE_TAG asia-east1-docker.pkg.dev/sofware-design-project/customization/$IMAGE_TAG

# Push the Docker image to the registry
docker push asia-east1-docker.pkg.dev/sofware-design-project/customization/$IMAGE_TAG
