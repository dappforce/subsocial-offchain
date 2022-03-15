import { newLogger } from '@subsocial/utils'
import request from 'request-promise'

type IpfsCid = string
type IpfsUrl = string

type IpfsClusterEndpoint = 'version' | 'add' | 'pin' | 'unpin'
type IpfsNodeEndpoint = 'dag/put'
type IpfsEndpoint = IpfsClusterEndpoint | IpfsNodeEndpoint

type FileContent = Express.Multer.File

type Data = Record<string, object> | string

export type IpfsClusterProps = {
  ipfsClusterUrl: IpfsUrl
  ipfsNodeUrl: IpfsUrl
}

export class IpfsClusterApi {

  private ipfsClusterUrl!: IpfsUrl // IPFS cluster HTTP API
  private ipfsNodeUrl!: IpfsUrl    // IPFS node HTTP API

  constructor (props: IpfsClusterProps) {
    const { ipfsClusterUrl, ipfsNodeUrl } = props
    this.ipfsClusterUrl = ipfsClusterUrl
    this.ipfsNodeUrl = `${ipfsNodeUrl}/api/v0`
    this.testConnection()
  }

  /** Test IPFS cluster connection by requesting its version. */
  private async testConnection () {
    try {
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
    }

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
      case 'pin': {
        options.method = 'POST'
        options.url = `${this.ipfsClusterUrl}/pins/${data}`
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
        throw Error(`Unsupported endpoint received: ${endpoint}`)
      }
    }

    return request(options)
  }

  private ipfsClusterRequest = (
    endpoint: IpfsClusterEndpoint,
    data?: Data
  ): Promise<request.RequestPromise> => this.ipfsRequest(this.ipfsClusterUrl, endpoint, data)

  private ipfsNodeRequest = (
    endpoint: IpfsNodeEndpoint,
    data?: Data
  ): Promise<request.RequestPromise> => this.ipfsRequest(this.ipfsNodeUrl, endpoint, data)

  /** Make a request to IPFS and pin a returned CID via IPFS cluster on success. */
  private async makeRequestAndPinCid (ipfsRequest: Promise<any>) {
    try {
      const res = await ipfsRequest
      const body = JSON.parse(res)
      const cidObj = body.Cid || body.cid
      const cid = cidObj['/'] as IpfsCid
      this.ipfsClusterRequest('pin', cid)
      log.debug('Content added and pinned under CID: %s', cid)
      return cid
    } catch (err) {
      log.error('Failed to add content to IPFS: %o', err)
      return undefined
    }
  }

  /** Add a file to IPFS via `/add` and pin it via IPFS cluster. */
  async addFile (file: FileContent) {
    const data = {
      value: file.buffer,
      options: { filename: file.originalname, contentType: file.mimetype }
    }
    return this.makeRequestAndPinCid(this.ipfsClusterRequest('add', data))
  }

  /** Add a JSON object to IPFS via `/dag/put` and pin it via IPFS cluster. */
  async addContent (content: string): Promise<IpfsCid | undefined> {
    return this.makeRequestAndPinCid(this.ipfsNodeRequest('dag/put', content))
  }

  /** Delete a content from IPFS by unpinning it via IPFS cluster. */
  async unpinContent (cid: IpfsCid) {
    try {
      const res = await this.ipfsClusterRequest('unpin', cid)
      log.debug(`Unpinned content with CID: ${cid}`)
      return res
    } catch (err) {
      log.error(`Failed to unpin content with CID '${cid}'. Error: %o`, err)
    }
  }
}

const log = newLogger(IpfsClusterApi.name)
