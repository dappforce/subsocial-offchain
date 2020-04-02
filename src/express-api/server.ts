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
const app = express.default();

app.use(cors.default());

// for parsing application/json
app.use(bodyParser.json());

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true }));
// form-urlencoded

// // for parsing multipart/form-data
// app.use(upload.array());
// app.use(express.static('public'));
const limitLog = (limit: number) => log.debug(`Limit a db results to ${limit} items`);

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
  log.debug(`SQL params: ${params}`);

  try {
    const data = await pool.query(query, params)
    logSuccess('get feed', `by account: ${account}`)

    res.json(data.rows);
    // res.send(JSON.stringify(data));
  } catch (err) {
    logError('get feed', `by account: ${account}`, err.stack);

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
    const data = await pool.query(query, params)
    eventEmitter.emit(EVENT_UPDATE_NOTIFICATIONS_COUNTER, account, 0);
    logSuccess('mark all notifications as read', `by account: ${account}`)

    res.json(data.rows);
  } catch (err) {
    logError('mark all notifications as read', `by account: ${account}`, err.stack);

  }
});

const wsPort = parseInt(process.env.OFFCHAIN_WS_PORT || '3011')
const wss = new WebSocket.Server({ port: wsPort });

const clients: any = {}

wss.on('connection', (ws: WebSocket) => {

  ws.on('message', async (account: string) => {
    log.debug('Notifications web socket: Received a message from account:', account);

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
    log.debug(`Notifications web socket: Message sent to account: ${account}`)

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
  log.info(`HTTP server started on port ${port}`)

})
