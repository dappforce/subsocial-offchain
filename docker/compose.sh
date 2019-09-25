#!/usr/bin/env bash
set -e

pushd .

# The following line ensure we run from the project root
PROJECT_ROOT=`git rev-parse --show-toplevel`
cd $PROJECT_ROOT

GITREPO=subsocial-offchain

# Build the image
echo "Building ${GITUSER}/${GITREPO}:latest docker image, hang on!"
time docker-compose -f ./docker/docker-compose.yml up

# Show the list of available images for this repo
echo "Image is ready"
docker images | grep ${GITREPO}

popd