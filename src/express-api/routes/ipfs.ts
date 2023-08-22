import { Router } from 'express'
import multer from 'multer'
import * as ipfsReqHandlers from '../handlers/ipfsHandlers'
import { maxFileSizeBytes } from '../config'

const upload = multer({ limits: { fieldSize: maxFileSizeBytes } })

const createIpfsRoutes = () => {
  const router = Router()

  // IPFS API
  router.post('/addFile', upload.single('file'), ipfsReqHandlers.addFile)
  router.post('/save', ipfsReqHandlers.saveData)

  router.post('/add', ipfsReqHandlers.addContent)
  router.delete('/pins/:cid', ipfsReqHandlers.deleteContent)

  return router
}

export default createIpfsRoutes