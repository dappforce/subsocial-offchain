import { Client } from '@elastic/elasticsearch'
export default new Client({ node: 'http://localhost:9200' })