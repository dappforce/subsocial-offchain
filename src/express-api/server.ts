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

require('dotenv').config();
const RESULT_LIMIT = parseNumStr(process.env.PGLIMIT) || 20

const log = newLogger('ExpressOffchainApi')
const app = express();
const allowedOrigin = process.env.CORS_ALLOWED_ORIGIN || 'http://localhost';

app.use(cors({
  origin: allowedOrigin
}));

const fileSizeLimit = process.env.IPFS_MAX_FILE_SIZE_BYTES || "2097152" // 2 MB in bytes as string
const fileSizeLimitBytes = parseInt(fileSizeLimit)
const fileSizeLimitMegabytes = fileSizeLimitBytes / 1024 / 1024
// for parsing application/json
app.use(bodyParser.json({ limit: fileSizeLimit }));

// for parsing application/xwww-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true, limit: fileSizeLimit }));

// for parsing multipart/form-data
const upload = multer({ limits: { fieldSize: fileSizeLimitBytes }})
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

app.post('/v1/ipfs/add', async (req: express.Request, res: express.Response) => {
  const cid = await ipfsCluster.addContent(req.body)
  log.info('Content added to IPFS with CID:', cid)
  res.json(cid)
})

// TODO: add multiple files upload
// app.use(upload.array());
app.post('/v1/ipfs/addFile', upload.single('file'), async (req: express.Request, res: express.Response) => {
  if (req.file.size > fileSizeLimitBytes) {
    res.statusCode = 400
    res.json({ status: 'error', message: `Loaded file should be less than ${fileSizeLimitMegabytes} MB` })
  } else {
    const finalFile = {
        mimetype: req.file.mimetype,
        image:  req.file.buffer.toString('base64')
    };
    const cid = await ipfsCluster.addContent(finalFile as any);
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
  const offset = req.query.offset;
  const query = `
    SELECT DISTINCT * 
    FROM df.activities
    WHERE id IN (
      SELECT activity_id
      FROM df.news_feed
      WHERE account = $1)
    ORDER BY date DESC
    OFFSET $2
    LIMIT $3`;
  const params = [ account, offset, limit ];
  log.debug(`SQL params: ${params}`);

  try {
    const data = await pg.query(query, params)
    logSuccess('get feed', `by account: ${account}`)

    res.json(data.rows);
    // res.send(JSON.stringify(data));
  } catch (err) {
    logError('get feed', `by account: ${account}`, err.stack);

  }
});

app.get('/v1/offchain/notifications/:id', async (req: express.Request, res: express.Response) => {
  const limit = getLimitFromRequest(req);
  const offset = req.query.offset;
  const account = req.params.id;
  const query = `
    SELECT DISTINCT *
    FROM df.activities
    WHERE id IN ( 
      SELECT activity_id
      FROM df.notifications
      WHERE account = $1) 
      AND aggregated = true
    ORDER BY date DESC
    OFFSET $2
    LIMIT $3`;
  const params = [ account, offset, limit ];
  try {
    const data = await pg.query(query, params)
    logSuccess('get notifications', `by account: ${account}`)

    res.json(data.rows);
  } catch (err) {
    logError('get notificatios', `by account: ${account}`, err.stack);

  }
});

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
