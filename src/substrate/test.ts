import { getSubstrateApi } from '@subsocial/api'

/**
 * Create a new or return existing connection to Subsocial API
 * (includes Substrate and IPFS connections).
 */
export const main = async () => {
  // Connect to Subsocial's Substrate node:
  const api = await getSubstrateApi('wss://arch.subsocial.network')

  const blockHash = await api.rpc.chain.getBlockHash(7987845)

  const events = await (await api.at(blockHash)).query.system.events()

  const event = events[1]

  console.log('spaceId', event.event.data.toHuman())

  const space = await api.query.posts.postById(event.event.data[1].toString())

  console.log('space', space.toHuman())

  process.exit(0)
}

main()