import { GenericAccountId } from '@polkadot/types';
import { log } from '../postges-logger';
import { runQuery, isValidSignature, menageNonce } from '../utils';
import registry from '@subsocial/types/substrate/registry';
import { AddSessionKeyArgs, SessionCall } from '../types/sessionKey';
import { IQueryParams } from '../types/addSessionKey.queries';
import { getNonce } from '../selects/getNonce';

const query = `
  INSERT INTO df.session_keys
  VALUES(:mainKey, :sessionKey)
  RETURNING *`

export async function addSessionKey(sessionCall: SessionCall<AddSessionKeyArgs>) {
  const { sessionKey } = sessionCall.message.args
  const { account } = sessionCall
  const selectedNonce = await getNonce(account)

  await menageNonce(selectedNonce, sessionCall.message.nonce, account)

  const isValid = isValidSignature(sessionCall)
  if (!isValid) {
    log.error("Signature is not valid: function addSessionKey")
    return
  }

  log.debug(`Signature verified`)

  try {
    const sessionKeyGeneric = new GenericAccountId(registry, sessionKey)
    await runQuery<IQueryParams>(query, { mainKey: account, sessionKey: String(sessionKeyGeneric)})
    log.debug(`Insert in nonces table: ${account}`)
  } catch (err) {
    log.error(`Failed to insert in session key table by account: ${account}`, err.stack)
    throw err
  }
}