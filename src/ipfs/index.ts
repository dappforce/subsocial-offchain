import { SubsocialIpfsApi } from '@subsocial/api'
import {crustIpfsAuth, ipfsClusterUrl, ipfsNodeUrl} from "../env";
function getIpfsApi() {
  const headers = crustIpfsAuth ? { authorization: `Bearer ${crustIpfsAuth}` } : {}
  const props = crustIpfsAuth ? { asLink: false, 'meta.gatewayId': 1 } : { asLink: true }

  console.log(props)

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
      await ipfs.pinContent(cid, props)
      return cid
    },
    saveAndPinFile: async (file: any) => {
      const cid = await ipfs.saveFile(file)
      await ipfs.pinContent(cid, props)
      return cid
    },
  }
}

export const ipfsApi = getIpfsApi()

