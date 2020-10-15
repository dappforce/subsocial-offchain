import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cors from 'cors';
import { ipfsCluster } from '../connections/connect-ipfs';
import { pg } from '../connections/connect-postgres';
import { logSuccess, logError } from '../postgres/postges-logger';
import { newLogger, nonEmptyStr, parseNumStr } from '@subsocial/utils';
import parseSitePreview from '../parser/parse-preview'
import { informClientAboutUnreadNotifications } from './events';
// import { startNotificationsServer } from './ws'
import * as multer from 'multer';
import { getFeedData, getNotificationsData, getNotificationsCount, getFeedCount } from './query';

require('dotenv').config();
const RESULT_LIMIT = parseNumStr(process.env.PGLIMIT) || 20

const log = newLogger('ExpressOffchainApi')
const app = express();
const allowedOrigin = process.env.CORS_ALLOWED_ORIGIN || 'http://localhost';

app.use(cors((req, callback) => {
  const origin = req.method === 'GET' ? '*' : allowedOrigin

  callback(null, { origin })
}));

const MB = 1024 ** 2

const maxFileSizeBytes = parseInt(process.env.IPFS_MAX_FILE_SIZE_BYTES) || 2 * MB
const maxFileSizeMB = maxFileSizeBytes / MB

// for parsing application/json
app.use(bodyParser.json({ limit: maxFileSizeBytes }));

// for parsing application/xwww-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true, limit: maxFileSizeBytes }));

// for parsing multipart/form-data
const upload = multer({ limits: { fieldSize: maxFileSizeBytes }})
app.use(express.static('public'));

// IPFS API

const limitLog = (limit: number) =>
  log.debug(`Limit db results to ${limit} items`);

const getLimitFromRequest = (req: express.Request): number => {
  const reqLimit = req.query.limit
  const limit = nonEmptyStr(reqLimit) ? parseNumStr(reqLimit) : RESULT_LIMIT
  limitLog(limit)
  return limit
}

const getOffsetFromRequest = (req: express.Request): number => {
  const reqOffset = req.query.offset
  const offset = nonEmptyStr(reqOffset) ? parseNumStr(reqOffset) : 0
  limitLog(offset)
  return offset
}

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

// TODO: Support multi-file upload
// app.use(upload.array());

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
    res.statusCode = 400
    res.statusMessage = 'Bad Request'
  }
})

// User feed and notifications API

app.get('/v1/offchain/feed/:id', async (req: express.Request, res: express.Response) => {
  const limit = getLimitFromRequest(req);
  const account = req.params.id;
  limitLog(limit)
  const offset = getOffsetFromRequest(req);

  try {
    const data = await getFeedData({ account, limit, offset })
    res.json(data);
  } catch (err) {
    res
      .status(501)
      .send(err)
  }
});

app.get('/v1/offchain/notifications/:id', async (req: express.Request, res: express.Response) => {
  const limit = getLimitFromRequest(req);
  const offset = getOffsetFromRequest(req);
  const account = req.params.id;
  try {
    const data = await getNotificationsData({ account, limit, offset })
    res.json(data);
  } catch (err) {
    res
      .status(501)
      .send(err)
  }
});

app.get('/v1/offchain/notifications/:id/count', async (req: express.Request, res: express.Response) => {
  const account = req.params.id;
  try {
    const data = await getNotificationsCount(account)
    res.json(data);
  } catch (err) {
    res
      .status(501)
      .send(err)
  }
})

app.get('/v1/offchain/feed/:id/count', async (req: express.Request, res: express.Response) => {
  const account = req.params.id;
  try {
    const data = await getFeedCount(account)
    res.json(data);
  } catch (err) {
    res
      .status(501)
      .send(err)
  }
})

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
    WHERE account = $1`;
  const params = [ account ];
  try {
    const data = await pg.query(query, params)
    informClientAboutUnreadNotifications(account, 0);
    logSuccess('mark all notifications as read', `by account: ${account}`)
    res.json(data.rows);
  } catch (err) {
    logError('mark all notifications as read', `by account: ${account}`, err.stack);
  }
});

// TODO Rename to '/v1/parseSite'
app.post('/offchain/parser/', async (req: express.Request, res: express.Response) => {
  const data = await parseSitePreview(req.body.url)
  res.send(data);
});

// startNotificationsServer()

const port = process.env.OFFCHAIN_SERVER_PORT
app.listen(port, () => {
  log.info(`HTTP server started on port ${port}`)
})
