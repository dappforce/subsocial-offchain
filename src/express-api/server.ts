import * as express from 'express'
import * as bodyParser from 'body-parser'
import { pool } from './../adaptors/connectPostgre'
import { addJsonToIpfs, getJsonFromIpfs, IpfsData} from './adaptors/ipfs'

const app = express();
app.use(bodyParser.json());

//IPFS API
app.get('/v1/ipfs/get/:hash', async (req: express.Request, res: express.Response) => {
  const data = await getJsonFromIpfs(req.params.hash as string);
  res.json(data);
});

app.post('/v1/ipfs/add', async (req: express.Request, res: express.Response) => {
  const hash = await addJsonToIpfs(req.body as IpfsData);
  res.json(hash);
});

//Subscribe API
app.get('/v1/offchain/feed/:id', async (req: express.Request, res: express.Response) => {
  const query = 'SELECT DISTINCT * FROM df.activities WHERE id IN(SELECT activity_id from df.news_feed WHERE account = $1)';
  const params = [req.params.id];
  console.log(params);
  try {
    const data = await pool.query(query, params)
    console.log(data.rows);
    res.json(data.rows);
    //res.send(JSON.stringify(data));
  } catch (err) {
    console.log(err.stack);
  }
});

app.get('/v1/offchain/notifications/:id', async (req: express.Request, res: express.Response) => {
  const query = 'SELECT DISTINCT * FROM df.activities WHERE id IN(SELECT activity_id from df.notifications WHERE account = $1)';
  const params = [req.params.id];
  try {
    const data = await pool.query(query, params)
    console.log(data.rows);
    res.json(data.rows);
  } catch (err) {
    console.log(err.stack);
  }
});

const port = 3001;
app.listen(port, () => {
  console.log(`server started on port ${port}`)
})