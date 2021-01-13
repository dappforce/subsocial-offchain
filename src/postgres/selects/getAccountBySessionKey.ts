import { runQuery } from '../utils';
import { log } from '../postges-logger';
import { IQueryParams } from '../types/getSessionKey.querys';

const query = `
  SELECT account FROM df.session_keys
  WHERE session_key = :sessionKey`

export const getAccountFromSessionKey = async (sessionKey: string): Promise<string | undefined> => {
  try {
    const data = await runQuery<IQueryParams>(query, { sessionKey })
    if (data.rowCount) return data.rows[0].account

    return undefined
  } catch (err) {
    log.error(`Failed to get session key by session key: ${sessionKey}`, err.stack)
    throw err
  }
}