import * as express from 'express'
import { getOffsetFromRequest, getLimitFromRequest, HandlerFn } from '../utils'
import { nonEmptyStr, nonEmptyArr } from '@subsocial/utils'
import { buildElasticSearchQuery } from '../../search/reader'
import { ElasticQueryParams } from '@subsocial/types/offchain/search'
import { elasticReader } from '../../connections/elastic'
import { elasticLog } from '../../connections/loggers'

function toArray<T extends string>(maybeArr: T | Array<T>): Array<T> {
  if (nonEmptyArr(maybeArr)) {
    return maybeArr
  } else if (nonEmptyStr(maybeArr)) {
    return [ maybeArr ]
  } else {
    return undefined
  }
}

function reqToElasticQueryParams(req: express.Request): ElasticQueryParams {
  const { indexes, q, tags } = req.query as ElasticQueryParams

  return {
    indexes: toArray(indexes),
    q: q ? q.toString() : null,
    tags: toArray(tags),
    offset: getOffsetFromRequest(req),
    limit: getLimitFromRequest(req),
  }
}

const queryElastic = async (req: express.Request, res: express.Response) => {
  try {
    const esParams = reqToElasticQueryParams(req)
    const esQuery = buildElasticSearchQuery(esParams)
    const result = await elasticReader.search(esQuery)
    if (result) {
      const { body: { hits: { hits } } } = result
      return hits
    }
  } catch (err) {
    elasticLog.warn('Failed to query ElasticSearch:', err.message)
    res.status(err.statusCode).send(err.meta)
  }
  return null
}

export const searchHandler: HandlerFn = async (req, res) => {
  const searchResults = await queryElastic(req, res)
  res.json(searchResults || [])
}
