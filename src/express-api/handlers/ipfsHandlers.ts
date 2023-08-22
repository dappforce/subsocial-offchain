import * as express from 'express'
import { newLogger, nonEmptyStr } from '@subsocial/utils'
import { ipfsCluster } from '../../connections/ipfs'
import { maxFileSizeBytes, maxFileSizeMB } from '../config'

const log = newLogger('IPFS req handler')

export const addContent = async (req: express.Request, res: express.Response) => {
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

export const saveData = async (req: express.Request, res: express.Response) => {
  const cid = await ipfsCluster.saveData(req.body)
  log.debug('Content added to IPFS with CID:', cid)
  res.json(cid)
}

export const addFile = async (req: express.Request, res: express.Response) => {
  if (req.file.size > maxFileSizeBytes) {
    res.statusCode = 400
    res.json({ status: 'error', message: `Uploaded file should be less than ${maxFileSizeMB} MB` })
  } else {
    const cid = await ipfsCluster.addFile(req.file);
    log.debug('File added to IPFS with CID:', cid);
    res.send(cid);
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
