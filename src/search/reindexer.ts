import { SubsocialSubstrateApi } from '@subsocial/api/substrate'
import { resolveSubsocialApi } from '../connections/subsocial'
import { indexPostContent, indexProfileContent, indexSpaceContent } from './indexer'
import { elasticLog as log } from '../connections/loggers'
import * as BN from 'bn.js'
import { exit } from 'process'
import { GenericAccountId } from '@polkadot/types'

const one = new BN(1)

const reindexProfiles = async (substrate: SubsocialSubstrateApi) => {
  const api = await substrate.api
  const storageKeys = await api.query.profiles.socialAccountById.keys()

  for (let key of storageKeys) {
    const addressEncoded = '0x' + key.toHex().substr(-64)
    const account = new GenericAccountId(key.registry, addressEncoded)

    const res = await substrate.findSocialAccount(account)
    const { profile } = res
    if (profile.isSome) {
      // log.info(`Index profile of account ${account.toString()}`)
      indexProfileContent(profile.unwrap())
    }
  }
}

const reindexSpaces = async (substrate: SubsocialSubstrateApi) => {
  const lastSpaceId = (await substrate.nextSpaceId()).sub(one)
  const lastSpaceIdStr = lastSpaceId.toString()

  // Create an array with space ids from 1 to lastSpaceId
  const spaceIds = Array.from({length: lastSpaceId.toNumber()}, (_, i) => i + 1)

  const spaceIndexators = spaceIds.map(async spaceId => {
    const id = new BN(spaceId)
    const space = await substrate.findSpace({ id })
    indexSpaceContent(space)
  })

  await Promise.all(spaceIndexators)
  log.info(`Indexed ${lastSpaceIdStr} spaces`)
}

const reindexPosts = async (substrate: SubsocialSubstrateApi) => {
  const lastPostId = (await substrate.nextPostId()).sub(one)
  const lastPostIdStr = lastPostId.toString()

  // Create an array with space ids from 1 to lastSpaceId
  const postIds = Array.from({length: lastPostId.toNumber()}, (_, i) => i + 1)

  const postIndexators = postIds.map(async postId => {
    const id = new BN(postId)
    const post = await substrate.findPost({ id })
    indexPostContent(post)
  })

  await Promise.all(postIndexators)
  log.info(`Indexed ${lastPostIdStr} posts`)
}

async function reindexContentFromIpfs(substrate: SubsocialSubstrateApi) {
  await reindexSpaces(substrate)
  await reindexPosts(substrate)
  await reindexProfiles(substrate)

  exit(0)
}

resolveSubsocialApi()
  .then(({ substrate }) => reindexContentFromIpfs(substrate))
  .catch((error) => {
    log.error('Failed to reindex spaces and posts in Elasticsearch:', error)
    exit(-1)
  })
