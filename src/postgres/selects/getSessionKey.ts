import { runQuery } from '../utils';
import { log } from '../postges-logger';
import { IQueryParams } from '../types/getSessionKey.querys';

const query = `
  SELECT session_key FROM df.session_keys
  WHERE session_key = :sessionKey`

export const getSessionKey = async (sessionKey: string): Promise<boolean> => {
  try {
    const data = await runQuery<IQueryParams>(query, { sessionKey })
    if (data.rowCount) return true

    return false
  } catch (err) {
    log.error(`This session key is not exist: ${sessionKey}`, err.stack)
    throw err
  }
}