#!/usr/bin/env bash
set -e

pushd . > /dev/null

# The following line ensure we run from the docker folder
PROJECT_ROOT=`git rev-parse --show-toplevel`
cd $PROJECT_ROOT/docker

if [[ $1 = 'down' ]]
then
  time docker-compose down;
  exit 0;
fi

POSTGRES_SERVICE=postgres
ES_SERVICE=elasticsearch
OFFCHAIN_SERVICE=subsocial-offchain

ES_NODE_URL=$(grep ES_NODE_URL ../.env | xargs)
ES_NODE_URL=${ES_NODE_URL#*=}

time (
  echo "Starting offchain in background, hang on!"

  docker-compose up -d $POSTGRES_SERVICE
  docker-compose up -d $ES_SERVICE

  echo "Elasticsearch is starting..."
  until curl -s $ES_NODE_URL > /dev/null; do
    sleep 2
  done

  docker-compose up -d $OFFCHAIN_SERVICE
)

echo "Containers are ready."

popd > /dev/null
