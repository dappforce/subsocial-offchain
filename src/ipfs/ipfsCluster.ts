import { CommonContent } from '@subsocial/types/offchain'
import { newLogger } from '@subsocial/utils'
import * as request from 'request-promise'

type IpfsCid = string
type IpfsUrl = string
type IpfsClusterEndpoint = 'version' | 'add' | 'unpin' | 'pin'
type IpfsNodeEndpoint = 'dag/put'

type IpfsEndpoint = IpfsClusterEndpoint | IpfsNodeEndpoint

type FileContent = Express.Multer.File

type Data = Record<string, object> | string

export type IpfsClusterProps = {
  ipfsClusterUrl: IpfsUrl,
  ipfsNodeUrl: IpfsUrl
}

export class IpfsClusterApi {

  private ipfsClusterUrl!: IpfsUrl // IPFS Cluster HTTP API
  private ipfsNodeUrl!: IpfsUrl // IPFS Node HTTP API

  constructor (props: IpfsClusterProps) {
    const { ipfsClusterUrl, ipfsNodeUrl } = props;
    this.ipfsClusterUrl = ipfsClusterUrl
    this.ipfsNodeUrl = `${ipfsNodeUrl}/api/v0`
    console.log('this.ipfsNodeUrl', this.ipfsNodeUrl)
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

  private async ipfsRequest(
    url: IpfsUrl,
    endpoint: IpfsEndpoint,
    data?: IpfsCid | Data
  ): Promise<request.RequestPromise> {

    const options: request.Options = {
      url: `${url}/${endpoint}`
    };

    switch (endpoint) {
      case 'add': {
        options.method = 'POST'
        options.formData = { '': data }
  
        break
      }
      case 'dag/put': {
        options.method = 'POST'
        options.formData = { '': data }
  
        break
      }
      case 'unpin': {
        options.method = 'DELETE'
        options.url = `${this.ipfsClusterUrl}/pins/${data}`
        break
      }
      case 'pin': {
        options.method = 'POST'
        options.url = `${this.ipfsClusterUrl}/pins/${data}`
        break
      }
      case 'version': {
        options.method = 'GET'
        break
      }
      default: {
        throw Error(`Unsupported endpoint received: ${endpoint}`)
      }
    }

    return request(options)
  }

  private ipfsClusterRequest = (
    endpoint: IpfsClusterEndpoint,
    data?: IpfsCid | Data
  ): Promise<request.RequestPromise> => this.ipfsRequest(this.ipfsClusterUrl, endpoint, data)

  private ipfsNodeRequset = (
    endpoint: IpfsNodeEndpoint,
    data?: IpfsCid | Data
  ): Promise<request.RequestPromise> => this.ipfsRequest(this.ipfsNodeUrl, endpoint, data)

  async unpinContent (cid: IpfsCid) {
    try {
      await this.ipfsClusterRequest('unpin', cid);
      log.debug(`Unpinned content with CID: ${cid}`);
    } catch (err) {
      log.error(`Failed to unpin content with CID '${cid}'. Error: %o`, err)
    }
  }

  async add (data: Data) {
    try {
      const res = await this.ipfsNodeRequset('dag/put', data)
      const body = JSON.parse(res)
      const cid = body.Cid['/'] as IpfsCid
      this.ipfsClusterRequest('pin', cid)
      log.debug('Content added under CID: %s', cid)
      return cid
    } catch (err) {
      log.error('Failed to add content to IPFS: %o', err)
      return undefined;
    }
  }

  async addFile (file: FileContent) {
    const data = { value: file.buffer,
      options: { filename: file.originalname, contentType: file.mimetype }
    }
    return this.add(data)
  }

  async addContent (content: CommonContent): Promise<IpfsCid | undefined> {
    console.log('Start add')
    return this.add(JSON.stringify(content))
  }

}

const log = newLogger(IpfsClusterApi.name);
