import { Router } from 'express'
import * as esReqHandlers from '../../handlers/esHandlers'

export const createOffchainRoutes = () => {
  const router = Router()
  // API endpoints for querying search results from Elasticsearch engine
  // TODO: get suggestions for search
  router.get('/search', esReqHandlers.searchHandler)

  return router
}

export default createOffchainRoutes