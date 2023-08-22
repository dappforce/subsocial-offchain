import { SubsocialIpfsApi } from '@subsocial/api'
import {crustIpfsAuth, ipfsClusterUrl, ipfsNodeUrl} from "../env";
function getIpfsApi() {
  const headers = crustIpfsAuth ? { authorization: `Bearer ${crustIpfsAuth}` } : {}

  const ipfs = new SubsocialIpfsApi({
    ipfsNodeUrl,
    ipfsClusterUrl,
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

