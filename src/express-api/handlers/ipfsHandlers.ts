import * as express from 'express'
import { newLogger, nonEmptyStr } from '@subsocial/utils'
import { ipfs, ipfsCluster } from '../../connections/ipfs'
import { maxFileSizeBytes, maxFileSizeMB } from '../config'
import { asIpfsCid } from '@subsocial/api'

const log = newLogger('IPFS req handler')

export const addContent = async (req: express.Request, res: express.Response) => {
  console.log('req.body', req.body)
  const content = JSON.stringify(req.body)
  if (content.length > maxFileSizeBytes) {
    res.statusCode = 400
    res.json({ status: 'error', message: `Content should be less than ${maxFileSizeMB} MB` })
  } else {
    const cid = await ipfsCluster.addContent(content)
    log.debug('Content added to IPFS with CID:', cid)
    res.json(cid)
  }
}

const getContentResponse = async (res: express.Response, cids: string[]) => {
  try {
    const ipfsCids = (Array.isArray(cids) ? cids : [ cids ]).map(asIpfsCid)
    const contents = await ipfs.getContentArrayFromIpfs(ipfsCids)
    log.debug(`${contents.length} content items loaded from IPFS`)
    res.json(contents)
  } catch (err) {
    res.json(err)
  }
}

export const getContentAsGetRequest = async (req: express.Request, res: express.Response) =>
  getContentResponse(res, req.query.cids as string[])

export const getContentAsPostRequest = async (req: express.Request, res: express.Response) =>
  getContentResponse(res, req.body.cids)

export const addFile = async (req: express.Request, res: express.Response) => {
  console.log('req.file', req.file)
  if (req.file.size > maxFileSizeBytes) {
    res.statusCode = 400
    res.json({ status: 'error', message: `Uploaded file should be less than ${maxFileSizeMB} MB` })
  } else {
    const cid = await ipfsCluster.addFile(req.file);
    log.debug('File added to IPFS with CID:', cid);
    res.json(cid);
  }
}

/** Aka unpin */
export const deleteContent = async (req: express.Request, res: express.Response) => {
  const { cid } = req.params
  try {
    if (nonEmptyStr(cid)) {
      const result = await ipfsCluster.unpinContent(cid)
      log.debug('Content unpinned from IPFS by CID:', cid)
      res.json(result)
    } else {
      const msg = 'Cannot unpin content: No CID provided'
      log.warn(msg)
      res.status(400).json(msg)
    }
  } catch (err) {
    res.status(500).json(err)
  }
}
