import { CommonContent } from '@subsocial/types/offchain'
import { newLogger } from '@subsocial/utils'
import * as request from 'request-promise'

type IpfsCid = string
type IpfsUrl = string
type IpfsClusterEndpoint = 'version' | 'add' | 'unpin'

export type IpfsClusterProps = {
  ipfsClusterUrl: IpfsUrl
}

export class IpfsClusterApi {

  private ipfsClusterUrl!: IpfsUrl // IPFS Cluster HTTP API

  constructor (props: IpfsClusterProps) {
    const { ipfsClusterUrl } = props;
    this.ipfsClusterUrl = ipfsClusterUrl
    this.testConnection()
  }

  private async testConnection () {
    try {
      // Test IPFS Cluster connection by requesting its version
      const res = await this.ipfsClusterRequest('version')
      const { version } = JSON.parse(res) || {}
      log.info('Connected to IPFS Cluster with version: %s', version)
    } catch (err) {
      log.error('Failed to connect to IPFS cluster: %o', err)
    }
  }

  private async ipfsClusterRequest(
    endpoint: IpfsClusterEndpoint,
    data?: CommonContent | IpfsCid
  ): Promise<request.RequestPromise> {

    const options: request.Options = {
      url: `${this.ipfsClusterUrl}/${endpoint}`
    };

    switch (endpoint) {
      case 'add': {
        options.method = 'POST'
        options.formData = { '': JSON.stringify(data) }
        break
      }
      case 'unpin': {
        options.method = 'DELETE'
        options.url = `${this.ipfsClusterUrl}/pins/${data}`
        break
      }
      case 'version': {
        options.method = 'GET'
        break
      }
      default: {
        throw Error(`Unsupported endpoint recieved: ${endpoint}`)
      }
    }

    return request(options)
  }

  async unpinContent (cid: IpfsCid) {
    try {
      await this.ipfsClusterRequest('unpin', cid);
      log.debug(`Unpinned content with CID: ${cid}`);
    } catch (err) {
      log.error(`Failed to unpin content with CID '${cid}'. Error: %o`, err)
    }
  }

  async addContent (content: CommonContent): Promise<IpfsCid | undefined> {
    try {
      const res = await this.ipfsClusterRequest('add', content)
      const body = JSON.parse(res)
      const cid = body.cid['/'] as IpfsCid
      log.debug('Content added under CID: %s', cid)
      return cid
    } catch (err) {
      log.error('Failed to add content to IPFS: %o', err)
      return undefined;
    }
  }
}

const log = newLogger(IpfsClusterApi.name);
