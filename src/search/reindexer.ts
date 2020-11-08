import { SubsocialSubstrateApi } from '@subsocial/api/substrate'
import { resolveSubsocialApi } from '../connections/subsocial'
import { PostId, SpaceId } from '@subsocial/types/substrate/interfaces'
import { indexPostContent, indexSpaceContent } from './indexer'
import { elasticLog as log } from '../connections/loggers'
import { exit } from 'process'

const BN = require('bn.js')
const one = new BN(1)

async function reindexContentFromIpfs(substrate: SubsocialSubstrateApi) {
  const lastSpaceId = (await substrate.nextSpaceId()).sub(one)
  const lastPostId = (await substrate.nextPostId()).sub(one)

  const lastSpaceIdStr = lastSpaceId.toString()
  const lastPostIdStr = lastPostId.toString()

  for (let i = one; lastSpaceId.gte(i); i = i.add(one)) {
    const id: SpaceId = i as unknown as SpaceId
    const space = await substrate.findSpace({ id })

    log.info(`Index space # ${id.toString()} out of ${lastSpaceIdStr}`)
    indexSpaceContent(space)
  }

  for (let i = one; lastPostId.gte(i); i = i.add(one)) {
    const id: PostId = i as unknown as PostId
    const post = await substrate.findPost({ id })
    
    log.info(`Index post # ${id.toString()} out of ${lastPostIdStr}`)
    indexPostContent(post)
  }

  exit(0)
}

resolveSubsocialApi()
  .then(({ substrate }) => reindexContentFromIpfs(substrate))
  .catch((error) => {
    log.error('Failed to reindex spaces and posts in Elasticsearch:', error)
    exit(-1)
  })
