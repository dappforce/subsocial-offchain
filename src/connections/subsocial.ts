import { SubsocialApi } from '@subsocial/api'
import { ipfsConfig } from './ipfs'
// import { getSubstrateApi } from '@subsocial/api'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { substrateNodeUrl } from '../env'
let subsocial: SubsocialApi
let api: ApiPromise
/**
 * Create a new or return existing connection to Subsocial API
 * (includes Substrate and IPFS connections).
 */

type Api = SubsocialApi & {
  api: ApiPromise
}

export const resolveSubsocialApi = async (): Promise<Api> => {
  // Connect to Subsocial's Substrate node:
  if (!subsocial) {
    api = await new ApiPromise({ provider: new WsProvider(substrateNodeUrl) }).isReady
    
    subsocial = new SubsocialApi({
      substrateApi: api,
      ...ipfsConfig
    });

    (subsocial as any).api = api

  }

  return subsocial as unknown as Api
}
