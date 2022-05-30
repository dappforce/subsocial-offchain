import { Option } from '@polkadot/types/codec'
import { AccountId } from '@polkadot/types/interfaces/runtime'
import { bool } from '@polkadot/types/primitive'
import { AnyAccountId, PostContent, ProfileContent, SpaceContent } from '@subsocial/types'
import { Content, Space, Post, WhoAndWhen, SocialAccount } from '@subsocial/types/substrate/interfaces'
import { isEmptyArray } from '@subsocial/utils'
import BN from 'bn.js'

export type Id = string

type Cid = string

export type HasId = {
  id: Id
}

type CanHaveContent = {
  contentId?: Cid
}

type HasOwner = {
  owner: string
}

type HasCreated = {
  createdBy: string
  createdAtBlock: number
  createdAtTime: number
}

type CanBeUpdated = {
  isUpdated: boolean
  updatedByAccount?: string
  updatedAtBlock?: number
  updatedAtTime?: number
}

type CanBeHidden = {
  isHidden: boolean
  // isPublic: boolean
}

export type NormalizedSuperCommon =
  HasCreated &
  CanBeUpdated &
  CanHaveContent

type NormalizedSpaceOrPost =
  NormalizedSuperCommon &
  HasId &
  HasOwner &
  CanBeHidden

export type NormalizedSpace = NormalizedSpaceOrPost & {
  parentId?: Id
  handle?: string
  totalPostsCount: number
  hiddenPostsCount: number
  visiblePostsCount: number
  followersCount: number
  score: number
  // permissions?: SpacePermissions
}

export type NormalizedPost = NormalizedSpaceOrPost & {
  spaceId?: Id
  // extension: PostExtension,
  totalRepliesCount: number
  hiddenRepliesCount: number
  visibleRepliesCount: number
  sharesCount: number
  upvotesCount: number
  downvotesCount: number
  score: number
  isRegularPost: boolean
  isSharedPost: boolean
  isComment: boolean
}

type NormalizedSocialAccount = HasId & {
  followersCount: number
  followingAccountsCount: number
  followingSpacesCount: number
  reputation: number
  hasProfile: boolean
}

type CommentExtension = {
  parentId?: Id
  rootPostId: Id
}

type SharedPostExtension = {
  sharedPostId: Id
}

type NormalizedPostExtension = {} | CommentExtension | SharedPostExtension

type NormalizedSharedPost = NormalizedPost & SharedPostExtension

export type NormalizedComment = NormalizedPost & CommentExtension

export type NormalizedProfile =
  NormalizedSocialAccount &
  Partial<NormalizedSuperCommon>

export type SpaceWithContent = NormalizedSpace & SpaceContent
export type PostWithContent = NormalizedPost & PostContent
export type ProfileWithContent = NormalizedProfile & ProfileContent

type SuperCommonStruct = {
  created: WhoAndWhen
  updated: Option<WhoAndWhen>
  content: Content
}

type SpaceOrPostStruct = SuperCommonStruct & {
  id: BN
  owner: AccountId
  hidden: bool
}

export function getContentIds(entities: CanHaveContent[]): Cid[] {
  if (isEmptyArray(entities)) {
    return []
  }

  const cids: Cid[] = []
  entities.forEach(({ contentId }) => {
    if (contentId) {
      cids.push(contentId)
    }
  })
  return cids
}

function normalizeSuperCommonStruct(struct: SuperCommonStruct): NormalizedSuperCommon {
  const { created, updated } = struct

  const maybeUpdated = updated.unwrapOr(undefined)
  const maybeContentId = struct.content.isIpfs ? struct.content.asIpfs.toString() : undefined

  return {
    // created:
    createdBy: created.account.toString(),
    createdAtBlock: created.block.toNumber(),
    createdAtTime: created.time.toNumber(),

    // updated:
    isUpdated: updated.isSome,
    updatedByAccount: maybeUpdated?.account.toString(),
    updatedAtBlock: maybeUpdated?.block.toNumber(),
    updatedAtTime: maybeUpdated?.time.toNumber(),

    contentId: maybeContentId,
  }
}

function normalizeSpaceOrPostStruct(struct: SpaceOrPostStruct): NormalizedSpaceOrPost {
  return {
    ...normalizeSuperCommonStruct(struct),
    id: struct.id.toString(),
    owner: struct.owner.toString(),
    isHidden: struct.hidden.isTrue,
  }
}

export function normalizeSpaceStruct(struct: Space): NormalizedSpace {
  const totalPostsCount = struct.postsCount.toNumber()
  const hiddenPostsCount = struct.hiddenPostsCount.toNumber()
  const visiblePostsCount = totalPostsCount - hiddenPostsCount

  return {
    ...normalizeSpaceOrPostStruct(struct),
    parentId: struct.parentId.unwrapOr(undefined)?.toString(),
    handle: struct.handle.unwrapOr(undefined)?.toString(),
    totalPostsCount,
    hiddenPostsCount,
    visiblePostsCount,
    followersCount: struct.followersCount.toNumber(),
    score: struct.score.toNumber()
  }
}

export function normalizeSpaceStructs(structs: Space[]): NormalizedSpace[] {
  return structs.map(normalizeSpaceStruct)
}

export function normalizePostStruct(struct: Post): NormalizedPost {
  const totalRepliesCount = parseInt(struct.repliesCount.toString())
  const hiddenRepliesCount = parseInt(struct.hiddenRepliesCount.toString())
  const visibleRepliesCount = totalRepliesCount - hiddenRepliesCount
  const { isRegularPost, isSharedPost, isComment } = struct.extension

  let normExt: NormalizedPostExtension = {}
  if (isSharedPost) {
    normExt = { sharedPostId: struct.extension.asSharedPost.toString() }
  }
  else if (isComment) {
    const { parentId, rootPostId } = struct.extension.asComment
    normExt = {
      parentId: parentId.unwrapOr(undefined)?.toString(),
      rootPostId: rootPostId.toString()
    } as CommentExtension
  }

  return {
    ...normalizeSpaceOrPostStruct(struct),
    spaceId: struct.spaceId.unwrapOr(undefined)?.toString(),

    totalRepliesCount,
    hiddenRepliesCount,
    visibleRepliesCount,

    sharesCount: parseInt(struct.sharesCount.toString()),
    upvotesCount: parseInt(struct.upvotesCount.toString()),
    downvotesCount: parseInt(struct.downvotesCount.toString()),
    score: parseInt(struct.score.toString()),

    isRegularPost,
    isSharedPost,
    isComment,

    ...normExt
  }
}

export function normalizePostStructs(structs: Post[]): NormalizedPost[] {
  return structs.map(normalizePostStruct)
}

export function asNormalizedSharedPost(post: NormalizedPost): NormalizedSharedPost {
  if (!post.isSharedPost) throw new Error('Not a shared post')

  return post as NormalizedSharedPost
}

export function asNormalizedComment(post: NormalizedPost): NormalizedComment {
  if (!post.isComment) throw new Error('Not a comment')

  return post as NormalizedComment
}

export function normalizeProfileStruct(account: AnyAccountId, struct: SocialAccount): NormalizedProfile {
  const profile = struct.profile.unwrapOr(undefined)
  const hasProfile = struct.profile.isSome
  const maybeProfile: Partial<NormalizedSuperCommon> = profile
    ? normalizeSuperCommonStruct(profile)
    : {}

  return {
    id: account.toString(),
    followersCount: struct.followersCount.toNumber(),
    followingAccountsCount: struct.followingAccountsCount.toNumber(),
    followingSpacesCount: struct.followingSpacesCount.toNumber(),
    reputation: struct.reputation.toNumber(),
    hasProfile,
    ...maybeProfile
  }
}


// export function normalizeProfileStructs (structs: Profile[]): NormalizedProfile[] {
//   return structs.map(normalizeProfileStruct)
// }

// const postsAdapter = createEntityAdapter<NormalizedPost>()

// const profilesAdapter = createEntityAdapter<NormalizedProfile>()
