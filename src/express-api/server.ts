import { pool } from '../adaptors/connect-postgre'
import * as WebSocket from 'ws';
import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cors from 'cors';
import { eventEmitter, EVENT_UPDATE_NOTIFICATIONS_COUNTER, getUnreadNotifications } from '../postgres/notifications';
import { logSuccess, logError, log } from '../postgres/postges-logger';

require('dotenv').config();
const LIMIT = process.env.PGLIMIT || '20';
// import * as multer from 'multer';
// const upload = multer();
const app = express();

app.use(cors());

// for parsing application/json
app.use(bodyParser.json());

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true }));
// form-urlencoded

// // for parsing multipart/form-data
// app.use(upload.array());
// app.use(express.static('public'));
const limitLog = (limit: number) => log.debug(`Limit for result from db: ${limit} posts`);
// Subscribe API
app.get('/v1/offchain/feed/:id', async (req: express.Request, res: express.Response) => {
  const limit = req.query.limit;
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
  log.debug(`Params for query to db: ${params}`);
  try {
    const data = await pool.query(query, params)
    logSuccess('get feeds from db', `by account: ${account}`)
    res.json(data.rows);
    // res.send(JSON.stringify(data));
  } catch (err) {
    logError('Error get feeds from db:', `by account: ${account}`, err.stack);
  }
});

app.get('/v1/offchain/notifications/:id', async (req: express.Request, res: express.Response) => {
  const limit = req.query.limit > LIMIT ? LIMIT : req.query.limit;
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
    const data = await pool.query(query, params)
    logSuccess('get notifications from db', `by account: ${account}`)
    res.json(data.rows);
  } catch (err) {
    logError('Error get notificatios from db:', `by account: ${account}`, err.stack);
  }
});

app.post('/v1/offchain/notifications/:id/readAll', async (req: express.Request, res: express.Response) => {
  const account = req.params.id;
  log.info(`Deleting unread_count for ${account}`)
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
    const data = await pool.query(query, params)
    eventEmitter.emit(EVENT_UPDATE_NOTIFICATIONS_COUNTER, account, 0);
    logSuccess('read all notifications from db', `by account: ${account}`)
    res.json(data.rows);
  } catch (err) {
    logError('Error read all notifications from db:', `by account: ${account}`, err.stack);
  }
});

const wss = new WebSocket.Server({ port: process.env.OFFCHAIN_WS_PORT });

const clients = {}

wss.on('connection', (ws: WebSocket) => {

  ws.on('message', async (account: string) => {
    log.info('Received from client: %s', account);
    const currentUnreadCount = await getUnreadNotifications(account)

    clients[account] = ws;
    clients[account].send(`${currentUnreadCount}`)
  });

  eventEmitter.on(EVENT_UPDATE_NOTIFICATIONS_COUNTER, (account: string, currentUnreadCount: number) => {
    if (!clients[account]) return
    if (clients[account].readyState !== WebSocket.OPEN) {
      delete clients[account]
      return
    }
    log.info(`Message sent to ${account}`)
    clients[account].send(`${currentUnreadCount}`)
  })

  ws.on('close', (ws: WebSocket) => {
    log.info(`Disconnected Notifications Counter Web Socket by id: ${ws}`);
  });
});

wss.on('close', () => {
  log.info('Disconnected Notifications Counter Web Socket Server');
});

const port = process.env.OFFCHAIN_SERVER_PORT
app.listen(port, () => {
  log.info(`server started on port ${port}`)
})
