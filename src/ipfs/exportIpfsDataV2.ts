import { SubsocialIpfsApi, SubsocialSubstrateApi } from '@subsocial/api'
import { resolveSubsocialApi } from '../connections/subsocial'
import { ipfsLog as log } from '../connections/loggers'
import BN from 'bn.js';
import { exit } from 'process'
import { GenericAccountId } from '@polkadot/types'
import { CommonContent, SpaceContent } from '@subsocial/types/offchain';
import { backupPath } from '../env'
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { PostContent, ProfileContent } from '@subsocial/types';
import { downloadFile } from './utils';

const createDirsIfNotExist = (path: string[]) => path.map(path => !existsSync(path) && mkdirSync(path))

const one = new BN(1)

type ExportFn = (substrate: SubsocialSubstrateApi, ipfs: SubsocialIpfsApi) => Promise<Record<string, CommonContent>>



export const exportProfiles: ExportFn = async (substrate, ipfs) => {
  const api = await substrate.api
  const storageKeys = await api.query.profiles.socialAccountById.keys()
  const profileContents: Record<string, CommonContent> = {}

  const profileIndexators = storageKeys.map(async (key) => {
    const addressEncoded = '0x' + key.toHex().substr(-64)
    const account = new GenericAccountId(key.registry, addressEncoded)

    const res = await substrate.findSocialAccount(account)
    const { profile } = res

    if (profile.isSome) {
      log.info(`Export profile content of account ${account.toString()}`)

      if (profile.unwrap().content.isIpfs) {
        const cid = profile.unwrap().content.asIpfs.toString()

        const content: ProfileContent = await ipfs.getContent(cid)
        if(content) {
          await downloadFile(content.avatar)
          profileContents[cid] = content
        }
      }
    }
  })

  await Promise.all(profileIndexators)

  return profileContents
}

export const exportSpaces: ExportFn = async (substrate, ipfs) => {
  const lastSpaceId = (await substrate.nextSpaceId()).sub(one)
  const lastSpaceIdStr = lastSpaceId.toString()
  const spaceContents: Record<string, CommonContent> = {}

  // Create an array with space ids from 1 to lastSpaceId
  const spaceIds = Array.from({ length: lastSpaceId.toNumber() }, (_, i) => i + 1)

  const spaceIndexators = spaceIds.map(async (spaceId) => {
    const id = new BN(spaceId)
    const space = await substrate.findSpace({ id })
    log.info(`Export space content # ${spaceId} out of ${lastSpaceIdStr}`)

    if (space.content.isIpfs) {
      const cid = space.content.asIpfs
      const content: SpaceContent = await ipfs.getContent(cid)
      if(content) {
        await downloadFile(content.image)
        spaceContents[cid.toString()] = content
      }
    }
  })

  await Promise.all(spaceIndexators)

  return spaceContents
}

export const exportPosts: ExportFn = async (substrate, ipfs) => {
  const lastPostId = (await substrate.nextPostId()).sub(one)
  const lastPostIdStr = lastPostId.toString()
  const postsContent: Record<string, CommonContent> = {}

  // Create an array with space ids from 1 to lastSpaceId
  const postIds = Array.from({ length: lastPostId.toNumber() }, (_, i) => i + 1)

  const postIndexators = postIds.map(async (postId) => {
    const id = new BN(postId)
    const post = await substrate.findPost({ id })
    log.info(`Export post content # ${postId} out of ${lastPostIdStr}`)

    if (post.content.isIpfs) {
      const cid = post.content.asIpfs

      const content: PostContent = await ipfs.getContent(cid)
      if(content) {
        await downloadFile(content.image)
        postsContent[cid.toString()] = content
      }
    }
  })

  await Promise.all(postIndexators)

  return postsContent
}

type IExportFunction = Record<string, ExportFn>
const ExportFunction: IExportFunction = {
  profiles: exportProfiles,
  spaces: exportSpaces,
  posts: exportPosts,
}
const AllReindexerFunctions = Object.values(ExportFunction)

async function exportIpfsDataV2(substrate: SubsocialSubstrateApi, ipfs: SubsocialIpfsApi) {
  let contents: Record<string, CommonContent> = {}

  createDirsIfNotExist([backupPath, `${backupPath}/files`])

  let exportPromises = AllReindexerFunctions.map(async fn => {
      const content = await fn(substrate, ipfs)
      contents = { ...contents, ...content }
  })

  await Promise.all(exportPromises)

  writeFileSync(`${backupPath}/content.json`, JSON.stringify(contents, null, 2))

  exit(0)
}

resolveSubsocialApi().then(({ substrate, ipfs }) => exportIpfsDataV2(substrate, ipfs))