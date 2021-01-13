import { runQuery, newPgError, isValidSignature } from '../utils';
import { getConfirmationData } from '../selects/getConfirmationCode';
import { log } from '../postges-logger';
import { ConfirmEmail, SessionCall } from '../types/sessionKey';
import { insertNonce } from '../inserts/insertNonce';
import { getNonce } from '../selects/getNonce';
import { getFromSessionKey as getAccountFromSessionKey } from '../selects/getAccountBySessionKey';
import { updateNonce } from './updateNonce';

const query = `
  UPDATE df.email_settings
  SET confirmed_on = :date
  WHERE account = :account
  RETURNING *`

export async function setConfirmationDate(sessionCall: SessionCall<ConfirmEmail>) {
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
    const isValid = isValidSignature({ account, signature, message } as SessionCall<ConfirmEmail>)
    if (!isValid) {
      log.error("Signature is not valid: function setConfirmationCode ")
      return false
    }
    log.debug(`Signature verified`)

    const confirmationCodeFromClient = message.args.confirmationCode

    const params = { account: mainKey, date: new Date() };
    try {
      const { confirmation_code, expires_on } = await getConfirmationData(mainKey)
      console.log(confirmation_code, new Date(expires_on.toString()))
      if (confirmation_code != confirmationCodeFromClient) {
        log.error("Confirmation code is wrong")
        return false
      }

      if (new Date().getTime() >= new Date(expires_on).getTime()) {
        console.log(false)
        return false
      }

      const res = await runQuery(query, params)
      await updateNonce(account, message.nonce + 1)
      if (!res.rows[0]) return false
      return true
    } catch (err) {
      throw newPgError(err, setConfirmationDate)
    }
  }
  return false
};