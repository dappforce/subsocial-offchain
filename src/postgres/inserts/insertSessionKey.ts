import { GenericAccountId } from '@polkadot/types';
import { log } from '../postges-logger';
import { runQuery, isValidSignature } from '../utils';
import registry from '@subsocial/types/substrate/registry';
import { AddSessionKeyArgs, SessionCall } from '../types/sessionKey';
import { IQueryParams } from '../types/addSessionKey.queries';
import { getNonce } from '../selects/getNonce';
import { insertNonce } from './insertNonce';
import { updateNonce } from '../updates/updateNonce';

const query = `
  INSERT INTO df.session_keys
  VALUES(:mainKey, :sessionKey)
  RETURNING *`

export async function addSessionKey(sessionCall: SessionCall<AddSessionKeyArgs>) {
  const { sessionKey } = sessionCall.message.args
  const { account, message } = sessionCall

  let selectedNonce = await getNonce(account)

  if (!selectedNonce) {
    await insertNonce(account, message.nonce)
    selectedNonce = 0
  }
  if (parseInt(selectedNonce.toString()) === message.nonce) {
    const isValid = isValidSignature(sessionCall)
    if (!isValid) {
      log.error("Signature is not valid: function addSessionKey")
      return
    }

    log.debug(`Signature verified`)

    try {
      console.log(sessionKey)
      const sessionKeyGeneric = new GenericAccountId(registry, sessionKey)
      await runQuery<IQueryParams>(query, { mainKey: account, sessionKey: String(sessionKeyGeneric) })
      log.debug(`Insert in nonces table: ${account} session key ${String(sessionKeyGeneric)}`)
      await updateNonce(account, message.nonce + 1)
    } catch (err) {
      log.error(`Failed to insert in session key table by account: ${account}`, err.stack)
      throw err
    }
  }
}