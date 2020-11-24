import { TaggedQuery, } from '@pgtyped/query';
import { pg } from '../connections/postgres';
export const newPgError = (err: Error, fn: Function) =>
  new Error(`${fn.name}: ${err.stack}\n${JSON.stringify(err, null, 4)}`)


// export const client = new Client({
//   host: 'localhost',
//   user: 'dev',
//   password: '1986',
//   database: 'subsocial',
//   port: 5432
// });

interface ITypePair {
  params: any;
  result: any;
}

export const runQuery = async (query: TaggedQuery<ITypePair>, params: any) => {
  const result = await query.run(params, pg)
  return result
}
