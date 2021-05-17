#!/bin/bash
set -e

pushd . > /dev/null

# The following line ensure we run from the script folder
CDIR=$(dirname "$0")
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

export ES_NODE_URL='http://127.0.0.1:9200'
IPFS_NODE_URL='http://127.0.0.1:8080'

# Generated new IPFS Cluster secret in case the 'ipfs-data' directory was deleted
export CLUSTER_SECRET
CLUSTER_SECRET=$(od  -vN 32 -An -tx1 /dev/urandom | tr -d ' \n')
IPFS_PEERS=""

add_peers() {
  until [ -z "$1" ]; do
    (printf "Peer " && docker exec -it $IPFS_NODE_CONTAINER ipfs bootstrap add "$1") || true
    shift
  done
}

case $1 in
  --stop)
    printf "Stopping containers"
    if [[ $2 == '--clean' ]]; then
      printf " and cleaning volumes...\n\n"
      docker-compose down -v

      while true; do
        read -r -p "Do you want to remove ipfs folder as well? [Y/n]:" yn
        case $yn in
          [Yy]*) sudo rm -rf ipfs-data; break;;
          [Nn]*) break;;
          * ) echo "Please answer yes or no.";;
        esac
      done
    else
      printf "...\n\n"
      docker-compose kill
    fi
    exit 0
    ;;
  -?*)
    printf "Invalid argument provided.\n\nExamples:\n"
    printf "Start all:\n./start-infra.sh\n\n"
    printf "Stop all:\n./start-infra.sh --stop\n\n"
    printf "Clean all:\n./start-infra.sh --stop --clean\n"
    printf "Add peer to IPFS:\n./start-infra.sh +peers /ip4/<IP_ADDRESS>/tcp/4001/p2p/<PEER_ID>"
    printf "Add several peers to IPFS:\n./start-infra.sh +peers \"/ip4/<IP_1_ADDRESS>/tcp/4001/p2p/<PEER_1_ID> /ip4/<IP_2_ADDRESS>/tcp/4001/p2p/<PEER_2_ID>\""

    exit 1
    ;;
  +peers)
    if [[ -z "$2" ]]; then
      echo "Error: +peer option should be followed with the peer URI: /ip4/<IP_ADDRESS>/tcp/4001/p2p/<PEER_ID>"
      exit 1
    fi
    IPFS_PEERS+="$2"
    shift 2
    ;;
esac

printf "Starting offchain utils in background, hang on!\n\n"

docker-compose up -d $UTILS

printf "\nConfiguring IPFS node...\n\n"
until curl -s "$IPFS_NODE_URL/api/v0/version" > /dev/null; do
  sleep 2
done

docker exec $IPFS_NODE_CONTAINER ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
docker exec $IPFS_NODE_CONTAINER ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["GET", "PUT", "POST"]'
docker exec $IPFS_NODE_CONTAINER ipfs bootstrap rm --all &> /dev/null

docker restart $IPFS_NODE_CONTAINER > /dev/null

[[ -n $IPFS_PEERS ]] && add_peers $IPFS_PEERS

printf "\nContainers are ready.\n"

popd > /dev/null
