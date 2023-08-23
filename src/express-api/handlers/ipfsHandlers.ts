import * as express from 'express'
import { newLogger, nonEmptyStr } from '@subsocial/utils'
import { ipfsApi } from "../../ipfs";

const log = newLogger('IPFS req handler')

export const addContent = async (req: express.Request, res: express.Response) => {
  const cid = await ipfsApi.saveAndPinJson(req.body);
  log.debug('Content added to IPFS with CID:', cid)
  res.json(cid)
}

export const addRawData = async (req: express.Request, res: express.Response) => {
  const cid = await ipfsApi.saveAndPinFile(req.body);
  log.debug('Raw data added to IPFS with CID:', cid)
  res.json(cid)
}

export const addFile = async (req: express.Request, res: express.Response) => {
  const cid = await ipfsApi.saveAndPinFile(req.file.buffer);
  log.debug('File added to IPFS with CID:', cid);
  res.json(cid);
}

export const getData = async (req: express.Request, res: express.Response) => {
  const { cid } = req.params
  const data = await ipfsApi.ipfs.getContent(cid);
  if (data) {
    res.json(data);
  } else {
    res.status(400).json(`Content with CID ${cid} not found or isnt JSON`);
  }
}

/** Aka unpin */
export const deleteContent = async (req: express.Request, res: express.Response) => {
  const { cid } = req.params
  try {
    if (nonEmptyStr(cid)) {
      await ipfsApi.ipfs.unpinContent(cid)
      log.debug('Content unpinned from IPFS by CID:', cid)
      res.json(true)
    } else {
      const msg = 'Cannot unpin content: No CID provided'
      log.warn(msg)
      res.status(400).json(msg)
    }
  } catch (err) {
    res.status(500).json(err)
  }
}
