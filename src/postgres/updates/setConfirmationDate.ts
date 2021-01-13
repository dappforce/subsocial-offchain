import { runQuery, newPgError, isValidSignature, upsertNonce } from '../utils';
import { getConfirmationData } from '../selects/getConfirmationCode';
import { log } from '../postges-logger';
import { ConfirmEmail, SessionCall } from '../types/sessionKey';
import { updateNonce } from './updateNonce';

const query = `
  UPDATE df.email_settings
  SET confirmed_on = :date
  WHERE account = :account
  RETURNING *`

export async function setConfirmationDate(sessionCall: SessionCall<ConfirmEmail>) {
  const { account, message } = sessionCall

  const { nonce, rootAddress } = await upsertNonce(account, message)

  if (parseInt(nonce.toString()) === message.nonce) {
    const isValid = isValidSignature(sessionCall)
    if (!isValid) {
      log.error("Signature is not valid: function setConfirmationCode")
      return false
    }
    log.debug(`Signature verified`)

    const confirmationCodeFromClient = message.args.confirmationCode

    const params = { account: rootAddress, date: new Date() };
    try {
      const { confirmation_code, expires_on } = await getConfirmationData(rootAddress)
      if (confirmation_code != confirmationCodeFromClient) {
        log.error("Confirmation code is wrong")
        return false
      }

      if (new Date().getTime() >= new Date(expires_on).getTime()) {
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