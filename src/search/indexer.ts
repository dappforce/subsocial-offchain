
import { AccountId } from '@polkadot/types/interfaces'
import { PostContent, ProfileContent, SpaceContent } from '@subsocial/types/offchain'
import { ElasticIndex, ElasticIndexName, ElasticPostDoc, ElasticProfileDoc, ElasticSpaceDoc } from '@subsocial/types/offchain/search'
import { Post, PostId, Profile, Space, SpaceId } from '@subsocial/types/substrate/interfaces'
import { isEmptyObj } from '@subsocial/utils'
import { resolveSubsocialApi } from '../connections'
import { elasticIndexer } from '../connections/elastic'
import { getContentFromIpfs } from '../ipfs'
import { stringifyOption } from '../substrate/utils'

async function getProfileDoc(profile: Profile): Promise<ElasticProfileDoc | undefined> {
  const content = await getContentFromIpfs<ProfileContent>(profile)
  if (!content) return undefined

  const { name, about } = content
  return {
    name,
    about,
  }
}

async function getSpaceDoc(space: Space): Promise<ElasticSpaceDoc | undefined> {
  const content = await getContentFromIpfs<SpaceContent>(space)
  if (!content) return undefined

  const { name, about, tags } = content
  const handle = stringifyOption(space.handle)

  return {
    name,
    handle,
    about,
    tags,
  }
}

async function getPostDoc(post: Post): Promise<ElasticPostDoc | undefined> {
  const content = await getContentFromIpfs<PostContent>(post)
  if (!content) return undefined

  const { substrate } = await resolveSubsocialApi()
  const { space_id, extension } = post
  const { title, body, tags } = content

  let spaceId: string

  if (extension.isComment) {
    const rootPostId = extension.asComment.root_post_id
    const rootPost = await substrate.findPost({ id: rootPostId })
    spaceId = stringifyOption(rootPost.space_id)
  } else {
    spaceId = stringifyOption(space_id)
  }

  return {
    spaceId,
    title,
    body,
    tags,
  }
}

type AnyElasticDoc =
  ElasticProfileDoc | 
  ElasticSpaceDoc | 
  ElasticPostDoc

type IndexContentProps = {
  index: ElasticIndexName
  id: AccountId | SpaceId | PostId
  doc: AnyElasticDoc
}

async function indexContent({ index, id, doc }: IndexContentProps) {
  if (isEmptyObj(doc)) return undefined

  return elasticIndexer.index({
    index,
    id: id?.toString(),
    body: doc
  })
}

export async function indexProfileContent(profile: Profile) {
  return indexContent({
    index: ElasticIndex.profiles,
    id: profile.created.account,
    doc: await getProfileDoc(profile)
  })
}

export async function indexSpaceContent(space: Space) {
  return indexContent({
    index: ElasticIndex.spaces,
    id: space.id,
    doc: await getSpaceDoc(space)
  })
}

export async function indexPostContent(post: Post) {
  return indexContent({
    index: ElasticIndex.posts,
    id: post.id,
    doc: await getPostDoc(post)
  })
}
