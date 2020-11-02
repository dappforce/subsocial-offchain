import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cors from 'cors';
import { ipfsCluster } from '../connections/connect-ipfs';
import { pg } from '../connections/connect-postgres';
import { logSuccess, logError } from '../postgres/postges-logger';
import { newLogger, nonEmptyArr, nonEmptyStr } from '@subsocial/utils';
import { elasticLog } from '../connections/loggers';
import parseSitePreview from '../parser/parse-preview'
import { informClientAboutUnreadNotifications } from './events';
// import { startNotificationsServer } from './ws'
import * as multer from 'multer';
import * as reqHandlers from './handlers';
import { getLimitFromRequest, getOffsetFromRequest } from './utils';
import { elasticReader } from '../connections/connect-elasticsearch';
import { buildElasticSearchQuery, ElasticIndexTypes, loadSubsocialData } from '../search/reader';

require('dotenv').config()

const log = newLogger('ExpressOffchainApi')
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

// ElasticSearch API

const requestDataFromElastic = async (req: express.Request, res: express.Response) => {
  const searchTerm = req.query['q']
  const indexes = req.query.indexes
  const indexesArray = nonEmptyStr(indexes) ? [ indexes ] : indexes

  const builderParams = {
    q: searchTerm ? searchTerm.toString() : null,
    limit: getLimitFromRequest(req),
    offset: getOffsetFromRequest(req),
    indexes: nonEmptyArr(indexesArray) ? indexesArray as ElasticIndexTypes[] : undefined,
  }
  const esQuery = buildElasticSearchQuery(builderParams)

  try {
    return elasticReader.search(esQuery)
  } catch (reason) {
    elasticLog.warn('%s. Meta: %o', reason.message, reason.meta)
    res.status(reason.statusCode).json(reason)
    return null
  }
}

// TODO: get suggestions for search

app.get('/v1/offchain/search', async (req: express.Request, res: express.Response) => {
  const { body: { hits: { hits } } } = await requestDataFromElastic(req, res)
  const data = await loadSubsocialData(hits)
  res.json(data)
})

// API endpoints for personal user feed, notifications and all types of activities.

app.get('/v1/offchain/feed/:id', reqHandlers.feedHandler);
app.get('/v1/offchain/feed/:id/count', reqHandlers.feedCountHandler)

app.get('/v1/offchain/notifications/:id', reqHandlers.notificationsHandler);
app.get('/v1/offchain/notifications/:id/count', reqHandlers.notificationsCountHandler)

app.get('/v1/offchain/activities/:id', reqHandlers.activitiesHandler)
app.get('/v1/offchain/activities/:id/count', reqHandlers.activitiesCountHandler)

app.get('/v1/offchain/activities/:id/comments', reqHandlers.commentActivitiesHandler)
app.get('/v1/offchain/activities/:id/comments/count', reqHandlers.commentActivitiesCountHandler)

app.get('/v1/offchain/activities/:id/posts', reqHandlers.postActivitiesHandler)
app.get('/v1/offchain/activities/:id/posts/count', reqHandlers.postActivitiesCountHandler)

app.get('/v1/offchain/activities/:id/follows', reqHandlers.followActivitiesHandler)
app.get('/v1/offchain/activities/:id/follows/count', reqHandlers.followActivitiesCountHandler)

app.get('/v1/offchain/activities/:id/reactions', reqHandlers.reactionActivitiesHandler)
app.get('/v1/offchain/activities/:id/reactions/count', reqHandlers.reactionActivitiesCountHandler)

app.get('/v1/offchain/activities/:id/spaces', reqHandlers.spaceActivitiesHandler)
app.get('/v1/offchain/activities/:id/spaces/count', reqHandlers.spaceActivitiesCountHandler)

app.get('/v1/offchain/activities/:id/counts', reqHandlers.activityCountsHandler)

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
