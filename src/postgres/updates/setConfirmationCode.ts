import { runQuery, newPgError, isValidSignature, upsertNonce } from '../utils';
import { log } from '../postges-logger';
import { ConfirmLetter, SessionCall } from '../types/sessionKey';
import { updateNonce } from './updateNonce';
import { getExpiresOnDate } from '../../express-api/email/utils';
import { formatEmail } from '@subsocial/utils/email';

const query = `
  UPDATE df.email_settings
  SET confirmation_code = :confirmationCode, expires_on = :expiresOn
  WHERE account = :account AND formatted_email = :formattedEmail
  RETURNING *`

export async function setConfirmationCode(sessionCall: SessionCall<ConfirmLetter>, confirmationCode: string) {
  const { account, signature, message } = sessionCall

  const { nonce, rootAddress } = await upsertNonce(account, message)

  if (parseInt(nonce.toString()) === message.nonce) {
    const isValid = isValidSignature({ account, signature, message } as SessionCall<ConfirmLetter>)
    if (!isValid) {
      log.error("Signature is not valid: function setConfirmationCode ")
      return
    }
    log.debug(`Signature verified`)
    const expiresOn = getExpiresOnDate()

    const formattedEmail = formatEmail(message.args.email)

    const params = { account: rootAddress, expiresOn, confirmationCode, formattedEmail };
    try {
      const res = await runQuery(query, params)
      await updateNonce(account, message.nonce + 1)
      return res.rows[0]

    } catch (err) {
      throw newPgError(err, setConfirmationCode)
    }
  }
}