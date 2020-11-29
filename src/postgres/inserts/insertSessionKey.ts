import { GenericAccountId } from '@polkadot/types';
import { log } from '../postges-logger';
import { runQuery, isValidSignature } from '../utils';
import registry from '@subsocial/types/substrate/registry';
import { stringToU8a } from '@polkadot/util';

type SessionKeyMessage = {
  mainKey: string,
  sessionKey: string
}

const queryForSessionKey = `
  INSERT INTO df.session_keys
  VALUES(:mainKey, :sessionKey)
  RETURNING *`

export async function addSessionKey(message: SessionKeyMessage, signature: string) {
  const {mainKey, sessionKey} = message

  const isValid = isValidSignature(
    message,
    signature,
    message.mainKey
  )
  if (!isValid) return
  log.info(`Message confirmed successfully`)

  try {
    const sessionKeyGeneric = new GenericAccountId(registry, stringToU8a(sessionKey))
    console.log(sessionKeyGeneric.toString())
    await runQuery(queryForSessionKey, { mainKey, sessionKey: sessionKeyGeneric.toString()})
    log.debug(`Insert in session key table: ${message.mainKey}`)
  } catch (err) {
    log.error(`Failed to insert in session key table by account: ${message.mainKey}`, err.stack)
    throw err
  }
}