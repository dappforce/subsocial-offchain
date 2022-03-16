import { Router } from "express"
import createOffchainRoutes from "./offchain"
import createIpfsRoutes from "./ipfs"
import createHealthRoutes from "./health"

export const createV1Routes = () => {
  const router = Router()

  router.use('/ipfs', createIpfsRoutes())
  router.use('/offchain', createOffchainRoutes())
  router.use('/subscriber/health', createHealthRoutes())

  return router
}
