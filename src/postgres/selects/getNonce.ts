import { runQuery } from '../utils';
import { log } from '../postges-logger';

const query = `
  SELECT nonce FROM df.nonces
  WHERE account = :mainKey`

export const getNonce = async (mainKey: string)  => {
  try {
    const data = await runQuery(query, { mainKey })
      return data.rows[0]?.nonce
    } catch (err) {
    log.error(`Failed to get nonce by account: ${mainKey}`, err.stack)
    throw err
  }
}