require('dotenv').config();

export const ES_INDEX_URL = process.env.ES_INDEX_URL || 'http://localhost:9200'
export const ES_INDEX_SPACES = process.env.ES_INDEX_SPACES || 'subsocial_spaces'
export const ES_INDEX_POSTS = process.env.ES_INDEX_POSTS || 'subsocial_posts'
export const ES_INDEX_PROFILES = process.env.ES_INDEX_PROFILES || 'subsocial_profiles'
