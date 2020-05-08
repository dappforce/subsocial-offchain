import { CommonContent } from '@subsocial/types/offchain'
import { newLogger } from '@subsocial/utils'
import CircularJSON from 'circular-json'
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
      const clusterResponse = await this.ipfsClusterRequest('version')
      log.info('Connected to IPFS Cluster with version ', clusterResponse.body.version)
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
        options.formData = { '' : CircularJSON.stringify(data) }
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
    const { statusCode } = await this.ipfsClusterRequest('unpin', cid);
    if (statusCode !== 200) {
      throw Error(`Failed to unpin content with CID '${cid}'; Error ${statusCode}`)
    } else {
      log.info(`Unpinned content with CID: ${cid}`);
    }
  }

  async addContent (content: CommonContent): Promise<IpfsCid | undefined> {
    try {
      const res = await this.ipfsClusterRequest('add', content)
      if (res.statusCode !== 200) {
        throw Error(`Failed to add content to IPFS. Status message: ${res.statusMessage}`)
      }

      const body = JSON.parse(res.body)
      const cid = body.cid['/'] as IpfsCid
      log.debug('Content added under CID: %s', cid)

      return cid

    } catch (error) {
      log.error('Failed to add content to IPFS from server side: %o', error)
      return undefined;
    }
  }
}

const log = newLogger(IpfsClusterApi.name);
