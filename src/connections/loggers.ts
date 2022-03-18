import { newLogger } from '@subsocial/utils'

export const expressApiLog = newLogger('Express API', 'DEBUG')
export const substrateLog = newLogger('Substrate', 'DEBUG')
export const ipfsLog = newLogger('IPFS', 'DEBUG')
export const postgesLog = newLogger('Postgres', 'DEBUG')
export const elasticLog = newLogger('ElasticSearch')
