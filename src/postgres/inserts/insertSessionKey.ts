import { GenericAccountId } from '@polkadot/types';
import { log } from '../postges-logger';
import { runQuery, isValidSignature } from '../utils';
import registry from '@subsocial/types/substrate/registry';
import { stringToU8a } from '@polkadot/util';
import { SessionKeyMessage, SessionCall } from '../types/sessionKey';
import { IQueryParams } from '../types/addSessionKey.queries';

const query = `
  INSERT INTO df.session_keys
  VALUES(:mainKey, :sessionKey, :protocol)
  RETURNING *`

export async function addSessionKey(sessionCall: SessionCall<SessionKeyMessage>) {
  const { mainKey, sessionKey, protocol } = sessionCall.message.args

  const isValid = isValidSignature(sessionCall)
  if (!isValid) {
    log.error("Signature is not valid: function addSessionKey")
    return
  }

  log.info(`Message confirmed successfully`)

  try {
    const sessionKeyGeneric = new GenericAccountId(registry, stringToU8a(sessionKey))
    await runQuery<IQueryParams>(query, { mainKey, sessionKey: sessionKeyGeneric.toString(), protocol})
    log.debug(`Insert in session key table: ${mainKey}`)
  } catch (err) {
    log.error(`Failed to insert in session key table by account: ${mainKey}`, err.stack)
    throw err
  }
}