import { newLogger } from '@subsocial/utils';

export const postgesLog = newLogger('Postgres');
export const elasticLog = newLogger('ElasticSearch');
export const substrateLog = newLogger('Substrate');
export const offchainApiLog = newLogger('ExpressOffchainApi')
