import { SubsocialIpfsApi } from '@subsocial/api'
import {crustIpfsAuth, ipfsClusterUrl, ipfsNodeUrl, ipfsReadOnlyNodeUrl} from "../env";

function getIpfsApi() {
  const writeHeaders = crustIpfsAuth ? { authorization: crustIpfsAuth } : {}
  const props = crustIpfsAuth ? { asLink: false, 'meta.gatewayId': 1 } : { asLink: true }

  console.log(props)

  const ipfs = new SubsocialIpfsApi({
    ipfsNodeUrl: ipfsReadOnlyNodeUrl,
    ipfsAdminNodeUrl: ipfsNodeUrl,
    ipfsClusterUrl,
  })
  ipfs.setWriteHeaders(writeHeaders)

  return {
    ipfs,
    saveAndPinJson: async (content: Record<any, any>) => {
      const cid = await ipfs.saveJson(content)
      // ipfs.pinContent(cid, props)
      return cid
    },
    saveAndPinFile: async (file: any) => {
      const cid = await ipfs.saveFile(file)
      // ipfs.pinContent(cid, props)
      return cid
    },
  }
}

export const ipfsApi = getIpfsApi()

