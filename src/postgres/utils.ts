import { pg } from '../connections/postgres';

const named = require('yesql').pg

export const newPgError = (err: Error, fn: Function) =>
  new Error(`${fn.name}: ${err.stack}\n${JSON.stringify(err, null, 4)}`)

export const runQuery = async <T>(query: string, params: T) => {
  const result = await pg.query(named(query)(params))
  return result
}
