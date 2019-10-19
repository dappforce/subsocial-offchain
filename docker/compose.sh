#!/usr/bin/env bash
set -e

pushd .

# The following line ensure we run from the project root
PROJECT_ROOT=`git rev-parse --show-toplevel`
cd $PROJECT_ROOT

# Build the image
echo "Starting offchain in background, hang on!"
time docker-compose -f ./docker/docker-compose.yml up -d

# Show the list of available images for this repo
echo "Containers are ready"

popd