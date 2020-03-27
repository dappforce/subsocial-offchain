import { pool } from './../adaptors/connectPostgre'
import * as WebSocket from 'ws';
import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cors from 'cors';
import { eventEmitter, getUnreadNotifications, EVENT_UPDATE_NOTIFICATIONS_COUNTER } from '../subscribe-substrate/lib/postgres';

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

// Subscribe API
app.get('/v1/offchain/feed/:id', async (req: express.Request, res: express.Response) => {
  const limit = req.query.limit;
  console.log(limit);
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
  const params = [ req.params.id, offset, limit ];
  console.log(params);
  try {
    const data = await pool.query(query, params)
    console.log(data.rows);
    res.json(data.rows);
    // res.send(JSON.stringify(data));
  } catch (err) {
    console.log(err.stack);
  }
});

app.get('/v1/offchain/notifications/:id', async (req: express.Request, res: express.Response) => {
  const limit = req.query.limit > LIMIT ? LIMIT : req.query.limit;
  const offset = req.query.offset;
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
  const params = [ req.params.id, offset, limit ];
  try {
    const data = await pool.query(query, params)
    console.log(data.rows);
    res.json(data.rows);
  } catch (err) {
    console.log(err.stack);
  }
});

app.post('/v1/offchain/notifications/:id/readAll', async (req: express.Request, res: express.Response) => {
  const account = req.params.id;
  console.log(`Deleting unread_count for ${account}`)
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
    console.log(data.rows);
    res.json(data.rows);
  } catch (err) {
    console.log(err.stack);
  }
});

const wss = new WebSocket.Server({ port: process.env.OFFCHAIN_WS_PORT });

const clients = {}

wss.on('connection', (ws: WebSocket) => {

  ws.on('message', async (account: string) => {
    console.log('Received from client: %s', account);
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
    console.log(`Message sent to ${account}`)
    clients[account].send(`${currentUnreadCount}`)
  })

  ws.on('close', (ws: WebSocket) => {
    console.log(`Disconnected Notifications Counter Web Socket by id: ${ws}`);
  });
});

wss.on('close', () => {
  console.log('Disconnected Notifications Counter Web Socket Server');
});

const port = process.env.OFFCHAIN_SERVER_PORT
app.listen(port, () => {
  console.log(`server started on port ${port}`)
})
