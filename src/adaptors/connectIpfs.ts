import { SubsocialIpfsApi } from '@subsocial/api/ipfs'
const ipfsUrl = process.env.IPFS_URL || 'http://localhost:5002';
// connect to ipfs daemon API server
export const ipfs = new SubsocialIpfsApi(ipfsUrl);
export default ipfs
