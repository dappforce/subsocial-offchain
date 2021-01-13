import { runQuery, newPgError, isValidSignature } from '../utils';
import { log } from '../postges-logger';
import { ConfirmLetter, SessionCall } from '../types/sessionKey';
import { insertNonce } from '../inserts/insertNonce';
import { getNonce } from '../selects/getNonce';
import { getFromSessionKey as getAccountFromSessionKey } from '../selects/getAccountBySessionKey';
import { updateNonce } from './updateNonce';

const query = `
  UPDATE df.email_settings
  SET confirmation_code = :confirmationCode, expires_on = :expiresOn
  WHERE account = :account
  RETURNING *`

export async function setConfirmationCode(sessionCall: SessionCall<ConfirmLetter>, confirmationCode: string) {
  const { account, signature, message } = sessionCall

  let mainKey = await getAccountFromSessionKey(account)
  if (!mainKey) {
    log.error(`There is no account that owns this session key: ${account}`)
    mainKey = account
  }
  let selectedNonce = await getNonce(account)

  if (!selectedNonce) {
    await insertNonce(account, message.nonce)
    selectedNonce = 0
  }
  if (parseInt(selectedNonce.toString()) === message.nonce) {
    const isValid = isValidSignature({ account, signature, message } as SessionCall<ConfirmLetter>)
    if (!isValid) {
      log.error("Signature is not valid: function setConfirmationCode ")
      return
    }
    log.debug(`Signature verified`)
    const expiresOn = new Date(new Date().getTime() + (60 * 60 * 1000))
    const params = { account: mainKey, expiresOn, confirmationCode };
    try {
      const res = await runQuery(query, params)
      await updateNonce(account, message.nonce + 1)
      return res.rows[0]

    } catch (err) {
      throw newPgError(err, setConfirmationCode)
    }
  }
}