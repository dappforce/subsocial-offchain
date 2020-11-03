import { AnySubsocialData, PostWithAllDetails, ProfileData, SpaceData } from '@subsocial/types'
import { newLogger } from '@subsocial/utils'
import { MAX_RESULT_LIMIT } from '../express-api/utils'
import BN from 'bn.js'
import { hexToBn } from '@polkadot/util'
import { createSubsocialConnect } from '../connections/connect-subsocial';
// TODO: export types
export type ElasticIndexTypes = 'spaces' | 'posts' | 'profiles' | 'all'

export const ElasticIndex = {
  profiles: 'subsocial_profiles',
  spaces: 'subsocial_spaces',
  posts: 'subsocial_posts',
}

export const AllElasticIndexes = [ElasticIndex.profiles, ElasticIndex.spaces, ElasticIndex.posts]

export const ElasticFields = {
  space: {
    name: 'name',
    handle: 'handle',
    about: 'about',
    tags: 'tags',
  },
  post: {
    title: 'title',
    body: 'body',
    tags: 'tags',
  },
  comment: {
    body: 'body',
  },
  profile: {
    name: 'name',
    about: 'about',
  },
}

type EsQueryBuilderParams = {
  q?: string
  limit?: number
  offset?: number
  indexes?: ElasticIndexTypes[]
}

const resoloveElasticIndexByType = (type: ElasticIndexTypes) => ElasticIndex[type]

const resoloveElasticIndexes = (indexes: ElasticIndexTypes[]) => indexes.includes('all')
  ? AllElasticIndexes
  : indexes?.map(resoloveElasticIndexByType)

export const buildElasticSearchQuery = (params: EsQueryBuilderParams) => {
  const from = params.offset || 0
  const size = params.limit || MAX_RESULT_LIMIT
  const q = params.q || '*'
  const indexes = resoloveElasticIndexes(params.indexes)

  // TODO: add sort
  // TODO: add filters

  const searchQueryPart =
    q === '*' || q.trim() === ''
      ? {
          match_all: {},
        }
      : {
          multi_match: {
            query: q,
            fields: [
              `${ElasticFields.space.name}^3`,
              `${ElasticFields.space.handle}^2`,
              `${ElasticFields.space.about}^1`,
              `${ElasticFields.space.tags}^2`,
              `${ElasticFields.post.title}^3`,
              `${ElasticFields.post.body}^1`,
              `${ElasticFields.post.tags}^2`,
              `${ElasticFields.comment.body}^2`,
              `${ElasticFields.profile.name}^3`,
              `${ElasticFields.profile.about}^1`,
            ],
          },
        }

  const searchReq = {
    index: indexes,
    from: from,
    size: size,
    body: {
      query: searchQueryPart,
    },
    // sort: [],
    //_sourceExclude: [],
    // filter: {and: []}
  }
  log.info('Elastic request is: %o', searchReq)

  return searchReq
}

export type DataResults = {
  _id: string;
  _index: string;
};

const fillArray = <T extends string | BN>(
  id: T,
  structIds: T[],
  structByIdMap: Map<string, AnySubsocialData | PostWithAllDetails>
) => {
  const struct = structByIdMap.get(id.toString())

  if (!struct) {
    structIds.push(id)
  }
}

export const loadSubsocialData = async (
    results: DataResults[],
) => {
  const spaceById = new Map<string, SpaceData>()
  const postById = new Map<string, PostWithAllDetails>()
  const ownerById = new Map<string, ProfileData>()

  const ownerIds: string[] = []
  const spaceIds: BN[] = []
  const postIds: BN[] = []

  results.forEach(({ _id, _index }) => {
    switch (_index) {
      case 'subsocial_profiles': return fillArray(_id, ownerIds, ownerById)
      case 'subsocial_spaces': return fillArray(hexToBn(_id), spaceIds, spaceById)
      case 'subsocial_posts': return fillArray(hexToBn(_id), postIds, postById)
    }
  })

  const subsocial = await createSubsocialConnect()

  const postsData = await subsocial.findPublicPostsWithAllDetails(postIds)

  const ownersData = await subsocial.findProfiles(ownerIds)

  const spacesData = await subsocial.findPublicSpaces(spaceIds)

  function fillMap<T extends AnySubsocialData | PostWithAllDetails> (
    data: T[],
    structByIdMap: Map<string, AnySubsocialData | PostWithAllDetails>,
    structName?: 'profile' | 'post'
  ) {
    data.forEach(x => {
      let id

      switch (structName) {
        case 'profile': {
          id = (x as ProfileData).profile?.created.account
          break
        }
        case 'post': {
          const struct = (x as PostWithAllDetails).post.struct
          id = struct.id
          break
        }
        default: {
          id = (x as SpaceData).struct.id
        }
      }

      if (id) {
        structByIdMap.set(id.toString(), x)
      }
    })
  }

  fillMap(postsData, postById, 'post'),
  fillMap(ownersData, ownerById, 'profile')
  fillMap(spacesData, spaceById)

  const getFromMaps = ({ _id, _index }: DataResults) => {
    switch (_index) {
      case 'subsocial_profiles': return ownerById.get(_id)
      case 'subsocial_spaces': return spaceById.get(hexToBn(_id).toString())
      case 'subsocial_posts': return postById.get(hexToBn(_id).toString())
    }

    return undefined
  }

  return results
    .map((item) => ({ index: item._index, id: item._id, data: getFromMaps(item)}))
    .filter(x => x.data !== undefined)
}

const log = newLogger(buildElasticSearchQuery.name)
