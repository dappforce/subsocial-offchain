import { CommonContent } from '@subsocial/api/types'
import { ipfs } from '../connections'
import { ipfsLog as log } from '../connections/loggers'

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
