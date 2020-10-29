import { Client } from '@elastic/elasticsearch'
import { elasticLog as log } from './loggers'

require('dotenv').config();

let greeted = false
if (!greeted) {
  greeted = true
  log.info(`Connecting to Elasticsearch at ${process.env.ES_NODE_URL}`)
}

export const elasticIndexer = new Client({
  node: process.env.ES_NODE_URL,
  auth: {
    username: process.env.ES_OFFCHAIN_USER,
    password: process.env.ES_OFFCHAIN_PASSWORD
  }
})

export const elasticReader = new Client({
  node: process.env.ES_NODE_URL,
  auth: {
    username: process.env.ES_READONLY_USER,
    password: process.env.ES_READONLY_PASSWORD
  }
})
