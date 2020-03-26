import { SubsocialIpfsApi } from '@subsocial/api/ipfs'
const ipfsUrl = process.env.IPFS_URL || 'http://localhost:5002';
// Connect to IPFS daemon API server
export const ipfs = new SubsocialIpfsApi(ipfsUrl);
export default ipfs
