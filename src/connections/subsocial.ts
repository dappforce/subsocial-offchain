import { SubsocialIpfsApi } from '@subsocial/api/ipfs'
import { SubsocialApi } from '@subsocial/api/subsocial'
import { SubsocialSubstrateApi } from '@subsocial/api/substrate'
import { Api } from '@subsocial/api/substrateConnect'
import { ipfsConfig } from './ipfs'
import registry from '@subsocial/types/substrate/registry';

export let subsocial: SubsocialApi
export let substrate: SubsocialSubstrateApi
export let ipfs: SubsocialIpfsApi

/**
 * Create a new or return existing connection to Subsocial API
 * (includes Substrate and IPFS connections).
 */
export const resolveSubsocialApi = async () => {
  // Connect to Subsocial's Substrate node:

  if (!subsocial) {
    const api = await Api.connect(process.env.SUBSTRATE_URL)
    const properties = await api.rpc.system.properties()

    registry.setChainProperties(properties)
    subsocial = new SubsocialApi({
      substrateApi: api,
      ...ipfsConfig
    })

    substrate = subsocial.substrate
    ipfs = subsocial.ipfs
  }

  return subsocial
}
