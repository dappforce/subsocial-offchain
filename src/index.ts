import { resolveSubsocialApi } from "./connections"
import { startHttpServer } from "./express-api/server"
import { startSubstrateSubscriberWithWebSockets } from "./substrate/subscribe"

const startOffchainServices = async () => {
  const { substrate } = await resolveSubsocialApi()
  startHttpServer()
  startSubstrateSubscriberWithWebSockets(substrate)
}

startOffchainServices()