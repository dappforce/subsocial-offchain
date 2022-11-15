import * as express from 'express'
import { getOffsetFromRequest, getLimitFromRequest, HandlerFn, OkOrError } from '../utils'
import { nonEmptyStr, nonEmptyArr } from '@subsocial/utils'
import { buildElasticSearchQuery } from '../../search/reader'
import { elasticReader } from '../../connections/elastic'
import { elasticLog } from '../../connections/loggers'
import { ElasticQueryParams } from '@subsocial/api/types'

function toArray<T extends string>(maybeArr: T | Array<T>): Array<T> {
  if (nonEmptyArr(maybeArr)) {
    return maybeArr
  } else if (nonEmptyStr(maybeArr)) {
    return [maybeArr]
  } else {
    return undefined
  }
}

export type ElasticQueryParamsWithSpaceId = ElasticQueryParams & {
  spaceId?: string
}

function reqToElasticQueryParams(req: express.Request): ElasticQueryParamsWithSpaceId {
  const { indexes, q, tags, spaceId } = req.query as unknown as ElasticQueryParamsWithSpaceId

  return {
    indexes: toArray(indexes),
    spaceId,
    q: q ? q.toString() : null,
    tags: toArray(tags),
    offset: getOffsetFromRequest(req),
    limit: getLimitFromRequest(req)
  }
}

export const queryElastic = async (esParams: ElasticQueryParamsWithSpaceId): Promise<OkOrError<any>> => {
  try {
    const esQuery = buildElasticSearchQuery(esParams)

    const result = await elasticReader.search(esQuery)
    if (result) {
      const {
        body: {
          hits: { hits }
        }
      } = result
      
      return { ok: true, data: hits }
    }
  } catch (err) {

    elasticLog.warn('Failed to query ElasticSearch:', err.message)
    return { ok: false, data: err }
    // res.status(err.statusCode).send(err.meta)
  }
  return null
}

export const searchHandler: HandlerFn = async (req, res) => {
  const esParams = reqToElasticQueryParams(req)

  const { ok, data } = await queryElastic(esParams)

  if (ok) {
    res.json(data || [])
  } else {
    res.status(data.statusCode).send(data.meta)
  }
}
