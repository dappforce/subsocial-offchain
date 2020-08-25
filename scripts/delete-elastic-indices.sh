#!/bin/bash

echo "Delete ElasticSearch indices created by Offchain"

curl "localhost:9200/_cat/indices?v"
curl -X DELETE "localhost:9200/subsocial_spaces?pretty"
curl -X DELETE "localhost:9200/subsocial_posts?pretty"
curl -X DELETE "localhost:9200/subsocial_profiles?pretty"
