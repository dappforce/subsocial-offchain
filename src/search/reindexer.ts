import { SubsocialSubstrateApi } from '@subsocial/api'
import { resolveSubsocialApi } from '../connections/subsocial'
import { indexPostContent, indexProfileContent, indexSpaceContent } from './indexer'
import { elasticLog as log } from '../connections/loggers'
import BN from 'bn.js';
import { argv, exit } from 'process'
import { GenericAccountId } from '@polkadot/types'
import { isEmptyArray } from '@subsocial/utils';
import { getUniqueIds } from '@subsocial/api'
import { findPost, findSocialAccount, findSpace } from '../substrate/api-wrappers';

const one = new BN(1)

type ReindexerFn = (substrate: SubsocialSubstrateApi) => Promise<void>

const reindexProfiles: ReindexerFn = async (substrate) => {
  const api = await substrate.api
  const storageKeys = await api.query.profiles.socialAccountById.keys()

  const profileIndexators = storageKeys.map(async (key) => {
    const addressEncoded = '0x' + key.toHex().substr(-64)
    const account = new GenericAccountId(key.registry, addressEncoded)

    const socialAccount = await findSocialAccount(account)
    if (socialAccount.contentId) {
      log.info(`Index profile of account ${account.toString()}`)
      await indexProfileContent(socialAccount)
    }
  })

  await Promise.all(profileIndexators)
}

const reindexSpaces: ReindexerFn = async (substrate) => {
  const lastSpaceId = (await substrate.nextSpaceId()).sub(one)
  const lastSpaceIdStr = lastSpaceId.toString()

  // Create an array with space ids from 1 to lastSpaceId
  const spaceIds = Array.from({ length: lastSpaceId.toNumber() }, (_, i) => i + 1)

  const spaceIndexators = spaceIds.map(async (spaceId) => {
    const id = new BN(spaceId)
    const space = await findSpace(id.toString())
    log.info(`Index space # ${spaceId} out of ${lastSpaceIdStr}`)
    await indexSpaceContent(space)
  })

  await Promise.all(spaceIndexators)
}

const reindexPosts: ReindexerFn = async (substrate) => {
  const lastPostId = (await substrate.nextPostId()).sub(one)
  const lastPostIdStr = lastPostId.toString()

  // Create an array with space ids from 1 to lastSpaceId
  const postIds = Array.from({ length: lastPostId.toNumber() }, (_, i) => i + 1)

  const postIndexators = postIds.map(async (postId) => {
    const id = new BN(postId)
    const post = await findPost(id.toString())
    log.info(`Index post # ${postId} out of ${lastPostIdStr}`)
    await indexPostContent(post)
  })

  await Promise.all(postIndexators)
}

type IReindexerFunction = Record<string, ReindexerFn>
const ReindexerFunction: IReindexerFunction = {
  profiles: reindexProfiles,
  spaces: reindexSpaces,
  posts: reindexPosts,
}
const AllReindexerFunctions = Object.values(ReindexerFunction)

async function reindexContentFromIpfs(substrate: SubsocialSubstrateApi) {
  const uniqueArguments = getUniqueIds(argv)
  let reindexPromises = uniqueArguments.filter(arg => ReindexerFunction[arg])
    .map(async argument => {
      const func = ReindexerFunction[argument]
      await func(substrate)
    })

  if (isEmptyArray(reindexPromises) || argv.includes('all'))
    reindexPromises = AllReindexerFunctions.map(fn => fn(substrate))

  await Promise.all(reindexPromises)

  exit(0)
}

resolveSubsocialApi()
  .then(({ substrate }) => reindexContentFromIpfs(substrate))
  .catch((error) => {
    log.error('Failed to reindex spaces and posts in Elasticsearch:', error)
    exit(-1)
  })
