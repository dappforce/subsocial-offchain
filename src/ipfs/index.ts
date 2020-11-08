import { resolveCidOfContent } from '@subsocial/api'
import { CommonContent } from '@subsocial/types/offchain'
import { Post, Profile, Space } from '@subsocial/types/substrate/interfaces'
import { resolveSubsocialApi } from '../connections'
import { ipfsLog as log } from '../connections/loggers'

type Struct = Post | Space | Profile

export async function getContentFromIpfs<T extends CommonContent>(struct: Struct): Promise<T | undefined> {
  const { ipfs } = await resolveSubsocialApi()
  const cid = resolveCidOfContent(struct.content)

  return ipfs.getContent<T>(cid)
    .catch(err => {
      log.warn(`Failed to get content from IPFS by CID:`, cid?.toString(), err)
      return undefined
    })
}
