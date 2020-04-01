import { SubsocialIpfsApi } from '@subsocial/api/ipfs'
const ipfsUrl = process.env.IPFS_URL || '/ip4/127.0.0.1/tcp/5001';
// Connect to IPFS daemon API server
export const ipfs = new SubsocialIpfsApi(ipfsUrl);

export default ipfs
