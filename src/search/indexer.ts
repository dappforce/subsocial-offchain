
import { PostContent, ProfileContent, SpaceContent } from '@subsocial/types/offchain'
import { ElasticIndex, ElasticIndexName, ElasticPostDoc, ElasticProfileDoc, ElasticSpaceDoc } from '@subsocial/types/offchain/search'
import { isEmptyObj } from '@subsocial/utils'
import { elasticIndexer } from '../connections/elastic'
import { getContentFromIpfs } from '../ipfs'
import { findPost } from '../substrate/api-wrappers'
import { asNormalizedComment, NormalizedPost, NormalizedProfile, NormalizedSpace } from '../substrate/normalizers'

async function getProfileDoc(profile: NormalizedProfile): Promise<ElasticProfileDoc | undefined> {
  const content = await getContentFromIpfs<ProfileContent>(profile)
  if (!content) return undefined

  const { name, about } = content
  return {
    name,
    about,
  }
}

async function getSpaceDoc(space: NormalizedSpace): Promise<ElasticSpaceDoc | undefined> {
  const content = await getContentFromIpfs<SpaceContent>(space)
  if (!content) return undefined

  const { name, about, tags } = content
  // TODO Need to replace it with getting space's domain name from the Domains pallet.
  const handle = space.handle

  return {
    name,
    handle,
    about,
    tags,
  }
}

async function getPostDoc(post: NormalizedPost): Promise<ElasticPostDoc | undefined> {
  const content = await getContentFromIpfs<PostContent>(post)
  if (!content) return undefined

  const { spaceId: _spaceId, isComment } = post
  const { title, body, tags } = content

  let spaceId: string

  if (isComment) {
    const { rootPostId } = asNormalizedComment(post)
    const rootPost = await findPost(rootPostId)
    spaceId = rootPost.spaceId
  } else {
    spaceId = _spaceId
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
  id: string
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

export async function indexProfileContent(profile: NormalizedProfile) {
  return indexContent({
    index: ElasticIndex.profiles,
    id: profile.id,
    doc: await getProfileDoc(profile)
  })
}

export async function indexSpaceContent(space: NormalizedSpace) {
  return indexContent({
    index: ElasticIndex.spaces,
    id: space.id,
    doc: await getSpaceDoc(space)
  })
}

export async function indexPostContent(post: NormalizedPost) {
  return indexContent({
    index: ElasticIndex.posts,
    id: post.id,
    doc: await getPostDoc(post)
  })
}
