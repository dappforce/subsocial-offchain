import * as express from 'express'
import { getOffsetFromRequest, getLimitFromRequest, HandlerFn, resolvePromiseAndReturnJson } from '../utils';
import { nonEmptyStr, nonEmptyArr } from '@subsocial/utils'
import { buildElasticSearchQuery, loadSubsocialDataByESIndex } from '../../search/reader'
import { ElasticIndexTypes } from '@subsocial/types/offchain/search'
import { elasticReader } from '../../connections/elastic'
import { elasticLog } from '../../connections/loggers'

const querySearch = async (req: express.Request, res: express.Response) => {
  const searchTerm = req.query['q']
  const indexes = req.query.indexes
  const tags = req.query.tags
  const indexesArray = nonEmptyStr(indexes) ? [indexes] : indexes
  const tagsArray = nonEmptyStr(tags) ? [tags] : tags

  const builderParams = {
    q: searchTerm ? searchTerm.toString() : null,
    limit: getLimitFromRequest(req),
    offset: getOffsetFromRequest(req),
    indexes: nonEmptyArr(indexesArray) ? (indexesArray as ElasticIndexTypes[]) : undefined,
    tagsFilter: nonEmptyArr(tagsArray) ? (tagsArray as string[]) : undefined,
  }
  const esQuery = buildElasticSearchQuery(builderParams)

  try {
    const result = await elasticReader.search(esQuery)
    return result
  } catch (reason) {
    elasticLog.warn('%s', reason.message)
    res.status(reason.statusCode).send(reason.meta)
  }

  return null
}

export const searchHandler: HandlerFn = async (req, res) => {
  const result = await querySearch(req, res)
  if (result) {
    const { body: { hits: { hits } } } = result
    return resolvePromiseAndReturnJson(res, loadSubsocialDataByESIndex(hits))
  }
}
