require('dotenv').config();

export const substrateNodeUrl = process.env.SUBSTRATE_URL

export const ipfsReadOnlyNodeUrl = process.env.IPFS_READ_ONLY_NODE_URL || 'http://localhost:8080'
export const ipfsNodeUrl = process.env.IPFS_NODE_URL || 'http://localhost:5001'
export const ipfsClusterUrl = process.env.IPFS_CLUSTER_URL || 'http://localhost:9094'
export const port = process.env.OFFCHAIN_SERVER_PORT || 3001

export const corsAllowedList = process.env.CORS_ALLOWED_ORIGIN.split(',')
export const isAllCorsAllowed = corsAllowedList[0] === '*'
