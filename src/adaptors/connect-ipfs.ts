import { SubsocialIpfsApi } from '@subsocial/api/ipfs'
const ipfsUrl = process.env.IPFS_URL || '/ip4/127.0.0.1/tcp/5001';
// Connect to IPFS daemon API server
const port = process.env.OFFCHAIN_SERVER_PORT
export const ipfs = new SubsocialIpfsApi( { connect: ipfsUrl, offchainUrl: `http://localhost:${port}` });

export default ipfs
