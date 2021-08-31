import { ipfsReadOnlyNodeUrl, port, ipfsClusterUrl, ipfsNodeUrl } from '../env'
import { IpfsClusterApi } from '../ipfs/ipfsCluster'

require('dotenv').config()

// Connect to IPFS daemon API server
export const ipfsConfig = {
  ipfsNodeUrl: ipfsReadOnlyNodeUrl,
  offchainUrl: `http://localhost:${port}`
}

export const ipfsCluster = new IpfsClusterApi({
  ipfsClusterUrl,
  ipfsNodeUrl
})

