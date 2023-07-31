import { CommonContent } from '@subsocial/api/types'
import { ipfs } from '../connections'
import { ipfsLog as log } from '../connections/loggers'
import { SubsocialIpfsApi } from '@subsocial/api'
import {crustIpfsAuth, ipfsClusterUrl, ipfsNodeUrl} from "../env";

type HasContentId = {
  contentId?: string
}

export async function getContentFromIpfs<T extends CommonContent>(struct: HasContentId): Promise<T | undefined> {
  const cid = struct.contentId

  return ipfs.getContent<T>(cid)
    .catch(err => {
      log.warn(`Failed to get content from IPFS by CID:`, cid?.toString(), err)
      return undefined
    })
}
function getIpfsApi() {
  const CRUST_IPFS_CONFIG = {
    ipfsNodeUrl: ipfsNodeUrl,
    ipfsClusterUrl: ipfsClusterUrl,
  }
  const headers = { authorization: `Bearer ${crustIpfsAuth}` }

  console.log('headers', headers)

  const ipfs = new SubsocialIpfsApi({
    ...CRUST_IPFS_CONFIG,
    headers,
  })
  ipfs.setWriteHeaders(headers)
  ipfs.setPinHeaders(headers)

  return {
    ipfs,
    saveAndPinJson: async (content: Record<any, any>) => {
      const cid = await ipfs.saveJson(content)
      await ipfs.pinContent(cid, { 'meta.gatewayId': 1 })
      return cid
    },
    saveAndPinImage: async (content: any) => {
      const cid = await ipfs.saveFile(content)
      await ipfs.pinContent(cid, { 'meta.gatewayId': 1 })
      return cid
    },
  }
}

export const ipfsApi = getIpfsApi()

