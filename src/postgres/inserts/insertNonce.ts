import { runQuery } from '../utils';
import { log } from '../postges-logger'

const query = `
  INSERT INTO df.nonces
  VALUES(:mainKey, :nonce)`

export const insertNonce = async (mainKey: string, nonce: number) => {
  try {
    const data = await runQuery(query, { mainKey, nonce })
      if (data.rowCount) return true

      return false
    } catch (err) {
    log.error(`Failed to insert nonce by account: ${mainKey}`, err.stack)
    throw err
  }
}