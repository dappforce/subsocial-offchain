import { newLogger, isEmptyArray } from '@subsocial/utils'
import { MAX_RESULTS_LIMIT } from '../express-api/utils'
import {
  ElasticIndex,
  ElasticIndexTypes,
  AllElasticIndexes,
  ElasticFields,
  ElasticQueryParams,
} from '@subsocial/types/offchain/search'

const log = newLogger('Elastic Reader')

const resoloveElasticIndexByType = (type: ElasticIndexTypes) =>
  ElasticIndex[type]

const resoloveElasticIndexes = (indexes: ElasticIndexTypes[]) =>
  indexes && indexes.includes('all')
    ? AllElasticIndexes
    : indexes?.map(resoloveElasticIndexByType)

export const buildElasticSearchQuery = (params: ElasticQueryParams) => {
  const indexes = resoloveElasticIndexes(params.indexes)
  const q = params.q || '*'
  const tags = params.tags || []
  const from = params.offset || 0
  const size = params.limit || MAX_RESULTS_LIMIT

  // TODO: support sorting of results

  const baseSearchProps = {
    index: indexes,
    from: from,
    size: size,
  }

  const tagFields = [
    ElasticFields.space.tags,
    ElasticFields.post.tags
  ]

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

  const isEmptyQuery = q === '*' || q.trim() === ''

  const searchQueryPart = isEmptyQuery
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
      fields: tagFields,
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

  log.debug('Final ElasticSearch query:', searchReq)

  return searchReq
}