import { SubsocialIpfsApi } from '@subsocial/api/ipfs'

const url = process.env.IPFS_URL || '/ip4/127.0.0.1/tcp/5001'
const port = process.env.OFFCHAIN_SERVER_PORT || 3001

// Connect to IPFS daemon API server
export const ipfs = new SubsocialIpfsApi({
  connect: url,
  offchainUrl: `http://localhost:${port}`
})

export default ipfs
