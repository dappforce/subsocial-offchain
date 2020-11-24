import { Client } from 'pg';
import { TaggedQuery, } from '@pgtyped/query';
export const newPgError = (err: Error, fn: Function) =>
  new Error(`${fn.name}: ${err.stack}\n${JSON.stringify(err, null, 4)}`)


const client = new Client({
  host: 'localhost',
  user: 'dev',
  password: '1986',
  database: 'subsocial',
  port: 5432
});

interface ITypePair {
  params: any;
  result: any;
}

export const runQuery = async (query: TaggedQuery<ITypePair>, params: any) => {
  await client.connect()
  await query.run(params, client)
  await client.end()
}
