
import { PalletName } from '@subsocial/types'
import { newLogger } from '@subsocial/utils'
import axios from 'axios'
import { AccountId, PostId, SpaceId } from '@subsocial/types/dto'
import { substrateRpcUrl } from '../env'
import { getFirstOrUndefined } from '@subsocial/utils'

type SubstrateApiProps = {
  rpcUrl: string
}

type PostsRpcMethods =
  | 'getPostsByIds'

type SpacesRpcMethods =
  | 'getSpacesByIds'

type ProfilesRpcMethods =
  | 'getSocialAccountsByIds'

type RpcParams = any[]

type StorageItem = {
  moduleName: PalletName
  method: string
}

type RpcResult = {
  result: any
}

const createRpcJson = ({ moduleName, method }: StorageItem, params: RpcParams) => ({
  jsonrpc: '2.0',
  id: 1,
  method: `${moduleName}_${method}`,
  params
})

const log = newLogger('SubsocialSubstrateRpc')

export class SubsocialSubstrateRpc {

  private rpcUrl: string // Polkadot API (connected)
  // private context?: SubsocialContextProps TODO use when need

  constructor ({ rpcUrl }: SubstrateApiProps) {
    this.rpcUrl = rpcUrl
    // this.context = context
    log.info('Initialized')
  }

  // ---------------------------------------------------------------------
  // Private utils

  private async rpcQuery <Params, Result = any> (method: StorageItem, value?: Params): Promise<Result | undefined> {
    try {
      const params = Array.isArray(value) ? value : [ value ]
      const { data, status, statusText } = await axios.post<RpcResult>(
        this.rpcUrl,
        createRpcJson(method, [ null, ...params ]),
        { headers: { 'Content-Type': 'application/json' } }
      )

      if (status !== 200) {
        throw statusText
      }

      return data.result
    } catch (err) {
      log.error('Failed rpc method:', err)
      return undefined
    }
  }

  private async queryPosts (method: PostsRpcMethods, value?: any): Promise<any> {
    return this.rpcQuery({ moduleName: 'posts', method }, value)
  }

  private async querySpaces (method: SpacesRpcMethods, value?: any): Promise<any> {
    return this.rpcQuery({ moduleName: 'spaces', method }, value)
  }

  private async queryProfiles (method: ProfilesRpcMethods, value?: any): Promise<any> {
    return this.rpcQuery({ moduleName: 'profiles', method }, value)
  }

  async getPostById (id: PostId): Promise<any> {
    return getFirstOrUndefined(await this.queryPosts('getPostsByIds', [ [ parseInt(id) ], 0, 1 ]))
  }

  async getSpaceById (id: SpaceId): Promise<any> {
    return getFirstOrUndefined(await this.querySpaces('getSpacesByIds', [ [ parseInt(id) ] ]))
  }

  async getSocialAccountById (id: AccountId): Promise<any> {
    return getFirstOrUndefined(await this.queryProfiles('getSocialAccountsByIds', [ [ id ] ]))
  }

}

export const rpcApi = new SubsocialSubstrateRpc({ rpcUrl: substrateRpcUrl })