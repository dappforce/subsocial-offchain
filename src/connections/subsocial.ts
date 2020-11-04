import { SubsocialIpfsApi } from '@subsocial/api/ipfs'
import { SubsocialApi } from '@subsocial/api/subsocial'
import { SubsocialSubstrateApi } from '@subsocial/api/substrate'
import { Api } from '@subsocial/api/substrateConnect'
import { ipfsConfig } from './ipfs'

export let subsocial: SubsocialApi
export let substrate: SubsocialSubstrateApi
export let ipfs: SubsocialIpfsApi

export const createSubsocialApi = async () => {
  // Connect to Subsocial's Substrate node:
  if (!subsocial) {
    const api = await Api.connect(process.env.SUBSTRATE_URL)
    subsocial = new SubsocialApi({
      substrateApi: api,
      ...ipfsConfig
    })

    substrate = subsocial.substrate
    ipfs = subsocial.ipfs
  }

  return subsocial
}
