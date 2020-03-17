import { pool } from './../adaptors/connectPostgre'
import { getJsonFromIpfs, addJsonToIpfs, removeFromIpfs } from './adaptors/ipfs'
import * as WebSocket from 'ws';
import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cors from 'cors';

require('dotenv').config();
const LIMIT = process.env.PGLIMIT;
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

// IPFS API
app.get('/v1/ipfs/get/:hash', async (req: express.Request, res: express.Response) => {
  const data = await getJsonFromIpfs(req.params.hash as string);
  res.json(data);
});

app.post('/v1/ipfs/remove/:hash', (req: express.Request) => {
  removeFromIpfs(req.params.hash as string);
});

app.post('/v1/ipfs/add', async (req: express.Request, res: express.Response) => {
  const data = req.body;
  console.log(data);
  const hash = await addJsonToIpfs(req.body);
  res.json(hash);
});

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

// Create and hold Web Socket connection
// Push unread counter updates per current account
// const notifCounterObservers = Rx.Observable.create()
// new WS (() =>
/// update counter of this account
// )

const wss = new WebSocket.Server({ port: 3010 });

let clients = []

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log('Received from client: %s', message);
  });
  // setInterval(() => ws.send('something from server'), 10000);
});

//
const port = 3001;
app.listen(port, () => {
  console.log(`server started on port ${port}`)
})
