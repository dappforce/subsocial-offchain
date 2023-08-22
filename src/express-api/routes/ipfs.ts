import { Router } from 'express'
import * as ipfsReqHandlers from '../handlers/ipfsHandlers'
import { maxFileSizeBytes } from '../config'
import multer from "multer";

const upload = multer({ limits: { fieldSize: maxFileSizeBytes } })

const createIpfsRoutes = () => {
  const router = Router()

  // IPFS API
  router.post('/addFile', upload.single('file'), ipfsReqHandlers.addFile)

  router.post('/add', ipfsReqHandlers.addContent)
  router.post('/save', ipfsReqHandlers.saveData)
  // router.get('/get', ipfsReqHandlers.getContentAsGetRequest)
  // router.post('/get', ipfsReqHandlers.getContentAsPostRequest)
  router.delete('/pins/:cid', ipfsReqHandlers.deleteContent)

  return router
}

export default createIpfsRoutes