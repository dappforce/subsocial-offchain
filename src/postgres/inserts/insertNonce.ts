import { runQuery } from '../utils';
import { log } from '../postges-logger'

const query = `
  INSERT INTO df.nonces
  VALUES(:mainKey, :nonce)`

export const insertNonce = async (mainKey: string, nonce: number) => {
  try {
    await runQuery(query, { mainKey, nonce })
    log.debug(`Insert in nonces table: ${mainKey} with nonce ${nonce}`)
    } catch (err) {
    log.error(`Failed to insert nonce by account: ${mainKey}`, err.stack)
    throw err
  }
}