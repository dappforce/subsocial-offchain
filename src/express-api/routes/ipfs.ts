import { Router } from 'express'
import multer from 'multer'
import * as ipfsReqHandlers from '../handlers/ipfsHandlers'
import { maxFileSizeBytes } from '../config'

const upload = multer({ limits: { fieldSize: maxFileSizeBytes } })
// Uncomment the next line to add support for multi-file upload:
// app.use(upload.array())

// const getV1 = (url: string) => `/v1/${url}`
// const getV1Offchain = (url: string) => `/offchain${url}`

const createIpfsRoutes = () => {
  const router = Router()

  // IPFS API
  router.post('/addFile', upload.single('file'), ipfsReqHandlers.addFile)

  router.post('/add', ipfsReqHandlers.addContent)
  router.get('/get', ipfsReqHandlers.getContentAsGetRequest)
  router.post('/get', ipfsReqHandlers.getContentAsPostRequest)
  router.delete('/pins/:cid', ipfsReqHandlers.deleteContent)

  return router
}

export default createIpfsRoutes