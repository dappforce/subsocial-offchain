import { ipfsReadOnlyNodeUrl, port } from '../env'
import { SubsocialIpfsApi } from '@subsocial/api'

require('dotenv').config()

// Connect to IPFS daemon API server
export const ipfsConfig = {
  ipfsNodeUrl: ipfsReadOnlyNodeUrl,
  offchainUrl: `http://localhost:${port}`
}
export const ipfs = new SubsocialIpfsApi(ipfsConfig)
