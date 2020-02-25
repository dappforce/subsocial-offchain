import { IpfsData } from './../../df-types/src/blogs'
import * as IPFS from 'typestub-ipfs';
import ipfsClient from 'ipfs-http-client';
import CID from 'cids';

type IpfsAPI = IPFS.FilesAPI & {
  pin: {
    rm: (hash?: string) => any,
    ls: (hash?: string) => any
  },
  repo: IPFS.RepoAPI
};

// connect to ipfs daemon API server
const ipfs = ipfsClient('localhost', '5002', { protocol: 'http' }) as IpfsAPI;

// const ipfsConfig = { host: 'localhost', port:'5002', protocol: 'http' };
// new IPFS({ config: ipfsConfig });

export async function addJsonToIpfs (data: IpfsData): Promise<string> {
  // const path = `subsocial/${pathDir}`;
  // console.log(path);
  // const json = { path: path, content: Buffer.from(JSON.stringify(data)) };
  const json = Buffer.from(JSON.stringify(data));
  const results = await ipfs.add(json);
  return results[results.length - 1].hash;
}

export async function removeFromIpfs (hash: string) {
  await ipfs.pin.rm(hash);
}

export async function getJsonFromIpfs<T extends IpfsData> (hash: string): Promise<T> {
  const cid = new CID(hash);
  const results = await ipfs.cat(cid);
  return JSON.parse(results.toString()) as T;
}
