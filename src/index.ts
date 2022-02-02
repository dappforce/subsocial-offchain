import { resolveSubsocialApi } from "./connections"
import { startHttpServer } from "./express-api/server"
import { startSubstrateSubscriberWithWebSockets } from "./substrate/subscribe"

const startOffchainServices = async () => {
  const { substrate } = await resolveSubsocialApi()
  await startHttpServer()
  await startSubstrateSubscriberWithWebSockets(substrate)
}

startOffchainServices()