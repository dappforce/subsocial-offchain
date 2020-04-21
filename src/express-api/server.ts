import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cors from 'cors';
import ipfs from '../connections/connect-ipfs';
import { pg } from '../connections/connect-postgres';
import { logSuccess, logError } from '../postgres/postges-logger';
import { newLogger } from '@subsocial/utils';
import { parseSiteWithRequest as siteParser } from '../parser/parse-site'
import { informClientAboutUnreadNotifications } from './events';
// import { startNotificationsServer } from './ws';

// import * as multer from 'multer';
// const upload = multer();

require('dotenv').config();
const LIMIT = process.env.PGLIMIT || '20';

const log = newLogger('ExpressOffchainApi')
const app = express();

app.use(cors());

const fileSizeLimit = process.env.IPFS_MAX_FILE_SIZE

// for parsing application/json
app.use(bodyParser.json({ limit: fileSizeLimit }));

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true, limit: fileSizeLimit }));
//form-urlencoded

// // for parsing multipart/form-data

// app.use(upload.array());
// app.use(express.static('public'));

// IPFS API

const limitLog = (limit: string) => log.debug(`Limit db results to ${limit} items`);

app.post('/v1/ipfs/add', async (req: express.Request, res: express.Response) => {
  const hash = await ipfs.saveContent(req.body);
  log.info('Content saved to IPFS with hash:', hash);

  res.json(hash);
});

// User feed and notifications API

app.get('/v1/offchain/feed/:id', async (req: express.Request, res: express.Response) => {
  const limit = req.query.limit.toString();
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
  const limit = req.query.limit > LIMIT ? LIMIT : req.query.limit.toString();
  limitLog(limit)
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
  const data = await siteParser(req.body.url)

  res.send(data);
});

// startNotificationsServer()

const port = process.env.OFFCHAIN_SERVER_PORT
app.listen(port, () => {
  log.info(`HTTP server started on port ${port}`)
})
