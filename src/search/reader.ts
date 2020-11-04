import { AnySubsocialData, PostWithAllDetails, ProfileData, SpaceData } from '@subsocial/types'
import { newLogger, isEmptyArray } from '@subsocial/utils'
import { MAX_RESULT_LIMIT } from '../express-api/utils'
import BN from 'bn.js'
import { hexToBn } from '@polkadot/util'
import { createSubsocialConnect } from '../connections/connect-subsocial'
import {
  ElasticIndex,
  ElasticIndexTypes,
  AllElasticIndexes,
  ElasticFields,
  EsQueryParams,
} from '@subsocial/types/offchain/search'

const resoloveElasticIndexByType = (type: ElasticIndexTypes) => ElasticIndex[type]

const resoloveElasticIndexes = (indexes: ElasticIndexTypes[]) =>
  indexes && indexes.includes('all') ? AllElasticIndexes : indexes?.map(resoloveElasticIndexByType)

export const buildElasticSearchQuery = (params: EsQueryParams) => {
  const from = params.offset || 0
  const size = params.limit || MAX_RESULT_LIMIT
  const q = params.q || '*'
  const indexes = resoloveElasticIndexes(params.indexes)
  const tags = params.tagsFilter || []

  // TODO: add sort

  const baseSearchProps = {
    index: indexes,
    from: from,
    size: size,
  }

  const tagFilterFields = [ElasticFields.space.tags, ElasticFields.post.tags]

  const searchFields = [
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
  ]

  const searchQueryPart =
    q === '*' || q.trim() === ''
      ? {
          match_all: {},
        }
      : {
          multi_match: {
            query: q,
            fields: searchFields,
          },
        }

  const tagFilterQueryPart = tags.map((tag) => ({
    multi_match: {
      query: tag,
      fields: tagFilterFields,
    },
  }))

  const searchBody = isEmptyArray(tagFilterQueryPart)
    ? searchQueryPart
    : {
        bool: {
          must: searchQueryPart,
          filter: [tagFilterQueryPart],
        },
      }

  const searchReq = {
    ...baseSearchProps,
    body: {
      query: searchBody,
    },
  }

  log.debug('Elastic request is: %o', searchReq)

  return searchReq
}

export type DataResults = {
  _id: string
  _index: string
}

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

export const loadSubsocialDataByESIndex = async (results: DataResults[]) => {
  const spaceById = new Map<string, SpaceData>()
  const postById = new Map<string, PostWithAllDetails>()
  const ownerById = new Map<string, ProfileData>()

  const ownerIds: string[] = []
  const spaceIds: BN[] = []
  const postIds: BN[] = []

  results.forEach(({ _id, _index }) => {
    switch (_index) {
      case ElasticIndex.profiles:
        return fillArray(_id, ownerIds, ownerById)
      case ElasticIndex.spaces:
        return fillArray(hexToBn(_id), spaceIds, spaceById)
      case ElasticIndex.posts:
        return fillArray(hexToBn(_id), postIds, postById)
    }
  })

  const subsocial = await createSubsocialConnect()

  const postsData = await subsocial.findPublicPostsWithAllDetails(postIds)

  const ownersData = await subsocial.findProfiles(ownerIds)

  const spacesData = await subsocial.findPublicSpaces(spaceIds)

  function fillMap<T extends AnySubsocialData | PostWithAllDetails>(
    data: T[],
    structByIdMap: Map<string, AnySubsocialData | PostWithAllDetails>,
    structName?: 'profile' | 'post'
  ) {
    data.forEach((x) => {
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

  fillMap(postsData, postById, 'post'), fillMap(ownersData, ownerById, 'profile')
  fillMap(spacesData, spaceById)

  const getFromMaps = ({ _id, _index }: DataResults) => {
    switch (_index) {
      case 'subsocial_profiles':
        return ownerById.get(_id)
      case 'subsocial_spaces':
        return spaceById.get(hexToBn(_id).toString())
      case 'subsocial_posts':
        return postById.get(hexToBn(_id).toString())
    }

    return undefined
  }

  return results
    .map((item) => ({ index: item._index, id: item._id, data: getFromMaps(item) }))
    .filter((x) => x.data !== undefined)
}

const log = newLogger(buildElasticSearchQuery.name)
