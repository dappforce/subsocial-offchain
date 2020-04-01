import { Client } from '@elastic/elasticsearch'
import { searchLog as log } from './loggers'

require('dotenv').config();

let greeted = false
if (!greeted) {
  greeted = true;
  log.info(`Connecting to Elasticsearch at ${process.env.ES_NODE_URL}`);
}
export default new Client({ node: process.env.ES_NODE_URL })
