import { Router } from "express"
import createIpfsRoutes from "./ipfs"
import createHealthRoutes from "./health"
import createOffchainRoutes from "./offchain"

export const createV1Routes = () => {
  const router = Router()

  router.use('/ipfs', createIpfsRoutes())
  router.use('/health', createHealthRoutes())
  router.use('/offchain', createOffchainRoutes())

  return router
}
