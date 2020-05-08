#!/bin/bash
set -e

pushd . > /dev/null

# The following line ensure we run from the script folder
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
eval cd $DIR

UTILS_ONLY=false

# Generated new IPFS Cluster secret in case the 'ipfs-data' directory was deleted
export CLUSTER_SECRET=$(od  -vN 32 -An -tx1 /dev/urandom | tr -d ' \n')

case $1 in
  --down)
    time docker-compose kill
    if [[ $2 == 'clean' ]]; then
      echo "Cleaning volumes..."
      eval docker-compose down
    fi
    exit 0
    ;;
  --utils)
    UTILS_ONLY=true
    ;;
  *)
    printf "Invalid argument provided.\n\nExamples:\n"
    printf "Start all:\n./compose.sh\n\n"
    printf "Start services without offchain itself:\n./compose.sh --utils\n\n"
    printf "Stop all:\n./compose.sh --down\n\n"
    printf "Clean all:\n./compose.sh --down clean\n"

    exit 1
    ;;
esac

UTILS=" postgres elasticsearch ipfs-cluster ipfs-peer"

ES_NODE_URL='http://127.0.0.1:9200'
IPFS_NODE_URL='http://127.0.0.1:8080'

time (
  echo "Starting offchain in background, hang on!"

  if [ UTILS_ONLY ]; then
    docker-compose up -d $UTILS
  else
    docker-compose up -d
    docker stop subsocial-offchain

    echo "Starting Elasticsearch..."
    until curl -s $ES_NODE_URL > /dev/null; do
      sleep 2
    done
    docker start subsocial-offchain
  fi

  echo "Waiting until IPFS is ready..."
  until curl -s --X GET ${IPFS_NODE_URL}'/api/v0/version' > /dev/null
  do
    sleep 1
  done
  for node in 0 1
  do
    docker exec subsocial-ipfs$node \
      ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
    docker exec subsocial-ipfs$node \
      ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["GET", "POST", "PUT"]'
    docker exec subsocial-ipfs$node ipfs bootstrap rm --all &> /dev/null

    printf "Restarting "
    docker restart subsocial-ipfs$node
  done

  # TODO: Add initial peer as the only one trusted
)

echo "Containers are ready."

popd > /dev/null
