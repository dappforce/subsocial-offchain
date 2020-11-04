import { IpfsClusterApi } from '../ipfs/ipfsCluster'

require('dotenv').config()

const ipfsReadOnlyNodeUrl = process.env.IPFS_READ_ONLY_NODE_URL || 'http://localhost:8080'
const ipfsNodeUrl = process.env.IPFS_NODE_URL || 'http://localhost:5001'
const ipfsClusterUrl = process.env.IPFS_CLUSTER_URL || 'http://localhost:9094'
const port = process.env.OFFCHAIN_SERVER_PORT || 3001

// Connect to IPFS daemon API server
export const ipfsConfig = {
  ipfsNodeUrl: ipfsReadOnlyNodeUrl,
  offchainUrl: `http://localhost:${port}`
}

export const ipfsCluster = new IpfsClusterApi({
  ipfsClusterUrl,
  ipfsNodeUrl
})

