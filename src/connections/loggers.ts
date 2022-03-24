import { newLogger } from '@subsocial/utils'
require('dotenv').config();

export const expressApiLog = newLogger('Express API')
export const substrateLog = newLogger('Substrate')
export const ipfsLog = newLogger('IPFS')
export const postgesLog = newLogger('Postgres')
export const elasticLog = newLogger('ElasticSearch')
