import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cors from 'cors';
import { ipfsCluster } from '../connections/connect-ipfs';
import { pg } from '../connections/connect-postgres';
import { logSuccess, logError } from '../postgres/postges-logger';
import { nonEmptyStr } from '@subsocial/utils';
import parseSitePreview from '../parser/parse-preview'
import { informClientAboutUnreadNotifications } from './events';
// import { startNotificationsServer } from './ws'
import * as multer from 'multer';
import * as pgReqHandlers from './handlers/pgHandlers';
import * as esReqHandlers from './handlers/esHandlers'
import { offchainApiLog as log } from '../connections/loggers';

require('dotenv').config()

const app = express()
const allowedOrigin = process.env.CORS_ALLOWED_ORIGIN || 'http://localhost'

app.use(cors((req, callback) => {
  const origin = req.method === 'GET' ? '*' : allowedOrigin
  callback(null, { origin })
}))

const MB = 1024 ** 2

const maxFileSizeBytes = parseInt(process.env.IPFS_MAX_FILE_SIZE_BYTES) || 2 * MB

const maxFileSizeMB = maxFileSizeBytes / MB

// for parsing application/json
app.use(bodyParser.json({ limit: maxFileSizeBytes }))

// for parsing application/xwww-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true, limit: maxFileSizeBytes }))

// for parsing multipart/form-data
const upload = multer({ limits: { fieldSize: maxFileSizeBytes }})
app.use(express.static('public'))

// IPFS API

app.post('/v1/ipfs/add', async (req: express.Request, res: express.Response) => {
  const content = JSON.stringify(req.body)
  if (content.length > maxFileSizeBytes) {
    res.statusCode = 400
    res.json({ status: 'error', message: `Content should be less than ${maxFileSizeMB} MB` })
  } else {
    const cid = await ipfsCluster.addContent(content)
    log.info('Content added to IPFS with CID:', cid)
    res.json(cid)
  }
})

// Uncomment the next line to add support for multi-file upload:
// app.use(upload.array())

app.post('/v1/ipfs/addFile', upload.single('file'), async (req: express.Request, res: express.Response) => {
  if (req.file.size > maxFileSizeBytes) {
    res.statusCode = 400
    res.json({ status: 'error', message: `Uploaded file should be less than ${maxFileSizeMB} MB` })
  } else {
    const cid = await ipfsCluster.addFile(req.file);
    log.info('File added to IPFS with CID:', cid);
    res.json(cid);
  }
})

app.delete('/v1/ipfs/pins/:cid', async (req: express.Request, res: express.Response) => {
  const { cid } = req.params
  if (nonEmptyStr(cid)) {
    await ipfsCluster.unpinContent(cid)
    log.info('Content unpinned from IPFS by CID:', cid)
  } else {
    log.warn('Cannot unpin content: No CID provided ')
    // TODO. because of request will idle here, change to:
    //  - res.status(400).json('Bad Request')
    res.statusCode = 400
    res.statusMessage = 'Bad Request'
  }
})

// API endpoints for querying search results from Elasticsearch engine

// TODO: get suggestions for search
app.get('/v1/offchain/search', esReqHandlers.searchHandler)

// API endpoints for personal user feed, notifications and all types of activities.

app.get('/v1/offchain/feed/:id', pgReqHandlers.feedHandler);
app.get('/v1/offchain/feed/:id/count', pgReqHandlers.feedCountHandler)

app.get('/v1/offchain/notifications/:id', pgReqHandlers.notificationsHandler);
app.get('/v1/offchain/notifications/:id/count', pgReqHandlers.notificationsCountHandler)

app.get('/v1/offchain/activities/:id', pgReqHandlers.activitiesHandler)
app.get('/v1/offchain/activities/:id/count', pgReqHandlers.activitiesCountHandler)

app.get('/v1/offchain/activities/:id/comments', pgReqHandlers.commentActivitiesHandler)
app.get('/v1/offchain/activities/:id/comments/count', pgReqHandlers.commentActivitiesCountHandler)

app.get('/v1/offchain/activities/:id/posts', pgReqHandlers.postActivitiesHandler)
app.get('/v1/offchain/activities/:id/posts/count', pgReqHandlers.postActivitiesCountHandler)

app.get('/v1/offchain/activities/:id/follows', pgReqHandlers.followActivitiesHandler)
app.get('/v1/offchain/activities/:id/follows/count', pgReqHandlers.followActivitiesCountHandler)

app.get('/v1/offchain/activities/:id/reactions', pgReqHandlers.reactionActivitiesHandler)
app.get('/v1/offchain/activities/:id/reactions/count', pgReqHandlers.reactionActivitiesCountHandler)

app.get('/v1/offchain/activities/:id/spaces', pgReqHandlers.spaceActivitiesHandler)
app.get('/v1/offchain/activities/:id/spaces/count', pgReqHandlers.spaceActivitiesCountHandler)

app.get('/v1/offchain/activities/:id/counts', pgReqHandlers.activityCountsHandler)

app.post('/v1/offchain/notifications/:id/readAll', async (req: express.Request, res: express.Response) => {
  const account = req.params.id;
  log.info(`Mark all notifications as read by account: ${account}`)

  const query = `
    UPDATE df.notifications_counter
    SET
      unread_count = 0,
      last_read_activity_id = (
        SELECT MAX(activity_id) FROM df.notifications
        WHERE account = $1
      )
    WHERE account = $1`

  try {
    const data = await pg.query(query, [ account ])
    informClientAboutUnreadNotifications(account, 0);
    logSuccess('mark all notifications as read', `by account: ${account}`)
    res.json(data.rows);
  } catch (err) {
    logError('mark all notifications as read', `by account: ${account}`, err.stack);
  }
})

// TODO Rename to '/v1/parseSite'
app.post('/offchain/parser/', async (req: express.Request, res: express.Response) => {
  const data = await parseSitePreview(req.body.url)
  res.send(data);
})

// startNotificationsServer()

const port = process.env.OFFCHAIN_SERVER_PORT
app.listen(port, () => {
  log.info(`HTTP server started on port ${port}`)
})
