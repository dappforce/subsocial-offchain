import { resolveSubsocialApi } from "./connections"
import { startHttpServer } from "./express-api/server"
import { startSubstrateSubscriberWithWebSockets } from "./substrate/subscribe"

import '@subsocial/definitions/interfaces/augment-api-query'
import '@subsocial/definitions/interfaces/augment-api-events'
import '@subsocial/definitions/interfaces/augment-api-tx'
import '@subsocial/definitions/interfaces/augment-api-consts'

const startOffchainServices = async () => {
  const { substrate } = await resolveSubsocialApi()
  await startHttpServer()
  await startSubstrateSubscriberWithWebSockets(substrate)
}

startOffchainServices()