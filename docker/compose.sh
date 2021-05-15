#!/bin/bash
set -e

pushd . > /dev/null

# The following line ensure we run from the script folder
CDIR=`dirname "$0"`
cd "$CDIR"

# TODO: add selective start of components

# POSTGRES_SERVICE="postgres"
# ELASTIC_SERVICE="elasticsearch"
# IPFS_SERVICES='ipfs-cluster ipfs-peer'
# COMPOSE_FILES="$POSTGRES_SERVICE $ELASTIC_SERVICE $IPFS_SERVICES"

export ELASTIC_CONTAINER="subsocial-elasticsearch"
export POSTGRES_CONTAINER="subsocial-postgres"
export IPFS_NODE_CONTAINER="subsocial-ipfs-node"
export IPFS_CLUSTER_CONTAINER="subsocial-ipfs-cluster"

ES_NODE_URL='http://127.0.0.1:9200'
IPFS_NODE_URL='http://127.0.0.1:8080'

# Generated new IPFS Cluster secret in case the 'ipfs-data' directory was deleted
export CLUSTER_SECRET=$(od  -vN 32 -An -tx1 /dev/urandom | tr -d ' \n')

case $1 in
  --stop)
    docker-compose kill
    if [[ $2 == '--clean' ]]; then
      echo "Cleaning volumes..."
      docker-compose down -v

      while true; do
        read -p "Do you want to remove ipfs folder as well? [Y/n]:" yn
        case $yn in
          [Yy]*) sudo rm -rf ipfs-data; break;;
          [Nn]*) break;;
          * ) echo "Please answer yes or no.";;
        esac
      done
    fi
    exit 0
    ;;
  -?*)
    printf "Invalid argument provided.\n\nExamples:\n"
    printf "Start all:\n./compose.sh\n\n"
    printf "Stop all:\n./compose.sh --down\n\n"
    printf "Clean all:\n./compose.sh --down clean\n"

    exit 1
    ;;
  --)
    ;;
esac

printf "Starting offchain utils in background, hang on!\n\n"

docker-compose up -d $UTILS

printf "Configuring IPFS node...\n\n"
until curl -s "$IPFS_NODE_URL/api/v0/version" > /dev/null; do
  sleep 2
done

docker exec subsocial-ipfs-node ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
docker exec subsocial-ipfs-node ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["GET", "PUT", "POST"]'
docker exec subsocial-ipfs-node ipfs bootstrap rm --all &> /dev/null

docker restart subsocial-ipfs-node > /dev/null

echo "Containers are ready."

popd > /dev/null
