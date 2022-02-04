import { Router } from "express"
import createOffchainRoutes from "./offchain"
import createIpfsRoutes from "./ipfs"

export const createV1Routes = () => {
  const router = Router()

  router.use('/ipfs', createIpfsRoutes())
  router.use('/offchain', createOffchainRoutes())

  return router
}
