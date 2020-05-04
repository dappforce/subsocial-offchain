#!/usr/bin/env bash
set -e

pushd . > /dev/null

# The following line ensure we run from the script folder
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
eval cd $DIR

UTILS_ONLY=false

case $1 in
  --down)
    time docker-compose kill
    if [[ $2 == 'clean' ]]; then
      echo "Cleaning volumes..."
      eval docker-compose down
      echo "Cleaning data directory..."
      sudo rm -rf data
    fi
    eval sleep 2 && clear
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

UTILS=" postgres elasticsearch cluster"

ES_NODE_URL='http://127.0.0.1:9200'

time (
  echo "Starting offchain in background, hang on!"

  if [ UTILS_ONLY ]; then
    eval docker-compose up -d $UTILS
  else
    eval docker-compose up -d

    echo "Starting Elasticsearch..."
    until curl -s $ES_NODE_URL > /dev/null; do
      sleep 2
    done
    eval docker restart subsocial-offchain
  fi
)

echo "Containers are ready."

popd > /dev/null
