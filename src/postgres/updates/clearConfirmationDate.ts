import { runQuery, newPgError, isValidSignature, upsertNonce } from '../utils';
import { log } from '../postges-logger';
import { ConfirmLetter, SessionCall, ClearConfirmDateArgs } from '../types/sessionKey';
import { updateNonce } from './updateNonce';

const query = `
  UPDATE df.email_settings
  SET confirmed_on = NULL
  WHERE account = :account
  RETURNING *`

export async function clearConfirmationDate(sessionCall: SessionCall<ClearConfirmDateArgs>) {
  const { account, signature, message } = sessionCall

  const { nonce, rootAddress } = await upsertNonce(account, message)

  if (parseInt(nonce.toString()) === message.nonce) {
    const isValid = isValidSignature({ account, signature, message } as SessionCall<ConfirmLetter>)
    if (!isValid) {
      log.error("Signature is not valid: function setConfirmationCode ")
      return
    }
    log.debug(`Signature verified`)

    try {
      const params = { account: rootAddress };
      const res = await runQuery(query, params)
      await updateNonce(account, message.nonce + 1)
      return res.rows[0]

    } catch (err) {
      throw newPgError(err, clearConfirmationDate)
    }
  }
}