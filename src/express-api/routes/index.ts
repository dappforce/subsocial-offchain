import { Router } from "express"
import createIpfsRoutes from "./ipfs"
import createHealthRoutes from "./health"

export const createV1Routes = () => {
  const router = Router()

  router.use('/ipfs', createIpfsRoutes())
  router.use('/health', createHealthRoutes())

  return router
}
