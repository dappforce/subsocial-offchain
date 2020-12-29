import { runQuery } from '../utils';
import { log } from '../postges-logger'

const query = `
  UPDATE df.nonces
  SET nonce = :nonce
  WHERE account = :mainKey`

export const updateNonce = async (mainKey: string, nonce: number) => {
  try {
    await runQuery(query, { mainKey, nonce })
    log.debug(`Update in session key table: ${mainKey} with nonce ${nonce}`)
  } catch (err) {
    log.error(`Failed to update nonce by account: ${mainKey}`, err.stack)
    throw err
  }
}