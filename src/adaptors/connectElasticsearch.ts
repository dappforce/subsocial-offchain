import { Client } from '@elastic/elasticsearch'

require("dotenv").config();

console.log(`Connecting to Elasticsearch at ${process.env.ES_NODE_URL}`);
export default new Client({ node: process.env.ES_NODE_URL })
