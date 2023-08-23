import { Router } from 'express'
import * as ipfsReqHandlers from '../handlers/ipfsHandlers'
import { maxFileSizeBytes } from '../config'
import multer from "multer";
import bodyParser from "body-parser";

const upload = multer({ limits: { fieldSize: maxFileSizeBytes } })

const parserOptions = { inflate: true, type: () => true, limit: maxFileSizeBytes }

const createIpfsRoutes = () => {
  const router = Router()

  // IPFS API
  router.get('/:cid', ipfsReqHandlers.getData)
  router.post('/addFile', upload.single('file'), ipfsReqHandlers.addFile)
  router.post('/add', bodyParser.json(parserOptions), ipfsReqHandlers.addContent)
  router.post('/addRaw', bodyParser.raw(parserOptions), ipfsReqHandlers.addRawData)
  router.delete('/pins/:cid', ipfsReqHandlers.deleteContent)

  return router
}

export default createIpfsRoutes