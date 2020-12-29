import { ElasticIndex } from '@subsocial/types/offchain/search';
import * as dotenv from 'dotenv'

dotenv.config()

export const ES_INDEX_URL = process.env.ES_INDEX_URL || 'http://localhost:9200'
export const ES_INDEX_SPACES = ElasticIndex.spaces
export const ES_INDEX_POSTS = ElasticIndex.posts
export const ES_INDEX_PROFILES = ElasticIndex.profiles
