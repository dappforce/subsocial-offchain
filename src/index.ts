import { startHttpServer } from "./express-api/server"

import '@subsocial/definitions/interfaces/augment-api-query'
import '@subsocial/definitions/interfaces/augment-api-events'
import '@subsocial/definitions/interfaces/augment-api-tx'
import '@subsocial/definitions/interfaces/augment-api-consts'

const startOffchainServices = async () => {
  await startHttpServer()
}

startOffchainServices()